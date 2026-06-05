# PointsMixer — Master Data Refresh Checklist

Run this once a month. Each section is a self-contained Claude session task.
The goal is to update every data file from its canonical public source so the
codebase stays accurate without manual research.

---

## Overview of all data files

| File | Data type | Staleness risk | Primary source | Cadence |
|------|-----------|---------------|----------------|---------|
| `app/data/transferPartners.js` | Transfer ratios, bonuses, surcharges, point values, peg cents | HIGH | Bank/airline partner pages | Monthly |
| `app/data/awardCharts.js` | Zone & distance award charts (fixed programs) | HIGH | Airline program pages, awardtravelfinder.com | Quarterly |
| `app/data/dynamicRanges.js` | Historical mile ranges (dynamic programs) | MEDIUM | TPG, AwardWallet, UpgradedPoints | Quarterly |
| `app/data/fareBands.js` | Cash fare ballparks per region-pair | LOW | Google Flights history, BTS data | Annually |
| `app/data/airportCoords.js` | Airport lat/lng | VERY LOW | OurAirports (public domain) | Never |
| `app/data/airports.js` | Airport names/cities | VERY LOW | IATA / OurAirports | Rarely |

For editorial data (point valuations, award peg cents, transfer bonuses), use
the detailed instructions in `REFRESH_PROMPT.md`.

---

## FILE 1 — `transferPartners.js`

### 1a. Transfer partnerships and ratios
For each of the 5 bank programs (Chase UR, Amex MR, Capital One, Citi TYP, Bilt):
- Fetch the bank's official transfer partner page (URLs below).
- Verify: partner list, transfer ratio, transfer time (`days`), any new partners added or removed.
- Check for ratio changes (e.g. Amex→Cathay moved from 1:1 to 0.8:1 in 2024).

| Bank | Partner page URL |
|------|-----------------|
| Chase UR | https://creditcards.chase.com/travel-credit-cards/sapphire/reserve (click "transfer points") |
| Amex MR | https://www.americanexpress.com/en-us/rewards/membership-rewards/partners/ |
| Capital One | https://www.capitalone.com/credit-cards/benefits/travel-miles/transfer-partners/ |
| Citi TYP | https://www.citi.com/credit-cards/citi-thankyou-rewards/partners |
| Bilt | https://www.biltrewards.com/rewards/transfers |

**Flag if:** any partner was added or removed, or any ratio changed.
**Update:** `programs[bank].partners` block + set `lastUpdated` to today.

### 1b. Transfer bonuses
See `REFRESH_PROMPT.md` Step 3 — covers bonus verification and expiry.

### 1c. Carrier-imposed surcharges (YQ/YR)
For each airline in `carrierSurcharges`, verify the default and route-specific
amounts against the airline's award booking page (URLs listed in the surcharge
source block in the file). Flag any change > $50.
Update `carrierSurchargesAsOf`.

### 1d. Point valuations and award peg cents
See `REFRESH_PROMPT.md` Steps 1 and 2.

### 1e. Amex excise fee rate
Check: https://thepointsguy.com/news/amex-airline-transfer-excise-tax/
Current rate: $0.0006/pt, capped at $99. If changed, update `exciseFeePerPoint` and `exciseFeeCap`.

---

## FILE 2 — `awardCharts.js`

### Zone charts (Class A)
For each of the 10 programs, check the program's own award chart page:

| Program | Source URL |
|---------|-----------|
| ANA | https://www.ana.co.jp/en/us/amc/partner-flight-awards/ |
| Aeroplan | https://www.aircanada.com/us/en/aco/home/aeroplan/redeem/travel/flight-rewards.html |
| Alaska | https://www.alaskaair.com/content/mileage-plan/use-miles/award-travel |
| Avianca LifeMiles | https://www.lifemiles.com/flight/search |
| Singapore KrisFlyer | https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/miles/saver-awards/ |
| JAL | https://www.jal.co.jp/en/jalmile/use/partner/ |
| Qantas | https://www.qantas.com/us/en/frequent-flyer/use-points/classic-flight-rewards.html |
| TAP Miles&Go | https://www.flytap.com/en-us/miles-and-go/rewards-flights/award-chart |
| Thai ROP | https://www.thaiairways.com/en_TH/privilege_lounge/rop/award_flights/award_chart.page |
| Korean SKYPASS | https://www.koreanair.com/content/dam/koreanair/en/skypass/pdf/award_chart.pdf |

**Flag if:** any zone-pair cost changed, or a new region pair was published.
**Update:** the relevant chart constant + `awardChartsAsOf`.

### Distance chart (Class B — Avios)
Source: https://www.britishairways.com/content/dam/ba/documents/pdfs/avios-flight-rewards.pdf
Check the distance band table for any changes to the 8 mileage tiers.
**Update:** `aviosBands` array + `awardChartsAsOf`.

### Program classification
- Verify `programMeta` entries. If a previously dynamic program introduced a fixed
  chart (or vice versa), update `chartClass`.
- Update `partnerNote` strings for any programs whose booking mechanics changed.

---

## FILE 3 — `dynamicRanges.js`

For each of the ~14 dynamic programs, update the `low/typical/high` ranges:

**Sources to check (in order of preference):**
1. The Points Guy program guide — search "TPG [airline name] award guide 2026"
   https://thepointsguy.com/guide/
2. AwardWallet airline page — https://awardwallet.com/airlines/[program-slug]
3. UpgradedPoints guide — https://upgradedpoints.com/travel/airlines/

**Process per program:**
- Fetch the current TPG guide for the program.
- Extract the cited mile ranges for each cabin × region pair.
- Compare against the current `low/typical/high` values in the file.
- Update `source` to the fetched URL + month.
- Update `dynamicRangesAsOf`.

**Flag if:** any `typical` value changed by more than 20% — this may signal
a significant devaluation or improvement worth noting in `note`.

---

## FILE 4 — `fareBands.js`

Check annually, or after a major macroeconomic event (fuel shock, capacity
change, new route launch).

**Sources:**
- Google Flights price graph (manual check for 2–3 representative routes per
  region pair, flexible date view shows historical median): https://flights.google.com
- Hopper industry research: https://hopper.com/airline-industry-research
- BTS DB1B fare data (quarterly): https://www.bts.gov/topics/airlines-and-airports/fare-data

**Process:**
- For each region pair, verify the `low` and `high` are still representative
  of actual fares seen in the past 12 months.
- Update `fareBandsAsOf` and `fareBandsSources[*].date`.

---

## FILE 5 — `airportCoords.js`

Refresh only if a new airport is added to the tool or coordinates are reported
as incorrect. Source: https://ourairports.com/data/ (public domain CSV).

---

## FILE 6 — `airports.js`

Refresh only if airport names change (rare), a new airport is added, or an
airport closes. Source: IATA airport registry or OurAirports.

---

## After refreshing any file

1. Set the `*AsOf` / `lastUpdated` / `lastRefreshed` date to today in the file.
2. Run `npm run build` — must compile clean.
3. Commit: `data: [monthly|quarterly] refresh [YYYY-MM]`
4. If any `dataConfidence` in `programMeta` changed (e.g. a previously estimated
   chart became official), update the `dataConfidence` field in `awardCharts.js`.
