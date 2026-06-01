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

export const lastUpdated = "2026-05-31";

// ─────────────────────────────────────────────────────────────────────────────
// POINT VALUATIONS ($ per 1 bank point) — the opportunity cost of spending each
// currency, i.e. what a point is reasonably worth in its best alternative use.
// These drive the engine's TRUE objective: minimize the dollar value of points
// spent. Chase & Bilt sit highest (Hyatt / Alaska-Atmos sweet spots), so they
// naturally sort LAST without needing a hard-coded "preserve" rule.
// Defaults blend published expert valuations (TPG / Bankrate / Frequent Miler,
// 2026). Treat as editable — a user could plug in their own values.
// ─────────────────────────────────────────────────────────────────────────────
// Source/date for the valuations below. Bump when you ask me to refresh them.
// Verified 2026-05-31 against The Points Guy's May 2026 monthly valuations:
//   Chase 2.05¢ · Amex 2.0¢ · Capital One 1.85¢ · Citi 1.9¢ · Bilt 2.2¢.
// These are ESTIMATES and inherently subjective — your personal value depends
// on how you redeem. The engine sorts on these, so editing them directly
// changes which currency is burned first.
export const valuationsAsOf = "2026-05-31";
export const pointValues = {
  "Chase UR": 0.0205,
  "Amex MR": 0.02,
  "Capital One": 0.0185,
  "Citi TYP": 0.019,
  Bilt: 0.022,
};
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

// Redemption-quality thresholds, in cents per airline mile. Determines the
// verdict shown when a cash price is entered ("excellent / solid / fair / weak").
// These are judgment calls about what counts as a good award — edit on request.
export const redemptionTiers = {
  great: 2.2, // >= this ¢/mile → excellent
  good: 1.6, // >= this        → solid
  fair: 1.2, // >= this        → fair; below → weak (consider paying cash)
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
      "Flying Blue": { ratio: 1 },
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
      "Virgin Atlantic": { ratio: 1, note: "Via Virgin Red → Virgin Atlantic Flying Club." },
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
      Qatar: { ratio: 1 },
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
      "Alaska Airlines": { ratio: 1, note: "Via Atmos Rewards (Alaska + Hawaiian)." },
      Avianca: { ratio: 1 },
      "British Airways": { ratio: 1 },
      "Cathay Pacific": { ratio: 1 },
      Emirates: { ratio: 1 },
      Etihad: { ratio: 1 },
      "Flying Blue": { ratio: 1 },
      Hawaiian: { ratio: 1, note: "Via Atmos Rewards (Alaska + Hawaiian)." },
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

// Sorted, de-duplicated list of every airline any program transfers to.
// Used to populate the airline dropdown in the UI (kept in sync automatically).
export const allAirlines = (() => {
  const set = new Set();
  for (const prog of Object.values(programs)) {
    for (const airline of Object.keys(prog.partners)) set.add(airline);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
})();
