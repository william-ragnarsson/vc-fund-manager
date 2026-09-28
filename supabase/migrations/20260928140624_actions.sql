-- Actions that change several tables at once, built once for the app and the
-- automation to call alike. They run with the caller's rights (security
-- invoker), so row level security applies to them just as it does to plain
-- writes. One-row edits, like moving a deal to Screened, go straight to the
-- tables.


-- Invest: the application closes as invested, the company joins the portfolio
-- and its timeline gets the fund's own entry. Returns that signal, so the
-- announcement post can point at it.
create function public.invest(
  p_application uuid,
  p_on date default current_date,
  p_amount_usd numeric default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.applications;
  v_signal uuid;
begin
  select * into a from public.applications where id = p_application for update;
  if not found then
    raise exception 'Application % not found', p_application using errcode = 'P0002';
  end if;
  if a.status not in ('inbound', 'screened', 'meeting') then
    raise exception 'Application % is already %', p_application, a.status;
  end if;

  update public.applications set status = 'invested', decided_at = now() where id = a.id;

  insert into public.investments (fund_id, company_id, application_id, round, invested_on, amount_usd)
  values (a.fund_id, a.company_id, a.id, coalesce(a.round_stage, 'Undisclosed'), p_on, p_amount_usd);

  update public.companies set stage = coalesce(a.round_stage, stage) where id = a.company_id;

  insert into public.signals (fund_id, company_id, occurred_on, source, text, note)
  values (a.fund_id, a.company_id, p_on, 'fund', 'Investment closed', 'Now tracked automatically')
  returning id into v_signal;

  return v_signal;
end;
$$;


-- Pass: the application closes as passed, any open meeting is called off and
-- a note to the founders is queued from the thesis's decline note. Returns
-- the message, or null when the thesis has no note.
create function public.pass_application(p_application uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.applications;
  v_note text;
  v_company text;
  v_fund text;
  v_message uuid;
begin
  select * into a from public.applications where id = p_application for update;
  if not found then
    raise exception 'Application % not found', p_application using errcode = 'P0002';
  end if;
  if a.status not in ('inbound', 'screened', 'meeting') then
    raise exception 'Application % is already %', p_application, a.status;
  end if;

  update public.applications set status = 'passed', decided_at = now() where id = a.id;
  update public.meetings set status = 'cancelled'
    where fund_id = a.fund_id and application_id = a.id and status in ('invited', 'scheduled');

  select decline_note into v_note from public.rubrics
    where fund_id = a.fund_id order by version desc limit 1;
  if v_note is null then
    return null;
  end if;

  select name into v_company from public.companies where id = a.company_id;
  select name into v_fund from public.funds where id = a.fund_id;

  insert into public.messages (fund_id, company_id, application_id, kind, subject, body)
  values (
    a.fund_id, a.company_id, a.id, 'decline',
    'Your application to ' || v_fund,
    replace(replace(replace(v_note,
      '{company}', v_company),
      '{fund''s}', v_fund || case when v_fund like '%s' then '''' else '''s' end),
      '{fund}', v_fund)
  )
  returning id into v_message;

  return v_message;
end;
$$;


-- Invite to a meeting: the application moves to Meetings with an invite out
-- and no time yet, until the founders pick a slot. Calling it again returns
-- the open meeting. Returns the meeting.
create function public.invite_to_meeting(p_application uuid, p_format text default 'video')
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.applications;
  v_meeting uuid;
begin
  select * into a from public.applications where id = p_application for update;
  if not found then
    raise exception 'Application % not found', p_application using errcode = 'P0002';
  end if;
  if a.status not in ('inbound', 'screened', 'meeting') then
    raise exception 'Application % is already %', p_application, a.status;
  end if;

  update public.applications set status = 'meeting' where id = a.id;

  select id into v_meeting from public.meetings
    where fund_id = a.fund_id and application_id = a.id and status in ('invited', 'scheduled')
    order by created_at desc
    limit 1;
  if v_meeting is null then
    insert into public.meetings (fund_id, company_id, application_id, format)
    values (a.fund_id, a.company_id, a.id, p_format)
    returning id into v_meeting;
  end if;

  return v_meeting;
end;
$$;


revoke all on function public.invest(uuid, date, numeric) from public, anon, authenticated;
revoke all on function public.pass_application(uuid) from public, anon, authenticated;
revoke all on function public.invite_to_meeting(uuid, text) from public, anon, authenticated;
grant execute on function public.invest(uuid, date, numeric) to anon, authenticated, service_role;
grant execute on function public.pass_application(uuid) to anon, authenticated, service_role;
grant execute on function public.invite_to_meeting(uuid, text) to anon, authenticated, service_role;
