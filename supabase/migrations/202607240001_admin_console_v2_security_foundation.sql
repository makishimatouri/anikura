-- Admin Console 2.0 A0/A2 foundation. Additive only; no production execution in this milestone.

create table if not exists public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete restrict,
  active boolean not null default true,
  business_scope jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_membership_roles (
  user_id uuid not null references public.admin_memberships(user_id) on delete cascade,
  role text not null check (role in ('information_entry', 'review_publisher', 'operations_admin', 'system_owner')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.event_revisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete restrict,
  revision_number integer not null check (revision_number > 0),
  payload jsonb not null,
  state text not null default 'draft' check (state in ('draft', 'in_review', 'published', 'rejected', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (event_id, revision_number)
);

create table if not exists public.event_review_actions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  revision_id uuid references public.event_revisions(id) on delete restrict,
  action text not null check (action in ('submit', 'review_publish', 'reject')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_assets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete restrict,
  revision_id uuid references public.event_revisions(id) on delete restrict,
  storage_path text not null,
  kind text not null check (kind in ('header', 'poster', 'attachment')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.submission_contacts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete restrict,
  revision_id uuid references public.event_revisions(id) on delete restrict,
  contact_type text not null check (contact_type in ('email', 'qq', 'other')),
  contact_value text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.events add column if not exists published_revision_id uuid;
alter table public.events add column if not exists archived_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_published_revision_id_fkey'
  ) then
    alter table public.events
      add constraint events_published_revision_id_fkey
      foreign key (published_revision_id) references public.event_revisions(id) on delete set null;
  end if;
end $$;

alter table public.admin_memberships enable row level security;
alter table public.admin_membership_roles enable row level security;
alter table public.event_revisions enable row level security;
alter table public.event_review_actions enable row level security;
alter table public.event_assets enable row level security;
alter table public.submission_contacts enable row level security;
alter table public.admin_audit_logs enable row level security;

create or replace function public.admin_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_memberships m
    join public.admin_membership_roles r on r.user_id = m.user_id
    where m.user_id = auth.uid() and m.active and r.role = any(required_roles)
  ) or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and ((p.is_super_admin and 'system_owner' = any(required_roles))
        or (p.is_admin and 'information_entry' = any(required_roles)))
  );
$$;

revoke all on function public.admin_has_role(text[]) from public;
grant execute on function public.admin_has_role(text[]) to authenticated, service_role;

create policy admin_memberships_self_read on public.admin_memberships
  for select to authenticated using (user_id = auth.uid());
create policy admin_roles_self_read on public.admin_membership_roles
  for select to authenticated using (user_id = auth.uid());
create policy admin_event_revisions_read on public.event_revisions
  for select to authenticated using (public.admin_has_role(array['information_entry','review_publisher','operations_admin','system_owner']));
create policy admin_review_actions_read on public.event_review_actions
  for select to authenticated using (public.admin_has_role(array['information_entry','review_publisher','operations_admin','system_owner']));
create policy admin_event_assets_read on public.event_assets
  for select to authenticated using (public.admin_has_role(array['information_entry','review_publisher','operations_admin','system_owner']));
create policy admin_audit_logs_read on public.admin_audit_logs
  for select to authenticated using (public.admin_has_role(array['operations_admin','system_owner']));

revoke insert, update, delete on public.admin_memberships, public.admin_membership_roles,
  public.event_revisions, public.event_review_actions, public.event_assets,
  public.submission_contacts, public.admin_audit_logs from anon, authenticated;
