export type SignalSrc = 'Press' | 'LinkedIn' | 'Website' | 'Event' | 'Product' | 'Monitor' | 'Fund';

export interface Signal {
  /** ISO date. Shown as "Sep 12" and "3 weeks ago", counted from TODAY in src/config.ts. */
  on: string;
  src: SignalSrc;
  text: string;
  note: string;
}

export type CompanyStatus = 'Growing' | 'Active' | 'Quiet' | 'New';

/** A portfolio company. Name, logo, one-liner and about come from the public Techstars portfolio; everything else is invented. */
export interface Company {
  id: string;
  name: string;
  one: string;
  about: string;
  sector: string;
  city: string;
  country: string;
  website: string;
  stage: string;
  inv: string;
  signal: string;
  src: SignalSrc;
  when: string;
  status: CompanyStatus;
  signals: Signal[];
}

/** A company the fund no longer tracks. Unlike the portfolio, these are fictional, names included. */
export interface FormerCompany {
  id: string;
  name: string;
  one: string;
  /** The last round it reached. */
  stage: string;
  inv: string;
  outcome: 'Acquired' | 'Shut down';
  /** ISO date of the outcome. */
  on: string;
  note: string;
}

export type DealStage = 'inbound' | 'screened' | 'meeting';

export interface Deal {
  id: string;
  name: string;
  one: string;
  sector: string;
  score: number;
  stage: DealStage;
  round: string;
  traction: string;
  team: string;
  loc: string;
  /** Team, Market, Traction, Thesis fit — each 0–100. */
  b: [number, number, number, number];
  why: string[];
  risks: string[];
  src: string;
  website: string;
  meeting?: { day: string; date: string; time: string };
  /** Set on applications submitted through the demo's apply page. */
  applicant?: { name: string; email: string; deck: string | null };
}

export interface SiteEntry {
  kicker: string;
  title: string;
  body: string;
}

export type PostType = 'raise' | 'invest' | 'milestone' | 'event';

export interface Draft {
  id: string;
  type: PostType;
  typeLabel: string;
  companyId: string;
  company: string;
  detected: string;
  /** Post body. "@Name" of the company is rendered as a LinkedIn mention. */
  text: string;
  tags: string;
  site: SiteEntry;
  siteNote: string;
  image: { kicker: string; title: string; sub: string };
  imgBg: string;
}

export interface Published {
  id: string;
  typeLabel: string;
  companyId: string;
  company: string;
  date: string;
  channels: string;
  auto: boolean;
  text: string;
  site?: SiteEntry;
  stats?: string;
}
