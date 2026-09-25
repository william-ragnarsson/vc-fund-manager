import { useCallback, useEffect } from 'react';
import { FUND } from '../config';
import { useStore } from '../app/store';

type Actions = ReturnType<typeof useStore>['a'];

interface Step { title: string; body: string; apply: (a: Actions) => void }

const STEPS: Step[] = [
  { title: `Associate, running ${FUND.name}`,
    body: 'Everything it handled for the fund this month, in three numbers. Each one opens its module.',
    apply: a => a.go('home') },
  { title: 'Founders apply on your website',
    body: `A short form on ${FUND.domain}: the essentials, plus a deck. Associate reads the deck and the website for the rest. Submit this one, or press Next.`,
    apply: a => { a.go('apply'); a.prefillApplication(); } },
  { title: 'Every application, read for you',
    body: 'Each one is scored against your thesis the moment it arrives. The ones that miss your bar get a personal note.',
    apply: a => { a.sendDraft(); a.go('deals'); a.set({ dfTab: 'inbound' }); } },
  { title: 'Only the ones worth your time',
    body: 'About 10% clear your bar and land here, each with the reason it fits. Invite or pass in one click.',
    apply: a => { a.go('deals'); a.set({ dfTab: 'screened' }); } },
  { title: 'A brief before every call',
    body: 'Score breakdown, the facts, why it fits and what to ask the founders. Ready before the meeting.',
    apply: a => { a.go('deals'); a.set({ dfTab: 'screened' }); a.openDeal('fopsai'); } },
  { title: 'Your thesis, your rules',
    body: 'Sectors, stages, weights and the bar are yours to set. Change them and every application is re-scored.',
    apply: a => a.go('thesis') },
  { title: 'Portfolio updates, no chasing',
    body: 'Websites, LinkedIn, press, launches and event listings are checked around the clock, so founders never get an update request.',
    apply: a => { a.go('portfolio'); a.set({ pTab: 'cards' }); } },
  { title: 'Every signal has a source',
    body: 'Sourcery announced its Series A this morning. It shows up here with the evidence, next to everything before it.',
    apply: a => a.openCompany('sourcery') },
  { title: 'The post is already written',
    body: 'Associate drafted the LinkedIn post and the website update. Edit it, or approve and publish in one click.',
    apply: a => { a.go('public'); a.set({ pubTab: 'drafts' }); } },
  { title: 'Your website stays in sync',
    body: 'The portfolio page and the Recent section update when you publish. No more stale websites.',
    apply: a => { a.go('public'); a.set({ pubTab: 'website' }); } },
  { title: 'You choose what needs you',
    body: 'Keep approvals where they matter, like new investments. Let the rest run on its own, with an hour to undo.',
    apply: a => { a.go('public'); a.set({ pubTab: 'auto' }); } },
];

export const TOUR_LENGTH = STEPS.length;

/** step: 0..n-1 shows that step, n shows the closing card, null hides the tour. */
export function Tour({ step, setStep }: { step: number | null; setStep: (n: number | null) => void }) {
  const { s, a } = useStore();

  const goTo = useCallback((n: number) => {
    if (n < STEPS.length) STEPS[Math.max(0, n)].apply(a);
    setStep(Math.max(0, Math.min(n, STEPS.length)));
  }, [a, setStep]);

  // Arrow keys step through the tour while presenting.
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' && step < STEPS.length) { e.preventDefault(); goTo(step + 1); }
      if (e.key === 'ArrowLeft' && step > 0) { e.preventDefault(); goTo(step - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, goTo]);

  const restart = () => { a.reset(); goTo(0); };

  if (step === null) {
    // The apply page has its own way back, and an open brief needs its footer buttons clear.
    if (s.view === 'apply' || s.selId) return null;
    return (
      <div className="tour-dock">
        <button className="tour-chip" onClick={() => goTo(0)}>Guided tour</button>
        <button className="tour-chip" onClick={() => { a.reset(); }}>Reset demo</button>
      </div>
    );
  }

  if (step >= STEPS.length) {
    return (
      <div className="tour-end-wrap" role="dialog" aria-modal="true" aria-labelledby="tour-end-title">
        <div className="tour-end">
          <div className="tour-kicker">That's the tour</div>
          <h2 id="tour-end-title">Would Associate take work off your plate?</h2>
          <p>Deal flow screened against your thesis, a portfolio that reports itself, and a public presence that stays current. You approve what matters and skip the busywork.</p>
          <div className="tour-end-acts">
            <a className="btn btn-primary" href="#access">Request early access</a>
            <button className="btn btn-secondary" onClick={() => setStep(null)}>Explore on your own</button>
            <button className="btn btn-ghost" onClick={restart}>Start over</button>
          </div>
        </div>
      </div>
    );
  }

  const cur = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <div className={s.view === 'apply' ? 'tour solo' : s.selId ? 'tour beside-drawer' : 'tour'} role="region" aria-label="Guided tour" aria-live="polite">
      <div className="tour-progress"><div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <div className="tour-row">
        <div className="tour-count">{step + 1}<span>/{STEPS.length}</span></div>
        <div className="tour-copy">
          <div className="tour-title">{cur.title}</div>
          <div className="tour-body">{cur.body}</div>
        </div>
        <div className="tour-acts">
          <button className="tour-btn ghost" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Previous step">←</button>
          <button className="tour-btn primary" onClick={() => goTo(step + 1)}>{last ? 'Finish' : 'Next →'}</button>
          <button className="tour-btn ghost close" onClick={() => setStep(null)} aria-label="Close tour">✕</button>
        </div>
      </div>
      <div className="tour-foot">
        <span>Use ← → to step through</span>
        <button onClick={restart}>Reset demo</button>
      </div>
    </div>
  );
}
