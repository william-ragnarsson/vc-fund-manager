// Demo dataset. Company names, logos, websites and descriptions come from the public
// Techstars portfolio (techstars.com/portfolio). Scores, rounds, metrics, events and
// posts are invented for the demo. Cleaned from Haiku agent output in data/enriched/.
import { FUND } from '../config';
import type { Company, Deal, Draft, FormerCompany, Published } from './types';

export const seedCompanies = (): Company[] => [
  {
    id: 'sourcery', name: 'Sourcery', one: 'AI code review for engineering teams',
    about: 'Sourcery reviews every pull request with AI and suggests clearer, safer code. It started as a Python refactoring plugin.',
    sector: 'Developer tools', city: 'London', country: 'United Kingdom', website: 'sourcery.ai',
    stage: 'Series A', inv: 'Seed · 2023', status: 'Growing',
    signal: 'Raised $12M Series A led by Greyline Capital', src: 'Press', when: '2h ago',
    signals: [
      { on: '2026-09-23', src: 'Press', text: 'Raised $12M Series A led by Greyline Capital', note: 'Company blog and press release' },
      { on: '2026-09-12', src: 'LinkedIn', text: 'Hired a Head of Engineering (ex-big tech)', note: 'Founder post, 450 reactions' },
      { on: '2026-08-30', src: 'Website', text: 'Customer page updated: 1,500+ teams', note: 'Up from 1,000 in June' },
      { on: '2026-08-04', src: 'Event', text: 'CTO on an AI code-quality panel in Berlin', note: 'Event listing' },
    ],
  },
  {
    id: 'ekei', name: 'Ekei', one: 'One cloud for freight and fulfillment',
    about: "Ekei's Supply Cloud connects forwarders, warehouses and carriers on one platform, using automation to cut costs and emissions.",
    sector: 'Logistics', city: 'London', country: 'United Kingdom', website: 'ekei.net',
    stage: 'Seed', inv: 'Pre-seed · 2024', status: 'Active',
    signal: 'Speaking at Web Summit, Lisbon', src: 'Event', when: 'Yesterday',
    signals: [
      { on: '2026-09-22', src: 'Event', text: 'Co-founder speaking at Web Summit, Nov 11', note: 'Supply chain & AI track' },
      { on: '2026-09-02', src: 'Product', text: 'Freight rate engine launched', note: 'Changelog · 50+ carriers' },
    ],
  },
  {
    id: 'buildstash', name: 'Buildstash', one: 'Build and release manager for game studios',
    about: 'Buildstash archives every build, shares it with the team and ships it to stores, so studios stop juggling folders and scripts.',
    sector: 'Developer tools', city: 'Glasgow', country: 'United Kingdom', website: 'buildstash.com',
    stage: 'Seed', inv: 'Pre-seed · 2024', status: 'Active',
    signal: 'Hired a VP Sales', src: 'LinkedIn', when: '2d ago',
    signals: [
      { on: '2026-09-21', src: 'LinkedIn', text: 'Hired a VP Sales (ex-game publisher)', note: 'Founder post, 85 reactions' },
      { on: '2026-08-19', src: 'Product', text: 'GitHub Actions and GitLab CI integrations', note: 'Changelog' },
      { on: '2026-07-10', src: 'Website', text: 'Pricing page adds a Studio plan', note: 'Up to 500 seats' },
    ],
  },
  {
    id: 'i-flow', name: 'i-flow', one: 'Factory machine data, ready for AI',
    about: 'i-flow turns data from mixed factory-floor machines into one clean dataset, so manufacturers can run analytics and AI without custom integrations.',
    sector: 'Industrial AI', city: 'Munich', country: 'Germany', website: 'i-flow.io',
    stage: 'Seed', inv: 'Seed · 2023', status: 'Growing',
    signal: 'Passed 100 factory customers', src: 'Website', when: 'Sep 15',
    signals: [
      { on: '2026-09-15', src: 'Website', text: 'Passed 100 factory customers', note: 'From first pilot to 100 in 14 months' },
      { on: '2026-08-21', src: 'LinkedIn', text: 'Opened a US office in Chicago', note: 'Hiring for sales and support' },
      { on: '2026-07-03', src: 'Product', text: '15 new machine connectors released', note: 'CNC, laser and injection molding' },
    ],
  },
  {
    id: 'granter', name: 'Granter', one: 'AI agent that writes grant applications',
    about: 'Granter finds the grants an organization qualifies for and drafts the application, from eligibility checks to supporting documents.',
    sector: 'Vertical AI', city: 'Lisbon', country: 'Portugal', website: 'granter.ai',
    stage: 'Pre-seed', inv: 'Pre-seed · 2026', status: 'Active',
    signal: 'Launched public beta', src: 'Product', when: 'Sep 10',
    signals: [
      { on: '2026-09-10', src: 'Product', text: 'Launched public beta', note: '2,400 teams invited from the waitlist' },
      { on: '2026-08-28', src: 'Fund', text: 'Investment closed: $400k at pre-seed', note: 'Announced on LinkedIn and the website' },
    ],
  },
  {
    id: 'motics', name: 'Motics', one: 'Clinical notes that write themselves',
    about: 'Motics Copilot drafts clinical notes and referral letters during appointments, saving practitioners hours of paperwork each day.',
    sector: 'Clinical AI', city: 'London', country: 'United Kingdom', website: 'motics.co.uk',
    stage: 'Seed', inv: 'Seed · 2024', status: 'Active',
    signal: 'Added an enterprise pricing tier', src: 'Website', when: 'Sep 08',
    signals: [
      { on: '2026-09-08', src: 'Website', text: 'Added an enterprise pricing tier', note: 'SSO, audit logs, unlimited seats' },
      { on: '2026-08-12', src: 'LinkedIn', text: 'Two hospital groups went live', note: '200+ clinicians onboarded' },
      { on: '2026-06-30', src: 'Product', text: 'Referral letters in one click', note: 'Changelog' },
    ],
  },
  {
    id: 'siftyml', name: 'SiftyML', one: 'AI for international trade paperwork',
    about: 'SiftyML reads and structures trade documents such as invoices, bills of lading and customs forms, so trade teams stop retyping data.',
    sector: 'Trade AI', city: 'London', country: 'United Kingdom', website: 'siftyml.com',
    stage: 'Seed', inv: 'Pre-seed · 2024', status: 'Active',
    signal: 'Opened a Rotterdam office', src: 'LinkedIn', when: 'Sep 03',
    signals: [
      { on: '2026-09-03', src: 'LinkedIn', text: 'Opened a Rotterdam office', note: 'Team of 4, hiring 2 more' },
      { on: '2026-08-14', src: 'Product', text: 'Customs classification module shipped', note: 'Changelog' },
      { on: '2026-07-22', src: 'Press', text: 'Featured in a freight trade publication', note: 'Interview with the CEO' },
    ],
  },
  {
    id: 'complok', name: 'Complok', one: 'Compliance on autopilot for fintechs',
    about: 'Complok gives fintech compliance teams an AI assistant for regulatory reviews, cutting manual checks and speeding up approvals.',
    sector: 'Fintech compliance', city: 'Tallinn', country: 'Estonia', website: 'complok.eu',
    stage: 'Pre-seed', inv: 'Pre-seed · 2025', status: 'Active',
    signal: 'Completed SOC 2 Type II', src: 'Website', when: 'Aug 30',
    signals: [
      { on: '2026-08-30', src: 'Website', text: 'Completed SOC 2 Type II', note: 'Trust page updated' },
      { on: '2026-08-06', src: 'LinkedIn', text: 'Signed its first bank customer', note: 'Founder post, 210 reactions' },
      { on: '2026-06-18', src: 'Product', text: 'Regulatory rules engine launched', note: 'Changelog' },
    ],
  },
  {
    id: 'rhenari', name: 'Rhenari', one: 'Roadmap drift detection for product teams',
    about: 'Rhenari watches tickets, docs and releases to show product leaders where the roadmap is drifting from plan, and why.',
    sector: 'Product analytics', city: 'Rapid City', country: 'United States', website: 'rhenari.com',
    stage: 'Pre-seed', inv: 'Pre-seed · 2025', status: 'Active',
    signal: '#2 Product of the Day on Product Hunt', src: 'Product', when: 'Aug 26',
    signals: [
      { on: '2026-08-26', src: 'Product', text: '#2 Product of the Day on Product Hunt', note: '1,268 upvotes' },
      { on: '2026-08-02', src: 'LinkedIn', text: 'Hired a founding engineer', note: 'Team is now 5' },
      { on: '2026-07-15', src: 'Website', text: 'Jira and Slack integrations live', note: 'Integrations page' },
    ],
  },
  {
    id: 'harvest', name: 'Harvest', one: 'Turns any website into a table',
    about: 'Harvest lets teams ask for web data in plain English and get back clean, structured tables they can use right away.',
    sector: 'Web data', city: 'Monroe', country: 'United States', website: 'goharvest.ai',
    stage: 'Seed', inv: 'Pre-seed · 2025', status: 'Active',
    signal: 'Hiring 4 engineers', src: 'LinkedIn', when: 'Aug 21',
    signals: [
      { on: '2026-08-21', src: 'LinkedIn', text: 'Hiring 4 engineers', note: 'Roles posted on LinkedIn' },
      { on: '2026-08-05', src: 'Product', text: 'Launched a public API', note: 'Docs published' },
      { on: '2026-07-09', src: 'Website', text: 'Customer logos added to the homepage', note: '14 logos' },
    ],
  },
  {
    id: 'hylosense', name: 'hylosense', one: 'Weather AI for renewable energy',
    about: 'hylosense models the weather at each wind and solar asset to forecast output, cutting imbalance costs for generators and utilities.',
    sector: 'Energy AI', city: 'Skopje', country: 'North Macedonia', website: 'hylosense.com',
    stage: 'Pre-seed', inv: 'Pre-seed · 2024', status: 'Quiet',
    signal: 'No public activity since July 18', src: 'Monitor', when: '9 weeks',
    signals: [
      { on: '2026-09-20', src: 'Monitor', text: 'No website, blog or changelog changes in 9 weeks', note: 'Flagged as quiet. Not shown anywhere public.' },
      { on: '2026-07-18', src: 'Product', text: 'Forecasting v2 released', note: 'Changelog' },
      { on: '2026-06-02', src: 'LinkedIn', text: 'Two engineers joined', note: 'Team is now 7' },
    ],
  },
  {
    id: 'avido', name: 'Avido', one: 'Testing and monitoring for AI in banking',
    about: 'Avido helps banks and insurers test, monitor and govern their generative AI applications, so they can ship them with confidence.',
    sector: 'AI governance', city: 'Klampenborg', country: 'Denmark', website: 'avidoai.com',
    stage: 'Pre-seed', inv: 'Pre-seed · Sep 2026', status: 'New',
    signal: 'Investment closed', src: 'Fund', when: 'Yesterday',
    signals: [
      { on: '2026-09-22', src: 'Fund', text: 'Investment closed: $500k at pre-seed', note: 'Announcement drafted in Public Presence' },
    ],
  },
];

