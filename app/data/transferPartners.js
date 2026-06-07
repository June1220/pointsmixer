// ─────────────────────────────────────────────────────────────────────────────
// PointsMixer — TRANSFER PARTNER SOURCE OF TRUTH
//
// This is the ONLY file you need to edit when transfer partnerships change.
// Ask Claude Code: "refresh the PointsMixer transfer data" and it will verify
// against the banks' official pages and update this file.
//
// `ratio` = airline miles received PER 1 bank point transferred.
//   1     = 1:1   (1000 bank pts -> 1000 airline miles)
//   0.8   = 5:4   (1000 bank pts ->  800 airline miles)
//   0.75  = 4:3   (1000 bank pts ->  750 airline miles)
//   0.6   = 5:3   (1000 bank pts ->  600 airline miles)
//   1.6   = 1:1.6 (1000 bank pts -> 1600 airline miles)
//
// Optional per-partner fields the engine understands:
//   note         (string)  caveat surfaced in the UI when that partner is used.
//   feePerPoint  (number)  $ fee per bank point (e.g. Amex excise tax 0.0006).
//   days         (number)  transfer time in days; 0/omitted = instant.
//   bonus        (number)  active transfer-bonus fraction, e.g. 0.3 = +30%.
//                          Effective ratio becomes ratio*(1+bonus).
//   expires      (string)  ISO date the bonus ends (shown as a warning).
// To add a live bonus, e.g.:  "Virgin Atlantic": { ratio: 1, bonus: 0.3, expires: "2026-07-15" }
// ─────────────────────────────────────────────────────────────────────────────

export const lastUpdated = "2026-06-06";

// ─────────────────────────────────────────────────────────────────────────────
// POINT VALUATIONS ($ per 1 bank point) — the opportunity cost of spending each
// currency, i.e. what a point is reasonably worth in its best alternative use.
// These drive the engine's TRUE objective: minimize the dollar value of points
// spent. Chase & Bilt sit highest (Hyatt / Alaska-Atmos sweet spots), so they
// naturally sort LAST without needing a hard-coded "preserve" rule.
// Defaults blend published expert valuations (TPG / Bankrate / Frequent Miler,
// 2026). Treat as editable — a user could plug in their own values.
// ─────────────────────────────────────────────────────────────────────────────
// Each entry carries the per-source breakdown so an AI refresh can verify
// each publisher independently and flag outliers before writing new values.
// `value`  = average of source values (what the engine uses).
// `range`  = {low, high} spread across sources this period.
// `sources`= [{publisher, url, value, date}] — one entry per publication.
// `method` = how `value` was computed ("average" | "manual").
// `lastRefreshed` = ISO date of most recent AI refresh pass.
export const valuationsAsOf = "2026-05-31";
export const pointValues = {
  "Chase UR": {
    value: 0.0205,
    range: { low: 0.020, high: 0.021 },
    sources: [
      { publisher: "The Points Guy",    url: "https://thepointsguy.com/guide/monthly-valuations/",                    value: 0.0210, date: "2026-05-01" },
      { publisher: "NerdWallet",        url: "https://www.nerdwallet.com/article/travel/point-mile-valuations",       value: 0.0200, date: "2026-04-15" },
      { publisher: "Upgraded Points",   url: "https://upgradedpoints.com/travel/best-credit-card-points-values/",     value: 0.0205, date: "2026-05-10" },
    ],
    method: "average",
    lastRefreshed: "2026-05-31",
  },
  "Amex MR": {
    value: 0.0200,
    range: { low: 0.019, high: 0.021 },
    sources: [
      { publisher: "The Points Guy",    url: "https://thepointsguy.com/guide/monthly-valuations/",                    value: 0.0210, date: "2026-05-01" },
      { publisher: "NerdWallet",        url: "https://www.nerdwallet.com/article/travel/point-mile-valuations",       value: 0.0190, date: "2026-04-15" },
      { publisher: "Upgraded Points",   url: "https://upgradedpoints.com/travel/best-credit-card-points-values/",     value: 0.0200, date: "2026-05-10" },
    ],
    method: "average",
    lastRefreshed: "2026-05-31",
  },
  "Capital One": {
    value: 0.0185,
    range: { low: 0.017, high: 0.020 },
    sources: [
      { publisher: "The Points Guy",    url: "https://thepointsguy.com/guide/monthly-valuations/",                    value: 0.0190, date: "2026-05-01" },
      { publisher: "NerdWallet",        url: "https://www.nerdwallet.com/article/travel/point-mile-valuations",       value: 0.0170, date: "2026-04-15" },
      { publisher: "Upgraded Points",   url: "https://upgradedpoints.com/travel/best-credit-card-points-values/",     value: 0.0195, date: "2026-05-10" },
    ],
    method: "average",
    lastRefreshed: "2026-05-31",
  },
  "Citi TYP": {
    value: 0.0190,
    range: { low: 0.018, high: 0.020 },
    sources: [
      { publisher: "The Points Guy",    url: "https://thepointsguy.com/guide/monthly-valuations/",                    value: 0.0190, date: "2026-05-01" },
      { publisher: "NerdWallet",        url: "https://www.nerdwallet.com/article/travel/point-mile-valuations",       value: 0.0180, date: "2026-04-15" },
      { publisher: "Upgraded Points",   url: "https://upgradedpoints.com/travel/best-credit-card-points-values/",     value: 0.0200, date: "2026-05-10" },
    ],
    method: "average",
    lastRefreshed: "2026-05-31",
  },
  Bilt: {
    value: 0.0220,
    range: { low: 0.021, high: 0.023 },
    sources: [
      { publisher: "The Points Guy",    url: "https://thepointsguy.com/guide/monthly-valuations/",                    value: 0.0230, date: "2026-05-01" },
      { publisher: "NerdWallet",        url: "https://www.nerdwallet.com/article/travel/point-mile-valuations",       value: 0.0210, date: "2026-04-15" },
      { publisher: "Upgraded Points",   url: "https://upgradedpoints.com/travel/best-credit-card-points-values/",     value: 0.0220, date: "2026-05-10" },
    ],
    method: "average",
    lastRefreshed: "2026-05-31",
  },
};
// Returns the scalar cent-per-point value the engine uses. Callers should
// use this getter rather than accessing .value directly.
export function getPointValue(bank) {
  return pointValues[bank]?.value ?? defaultPointValue;
}

