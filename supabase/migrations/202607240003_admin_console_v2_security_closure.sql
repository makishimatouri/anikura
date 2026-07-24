-- Apply only after the controlled gray workflow passes acceptance.
-- This migration disables legacy browser writes and is intentionally separate from the additive foundation.

drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
revoke insert, update, delete on public.profiles from anon, authenticated;

drop policy if exists "auth_insert ON events" on public.events;
drop policy if exists "auth_update" on public.events;
drop policy if exists "auth_delete" on public.events;
revoke insert, update, delete on public.events from anon, authenticated;

drop policy if exists "notif_insert" on public.notifications;
revoke insert, delete, update on public.notifications from anon, authenticated;
grant update (is_read) on public.notifications to authenticated;
drop policy if exists "notif_update" on public.notifications;
create policy notif_update_own_read_state on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