// Former portfolio companies, under Portfolio → Former.
// Unlike everything above, these companies are fictional, so no real company is shown as failed.
export const seedFormer = (): FormerCompany[] => [
  { id: 'carrowmere', name: 'Carrowmere', one: 'Rota planning for home-care agencies', stage: 'Seed', inv: 'Pre-seed · 2023',
    outcome: 'Acquired', on: '2025-11-12', note: 'Bought by a home-care software group. 2.4x our entry.' },
  { id: 'brindlewick', name: 'Brindlewick', one: 'Shelf analytics for independent grocers', stage: 'Seed', inv: 'Seed · 2023',
    outcome: 'Shut down', on: '2026-03-20', note: 'Wound down after two years. The team joined a customer.' },
  { id: 'tolvane', name: 'Tolvane', one: 'Carbon reporting for small manufacturers', stage: 'Pre-seed', inv: 'Pre-seed · 2024',
    outcome: 'Shut down', on: '2026-01-28', note: 'Its main distribution partner pulled out. Remaining cash returned.' },
];

type D = Deal;
const deal = (d: D) => d;

export const seedDeals = (): Deal[] => [
  // Meetings
  deal({ id: 'papr', name: 'Papr', one: 'Memory layer for AI agents', sector: 'AI infrastructure', score: 90, stage: 'meeting',
    round: 'Seed · $4M', traction: '5 design partners, 2 paying', team: '2 founders, ex-AI infrastructure', loc: 'Dublin, CA', b: [95, 90, 78, 92],
    why: ['Memory is the missing layer for agents', 'Design partners already converting to paid', 'Technical team shipping weekly'],
    risks: ['Model providers may add native memory', 'Pricing not settled'],
    src: 'Intro from Complok founders · 2w ago', website: 'papr.ai',
    meeting: { day: 'Tue', date: '29', time: 'Tue 29 Sep · 14:00 · Video call' } }),
  deal({ id: 'stemma', name: 'Stemma AI', one: 'Stops claims leakage in transport insurance', sector: 'Insurtech', score: 87, stage: 'meeting',
    round: 'Seed · $3M', traction: '$120k ARR', team: '2 founders, ex-claims handling and ML', loc: 'London', b: [88, 84, 80, 90],
    why: ['Clear, measurable ROI for insurers', 'Revenue within a year of launch', 'Founders know claims from the inside'],
    risks: ['Long insurer procurement cycles'],
    src: 'Applied via website · 2w ago', website: 'stemma-ai.com',
    meeting: { day: 'Thu', date: '1', time: 'Thu 1 Oct · 10:30 · Founders visiting' } }),
  // Screened
  deal({ id: 'fopsai', name: 'FopsAI', one: 'AI reconciliation for financial services', sector: 'Fintech ops', score: 92, stage: 'screened',
    round: 'Seed · $2.5M', traction: '$310k ARR, 14 customers', team: '2 founders, ex-bank operations and ML', loc: 'London', b: [94, 88, 90, 95],
    why: ['Revenue tripled in 6 months', 'Ops leaders with budget and urgency', 'Technical co-founder shipped ML at scale'],
    risks: ['Incumbents are adding AI matching', 'Customer concentration: top 2 = 40% ARR'],
    src: 'Applied via website · 1w ago', website: 'fopsai.com' }),
  deal({ id: 'insaio', name: 'Insaio', one: 'AI customer operations for insurers', sector: 'Insurtech', score: 88, stage: 'screened',
    round: 'Seed · $3M', traction: '$180k ARR, 22 teams', team: '2 founders, ex-insurance and conversational AI', loc: 'Hamburg', b: [90, 84, 86, 90],
    why: ['Used in every customer conversation', 'Founders sold to insurers before'],
    risks: ['Regulators are watching AI advice closely'],
    src: 'Intro from Greyline Capital · 1w ago', website: 'insaio.com' }),
  deal({ id: 'linesight', name: 'LineSight', one: 'AI production planning for metal service centers', sector: 'Industrial AI', score: 86, stage: 'screened',
    round: 'Pre-seed · $1.8M', traction: '3 paying service centers', team: '3 founders, ex-steel operations and AI', loc: 'Oak Brook, IL', b: [88, 86, 78, 88],
    why: ['Huge manual planning workflow', 'Paid pilots converted 3 of 3'],
    risks: ['Vertical sales motion'],
    src: 'Applied via website · 9d ago', website: 'linesight-ai.com' }),
  deal({ id: 'auxilius', name: 'Auxilius', one: 'Compliance controls, turned into tested code', sector: 'Compliance automation', score: 81, stage: 'screened',
    round: 'Seed · $2M', traction: '$140k ARR, 9 customers', team: '2 founders, ex-audit and platform engineering', loc: 'Munich', b: [84, 80, 76, 86],
    why: ['Paying customers within 6 months', 'Complements Complok without overlap', 'Founders have sold to this buyer'],
    risks: ['Long enterprise sales cycles'],
    src: 'Applied via website · 3d ago', website: 'auxilius.ai' }),
  deal({ id: 'indora', name: 'Indora', one: 'Compliance infrastructure for regulated data', sector: 'Data compliance', score: 79, stage: 'screened',
    round: 'Seed · $3.5M', traction: '$210k ARR', team: '2 founders, ex-healthcare data and security', loc: 'Albuquerque', b: [82, 85, 74, 78],
    why: ['Every regulated AI team needs this', 'Revenue growing 18% monthly'],
    risks: ['Well-funded competitors'],
    src: 'Applied via website · 4d ago', website: 'indoralabs.com' }),
  deal({ id: 'alethica', name: 'Alethica', one: 'Litigation intelligence for law firms', sector: 'Legal AI', score: 77, stage: 'screened',
    round: 'Pre-seed · $1M', traction: '35 litigation teams on free trial', team: 'Solo founder, ex-litigator', loc: 'London', b: [70, 74, 80, 82],
    why: ['Strong bottom-up adoption', 'Very capital efficient'],
    risks: ['Solo founder', 'Monetization unproven'],
    src: 'Applied via website · 5d ago', website: 'alethica.com' }),
  deal({ id: 'vocations', name: 'Vocations', one: 'Sales intelligence for staffing firms', sector: 'HR tech', score: 74, stage: 'screened',
    round: 'Seed · $2.5M', traction: '4 design partners', team: '2 founders, ex-staffing and data', loc: 'Milan', b: [80, 70, 62, 78],
    why: ['Technical founders in a growing niche'],
    risks: ['Early traction only'],
    src: 'Applied via website · 6d ago', website: 'vocations.io' }),
  // Inbound
  deal({ id: 'fintalo', name: 'Fintalo', one: 'Shared deal rooms for private markets', sector: 'Private markets', score: 67, stage: 'inbound',
    round: 'Pre-seed · $1.2M', traction: 'Pilots with 3 deal teams', team: '2 founders, ex-M&A advisory', loc: 'Munich', b: [70, 62, 55, 78],
    why: ['Clear pain for deal teams', 'Founders lived the problem'], risks: ['Pilots are unpaid'],
    src: 'Applied via website · 2h ago', website: 'fintalo.com' }),
  deal({ id: 'litlyx', name: 'Litlyx', one: 'Cookie-free website analytics', sector: 'Analytics', score: 66, stage: 'inbound',
    round: 'Seed · $3M', traction: '$90k ARR', team: '2 founders, ex-data engineering', loc: 'Rome', b: [68, 58, 66, 72],
    why: ['Early revenue', 'Product-led motion'], risks: ['Crowded analytics market'],
    src: 'Intro from a portfolio founder · 1d ago', website: 'litlyx.com' }),
  deal({ id: 'wattshift', name: 'WattShift', one: 'Electricity price signals as an API', sector: 'Energy software', score: 63, stage: 'inbound',
    round: 'Pre-seed · $1.5M', traction: 'LOI with one utility', team: '3 founders, ex-utilities and IoT', loc: 'Chicago', b: [72, 68, 40, 60],
    why: ['Regulation creates urgency', 'Strong domain founders'], risks: ['Outside core B2B SaaS focus', 'No revenue yet'],
    src: 'Applied via website · 5h ago', website: 'wattshift.com' }),
  deal({ id: '1cp', name: '1-CP', one: 'One-click procurement for B2B buyers', sector: 'Procurement', score: 61, stage: 'inbound',
    round: 'Pre-seed · $1.5M', traction: '2 paying mid-market customers', team: '2 founders, ex-procurement and payments', loc: 'Frankfurt', b: [64, 60, 58, 62],
    why: ['Early paying customers'], risks: ['Crowded spend management market'],
    src: 'Applied via website · 3h ago', website: 'one-cp.com' }),
  deal({ id: 'legaleaze', name: 'Legaleaze', one: 'AI billing review for law firms', sector: 'Legal tech', score: 58, stage: 'inbound',
    round: 'Pre-seed · $1.5M', traction: '$20k ARR', team: '2 founders, ex-legal operations', loc: 'San Francisco', b: [62, 52, 55, 60],
    why: ['Early revenue'], risks: ['Many alternatives'],
    src: 'Applied via website · 4h ago', website: 'legaleaze.co' }),
  deal({ id: 'humbrela', name: 'Humbrela', one: "One place for a broker's client policies", sector: 'Insurtech', score: 56, stage: 'inbound',
    round: 'Pre-seed · $1M', traction: '12 brokers on a waitlist', team: '2 founders, ex-insurance brokerage', loc: 'Vevey', b: [60, 54, 48, 58],
    why: ['Brokers asked for it'], risks: ['No product usage yet'],
    src: 'Applied via website · 6h ago', website: 'humbrela.com' }),
  deal({ id: 'gild', name: 'Gild', one: 'Workforce operating system for the trades', sector: 'Workforce', score: 55, stage: 'inbound',
    round: 'Pre-seed · $2M', traction: 'Pilot with one contractor', team: '2 founders, ex-construction and HR tech', loc: 'New York', b: [64, 58, 40, 50],
    why: ['Large, underserved workforce'], risks: ['Very early pilot', 'Round is large for the traction'],
    src: 'Applied via website · 8h ago', website: 'getgild.com' }),
  deal({ id: 'crosscheck', name: 'Crosscheck', one: 'Compliance audits for farm supply chains', sector: 'Supply chain compliance', score: 52, stage: 'inbound',
    round: 'Pre-seed · $800k', traction: 'Waitlist of 400', team: 'Solo founder, ex-sustainability audits', loc: 'New York', b: [55, 50, 42, 58],
    why: ['Clear, narrow use case'], risks: ['Waitlist not yet converting'],
    src: 'Applied via website · 30 min ago', website: 'crossxcheck.com' }),
  deal({ id: 'safetybolt', name: 'Safety Bolt', one: 'Sensors that monitor structural bolts', sector: 'Industrial IoT', score: 47, stage: 'inbound',
    round: 'Pre-seed · $1M', traction: 'Pre-launch', team: '2 founders, ex-structural engineering', loc: 'Stockholm', b: [58, 40, 30, 44],
    why: ['Experienced in infrastructure'], risks: ['Outside thesis: hardware', 'No product yet'],
    src: 'Applied via website · 1h ago', website: 'safety-bolt.com' }),
  deal({ id: 'arcus', name: 'Arcus', one: 'Remote dental check-ups from home', sector: 'Consumer health', score: 44, stage: 'inbound',
    round: 'Pre-seed · $1.5M', traction: 'Clinical pilot, 60 patients', team: '2 founders, ex-dentistry and imaging', loc: 'London', b: [56, 48, 30, 36],
    why: ['Clinical pilot completed'], risks: ['Outside thesis: consumer health', 'Regulatory path unclear'],
    src: 'Applied via website · 9h ago', website: 'arcusdental.co.uk' }),
];

