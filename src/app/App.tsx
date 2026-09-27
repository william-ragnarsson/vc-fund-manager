import { useEffect, useRef } from 'react';
import { FUND, MONTH_SCREENED } from '../config';
import { useStore, type View } from './store';
import { DealDrawer, DealFlow, useDealLists } from './views/DealFlow';
import { Portfolio } from './views/Portfolio';
import { PublicPresence } from './views/PublicPresence';
import { Thesis } from './views/Thesis';

function Home() {
  const { s, a } = useStore();
  const metrics = [
    { value: MONTH_SCREENED.toLocaleString('en-US'), label: 'applications screened this month', go: 'deals' as View },
    { value: String(s.companies.length), label: 'portfolio companies tracked', go: 'portfolio' as View },
    { value: String(s.published.length), label: 'posts published this quarter', go: 'public' as View },
  ];
  return (
    <div className="home">
      <div className="home-kicker">{FUND.fund}</div>
      <h1>Associate</h1>
      <div className="metrics">
        {metrics.map(m => (
          <button key={m.label} className="metric" onClick={() => a.go(m.go)}>
            <span className="v">{m.value}</span>
            <span className="l">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function App({ tourOpen }: { tourOpen: boolean }) {
  const { s, a } = useStore();
  const { meetings } = useDealLists();
  const main = useRef<HTMLElement>(null);

  // New page, back to the top, like a real navigation.
  useEffect(() => { main.current?.scrollTo({ top: 0 }); }, [s.view, s.coId, s.dfTab, s.pFilter, s.pLayout, s.pubTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && s.selId) a.closeDeal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s.selId, a]);

  const nav: [View, string, number | string | null][] = [
    ['home', 'Home', null],
    ['deals', 'Deal Flow', meetings.length],
    ['portfolio', 'Portfolio', s.companies.length],
    ['public', 'Public Presence', s.drafts.length || ''],
  ];

  return (
    <div className={tourOpen ? 'app tour-open' : 'app'}>
      <aside className="side">
        <div className="side-brand"><a href="#/">Associate</a></div>
        <div className="side-fund"><span className="k">Fund</span><span className="v">{FUND.fund}</span></div>
        <nav className="side-nav" aria-label="Main">
          {nav.map(([key, label, count]) => (
            <button key={key} className={s.view === key ? 'side-item on' : 'side-item'} aria-current={s.view === key ? 'page' : undefined} onClick={() => a.go(key)}>
              <span>{label}</span>{count !== null && <span className="count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="side-label">Setup</div>
        <button className={s.view === 'thesis' ? 'side-item side-thesis on' : 'side-item side-thesis'} aria-current={s.view === 'thesis' ? 'page' : undefined} onClick={() => a.go('thesis')}>Investment thesis</button>
        <div className="side-user">
          <div className="side-avatar">{FUND.initials}</div>
          <div><span className="n">Managing Partner</span><span className="r">{FUND.name}</span></div>
        </div>
        <div className="side-demo">Demo with sample data. Current companies are from the public Techstars portfolio; former companies, rounds, scores and posts are invented.</div>
      </aside>

      <main className="main" ref={main}>
        {s.view === 'home' && <Home />}
        {s.view === 'deals' && <DealFlow />}
        {s.view === 'thesis' && <Thesis />}
        {s.view === 'portfolio' && <Portfolio />}
        {s.view === 'public' && <PublicPresence />}
        {tourOpen && s.view !== 'home' && <div className="tour-spacer" aria-hidden="true" />}
      </main>

      <DealDrawer />
      {s.toast && <div className={tourOpen ? 'toast with-tour' : 'toast'} role="status">{s.toast}</div>}
    </div>
  );
}
