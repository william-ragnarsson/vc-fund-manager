# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## The goal

Associate is becoming a VC fund manager: software that takes over everything in running a fund except raising the money. Raising is a networking problem, so it stays with the partners, and the rest is Associate's job. So far the demo covers three parts of that job:
- screening inbound deal flow against the fund's thesis
- tracking portfolio companies from public signals
- keeping the fund's website and LinkedIn up to date

## Where it is now

It is a demo, made to show an investor the idea and its potential. It runs a fictional fund, Pilot Ventures, on hardcoded seed data in `src/data/seed.ts`. The companies are real, taken from the public Techstars portfolio. Everything else is invented, from rounds and scores to investors and posts.

The demo can get as elaborate as it needs, including a working backend. Whatever it gains, one button brings everything back to the original hardcoded state, so every pitch starts from the same story. Today that button is the "Reset demo" chip. It refills the in-memory store (`src/app/store.tsx`) from the seed, and opening `#/demo` does the same.

## Working on it

- `npm run dev` runs the demo.
- `npm run build` type-checks and packs the whole demo into one self-contained file, `dist/associate-demo.html`. It opens from disk and can be sent as is.
- There are no tests yet, so check changes in the browser.
- The guided tour (`src/tour/Tour.tsx`) and the landing page retell parts of the seed story, such as FopsAI's score and Sourcery's Series A. A few counts also appear in more than one place. When a seed fact changes, search for where else it's told.
- `?fund=Name` shows the demo under another fund's name, so text that names the fund comes from `FUND` in `src/config.ts`.
- The demo's today is fixed (`TODAY` in `src/config.ts`). Signal dates, "3 weeks ago" and who counts as quiet are counted from it, not from the clock.
- `README.md` lists the pages and explains how to present the demo.
