-- Associate's data model. Every row belongs to a fund, so accounts can attach
-- later through fund_members without reshaping anything.
--
-- One companies row follows a startup through all three parts of Associate:
-- it applies (applications, screenings, meetings), joins the portfolio
-- (investments, signals), and its news becomes posts.
--
-- Conventions
-- * Enums are text with check constraints, so they're easy to extend.
-- * origin says who wrote a row: seed, ai, partner or founder. Automation
--   never edits or deletes partner rows, and removals are soft (dismissed_at,
--   discarded, passed), so a rerun can't bring back what a partner removed.
-- * Child rows reference (fund_id, id), so a row can never point at a
--   company, application or signal of another fund.

create extension if not exists moddatetime schema extensions;

-- Security definer helpers live here, outside the schemas the API exposes.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;


-- Funds and the people in them ------------------------------------------------

create table public.funds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  vehicle text,
  website text,
  size_usd numeric(14,2) check (size_usd > 0),
  focus text,
  tagline text,
  linkedin_followers integer check (linkedin_followers >= 0),
  timezone text not null default 'UTC',
  stats jsonb not null default '{}' check (jsonb_typeof(stats) = 'object'),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.funds is 'One row per fund. The demo fund (is_demo) is open to everyone; other funds only to their members.';
comment on column public.funds.stats is 'Counters shown in the app until they can be counted from rows, such as month_screened and month_passed.';

create table public.fund_members (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'partner' check (role in ('owner', 'partner', 'viewer')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, user_id)
);
create index fund_members_user_id_idx on public.fund_members (user_id);
comment on table public.fund_members is 'Who belongs to which fund. Empty until login arrives.';


-- Companies: every startup the fund knows, applicant or portfolio -------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  one_liner text,
  about text,
  sector text,
  city text,
  country text,
  website text,
  logo_url text,
  stage text,
  locked_fields text[] not null default '{}',
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, slug),
  unique (fund_id, id)
);
comment on column public.companies.locked_fields is 'Fields a partner changed by hand. Enrichment leaves them alone.';


-- The thesis: one row per saved version ---------------------------------------

create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  version integer not null check (version > 0),
  criteria jsonb not null check (jsonb_typeof(criteria) = 'array'),
  focus jsonb not null default '{}' check (jsonb_typeof(focus) = 'object'),
  cheque_min_usd numeric(14,2) check (cheque_min_usd >= 0),
  cheque_max_usd numeric(14,2),
  threshold integer not null default 60 check (threshold between 0 and 100),
  decline_note text,
  created_at timestamptz not null default now(),
  check (cheque_max_usd >= cheque_min_usd),
  unique (fund_id, version),
  unique (fund_id, id)
);
comment on table public.rubrics is 'The investment thesis. Saving inserts the next version, so old scores stay explainable.';
comment on column public.rubrics.criteria is '[{ key, label, description, weight }], weights summing to 100. Screenings key their scores by criterion key.';
comment on column public.rubrics.focus is '{ sectors, stages, geos }, each an ordered list of { name, on }.';
comment on column public.rubrics.decline_note is 'Template for pass notes. {company}, {fund} and {fund''s} are filled in when it is sent.';


-- Deal flow -------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid not null,
  status text not null default 'inbound' check (status in ('inbound', 'screened', 'meeting', 'invested', 'passed')),
  round_stage text,
  round_usd numeric(14,2) check (round_usd > 0),
  traction text,
  team text,
  source text not null default 'website' check (source in ('website', 'intro', 'outbound', 'event', 'other')),
  referrer text,
  received_at timestamptz not null default now(),
  answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
  video_url text,
  deck_url text,
  contact_name text,
  contact_email text,
  decided_at timestamptz,
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, id),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade
);
create index applications_company_idx on public.applications (fund_id, company_id);
-- A company has at most one application in progress.
create unique index applications_one_open_idx on public.applications (company_id)
  where status in ('inbound', 'screened', 'meeting');
comment on column public.applications.answers is 'The application form''s answers, as the form defines them.';

