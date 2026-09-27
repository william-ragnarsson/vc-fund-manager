import { useCallback, useEffect } from 'react';
import { FUND } from '../config';
import { useStore } from '../app/store';

type Actions = ReturnType<typeof useStore>['a'];

interface Step { title: string; body: string; apply: (a: Actions) => void }

const STEPS: Step[] = [
  { title: `Associate, running ${FUND.name}`,
    body: 'This is the home screen. Associate does three jobs for the fund, and each number opens one of them.',
    apply: a => a.go('home') },
  { title: 'First-layer applications screened for you',
    body: 'Associate scores every application against your thesis as it comes in. Anything below your bar is turned down with a personal note, and the rest move on to Screened.',
    apply: a => { a.go('deals'); a.set({ dfTab: 'inbound' }); } },
  { title: 'Source for reasoning',
    body: 'Open any application to see how it was scored, why it fits your thesis and what to ask the founders.',
    // FopsAI, on whichever tab it's in by now. If it was passed on, just Screened.
    apply: a => { a.go('deals'); a.set(prev => {
      const d = prev.deals.find(x => x.id === 'fopsai');
      return d ? { dfTab: d.stage, selId: d.id } : { dfTab: 'screened' };
    }); } },
  { title: 'Screens based on a set rubric',
    body: 'This is the rubric every application is scored on. You set the focus, how much each part counts and where the bar is. Save it and everything gets re-scored.',
    apply: a => a.go('thesis') },
  { title: 'Clear portfolio overview',
    body: 'All your portfolio companies, with the latest news first. Associate follows their websites, LinkedIn and press, and flags the ones that have gone quiet.',
    apply: a => { a.go('portfolio'); a.set({ pFilter: 'current', pGroup: 'none', pSort: 'latest', pLayout: 'cards' }); } },
  { title: 'Up-to-date activity of the startups',
    body: "Sourcery announced its Series A this morning, and it's already at the top. The timeline runs back to when you invested, and each entry shows where Associate found it.",
    apply: a => a.openCompany('sourcery') },
  { title: 'Draft posts',
    body: "Associate writes a post when something happens in the portfolio, like Sourcery's round. You can edit it, or approve it and it goes out on LinkedIn and your website.",
    apply: a => { a.go('public'); a.set({ pubTab: 'drafts' }); } },
  { title: 'Your website stays in sync',
    body: `Approved posts also go on ${FUND.domain}, and the portfolio list keeps itself current. If you approved Sourcery's post, it's now at the top under Recent.`,
    apply: a => { a.go('public'); a.set({ pubTab: 'website' }); } },
  { title: 'Select permissions',
    body: 'Choose what needs your OK and what Associate can just do. New investments and raises ask you first, and the rest happens on its own with an hour to undo.',
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
    // An open brief needs its footer buttons clear.
    if (s.selId) return null;
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
          <div className="tour-kicker">End of the tour</div>
          <h2 id="tour-end-title">Thanks for taking a look</h2>
          <p>Everything here runs on sample data, so feel free to keep clicking around.</p>
          <div className="tour-end-acts">
            <button className="btn btn-primary" onClick={() => setStep(null)}>Continue exploring</button>
            <button className="btn btn-secondary" onClick={restart}>Start over</button>
          </div>
        </div>
      </div>
    );
  }

  const cur = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <div className={s.selId ? 'tour beside-drawer' : 'tour'} role="region" aria-label="Guided tour" aria-live="polite">
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
    </div>
  );
}
