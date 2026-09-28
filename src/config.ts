// The fictional fund the demo runs for. Its data lives in Supabase; only the name
// is set here, so the landing page has it before anything loads. Add
// ?fund=Your%20Fund%20Name to the URL (before the #) to show the demo under
// another fund's name.

const DEFAULT_NAME = 'Pilot Ventures';

function readFundName(): string {
  try {
    const custom = new URLSearchParams(window.location.search).get('fund')?.trim();
    return custom && custom.length <= 40 ? custom : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

const name = readFundName();
const words = name.split(/\s+/).filter(Boolean);
const slug = name.toLowerCase().replace(/\b(ventures|capital|partners|vc|fund)\b/g, '').replace(/[^a-z0-9]+/g, '');

export const FUND = {
  name,
  fund: `${name} I`,
  initials: (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase(),
  domain: `${slug || 'fund'}.vc`,
  possessive: name.endsWith('s') ? `${name}'` : `${name}'s`,
  isDefault: name === DEFAULT_NAME,
};

/** The demo fund's row in the funds table. */
export const DEMO_FUND_SLUG = 'pilot-ventures';

/** The demo's today. Signal dates and "3 weeks ago" count from it rather than the clock, so every pitch tells the same story. */
export const TODAY = '2026-09-23';

/** The demo's clock, 10:00 on TODAY. "2h ago" counts from it, and rows added while clicking around read "Just now". */
export const NOW = '2026-09-23T10:00:00Z';
