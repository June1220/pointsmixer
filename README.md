# PointsMixer — Bring-Your-Own-Flight Transfer Mixer

You already found a confirmed award flight on a tool like PointsYeah. PointsMixer is a
financial allocation engine: give it the airline program, the points cost, and your credit
card balances, and it computes the mathematically optimal way to transfer your points to fund
it — without stranding points or wasting your most valuable flexible currencies.

## Stack
- **Next.js 14** (App Router), React, Tailwind CSS, lucide-react icons
- **No external API, no API key, no per-call cost.** The allocation runs as deterministic
  JavaScript against a local transfer-partner database.

## Two ways in
- **Search flights** (destination-first): enter origin → destination + date + cabin. The app
  pulls real cash fares (Duffel), maps each operating carrier to the loyalty programs that
  could book it (its own + same-alliance), **estimates** the miles each would charge, runs the
  allocation engine per option, and **ranks** them by points-vs-cash value.
- **I already know my flight** (bring-your-own-flight): the original flow — enter program,
  points cost, cash price, and balances → exact transfer blueprint.

> ⚠️ **Award mile costs are ESTIMATES.** Airlines don't publish award prices via any open API,
> and most price dynamically. The estimator (`app/lib/awardEstimator.js` + data in
> `app/data/awardCharts.js`) gives a *ballpark from published charts/heuristics* so options can
> be ranked — it is NOT live award availability. Always confirm real space and price on the
> airline/bank site before transferring. A paid award API (e.g. seats.aero) can later replace
> `estimateAwardCost()` without touching the rest of the app.

### Flight data (Duffel) — optional
Cash fares + operating carriers come from the **Duffel API**. The provider is isolated in
`app/lib/duffel.js` (the orchestrator imports `searchFlights` from there), so swapping vendors
is a one-file change. Set the token as an env var (never commit it) — copy
`.env.local.example` → `.env.local`, and in Vercel set it under Project → Settings →
Environment Variables:
```
DUFFEL_ACCESS_TOKEN=duffel_live_...   # test tokens start with duffel_test_
```
**Without a token, `/api/search` returns a "connect the API" state** — it never fabricates
flights. ⚠️ Duffel **test** tokens mostly return the fictional "Duffel Airways" (maps to no
loyalty program → "no fundable options"); use a **live** token to see real carriers.

## How it works
The rules (which bank transfers to which airline, the ratios, the priority order) are pure
logic — so there's no need for an LLM at runtime. Instead:

- **`app/data/transferPartners.js`** — the single **source of truth**. EVERY fact and
  judgment call the engine relies on lives here, each with a dated/sourced comment:
  - `programs` — every bank, its airline partners, and the transfer ratio for each
    (1:1, 5:4, 4:3, 5:3, 1:1.6, …), plus optional per-partner `feePerPoint`, `days`,
    `bonus`/`expires`, and `note`.
  - `pointValues` (+ `valuationsAsOf`, `defaultPointValue`) — the $/point worth of each
    currency. **These drive which currency is spent first**, and they're estimates — edit
    to taste.
  - `alliances` — Star / SkyTeam / Oneworld membership (powers the alliance hint).
  - `transferIncrements`, `exciseFeePerPoint`, `exciseFeeCap` — transfer mechanics & fees.
  - `redemptionTiers` — ¢/mile thresholds for the "good deal vs. pay cash" verdict.
  - `lastUpdated` / `valuationsAsOf` — dates shown in the UI.
- **`app/lib/engine.js`** — pure logic, **no baked-in facts**. It imports everything above and
  minimizes the **dollar value of points spent**: it sorts banks by `(pointValue + fee) /
  effectiveRatio` and greedily fills (provably optimal for a single target program), applying:
  - **Rule A** — never transfer more than the exact amount needed (rounded to increments).
  - **Rule B/C** — burn cheapest-dollar currencies first; Chase UR & Bilt sit last *because
    their `pointValues` are highest*, not via a hardcoded rule.
  - Direct miles applied first; same-alliance holdings flagged; cash-price → redemption verdict.
- **`app/api/calculate/route.js`** — thin endpoint that validates input and calls the engine.

### Keeping the data fresh
Transfer partnerships change a few times a year. When they do, ask Claude Code:

> "refresh the PointsMixer transfer data"

It will verify against the banks' official transfer-partner pages and edit
`app/data/transferPartners.js` (and bump `lastUpdated`). Nothing else needs to change.

The same applies to the *valuations* and *thresholds*. Ask Claude Code:

> "refresh the PointsMixer point valuations"   — re-checks published $/point values, edits
> `pointValues`, bumps `valuationsAsOf`.

Every number the engine acts on is a dated fact in that one file — none are hardcoded in logic.

**Transfer data last verified: 2026-05-31.** Notable current facts baked in:
- Chase no longer transfers to Emirates.
- Amex–Etihad partnership ends **June 30, 2026**.
- Citi added **American Airlines** (1:1); Capital One added Qatar + Japan Airlines.
- Bilt expanded (United, Southwest, Alaska/Atmos, Spirit…) but still **does not** do American.
- Non-1:1 ratios handled (e.g. Amex→Cathay/Emirates 5:4, Capital One→Emirates/EVA/JAL 4:3).

> ⚠️ Award programs change pricing and partners frequently. Always confirm award space and
> current ratios on the airline/bank sites before transferring — transfers are irreversible.

## Setup
```bash
cd pointsmixer
npm install
npm run dev      # http://localhost:3000
```
No `.env` / API key required.

## Files
```
app/
  layout.js                  root layout + fonts
  globals.css                Tailwind + theme
  page.js                    two-column dashboard (input ledger + output blueprint)
  data/transferPartners.js   SOURCE OF TRUTH — edit this when partners change
  lib/engine.js              deterministic allocation engine
  api/calculate/route.js     validates input → calls the engine
dev-server.js                launcher used by the preview tooling (chdir + next dev)
```
