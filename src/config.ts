// The fictional fund the demo runs for. Add ?fund=Your%20Fund%20Name to the URL
// (before the #) to show the demo under another fund's name.

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
  size: '$40M Fund I',
  focus: 'Pre-seed and seed · US and Europe',
  cheque: '$250k to $750k',
  followers: '4,812 followers',
  tagline: 'We back technical founders building B2B software.',
  possessive: name.endsWith('s') ? `${name}'` : `${name}'s`,
  isDefault: name === DEFAULT_NAME,
};

/** The demo's today. Signal dates and "3 weeks ago" count from it rather than the clock, so every pitch tells the same story. */
export const TODAY = '2026-09-23';

/** Applications Associate screened this month, shown on Home and in Deal Flow. */
export const MONTH_SCREENED = 1284;
