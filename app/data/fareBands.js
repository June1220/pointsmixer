// ─────────────────────────────────────────────────────────────────────────────
// PointsMixer — CASH FARE BALLPARKS (source of truth)
//
// Historical one-way cash fare RANGES per region-pair × cabin.
// These are NOT live prices — cash fares are dynamic and change by the minute.
// Use ONLY as a rough ballpark context (e.g. "transatlantic business is typically
// $1,500–$4,500 one-way historically"). Do NOT use to judge if a specific fare is
// "good" or "bad" — Google Flights shows real-time "low/typical/high" context.
//
// Structure: { [cabin]: { low, high } }  — simple range only, no verdict.
//
// Ask Claude Code to "refresh PointsMixer fare bands" to update.
// ─────────────────────────────────────────────────────────────────────────────

export const fareBandsAsOf = "2026-06-04";
// Sources used to derive these historical ranges (NOT live prices):
//   Google Flights price history graphs (flights.google.com) — seasonal low/high
//   Hopper historical fare database (hopper.com/airline-industry-research)
//   Bureau of Transportation Statistics DB1B fare data (bts.gov/topics/airlines-and-airports)
//   Scott's Cheap Flights fare alerts archive (app.scottscheapflights.com)
// All ranges are one-way economy/business medians from 2023–2026 published reports.
// Refresh: ask Claude to fetch Google Flights price history for each region pair.
export const fareBandsSources = [
  { publisher: "Google Flights price history",         url: "https://flights.google.com",                                          date: "2026-06-04" },
  { publisher: "Hopper Airline Industry Research",     url: "https://hopper.com/airline-industry-research",                        date: "2026-06-04" },
  { publisher: "BTS DB1B quarterly fare data",         url: "https://www.bts.gov/topics/airlines-and-airports/fare-data",          date: "2026-06-04" },
];

// pairKey must match awardCharts.js pairKey function (sorted | joined).
const pk = (a, b) => [a, b].sort().join(" | ");

