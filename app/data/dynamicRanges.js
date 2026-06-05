// ─────────────────────────────────────────────────────────────────────────────
// PointsMixer — DYNAMIC PROGRAM HISTORICAL RANGES
//
// Historical observed mileage ranges for Class C (dynamic-pricing) programs.
// These are NOT published saver charts — they represent what searchers have
// actually paid on these routes based on published reports, AwardWallet analysis,
// and TPG/NerdWallet data. Clearly labeled as historical in the UI.
//
// Structure: { [program]: { [pairKey]: { [cabin]: { low, typical, high, note, source } } } }
//   low     = floor seen in favorable conditions (off-peak, promo, cheap dates)
//   typical = what most bookings cost in a normal search
//   high    = peak/holiday pricing observed
//
// To refresh: ask Claude Code to "refresh PointsMixer dynamic ranges"
// ─────────────────────────────────────────────────────────────────────────────

export const dynamicRangesAsOf = "2026-06-04";

const pk = (a, b) => [a, b].sort().join(" | ");

export const dynamicRanges = {

  // ── Flying Blue (Air France / KLM) ─────────────────────────────────────────
  // Most predictable of the dynamic programs — standard rate is consistent;
  // monthly Promo Rewards bring it down to ~45k. Fuel surcharges $200–$350 OW.
  // Source: thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue — Jun 2026
  "Flying Blue": {
    [pk("North America", "Europe")]: {
      economy:  { low: 12500, typical: 25000, high: 50000,
                  note: "Promo Rewards (monthly) as low as 18,750. Surcharges minimal in economy.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
      premium:  { low: 25000, typical: 40000, high: 80000,
                  note: "Promo Rewards start around 30,000 miles.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
      business: { low: 45000, typical: 60000, high: 120000,
                  note: "Standard rate is 60,000 OW. Monthly Promo Rewards as low as 45,000. Add $200–$350 in fuel surcharges. Business space can be hard to find.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      business: { low: 60000, typical: 80000, high: 160000,
                  note: "Routed via CDG/AMS. Less predictable than Europe.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      business: { low: 40000, typical: 60000, high: 120000,
                  source: "thepointsguy.com — Jun 2026" },
    },
  },

  // ── American Airlines AAdvantage ───────────────────────────────────────────
  // AAdvantage has moved to dynamic pricing but many partner-airline sweet spots
  // remain consistent at 54k–57.5k OW. Own-metal and BA awards spike wildly.
  // Source: thepointsguy.com/airline/sweet-spots-american-airlines-aadvantage;
  //         awardwallet.com/airlines/american-aadvantage/aa-award-chart — Jun 2026
  "American Airlines": {
    [pk("North America", "Europe")]: {
      economy:  { low: 22500, typical: 35000, high: 130000,
                  note: "Iberia/Finnair partner economy starts at 22,500. AA own metal can be 100k+.",
                  source: "awardwallet.com/airlines/american-aadvantage Jun 2026" },
      business: { low: 54000, typical: 62000, high: 400000,
                  note: "Sweet spot: Iberia & Finnair partner business 54k–57.5k OW + low fees. BA partner business similar but ~$700 fuel surcharges. Own AA metal and peak dates spike to 400k+. Only ~12% of dates found below 100k in a 2026 analysis.",
                  source: "thepointsguy.com/airline/sweet-spots-american-airlines-aadvantage; awardwallet.com Jun 2026" },
      first:    { low: 85000, typical: 115000, high: 500000,
                  note: "Iberia/Finnair first at ~85k. AA own first can be 500k+ on peak dates.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      business: { low: 60000, typical: 80000, high: 300000,
                  note: "JL/CX partner sweet spots around 60k–70k. Own AA metal and peak dates much higher.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 25000, typical: 40000, high: 100000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 40000, typical: 55000, high: 150000,
                  source: "awardwallet.com Jun 2026" },
    },
  },

  // ── Delta SkyMiles ──────────────────────────────────────────────────────────
  // Famously unpredictable. Eliminated award chart years ago; prices range from
  // reasonable (65k–97k OW on low-demand dates) to extreme (600k+ at peak).
  // Better value often found booking Delta One via Virgin Atlantic or other partners.
  // Source: awardwallet.com/blog/unofficial-delta-skymiles-award-chart-flights-us;
  //         thriftytraveler.com/news/points/book-business-class-delta-skymiles — Jun 2026
  "Delta": {
    [pk("North America", "Europe")]: {
      economy:  { low: 30000, typical: 60000, high: 200000,
                  note: "Wide variance. 30k seen on low-demand dates, 200k+ at peak.",
                  source: "awardwallet.com/blog/unofficial-delta-skymiles-award-chart-flights-us Jun 2026" },
      business: { low: 65000, typical: 150000, high: 600000,
                  note: "Extremely variable. Sweet deals at 65k–97k on low-demand dates; 97k seen for Amsterdam, Dublin, Rome. Standard pricing often 150k–300k. Holiday/peak exceeds 600k. Consider booking Delta One via Virgin Atlantic Flying Club for more predictable pricing.",
                  source: "awardwallet.com; thriftytraveler.com/news/points/book-business-class-delta-skymiles Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      economy:  { low: 40000, typical: 80000, high: 250000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 80000, typical: 180000, high: 600000,
                  note: "Similarly volatile as Europe routes.",
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      business: { low: 90000, typical: 200000, high: 650000,
                  source: "awardwallet.com Jun 2026" },
    },
  },

  // ── United MileagePlus (own metal) ─────────────────────────────────────────
  // United own-metal is dynamic; partner awards (~Aeroplan routing) are Class A.
  // Own-metal transatlantic: moved to dynamic but remains more moderate than Delta.
  // Source: upgradedpoints.com/travel/best-ways-to-fly-to-europe-with-points — Jun 2026
  "United": {
    [pk("North America", "Europe")]: {
      economy:  { low: 30000, typical: 40000, high: 80000,
                  note: "Own United metal. Partner saver (via Aeroplan) is a fixed Class A chart — consider booking via Air Canada Aeroplan for more predictable pricing.",
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 55000, typical: 80000, high: 200000,
                  note: "Own United metal. Saver levels often available at 55k–70k; surge pricing at peak. For partner carriers on United miles, use Aeroplan routing which has a fixed chart.",
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      business: { low: 65000, typical: 90000, high: 220000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      business: { low: 70000, typical: 100000, high: 250000,
                  source: "upgradedpoints.com Jun 2026" },
    },
  },

  // ── Emirates Skywards ───────────────────────────────────────────────────────
  // Dynamic pricing on Business/First. Fuel surcharges can be significant.
  // Source: thepointsguy.com/loyalty-programs/emirates-skywards-program — Jun 2026
  "Emirates": {
    [pk("North America", "Middle East")]: {
      economy:  { low: 42500, typical: 75000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 90000, typical: 150000, high: 300000,
                  note: "High fuel surcharges ($500+) on top of miles. First Class 150k–500k.",
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 150000, typical: 250000, high: 500000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      business: { low: 100000, typical: 180000, high: 350000,
                  note: "Via Dubai. Surcharges significant.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      business: { low: 50000, typical: 90000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "Southeast Asia")]: {
      business: { low: 55000, typical: 100000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Turkish Miles&Smiles ────────────────────────────────────────────────────
  // Went fully dynamic; was once a chart-based sweet spot. Still competitive
  // for some Star Alliance redemptions but pricing now varies.
  // Source: upgradedpoints.com/travel/airlines/turkish-airlines-miles-smiles — Jun 2026
  "Turkish": {
    [pk("North America", "Europe")]: {
      economy:  { low: 30000, typical: 50000, high: 100000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 45000, typical: 70000, high: 160000,
                  note: "Was once 45k fixed chart. Now dynamic but often cheaper than comparable programs.",
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      business: { low: 55000, typical: 90000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      business: { low: 40000, typical: 65000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
    },
  },

  // ── Cathay Pacific Asia Miles ───────────────────────────────────────────────
  // Fully dynamic; Oneworld partner.
  // Source: thepointsguy.com/loyalty-programs/cathay-pacific-asia-miles — Jun 2026
  "Cathay Pacific": {
    [pk("North America", "North Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 65000, typical: 100000, high: 250000,
                  note: "CX own flights to HKG. Also bookable via Alaska Miles (fixed chart sweet spot).",
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 100000, typical: 150000, high: 350000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      business: { low: 55000, typical: 85000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North Asia", "Southeast Asia")]: {
      business: { low: 25000, typical: 40000, high: 90000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Qatar Airways Avios (QMiles) ───────────────────────────────────────────
  // Qatar uses dynamic pricing for its own QMiles program.
  // Source: thepointsguy.com/loyalty-programs/qatar-privilege-club — Jun 2026
  "Qatar": {
    [pk("North America", "Middle East")]: {
      business: { low: 70000, typical: 120000, high: 250000,
                  note: "QSuites business class. Also bookable via Alaska Miles (sweet spot ~70k).",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      business: { low: 80000, typical: 140000, high: 300000,
                  note: "Via DOH. QSuites via Alaska Miles sometimes available at lower rates.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      business: { low: 45000, typical: 80000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Etihad Guest ──────────────────────────────────────────────────────────
  // Dynamic pricing on Etihad own flights.
  // Source: thepointsguy.com/loyalty-programs/etihad-guest — Jun 2026
  "Etihad": {
    [pk("North America", "Middle East")]: {
      business: { low: 75000, typical: 130000, high: 260000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      business: { low: 40000, typical: 75000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── EVA Air Infinity MileageLands ─────────────────────────────────────────
  // Fully dynamic; Star Alliance.
  // Source: thepointsguy.com/loyalty-programs/eva-air-infinity-mileagelands — Jun 2026
  "EVA Air": {
    [pk("North America", "North Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 120000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 110000, high: 250000,
                  note: "Royal Laurel business. Also bookable via Aeroplan (Class A zone chart).",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North Asia", "Southeast Asia")]: {
      business: { low: 25000, typical: 45000, high: 100000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the historical range for a dynamic program × region pair × cabin.
 * Returns { low, typical, high, note, source } or null if not available.
 */
export function getDynamicRange(program, fromRegion, toRegion, cabin) {
  if (!program || !fromRegion || !toRegion || !cabin) return null;
  const programData = dynamicRanges[program];
  if (!programData) return null;
  const key = pk(fromRegion, toRegion);
  const routeData = programData[key];
  if (!routeData) return null;
  // Premium economy → fall back to economy range if not defined
  const cab = String(cabin).toLowerCase();
  return routeData[cab] || (cab === "premium" ? routeData.economy : null) || null;
}

/**
 * Given a quoted mileage, classify it within the historical range.
 * Returns "low" (below typical low), "typical", "high", or null.
 */
export function classifyVsRange(quotedMiles, range) {
  if (!range || !quotedMiles) return null;
  const q = Number(quotedMiles);
  if (q < range.low) return "low";    // unusually cheap — confirm space exists
  if (q <= range.high) return "typical"; // within observed range
  return "high"; // above observed high — extremely expensive
}
