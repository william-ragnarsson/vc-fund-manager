// The founder apply form and the demo's stand-in for Associate's screening: a submitted
// application is scored against the thesis as it is set right now. Deterministic, so a
// rehearsed demo gives the same result every time.
import { FUND } from '../config';
import type { Deal } from '../data/types';

export interface Application {
  company: string;
  website: string;
  one: string;
  sector: string;
  region: string;
  stage: string;
  raising: string;
  traction: string;
  team: string;
  name: string;
  email: string;
  deck: string | null;
}

export interface Thesis {
  sectors: Record<string, boolean>;
  stages: Record<string, boolean>;
  geos: Record<string, boolean>;
  weights: { team: number; market: number; traction: number; fit: number };
}

export const SECTORS = ['B2B SaaS', 'Vertical AI', 'AI infrastructure', 'Developer tools', 'Fintech', 'Climate', 'Health', 'Consumer', 'Hardware', 'Something else'];
/** Form label → the thesis geography it counts toward. */
export const REGIONS: [string, string][] = [
  ['United States', 'US'], ['Europe', 'Europe'], ['United Kingdom', 'UK'], ['Israel', 'Israel'], ['Latin America', 'LatAm'], ['Somewhere else', ''],
];
export const STAGES = ['Pre-seed', 'Seed', 'Series A'];
export const TRACTION = ['Pre-launch', 'Pilots or LOIs', 'Paying customers', '$100k+ ARR'];

export const BLANK: Application = {
  company: '', website: '', one: '', sector: '', region: '', stage: '', raising: '', traction: '', team: '', name: '', email: '', deck: null,
};

/** Fictional applicant for the "fill in an example" shortcut and the guided tour. */
export const EXAMPLE: Application = {
  company: 'Whimbrel', website: 'whimbrel.ai', one: 'AI rostering for home-care agencies',
  sector: 'Vertical AI', region: 'Europe', stage: 'Seed', raising: '$1.8M', traction: 'Paying customers',
  team: '2 founders, ex-home care operations and ML', name: 'Maja Holm', email: 'maja@whimbrel.ai', deck: 'whimbrel-seed-deck.pdf',
};

const REQUIRED: (keyof Application)[] = ['company', 'website', 'one', 'sector', 'region', 'stage', 'raising', 'traction', 'team', 'name', 'email'];
export const isBlank = (f: Application) => REQUIRED.every(k => !String(f[k] ?? '').trim()) && !f.deck;
export const isComplete = (f: Application) => REQUIRED.every(k => String(f[k] ?? '').trim()) && /\S+@\S+\.\S+/.test(f.email);

const MARKET: Record<string, number> = {
  'AI infrastructure': 84, 'Vertical AI': 82, Fintech: 80, Climate: 80, Health: 78, 'B2B SaaS': 76, 'Developer tools': 76, Consumer: 66, Hardware: 64,
};
const TRACTION_SCORE: Record<string, number> = { 'Pre-launch': 28, 'Pilots or LOIs': 50, 'Paying customers': 72, '$100k+ ARR': 86 };
const TRACTION_WHY: Record<string, string> = { 'Pilots or LOIs': 'Pilots under way with early customers', 'Paying customers': 'Customers already paying', '$100k+ ARR': 'Past $100k ARR already' };
const TRACTION_ASK: Record<string, string> = { 'Pre-launch': 'No product in market yet', 'Pilots or LOIs': 'Whether the pilots are paid', 'Paying customers': 'Revenue and retention figures', '$100k+ ARR': 'Customer concentration' };

const clamp = (n: number) => Math.max(8, Math.min(98, Math.round(n)));

/** "$1.8M", "1.8m", "800k", "1,500,000" → dollars. A bare small number is read as millions. */
function amount(raising: string): number {
  const m = raising.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(k|m|mm|million)?/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? '').toLowerCase();
  if (unit === 'k') return n * 1e3;
  if (unit) return n * 1e6;
  return n < 1000 ? n * 1e6 : n;
}

