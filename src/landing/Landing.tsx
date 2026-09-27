import { useState, type FormEvent } from 'react';
import { FUND, MONTH_SCREENED } from '../config';
import { Logo } from '../app/Logo';
import { FundMark } from '../app/LinkedInPost';

const MODULES = [
  {
    eyebrow: 'Deal flow',
    title: 'Every application, read and scored',
    body: 'Inbound applications are scored against your thesis the moment they arrive. The strongest reach your shortlist with a brief. The rest get a personal note in your words.',
    example: { id: 'fopsai', name: 'FopsAI', line: 'Scored 92. Revenue tripled in 6 months.' },
    href: '#/app/deals',
  },
  {
    eyebrow: 'Portfolio',
    title: 'Updates without chasing founders',
    body: 'Websites, LinkedIn, press, product launches and event listings become one timeline per company. You hear about the round before the founder emails you.',
    example: { id: 'hylosense', name: 'hylosense', line: 'Quiet for 9 weeks. Flagged for a check-in.' },
    href: '#/app/portfolio',
  },
  {
    eyebrow: 'Public presence',
    title: 'Every win, announced',
    body: 'When a company raises, launches or takes the stage, the LinkedIn post and the website update are already written. Approve in one click, or let routine posts go out on their own.',
    example: { id: 'ekei', name: 'Ekei', line: 'Web Summit talk posted automatically. 86 reactions.' },
    href: '#/app/public',
  },
];

const RULES: [string, string][] = [
  ['New investments', 'Ask me first'],
  ['Portfolio raises', 'Ask me first'],
  ['Events and talks', 'Automatic, 1h undo'],
];
const RULE_OPTS = ['Ask me first', 'Automatic, 1h undo', 'Off'];

const FIRST_JOBS = ['Screening inbound', 'Portfolio updates', 'LinkedIn and website'];

function HeroVisual() {
  return (
    <div className="lp-visual" aria-label="Example of what Associate does on a Monday morning">
      <div className="lp-visual-head"><span>Monday, 08:00</span><span>{FUND.fund}</span></div>
      <ol className="lp-flow">
        <li className="lp-step">
          <Logo id="fopsai" name="FopsAI" size={40} radius={10} />
          <div className="c">
            <div className="k">Deal flow · Applied via website</div>
            <div className="t">FopsAI scored <b>92</b> and made your shortlist</div>
            <div className="s">AI reconciliation for financial services · $310k ARR</div>
          </div>
          <span className="lp-tag">Brief ready</span>
        </li>
        <li className="lp-step">
          <Logo id="sourcery" name="Sourcery" size={40} radius={10} />
          <div className="c">
            <div className="k">Portfolio · Press release, 2h ago</div>
            <div className="t">Sourcery raised a $12M Series A</div>
            <div className="s">Added to its timeline with the source</div>
          </div>
          <span className="lp-tag">Detected</span>
        </li>
        <li className="lp-step lp-step-post">
          <FundMark size={40} radius={10} />
          <div className="c">
            <div className="k">Public presence · LinkedIn and website</div>
            <div className="t">Post drafted for your approval</div>
            <div className="lp-quote">“Huge congratulations to the <span>Sourcery</span> team on their $12M Series A…”</div>
          </div>
          <span className="lp-fake-btn" aria-hidden="true">Approve</span>
        </li>
      </ol>
    </div>
  );
}

function Access() {
  const [jobs, setJobs] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const toggle = (j: string) => setJobs(cur => (cur.includes(j) ? cur.filter(x => x !== j) : [...cur, j]));
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  if (sent) {
    return (
      <div className="lp-access-card lp-thanks" role="status">
        <div className="lp-eyebrow">Thank you</div>
        <h3>You're on the list.</h3>
        <p>{jobs.length ? `Noted: ${jobs.join(' · ')}. ` : ''}We'll be in touch.</p>
        <button className="btn btn-secondary" onClick={() => { setSent(false); setJobs([]); setEmail(''); }}>Send another</button>
      </div>
    );
  }
  return (
    <form className="lp-access-card" onSubmit={submit}>
      <fieldset>
        <legend>What would you hand off first?</legend>
        <div className="chips">
          {FIRST_JOBS.map(j => (
            <button type="button" key={j} className={jobs.includes(j) ? 'chip on' : 'chip'} aria-pressed={jobs.includes(j)} onClick={() => toggle(j)}>{j}</button>
          ))}
        </div>
      </fieldset>
      <label className="lp-field">
        <span>Work email</span>
        <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourfund.vc" autoComplete="email" />
      </label>
      <button className="btn btn-primary lp-submit" type="submit">Request early access</button>
    </form>
  );
}

