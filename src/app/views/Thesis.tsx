import { money } from '../../data/api';
import { useStore } from '../store';

/** Sets one weight and scales the others so the total stays at 100. */
function rebalance(w: Record<string, number>, key: string, value: number): Record<string, number> {
  const others = Object.keys(w).filter(k => k !== key);
  if (!others.length) return w;
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
  const { chequeMin, chequeMax } = s.rubric;
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
          {chequeMin !== null && chequeMax !== null && (
            <div className="kv-row"><span className="k">Initial check</span><span className="v">{money(chequeMin)} to {money(chequeMax)}</span></div>
          )}
        </div>

        <div className="panel panel-pad" style={{ gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="eyebrow">Scoring weights</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Total {total}%</span>
          </div>
          {s.rubric.criteria.map(c => (
            <div key={c.key} className="weight-row">
              <div><div className="t">{c.label}</div><div className="d">{c.description}</div></div>
              <input type="range" min={0} max={60} value={s.weights[c.key] ?? 0} aria-label={`${c.label} weight`}
                onChange={e => a.set(prev => ({ weights: rebalance(prev.weights, c.key, Number(e.target.value)) }))} style={{ width: '100%' }} />
              <span className="n">{s.weights[c.key] ?? 0}%</span>
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
