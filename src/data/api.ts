import { cardWhen, monthYear, postedAgo, quietWeeks, shortDate } from '../app/activity';
import { DEMO_FUND_SLUG, FUND, NOW, TODAY } from '../config';
import { supabase } from '../lib/supabase';
import type { Json, Tables } from './database.types';
import type {
  AutoKey, AutoMode, Company, CompanyStatus, Criterion, Deal, DealStage, Draft, FormerCompany, Fund, PostType, Published, Rubric, Signal, SignalSrc,
} from './types';

// Reads the demo fund from Supabase into the view models in types.ts, and writes
// the partner's actions back. Row level security decides which funds a visitor
// can see; the fund_id filters keep each query to the one fund on screen.

// Stored text says {fund} and {fund's} where it names the fund, so ?fund= shows the
// visitor's fund name, and text written back gets the placeholders again.
const swap = (t: string, from: string, to: string) => t.split(from).join(to);
const fill = (t: string) => swap(swap(t, "{fund's}", FUND.possessive), '{fund}', FUND.name);
const unfill = (t: string) => swap(swap(t, FUND.possessive, "{fund's}"), FUND.name, '{fund}');
/** Email goes out under the fund's own name, whatever ?fund= shows on screen. */
const named = (t: string, name: string) => swap(swap(unfill(t), "{fund's}", name.endsWith('s') ? `${name}'` : `${name}'s`), '{fund}', name);

/** "$40M", "$1.5M", "$750k". */
export function money(n: number) {
  if (n >= 1e6) return `$${Number((n / 1e6).toFixed(2))}M`;
  if (n >= 1e3) return `$${Number((n / 1e3).toFixed(2))}k`;
  return `$${n}`;
}

/** An id for a row the page shows before its write lands. randomUUID needs a secure context, which a LAN address isn't. */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const EMPTY_FUND: Fund = { id: '', name: '', size: '', focus: '', tagline: '', followers: '', timezone: 'UTC', monthScreened: 0, monthPassed: 0 };
export const EMPTY_RUBRIC: Rubric = {
  id: '', version: 0, criteria: [], sectors: {}, stages: {}, geos: {}, chequeMin: null, chequeMax: null, threshold: 60, declineNote: '',
};

const SRC: Record<string, SignalSrc> = { press: 'Press', linkedin: 'LinkedIn', website: 'Website', event: 'Event', product: 'Product', monitor: 'Monitor', fund: 'Fund' };
const STATUS: Record<string, CompanyStatus> = { new: 'New', active: 'Active', growing: 'Growing', quiet: 'Quiet' };
const SOURCE: Record<string, string> = { website: 'Applied via website', intro: 'Intro', outbound: 'Outbound', event: 'Met at an event', other: 'Added by the fund' };
const FORMAT: Record<string, string> = { video: 'Video call', office: 'Founders visiting', phone: 'Phone call' };
const TYPE: Record<string, string> = { raise: 'Portfolio raise', invest: 'New investment', milestone: 'Milestone', event: 'Event', batch: 'New batch', other: 'Post' };
const DETECTED: Record<string, string> = {
  press: 'Detected from press release', fund: 'Investment closed', linkedin: 'Detected on LinkedIn', website: 'Detected on their website',
  event: 'Detected from an event listing', product: 'Detected from their changelog', monitor: 'Flagged by monitoring',
};
const OPEN: DealStage[] = ['inbound', 'screened', 'meeting'];
const AUTO_KEYS: AutoKey[] = ['invest', 'raise', 'milestone', 'event', 'site'];

type JsonObject = { [key: string]: Json | undefined };
const obj = (j: Json | null | undefined): JsonObject | null => (j && typeof j === 'object' && !Array.isArray(j) ? j : null);
const str = (j: Json | undefined) => (typeof j === 'string' ? j : '');
const num = (j: Json | undefined) => (typeof j === 'number' ? j : 0);
const time = (iso: string) => Date.parse(iso);
const newestFirst = <T extends { created_at: string }>(rows: T[]) => [...rows].sort((a, b) => time(b.created_at) - time(a.created_at));

