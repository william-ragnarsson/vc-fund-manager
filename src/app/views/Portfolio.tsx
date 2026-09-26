import type { ReactNode } from 'react';
import { FUND, TODAY } from '../../config';
import type { Company, CompanyStatus, FormerCompany, Signal } from '../../data/types';
import { ago, batchOf, isQuiet, lastActive, monthYear, QUIET_WEEKS, quietWeeks, shortDate } from '../activity';
import { Logo } from '../Logo';
import { useStore, type State } from '../store';

const STATUS_STYLE: Record<CompanyStatus, [string, string]> = {
  Growing: ['var(--color-accent-100)', 'var(--color-accent-800)'],
  New: ['var(--color-accent-100)', 'var(--color-accent-800)'],
  Active: ['var(--color-neutral-100)', 'var(--color-neutral-800)'],
  Quiet: ['#fbf1e4', '#7a4a12'],
};

/** An active company that has gone a month without public news shows as Quiet. */
function Status({ c }: { c: Company }) {
  const status = c.status === 'Active' && isQuiet(c) ? 'Quiet' : c.status;
  const [bg, color] = STATUS_STYLE[status];
  return <span className="pill" style={{ background: bg, color }}>{status}</span>;
}

const SOURCES = [
  { label: 'Website and changelog', when: '12 min ago' },
  { label: 'LinkedIn, company and founders', when: '1h ago' },
  { label: 'Press and funding news', when: '20 min ago' },
  { label: 'Event listings', when: '3h ago' },
  { label: 'Product Hunt and GitHub', when: '2h ago' },
];

// The list answers three separate questions: which companies (the tabs), in what order (Group and Sort), and drawn how (cards or table).
const GROUPS: [State['pGroup'], string][] = [['none', 'None'], ['batch', 'Batch'], ['stage', 'Stage']];
const SORTS: [State['pSort'], string][] = [['latest', 'Latest signal'], ['quiet', 'Quietest first'], ['name', 'Name']];
const LAYOUTS: [State['pLayout'], string, ReactNode][] = [
  ['cards', 'Cards', (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1.2" /><rect x="9" y="2" width="5" height="5" rx="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" /><rect x="9" y="9" width="5" height="5" rx="1.2" />
    </svg>
  )],
  ['table', 'Table', (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
    </svg>
  )],
];
const STAGES = ['Series B', 'Series A', 'Seed', 'Pre-seed'];
const stageRank = (stage: string) => { const i = STAGES.indexOf(stage); return i < 0 ? STAGES.length : i; };

/** One card or table row. Current and former companies both show as one. */
interface Item { id: string; name: string; one: string; stage: string; inv: string; last: string; signal: string; meta: string; status: ReactNode; open?: () => void }

const fromFormer = (f: FormerCompany): Item => ({
  id: f.id, name: f.name, one: f.one, stage: f.stage, inv: f.inv, last: f.on, signal: f.note, meta: monthYear(f.on),
  status: <span className={f.outcome === 'Acquired' ? 'pill pill-accent' : 'pill pill-neutral'}>{f.outcome}</span>,
});

const SORT_BY: Record<State['pSort'], (x: Item, y: Item) => number> = {
  latest: (x, y) => y.last.localeCompare(x.last),
  quiet: (x, y) => x.last.localeCompare(y.last),
  name: (x, y) => x.name.localeCompare(y.name, 'en', { sensitivity: 'base' }),
};

/** Sections for the chosen grouping, each in the chosen order. Batches run newest first, stages from the latest round down. */
function arrange(items: Item[], group: State['pGroup'], sort: State['pSort']) {
  const sorted = [...items].sort(SORT_BY[sort]);
  if (group === 'none') return [{ key: 'all', title: '', items: sorted }];
  const keyOf = (it: Item) => (group === 'batch' ? batchOf(it.inv) : it.stage);
  const keys = [...new Set(sorted.map(keyOf))].sort(group === 'batch' ? (x, y) => y.localeCompare(x) : (x, y) => stageRank(x) - stageRank(y));
  return keys.map(k => ({ key: k, title: group === 'batch' ? `${k} batch` : k, items: sorted.filter(it => keyOf(it) === k) }));
}

/** A labelled dropdown, "Sort  Latest signal". The native select sits invisibly on top, so it opens the system menu. */
function Pick<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <label className="pf-pick">
      <span className="k" aria-hidden="true">{label}</span>
      <span className="v" aria-hidden="true">{options.find(([k]) => k === value)?.[1]}</span>
      <select aria-label={label} value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(([k, text]) => <option key={k} value={k}>{text}</option>)}
      </select>
    </label>
  );
}

