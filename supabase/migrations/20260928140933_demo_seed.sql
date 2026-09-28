-- The demo fund, Pilot Ventures, and its sample data.
--
-- private.seed_demo(fund) writes the demo's rows into a fund. public.reset_demo()
-- empties every demo fund and seeds it again; "Reset demo", "Start over" and
-- the guided tour call it. The current portfolio's names, one-liners and
-- descriptions come from the public Techstars portfolio. Everything else is
-- invented: former companies, applicants, rounds, scores, events and posts.
--
-- Text that names the fund says {fund} or {fund's}. The app fills these in, so
-- ?fund=Name shows the demo under another name. Times sit around the demo's
-- clock, 2026-09-23 10:00 UTC: TODAY and NOW in src/config.ts.

create function private.seed_demo(p_fund uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_rubric uuid;
begin
  insert into public.rubrics (fund_id, version, criteria, focus, cheque_min_usd, cheque_max_usd, threshold, decline_note)
  values (
    p_fund, 1,
    '[
      {"key": "team", "label": "Team", "description": "Founder experience, speed and technical depth", "weight": 35},
      {"key": "market", "label": "Market", "description": "Size, urgency and timing", "weight": 25},
      {"key": "traction", "label": "Traction", "description": "Revenue, usage and growth rate", "weight": 25},
      {"key": "fit", "label": "Thesis fit", "description": "Sector, stage and geography match", "weight": 15}
    ]',
    '{
      "sectors": [{"name": "B2B SaaS", "on": true}, {"name": "Vertical AI", "on": true}, {"name": "AI infrastructure", "on": true}, {"name": "Developer tools", "on": false}, {"name": "Fintech", "on": false}, {"name": "Climate", "on": false}],
      "stages": [{"name": "Pre-seed", "on": true}, {"name": "Seed", "on": true}, {"name": "Series A", "on": false}],
      "geos": [{"name": "US", "on": true}, {"name": "Europe", "on": true}, {"name": "UK", "on": true}, {"name": "Israel", "on": false}, {"name": "LatAm", "on": false}]
    }',
    250000, 750000, 60,
    'Thank you for sharing {company} with us. After a careful look, it isn''t the right fit for {fund''s} current fund focus. This says nothing about the quality of what you''re building, and we''d be glad to hear from you again as things progress.'
  )
  returning id into v_rubric;

  insert into public.automation_rules (fund_id, key, mode) values
    (p_fund, 'invest', 'approval'),
    (p_fund, 'raise', 'approval'),
    (p_fund, 'milestone', 'auto'),
    (p_fund, 'event', 'auto'),
    (p_fund, 'site', 'auto');

  -- The current portfolio, then the former portfolio, then the applicants.
  insert into public.companies (fund_id, slug, name, one_liner, about, sector, city, country, website, stage, origin)
  select p_fund, v.slug, v.name, v.one_liner, v.about, v.sector, v.city, v.country, v.website, v.stage, 'seed'
  from (values
    ('sourcery', 'Sourcery', 'AI code review for engineering teams', 'Sourcery reviews every pull request with AI and suggests clearer, safer code. It started as a Python refactoring plugin.', 'Developer tools', 'London', 'United Kingdom', 'sourcery.ai', 'Series A'),
    ('ekei', 'Ekei', 'One cloud for freight and fulfillment', 'Ekei''s Supply Cloud connects forwarders, warehouses and carriers on one platform, using automation to cut costs and emissions.', 'Logistics', 'London', 'United Kingdom', 'ekei.net', 'Seed'),
    ('buildstash', 'Buildstash', 'Build and release manager for game studios', 'Buildstash archives every build, shares it with the team and ships it to stores, so studios stop juggling folders and scripts.', 'Developer tools', 'Glasgow', 'United Kingdom', 'buildstash.com', 'Seed'),
    ('bruin', 'Bruin', 'Data pipelines in SQL and Python, in one tool', 'Bruin is an online platform where data analysts transform data with SQL and Python, without writing custom code.', 'Data infrastructure', 'Berlin', 'Germany', 'getbruin.com', 'Seed'),
    ('prediko', 'Prediko', 'Inventory planning for e-commerce brands', 'Prediko predicts the inventory an e-commerce brand needs, cutting both stockouts and excess stock.', 'E-commerce ops', 'London', 'United Kingdom', 'prediko.io', 'Series A'),
    ('overwatch-ai', 'Overwatch AI', 'Offline AI assistant for frontline crews', 'Overwatch AI is an offline, on-device AI knowledge platform for frontline workers in aviation and energy.', 'Frontline AI', 'Barcelona', 'Spain', 'overwatch-ai.com', 'Pre-seed'),
    ('i-flow', 'i-flow', 'Factory machine data, ready for AI', 'i-flow turns data from mixed factory-floor machines into one clean dataset, so manufacturers can run analytics and AI without custom integrations.', 'Industrial AI', 'Munich', 'Germany', 'i-flow.io', 'Seed'),
    ('nukleas', 'Nukleas', 'Operations software for government contractors', 'Nukleas builds operational infrastructure for government contractors.', 'GovTech', 'New York', 'United States', 'nukleas.com', 'Pre-seed'),
    ('telekinesis', 'Telekinesis', 'Robotics cloud for automating manufacturing', 'Telekinesis is building an AI-powered robotics cloud platform to automate manufacturing.', 'Robotics software', 'Darmstadt', 'Germany', 'telekinesis.ai', 'Seed'),
    ('granter', 'Granter', 'AI agent that writes grant applications', 'Granter finds the grants an organization qualifies for and drafts the application, from eligibility checks to supporting documents.', 'Vertical AI', 'Lisbon', 'Portugal', 'granter.ai', 'Pre-seed'),
    ('trissino', 'Trissino', 'AI competitive intelligence for B2B sales', 'Trissino uses AI to rethink competitive intelligence, helping B2B teams win more deals.', 'Sales intelligence', 'San Francisco', 'United States', 'hiresteve.ai', 'Seed'),
    ('motics', 'Motics', 'Clinical notes that write themselves', 'Motics Copilot drafts clinical notes and referral letters during appointments, saving practitioners hours of paperwork each day.', 'Clinical AI', 'London', 'United Kingdom', 'motics.co.uk', 'Seed'),
    ('imaginario', 'Imaginario', 'Find and clip any moment in video', 'Imaginario is an AI platform and API that finds specific moments in video and audio in seconds, so content marketers and creators can find and clip content faster.', 'Media AI', 'London', 'United Kingdom', 'imaginario.ai', 'Seed'),
    ('kindred-voice', 'Kindred Voice', 'AI property manager for rental homes', 'Kindred Voice is building an AI property manager for residential property management companies, handling leasing and maintenance without human intervention.', 'Proptech', 'New York', 'United States', 'kindredvoice.ai', 'Pre-seed'),
    ('siftyml', 'SiftyML', 'AI for international trade paperwork', 'SiftyML reads and structures trade documents such as invoices, bills of lading and customs forms, so trade teams stop retyping data.', 'Trade AI', 'London', 'United Kingdom', 'siftyml.com', 'Seed'),
    ('meridyan', 'Meridyan', 'One API from banks to blockchain rails', 'Meridyan connects regulated banks to blockchain rails through a single ISO 20022 native API, without changes to their core systems.', 'Payments infrastructure', 'Amsterdam', 'Netherlands', 'meridyan.xyz', 'Pre-seed'),
    ('volumes', 'Volumes', 'The data layer for physical AI', 'Volumes is building the data layer for physical AI.', 'Physical AI', 'Westport', 'United States', 'volumes.cloud', 'Pre-seed'),
    ('complok', 'Complok', 'Compliance on autopilot for fintechs', 'Complok gives fintech compliance teams an AI assistant for regulatory reviews, cutting manual checks and speeding up approvals.', 'Fintech compliance', 'Tallinn', 'Estonia', 'complok.eu', 'Pre-seed'),
    ('rhenari', 'Rhenari', 'Roadmap drift detection for product teams', 'Rhenari watches tickets, docs and releases to show product leaders where the roadmap is drifting from plan, and why.', 'Product analytics', 'Rapid City', 'United States', 'rhenari.com', 'Pre-seed'),
    ('harvest', 'Harvest', 'Turns any website into a table', 'Harvest lets teams ask for web data in plain English and get back clean, structured tables they can use right away.', 'Web data', 'Monroe', 'United States', 'goharvest.ai', 'Seed'),
    ('reeler', 'Reeler', 'Customer videos, turned into marketing', 'Reeler is an enterprise SaaS platform for user-generated content marketing, helping brands put content from real customers to work.', 'Marketing tech', 'Stockholm', 'Sweden', 'reelertech.com', 'Seed'),
    ('profit-optimizer', 'Profit Optimizer', 'Pricing and margin actions for distributors', 'Profit Optimizer turns a wholesale distributor''s ERP data into prioritized actions for customer segmentation, pricing, sales focus and margins.', 'Pricing analytics', 'Sarajevo', 'Bosnia and Herzegovina', 'profit-optimizer.com', 'Pre-seed'),
    ('hylosense', 'hylosense', 'Weather AI for renewable energy', 'hylosense models the weather at each wind and solar asset to forecast output, cutting imbalance costs for generators and utilities.', 'Energy AI', 'Skopje', 'North Macedonia', 'hylosense.com', 'Pre-seed'),
    ('avido', 'Avido', 'Testing and monitoring for AI in banking', 'Avido helps banks and insurers test, monitor and govern their generative AI applications, so they can ship them with confidence.', 'AI governance', 'Klampenborg', 'Denmark', 'avidoai.com', 'Pre-seed'),
    ('carrowmere', 'Carrowmere', 'Rota planning for home-care agencies', null, null, null, null, null, 'Seed'),
    ('brindlewick', 'Brindlewick', 'Shelf analytics for independent grocers', null, null, null, null, null, 'Seed'),
    ('tolvane', 'Tolvane', 'Carbon reporting for small manufacturers', null, null, null, null, null, 'Pre-seed'),
    ('papr', 'Papr', 'Memory layer for AI agents', null, 'AI infrastructure', 'Dublin, CA', 'United States', 'papr.ai', null),
    ('stemma', 'Stemma AI', 'Stops claims leakage in transport insurance', null, 'Insurtech', 'London', 'United Kingdom', 'stemma-ai.com', null),
    ('fopsai', 'FopsAI', 'AI reconciliation for financial services', null, 'Fintech ops', 'London', 'United Kingdom', 'fopsai.com', null),
    ('insaio', 'Insaio', 'AI customer operations for insurers', null, 'Insurtech', 'Hamburg', 'Germany', 'insaio.com', null),
    ('linesight', 'LineSight', 'AI production planning for metal service centers', null, 'Industrial AI', 'Oak Brook, IL', 'United States', 'linesight-ai.com', null),
    ('auxilius', 'Auxilius', 'Compliance controls, turned into tested code', null, 'Compliance automation', 'Munich', 'Germany', 'auxilius.ai', null),
    ('indora', 'Indora', 'Compliance infrastructure for regulated data', null, 'Data compliance', 'Albuquerque', 'United States', 'indoralabs.com', null),
    ('alethica', 'Alethica', 'Litigation intelligence for law firms', null, 'Legal AI', 'London', 'United Kingdom', 'alethica.com', null),
    ('vocations', 'Vocations', 'Sales intelligence for staffing firms', null, 'HR tech', 'Milan', 'Italy', 'vocations.io', null),
    ('fintalo', 'Fintalo', 'Shared deal rooms for private markets', null, 'Private markets', 'Munich', 'Germany', 'fintalo.com', null),
    ('litlyx', 'Litlyx', 'Cookie-free website analytics', null, 'Analytics', 'Rome', 'Italy', 'litlyx.com', null),
    ('wattshift', 'WattShift', 'Electricity price signals as an API', null, 'Energy software', 'Chicago', 'United States', 'wattshift.com', null),
    ('1cp', '1-CP', 'One-click procurement for B2B buyers', null, 'Procurement', 'Frankfurt', 'Germany', 'one-cp.com', null),
    ('legaleaze', 'Legaleaze', 'AI billing review for law firms', null, 'Legal tech', 'San Francisco', 'United States', 'legaleaze.co', null),
    ('humbrela', 'Humbrela', 'One place for a broker''s client policies', null, 'Insurtech', 'Vevey', 'Switzerland', 'humbrela.com', null),
    ('gild', 'Gild', 'Workforce operating system for the trades', null, 'Workforce', 'New York', 'United States', 'getgild.com', null),
    ('crosscheck', 'Crosscheck', 'Compliance audits for farm supply chains', null, 'Supply chain compliance', 'New York', 'United States', 'crossxcheck.com', null),
    ('safetybolt', 'Safety Bolt', 'Sensors that monitor structural bolts', null, 'Industrial IoT', 'Stockholm', 'Sweden', 'safety-bolt.com', null),
    ('arcus', 'Arcus', 'Remote dental check-ups from home', null, 'Consumer health', 'London', 'United Kingdom', 'arcusdental.co.uk', null)
  ) as v(slug, name, one_liner, about, sector, city, country, website, stage);

  -- created_at only orders the portfolio, newest first.
  insert into public.investments (fund_id, company_id, round, invested_on, amount_usd, status, exit_outcome, exited_on, exit_note, created_at)
  select p_fund, c.id, v.round, v.invested_on::date, v.amount_usd::numeric, v.status, v.exit_outcome, v.exited_on::date, v.exit_note, v.created_at::timestamptz
  from (values
    ('sourcery', 'Seed', '2023-07-01', null, 'growing', null, null, null, '2026-09-23 09:59+00'),
    ('ekei', 'Pre-seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:58+00'),
    ('buildstash', 'Pre-seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:57+00'),
    ('bruin', 'Pre-seed', '2023-07-01', null, 'active', null, null, null, '2026-09-23 09:56+00'),
    ('prediko', 'Seed', '2023-07-01', null, 'growing', null, null, null, '2026-09-23 09:55+00'),
    ('overwatch-ai', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:54+00'),
    ('i-flow', 'Seed', '2023-07-01', null, 'growing', null, null, null, '2026-09-23 09:53+00'),
    ('nukleas', 'Pre-seed', '2026-06-09', 350000, 'active', null, null, null, '2026-09-23 09:52+00'),
    ('telekinesis', 'Pre-seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:51+00'),
    ('granter', 'Pre-seed', '2026-08-28', 400000, 'active', null, null, null, '2026-09-23 09:50+00'),
    ('trissino', 'Pre-seed', '2025-07-01', null, 'growing', null, null, null, '2026-09-23 09:49+00'),
    ('motics', 'Seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:48+00'),
    ('imaginario', 'Seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:47+00'),
    ('kindred-voice', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:46+00'),
    ('siftyml', 'Pre-seed', '2024-07-01', null, 'active', null, null, null, '2026-09-23 09:45+00'),
    ('meridyan', 'Pre-seed', '2026-05-19', 450000, 'active', null, null, null, '2026-09-23 09:44+00'),
    ('volumes', 'Pre-seed', '2026-03-03', 250000, 'active', null, null, null, '2026-09-23 09:43+00'),
    ('complok', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:42+00'),
    ('rhenari', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:41+00'),
    ('harvest', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:40+00'),
    ('reeler', 'Pre-seed', '2023-07-01', null, 'active', null, null, null, '2026-09-23 09:39+00'),
    ('profit-optimizer', 'Pre-seed', '2025-07-01', null, 'active', null, null, null, '2026-09-23 09:38+00'),
    ('hylosense', 'Pre-seed', '2024-07-01', null, 'quiet', null, null, null, '2026-09-23 09:37+00'),
    ('avido', 'Pre-seed', '2026-09-22', 500000, 'new', null, null, null, '2026-09-23 09:36+00'),
    ('carrowmere', 'Pre-seed', '2023-07-01', null, 'active', 'acquired', '2025-11-12', 'Bought by a home-care software group. 2.4x our entry.', '2026-09-23 09:35+00'),
    ('brindlewick', 'Seed', '2023-07-01', null, 'active', 'shut_down', '2026-03-20', 'Wound down after two years. The team joined a customer.', '2026-09-23 09:34+00'),
    ('tolvane', 'Pre-seed', '2024-07-01', null, 'active', 'shut_down', '2026-01-28', 'Its main distribution partner pulled out. Remaining cash returned.', '2026-09-23 09:33+00')
  ) as v(slug, round, invested_on, amount_usd, status, exit_outcome, exited_on, exit_note, created_at)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug;

  -- Each company's timeline. headline is the portfolio card's shorter wording.
  insert into public.signals (fund_id, company_id, occurred_on, detected_at, source, text, headline, note, origin)
  select p_fund, c.id, v.occurred_on::date, v.detected_at::timestamptz, v.source, v.text, v.headline, v.note, 'seed'
  from (values
    ('sourcery', '2026-09-23', '2026-09-23 08:00+00', 'press', 'Raised $12M Series A led by Greyline Capital', null, 'Company blog and press release'),
    ('sourcery', '2026-09-12', '2026-09-12 09:00+00', 'linkedin', 'Hired a Head of Engineering (ex-big tech)', null, 'Founder post, 450 reactions'),
    ('sourcery', '2026-08-30', '2026-08-30 09:00+00', 'website', 'Customer page updated: 1,500+ teams', null, 'Up from 1,000 in June'),
    ('sourcery', '2026-08-04', '2026-08-04 09:00+00', 'event', 'CTO on an AI code-quality panel in Berlin', null, 'Event listing'),
    ('sourcery', '2026-06-09', '2026-06-09 09:00+00', 'website', 'Customer page updated: 1,000+ teams', null, 'Up from 500 a year earlier'),
    ('sourcery', '2026-04-21', '2026-04-21 09:00+00', 'product', 'Security checks on every pull request', null, 'Changelog'),
    ('sourcery', '2026-01-27', '2026-01-27 09:00+00', 'linkedin', 'Team passed 30 people', null, 'Founder post, 340 reactions'),
    ('sourcery', '2025-10-14', '2025-10-14 09:00+00', 'product', 'GitLab and Bitbucket support', null, 'Changelog'),
    ('sourcery', '2025-06-24', '2025-06-24 09:00+00', 'event', 'Talk at a Python conference in Prague', null, 'Conference schedule'),
    ('sourcery', '2025-02-11', '2025-02-11 09:00+00', 'press', 'Named among AI developer tools to watch', null, 'Tech press roundup'),
    ('sourcery', '2024-09-17', '2024-09-17 09:00+00', 'product', 'Launched AI code review for pull requests', null, 'Changelog · every major language, not just Python'),
    ('sourcery', '2024-03-05', '2024-03-05 09:00+00', 'product', 'Python plugin passed 200,000 installs', null, 'VS Code and PyCharm marketplaces'),
    ('ekei', '2026-09-22', '2026-09-22 09:00+00', 'event', 'Co-founder speaking at Web Summit, Nov 11', 'Speaking at Web Summit, Lisbon', 'Supply chain & AI track'),
    ('ekei', '2026-09-02', '2026-09-02 09:00+00', 'product', 'Freight rate engine launched', null, 'Changelog · 50+ carriers'),
    ('buildstash', '2026-09-21', '2026-09-21 09:00+00', 'linkedin', 'Hired a VP Sales (ex-game publisher)', 'Hired a VP Sales', 'Founder post, 85 reactions'),
    ('buildstash', '2026-08-19', '2026-08-19 09:00+00', 'product', 'GitHub Actions and GitLab CI integrations', null, 'Changelog'),
    ('buildstash', '2026-07-10', '2026-07-10 09:00+00', 'website', 'Pricing page adds a Studio plan', null, 'Up to 500 seats'),
    ('bruin', '2026-09-18', '2026-09-18 09:00+00', 'product', 'Launched an AI assistant for data pipelines', null, 'Changelog · works in VS Code'),
    ('bruin', '2026-08-27', '2026-08-27 09:00+00', 'product', 'Open-source CLI passed 3,000 GitHub stars', null, 'GitHub'),
    ('bruin', '2026-07-14', '2026-07-14 09:00+00', 'event', 'Workshop at a data engineering conference in Amsterdam', null, 'Event listing'),
    ('bruin', '2026-05-19', '2026-05-19 09:00+00', 'linkedin', 'Team grew to 14', null, 'Founder post, 190 reactions'),
    ('bruin', '2026-03-03', '2026-03-03 09:00+00', 'product', 'Databricks and Snowflake support', null, 'Changelog'),
    ('bruin', '2025-11-11', '2025-11-11 09:00+00', 'press', 'Raised a $4M seed round led by Skerry Partners', null, 'Press release · {fund} followed on'),
    ('bruin', '2025-09-09', '2025-09-09 09:00+00', 'product', 'Open-sourced its pipeline CLI on GitHub', null, '1,000 stars in the first month'),
    ('bruin', '2025-04-08', '2025-04-08 09:00+00', 'website', 'First enterprise case study published', null, 'Customers page'),
    ('bruin', '2024-10-15', '2024-10-15 09:00+00', 'product', 'Bruin Cloud generally available', null, 'Changelog · 60 teams moved over from the beta'),
    ('bruin', '2024-02-20', '2024-02-20 09:00+00', 'event', 'Demo at a Berlin data meetup', null, 'Meetup page'),
    ('bruin', '2023-09-05', '2023-09-05 09:00+00', 'product', 'Private beta opened', null, 'Waitlist of 600 teams'),
    ('prediko', '2026-09-17', '2026-09-17 09:00+00', 'product', 'Launched an AI agent that drafts purchase orders', 'Launched an AI agent for purchase orders', 'Changelog · in beta with 40 brands'),
    ('prediko', '2026-08-25', '2026-08-25 09:00+00', 'event', 'CEO keynote at a DTC operators summit in Amsterdam, Oct 8', null, 'Event listing'),
    ('prediko', '2026-06-16', '2026-06-16 09:00+00', 'website', 'Passed 2,000 brands', null, 'Up from 1,000 last September'),
    ('prediko', '2026-05-26', '2026-05-26 09:00+00', 'linkedin', 'Team passed 50 people', null, 'Founder post, 520 reactions'),
    ('prediko', '2026-03-10', '2026-03-10 09:00+00', 'linkedin', 'Opened a New York office', null, 'US brands are now 40% of revenue'),
    ('prediko', '2026-01-20', '2026-01-20 09:00+00', 'product', 'Multi-warehouse planning', null, 'Changelog'),
    ('prediko', '2025-09-16', '2025-09-16 09:00+00', 'website', 'Passed 1,000 brands', null, 'Homepage counter'),
    ('prediko', '2025-06-03', '2025-06-03 09:00+00', 'event', 'Hosted a stock planning meetup in London', null, '120 operators attended'),
    ('prediko', '2025-03-04', '2025-03-04 09:00+00', 'press', 'Raised a $9M Series A led by Lowmoor Capital', null, 'Press release · {fund} took its pro rata'),
    ('prediko', '2024-11-19', '2024-11-19 09:00+00', 'product', 'NetSuite integration launched', null, 'Changelog'),
    ('prediko', '2024-09-10', '2024-09-10 09:00+00', 'website', 'Passed 500 brands', null, 'Up from 100 a year earlier'),
    ('prediko', '2024-04-23', '2024-04-23 09:00+00', 'linkedin', 'Hired a Head of Customer Success', null, 'Team is now 18'),
    ('prediko', '2024-02-13', '2024-02-13 09:00+00', 'product', 'Forecasts across Amazon and wholesale', null, 'Every sales channel in one plan'),
    ('prediko', '2023-10-03', '2023-10-03 09:00+00', 'website', 'First 100 brands', null, 'Homepage counter'),
    ('prediko', '2023-06-20', '2023-06-20 09:00+00', 'product', 'Shopify app out of beta', null, 'Shopify App Store listing'),
    ('overwatch-ai', '2026-09-16', '2026-09-16 09:00+00', 'event', 'Speaking at an aviation conference in Dublin, Oct 20', 'Speaking at an aviation conference in Dublin', 'Aircraft maintenance track'),
    ('overwatch-ai', '2026-07-07', '2026-07-07 09:00+00', 'linkedin', 'Pilot with a wind farm operator', null, 'Founder post, 140 reactions'),
    ('overwatch-ai', '2026-04-14', '2026-04-14 09:00+00', 'product', 'Works fully offline on rugged tablets', null, 'Changelog'),
    ('overwatch-ai', '2025-12-16', '2025-12-16 09:00+00', 'website', 'First aircraft maintenance customer', null, 'Customers page'),
    ('i-flow', '2026-09-15', '2026-09-15 09:00+00', 'website', 'Passed 100 factory customers', null, 'From first pilot to 100 in 14 months'),
    ('i-flow', '2026-08-21', '2026-08-21 09:00+00', 'linkedin', 'Opened a US office in Chicago', null, 'Hiring for sales and support'),
    ('i-flow', '2026-07-03', '2026-07-03 09:00+00', 'product', '15 new machine connectors released', null, 'CNC, laser and injection molding'),
    ('i-flow', '2026-04-08', '2026-04-08 09:00+00', 'linkedin', 'Passed 50 factory customers', null, 'Founder post, 210 reactions'),
    ('i-flow', '2026-01-13', '2026-01-13 09:00+00', 'product', 'Live dashboards for plant managers', null, 'Changelog'),
    ('i-flow', '2025-07-15', '2025-07-15 09:00+00', 'linkedin', 'First factory pilot went live', null, 'Founder post, 130 reactions'),
    ('i-flow', '2024-11-12', '2024-11-12 09:00+00', 'event', 'Exhibited at an automation fair in Nuremberg', null, 'Exhibitor list'),
    ('i-flow', '2024-03-19', '2024-03-19 09:00+00', 'website', 'New website with a waitlist', null, '40 manufacturers signed up'),
    ('nukleas', '2026-09-14', '2026-09-14 09:00+00', 'website', 'New website and product tour', null, 'Homepage and demo video'),
    ('nukleas', '2026-06-09', '2026-06-09 09:00+00', 'fund', 'Investment closed: $350k at pre-seed', null, 'Announced on LinkedIn and the website'),
    ('telekinesis', '2026-09-11', '2026-09-11 09:00+00', 'event', 'Exhibiting at an automation fair in Stuttgart, Oct 6', 'Exhibiting at an automation fair in Stuttgart', 'Exhibitor list'),
    ('telekinesis', '2026-08-18', '2026-08-18 09:00+00', 'product', 'Released a bin picking skill', null, 'Changelog · works with 3 robot brands'),
    ('telekinesis', '2026-06-23', '2026-06-23 09:00+00', 'linkedin', 'Pilot with an automotive supplier', null, 'Founder post, 260 reactions'),
    ('telekinesis', '2026-04-21', '2026-04-21 09:00+00', 'event', 'Live demo at an industrial trade fair in Hannover', null, 'Event listing'),
    ('telekinesis', '2025-12-09', '2025-12-09 09:00+00', 'press', 'Raised a $3.2M seed round', null, 'Press release · {fund} joined the round'),
    ('telekinesis', '2025-06-10', '2025-06-10 09:00+00', 'product', 'Robotics cloud private beta', null, '8 manufacturers onboarded'),
    ('telekinesis', '2024-11-05', '2024-11-05 09:00+00', 'linkedin', 'Moved into a robotics lab in Darmstadt', null, 'Founder post, 75 reactions'),
    ('granter', '2026-09-10', '2026-09-10 09:00+00', 'product', 'Launched public beta', null, '2,400 teams invited from the waitlist'),
    ('granter', '2026-08-28', '2026-08-28 09:00+00', 'fund', 'Investment closed: $400k at pre-seed', null, 'Announced on LinkedIn and the website'),
    ('trissino', '2026-09-09', '2026-09-09 09:00+00', 'product', 'Battlecards now update themselves in Salesforce', 'Battlecards now update in Salesforce', 'Changelog'),
    ('trissino', '2026-08-20', '2026-08-20 09:00+00', 'linkedin', 'Hired a founding account executive', null, 'Team is now 9'),
    ('trissino', '2026-06-02', '2026-06-02 09:00+00', 'press', 'Raised a $4.5M seed round led by Fernhollow Capital', null, 'Press release · {fund} took its pro rata'),
    ('trissino', '2026-03-17', '2026-03-17 09:00+00', 'website', 'Customer page lists 60 B2B sales teams', null, 'Up from 12 in the fall'),
    ('trissino', '2025-11-04', '2025-11-04 09:00+00', 'product', 'Launched on Product Hunt', null, '#3 Product of the Week'),
    ('motics', '2026-09-08', '2026-09-08 09:00+00', 'website', 'Added an enterprise pricing tier', null, 'SSO, audit logs, unlimited seats'),
    ('motics', '2026-08-12', '2026-08-12 09:00+00', 'linkedin', 'Two hospital groups went live', null, '200+ clinicians onboarded'),
    ('motics', '2026-06-30', '2026-06-30 09:00+00', 'product', 'Referral letters in one click', null, 'Changelog'),
    ('imaginario', '2026-09-07', '2026-09-07 09:00+00', 'linkedin', 'Signed a European broadcaster', null, 'Founder post, 310 reactions'),
    ('imaginario', '2026-07-28', '2026-07-28 09:00+00', 'product', 'Archive search API launched', null, 'Developer docs and a free tier'),
    ('imaginario', '2026-02-17', '2026-02-17 09:00+00', 'event', 'Demo at a broadcast technology conference in London', null, 'Event listing'),
    ('imaginario', '2025-10-07', '2025-10-07 09:00+00', 'product', 'Clips resized for every social format', null, 'Changelog'),
    ('imaginario', '2025-03-18', '2025-03-18 09:00+00', 'website', 'Customer page lists 30 media brands', null, 'Customers page'),
    ('kindred-voice', '2026-09-04', '2026-09-04 09:00+00', 'linkedin', 'Now answering tenants for 5,000 rental units', 'Answering tenants for 5,000 rental units', 'Founder post, 230 reactions'),
    ('kindred-voice', '2026-07-21', '2026-07-21 09:00+00', 'product', 'Maintenance requests handled end to end by voice', null, 'Changelog'),
    ('kindred-voice', '2026-03-31', '2026-03-31 09:00+00', 'website', 'Self-serve plan for small landlords', null, 'Pricing page'),
    ('siftyml', '2026-09-03', '2026-09-03 09:00+00', 'linkedin', 'Opened a Rotterdam office', null, 'Team of 4, hiring 2 more'),
    ('siftyml', '2026-08-14', '2026-08-14 09:00+00', 'product', 'Customs classification module shipped', null, 'Changelog'),
    ('siftyml', '2026-07-22', '2026-07-22 09:00+00', 'press', 'Featured in a freight trade publication', null, 'Interview with the CEO'),
    ('meridyan', '2026-09-01', '2026-09-01 09:00+00', 'event', 'Speaking at a payments conference in Frankfurt, Oct 14', 'Speaking at a payments conference in Frankfurt', 'Event listing'),
    ('meridyan', '2026-06-30', '2026-06-30 09:00+00', 'linkedin', 'First bank signed up for a paid pilot', null, 'Founder post, 180 reactions'),
    ('meridyan', '2026-05-19', '2026-05-19 09:00+00', 'fund', 'Investment closed: $450k at pre-seed', null, 'Announced on LinkedIn and the website'),
    ('volumes', '2026-08-31', '2026-08-31 09:00+00', 'website', 'Opened a design partner program', null, 'For robotics teams · waitlist on the website'),
    ('volumes', '2026-03-03', '2026-03-03 09:00+00', 'fund', 'Investment closed: $250k at pre-seed', null, 'Announced on LinkedIn'),
    ('complok', '2026-08-30', '2026-08-30 09:00+00', 'website', 'Completed SOC 2 Type II', null, 'Trust page updated'),
    ('complok', '2026-08-06', '2026-08-06 09:00+00', 'linkedin', 'Signed its first bank customer', null, 'Founder post, 210 reactions'),
    ('complok', '2026-06-18', '2026-06-18 09:00+00', 'product', 'Regulatory rules engine launched', null, 'Changelog'),
    ('rhenari', '2026-08-26', '2026-08-26 09:00+00', 'product', '#2 Product of the Day on Product Hunt', null, '1,268 upvotes'),
    ('rhenari', '2026-08-02', '2026-08-02 09:00+00', 'linkedin', 'Hired a founding engineer', null, 'Team is now 5'),
    ('rhenari', '2026-07-15', '2026-07-15 09:00+00', 'website', 'Jira and Slack integrations live', null, 'Integrations page'),
    ('harvest', '2026-08-21', '2026-08-21 09:00+00', 'linkedin', 'Hiring 4 engineers', null, 'Roles posted on LinkedIn'),
    ('harvest', '2026-08-05', '2026-08-05 09:00+00', 'product', 'Launched a public API', null, 'Docs published'),
    ('harvest', '2026-07-09', '2026-07-09 09:00+00', 'website', 'Customer logos added to the homepage', null, '14 logos'),
    ('reeler', '2026-08-11', '2026-08-11 09:00+00', 'website', 'Case study with a Nordic fashion retailer', null, 'Customers page'),
    ('reeler', '2026-06-09', '2026-06-09 09:00+00', 'product', 'TikTok and Instagram publishing', null, 'Changelog'),
    ('reeler', '2026-03-24', '2026-03-24 09:00+00', 'linkedin', 'Hired a Head of Sales for Germany', null, 'Founder post, 120 reactions'),
    ('reeler', '2025-10-21', '2025-10-21 09:00+00', 'event', 'Talk at a retail marketing conference in Stockholm', null, 'Event listing'),
    ('reeler', '2025-05-13', '2025-05-13 09:00+00', 'press', 'Raised a €2.5M seed round', null, 'Press release'),
    ('reeler', '2024-09-24', '2024-09-24 09:00+00', 'product', 'Shoppable video widgets launched', null, 'Changelog'),
    ('profit-optimizer', '2026-08-04', '2026-08-04 09:00+00', 'linkedin', 'Signed a building supplies distributor in Austria', 'Signed a building supplies distributor', 'Founder post, 64 reactions'),
    ('profit-optimizer', '2026-05-20', '2026-05-20 09:00+00', 'product', 'SAP Business One connector', null, 'Changelog'),
    ('profit-optimizer', '2025-11-18', '2025-11-18 09:00+00', 'event', 'Pitched at a CEE startup summit', null, 'Event listing'),
    ('hylosense', '2026-09-20', '2026-09-20 09:00+00', 'monitor', 'No website, blog or changelog changes in 9 weeks', 'No public activity since July 18', 'Flagged as quiet. Not shown anywhere public.'),
    ('hylosense', '2026-07-18', '2026-07-18 09:00+00', 'product', 'Forecasting v2 released', null, 'Changelog'),
    ('hylosense', '2026-06-02', '2026-06-02 09:00+00', 'linkedin', 'Two engineers joined', null, 'Team is now 7'),
    ('hylosense', '2026-02-24', '2026-02-24 09:00+00', 'linkedin', 'Signed a utility in Greece', null, 'Founder post, 95 reactions'),
    ('hylosense', '2025-09-30', '2025-09-30 09:00+00', 'product', 'Solar forecasts added alongside wind', null, 'Changelog'),
    ('avido', '2026-09-22', '2026-09-22 09:00+00', 'fund', 'Investment closed: $500k at pre-seed', 'Investment closed', 'Announcement drafted in Public Presence')
  ) as v(slug, occurred_on, detected_at, source, text, headline, note)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug;

  insert into public.applications (fund_id, company_id, status, round_stage, round_usd, traction, team, source, referrer, received_at, origin)
  select p_fund, c.id, v.status, v.round_stage, v.round_usd::numeric, v.traction, v.team, v.source, v.referrer, v.received_at::timestamptz, 'seed'
  from (values
    ('papr', 'meeting', 'Seed', 4000000, '5 design partners, 2 paying', '2 founders, ex-AI infrastructure', 'intro', 'Complok founders', '2026-09-09 10:00+00'),
    ('stemma', 'meeting', 'Seed', 3000000, '$120k ARR', '2 founders, ex-claims handling and ML', 'website', null, '2026-09-09 10:00+00'),
    ('fopsai', 'screened', 'Seed', 2500000, '$310k ARR, 14 customers', '2 founders, ex-bank operations and ML', 'website', null, '2026-09-16 10:00+00'),
    ('insaio', 'screened', 'Seed', 3000000, '$180k ARR, 22 teams', '2 founders, ex-insurance and conversational AI', 'intro', 'Greyline Capital', '2026-09-16 10:00+00'),
    ('linesight', 'screened', 'Pre-seed', 1800000, '3 paying service centers', '3 founders, ex-steel operations and AI', 'website', null, '2026-09-14 10:00+00'),
    ('auxilius', 'screened', 'Seed', 2000000, '$140k ARR, 9 customers', '2 founders, ex-audit and platform engineering', 'website', null, '2026-09-20 10:00+00'),
    ('indora', 'screened', 'Seed', 3500000, '$210k ARR', '2 founders, ex-healthcare data and security', 'website', null, '2026-09-19 10:00+00'),
    ('alethica', 'screened', 'Pre-seed', 1000000, '35 litigation teams on free trial', 'Solo founder, ex-litigator', 'website', null, '2026-09-18 10:00+00'),
    ('vocations', 'screened', 'Seed', 2500000, '4 design partners', '2 founders, ex-staffing and data', 'website', null, '2026-09-17 10:00+00'),
    ('fintalo', 'inbound', 'Pre-seed', 1200000, 'Pilots with 3 deal teams', '2 founders, ex-M&A advisory', 'website', null, '2026-09-23 08:00+00'),
    ('litlyx', 'inbound', 'Seed', 3000000, '$90k ARR', '2 founders, ex-data engineering', 'intro', 'a portfolio founder', '2026-09-22 10:00+00'),
    ('wattshift', 'inbound', 'Pre-seed', 1500000, 'LOI with one utility', '3 founders, ex-utilities and IoT', 'website', null, '2026-09-23 05:00+00'),
    ('1cp', 'inbound', 'Pre-seed', 1500000, '2 paying mid-market customers', '2 founders, ex-procurement and payments', 'website', null, '2026-09-23 07:00+00'),
    ('legaleaze', 'inbound', 'Pre-seed', 1500000, '$20k ARR', '2 founders, ex-legal operations', 'website', null, '2026-09-23 06:00+00'),
    ('humbrela', 'inbound', 'Pre-seed', 1000000, '12 brokers on a waitlist', '2 founders, ex-insurance brokerage', 'website', null, '2026-09-23 04:00+00'),
    ('gild', 'inbound', 'Pre-seed', 2000000, 'Pilot with one contractor', '2 founders, ex-construction and HR tech', 'website', null, '2026-09-23 02:00+00'),
    ('crosscheck', 'inbound', 'Pre-seed', 800000, 'Waitlist of 400', 'Solo founder, ex-sustainability audits', 'website', null, '2026-09-23 09:30+00'),
    ('safetybolt', 'inbound', 'Pre-seed', 1000000, 'Pre-launch', '2 founders, ex-structural engineering', 'website', null, '2026-09-23 09:00+00'),
    ('arcus', 'inbound', 'Pre-seed', 1500000, 'Clinical pilot, 60 patients', '2 founders, ex-dentistry and imaging', 'website', null, '2026-09-23 01:00+00')
  ) as v(slug, status, round_stage, round_usd, traction, team, source, referrer, received_at)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug;

  insert into public.screenings (fund_id, application_id, rubric_id, score, scores, why, risks, origin)
  select p_fund, a.id, v_rubric, v.score, v.scores::jsonb, v.why, v.risks, 'seed'
  from (values
    ('papr', 90, '{"team": 95, "market": 90, "traction": 78, "fit": 92}', array['Memory is the missing layer for agents', 'Design partners already converting to paid', 'Technical team shipping weekly'], array['Model providers may add native memory', 'Pricing not settled']),
    ('stemma', 87, '{"team": 88, "market": 84, "traction": 80, "fit": 90}', array['Clear, measurable ROI for insurers', 'Revenue within a year of launch', 'Founders know claims from the inside'], array['Long insurer procurement cycles']),
    ('fopsai', 92, '{"team": 94, "market": 88, "traction": 90, "fit": 95}', array['Revenue tripled in 6 months', 'Ops leaders with budget and urgency', 'Technical co-founder shipped ML at scale'], array['Incumbents are adding AI matching', 'Customer concentration: top 2 = 40% ARR']),
    ('insaio', 88, '{"team": 90, "market": 84, "traction": 86, "fit": 90}', array['Used in every customer conversation', 'Founders sold to insurers before'], array['Regulators are watching AI advice closely']),
    ('linesight', 86, '{"team": 88, "market": 86, "traction": 78, "fit": 88}', array['Huge manual planning workflow', 'Paid pilots converted 3 of 3'], array['Vertical sales motion']),
    ('auxilius', 81, '{"team": 84, "market": 80, "traction": 76, "fit": 86}', array['Paying customers within 6 months', 'Complements Complok without overlap', 'Founders have sold to this buyer'], array['Long enterprise sales cycles']),
    ('indora', 79, '{"team": 82, "market": 85, "traction": 74, "fit": 78}', array['Every regulated AI team needs this', 'Revenue growing 18% monthly'], array['Well-funded competitors']),
    ('alethica', 77, '{"team": 70, "market": 74, "traction": 80, "fit": 82}', array['Strong bottom-up adoption', 'Very capital efficient'], array['Solo founder', 'Monetization unproven']),
    ('vocations', 74, '{"team": 80, "market": 70, "traction": 62, "fit": 78}', array['Technical founders in a growing niche'], array['Early traction only']),
    ('fintalo', 67, '{"team": 70, "market": 62, "traction": 55, "fit": 78}', array['Clear pain for deal teams', 'Founders lived the problem'], array['Pilots are unpaid']),
    ('litlyx', 66, '{"team": 68, "market": 58, "traction": 66, "fit": 72}', array['Early revenue', 'Product-led motion'], array['Crowded analytics market']),
    ('wattshift', 63, '{"team": 72, "market": 68, "traction": 40, "fit": 60}', array['Regulation creates urgency', 'Strong domain founders'], array['Outside core B2B SaaS focus', 'No revenue yet']),
    ('1cp', 61, '{"team": 64, "market": 60, "traction": 58, "fit": 62}', array['Early paying customers'], array['Crowded spend management market']),
    ('legaleaze', 58, '{"team": 62, "market": 52, "traction": 55, "fit": 60}', array['Early revenue'], array['Many alternatives']),
    ('humbrela', 56, '{"team": 60, "market": 54, "traction": 48, "fit": 58}', array['Brokers asked for it'], array['No product usage yet']),
    ('gild', 55, '{"team": 64, "market": 58, "traction": 40, "fit": 50}', array['Large, underserved workforce'], array['Very early pilot', 'Round is large for the traction']),
    ('crosscheck', 52, '{"team": 55, "market": 50, "traction": 42, "fit": 58}', array['Clear, narrow use case'], array['Waitlist not yet converting']),
    ('safetybolt', 47, '{"team": 58, "market": 40, "traction": 30, "fit": 44}', array['Experienced in infrastructure'], array['Outside thesis: hardware', 'No product yet']),
    ('arcus', 44, '{"team": 56, "market": 48, "traction": 30, "fit": 36}', array['Clinical pilot completed'], array['Outside thesis: consumer health', 'Regulatory path unclear'])
  ) as v(slug, score, scores, why, risks)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug
  join public.applications a on a.fund_id = p_fund and a.company_id = c.id;

  insert into public.meetings (fund_id, company_id, application_id, starts_at, format, status, origin)
  select p_fund, c.id, a.id, v.starts_at::timestamptz, v.format, 'scheduled', 'seed'
  from (values
    ('papr', '2026-09-29 14:00+00', 'video'),
    ('stemma', '2026-10-01 10:30+00', 'office')
  ) as v(slug, starts_at, format)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug
  join public.applications a on a.fund_id = p_fund and a.company_id = c.id;

  -- Two drafts waiting for approval and three published posts, each tied to
  -- the signal it announces.
  insert into public.posts (fund_id, company_id, signal_id, type, status, body, tags, image, site_entry, site_note, channels, published_at, published_by, stats, origin, created_at)
  select p_fund, c.id, s.id, v.type, v.status, v.body, v.tags, v.image::jsonb, v.site_entry::jsonb, v.site_note, v.channels,
    v.published_at::timestamptz, v.published_by, v.stats::jsonb, 'seed', v.created_at::timestamptz
  from (values
    ('sourcery', '2026-09-23', 'press', 'raise', 'draft',
     E'Huge congratulations to the @Sourcery team on their $12M Series A, led by Greyline Capital.\n\nWhen we first backed Sourcery, it was a refactoring plugin for Python. Today it reviews code for 1,500+ engineering teams, and the product gets sharper every week.\n\nProud to keep building with you.',
     array['VentureCapital', 'SeriesA', 'DeveloperTools', 'AI'],
     '{"kicker": "Series A", "title": "Sourcery raises $12M Series A", "sub": "Led by Greyline Capital. {fund} backed the team at seed.", "bg": "#1c2638"}',
     '{"kicker": "Sep 2026 · Series A", "title": "Sourcery raises $12M", "body": "AI code review for engineering teams."}',
     'Adds to Recent. Updates stage to Series A.',
     array['linkedin', 'website'],
     null,
     null,
     '{}',
     '2026-09-23 08:00+00'),
    ('avido', '2026-09-22', 'fund', 'invest', 'draft',
     E'We''re thrilled to welcome @Avido to the {fund} portfolio.\n\nEvery bank shipping generative AI needs a way to prove it''s safe. Avido makes that a product: test, monitor and govern AI applications before and after they go live.\n\nWelcome aboard.',
     array['VentureCapital', 'PreSeed', 'AI', 'Fintech'],
     '{"kicker": "New investment", "title": "Welcome to the portfolio, Avido", "sub": "Testing and monitoring for AI in banking · Pre-seed", "bg": "#2c3f5c"}',
     '{"kicker": "Sep 2026 · New investment", "title": "{fund} invests in Avido", "body": "Testing and monitoring for AI in banking."}',
     'Adds to Recent and the portfolio page.',
     array['linkedin', 'website'],
     null,
     null,
     '{}',
     '2026-09-22 12:00+00'),
    ('ekei', '2026-09-22', 'event', 'event', 'published',
     'Catch Ekei''s co-founder on the supply chain & AI track at Web Summit in Lisbon on Nov 11. If you move freight in Europe, it''s a talk worth your time.',
     '{}'::text[],
     null,
     null,
     null,
     array['linkedin'],
     '2026-09-22 10:00+00',
     'auto',
     '{"reactions": 86, "comments": 7}',
     '2026-09-22 09:00+00'),
    ('i-flow', '2026-09-15', 'website', 'milestone', 'published',
     'i-flow just passed 100 factory customers. From first pilot to 100 in 14 months.',
     '{}'::text[],
     null,
     '{"kicker": "Sep 2026 · Milestone", "title": "i-flow passes 100 factories", "body": "Factory machine data, ready for AI."}',
     null,
     array['linkedin', 'website'],
     '2026-09-15 10:00+00',
     'auto',
     '{"reactions": 142, "comments": 11}',
     '2026-09-15 09:00+00'),
    ('granter', '2026-08-28', 'fund', 'invest', 'published',
     'We''re excited to back Granter, the AI agent that turns weeks of grant applications into an afternoon.',
     '{}'::text[],
     null,
     '{"kicker": "Aug 2026 · New investment", "title": "{fund} invests in Granter", "body": "AI agent that writes grant applications."}',
     null,
     array['linkedin', 'website'],
     '2026-08-28 14:00+00',
     'partner',
     '{"reactions": 318, "comments": 24}',
     '2026-08-28 09:00+00')
  ) as v(slug, signal_on, signal_source, type, status, body, tags, image, site_entry, site_note, channels, published_at, published_by, stats, created_at)
  join public.companies c on c.fund_id = p_fund and c.slug = v.slug
  join public.signals s on s.fund_id = p_fund and s.company_id = c.id and s.occurred_on = v.signal_on::date and s.source = v.signal_source;
end;
$$;


-- Puts every demo fund back to its seed. Runs with the caller's rights, so it
-- can only ever touch funds the caller may edit, and the lock keeps two resets
-- from interleaving.
create function public.reset_demo()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  f uuid;
begin
  perform pg_advisory_xact_lock(hashtext('associate.reset_demo'));
  for f in select id from public.funds where is_demo loop
    -- Companies take their applications, screenings, meetings, investments
    -- and signals with them.
    delete from public.posts where fund_id = f;
    delete from public.messages where fund_id = f;
    delete from public.companies where fund_id = f;
    delete from public.rubrics where fund_id = f;
    delete from public.automation_rules where fund_id = f;
    perform private.seed_demo(f);
  end loop;
end;
$$;

revoke all on function private.seed_demo(uuid) from public, anon, authenticated;
revoke all on function public.reset_demo() from public, anon, authenticated;
grant execute on function private.seed_demo(uuid) to anon, authenticated, service_role;
grant execute on function public.reset_demo() to anon, authenticated, service_role;


insert into public.funds (slug, name, vehicle, website, size_usd, focus, tagline, linkedin_followers, timezone, stats, is_demo)
values (
  'pilot-ventures', 'Pilot Ventures', 'Fund I', 'pilot.vc', 40000000,
  'Pre-seed and seed · US and Europe', 'We back technical founders building B2B software.', 4812, 'UTC',
  '{"month_screened": 1284, "month_passed": 1153}', true
);

select private.seed_demo(id) from public.funds where slug = 'pilot-ventures';