export function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-in">
          <a className="lp-brand" href="#/">Associate</a>
          {/* The demo's hub: the landing page and the fund's dashboard. */}
          <nav aria-label="Main">
            <a href="#/" aria-current="page" onClick={() => window.scrollTo({ top: 0 })}>Home</a>
            <a className="btn btn-primary" href="#/app">Dashboard</a>
          </nav>
        </div>
      </header>

      <section className="lp-band lp-hero-band">
        <div className="lp-wrap lp-hero">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">For emerging fund managers</div>
            <h1>The associate your fund hasn't hired yet.</h1>
            <p className="lp-lede">Associate screens every application against your thesis, keeps track of your portfolio from public signals, and drafts the posts when something worth sharing happens. You make the calls.</p>
            <div className="lp-ctas">
              <a className="btn btn-primary lp-cta" href="#/demo">Take the 3-minute tour</a>
              <a className="btn btn-ghost" href="#/app">or explore on your own</a>
            </div>
            <div className="lp-proof">In the demo fund this month: {MONTH_SCREENED.toLocaleString('en-US')} applications screened, 12 companies tracked, 0 update emails to founders.</div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="lp-band" id="how">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <div className="lp-eyebrow">How it works</div>
            <h2>Three jobs that eat a partner's week, handled.</h2>
          </div>
          <div className="lp-modules">
            {MODULES.map(m => (
              <article key={m.eyebrow} className="lp-module">
                <div className="lp-eyebrow">{m.eyebrow}</div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                <div className="lp-example">
                  <Logo id={m.example.id} name={m.example.name} size={32} radius={8} />
                  <div><b>{m.example.name}</b><span>{m.example.line}</span></div>
                </div>
                <a className="lp-more" href={m.href}>See it in the demo →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-band lp-dark">
        <div className="lp-wrap lp-control">
          <div>
            <div className="lp-eyebrow">You stay in control</div>
            <h2>Nothing goes out under your name unless you've said it can.</h2>
            <ul className="lp-points">
              <li><b>Rules per type of update.</b> Approve new investments yourself, let event posts run on their own.</li>
              <li><b>Every signal has a source.</b> Each update links to the press release, post or page it came from.</li>
              <li><b>Your thesis, your bar.</b> Change a weight and every application is re-scored.</li>
            </ul>
          </div>
          <div className="lp-rules">
            <div className="lp-rules-head">Automation · {FUND.name}</div>
            {RULES.map(([label, on]) => (
              <div key={label} className="lp-rule">
                <span className="t">{label}<span className="sr-only">: {on}</span></span>
                <div className="opt-group" aria-hidden="true">
                  {RULE_OPTS.map(o => <span key={o} className={o === on ? 'opt on' : 'opt'}>{o}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-band" id="access">
        <div className="lp-wrap lp-access">
          <div className="lp-section-head">
            <div className="lp-eyebrow">Early access</div>
            <h2>Would Associate help your fund?</h2>
            <p>We're talking to fund managers before we build. Tell us where you'd start.</p>
          </div>
          <Access />
        </div>
      </section>

      <footer className="lp-wrap lp-foot">
        <div className="lp-foot-in">
          <span className="lp-brand">Associate</span>
          <p>Product concept. The demo runs on sample data: the current portfolio's names, logos and descriptions are from the public Techstars portfolio. {FUND.isDefault ? `${FUND.name} is a fictional fund, and all` : 'All'} former portfolio companies, rounds, scores, events and posts are invented. Not affiliated with Techstars or any company shown.</p>
        </div>
      </footer>
    </div>
  );
}