// Structure: { [pairKey]: { economy: {good, typical}, premium: {...}, business: {...}, first: {...} } }
// good = upper bound of a good fare; typical = upper bound of a typical/normal fare.
// Above typical = expensive (consider points).
export const fareBands = {

  // ── North America intra ────────────────────────────────────────────────────
  [pk("North America","North America")]: {
    economy: { low: 150, high: 350 },
    premium:  { low: 250, high: 600 },
    business: { low: 400, high: 900 },
  },

  // ── North America ↔ Central America / Caribbean ───────────────────────────
  [pk("North America","Central America/Caribbean")]: {
    economy: { low: 200, high: 450 },
    premium:  { low: 350, high: 700 },
    business: { low: 600, high: 1200 },
  },

  // ── North America ↔ South America ─────────────────────────────────────────
  [pk("North America","South America")]: {
    economy: { low: 350, high: 700 },
    premium:  { low: 700, high: 1400 },
    business: { low: 1500, high: 3500 },
    first:    { low: 4000, high: 8000 },
  },

  // ── North America ↔ Europe ────────────────────────────────────────────────
  [pk("North America","Europe")]: {
    economy: { low: 400, high: 900 },
    premium:  { low: 900, high: 1800 },
    business: { low: 2000, high: 4500 },
    first:    { low: 5000, high: 12000 },
  },

  // ── North America ↔ North Asia ────────────────────────────────────────────
  [pk("North America","North Asia")]: {
    economy: { low: 500, high: 1100 },
    premium:  { low: 1100, high: 2200 },
    business: { low: 2500, high: 5500 },
    first:    { low: 6000, high: 14000 },
  },

  // ── North America ↔ Southeast Asia ───────────────────────────────────────
  [pk("North America","Southeast Asia")]: {
    economy: { low: 600, high: 1300 },
    premium:  { low: 1200, high: 2500 },
    business: { low: 2800, high: 6000 },
    first:    { low: 7000, high: 15000 },
  },

  // ── North America ↔ South Asia ────────────────────────────────────────────
  [pk("North America","South Asia")]: {
    economy: { low: 600, high: 1400 },
    premium:  { low: 1200, high: 2500 },
    business: { low: 2800, high: 6500 },
  },

  // ── North America ↔ Middle East ───────────────────────────────────────────
  [pk("North America","Middle East")]: {
    economy: { low: 600, high: 1400 },
    premium:  { low: 1200, high: 2800 },
    business: { low: 3000, high: 7000 },
  },

  // ── North America ↔ Africa ────────────────────────────────────────────────
  [pk("North America","Africa")]: {
    economy: { low: 700, high: 1600 },
    business: { low: 3500, high: 8000 },
  },

  // ── North America ↔ Oceania ───────────────────────────────────────────────
  [pk("North America","Oceania")]: {
    economy: { low: 700, high: 1500 },
    premium:  { low: 1400, high: 3000 },
    business: { low: 3500, high: 7500 },
    first:    { low: 8000, high: 18000 },
  },

  // ── Europe intra ──────────────────────────────────────────────────────────
  [pk("Europe","Europe")]: {
    economy: { low: 80, high: 250 },
    premium:  { low: 200, high: 500 },
    business: { low: 400, high: 1200 },
  },

  // ── Europe ↔ Middle East ──────────────────────────────────────────────────
  [pk("Europe","Middle East")]: {
    economy: { low: 250, high: 600 },
    business: { low: 1200, high: 3500 },
  },

  // ── Europe ↔ North Asia ───────────────────────────────────────────────────
  [pk("Europe","North Asia")]: {
    economy: { low: 500, high: 1100 },
    premium:  { low: 1000, high: 2000 },
    business: { low: 2500, high: 5500 },
    first:    { low: 6000, high: 14000 },
  },

  // ── Europe ↔ Southeast Asia ───────────────────────────────────────────────
  [pk("Europe","Southeast Asia")]: {
    economy: { low: 500, high: 1200 },
    premium:  { low: 1100, high: 2200 },
    business: { low: 2500, high: 5500 },
  },

  // ── Europe ↔ South Asia ───────────────────────────────────────────────────
  [pk("Europe","South Asia")]: {
    economy: { low: 450, high: 1000 },
    business: { low: 2000, high: 5000 },
  },

  // ── Europe ↔ Oceania ──────────────────────────────────────────────────────
  [pk("Europe","Oceania")]: {
    economy: { low: 700, high: 1500 },
    business: { low: 3500, high: 8000 },
  },

  // ── North Asia intra ──────────────────────────────────────────────────────
  [pk("North Asia","North Asia")]: {
    economy: { low: 200, high: 500 },
    business: { low: 700, high: 2000 },
  },

  // ── North Asia ↔ Southeast Asia ───────────────────────────────────────────
  [pk("North Asia","Southeast Asia")]: {
    economy: { low: 250, high: 600 },
    business: { low: 800, high: 2500 },
  },

  // ── North Asia ↔ Oceania ──────────────────────────────────────────────────
  [pk("North Asia","Oceania")]: {
    economy: { low: 500, high: 1100 },
    business: { low: 2000, high: 5000 },
  },

  // ── Southeast Asia ↔ Oceania ──────────────────────────────────────────────
  [pk("Southeast Asia","Oceania")]: {
    economy: { low: 400, high: 900 },
    business: { low: 1800, high: 4500 },
  },
};

/**
 * Returns a historical ballpark note for context — NOT a verdict.
 * Cash fares are dynamic; this is not "is this a good price?" — that's what
 * Google Flights is for. This just gives a rough historical range so the user
 * has a mental anchor before checking live prices.
 *
 * Returns { ballpark: string, low, high } or null if the region pair is unknown.
 *   ballpark = human-readable e.g. "$400–$900 one-way historically"
 */
export function getCashBallpark(fromRegion, toRegion, cabin) {
  if (!fromRegion || !toRegion) return null;
  const key = pk(fromRegion, toRegion);
  const row = fareBands[key];
  if (!row) return null;
  const cab = String(cabin || "economy").toLowerCase().replace("premium economy", "premium");
  const band = row[cab] || row.economy;
  if (!band) return null;
  const ballpark = `$${band.low.toLocaleString()}–$${band.high.toLocaleString()} one-way historically`;
  return { ballpark, low: band.low, high: band.high };
}

// Legacy alias kept for any callers that used the old judgeFare() name.
// Returns null — verdict removed. Use getCashBallpark() instead.
export function judgeFare() { return null; }
