# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## The goal

Associate is becoming a VC fund manager: software that takes over everything in running a fund except raising the money. Raising is a networking problem, so it stays with the partners, and the rest is Associate's job.

Everything is automated, and a partner can override any of it by hand from inside Associate, so the fund's work stays in one place. That covers adding or removing a portfolio company, editing a LinkedIn draft or writing one from scratch, logging an event the AI missed, changing the rubric, and so on. Overrides stick when the automation runs again. This is why the code has to be modular: build each action once, for the AI and the partner to use alike.

## The roadmap

Associate is three parts that work together on shared data. A startup can pass through all three: it applies, gets screened, joins the portfolio, gets followed, and its news becomes posts. This is a starting shape, open to change.

**Startup ingestion** (Deal Flow in the demo)
- An application form the fund embeds in its own website, whatever the site is built with. Founders usually send a video with it.
- An AI screener that sorts applications by the fund's rubric (Investment thesis in the demo).
- Emailing applicants through Gmail: rejections, acceptances, meeting setup and next steps.

**Portfolio monitoring**
- An engine that follows every portfolio company through search, about daily, and keeps each company's timeline. The bar is high: the fund should never have to chase a founder for an update.

**Public presence**
- LinkedIn drafts when something happens at a portfolio company, and for moments like announcing a newly accepted batch.
- Keeping the portfolio and news on the fund's website current. The fund has its own site, so this may be embeddable code too, like the form. Not decided yet.

## Where it is now

It started as a demo, made to show an investor the idea and its potential. It runs a fictional fund, Pilot Ventures. The companies are real, taken from the public Techstars portfolio. Everything else is invented, from rounds and scores to investors and posts.

Now it is moving toward the final product. The backend is Supabase: every page reads the fund's data from the database, and every action writes back to it. There is no login yet, so everyone who opens the app shares the demo fund. The demo data, the "Reset demo" chip and the single-file build are demo scaffolding for it to outgrow.

## Working on it

- `npm run dev` runs the demo.
- `npm run build` type-checks and packs the whole demo into one self-contained file, `dist/associate-demo.html`. It opens from disk and can be sent as is, and loads its data over the internet.
- There are no tests yet, so check changes in the browser.
- Branch from `dev` and open PRs against it. `main` is production, since Vercel deploys every push to it, and it only changes when `dev` is merged into it for a release.
- The schema is in `supabase/migrations`, with a new migration for each change. After one, regenerate `src/data/database.types.ts` with the Supabase MCP. `src/data/api.ts` is the only code that talks to the database.
- The demo's data is written by `private.seed_demo` in the `demo_seed` migration, and `reset_demo()` puts it back. To change it, add a migration that replaces the function. The guided tour (`src/tour/Tour.tsx`) and the landing page retell parts of that story, such as FopsAI's score and Sourcery's Series A. A few counts also appear in more than one place. When a seed fact changes, search for where else it's told.
- `?fund=Name` shows the demo under another fund's name, so text that names the fund comes from `FUND` in `src/config.ts`. Stored text says `{fund}` instead, and the app fills it in.
- The demo's today is fixed (`TODAY` in `src/config.ts`). Signal dates, "3 weeks ago" and who counts as quiet are counted from it, not from the clock.
- `README.md` lists the pages and explains how to present the demo.
