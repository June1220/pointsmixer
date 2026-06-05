# PointsMixer — Weekly AI Refresh Prompt

**How to use:** Open a new Claude Code session in this project directory and
paste this file as your first message. Work through each step in order.
Do not write any data file until Step 6 — collect everything first.

**Before starting:** Run the dev server so Duffel cash prices are available:
```
npm run dev
```

---

## YOUR TASK

You are refreshing the PointsMixer data files. Today's date is [INSERT DATE].

---

## STEP 0 — Blog mining for award peg cents samples

This is the core empirical data collection step. Each week adds new samples
to `data-refresh-staging.json`. Every 4 weeks the accumulated samples are
computed into `p25/mid/p75` and written to `transferPartners.js`.

### 0a. Read the staging file

Read `data-refresh-staging.json`. Note:
- `_lastSession` date
- Current sample arrays per program — how many exist, what range of CPP values

### 0b. For each program, fetch and mine its source articles

Read `dynamicRangeSources` from `app/data/dynamicRanges.js`. This gives you
the ordered list of blog URLs to fetch per program.

**For each program, fetch URLs in order until you have found at least 3 new
data points not already in the staging file, or have exhausted all URLs.**

#### Extraction algorithm — apply to every fetched page

Scan the full article text for any sentence or table cell that contains ALL of:
- A mileage number (e.g. "50,000 miles", "75k miles", "45,000 MileagePlus miles")
- A dollar amount representing a cash fare or redemption value
  (e.g. "$3,200 cash fare", "worth $2,800", "a $4,500 ticket")
- Ideally a route or region hint (e.g. "JFK to LHR", "transatlantic business")

**Patterns that qualify (extract all of these):**
```
"booked [ROUTE] in [CABIN] for [MILES] miles — cash fares run $[CASH]"
"[MILES] miles for a $[CASH] [CABIN] ticket"
"at [MILES] miles, you're getting [CPP]¢ per mile on a $[CASH] fare"
"sweet spot: [ROUTE] [CABIN] at [MILES] miles (cash: ~$[CASH])"
"[PROGRAM] charges [MILES] miles for [ROUTE], where cash is $[CASH]"
"redeeming [MILES] miles for [CABIN] to [DEST], valued at $[CASH]"
```

**Patterns that do NOT qualify (skip these):**
```
"points are worth 1.2¢ each"              ← no specific route/miles cited
"you can transfer to get ~$X in value"    ← total value, not per-route
"the portal shows [MILES] for [ROUTE]"    ← portal pricing, not saver
"[MILES] miles + $[CASH] in fees"         ← that's fees, not fare
```

**For each qualifying extraction:**
```json
{
  "program": "United",
  "route": "JFK-LHR",
  "cabin": "business",
  "miles": 70000,
  "cashUSD": 4200,
  "cppActual": 16.67,
  "publisher": "TPG",
  "url": "https://thepointsguy.com/guide/...",
  "articleDate": "2026-05-01",
  "extractedOn": "[TODAY]",
  "quote": "exact sentence from the article"
}
```

`cppActual = miles / cashUSD` (this is miles per dollar, which equals ¢ per mile × 100 / 100 — keep as miles/dollar for math, displayed as ¢/mile = cashUSD / miles × 100)

Wait — correct formula: **`cppActual (¢/mile) = (cashUSD / miles) × 100`**

#### Program priority order (do top 6 every week; rotate the rest)

Week 1 & 5 & 9…:  Flying Blue, United, Delta, AA, Virgin Atlantic, Emirates
Week 2 & 6 & 10…: Flying Blue, United, Turkish, Qatar, Cathay, Etihad
Week 3 & 7 & 11…: Flying Blue, United, JetBlue, Southwest, Finnair, EVA Air
Week 4 & 8 & 12…: Flying Blue, United, Aeromexico, Hawaiian, Spirit + catch-up on any with < 3 samples

Flying Blue and United appear every week because they have the most transfer
partner interest and the most published data.

### 0c. Supplement with Duffel cash prices (if dev server is running)

For any sample where you have a `miles` figure from a blog but the article's
cited `cashUSD` is older than 6 months, replace it with a fresh Duffel price.

POST to `http://localhost:3000/api/data-refresh`:
```json
{
  "routes": [
    { "origin": "JFK", "destination": "LHR", "cabin": "business",
      "dates": ["2026-09-10", "2026-10-15", "2026-11-12"] }
  ]
}
```

Use the returned median `cashUSD` to recompute `cppActual` for that route.
Mark the sample with `"cashSource": "duffel"` to distinguish from blog-cited prices.

### 0d. Append new samples to staging file

Add all new extracted samples to the correct program array in
`data-refresh-staging.json`. Do not overwrite existing entries.
Update `_lastSession` to today's date.

### 0e. If 4+ weeks of samples exist — compute peg cents distribution

Check: does any program in the staging file have ≥ 8 samples?
If yes, for that program:
1. Sort all `cppActual` values ascending
2. Compute: `p25 = value at 25th percentile`, `mid = median`, `p75 = value at 75th percentile`
3. Round to 2 decimal places
4. Flag as ready to write to `transferPartners.js` in Step 5

---

## STEP 1 — Read all current data files

Read in full:
- `app/data/transferPartners.js`
- `app/data/awardCharts.js`
- `app/data/dynamicRanges.js`
- `app/data/fareBands.js`

Hold all current values in memory for comparison in Steps 2–4.

---

## STEP 2 — Weekly checks (every session)

### 2a. Transfer bonuses — highest priority, changes fastest

Fetch both pages:
- https://thepointsguy.com/news/transfer-bonus/
- https://www.doctorofcredit.com/best-credit-card-transfer-bonuses/