type Result<T> = { data: T | null; error: { message: string } | null };

/** The data of a Supabase call, or its error thrown. Await the call before passing it in when the data is used: inline, this
 * parameter's type steers how the query infers its row type. */
function must<T>(res: Result<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** For updates that select what they touched. Touching nothing means the row changed or went away since the page loaded it. */
function changed(res: Result<unknown[]>) {
  if (!must(res)?.length) throw new Error('The row changed since the page loaded it.');
}

export interface FundData {
  fund: Fund;
  rubric: Rubric;
  companies: Company[];
  former: FormerCompany[];
  deals: Deal[];
  drafts: Draft[];
  published: Published[];
  /** Slugs of the companies whose founders got a check-in. */
  checkIns: string[];
  auto: Record<AutoKey, AutoMode>;
}

/** Everything the app shows for the demo fund. */
export async function loadFund(): Promise<FundData> {
  const found = await supabase.from('funds').select('*').eq('slug', DEMO_FUND_SLUG).single();
  const f = must(found);
  const [cos, invs, sigs, apps, posts, checkIns, rules, rubrics] = await Promise.all([
    supabase.from('companies').select('*').eq('fund_id', f.id),
    supabase.from('investments').select('*').eq('fund_id', f.id).order('created_at', { ascending: false }),
    supabase.from('signals').select('*').eq('fund_id', f.id).is('dismissed_at', null)
      .order('occurred_on', { ascending: false }).order('detected_at', { ascending: false }),
    supabase.from('applications').select('*, screenings(*), meetings(*)').eq('fund_id', f.id).in('status', OPEN)
      .order('received_at', { ascending: false }),
    supabase.from('posts').select('*').eq('fund_id', f.id).in('status', ['draft', 'published']),
    supabase.from('messages').select('company_id').eq('fund_id', f.id).eq('kind', 'check_in'),
    supabase.from('automation_rules').select('key, mode').eq('fund_id', f.id),
    supabase.from('rubrics').select('*').eq('fund_id', f.id).order('version', { ascending: false }).limit(1),
  ]);

  const fund = toFund(f);
  const byId = new Map(must(cos).map(co => [co.id, co]));
  const signals = must(sigs);
  const timeline = new Map<string, Tables<'signals'>[]>();
  for (const sg of signals) {
    const list = timeline.get(sg.company_id);
    if (list) list.push(sg);
    else timeline.set(sg.company_id, [sg]);
  }

  const companies: Company[] = [];
  const former: FormerCompany[] = [];
  for (const inv of must(invs)) {
    const co = byId.get(inv.company_id);
    if (!co) continue;
    if (inv.exit_outcome) {
      former.push({
        id: co.slug, name: co.name, one: co.one_liner ?? '', stage: co.stage ?? inv.round, inv: `${inv.round} · ${inv.invested_on.slice(0, 4)}`,
        outcome: inv.exit_outcome === 'acquired' ? 'Acquired' : 'Shut down', on: inv.exited_on ?? '', note: inv.exit_note ?? '',
      });
    } else companies.push(toCompany(co, inv, timeline.get(co.id) ?? []));
  }

  const deals: Deal[] = [];
  for (const a of must(apps)) {
    const co = byId.get(a.company_id);
    if (!co) continue;
    const sc = currentScreening(a.screenings);
    const meeting = newestFirst(a.meetings).find(m => m.status === 'invited' || m.status === 'scheduled');
    deals.push({
      id: co.slug, rowId: a.id, companyRowId: co.id, name: co.name, one: co.one_liner ?? '', sector: co.sector ?? '',
      score: sc?.score ?? 0, scores: sc ? scoresOf(sc.scores) : {}, why: sc?.why ?? [], risks: sc?.risks ?? [],
      stage: a.status as DealStage,
      round: [a.round_stage ?? 'Undisclosed', a.round_usd ? money(a.round_usd) : null].filter(Boolean).join(' · '),
      traction: a.traction ?? '', team: a.team ?? '', loc: co.city ?? '',
      src: `${a.referrer ? `Intro from ${a.referrer}` : SOURCE[a.source] ?? 'Added by the fund'} · ${postedAgo(a.received_at).toLowerCase()}`,
      website: co.website ?? '',
      meeting: meeting && meetingTime(meeting, fund.timezone),
    });
  }

  const postRows = must(posts);
  const signalById = new Map(signals.map(sg => [sg.id, sg]));
  const drafts = newestFirst(postRows.filter(p => p.status === 'draft'))
    .map(p => toDraft(p, p.company_id ? byId.get(p.company_id) : undefined, p.signal_id ? signalById.get(p.signal_id) : undefined));
  const published = postRows.filter(p => p.status === 'published')
    .sort((a, b) => time(b.published_at ?? b.created_at) - time(a.published_at ?? a.created_at))
    .map(p => toPublished(p, p.company_id ? byId.get(p.company_id) : undefined));

  const modes = new Map(must(rules).map(r => [r.key, r.mode as AutoMode]));
  return {
    fund, rubric: toRubric(must(rubrics)[0] as Tables<'rubrics'> | undefined), companies, former, deals, drafts, published,
    checkIns: [...new Set(must(checkIns).flatMap(m => {
      const co = m.company_id ? byId.get(m.company_id) : undefined;
      return co ? [co.slug] : [];
    }))],
    auto: Object.fromEntries(AUTO_KEYS.map(k => [k, modes.get(k) ?? 'approval'])) as Record<AutoKey, AutoMode>,
  };
}

function toFund(f: Tables<'funds'>): Fund {
  const stats = obj(f.stats);
  return {
    id: f.id, name: f.name,
    size: [f.size_usd ? money(f.size_usd) : null, f.vehicle].filter(Boolean).join(' '),
    focus: f.focus ?? '', tagline: f.tagline ?? '',
    followers: f.linkedin_followers === null ? '' : `${f.linkedin_followers.toLocaleString('en-US')} followers`,
    timezone: f.timezone, monthScreened: num(stats?.month_screened), monthPassed: num(stats?.month_passed),
  };
}

function toRubric(r: Tables<'rubrics'> | undefined): Rubric {
  if (!r) return EMPTY_RUBRIC;
  const focus = obj(r.focus);
  const flags = (j: Json | undefined) => Object.fromEntries((Array.isArray(j) ? j : []).flatMap((x): [string, boolean][] => {
    const o = obj(x);
    return o && typeof o.name === 'string' ? [[o.name, o.on === true]] : [];
  }));
  return {
    id: r.id, version: r.version,
    criteria: (Array.isArray(r.criteria) ? r.criteria : []).flatMap((x): Criterion[] => {
      const o = obj(x);
      return o && typeof o.key === 'string' ? [{ key: o.key, label: str(o.label) || o.key, description: str(o.description), weight: num(o.weight) }] : [];
    }),
    sectors: flags(focus?.sectors), stages: flags(focus?.stages), geos: flags(focus?.geos),
    chequeMin: r.cheque_min_usd, chequeMax: r.cheque_max_usd, threshold: r.threshold, declineNote: fill(r.decline_note ?? ''),
  };
}

function toCompany(co: Tables<'companies'>, inv: Tables<'investments'>, rows: Tables<'signals'>[]): Company {
  const top = rows[0];
  const c: Company = {
    id: co.slug, rowId: co.id, name: co.name, one: co.one_liner ?? '', about: co.about ?? '', sector: co.sector ?? '',
    city: co.city ?? '', country: co.country ?? '', website: co.website ?? '', stage: co.stage ?? inv.round,
    inv: `${inv.round} · ${inv.status === 'new' ? monthYear(inv.invested_on) : inv.invested_on.slice(0, 4)}`,
    signal: top ? fill(top.headline ?? top.text) : '', src: (top && SRC[top.source]) ?? 'Fund', when: '', status: STATUS[inv.status] ?? 'Active',
    signals: rows.map((sg): Signal => ({ on: sg.occurred_on, src: SRC[sg.source] ?? 'Fund', text: fill(sg.text), note: fill(sg.note ?? '') })),
  };
  if (top) {
    // A monitor note on top means nothing public has happened for weeks, so the card says how many.
    const quiet = quietWeeks(c);
    c.when = top.source === 'monitor' && Number.isFinite(quiet) ? `${quiet} weeks` : cardWhen(top.occurred_on, top.detected_at);
  }
  return c;
}

/** A partner's own score wins over the AI's, and a newer one over an older one. */
function currentScreening(list: Tables<'screenings'>[]) {
  const newest = newestFirst(list);
  return newest.find(sc => sc.origin === 'partner') ?? newest[0];
}

const scoresOf = (j: Json) => Object.fromEntries(Object.entries(obj(j) ?? {}).filter((e): e is [string, number] => typeof e[1] === 'number'));

function meetingTime(m: Tables<'meetings'>, timeZone: string): Deal['meeting'] {
  if (!m.starts_at) return { day: 'TBC', date: '·', time: 'Invite sent · founders picking a slot' };
  const p: Record<string, string> = {};
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(m.starts_at));
  for (const { type, value } of parts) p[type] = value;
  return { day: p.weekday, date: p.day, time: `${p.weekday} ${p.day} ${p.month} · ${p.hour}:${p.minute} · ${FORMAT[m.format] ?? 'Meeting'}` };
}