create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  application_id uuid not null,
  rubric_id uuid,
  score integer not null check (score between 0 and 100),
  scores jsonb not null default '{}' check (jsonb_typeof(scores) = 'object'),
  why text[] not null default '{}',
  risks text[] not null default '{}',
  model text,
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  foreign key (fund_id, application_id) references public.applications (fund_id, id) on delete cascade,
  foreign key (fund_id, rubric_id) references public.rubrics (fund_id, id) on delete set null (rubric_id)
);
create index screenings_application_idx on public.screenings (fund_id, application_id, created_at desc);
create index screenings_rubric_idx on public.screenings (fund_id, rubric_id);
comment on table public.screenings is 'A score and its reasoning. Re-scoring adds rows; the current one is the newest partner row, else the newest.';
comment on column public.screenings.scores is 'Score per rubric criterion, keyed by criterion key.';

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid not null,
  application_id uuid,
  starts_at timestamptz,
  format text not null default 'video' check (format in ('video', 'office', 'phone')),
  status text not null default 'invited' check (status in ('invited', 'scheduled', 'done', 'cancelled')),
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or starts_at is not null),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade,
  foreign key (fund_id, application_id) references public.applications (fund_id, id) on delete set null (application_id)
);
create index meetings_company_idx on public.meetings (fund_id, company_id);
create index meetings_application_idx on public.meetings (fund_id, application_id);
comment on column public.meetings.starts_at is 'Empty while the founders pick a slot.';


-- Portfolio -------------------------------------------------------------------

create table public.investments (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid not null,
  application_id uuid,
  round text not null,
  invested_on date not null,
  amount_usd numeric(14,2) check (amount_usd > 0),
  status text not null default 'new' check (status in ('new', 'active', 'growing', 'quiet')),
  exit_outcome text check (exit_outcome in ('acquired', 'shut_down')),
  exited_on date,
  exit_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, company_id),
  check ((exit_outcome is null) = (exited_on is null)),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade,
  foreign key (fund_id, application_id) references public.applications (fund_id, id) on delete set null (application_id)
);
create index investments_application_idx on public.investments (fund_id, application_id);
comment on table public.investments is 'The fund''s stake in a company. A company with an exit is a former portfolio company.';

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid not null,
  occurred_on date not null,
  detected_at timestamptz not null default now(),
  source text not null check (source in ('press', 'linkedin', 'website', 'event', 'product', 'monitor', 'fund')),
  text text not null,
  headline text,
  note text,
  url text,
  external_key text,
  dismissed_at timestamptz,
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, id),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade
);
create index signals_company_idx on public.signals (fund_id, company_id, occurred_on desc);
-- The monitoring engine dedupes on this, dismissed signals included.
create unique index signals_external_key_idx on public.signals (company_id, external_key)
  where external_key is not null;
comment on table public.signals is 'Each company''s timeline: news found by monitoring, or logged by a partner.';
comment on column public.signals.headline is 'Shorter wording for the portfolio card, when it differs from text.';