Extract every active bonus: `{ bank, airline, bonusPct, expiryDate }`.

Compare against `programs[bank].partners[airline]` in the file:
- **ADD** any bonus not in the file. Set `bonus` as a decimal fraction (30% → `0.3`) and `expires` as ISO date.
- **REMOVE** any `bonus` field in the file that doesn't appear in either source.
- **UPDATE** any `expires` date that changed.
- **EXPIRE** any entry where `expires` < today — remove `bonus` and `expires`.

### 2b. Transfer partnership changes

Fetch each bank's partner page:

| Bank | URL |
|------|-----|
| Chase UR | https://creditcards.chase.com/travel-credit-cards/sapphire/reserve |
| Amex MR | https://www.americanexpress.com/en-us/rewards/membership-rewards/partners/ |
| Capital One | https://www.capitalone.com/credit-cards/benefits/travel-miles/transfer-partners/ |
| Citi TYP | https://www.citi.com/credit-cards/citi-thankyou-rewards/partners |
| Bilt | https://www.biltrewards.com/rewards/transfers |

Flag any partner added, removed, ratio changed, or transfer time changed.

---

## STEP 3 — Monthly checks (days 1–7 of each month only)

Skip entirely if today is not day 1–7.

### 3a. Point valuations

Fetch all three and extract ¢/point for Chase UR, Amex MR, Capital One, Citi TYP, Bilt:

| Publisher | URL |
|-----------|-----|
| The Points Guy | https://thepointsguy.com/guide/monthly-valuations/ |
| NerdWallet | https://www.nerdwallet.com/article/travel/point-mile-valuations |
| Upgraded Points | https://upgradedpoints.com/travel/best-credit-card-points-values/ |

Per bank: `newValue = average(3)`, `range = { low: min, high: max }`.
Flag ⚠ if any source > 0.3¢ from average, or new value moves > 0.4¢ from file.
Update `sources[]` entries and `valuationsAsOf`.

### 3b. YQ/YR surcharges

For each airline in `carrierSurcharges`, fetch its `sourceUrl` and check amounts.
Cross-reference: https://www.flyertalk.com/forum/mileage-run-deals/1579505-award-ticket-fuel-surcharges-yq-yr-list.html
Flag ⚠ if any value differs > $50. Update `carrierSurchargesAsOf`.

### 3c. Dynamic range update

For each program in `dynamicRangeSources`, fetch the first available URL
(same URLs used in Step 0). Extract cited `low / typical / high` ranges per
cabin × region pair. Compare against `dynamicRanges.js`.
Flag ⚠ if any `typical` moves > 20%. Update `source` strings and `dynamicRangesAsOf`.

---

## STEP 4 — Quarterly checks (first week of Jan, Apr, Jul, Oct only)

Skip entirely if today is not in the first week of a quarter-start month.

### 4a. Zone award charts

For each `chartClass: "zone"` program, fetch its `sourceUrl` from `programMeta`
and verify every region-pair × cabin value. Flag any change.

### 4b. Avios distance bands

Fetch: https://www.britishairways.com/content/dam/ba/documents/pdfs/avios-flight-rewards.pdf
Verify all 8 tiers against `aviosBands`. Flag any change.

### 4c. Amex excise fee

Fetch: https://thepointsguy.com/news/amex-airline-transfer-excise-tax/
Verify rate $0.0006/pt, cap $99.

---

## STEP 5 — Produce the diff table

Output this for my review. Do not write any file yet.

```
## Proposed changes — [DATE]

### Peg Cents: new samples added to staging
| Program | New samples this session | Total samples | Ready to write? (≥8) |
|---------|--------------------------|---------------|----------------------|

### Peg Cents: distributions ready to write (≥8 samples)
| Program | Old mid | New mid | Old p25–p75 | New p25–p75 | Flag? |
|---------|---------|---------|------------|------------|-------|

### Weekly: Transfer bonuses
| Bank | Airline | Action | Old expires | New expires |
|------|---------|--------|-------------|-------------|

### Weekly: Partnership changes
| Bank | Airline | Field | Old | New |
|------|---------|-------|-----|-----|

### Monthly: Point valuations  [month-start only]
| Bank | Old ¢/pt | New ¢/pt | Source spread | Flag? |

### Monthly: Surcharges  [month-start only]
| Airline | Route | Old $ | New $ | Flag? |

### Monthly: Dynamic ranges  [month-start only]
| Program | Region pair | Cabin | Old typical | New | Δ% | Flag? |

### Quarterly: Award charts  [quarter-start only]
| Program | Region pair | Cabin | Old | New | Flag? |
```

If a section has no changes: write "No changes detected."
For any ⚠ flag, add one sentence of explanation.

---

## STEP 6 — Write (only after I approve)

When I confirm:
1. Append new samples to `data-refresh-staging.json` (update `_lastSession`).
2. If any program had ≥ 8 samples and was approved: update `awardPegCents[program]` in `transferPartners.js` with new `p25/mid/p75`, `sampleCount`, `samplePeriod`.
3. Apply all other approved changes to the relevant data files.
4. Update all `*AsOf` / `lastRefreshed` dates to today.
5. Run `npm run build` — confirm clean.
6. Output commit message: `data: weekly refresh [YYYY-MM-DD]`

---

## Quality rules (apply to every extraction)

- Only extract samples where BOTH miles AND cashUSD are explicit numbers in the article — no estimates or ranges.
- If the article says "as low as X miles" or "up to X miles" without a cash anchor, skip it.
- If the article is older than 18 months, mark `stale: true` and weight it lower (don't discard, but flag).
- Never overwrite an existing staging entry — only append.
- `cppActual = (cashUSD / miles) × 100` — double-check the arithmetic before recording.
