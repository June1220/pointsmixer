// ─────────────────────────────────────────────────────────────────────────────
// PointsMixer — CASH FARE BANDS (source of truth)
//
// Rough "good one-way cash fare" bands per region-pair × cabin.
// These are NOT live prices — they represent the range a reasonably-priced
// ticket typically falls within, based on general market knowledge.
// Purpose: give users a sanity check ("is $3,200 business JFK→LIS expensive?")
// so they can make an informed decision before transferring points.
//
// All values are one-way USD. "good" = below this is a deal; "typical" = up to
// this is normal; above "typical" = expensive/consider points instead.
//
// Ask Claude Code to "refresh PointsMixer fare bands" to update.
// ─────────────────────────────────────────────────────────────────────────────

export const fareBandsAsOf = "2026-06-04";

// pairKey must match awardCharts.js pairKey function (sorted | joined).
const pk = (a, b) => [a, b].sort().join(" | ");

// Structure: { [pairKey]: { economy: {good, typical}, premium: {...}, business: {...}, first: {...} } }
// good = upper bound of a good fare; typical = upper bound of a typical/normal fare.
// Above typical = expensive (consider points).
export const fareBands = {

  // ── North America intra ────────────────────────────────────────────────────
  [pk("North America","North America")]: {
    economy: { good: 150, typical: 350 },
    premium:  { good: 250, typical: 600 },
    business: { good: 400, typical: 900 },
  },

  // ── North America ↔ Central America / Caribbean ───────────────────────────
  [pk("North America","Central America/Caribbean")]: {
    economy: { good: 200, typical: 450 },
    premium:  { good: 350, typical: 700 },
    business: { good: 600, typical: 1200 },
  },

  // ── North America ↔ South America ─────────────────────────────────────────
  [pk("North America","South America")]: {
    economy: { good: 350, typical: 700 },
    premium:  { good: 700, typical: 1400 },
    business: { good: 1500, typical: 3500 },
    first:    { good: 4000, typical: 8000 },
  },

  // ── North America ↔ Europe ────────────────────────────────────────────────
  [pk("North America","Europe")]: {
    economy: { good: 400, typical: 900 },
    premium:  { good: 900, typical: 1800 },
    business: { good: 2000, typical: 4500 },
    first:    { good: 5000, typical: 12000 },
  },

  // ── North America ↔ North Asia ────────────────────────────────────────────
  [pk("North America","North Asia")]: {
    economy: { good: 500, typical: 1100 },
    premium:  { good: 1100, typical: 2200 },
    business: { good: 2500, typical: 5500 },
    first:    { good: 6000, typical: 14000 },
  },

  // ── North America ↔ Southeast Asia ───────────────────────────────────────
  [pk("North America","Southeast Asia")]: {
    economy: { good: 600, typical: 1300 },
    premium:  { good: 1200, typical: 2500 },
    business: { good: 2800, typical: 6000 },
    first:    { good: 7000, typical: 15000 },
  },

  // ── North America ↔ South Asia ────────────────────────────────────────────
  [pk("North America","South Asia")]: {
    economy: { good: 600, typical: 1400 },
    premium:  { good: 1200, typical: 2500 },
    business: { good: 2800, typical: 6500 },
  },

  // ── North America ↔ Middle East ───────────────────────────────────────────
  [pk("North America","Middle East")]: {
    economy: { good: 600, typical: 1400 },
    premium:  { good: 1200, typical: 2800 },
    business: { good: 3000, typical: 7000 },
  },

  // ── North America ↔ Africa ────────────────────────────────────────────────
  [pk("North America","Africa")]: {
    economy: { good: 700, typical: 1600 },
    business: { good: 3500, typical: 8000 },
  },

  // ── North America ↔ Oceania ───────────────────────────────────────────────
  [pk("North America","Oceania")]: {
    economy: { good: 700, typical: 1500 },
    premium:  { good: 1400, typical: 3000 },
    business: { good: 3500, typical: 7500 },
    first:    { good: 8000, typical: 18000 },
  },

  // ── Europe intra ──────────────────────────────────────────────────────────
  [pk("Europe","Europe")]: {
    economy: { good: 80, typical: 250 },
    premium:  { good: 200, typical: 500 },
    business: { good: 400, typical: 1200 },
  },

  // ── Europe ↔ Middle East ──────────────────────────────────────────────────
  [pk("Europe","Middle East")]: {
    economy: { good: 250, typical: 600 },
    business: { good: 1200, typical: 3500 },
  },

  // ── Europe ↔ North Asia ───────────────────────────────────────────────────
  [pk("Europe","North Asia")]: {
    economy: { good: 500, typical: 1100 },
    premium:  { good: 1000, typical: 2000 },
    business: { good: 2500, typical: 5500 },
    first:    { good: 6000, typical: 14000 },
  },

  // ── Europe ↔ Southeast Asia ───────────────────────────────────────────────
  [pk("Europe","Southeast Asia")]: {
    economy: { good: 500, typical: 1200 },
    premium:  { good: 1100, typical: 2200 },
    business: { good: 2500, typical: 5500 },
  },

  // ── Europe ↔ South Asia ───────────────────────────────────────────────────
  [pk("Europe","South Asia")]: {
    economy: { good: 450, typical: 1000 },
    business: { good: 2000, typical: 5000 },
  },

  // ── Europe ↔ Oceania ──────────────────────────────────────────────────────
  [pk("Europe","Oceania")]: {
    economy: { good: 700, typical: 1500 },
    business: { good: 3500, typical: 8000 },
  },

  // ── North Asia intra ──────────────────────────────────────────────────────
  [pk("North Asia","North Asia")]: {
    economy: { good: 200, typical: 500 },
    business: { good: 700, typical: 2000 },
  },

  // ── North Asia ↔ Southeast Asia ───────────────────────────────────────────
  [pk("North Asia","Southeast Asia")]: {
    economy: { good: 250, typical: 600 },
    business: { good: 800, typical: 2500 },
  },

  // ── North Asia ↔ Oceania ──────────────────────────────────────────────────
  [pk("North Asia","Oceania")]: {
    economy: { good: 500, typical: 1100 },
    business: { good: 2000, typical: 5000 },
  },

  // ── Southeast Asia ↔ Oceania ──────────────────────────────────────────────
  [pk("Southeast Asia","Oceania")]: {
    economy: { good: 400, typical: 900 },
    business: { good: 1800, typical: 4500 },
  },
};

/**
 * Judge a cash fare against the region-pair band.
 * Returns { band: "good"|"typical"|"high", goodThresh, typicalThresh } or null if unknown.
 */
export function judgeFare(cashUSD, fromRegion, toRegion, cabin) {
  if (!cashUSD || !fromRegion || !toRegion) return null;
  const key = pk(fromRegion, toRegion);
  const row = fareBands[key];
  if (!row) return null;
  const cab = String(cabin || "economy").toLowerCase().replace("premium economy", "premium");
  const band = row[cab] || row.economy;
  if (!band) return null;
  const cash = Number(cashUSD);
  const b = cash <= band.good ? "good" : cash <= band.typical ? "typical" : "high";
  return { band: b, goodThresh: band.good, typicalThresh: band.typical };
}
