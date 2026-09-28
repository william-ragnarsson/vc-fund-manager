import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FUND } from '../config';
import { Logo } from './Logo';
import { useStore } from './store';

/** Splits post text into plain runs, company mentions and hashtags, the way LinkedIn renders them. */
function richText(text: string, mention: string): ReactNode[] {
  const esc = mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(@${esc}|#[A-Za-z0-9_]+)`, 'g');
  return text.split(re).map((part, i) => {
    if (part === `@${mention}`) return <span key={i} className="li-link">{mention}</span>;
    if (/^#[A-Za-z0-9_]+$/.test(part)) return <span key={i} className="li-link">{part}</span>;
    return part;
  });
}

export function FundMark({ size = 48, radius = 4 }: { size?: number; radius?: number }) {
  return (
    <div className="fund-mark" style={{ width: size, height: size, borderRadius: radius, fontSize: Math.round(size / 3) }} aria-hidden="true">
      {FUND.initials}
    </div>
  );
}

const Globe = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm4.9 6h-2.1a11 11 0 0 0-.9-3.9A5 5 0 0 1 12.9 7zM8 3.1c.5.7 1.2 2 1.4 3.9H6.6C6.8 5.1 7.5 3.8 8 3.1zM3.1 9h2.1c.1 1.4.4 2.8.9 3.9A5 5 0 0 1 3.1 9zm2.1-2H3.1a5 5 0 0 1 3-3.9c-.5 1.1-.8 2.5-.9 3.9zM8 12.9c-.5-.7-1.2-2-1.4-3.9h2.8c-.2 1.9-.9 3.2-1.4 3.9zm1.9 0c.5-1.1.8-2.5.9-3.9h2.1a5 5 0 0 1-3 3.9z" /></svg>
);

export interface PostImage { kicker: string; title: string; sub: string }

export function LinkedInPost(props: {
  companyId: string;
  company: string;
  text: string;
  tags: string;
  image?: PostImage;
  imgBg: string;
  status: string;
  editing?: boolean;
  editText?: string;
  onEditText?: (v: string) => void;
  counts?: { reactions: string; right: string };
}) {
  const { companyId, company, text, tags, image, imgBg, status, editing, editText, onEditText, counts } = props;
  const { s } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const full = tags ? `${text}\n\n${tags}` : text;

  useLayoutEffect(() => {
    const el = body.current;
    if (el && !expanded) setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [full, expanded, editing]);

  return (
    <article className="li-post" aria-label={`LinkedIn post preview about ${company}`}>
      <header className="li-head">
        <FundMark />
        <div className="li-who">
          <span className="li-name">{FUND.name}</span>
          <span className="li-sub">{s.fund.followers}</span>
          <span className="li-sub li-time">{status} · <Globe /></span>
        </div>
        <span className="li-more" aria-hidden="true">···</span>
      </header>

      <div className="li-text">
        {editing ? (
          <textarea className="input li-edit" value={editText} onChange={e => onEditText?.(e.target.value)} aria-label="Post text" />
        ) : (
          <div className="li-clamp-wrap">
            <div ref={body} className={expanded ? 'li-body' : 'li-body clamp'}>{richText(full, company)}</div>
            {!expanded && clamped && (
              <button type="button" className="li-see-more" onClick={() => setExpanded(true)}>…more</button>
            )}
          </div>
        )}
      </div>

      {image && (
        <div className="li-img" style={{ background: imgBg }}>
          <div className="c1" /><div className="c2" />
          <div className="li-img-top"><span>{FUND.name} · Portfolio</span><span className="k">{image.kicker}</span></div>
          <div className="li-img-mid">
            <div className="li-img-logo"><Logo id={companyId} name={company} size={84} radius={20} ring={false} /></div>
            <div>
              <div className="t">{image.title}</div>
              <div className="s">{image.sub}</div>
            </div>
          </div>
        </div>
      )}

      <div className="li-counts">
        {counts ? (
          <span className="li-reacts"><span className="li-emoji" aria-hidden="true">
            <i className="r1"><svg viewBox="0 0 16 16" width="10" height="10"><path fill="#fff" d="M5 7v7H3V7h2zm7.5 0H9.8l.5-2.4c.2-.9-.5-1.6-1.3-1.6L6 7v7h5.2c.7 0 1.2-.4 1.4-1l1.2-4.3C14 7.8 13.4 7 12.5 7z" /></svg></i>
            <i className="r2"><svg viewBox="0 0 16 16" width="10" height="10"><path fill="#fff" d="M7 2l1.2 3.1L11.5 5 9 7.2l.8 3.3L7 8.7l-2.8 1.8.8-3.3L2.5 5l3.3.1z" /></svg></i>
            <i className="r3"><svg viewBox="0 0 16 16" width="10" height="10"><path fill="#fff" d="M8 13.5S2.5 10.3 2.5 6.4A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.5 1.4c0 3.9-5.5 7.1-5.5 7.1z" /></svg></i>
          </span>{counts.reactions}</span>
        ) : (
          <span>Reactions appear once posted</span>
        )}
        <span>{counts ? counts.right : '0 comments · 0 reposts'}</span>
      </div>
      <div className="li-actions" aria-hidden="true">
        <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>Like</span>
        <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>Comment</span>
        <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 3-3 3 3" /><path d="M13 18H7a2 2 0 0 1-2-2V6" /><path d="m22 15-3 3-3-3" /><path d="M11 6h6a2 2 0 0 1 2 2v10" /></svg>Repost</span>
        <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg>Send</span>
      </div>
    </article>
  );
}
