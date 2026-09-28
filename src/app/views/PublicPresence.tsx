import { FUND } from '../../config';
import { LinkedInPost, FundMark } from '../LinkedInPost';
import { Logo } from '../Logo';
import { useStore, type AutoKey, type AutoMode } from '../store';

const AUTO_DEFS: [AutoKey, string, string][] = [
  ['invest', 'New investments', 'LinkedIn post and portfolio page when an investment closes'],
  ['raise', 'Portfolio raises', 'LinkedIn post and a Recent entry when a company announces a round'],
  ['milestone', 'Milestones', 'Customer, product and hiring milestones'],
  ['event', 'Events and talks', 'When a founder speaks or exhibits'],
  ['site', 'Website portfolio sync', 'Names, one-liners and stages on the portfolio page'],
];
const OPT_DEFS: [AutoMode, string][] = [['approval', 'Ask me first'], ['auto', 'Automatic, 1h undo'], ['off', 'Off']];

export function PublicPresence() {
  const { s, a } = useStore();
  const tabs: [typeof s.pubTab, string][] = [
    ['drafts', `Drafts${s.drafts.length ? ' · ' + s.drafts.length : ''}`],
    ['published', 'Published'],
    ['website', 'Website'],
    ['auto', 'Automation'],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Public Presence</h2>
          <div className="page-sub">Posts and website updates are drafted from what happens in your portfolio.</div>
        </div>
        <div className="seg-tabs" role="tablist" aria-label="Public presence view">
          {tabs.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={s.pubTab === k} className={s.pubTab === k ? 'seg-tab on' : 'seg-tab'} onClick={() => a.set({ pubTab: k, editing: null })}>{label}</button>
          ))}
        </div>
      </div>
      {s.pubTab === 'drafts' && <Drafts />}
      {s.pubTab === 'published' && <PublishedList />}
      {s.pubTab === 'website' && <Website />}
      {s.pubTab === 'auto' && (
        <div className="panel auto-list">
          {AUTO_DEFS.map(([key, label, desc]) => (
            <div key={key} className="auto-row">
              <div><div className="t">{label}</div><div className="d">{desc}</div></div>
              <div className="opt-group" role="radiogroup" aria-label={label}>
                {OPT_DEFS.map(([v, l]) => (
                  <button key={v} role="radio" aria-checked={s.auto[key] === v} className={s.auto[key] === v ? 'opt on' : 'opt'} onClick={() => a.setAuto(key, v, label, l)}>{l}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Drafts() {
  const { s, a } = useStore();
  return (
    <div className="drafts">
      {s.drafts.length === 0 && <div className="panel empty">Nothing waiting. New drafts appear here when something happens in the portfolio.</div>}
      {s.drafts.map(p => {
        const editing = s.editing === p.id;
        return (
          <div key={p.id} className="panel draft">
            <div className="draft-head">
              <div className="l"><span className="pill pill-accent">{p.typeLabel}</span><span className="co-n">{p.company}</span></div>
              <span className="det">{p.detected}</span>
            </div>
            <div className="draft-body">
              <LinkedInPost
                companyId={p.companyId} company={p.company} text={p.text} tags={p.tags}
                image={p.image} imgBg={p.imgBg} status="Draft · Not yet posted"
                editing={editing} editText={s.editText} onEditText={v => a.set({ editText: v })}
              />
              <div className="draft-side">
                {p.site && (
                  <>
                    <div className="eyebrow">Also updates the website</div>
                    <div className="site-card">
                      <Logo id={p.companyId} name={p.company} size={36} radius={9} />
                      <div><div className="k">{p.site.kicker}</div><div className="t">{p.site.title}</div><div className="b">{p.site.body}</div></div>
                    </div>
                    <div className="site-note">{p.siteNote}</div>
                  </>
                )}
                <div className="draft-acts">
                  <button className="btn btn-primary approve" onClick={() => a.approve(p.id)}>Approve &amp; publish</button>
                  <div className="row">
                    <button className="btn btn-secondary" onClick={() => a.toggleEdit(p.id)}>{editing ? 'Save' : 'Edit'}</button>
                    <button className="btn btn-ghost" onClick={() => a.discard(p.id)}>Discard</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PublishedList() {
  const { s } = useStore();
  return (
    <div className="panel published">
      {s.published.map(q => (
        <div key={q.id} className="pub-row">
          <span className="d">{q.date}</span>
          <div className="c"><b>{q.company}</b><span>{q.typeLabel}</span></div>
          <div className="x">{q.text.replace(/@(\S)/g, '$1')}</div>
          <div className="ch">
            <span className="n">{q.channels}</span>
            <span className="h">{q.auto ? 'Posted automatically' : 'Approved by you'}</span>
            {q.stats && <span className="st">{q.stats}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Website() {
  const { s } = useStore();
  const recent = s.published.filter(q => q.site).slice(0, 3).map(q => q.site!);
  return (
    <div className="site-wrap">
      <div className="browser">
        <div className="browser-bar">
          <div className="dots"><i /><i /><i /></div>
          <div className="url">{FUND.domain}</div>
          <span className="sync">Synced automatically · 14 min ago</span>
        </div>
        <div className="site">
          <div className="site-nav">
            <span className="brand"><FundMark size={28} radius={6} />{FUND.name}</span>
            <div className="links"><span>Portfolio</span><span>Team</span><span className="apply">Apply for funding</span></div>
          </div>
          <h1>{s.fund.tagline}</h1>
          <div className="focus">{s.fund.focus} · {s.fund.size}</div>
          <div className="sec">Recent</div>
          <div className="site-recent">
            {recent.map(r => <div key={r.title}><div className="k">{r.kicker}</div><div className="t">{r.title}</div><div className="b">{r.body}</div></div>)}
          </div>
          <div className="sec">Portfolio · {s.companies.length} companies</div>
          <div className="site-grid">
            {s.companies.map(c => (
              <div key={c.id}>
                <div className="lg"><Logo id={c.id} name={c.name} size={36} radius={9} /></div>
                <span className="n">{c.name}</span>
                <span className="o">{c.one}</span>
                <span className="st">{c.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
