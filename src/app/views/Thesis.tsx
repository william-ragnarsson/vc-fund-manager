import { FUND } from '../../config';
import { useStore } from '../store';

const WEIGHTS = [
  ['team', 'Team', 'Founder experience, speed and technical depth'],
  ['market', 'Market', 'Size, urgency and timing'],
  ['traction', 'Traction', 'Revenue, usage and growth rate'],
  ['fit', 'Thesis fit', 'Sector, stage and geography match'],
] as const;

type Weights = { team: number; market: number; traction: number; fit: number };

/** Sets one weight and scales the others so the total stays at 100. */
function rebalance(w: Weights, key: keyof Weights, value: number): Weights {
  const others = (Object.keys(w) as (keyof Weights)[]).filter(k => k !== key);
  const rest = others.reduce((sum, k) => sum + w[k], 0);
  const next = { ...w, [key]: value };
  others.forEach(k => { next[k] = rest ? Math.round((w[k] / rest) * (100 - value)) : Math.round((100 - value) / others.length); });
  const largest = others.reduce((m, k) => (next[k] > next[m] ? k : m), others[0]);
  next[largest] += 100 - others.reduce((sum, k) => sum + next[k], value);
  return next;
}

export function Thesis() {
  const { s, a } = useStore();
  const total = Object.values(s.weights).reduce((x, y) => x + y, 0);
  const chips = (key: 'sectors' | 'stages' | 'geos') => (
    <div className="chips">
      {Object.keys(s[key]).map(label => (
        <button key={label} className={s[key][label] ? 'chip on' : 'chip'} aria-pressed={s[key][label]} onClick={() => a.toggleChip(key, label)}>{label}</button>
      ))}
    </div>
  );

  return (
    <div className="thesis">
      <h2>Investment thesis</h2>
      <div className="sub">How Associate scores and filters every application.</div>
      <div className="stack">
        <div className="panel panel-pad" style={{ gap: 20 }}>
          <div className="eyebrow">Focus</div>
          <div><div className="chip-label">Sectors</div>{chips('sectors')}</div>
          <div><div className="chip-label">Stages</div>{chips('stages')}</div>
          <div><div className="chip-label">Geography</div>{chips('geos')}</div>
          <div className="kv-row"><span className="k">Initial check</span><span className="v">{FUND.cheque}</span></div>
        </div>

        <div className="panel panel-pad" style={{ gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="eyebrow">Scoring weights</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Total {total}%</span>
          </div>
          {WEIGHTS.map(([k, label, desc]) => (
            <div key={k} className="weight-row">
              <div><div className="t">{label}</div><div className="d">{desc}</div></div>
              <input type="range" min={0} max={60} value={s.weights[k]} aria-label={`${label} weight`}
                onChange={e => a.set(prev => ({ weights: rebalance(prev.weights, k, Number(e.target.value)) }))} style={{ width: '100%' }} />
              <span className="n">{s.weights[k]}%</span>
            </div>
          ))}
        </div>

        <div className="panel panel-pad" style={{ gap: 16 }}>
          <div className="eyebrow">Screening bar</div>
          <div className="weight-row">
            <div style={{ fontSize: 14 }}>Applications scoring below this are passed with a personal note</div>
            <input type="range" min={40} max={90} value={s.threshold} aria-label="Screening bar" onChange={e => a.set({ threshold: Number(e.target.value) })} style={{ width: '100%' }} />
            <span className="n">{s.threshold}</span>
          </div>
          <div>
            <div className="chip-label">Note sent to founders</div>
            <textarea className="input" value={s.declineNote} onChange={e => a.set({ declineNote: e.target.value })} aria-label="Note sent to founders" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={a.saveThesis}>Save and re-score</button>
          <button className="btn btn-secondary" onClick={() => a.go('deals')}>Back to Deal Flow</button>
        </div>
      </div>
    </div>
  );
}