-- Public presence and outbound email ------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid,
  signal_id uuid,
  type text not null check (type in ('raise', 'invest', 'milestone', 'event', 'batch', 'other')),
  status text not null default 'draft' check (status in ('draft', 'published', 'discarded')),
  body text not null,
  tags text[] not null default '{}',
  image jsonb check (jsonb_typeof(image) = 'object'),
  site_entry jsonb check (jsonb_typeof(site_entry) = 'object'),
  site_note text,
  channels text[] not null default '{}' check (channels <@ array['linkedin', 'website']::text[]),
  published_at timestamptz,
  published_by text check (published_by in ('auto', 'partner')),
  stats jsonb not null default '{}' check (jsonb_typeof(stats) = 'object'),
  edited_at timestamptz,
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade,
  foreign key (fund_id, signal_id) references public.signals (fund_id, id) on delete set null (signal_id)
);
create index posts_company_idx on public.posts (fund_id, company_id);
create index posts_signal_idx on public.posts (fund_id, signal_id);
create index posts_status_idx on public.posts (fund_id, status, published_at desc);
comment on column public.posts.image is '{ kicker, title, sub, bg } for the generated post image.';
comment on column public.posts.site_entry is '{ kicker, title, body } for the fund website''s Recent list.';
comment on column public.posts.edited_at is 'Set when a partner edits the text, so automation leaves it alone.';

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds(id) on delete cascade,
  company_id uuid,
  application_id uuid,
  kind text not null check (kind in ('decline', 'invite', 'check_in', 'other')),
  status text not null default 'queued' check (status in ('draft', 'queued', 'sent', 'failed')),
  subject text,
  body text not null,
  sent_at timestamptz,
  origin text not null default 'partner' check (origin in ('seed', 'ai', 'partner', 'founder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (fund_id, company_id) references public.companies (fund_id, id) on delete cascade,
  foreign key (fund_id, application_id) references public.applications (fund_id, id) on delete set null (application_id)
);
create index messages_company_idx on public.messages (fund_id, company_id);
create index messages_application_idx on public.messages (fund_id, application_id);
comment on table public.messages is 'Email to founders: pass notes and check-ins. Queued until Gmail sends them.';

create table public.automation_rules (
  fund_id uuid not null references public.funds(id) on delete cascade,
  key text not null check (key in ('invest', 'raise', 'milestone', 'event', 'site')),
  mode text not null check (mode in ('approval', 'auto', 'off')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fund_id, key)
);
comment on table public.automation_rules is 'What Associate may publish on its own, per kind of update.';


-- updated_at ------------------------------------------------------------------

create trigger set_updated_at before update on public.funds for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.fund_members for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.companies for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.applications for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.meetings for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.investments for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.signals for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.posts for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.messages for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.automation_rules for each row execute function extensions.moddatetime(updated_at);


-- Access ----------------------------------------------------------------------
-- The demo fund is open to everyone. Other funds are open to their members,
-- which needs login; until then nobody outside the database sees them.

create function private.my_fund_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.funds where is_demo
  union
  select fund_id from public.fund_members where user_id = (select auth.uid())
$$;
revoke all on function private.my_fund_ids() from public, anon, authenticated;
grant execute on function private.my_fund_ids() to anon, authenticated;

alter table public.funds enable row level security;
alter table public.fund_members enable row level security;
alter table public.companies enable row level security;
alter table public.rubrics enable row level security;
alter table public.applications enable row level security;
alter table public.screenings enable row level security;
alter table public.meetings enable row level security;
alter table public.investments enable row level security;
alter table public.signals enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.automation_rules enable row level security;

create policy "Readable by members and demo visitors" on public.funds
  for select to anon, authenticated
  using (id in (select private.my_fund_ids()));

create policy "Users see their own memberships" on public.fund_members
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Open to the fund's members and demo visitors" on public.companies
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.rubrics
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.applications
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.screenings
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.meetings
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.investments
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.signals
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.posts
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.messages
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));
create policy "Open to the fund's members and demo visitors" on public.automation_rules
  for all to anon, authenticated
  using (fund_id in (select private.my_fund_ids()))
  with check (fund_id in (select private.my_fund_ids()));

-- Grants are explicit rather than left to the project's defaults.
revoke all on public.funds, public.fund_members, public.companies, public.rubrics,
  public.applications, public.screenings, public.meetings, public.investments,
  public.signals, public.posts, public.messages, public.automation_rules
  from anon, authenticated;
grant select on public.funds to anon, authenticated;
grant select on public.fund_members to authenticated;
grant select, insert, update, delete on public.companies, public.rubrics,
  public.applications, public.screenings, public.meetings, public.investments,
  public.signals, public.posts, public.messages, public.automation_rules
  to anon, authenticated;
grant all on public.funds, public.fund_members, public.companies, public.rubrics,
  public.applications, public.screenings, public.meetings, public.investments,
  public.signals, public.posts, public.messages, public.automation_rules
  to service_role;
