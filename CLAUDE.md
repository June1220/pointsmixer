# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build — run this to verify changes compile
npm run lint     # ESLint via Next.js
```

No test suite exists. Use `npm run build` as the correctness gate before finishing any task.

Duffel API (optional — live flight search only):
```
cp .env.local.example .env.local
# add DUFFEL_ACCESS_TOKEN=duffel_live_...
```
The app works fully without it; the search tab shows a "connect the API" state.

## Architecture

### Two user flows
- **Judge & plan** (`mode = "manual"`) — user pastes a known award: program, miles, cash price, balances → engine returns exact transfer blueprint.
- **Live search** (`mode = "search"`) — origin/destination/date → Duffel returns cash fares → estimator guesses miles per program → engine ranks by value.

### Data layer (`app/data/`)

`transferPartners.js` is the **single source of truth** for every fact the engine uses. Nothing is hardcoded in logic files.

| Export | What it controls |
|--------|-----------------|
| `programs` | Bank → airline partners, transfer ratios, fees, bonuses |
| `pointValues` | $/point per bank — **this determines burn order**, not any hardcoded rule |
| `awardPegCents` | ¢/mile estimates for dynamic programs (used by estimator only) |
| `carrierSurcharges` | YQ/YR fees per airline + route |
| `redemptionTiers` | ¢/mile thresholds for good/fair/weak verdict |
| `getPointValue(bank)` | Scalar accessor — use this, not `.value` directly |
| `getAwardPeg(program)` | Scalar accessor — use this, not `.mid` directly |
| `getAwardPegRange(program)` | Returns `{low, mid, high}` from the p25/mid/p75 distribution |
| `getActiveBonus(partner)` | Returns 0 if bonus is missing or `expires` date has passed |

`awardCharts.js` contains:
- `programMeta` — chart class (`"zone"` / `"distance"` / `null`), `rtOnly`, `dataConfidence`, `sourceUrl`, `partnerNote` per program
- Zone charts for 10 fixed programs (ANA, Aeroplan, Alaska, Avianca, Singapore, JAL, Qantas, TAP, Thai, Korean Air)
- `aviosBands` — distance-based chart for BA / Iberia / Aer Lingus
- `airportRegion` — IATA → region mapping for zone lookups

`dynamicRanges.js` — observed low/typical/high ranges for dynamic programs. `dynamicRangeSources` maps each program to 2–3 publisher URLs for AI refresh.

`fareBands.js` — historical cash fare ballparks by region pair × cabin (not live prices).

### Estimation pipeline (`app/lib/awardEstimator.js`)

Three-class lookup in `estimateAwardCost()`:
- **Class A (zone)** — region-pair lookup against the program's zone chart
- **Class B (distance)** — great-circle miles → Avios distance band
- **Class C (heuristic)** — `cashPrice / awardPegCents[program]`; returns `pointsRange: {low, high}` from the p25/p75 distribution

Returns `{ points, pointsRange, basis, confidence, dataConfidence, rtOnly, note, source }`.

`confidence` comes from two sources: `"official"` charts get `"high"`, cross-referenced get `"medium"`, heuristics get `"low"`. `dataConfidence` from `programMeta` flows into this.

### Allocation engine (`app/lib/engine.js`)

Pure deterministic logic — no data baked in. Strategy: sort transfer paths by `(pointValue + feePerPoint) / effectiveRatio` (cheapest dollar-per-mile first), greedily allocate to fill the target. Applies `getActiveBonus()` — never reads `p.bonus` directly.

Key invariants:
- Direct miles always applied first, at zero transfer cost
- Amounts rounded up to `transferIncrements[bank]`
- Bilt/Chase sort last because their `pointValues` are highest — not a hardcoded preserve rule
- `effectiveRatio = ratio * (1 + getActiveBonus(partner))`

### API routes
- `POST /api/calculate` — validates input, calls engine, returns blueprint
- `POST /api/search` — validates input, calls Duffel + searchPlanner, returns ranked candidates
- `POST /api/data-refresh` — calls Duffel for median cash fares on a list of routes; used by the weekly AI refresh session to sample peg cents

### Session persistence (`app/page.js`)

All form state persists to `localStorage["pointsmixer_v1"]`. **Critical pattern**: state is initialized with blank defaults (matching SSR output), then a `useEffect(() => { ...restore... }, [])` applies saved values post-hydration. Do NOT use lazy `useState(() => loadSession())` — that causes a hydration mismatch because `localStorage` is undefined on the server.

A debounced `useEffect` (400ms) saves all state on every change.

## Data refresh system

Three runbooks in the repo root:

| File | Purpose |
|------|---------|
| `WEEKLY_REFRESH.md` | Master weekly prompt — paste into a Claude session to refresh all data sources. Tiered: weekly (bonuses, partnerships), monthly (valuations, surcharges, dynamic ranges), quarterly (award charts). |
| `REFRESH_PROMPT.md` | Detailed prompt for the three editorial data categories: point valuations (multi-source average), award peg cents (blog-mining), transfer bonuses. |
| `REFRESH.md` | Human-readable checklist with canonical source URLs per file. |

`data-refresh-staging.json` — accumulates blog-mined CPP samples between sessions. When a program reaches ≥8 samples, the `p25/mid/p75` distribution is written to `awardPegCents` in `transferPartners.js`.

### Source URL convention

Every data entry that can go stale has a machine-readable `sourceUrl`:
- `programMeta[program].sourceUrl` (awardCharts.js)
- `carrierSurcharges[airline].sourceUrl` (transferPartners.js)
- `pointValues[bank].sources[].url` (transferPartners.js)
- `dynamicRangeSources[program][].url` (dynamicRanges.js)
- `fareBandsSources[].url` (fareBands.js)

The weekly refresh prompt reads these from the data files — it doesn't rely on hardcoded URLs in the prompt itself.

## Key constraints

- **Transfers are irreversible** — the UI always surfaces this. Never compute a blueprint that transfers more than strictly needed.
- ANA (`rtOnly: true`) requires round-trip partner bookings — the engine and UI must never display a one-way saver baseline for ANA partner awards.
- `pointValues` drives burn order. Changing a valuation changes which bank is spent first — treat it as business logic, not cosmetic data.
- Dynamic program estimates are clearly labeled `dataConfidence: "estimate"` and shown with a ⚠ in the UI badge. Do not present them as chart-based.
