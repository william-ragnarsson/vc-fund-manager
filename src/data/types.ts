export type SignalSrc = 'Press' | 'LinkedIn' | 'Website' | 'Event' | 'Product' | 'Monitor' | 'Fund';

export interface Signal {
  /** ISO date. Shown as "Sep 12" and "3 weeks ago", counted from TODAY in src/config.ts. */
  on: string;
  src: SignalSrc;
  text: string;
  note: string;
}

export type CompanyStatus = 'Growing' | 'Active' | 'Quiet' | 'New';

/** The fund's profile and this month's counters, from the funds row. */
export interface Fund {
  id: string;
  /** The name the fund's email goes out under. The screen uses FUND.name, which ?fund= can change. */
  name: string;
  /** "$40M Fund I". */
  size: string;
  focus: string;
  tagline: string;
  /** "4,812 followers". */
  followers: string;
  timezone: string;
  monthScreened: number;
  monthPassed: number;
}

/** One thing the fund scores applications on. The keys match the scores on each deal. */
export interface Criterion {
  key: string;
  label: string;
  description: string;
  /** Percent of the score. The weights add up to 100. */
  weight: number;
}

/** The fund's thesis as last saved. Each save is a new version. */
export interface Rubric {
  id: string;
  version: number;
  criteria: Criterion[];
  sectors: Record<string, boolean>;
  stages: Record<string, boolean>;
  geos: Record<string, boolean>;
  chequeMin: number | null;
  chequeMax: number | null;
  threshold: number;
  /** "{company}" is replaced with the applicant's name when the note is sent. */
  declineNote: string;
}

/** A portfolio company. Name, logo, one-liner and about come from the public Techstars portfolio; everything else is invented. */
export interface Company {
  /** The slug. Logos and the tour look companies up by it. */
  id: string;
  /** The companies row, for writes. */
  rowId: string;
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
  /** The company's slug. */
  id: string;
  /** The applications row, for writes. */
  rowId: string;
  companyRowId: string;
  name: string;
  one: string;
  sector: string;
  score: number;
  stage: DealStage;
  round: string;
  traction: string;
  team: string;
  loc: string;
  /** Score per rubric criterion, keyed by criterion key, each 0–100. */
  scores: Record<string, number>;
  why: string[];
  risks: string[];
  src: string;
  website: string;
  meeting?: { day: string; date: string; time: string };
}

export interface SiteEntry {
  kicker: string;
  title: string;
  body: string;
}

export type PostType = 'raise' | 'invest' | 'milestone' | 'event' | 'batch' | 'other';

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
  /** "LinkedIn + Website". */
  channels: string;
  /** The website update, when the post goes to the website too. */
  site?: SiteEntry;
  siteNote: string;
  image?: { kicker: string; title: string; sub: string };
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

export type AutoKey = 'invest' | 'raise' | 'milestone' | 'event' | 'site';
export type AutoMode = 'approval' | 'auto' | 'off';