const tidyAmount = (r: string) => {
  const t = r.trim().replace(/(\d)\s*m\b/i, '$1M').replace(/(\d)\s*k\b/i, '$1k');
  return /^\d/.test(t) ? '$' + t : t;
};
const tidySite = (w: string) => w.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
const sentence = (t: string) => { const x = t.trim().replace(/\.+$/, ''); return x.charAt(0).toUpperCase() + x.slice(1); };

export function screenApplication(f: Application, t: Thesis): Deal {
  let h = 7;
  for (const ch of f.company.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const jitter = (shift: number, span: number) => ((h >>> shift) % (span * 2 + 1)) - span;

  const geo = REGIONS.find(([label]) => label === f.region)?.[1] ?? '';
  const inSector = !!t.sectors[f.sector];
  const inStage = !!t.stages[f.stage];
  const inGeo = !!geo && !!t.geos[geo];
  const technical = /\b(ml|ai|cto|engineer\w*|technical|phd|developer|data scien\w*)\b/i.test(f.team);
  const insider = /\b(ex-|former|years in)/i.test(f.team);
  const solo = /\b(solo|one founder|1 founder|single founder)\b/i.test(f.team);
  const founders = Number(f.team.match(/\b(\d)\s*(?:co-?)?founders?\b/i)?.[1] ?? 0);
  const raised = amount(f.raising);
  const bigRound = (f.stage === 'Pre-seed' && raised > 2.5e6) || (f.stage === 'Seed' && raised > 5e6);

  // Like the seed deals, a miss on the thesis focus shows in the Market and Thesis fit bars,
  // and the score is the weighted average of the four bars.
  const team = clamp(62 + (technical ? 12 : 0) + (insider ? 8 : 0) + (solo ? -8 : founders >= 2 ? 6 : 0) + jitter(3, 2));
  const market = clamp((MARKET[f.sector] ?? 62) - (inSector ? 0 : 20) - (inGeo ? 0 : 12) + jitter(8, 3));
  const traction = clamp((TRACTION_SCORE[f.traction] ?? 40) + jitter(13, 3));
  const fit = clamp(96 - (inSector ? 0 : 44) - (inGeo ? 0 : 36) - (inStage ? 0 : 22) + jitter(18, 2));
  const w = t.weights;
  const score = Math.round((team * w.team + market * w.market + traction * w.traction + fit * w.fit) / 100);

  const why: string[] = [];
  if (inSector && inStage && inGeo) why.push(`Matches your focus: ${f.sector}, ${f.stage.toLowerCase()}, ${f.region}`);
  else if (inSector) why.push(`${f.sector} is in your focus`);
  if (TRACTION_WHY[f.traction]) why.push(TRACTION_WHY[f.traction]);
  if (technical) why.push('Technical founder on the team');
  if (insider && why.length < 3) why.push('Founders know the industry from the inside');
  if (!why.length) why.push('Founders applied directly, with a clear pitch');

  const risks: string[] = [];
  if (!inSector) risks.push(f.sector === 'Something else' ? 'Sector outside your focus' : `Outside thesis: ${f.sector}`);
  if (!inStage) risks.push(`${f.stage} is outside your stages`);
  if (!inGeo) risks.push(geo ? `Outside your geography: ${f.region}` : 'Based outside your geography');
  if (solo) risks.push('Solo founder');
  if (!technical) risks.push('No technical founder mentioned');
  if (bigRound) risks.push('Round is large for the stage');
  risks.push(TRACTION_ASK[f.traction] ?? 'Traction not stated');

  return {
    id: `app-${Date.now()}`, name: f.company.trim(), one: sentence(f.one), sector: f.sector, score, stage: 'inbound',
    round: `${f.stage} · ${tidyAmount(f.raising)}`, traction: f.traction, team: f.team.trim(), loc: f.region,
    b: [team, market, traction, fit], why: why.slice(0, 3), risks: risks.slice(0, 3),
    src: `Applied via ${FUND.domain}/apply · just now`, website: tidySite(f.website),
    applicant: { name: f.name.trim(), email: f.email.trim(), deck: f.deck },
  };
}
