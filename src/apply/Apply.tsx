import { useEffect, useRef, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { FUND } from '../config';
import { FundMark } from '../app/LinkedInPost';
import { useStore } from '../app/store';
import { EXAMPLE, REGIONS, SECTORS, STAGES, TRACTION, type Application } from './screen';

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={wide ? 'ap-field wide' : 'ap-field'}>
      <span className="ap-label">{label}{hint && <span className="ap-hint">{hint}</span>}</span>
      {children}
    </label>
  );
}

function Choice({ legend, name, options, value, wide, onPick }: { legend: string; name: string; options: string[]; value: string; wide?: boolean; onPick: (v: string) => void }) {
  return (
    <fieldset className={wide ? 'ap-field wide' : 'ap-field'}>
      <legend className="ap-label">{legend}</legend>
      <div className="chips">
        {options.map(o => (
          <label key={o} className={value === o ? 'chip on' : 'chip'}>
            <input className="sr-only" type="radio" name={name} value={o} checked={value === o} onChange={() => onPick(o)} required />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
);

/** The deck is never read: the demo only keeps the file name. */
function Deck({ file, onFile }: { file: string | null; onFile: (name: string | null) => void }) {
  return (
    <div className="ap-field wide">
      <span className="ap-label">Pitch deck<span className="ap-hint">PDF, optional</span></span>
      {file ? (
        <div className="ap-deck on">
          <DocIcon />
          <span className="n">{file}</span>
          <button type="button" className="ap-link" onClick={() => onFile(null)}>Remove</button>
        </div>
      ) : (
        <label className="ap-deck">
          <input className="sr-only" type="file" accept=".pdf,application/pdf" onChange={e => onFile(e.target.files?.[0]?.name ?? null)} />
          <DocIcon />
          <span><b>Choose a PDF</b> to attach your deck</span>
        </label>
      )}
    </div>
  );
}

/** The fund's apply page, as a founder sees it. Submitting adds the application to Deal Flow. */
export function Apply({ tourOpen }: { tourOpen: boolean }) {
  const { s, a } = useStore();
  const f = s.appForm;
  const sentCard = useRef<HTMLDivElement>(null);
  const put = (k: keyof Application) => (v: string | null) => a.set(prev => ({ appForm: { ...prev.appForm, [k]: v } }));
  const bind = (k: keyof Application) => ({
    value: String(f[k] ?? ''),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => put(k)(e.target.value),
  });
  const submit = (e: FormEvent) => { e.preventDefault(); a.submitApplication(); };
  const first = f.name.trim().split(/\s+/)[0];

  // After sending from the bottom of a long form, bring the confirmation into view.
  useEffect(() => {
    const top = sentCard.current?.getBoundingClientRect().top;
    if (s.appSent && top !== undefined && top < 0) window.scrollBy({ top: top - 24 });
  }, [s.appSent]);

  return (
    <div className={tourOpen ? 'ap tour-open' : 'ap'}>
      <div className="ap-demo" role="note">
        <div className="ap-wrap ap-demo-in">
          <p><b>Founder view</b> · The apply page on {FUND.domain}, run by Associate. Nothing you enter leaves this page.</p>
          {!tourOpen && <a className="ap-demo-btn" href="#/">← Back to Associate</a>}
        </div>
      </div>

      <header className="ap-wrap ap-nav">
        <span className="ap-brand"><FundMark size={30} radius={7} />{FUND.name}</span>
        <nav aria-label={`${FUND.name} website`}>
          <span>Portfolio</span><span>Team</span><span className="on" aria-current="page">Apply for funding</span>
        </nav>
      </header>

      <main className="ap-wrap ap-grid">
        <section className="ap-intro">
          <div className="ap-eyebrow">Apply for funding</div>
          <h1>Tell us what you're building.</h1>
          <p className="ap-lede">We back technical founders building B2B software, at pre-seed and seed, in the US and Europe. First cheques are {FUND.cheque}.</p>
          <ul className="ap-promises">
            <li><b>Every application gets an answer.</b> Yes or no, within five working days.</li>
            <li><b>No warm intro needed.</b> Applications here get the same look as referrals.</li>
            <li><b>Two minutes.</b> The essentials go here. Your deck and website tell us the rest.</li>
          </ul>
        </section>

        {s.appSent ? (
          <div ref={sentCard}>
            <div className="ap-card ap-sent" role="status">
              <div className="ap-check" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <div className="ap-eyebrow">Application received</div>
              <h2>Thanks{first ? `, ${first}` : ''}. {f.company.trim()} is with us.</h2>
              <p>You'll hear from us within five working days, whatever the answer.</p>
              <dl className="ap-summary">
                <div><dt>Company</dt><dd>{f.company.trim()} · {f.website.trim()}</dd></div>
                <div><dt>Round</dt><dd>{f.stage} · {f.raising.trim()}</dd></div>
                <div><dt>Deck</dt><dd>{f.deck ?? 'Not attached'}</dd></div>
              </dl>
              <button className="btn btn-secondary" onClick={a.newApplication}>Apply with another company</button>
            </div>
            <div className="ap-next">
              <span className="k">Demo</span>
              <p>That's all the founder does. Associate has already scored {f.company.trim()} against your thesis.</p>
              {tourOpen
                ? <span className="hint">Press Next to see it arrive in Deal Flow.</span>
                : <button className="ap-next-btn" onClick={a.seeApplication}>See it in the dashboard →</button>}
            </div>
          </div>
        ) : (
          <form className="ap-card" onSubmit={submit}>
            <div className="ap-card-head">
              <h2>Your application</h2>
              <button type="button" className="ap-example" onClick={() => a.set({ appForm: EXAMPLE })}>Demo: fill in an example</button>
            </div>
            <div className="ap-fields">
              <Field label="Company name"><input className="input" required autoComplete="organization" {...bind('company')} /></Field>
              <Field label="Website"><input className="input" required inputMode="url" placeholder="yourcompany.com" {...bind('website')} /></Field>
              <Field label="What are you building?" hint="One sentence" wide>
                <input className="input" required maxLength={100} placeholder="What it does, and who it's for" {...bind('one')} />
              </Field>
              <Field label="Sector">
                <select className="input" required {...bind('sector')}>
                  <option value="" disabled>Choose one</option>
                  {SECTORS.map(x => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="Where is the team based?">
                <select className="input" required {...bind('region')}>
                  <option value="" disabled>Choose one</option>
                  {REGIONS.map(([label]) => <option key={label}>{label}</option>)}
                </select>
              </Field>
              <Choice legend="Stage" name="stage" options={STAGES} value={f.stage} onPick={put('stage')} />
              <Field label="How much are you raising?"><input className="input" required placeholder="$1.5M" {...bind('raising')} /></Field>
              <Choice legend="Traction so far" name="traction" options={TRACTION} value={f.traction} onPick={put('traction')} wide />
              <Field label="Founding team" hint="Who you are, in a line" wide>
                <input className="input" required placeholder="2 founders, ex-logistics and ML" {...bind('team')} />
              </Field>
              <Field label="Your name"><input className="input" required autoComplete="name" {...bind('name')} /></Field>
              <Field label="Email"><input className="input" type="email" required autoComplete="email" {...bind('email')} /></Field>
              <Deck file={f.deck} onFile={put('deck')} />
            </div>
            <div className="ap-submit-row">
              <button className="btn btn-primary ap-submit" type="submit">Submit application</button>
              <span className="ap-fine">Takes about two minutes.</span>
            </div>
          </form>
        )}
      </main>

      <footer className="ap-wrap ap-foot">
        <span>© 2026 {FUND.name}</span>
        <span>{FUND.domain}</span>
      </footer>
    </div>
  );
}