export function Portfolio() {
  const { s, a } = useStore();
  if (s.companies.some(c => c.id === s.coId)) return <CompanyPage />;

  const quiet = s.companies.filter(isQuiet);
  const unasked = quiet.filter(c => !s.checkIns.includes(c.id));
  const tabs: [State['pFilter'], string, number][] = [['current', 'Current', s.companies.length], ['quiet', 'Quiet', quiet.length], ['former', 'Former', s.former.length]];
  const former = s.pFilter === 'former';
  const items: Item[] = former ? s.former.map(fromFormer) : (s.pFilter === 'quiet' ? quiet : s.companies).map(c => ({
    id: c.id, name: c.name, one: c.one, stage: c.stage, inv: c.inv, last: lastActive(c), signal: c.signal, meta: `${c.src} · ${c.when}`,
    status: <Status c={c} />, open: () => a.openCompany(c.id),
  }));
  const cols = former ? ['Company', 'Stage', 'Our entry', 'What happened', 'Outcome'] : ['Company', 'Stage', 'Our entry', 'Latest signal', 'Status'];

  const list = (group: Item[]) => s.pLayout === 'cards' ? (
    <div className="pf-cards">
      {group.map(it => (
        <div key={it.id} className={it.open ? 'panel co-card clickable hover-lift' : 'panel co-card former'} onClick={it.open}>
          <div className="top"><Logo id={it.id} name={it.name} size={52} radius={14} />{it.status}</div>
          <div><div className="nm">{it.name}</div><div className="one">{it.one}</div></div>
          <div className="sig"><span className="t">{it.signal}</span><span className="s">{it.meta}</span></div>
          <div className="foot"><span>{it.stage}</span><span>{it.inv}</span></div>
        </div>
      ))}
    </div>
  ) : (
    <div className="panel pf-table">
      <div className="pf-row head">{cols.map(h => <span key={h}>{h}</span>)}</div>
      {group.map(it => (
        <div key={it.id} className={it.open ? 'pf-row body' : 'pf-row body former'} onClick={it.open}>
          <div className="cell-co"><Logo id={it.id} name={it.name} size={34} radius={9} /><div className="col"><span className="b">{it.name}</span><span className="s">{it.one}</span></div></div>
          <span>{it.stage}</span>
          <span className="inv">{it.inv}</span>
          <div className="col"><span className="t">{it.signal}</span><span className="s">{it.meta}</span></div>
          {it.status}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Portfolio</h2>
          <div className="page-sub">Websites, LinkedIn, press and event listings are checked continuously. No update requests needed.</div>
        </div>
      </div>

      <div className="pf-bar">
        <div className="pill-tabs" role="tablist" aria-label="Companies">
          {tabs.map(([k, label, n]) => (
            <button key={k} role="tab" aria-selected={s.pFilter === k} className={s.pFilter === k ? 'pill-tab on' : 'pill-tab'} onClick={() => a.set({ pFilter: k })}>
              <span>{label}</span><span className={k === 'quiet' && unasked.length ? 'c warn' : 'c'}>{n}</span>
            </button>
          ))}
        </div>
        <div className="pf-display">
          <Pick label="Group" value={s.pGroup} options={GROUPS} onChange={pGroup => a.set({ pGroup })} />
          <Pick label="Sort" value={s.pSort} options={SORTS} onChange={pSort => a.set({ pSort })} />
          <div className="pf-layout" role="group" aria-label="Layout">
            {LAYOUTS.map(([k, label, icon]) => (
              <button key={k} aria-pressed={s.pLayout === k} aria-label={label} title={label} className={s.pLayout === k ? 'on' : undefined} onClick={() => a.set({ pLayout: k })}>{icon}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-body">
        {s.pFilter === 'quiet' && (quiet.length ? (
          <div className="pf-note">
            <span>No public update from these companies in {QUIET_WEEKS}+ weeks. A check-in is a short note to the founders, written from their last update.</span>
            {unasked.length
              ? <button className="btn btn-primary" onClick={() => a.checkIn(unasked.map(c => c.id))}>{unasked.length === 1 ? `Send ${unasked[0].name} a check-in` : `Send ${unasked.length} check-ins`}</button>
              : <span className="sent">Check-ins sent today</span>}
          </div>
        ) : <div className="panel empty">Every company has shared something public in the last {QUIET_WEEKS} weeks.</div>)}
        {items.length > 0 && arrange(items, s.pGroup, s.pSort).map(g => (
          <section key={g.key} className="pf-group" aria-label={g.title || undefined}>
            {g.title && <div className="pf-group-head"><h3>{g.title}</h3><span className="n">{g.items.length}</span></div>}
            {list(g.items)}
          </section>
        ))}
      </div>
    </>
  );
}

function CompanyPage() {
  const { s, a } = useStore();
  const c = s.companies.find(x => x.id === s.coId)!;
  const place = [c.city, c.country].filter(Boolean).join(', ');
  const draft = s.drafts.find(p => p.companyId === c.id);
  const sent = s.checkIns.includes(c.id);

  return (
    <div className="co">
      <button className="btn btn-ghost co-back" onClick={a.closeCompany}>← Portfolio</button>
      <div className="co-head">
        <div className="co-id">
          <Logo id={c.id} name={c.name} size={64} radius={16} />
          <div>
            <div className="co-kicker">{c.inv.startsWith(c.stage) ? c.inv : `${c.stage} · ${c.inv}`}</div>
            <h2>{c.name}</h2>
            <div className="one">{c.one}</div>
          </div>
        </div>
        <div className="acts">
          <a className="btn btn-secondary" href={`https://${c.website}`} target="_blank" rel="noopener noreferrer">Open website</a>
          {draft && <button className="btn btn-primary" onClick={() => { a.go('public'); a.set({ pubTab: 'drafts' }); }}>Review the drafted post</button>}
          {!draft && isQuiet(c) && (sent
            ? <button className="btn btn-secondary" disabled>Check-in sent</button>
            : <button className="btn btn-primary" onClick={() => a.checkIn([c.id])}>Send a check-in</button>)}
        </div>
      </div>
      <div className="co-grid">
        <Timeline c={c} sent={sent} />
        <div className="co-side">
          {c.about && (
            <div className="panel watch">
              <div className="eyebrow">About</div>
              <p className="about-text">{c.about}</p>
              <div className="about-meta">{[c.sector, place].filter(Boolean).join(' · ')}</div>
            </div>
          )}
          <div className="panel watch">
            <div className="eyebrow">Watching</div>
            {SOURCES.map(w => <div key={w.label} className="watch-row"><span>{w.label}</span><span className="w">{w.when}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

type Row =
  | { kind: 'now' }
  | { kind: 'sent' }
  | { kind: 'signal'; sg: Signal }
  | { kind: 'gap'; weeks: number }
  | { kind: 'origin'; year: string; round: string };

/** Newest first, from now back to the investment. A quiet stretch shows as a dashed gap before the last public update. */
function timelineRows(c: Company, sent: boolean): Row[] {
  const quiet = isQuiet(c);
  const last = lastActive(c);
  const rows: Row[] = [{ kind: 'now' }];
  if (sent) rows.push({ kind: 'sent' });
  let gapShown = false;
  for (const sg of [...c.signals].sort((x, y) => y.on.localeCompare(x.on))) {
    if (quiet && !gapShown && sg.on === last && sg.src !== 'Monitor') {
      rows.push({ kind: 'gap', weeks: quietWeeks(c) });
      gapShown = true;
    }
    rows.push({ kind: 'signal', sg });
  }
  // Investments made while Associate was already watching are on the timeline as a Fund signal.
  if (!c.signals.some(sg => sg.src === 'Fund')) rows.push({ kind: 'origin', year: batchOf(c.inv), round: c.inv.split(' · ')[0] });
  return rows;
}

function Timeline({ c, sent }: { c: Company; sent: boolean }) {
  const rows = timelineRows(c, sent);
  // Rows above the gap sit in the quiet stretch, so their line is dashed too.
  const gapAt = rows.findIndex(r => r.kind === 'gap');
  const lastUpdate = c.signals.find(sg => sg.on === lastActive(c) && sg.src !== 'Monitor');

  return (
    <ol className="tl" aria-label={`${c.name} timeline`}>
      {rows.map((r, i) => {
        const dashed = i < gapAt ? ' dashed' : '';
        if (r.kind === 'now') return (
          <li key="now" className={`tl-item now${dashed}`}>
            <div className="tl-when"><span className="d">Now</span></div>
            <div className="tl-rail"><span className="tl-dot" /></div>
            <div className="tl-body"><div className="tl-now">Checked 12 min ago</div></div>
          </li>
        );
        if (r.kind === 'sent') return (
          <li key="sent" className={`tl-item sent${dashed}`}>
            <div className="tl-when"><span className="d">{shortDate(TODAY)}</span><span className="r">Today</span></div>
            <div className="tl-rail"><span className="tl-dot" /></div>
            <div className="tl-body">
              <div className="tl-card">
                <div className="tl-top"><span className="tl-text">Check-in sent to the founders</span><span className="src-pill">Fund</span></div>
                <div className="tl-note">{lastUpdate ? `Follows up on “${lastUpdate.text}” from ${shortDate(lastUpdate.on)}` : 'A short note asking how things are going'}</div>
              </div>
            </div>
          </li>
        );
        if (r.kind === 'gap') return (
          <li key="gap" className="tl-item gap">
            <div className="tl-when" />
            <div className="tl-rail" />
            <div className="tl-body"><span className="tl-gap">{r.weeks} weeks without a public update</span></div>
          </li>
        );
        if (r.kind === 'origin') return (
          <li key="origin" className="tl-item origin">
            <div className="tl-when"><span className="d">{r.year}</span></div>
            <div className="tl-rail"><span className="tl-dot" /></div>
            <div className="tl-body"><div className="tl-origin">{FUND.name} invested in the {r.round.toLowerCase()} round</div></div>
          </li>
        );
        const { sg } = r;
        return (
          <li key={`${sg.on}-${i}`} className={`tl-item ${sg.src === 'Monitor' ? 'monitor' : sg.src === 'Fund' ? 'fund' : 'signal'}${dashed}`}>
            <div className="tl-when"><span className="d">{shortDate(sg.on)}</span><span className="r">{ago(sg.on)}</span></div>
            <div className="tl-rail"><span className="tl-dot" /></div>
            <div className="tl-body">
              <div className="tl-card">
                <div className="tl-top"><span className="tl-text">{sg.text}</span><span className="src-pill">{sg.src}</span></div>
                <div className="tl-note">{sg.note}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
