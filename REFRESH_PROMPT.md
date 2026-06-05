# PointsMixer — Monthly Data Refresh Prompt

Run this prompt in a Claude Code session at the start of each month.
It covers the three editorial data categories that need active verification:
**point valuations**, **award peg cents**, and **transfer bonuses**.

> All other data files (award charts, dynamic ranges, surcharges, transfer
> partners) have their own refresh instructions embedded in the file headers.
> This prompt is scoped to the data that requires *multi-source reconciliation*
> or *empirical sampling* rather than a single authoritative source.

---

## STEP 1 — Point Valuations (`transferPartners.js → pointValues`)

For each of the three publishers below, fetch the page and extract the
cents-per-point value for every bank program (Chase UR, Amex MR, Capital One,
Citi TYP, Bilt):

| Publisher       | URL                                                                          |
|-----------------|------------------------------------------------------------------------------|
| The Points Guy  | https://thepointsguy.com/guide/monthly-valuations/                           |
| NerdWallet      | https://www.nerdwallet.com/article/travel/point-mile-valuations              |
| Upgraded Points | https://upgradedpoints.com/travel/best-credit-card-points-values/            |

For each bank program:
1. Record `{ publisher, url, value (as decimal e.g. 0.0205), date (page publish date) }`.
2. Compute `value = average(all three sources)`.
3. Compute `range = { low: min(sources), high: max(sources) }`.
4. **Flag** if any single source differs from the average by more than **0.003**
   (0.3¢) — this signals a meaningful disagreement that warrants a note.
5. **Flag** if the new average moves more than **0.004** from the prior `value`
   in the file — note why (e.g. "TPG revised Bilt down after program change").

Write the updated `pointValues` block to `app/data/transferPartners.js`.
Set `valuationsAsOf` and each entry's `lastRefreshed` to today's ISO date.

---

## STEP 2 — Award Peg Cents (`transferPartners.js → awardPegCents`)

For each airline listed in `awardPegCents`, collect **6–8 route samples**
using the city-pair routes already defined in `app/data/dynamicRanges.js`
(`cityPairOverrides`) as your sample set. If a city pair override doesn't exist
for an airline, use its most common long-haul routes.

### Per-sample procedure

1. **Cash price**: fetch a round-trip cash fare on Google Flights for that route,
   departure ~6 weeks out, flexible ±3 days, economy unless the override is for
   a premium cabin.
2. **Award price**: fetch the miles required on the airline's own award search
   for the same route and date window.
3. **Compute**: `cpp = (cashUSD / 2) / miles` (one-way equivalent).
   Record `{ route: "JFK-LHR", cashUSD, miles, cppActual, url, date }`.

### After collecting all samples for an airline

- Sort cpp values; compute `p25`, `mid` (median), `p75`.
- Update `sampleCount`, `samplePeriod` (e.g. `"2026-06-01 to 2026-06-05"`).
- Append new samples to `sources[]` (keep the 10 most recent; drop oldest).
- **Flag** if new `mid` moves more than **0.2** from the prior `mid` — note why.

Write the updated `awardPegCents` block to `app/data/transferPartners.js`.
Set `awardPegCentsAsOf` and each entry's `lastRefreshed` to today's ISO date.

---

## STEP 3 — Transfer Bonuses (`transferPartners.js → programs`)

Scan all partner entries across the five bank programs for `bonus` and
`expires` fields.

1. For each active bonus (`bonus` field present):
   - Check the bank's official transfer page to verify the bonus is still live.
   - Verify the `expires` date is still accurate.
   - If the bonus has ended: remove `bonus` and `expires` from the entry.
   - If the bonus has been extended: update `expires`.

2. Check for any **new** transfer bonuses not currently in the file:
   - The Points Guy bonus tracker: https://thepointsguy.com/news/transfer-bonus/
   - Each bank's transfer partner page (Chase, Amex, Capital One, Citi, Bilt).
   - Add any new bonuses with `bonus` (fraction, e.g. `0.3` for +30%) and
     `expires` (ISO date).

3. Check the Amex–Etihad partnership end note (currently flagged as ending
   2026-06-30). If that date has passed, remove Etihad from Amex's partners
   entirely and update the `programs` block.

---

## STEP 4 — Validation before writing

Before writing any changes:

- Every updated value must have a source URL and a date.
- No value may move more than the flag thresholds in Steps 1–2 without a
  written explanation in the `note` field.
- Confirm `lastUpdated` at the top of `transferPartners.js` is set to today.

---

## STEP 5 — Summary report

After writing all changes, output a brief summary table:

```
## Refresh summary — [DATE]

### Point Valuations
| Bank       | Prior  | New    | Delta  | Sources agree? |
|------------|--------|--------|--------|----------------|
| Chase UR   | 2.05¢  | X.XX¢  | +0.0X¢ | Yes / No       |
...

### Award Peg Cents
| Airline        | Prior mid | New mid | Samples | p25–p75     |
|----------------|-----------|---------|---------|-------------|
| United         | 1.4¢      | X.X¢    | N       | X.X – X.X¢  |
...

### Transfer Bonuses
| Bank / Airline  | Action taken              |
|-----------------|---------------------------|
| Amex / Etihad   | Partnership removed       |
| Chase / Hyatt   | New bonus +25% added      |
...
```

Commit with message: `data: monthly refresh [YYYY-MM]`
