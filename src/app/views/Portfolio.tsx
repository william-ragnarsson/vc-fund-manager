import type { CompanyStatus } from '../../data/types';
import { Logo } from '../Logo';
import { useStore } from '../store';

const STATUS_STYLE: Record<CompanyStatus, [string, string]> = {
  Growing: ['var(--color-accent-100)', 'var(--color-accent-800)'],
  New: ['var(--color-accent-100)', 'var(--color-accent-800)'],
  Active: ['var(--color-neutral-100)', 'var(--color-neutral-800)'],
  Quiet: ['#fbf1e4', '#7a4a12'],
};

function Status({ status }: { status: CompanyStatus }) {
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

export function Portfolio() {
  const { s, a } = useStore();
  const co = s.companies.find(c => c.id === s.coId);
  if (co) return <CompanyPage />;
  const tabs: [typeof s.pTab, string][] = [['cards', 'Cards'], ['table', 'Table'], ['feed', 'Latest signals']];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Portfolio</h2>
          <div className="page-sub">Websites, LinkedIn, press and event listings are checked continuously. No update requests needed.</div>
        </div>
        <div className="seg-tabs" role="tablist" aria-label="Portfolio view">
          {tabs.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={s.pTab === k} className={s.pTab === k ? 'seg-tab on' : 'seg-tab'} onClick={() => a.set({ pTab: k })}>{label}</button>
          ))}
        </div>
      </div>

      {s.pTab === 'cards' && (
        <div className="pf-cards">
          {s.companies.map(c => (
            <div key={c.id} className="panel co-card clickable hover-lift" onClick={() => a.openCompany(c.id)}>
              <div className="top"><Logo id={c.id} name={c.name} size={52} radius={14} /><Status status={c.status} /></div>
              <div><div className="nm">{c.name}</div><div className="one">{c.one}</div></div>
              <div className="sig"><span className="t">{c.signal}</span><span className="s">{c.src} · {c.when}</span></div>
              <div className="foot"><span>{c.stage}</span><span>{c.inv}</span></div>
            </div>
          ))}
        </div>
      )}

      {s.pTab === 'table' && (
        <div className="panel pf-table">
          <div className="pf-row head"><span>Company</span><span>Stage</span><span>Our entry</span><span>Latest signal</span><span>Status</span></div>
          {s.companies.map(c => (
            <div key={c.id} className="pf-row body" onClick={() => a.openCompany(c.id)}>
              <div className="cell-co"><Logo id={c.id} name={c.name} size={34} radius={9} /><div className="col"><span className="b">{c.name}</span><span className="s">{c.one}</span></div></div>
              <span>{c.stage}</span>
              <span className="inv">{c.inv}</span>
              <div className="col"><span className="t">{c.signal}</span><span className="s">{c.src} · {c.when}</span></div>
              <Status status={c.status} />
            </div>
          ))}
        </div>
      )}

      {s.pTab === 'feed' && (
        <div className="pf-feed">
          {s.companies.map(c => (
            <div key={c.id} className="feed-item clickable hover-md" onClick={() => a.openCompany(c.id)}>
              <Logo id={c.id} name={c.name} size={40} radius={10} />
              <div style={{ display: 'flex', flexDirection: 'column' }}><span className="t"><b>{c.name}</b> · {c.signal}</span><span className="s">{c.one}</span></div>
              <span className="w">{c.src} · {c.when}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CompanyPage() {
  const { s, a } = useStore();
  const c = s.companies.find(x => x.id === s.coId)!;
  const signals = c.signals.length ? c.signals : [
    { date: c.when, src: c.src, text: c.signal, note: 'Detected automatically' },
    { date: 'Earlier', src: 'Website' as const, text: 'Website and team page checked, no other changes', note: 'Routine check' },
  ];
  const place = [c.city, c.country].filter(Boolean).join(', ');
  const draft = s.drafts.find(p => p.companyId === c.id);

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
          {!draft && c.status === 'Quiet' && <button className="btn btn-primary" onClick={() => a.toast(`A short check-in was sent to the ${c.name} founders.`)}>Send a check-in</button>}
        </div>
      </div>
      <div className="co-grid">
        <div className="panel timeline">
          {signals.map((sg, i) => (
            <div key={i} className="tl-row">
              <span className="tl-date">{sg.date}</span>
              <span className="src-pill">{sg.src}</span>
              <div><div className="tl-text">{sg.text}</div><div className="tl-note">{sg.note}</div></div>
            </div>
          ))}
        </div>
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
