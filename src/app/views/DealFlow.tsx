import type { MouseEvent } from 'react';
import { FUND } from '../../config';
import type { Deal, DealStage } from '../../data/types';
import { Logo } from '../Logo';
import { useStore } from '../store';

const byScore = (a: Deal, b: Deal) => b.score - a.score;
const stop = (fn: () => void) => (e: MouseEvent) => { e.stopPropagation(); fn(); };

export function useDealLists() {
  const { s } = useStore();
  const by = (st: DealStage) => s.deals.filter(d => d.stage === st).sort(byScore);
  return { meetings: by('meeting'), screened: by('screened'), inbound: by('inbound') };
}

/** Inbound counts every application this month; the demo data lists the 10 most recent. */
const DEMO_INBOUND = 10;

export function DealFlow() {
  const { s, a } = useStore();
  const { meetings, screened, inbound } = useDealLists();
  const inboundTotal = s.fund.monthScreened - DEMO_INBOUND + inbound.length;
  const onSectors = Object.keys(s.sectors).filter(k => s.sectors[k]);
  const onStages = Object.keys(s.stages).filter(k => s.stages[k]);
  const onGeos = Object.keys(s.geos).filter(k => s.geos[k]);
  const tabs: [DealStage, string, number | string][] = [
    ['meeting', 'Meetings', meetings.length],
    ['screened', 'Screened', screened.length],
    ['inbound', 'Inbound', inboundTotal.toLocaleString('en-US')],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Deal Flow</h2>
          <div className="page-sub" style={{ maxWidth: 640 }}>Screened against your thesis: {onSectors.join(', ')} · {onStages.join(' to ')} · {onGeos.join(', ')}.</div>
        </div>
        <button className="btn btn-ghost" onClick={() => a.go('thesis')}>Investment thesis →</button>
      </div>
      <div className="df-tabs">
        <div className="pill-tabs" role="tablist" aria-label="Deal flow stages">
          {tabs.map(([k, label, count]) => (
            <button key={k} role="tab" aria-selected={s.dfTab === k} className={s.dfTab === k ? 'pill-tab on' : 'pill-tab'} onClick={() => a.set({ dfTab: k })}>
              <span>{label}</span><span className="c">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {s.dfTab === 'meeting' && (
        <div className="meetings">
          {meetings.length === 0 && <div className="panel empty">No meetings yet. Invite a founder from Screened.</div>}
          {meetings.map(d => (
            <div key={d.id} className="panel meeting clickable hover-md" onClick={() => a.openDeal(d.id)}>
              <div className="cal"><span className="d">{d.meeting?.day}</span><span className="n">{d.meeting?.date}</span></div>
              <div className="who">
                <Logo id={d.id} name={d.name} size={44} radius={12} />
                <div style={{ minWidth: 0 }}>
                  <div className="nm"><b>{d.name}</b><span className="score-pill">{d.score}</span></div>
                  <div className="one">{d.one}</div>
                  <div className="meta">{d.meeting?.time} · {d.round}</div>
                </div>
              </div>
              <div className="acts">
                <button className="btn btn-secondary" onClick={stop(() => a.openDeal(d.id))}>Prep brief</button>
                <button className="btn btn-primary" onClick={stop(() => a.invest(d))}>Mark as invested</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.dfTab === 'screened' && (
        <div className="screened">
          {screened.length === 0 && <div className="panel empty" style={{ gridColumn: '1 / -1' }}>Nothing new cleared your bar. New applications are screened as they arrive.</div>}
          {screened.map(d => (
            <div key={d.id} className="panel deal-card clickable hover-lift" onClick={() => a.openDeal(d.id)}>
              <div className="top">
                <Logo id={d.id} name={d.name} size={44} radius={12} />
                <div className="sc"><span className="v">{d.score}</span><span className="l">score</span></div>
              </div>
              <div><div className="nm">{d.name}</div><div className="one">{d.one}</div></div>
              <div className="why-box">{d.why[0]}</div>
              <div className="meta">{d.round} · {d.loc}</div>
              <div className="acts">
                <button className="btn btn-primary" onClick={stop(() => a.moveDeal(d.id, 'meeting'))}>Invite to meeting</button>
                <button className="btn btn-ghost btn-pass" onClick={stop(() => a.pass(d))}>Pass</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.dfTab === 'inbound' && (
        <div className="inbound">
          <div className="inbound-note">Associate reviews every application here for you. Anything that scores {s.threshold} or above moves to Screened on its own.</div>
          <div className="panel">
            {inbound.map(d => {
              const passed = d.score < s.threshold;
              return (
                <div key={d.id} className="in-row" onClick={() => a.openDeal(d.id)}>
                  <Logo id={d.id} name={d.name} size={32} radius={8} />
                  <div style={{ minWidth: 0 }}><span className="nm">{d.name}</span><span className="one"> · {d.one}</span></div>
                  <span className="sc">{d.score}</span>
                  <span className="st" style={{ color: passed ? 'var(--color-neutral-600)' : 'var(--color-accent-800)' }}>{passed ? 'Passed with note' : 'Scoring · checks running'}</span>
                  <button className="btn btn-ghost" onClick={stop(() => a.moveDeal(d.id, 'screened'))}>Move to Screened</button>
                </div>
              );
            })}
            <div className="in-more">Plus {(inboundTotal - inbound.length).toLocaleString('en-US')} more this month. {s.fund.monthPassed.toLocaleString('en-US')} were passed with a personal note from {FUND.name}.</div>
          </div>
        </div>
      )}
    </>
  );
}

export function DealDrawer() {
  const { s, a } = useStore();
  const d = s.deals.find(x => x.id === s.selId);
  if (!d) return null;
  const order: DealStage[] = ['inbound', 'screened', 'meeting'];
  const stageLabel = { inbound: 'Inbound', screened: 'Screened', meeting: 'Meeting' }[d.stage];
  const nextLabel = { inbound: 'Move to Screened', screened: 'Invite to meeting', meeting: 'Mark as invested' }[d.stage];
  const next = () => {
    if (d.stage === 'meeting') a.invest(d);
    else { a.moveDeal(d.id, order[order.indexOf(d.stage) + 1]); a.closeDeal(); }
  };
  const bars = s.rubric.criteria.filter(c => c.key in d.scores).map(c => ({ label: c.label, val: d.scores[c.key] }));
  const facts = [{ k: 'Round', v: d.round }, { k: 'Traction', v: d.traction }, { k: 'Team', v: d.team }, { k: 'Location', v: d.loc }];

  return (
    <>
      <div className="backdrop" onClick={a.closeDeal} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${d.name} brief`}>
        <div className="drawer-body">
          <div className="drawer-top">
            <span className="pill pill-neutral">{stageLabel}</span>
            <button className="btn btn-ghost" style={{ color: 'var(--color-neutral-700)' }} onClick={a.closeDeal}>Close</button>
          </div>
          <div className="drawer-id">
            <Logo id={d.id} name={d.name} size={52} radius={14} />
            <div><h2>{d.name}</h2><div className="one">{d.one}</div></div>
          </div>
          <div className="score-box">
            <div><div className="score-big">{d.score}</div><div className="score-cap">Thesis score</div></div>
            <div className="bars">
              {bars.map(b => (
                <div key={b.label} className="bar"><span className="k">{b.label}</span><div className="t"><div className="f" style={{ width: b.val + '%' }} /></div><span className="n">{b.val}</span></div>
              ))}
            </div>
          </div>
          <div className="facts">
            {facts.map(f => <div key={f.k} className="fact"><div className="k">{f.k}</div><div className="v">{f.v}</div></div>)}
          </div>
          <div>
            <div className="eyebrow list-h">Why it fits</div>
            {d.why.map(w => <div key={w} className="why">{w}</div>)}
          </div>
          <div>
            <div className="eyebrow list-h">Worth asking about</div>
            {d.risks.map(w => <div key={w} className="risk">{w}</div>)}
          </div>
          <div className="drawer-src">{d.src} · <a href={`https://${d.website}`} target="_blank" rel="noopener noreferrer">{d.website}</a></div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-primary" onClick={next}>{nextLabel}</button>
          <button className="btn btn-secondary" onClick={() => a.pass(d)}>Pass politely</button>
        </div>
      </aside>
    </>
  );
}