export const seedDrafts = (): Draft[] => [
  {
    id: 'p1', type: 'raise', typeLabel: 'Portfolio raise', companyId: 'sourcery', company: 'Sourcery',
    detected: 'Detected from press release · 2h ago',
    text: `Huge congratulations to the @Sourcery team on their $12M Series A, led by Greyline Capital.

When we first backed Sourcery, it was a refactoring plugin for Python. Today it reviews code for 1,500+ engineering teams, and the product gets sharper every week.

Proud to keep building with you.`,
    tags: '#VentureCapital #SeriesA #DeveloperTools #AI',
    site: { kicker: 'Sep 2026 · Series A', title: 'Sourcery raises $12M', body: 'AI code review for engineering teams.' },
    siteNote: 'Adds to Recent. Updates stage to Series A.',
    image: { kicker: 'Series A', title: 'Sourcery raises $12M Series A', sub: `Led by Greyline Capital. ${FUND.name} backed the team at seed.` },
    imgBg: '#1c2638',
  },
  {
    id: 'p2', type: 'invest', typeLabel: 'New investment', companyId: 'avido', company: 'Avido',
    detected: 'Investment closed · yesterday',
    text: `We're thrilled to welcome @Avido to the ${FUND.name} portfolio.

Every bank shipping generative AI needs a way to prove it's safe. Avido makes that a product: test, monitor and govern AI applications before and after they go live.

Welcome aboard.`,
    tags: '#VentureCapital #PreSeed #AI #Fintech',
    site: { kicker: 'Sep 2026 · New investment', title: `${FUND.name} invests in Avido`, body: 'Testing and monitoring for AI in banking.' },
    siteNote: 'Adds to Recent and the portfolio page.',
    image: { kicker: 'New investment', title: 'Welcome to the portfolio, Avido', sub: 'Testing and monitoring for AI in banking · Pre-seed' },
    imgBg: '#2c3f5c',
  },
];

