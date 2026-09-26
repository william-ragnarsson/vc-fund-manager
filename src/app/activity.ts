import { TODAY } from '../config';
import type { Company } from '../data/types';

// How recently each portfolio company did something public, counted from the demo's fixed today.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (iso: string) => iso.split('-').map(Number);
const utc = (iso: string) => { const [y, m, d] = ymd(iso); return Date.UTC(y, m - 1, d); };

/** Whole days from an ISO date to the demo's today. */
export const daysAgo = (iso: string) => Math.round((utc(TODAY) - utc(iso)) / 86_400_000);

/** "Sep 02", the way the seed writes dates, with the year added outside the demo's year. */
export function shortDate(iso: string) {
  const [y, m, d] = ymd(iso);
  return `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}${y === ymd(TODAY)[0] ? '' : `, ${y}`}`;
}

/** "Nov 2025". */
export const monthYear = (iso: string) => { const [y, m] = ymd(iso); return `${MONTHS[m - 1]} ${y}`; };

/** "Today", "Yesterday", "5 days ago", "3 weeks ago", "4 months ago". */
export function ago(iso: string) {
  const n = daysAgo(iso);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 14) return `${n} days ago`;
  if (n < 70) return `${Math.floor(n / 7)} weeks ago`;
  return `${Math.floor(n / 30)} months ago`;
}

/** The last day the company itself did something public. Associate's own monitor notes don't count. */
export const lastActive = (c: Company) => c.signals.reduce((last, sg) => (sg.src !== 'Monitor' && sg.on > last ? sg.on : last), '');

/** After four weeks without a public signal, Associate suggests a check-in. */
export const QUIET_WEEKS = 4;
export const quietWeeks = (c: Company) => { const last = lastActive(c); return last ? Math.floor(daysAgo(last) / 7) : Infinity; };
export const isQuiet = (c: Company) => quietWeeks(c) >= QUIET_WEEKS;

/** The year the fund invested, which is the company's batch: "Seed · 2023" is in 2023. */
export const batchOf = (inv: string) => inv.match(/\d{4}/)?.[0] ?? 'Earlier';