const channelsLabel = (channels: string[]) => channels.map(ch => (ch === 'linkedin' ? 'LinkedIn' : 'Website')).join(' + ');

function siteOf(p: Tables<'posts'>) {
  const site = obj(p.site_entry);
  return site ? { kicker: fill(str(site.kicker)), title: fill(str(site.title)), body: fill(str(site.body)) } : undefined;
}

function toDraft(p: Tables<'posts'>, co: Tables<'companies'> | undefined, sg: Tables<'signals'> | undefined): Draft {
  const img = obj(p.image);
  const when = sg ? cardWhen(sg.occurred_on, sg.detected_at) : '';
  return {
    id: p.id, type: p.type as PostType, typeLabel: TYPE[p.type] ?? 'Post', companyId: co?.slug ?? '', company: co?.name ?? FUND.name,
    detected: sg
      ? `${DETECTED[sg.source] ?? 'Detected'} · ${when === 'Just now' || when === 'Yesterday' ? when.toLowerCase() : when}`
      : p.origin === 'partner' ? 'Written by you' : 'Drafted by Associate',
    text: fill(p.body), tags: p.tags.map(t => `#${t}`).join(' '), channels: channelsLabel(p.channels),
    site: siteOf(p), siteNote: p.site_note ?? '',
    image: img ? { kicker: fill(str(img.kicker)), title: fill(str(img.title)), sub: fill(str(img.sub)) } : undefined,
    imgBg: typeof img?.bg === 'string' ? img.bg : '#2c3f5c',
  };
}

