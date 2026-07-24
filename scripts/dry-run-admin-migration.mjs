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
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
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

const eventWriteGrants = await db.query(`
  select privilege_type from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'events'
    and grantee = 'authenticated' and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
`);
assert.equal(eventWriteGrants.rows.length, 0);

const commands = await db.query(`
  select routine_name from information_schema.routines
  where routine_schema = 'public'
    and routine_name in ('admin_create_event_draft', 'admin_review_publish_event')
`);
assert.equal(commands.rows.length, 2);

await db.exec("rollback");
console.log("Admin migration dry-run passed in isolated PGlite transaction (rolled back).");
