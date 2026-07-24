import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const entry = process.env.PGLITE_ENTRY;
if (!entry) throw new Error("PGLITE_ENTRY is required");
const { PGlite } = await import(entry);
const db = new PGlite();

await db.exec(`
  create role anon;
  create role authenticated;
  create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid());
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create table public.profiles (
    id uuid primary key references auth.users(id),
    email text,
    total_points integer default 0,
    checkin_streak integer default 0,
    last_checkin_date date,
    created_at timestamptz default now(),
    is_admin boolean default false,
    is_super_admin boolean default false
  );
  create table public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    date date not null,
    start_time time,
    end_time time,
    city text not null,
    venue text not null,
    address text,
    tags text[] default '{}',
    header_image_url text,
    poster_url text,
    description text,
    ticket_price text,
    ticket_link text,
    organizer text,
    status text default 'ongoing',
    qq_group text,
    qq_groups text[],
    has_lottery boolean default false,
    lottery_points_cost integer default 30,
    review_status text,
    review_note text,
    created_by uuid references auth.users(id),
    source text default 'manual',
    is_featured boolean default false,
    is_anirox boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    type text not null,
    title text not null,
    message text,
    reference_id uuid,
    is_read boolean default false,
    created_at timestamptz default now()
  );
  alter table public.profiles enable row level security;
  alter table public.events enable row level security;
  alter table public.notifications enable row level security;
  create policy profiles_insert on public.profiles for insert to authenticated with check (auth.uid() = id);
  create policy profiles_update on public.profiles for update to authenticated using (auth.uid() = id);
  create policy "auth_insert ON events" on public.events for insert to authenticated with check (true);
  create policy auth_update on public.events for update to authenticated using (true);
  create policy auth_delete on public.events for delete to authenticated using (true);
  create policy notif_insert on public.notifications for insert to authenticated with check (true);
  create policy notif_update on public.notifications for update to authenticated using (user_id = auth.uid());
  grant all on public.profiles, public.events, public.notifications to anon, authenticated;
`);

const migration = await readFile(
  new URL("../supabase/migrations/202607240001_admin_console_v2_security_foundation.sql", import.meta.url),
  "utf8"
);
const commandsMigration = await readFile(
  new URL("../supabase/migrations/202607240002_admin_console_v2_commands.sql", import.meta.url),
  "utf8"
);

await db.exec("begin");
await db.exec(migration);
await db.exec(commandsMigration);

const tables = await db.query(`
  select table_name from information_schema.tables
  where table_schema = 'public'
    and table_name in ('admin_memberships', 'admin_membership_roles', 'event_revisions',
      'event_review_actions', 'event_assets', 'submission_contacts', 'admin_audit_logs')
`);
assert.equal(tables.rows.length, 7);

const protectedPolicies = await db.query(`
  select policyname from pg_policies
  where schemaname = 'public'
    and policyname in ('profiles_insert', 'profiles_update', 'auth_insert ON events',
      'auth_update', 'auth_delete', 'notif_insert')
`);
assert.equal(protectedPolicies.rows.length, 0);

const protectedWriteGrants = await db.query(`
  select table_name, privilege_type from information_schema.role_table_grants
  where table_schema = 'public' and grantee = 'authenticated'
    and (
      (table_name in ('profiles', 'events') and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))
      or (table_name = 'notifications' and privilege_type in ('INSERT', 'DELETE'))
    )
`);
assert.equal(protectedWriteGrants.rows.length, 0);

const allowedNotificationColumns = await db.query(`
  select column_name from information_schema.column_privileges
  where table_schema = 'public' and table_name = 'notifications'
    and grantee = 'authenticated' and privilege_type = 'UPDATE'
`);
assert.deepEqual(allowedNotificationColumns.rows, [{ column_name: "is_read" }]);

const adminFlagGrants = await db.query(`
  select column_name from information_schema.column_privileges
  where table_schema = 'public' and table_name = 'profiles'
    and grantee = 'authenticated' and privilege_type = 'UPDATE'
    and column_name in ('is_admin', 'is_super_admin')
`);
assert.equal(adminFlagGrants.rows.length, 0);

const commands = await db.query(`
  select routine_name from information_schema.routines
  where routine_schema = 'public'
    and routine_name in ('admin_create_event_draft', 'admin_review_publish_event')
`);
assert.equal(commands.rows.length, 2);

const ordinaryId = "00000000-0000-0000-0000-000000000001";
const editorId = "00000000-0000-0000-0000-000000000002";
const reviewerId = "00000000-0000-0000-0000-000000000003";
await db.query(`insert into auth.users (id) values ($1), ($2), ($3)`, [ordinaryId, editorId, reviewerId]);
await db.query(`insert into public.profiles (id) values ($1), ($2), ($3)`, [ordinaryId, editorId, reviewerId]);
await db.query(`insert into public.admin_memberships (user_id) values ($1), ($2)`, [editorId, reviewerId]);
await db.query(`insert into public.admin_membership_roles (user_id, role) values ($1, 'information_entry'), ($2, 'review_publisher')`, [editorId, reviewerId]);

await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ordinaryId]);
await db.exec("savepoint ordinary_denied");
await assert.rejects(
  db.query(`select public.admin_create_event_draft($1::jsonb)`, [{ title: "伪造活动", date: "2026-08-01", city: "上海", venue: "测试场地" }]),
  /forbidden/
);
await db.exec("rollback to savepoint ordinary_denied");

await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [editorId]);
const created = await db.query(`select public.admin_create_event_draft($1::jsonb) as id`, [{
  title: "受控活动", date: "2026-08-02", city: "上海", venue: "测试场地",
  created_by: ordinaryId, review_status: "approved", is_featured: true,
}]);
const eventId = created.rows[0].id;
const securedEvent = await db.query(`select created_by, review_status, is_featured from public.events where id = $1`, [eventId]);
assert.deepEqual(securedEvent.rows, [{ created_by: editorId, review_status: "pending", is_featured: false }]);
const securedRevision = await db.query(`select created_by, state, payload ? 'created_by' as has_creator, payload ? 'review_status' as has_review from public.event_revisions where event_id = $1`, [eventId]);
assert.deepEqual(securedRevision.rows, [{ created_by: editorId, state: "draft", has_creator: false, has_review: false }]);

await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [reviewerId]);
await db.query(`select public.admin_review_publish_event($1::uuid, null)`, [eventId]);
const published = await db.query(`select review_status, published_revision_id is not null as has_revision from public.events where id = $1`, [eventId]);
assert.deepEqual(published.rows, [{ review_status: "approved", has_revision: true }]);
const notification = await db.query(`select user_id from public.notifications where reference_id = $1`, [eventId]);
assert.deepEqual(notification.rows, [{ user_id: editorId }]);

await db.exec("rollback");
console.log("Admin migration dry-run passed in isolated PGlite transaction (rolled back).");