export const seedPublished = (): Published[] => [
  { id: 'q1', typeLabel: 'Event', companyId: 'ekei', company: 'Ekei', date: 'Sep 22', channels: 'LinkedIn', auto: true, stats: '86 reactions · 7 comments',
    text: "Catch Ekei's co-founder on the supply chain & AI track at Web Summit in Lisbon on Nov 11. If you move freight in Europe, it's a talk worth your time." },
  { id: 'q2', typeLabel: 'Milestone', companyId: 'i-flow', company: 'i-flow', date: 'Sep 15', channels: 'LinkedIn + Website', auto: true, stats: '142 reactions · 11 comments',
    text: 'i-flow just passed 100 factory customers. From first pilot to 100 in 14 months.',
    site: { kicker: 'Sep 2026 · Milestone', title: 'i-flow passes 100 factories', body: 'Factory machine data, ready for AI.' } },
  { id: 'q3', typeLabel: 'New investment', companyId: 'granter', company: 'Granter', date: 'Aug 28', channels: 'LinkedIn + Website', auto: false, stats: '318 reactions · 24 comments',
    text: "We're excited to back Granter, the AI agent that turns weeks of grant applications into an afternoon.",
    site: { kicker: 'Aug 2026 · New investment', title: `${FUND.name} invests in Granter`, body: 'AI agent that writes grant applications.' } },
];