function toPublished(p: Tables<'posts'>, co: Tables<'companies'> | undefined): Published {
  const stats = obj(p.stats);
  return {
    id: p.id, typeLabel: TYPE[p.type] ?? 'Post', companyId: co?.slug ?? '', company: co?.name ?? FUND.name,
    date: p.published_at && time(p.published_at) < time(NOW) ? shortDate(p.published_at.slice(0, 10)) : 'Just now',
    channels: channelsLabel(p.channels), auto: p.published_by === 'auto', text: fill(p.body), site: siteOf(p),
    stats: typeof stats?.reactions === 'number' ? `${stats.reactions} reactions · ${num(stats.comments)} comments` : undefined,
  };
}

// Actions. Several-table actions are Postgres functions, so the AI can run them too.

/** Puts the demo fund back to its seed, for every visitor. */
export async function resetDemo() {
  must(await supabase.rpc('reset_demo'));
}

export async function moveApplication(id: string, status: DealStage) {
  changed(await supabase.from('applications').update({ status }).eq('id', id).in('status', OPEN).select('id'));
}

export async function inviteToMeeting(id: string) {
  must(await supabase.rpc('invite_to_meeting', { p_application: id }));
}

/** Passes and queues the decline note. */
export async function passApplication(id: string) {
  must(await supabase.rpc('pass_application', { p_application: id }));
}