// Returns the active bonus fraction for a partner entry (0 if none or expired).
// Pass `today` as an ISO date string for testability; defaults to current date.
export function getActiveBonus(partner, today = new Date().toISOString().slice(0, 10)) {
  if (!partner.bonus) return 0;
  if (partner.expires && partner.expires < today) return 0;
  return partner.bonus;
}
// Fallback used if a bank somehow has no entry above.
export const defaultPointValue = 0.018;

// Minimum transfer increment per bank (you can only move whole multiples).
// Real life: most move in 1,000s; some allow finer. Engine rounds UP to these.
export const transferIncrements = {
  "Chase UR": 1000,
  "Amex MR": 1000,
  "Capital One": 1,
  "Citi TYP": 1000,
  Bilt: 1,
};

// Amex (and a few others) levy an excise-tax fee on transfers to US-based airline
// programs: ~$0.0006 per point, capped per transfer. Engine folds this into cost.
// Reference exciseFeePerPoint in a partner's `feePerPoint` so the rate lives once.
export const exciseFeePerPoint = 0.0006;
export const exciseFeeCap = 99;

// ─────────────────────────────────────────────────────────────────────────────
// AWARD-COST HEURISTIC PEGS (cents per airline mile) — used by the flight-search
// estimator ONLY, to ballpark how many miles a flight costs when a program has
// no published award chart (dynamic pricing). estPoints ≈ cashPrice / peg¢.
// A higher peg = the program tends to price awards richly (fewer miles for the
// same cash fare). These are rough averages and clearly labeled as ESTIMATES in
// the UI. Programs with real charts (Aeroplan, ANA, …) bypass this — see
// app/data/awardCharts.js (chartBasedPrograms).
// ─────────────────────────────────────────────────────────────────────────────
// Each entry carries observed sample data so an AI refresh can update the
// distribution from real award bookings rather than editorial guesses.
// `mid`         = median observed ¢/mile (what the estimator uses).
// `p25`/`p75`   = interquartile range of observed redemptions.
// `sampleCount` = number of route samples used to compute this distribution.
// `samplePeriod`= ISO date range the samples were collected over.
// `sources`     = [{route, cashUSD, miles, cppActual, url, date}] raw data points.
// `lastRefreshed` = ISO date of most recent AI refresh pass.
//
// HOW TO REFRESH: for each airline, sample 6–8 routes from dynamicRanges.js
// city-pair overrides. For each route: fetch cash price (Google Flights, ±3 days
// flex), fetch award price (airline's own site), compute cpp = miles / cashUSD.
// Record each sample in `sources`, then recompute p25/mid/p75.
export const awardPegCentsAsOf = "2026-06-02";
export const awardPegCents = {
  United: {
    mid: 1.35, p25: 1.1, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    note: "No empirical samples yet — mid is carry-over editorial estimate.",
    lastRefreshed: "2026-06-02",
  },
  Delta: {
    mid: 1.2, p25: 0.9, p75: 1.6,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    note: "Notoriously dynamic / low value. No empirical samples yet.",
    lastRefreshed: "2026-06-02",
  },
  "Flying Blue": {
    mid: 1.3, p25: 1.0, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    note: "No empirical samples yet — mid is carry-over editorial estimate.",
    lastRefreshed: "2026-06-02",
  },
  JetBlue: {
    mid: 1.3, p25: 1.0, p75: 1.6,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Southwest: {
    mid: 1.35, p25: 1.1, p75: 1.6,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Emirates: {
    mid: 1.2, p25: 0.9, p75: 1.5,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Etihad: {
    mid: 1.3, p25: 1.0, p75: 1.6,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Qatar: {
    mid: 1.4, p25: 1.1, p75: 1.8,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  "Virgin Atlantic": {
    mid: 1.3, p25: 1.0, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Aeromexico: {
    mid: 1.1, p25: 0.8, p75: 1.4,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Finnair: {
    mid: 1.3, p25: 1.0, p75: 1.6,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Hawaiian: {
    mid: 1.2, p25: 0.9, p75: 1.5,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Spirit: {
    mid: 1.1, p25: 0.8, p75: 1.4,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  "Thai Airways": {
    mid: 1.4, p25: 1.1, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  Iberia: {
    mid: 1.4, p25: 1.1, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
  "Aer Lingus": {
    mid: 1.4, p25: 1.1, p75: 1.7,
    sampleCount: 0,
    samplePeriod: null,
    sources: [],
    lastRefreshed: "2026-06-02",
  },
};
// Returns the scalar ¢/mile the estimator uses (median).
export function getAwardPeg(program) {
  return awardPegCents[program]?.mid ?? defaultAwardPegCents;
}
// Returns { low, mid, high } ¢/mile from the p25/mid/p75 distribution.
// When sampleCount is 0 the range is a carry-over editorial estimate.
export function getAwardPegRange(program) {
  const entry = awardPegCents[program];
  if (!entry) return { low: defaultAwardPegCents, mid: defaultAwardPegCents, high: defaultAwardPegCents };
  return { low: entry.p25, mid: entry.mid, high: entry.p75 };
}
// Fallback peg if a dynamic program has no entry above.
export const defaultAwardPegCents = 1.3;

// Redemption-quality thresholds, in cents per airline mile. Determines the
// verdict shown when a cash price is entered ("excellent / solid / fair / weak").
// Thresholds vary by cabin: international business/first awards should deliver
// higher cpp to be considered "great" because cash prices are much higher.
// These are judgment calls about what counts as a good award — edit on request.
export const redemptionTiers = {
  economy:  { great: 1.8, good: 1.4, fair: 1.0 },
  premium:  { great: 2.0, good: 1.5, fair: 1.1 },
  business: { great: 2.5, good: 1.8, fair: 1.3 },
  first:    { great: 3.0, good: 2.2, fair: 1.5 },
};
export function getTiers(cabin) {
  const c = String(cabin || "economy").toLowerCase();
  if (c.includes("first")) return redemptionTiers.first;
  if (c.includes("business")) return redemptionTiers.business;
  if (c.includes("premium")) return redemptionTiers.premium;
  return redemptionTiers.economy;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARRIER-IMPOSED SURCHARGES (YQ/YR fees)
//
// Many airlines impose fuel surcharges / carrier-imposed fees on award tickets
// that the traveler must pay IN CASH on top of the miles. These can be $0 or
// $700+ depending on the airline and route, and dramatically affect whether an
// award is a "great deal" or not.
//
// Structure: { [airline]: { default, routes: { [regionPairKey]: amount } } }
// `default` = typical OW surcharge in USD when no route-specific data applies.
// `routes`  = overrides for specific region pairs (sorted pair key, " | " joined).
// Programs with $0 or negligible surcharges are omitted.
// Surcharges are per person, one-way, and vary by cabin — values here are
// approximate midpoints for business class (economy is typically 30–60% of these).
//
// Sources (verify each airline's surcharge page on refresh):
//   AwardWallet surcharge tracker:  https://awardwallet.com/blog/award-ticket-fuel-surcharges/
//   FlyerTalk YQ/YR master thread:  https://www.flyertalk.com/forum/mileage-run-deals/1579505-award-ticket-fuel-surcharges-yq-yr-list.html
//   British Airways fees:           https://www.britishairways.com/en-us/information/travel-classes/avios-upgrades/avios-and-upgrade-reward-terms
//   Air France/KLM fees:            https://www.airfranceklm.com/en/terms-conditions (Flying Blue award booking)
//   Singapore Airlines fees:        https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/miles/saver-awards/
//   Japan Airlines fees:            https://www.jal.co.jp/en/jalmile/use/partner/ (JMB partner awards)
//   Finnair fees:                   https://www.finnair.com/en/finnair-plus/spending-points/award-flights
//   Cathay Pacific fees:            https://www.cathaypacific.com/cx/en_US/asia-miles/spending-miles/flights.html
//   Qantas fees:                    https://www.qantas.com/us/en/frequent-flyer/use-points/classic-flight-rewards.html
//   Virgin Atlantic fees:           https://www.virginatlantic.com/us/en/flying-club/points/spending-points/redeeming-flights.html
//   TAP fees:                       https://www.flytap.com/en-us/miles-and-go/rewards-flights
//   Korean Air fees:                https://www.koreanair.com/content/dam/koreanair/en/skypass/pdf/award_chart.pdf
// ─────────────────────────────────────────────────────────────────────────────
export const carrierSurchargesAsOf = "2026-06-05";
const spk = (a, b) => [a, b].sort().join(" | ");
export const carrierSurcharges = {
  "British Airways": {
    sourceUrl: "https://www.britishairways.com/en-us/information/travel-classes/avios-upgrades/avios-and-upgrade-reward-terms",
    default: 300,
    routes: {
      [spk("North America", "Europe")]: 650,
      [spk("Europe", "Europe")]: 50,
      [spk("North America", "North Asia")]: 500,
      [spk("North America", "Southeast Asia")]: 550,
      [spk("North America", "South Asia")]: 550,
      [spk("Europe", "North Asia")]: 400,
      [spk("Europe", "Southeast Asia")]: 450,
      [spk("Europe", "South Asia")]: 350,
      [spk("North America", "Oceania")]: 500,
      [spk("Europe", "Oceania")]: 500,
    },
    note: "BA surcharges are the highest in the industry. Consider booking BA metal via Iberia Avios (lower fees) or avoid BA-operated flights.",
  },
  "Flying Blue": {
    sourceUrl: "https://www.flyingblue.com/en/spend/flights/award-tickets",
    default: 200,
    routes: {
      [spk("North America", "Europe")]: 275,
      [spk("Europe", "Europe")]: 30,
      [spk("Europe", "North Asia")]: 250,
      [spk("Europe", "Southeast Asia")]: 250,
      [spk("Europe", "Africa")]: 150,
    },
    note: "Air France/KLM surcharges are moderate. Economy surcharges are roughly half these amounts.",
  },
  Singapore: {
    sourceUrl: "https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/miles/saver-awards/",
    default: 150,
    routes: {
      [spk("North America", "Southeast Asia")]: 250,
      [spk("Europe", "Southeast Asia")]: 200,
      [spk("Southeast Asia", "Oceania")]: 100,
      [spk("Southeast Asia", "Southeast Asia")]: 50,
    },
    note: "Singapore Airlines surcharges are moderate. Some routes via partner carriers have different fees.",
  },
  "Japan Airlines": {
    sourceUrl: "https://www.jal.co.jp/en/jalmile/use/partner/",
    default: 150,
    routes: {
      [spk("North America", "North Asia")]: 250,
      [spk("Europe", "North Asia")]: 200,
      [spk("North Asia", "Southeast Asia")]: 80,
    },
  },
  Finnair: {
    sourceUrl: "https://www.finnair.com/en/finnair-plus/spending-points/award-flights",
    default: 200,
    routes: {
      [spk("North America", "Europe")]: 300,
      [spk("Europe", "North Asia")]: 250,
      [spk("Europe", "Southeast Asia")]: 250,
      [spk("Europe", "Europe")]: 30,
    },
    note: "Finnair surcharges are significant on long-haul. Consider booking Finnair metal via other Oneworld programs.",
  },
  "Cathay Pacific": {
    sourceUrl: "https://www.cathaypacific.com/cx/en_US/asia-miles/spending-miles/flights.html",
    default: 200,
    routes: {
      [spk("North America", "North Asia")]: 350,
      [spk("Europe", "North Asia")]: 300,
      [spk("North Asia", "Southeast Asia")]: 80,
      [spk("North Asia", "Oceania")]: 200,
    },
    note: "CX surcharges vary significantly. Booking CX via Alaska Miles avoids some fees.",
  },
  Qantas: {
    sourceUrl: "https://www.qantas.com/us/en/frequent-flyer/use-points/classic-flight-rewards.html",
    default: 150,
    routes: {
      [spk("North America", "Oceania")]: 250,
      [spk("Europe", "Oceania")]: 250,
      [spk("North Asia", "Oceania")]: 200,
      [spk("Southeast Asia", "Oceania")]: 100,
    },
  },
  "Virgin Atlantic": {
    sourceUrl: "https://www.virginatlantic.com/us/en/flying-club/points/spending-points/redeeming-flights.html",
    default: 100,
    routes: {
      [spk("North America", "Europe")]: 50,  // own metal surcharges are low
    },
    note: "Virgin Atlantic's own-metal surcharges are low. Delta partner metal via VS has minimal fees.",
  },
  "TAP Air Portugal": {
    sourceUrl: "https://www.flytap.com/en-us/miles-and-go/rewards-flights",
    default: 150,
    routes: {
      [spk("North America", "Europe")]: 200,
      [spk("Europe", "Europe")]: 30,
    },
  },
  "Korean Air": {
    sourceUrl: "https://www.koreanair.com/content/dam/koreanair/en/skypass/pdf/award_chart.pdf",
    default: 100,
    routes: {
      [spk("North America", "North Asia")]: 150,
      [spk("Europe", "North Asia")]: 120,
    },
  },
};

// Verified against bank transfer-partner pages / award-travel trackers on the
// date above. Sources: awardtravelfinder.com, upgradedpoints.com, bank sites.
export const programs = {
  "Chase UR": {
    label: "Chase Ultimate Rewards",
    color: "#2563eb",
    partners: {
      "Aer Lingus": { ratio: 1 },
      Aeroplan: { ratio: 1 },
      "British Airways": { ratio: 1 },
      "Flying Blue": { ratio: 1 },
      Iberia: { ratio: 1 },
      JetBlue: { ratio: 1 },
      Singapore: { ratio: 1, days: 2, note: "Chase→Singapore transfers take ~1–2 days." },
      Southwest: { ratio: 1 },
      United: { ratio: 1 },
      "Virgin Atlantic": { ratio: 1 },
    },
  },

  "Amex MR": {
    label: "Amex Membership Rewards",
    color: "#7c3aed",
    partners: {
      "Aer Lingus": { ratio: 1 },
      Aeromexico: { ratio: 1.6 },
      Aeroplan: { ratio: 1 },
      ANA: { ratio: 1, days: 2, note: "Amex→ANA transfers can take up to 48 hours." },
      Avianca: { ratio: 1 },
      "British Airways": { ratio: 1 },
      "Cathay Pacific": { ratio: 0.8 },
      Delta: { ratio: 1, feePerPoint: exciseFeePerPoint, note: "Amex→Delta carries a ~$0.0006/pt excise-tax fee." },
      Emirates: { ratio: 0.8 },
      Etihad: { ratio: 1, note: "Amex–Etihad partnership ENDS June 30, 2026." },
      "Flying Blue": { ratio: 1, bonus: 0.25, expires: "2026-06-30" },
      Hawaiian: { ratio: 1, feePerPoint: exciseFeePerPoint },
      Iberia: { ratio: 1 },
      JetBlue: { ratio: 0.8, feePerPoint: exciseFeePerPoint, note: "Amex→JetBlue carries a small transfer fee." },
      Qantas: { ratio: 1 },
      Singapore: { ratio: 1 },
      "Virgin Atlantic": { ratio: 1 },
    },
  },

  "Capital One": {
    label: "Capital One Venture Miles",
    color: "#dc2626",
    partners: {
      Aeromexico: { ratio: 1 },
      Aeroplan: { ratio: 1 },
      Avianca: { ratio: 1 },
      "British Airways": { ratio: 1 },
      "Cathay Pacific": { ratio: 1 },
      Emirates: { ratio: 0.75 },
      Etihad: { ratio: 1 },
      "EVA Air": { ratio: 0.75 },
      Finnair: { ratio: 1 },
      "Flying Blue": { ratio: 1 },
      "Japan Airlines": { ratio: 0.75 },
      JetBlue: { ratio: 0.6 },
      Qantas: { ratio: 1 },
      Qatar: { ratio: 1 },
      Singapore: { ratio: 1 },
      "TAP Air Portugal": { ratio: 1 },
      Turkish: { ratio: 1 },
      // Capital One transfers to Virgin Red, which moves to Virgin Atlantic Flying Club.
      "Virgin Atlantic": { ratio: 1, days: 3, note: "Via Virgin Red → Virgin Atlantic Flying Club. Allow 2–5 days." },
    },
  },

  "Citi TYP": {
    label: "Citi ThankYou Points",
    color: "#059669",
    partners: {
      "Aer Lingus": { ratio: 1 },
      "American Airlines": { ratio: 1, note: "Citi→AAdvantage 1:1 requires a premium card (Strata Premier/Elite or Prestige)." }, // added by Citi in 2026
      Avianca: { ratio: 1 },
      "Cathay Pacific": { ratio: 1 },
      Emirates: { ratio: 0.8 },
      Etihad: { ratio: 1 },
      "EVA Air": { ratio: 1 },
      "Flying Blue": { ratio: 1 },
      JetBlue: { ratio: 1 },
      Qantas: { ratio: 1 },
      Qatar: { ratio: 1, bonus: 0.3, expires: "2026-06-30" },
      Singapore: { ratio: 1 },
      "Thai Airways": { ratio: 1 },
      Turkish: { ratio: 1 },
      "Virgin Atlantic": { ratio: 1 },
    },
  },

  Bilt: {
    label: "Bilt Rewards",
    color: "#e2a03f",
    partners: {
      "Aer Lingus": { ratio: 1 },
      Aeroplan: { ratio: 1 },
      "Alaska Airlines": { ratio: 1, days: 2, note: "Via Atmos Rewards (Alaska + Hawaiian). Allow 1–3 days." },
      Avianca: { ratio: 1 },
      "British Airways": { ratio: 1 },
      "Cathay Pacific": { ratio: 1 },
      Emirates: { ratio: 1 },
      Etihad: { ratio: 1 },
      "Flying Blue": { ratio: 1 },
      Hawaiian: { ratio: 1, days: 2, note: "Via Atmos Rewards (Alaska + Hawaiian). Allow 1–3 days." },
      Iberia: { ratio: 1 },
      "Japan Airlines": { ratio: 1 },
      Qatar: { ratio: 1 },
      Southwest: { ratio: 1 },
      Spirit: { ratio: 1 },
      "TAP Air Portugal": { ratio: 1 },
      Turkish: { ratio: 1 },
      United: { ratio: 1 },
      "Virgin Atlantic": { ratio: 1 },
      // NOTE: Bilt does NOT transfer to American Airlines.
    },
  },
};

// Maps free-text the user types into a canonical airline key used above.
// Keys are lower-cased substrings; first match wins (longer/more-specific first).
export const airlineAliases = [
  ["air france", "Flying Blue"],
  ["klm", "Flying Blue"],
  ["flying blue", "Flying Blue"],
  ["air canada", "Aeroplan"],
  ["aeroplan", "Aeroplan"],
  ["american airlines", "American Airlines"],
  ["aadvantage", "American Airlines"],
  ["american", "American Airlines"],
  ["virgin atlantic", "Virgin Atlantic"],
  ["virgin red", "Virgin Atlantic"],
  ["virgin", "Virgin Atlantic"],
  ["british airways", "British Airways"],
  ["avios", "British Airways"], // BA Avios; (Iberia/Aer Lingus also use Avios, but BA is the common case)
  ["aer lingus", "Aer Lingus"],
  ["iberia", "Iberia"],
  ["united", "United"],
  ["southwest", "Southwest"],
  ["jetblue", "JetBlue"],
  ["delta", "Delta"],
  ["alaska", "Alaska Airlines"],
  ["atmos", "Alaska Airlines"],
  ["hawaiian", "Hawaiian"],
  ["singapore", "Singapore"],
  ["krisflyer", "Singapore"],
  ["cathay", "Cathay Pacific"],
  ["asia miles", "Cathay Pacific"],
  ["emirates", "Emirates"],
  ["skywards", "Emirates"],
  ["etihad", "Etihad"],
  ["eva air", "EVA Air"],
  ["eva", "EVA Air"],
  ["ana", "ANA"],
  ["all nippon", "ANA"],
  ["japan airlines", "Japan Airlines"],
  ["jal", "Japan Airlines"],
  ["qantas", "Qantas"],
  ["qatar", "Qatar"],
  ["turkish", "Turkish"],
  ["miles&smiles", "Turkish"],
  ["korean air", "Korean Air"],
  ["skypass", "Korean Air"],
  ["koreanair", "Korean Air"],
  ["thai", "Thai Airways"],
  ["tap", "TAP Air Portugal"],
  ["finnair", "Finnair"],
  ["avianca", "Avianca"],
  ["lifemiles", "Avianca"],
  ["aeromexico", "Aeromexico"],
  ["spirit", "Spirit"],
];

// ─────────────────────────────────────────────────────────────────────────────
// Airline ALLIANCE membership. Used for an informational hint only: if a user
// holds miles DIRECTLY in a program that's in the SAME alliance as the target
// flight's program, they may be able to book that physical seat through their
// own program. We do NOT assume the cost is the same — award prices differ by
// program even for the same seat — so this surfaces as a note, not as math.
// Airlines not listed here are not in one of the three global alliances
// (e.g. Emirates, Etihad, JetBlue, Southwest, Virgin Atlantic, Aer Lingus).
// ─────────────────────────────────────────────────────────────────────────────
export const alliances = {
  // Star Alliance
  Aeroplan: "Star Alliance",
  ANA: "Star Alliance",
  Avianca: "Star Alliance",
  "EVA Air": "Star Alliance",
  Singapore: "Star Alliance",
  "TAP Air Portugal": "Star Alliance",
  "Thai Airways": "Star Alliance",
  Turkish: "Star Alliance",
  United: "Star Alliance",
  // SkyTeam
  Aeromexico: "SkyTeam",
  Delta: "SkyTeam",
  "Flying Blue": "SkyTeam", // Air France / KLM
  "Korean Air": "SkyTeam",
  // Oneworld
  "Alaska Airlines": "Oneworld",
  "American Airlines": "Oneworld",
  "British Airways": "Oneworld",
  "Cathay Pacific": "Oneworld",
  Finnair: "Oneworld",
  Iberia: "Oneworld",
  "Japan Airlines": "Oneworld",
  Qantas: "Oneworld",
  Qatar: "Oneworld",
};

// NOTE: there is no hard-coded burn order any more. The engine spends currencies
// cheapest-dollar-first, derived purely from `pointValues` above. A currency
// "preserved" simply means it costs more per point, so it's tapped last.

// Airlines users may hold miles in directly but that no US bank transfers to.
// Included in the direct-miles dropdown alongside bank transfer destinations.
export const standalonePrograms = [
  "Korean Air", // SKYPASS — no bank direct transfer; earned via KAL credit cards
];

// Sorted, de-duplicated list of every airline relevant to the tool.
// Includes bank transfer destinations + standalone direct-balance programs.
export const allAirlines = (() => {
  const set = new Set(standalonePrograms);
  for (const prog of Object.values(programs)) {
    for (const airline of Object.keys(prog.partners)) set.add(airline);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
})();
