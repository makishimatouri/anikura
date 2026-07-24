-- Controlled commands. Actor identity always comes from auth.uid(); protected fields are fixed here.

create or replace function public.admin_create_event_draft(event_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  new_event_id uuid;
begin
  if actor is null or not public.admin_has_role(array['information_entry','operations_admin','system_owner']) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if nullif(trim(event_payload->>'title'), '') is null
    or nullif(trim(event_payload->>'date'), '') is null
    or nullif(trim(event_payload->>'city'), '') is null
    or nullif(trim(event_payload->>'venue'), '') is null then
    raise exception 'missing required event fields' using errcode = '22023';
  end if;

  insert into public.events (
    title, date, start_time, end_time, city, venue, address, tags,
    header_image_url, poster_url, description, ticket_price, ticket_link, organizer,
    status, qq_group, qq_groups, has_lottery, lottery_points_cost,
    review_status, created_by, source, is_featured, is_anirox, created_at, updated_at
  ) values (
    trim(event_payload->>'title'), (event_payload->>'date')::date,
    nullif(event_payload->>'start_time', '')::time, nullif(event_payload->>'end_time', '')::time,
    trim(event_payload->>'city'), trim(event_payload->>'venue'), nullif(trim(event_payload->>'address'), ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(event_payload->'tags', '[]'::jsonb))), '{}'::text[]),
    nullif(trim(event_payload->>'header_image_url'), ''), nullif(trim(event_payload->>'poster_url'), ''),
    nullif(event_payload->>'description', ''), nullif(event_payload->>'ticket_price', ''),
    nullif(event_payload->>'ticket_link', ''), nullif(event_payload->>'organizer', ''),
    coalesce(nullif(event_payload->>'status', ''), 'ongoing'), nullif(event_payload->>'qq_group', ''),
    case when jsonb_typeof(event_payload->'qq_groups') = 'array'
      then array(select jsonb_array_elements_text(event_payload->'qq_groups')) else null end,
    coalesce((event_payload->>'has_lottery')::boolean, false),
    coalesce((event_payload->>'lottery_points_cost')::integer, 30),
    'pending', actor, 'manual', false, false, now(), now()
  ) returning id into new_event_id;

  insert into public.event_revisions (
    event_id, revision_number, payload, state, created_by
  ) values (
    new_event_id,
    1,
    event_payload - array[
      'id', 'created_by', 'reviewed_by', 'review_status', 'published_at',
      'published_revision_id', 'is_featured', 'is_anirox', 'created_at', 'updated_at'
    ],
    'draft',
    actor
  );

  insert into public.admin_audit_logs (actor_id, action, target_type, target_id)
  values (actor, 'event.create_draft', 'event', new_event_id::text);
  return new_event_id;
end;
$$;

create or replace function public.admin_review_publish_event(
  target_event_id uuid,
  review_note_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  event_creator uuid;
  event_title text;
  latest_revision_id uuid;
begin
  if actor is null or not public.admin_has_role(array['review_publisher','system_owner']) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select created_by, title into event_creator, event_title
  from public.events where id = target_event_id for update;
  if not found then raise exception 'event not found' using errcode = 'P0002'; end if;

  select id into latest_revision_id
  from public.event_revisions
  where event_id = target_event_id
  order by revision_number desc
  limit 1;

  update public.events
    set review_status = 'approved', review_note = review_note_input,
      published_revision_id = latest_revision_id, updated_at = now()
    where id = target_event_id;
  if latest_revision_id is not null then
    update public.event_revisions set state = 'published' where id = latest_revision_id;
  end if;
  insert into public.event_review_actions (event_id, revision_id, action, actor_id, note)
    values (target_event_id, latest_revision_id, 'review_publish', actor, review_note_input);
  insert into public.admin_audit_logs (actor_id, action, target_type, target_id)
    values (actor, 'event.review_publish', 'event', target_event_id::text);

  if event_creator is not null and event_creator <> actor then
    insert into public.notifications (user_id, type, title, message, reference_id)
    values (event_creator, 'event_approved', '活动审核通过',
      format('你的活动「%s」已通过审核并上线', event_title), target_event_id);
  end if;
  return target_event_id;
end;
$$;

revoke all on function public.admin_create_event_draft(jsonb) from public;
revoke all on function public.admin_review_publish_event(uuid, text) from public;
grant execute on function public.admin_create_event_draft(jsonb) to authenticated;
grant execute on function public.admin_review_publish_event(uuid, text) to authenticated;