/** Adds the company to the portfolio. Returns the "Investment closed" signal, for the announcement to point at. */
export async function invest(id: string) {
  const res = await supabase.rpc('invest', { p_application: id, p_on: TODAY });
  return must(res);
}

export async function createPost(fundId: string, d: Draft, companyRowId: string | null, signalId: string | null, published: boolean) {
  must(await supabase.from('posts').insert({
    id: d.id, fund_id: fundId, company_id: companyRowId, signal_id: signalId, type: d.type, origin: 'ai',
    status: published ? 'published' : 'draft', body: unfill(d.text), tags: d.tags.split(/\s+/).filter(Boolean).map(t => t.replace(/^#/, '')),
    image: d.image ? { kicker: unfill(d.image.kicker), title: unfill(d.image.title), sub: unfill(d.image.sub), bg: d.imgBg } : null,
    site_entry: d.site ? { kicker: unfill(d.site.kicker), title: unfill(d.site.title), body: unfill(d.site.body) } : null,
    site_note: d.siteNote || null, channels: d.channels.split(' + ').map(ch => ch.toLowerCase()),
    ...(published ? { published_at: new Date().toISOString(), published_by: 'auto' } : {}),
  }));
}

/** Publishes a draft, with the partner's edits when there are any. */
export async function publishPost(id: string, body: string | null) {
  const now = new Date().toISOString();
  changed(await supabase.from('posts')
    .update({ status: 'published', published_at: now, published_by: 'partner', ...(body === null ? {} : { body: unfill(body), edited_at: now }) })
    .eq('id', id).eq('status', 'draft').select('id'));
}

export async function discardPost(id: string) {
  changed(await supabase.from('posts').update({ status: 'discarded' }).eq('id', id).eq('status', 'draft').select('id'));
}

export async function editPost(id: string, body: string) {
  changed(await supabase.from('posts').update({ body: unfill(body), edited_at: new Date().toISOString() }).eq('id', id).eq('status', 'draft').select('id'));
}

/** Queues a short note to each company's founders, written from their last public update. */
export async function sendCheckIns(fund: Fund, list: { rowId: string; name: string; last?: Signal }[]) {
  must(await supabase.from('messages').insert(list.map(c => ({
    fund_id: fund.id, company_id: c.rowId, kind: 'check_in', origin: 'ai', subject: `Checking in from ${fund.name}`,
    body: named(`Hi ${c.name} team,\n\n${c.last
      ? `We last saw “${c.last.text}” from ${shortDate(c.last.on)}. How have things been since?`
      : 'How have things been lately?'} If there's anything we can help with, just reply.\n\nThe ${FUND.name} team`, fund.name),
  }))));
}

export async function setAutomation(fundId: string, key: AutoKey, mode: AutoMode) {
  must(await supabase.from('automation_rules').upsert({ fund_id: fundId, key, mode }, { onConflict: 'fund_id,key' }));
}

/** Saves the thesis as a new version. Earlier scores keep pointing at the version they were scored against. */
export async function saveRubric(fundId: string, r: Rubric) {
  const flags = (m: Record<string, boolean>) => Object.entries(m).map(([name, on]) => ({ name, on }));
  must(await supabase.from('rubrics').insert({
    id: r.id, fund_id: fundId, version: r.version,
    criteria: r.criteria.map(({ key, label, description, weight }) => ({ key, label, description, weight })),
    focus: { sectors: flags(r.sectors), stages: flags(r.stages), geos: flags(r.geos) },
    cheque_min_usd: r.chequeMin, cheque_max_usd: r.chequeMax, threshold: r.threshold, decline_note: unfill(r.declineNote),
  }));
}
