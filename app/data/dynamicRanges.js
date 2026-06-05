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
      economy:  { low: 35000, typical: 60000, high: 120000,
                  note: "Routed via CDG/AMS. Economy Promo Rewards can drop to ~35k.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
      business: { low: 60000, typical: 80000, high: 160000,
                  note: "Routed via CDG/AMS. Less predictable than Europe.",
                  source: "thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 100000,
                  source: "skystatus.pro/guide/flying-blue-sweet-spots Jun 2026" },
      business: { low: 70000, typical: 85000, high: 160000,
                  note: "Air France/KLM from European hubs to Japan/Korea/China. Standard ~85k.",
                  source: "skystatus.pro/guide/flying-blue-sweet-spots Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 100000,
                  source: "skystatus.pro/guide/flying-blue-sweet-spots Jun 2026" },
      business: { low: 70000, typical: 85000, high: 160000,
                  note: "Air France/KLM to Bangkok, Singapore, Kuala Lumpur etc. Standard ~85k–88k OW.",
                  source: "skystatus.pro/guide/flying-blue-sweet-spots; awardwallet.com Jun 2026" },
    },
    [pk("Europe", "South Asia")]: {
      economy:  { low: 30000, typical: 50000, high: 90000,
                  source: "skystatus.pro Jun 2026" },
      business: { low: 60000, typical: 80000, high: 150000,
                  note: "KLM/AF to Delhi, Mumbai. Less frequent than Europe↔Southeast Asia.",
                  source: "skystatus.pro Jun 2026" },
    },
    [pk("Europe", "Africa")]: {
      economy:  { low: 18000, typical: 30000, high: 65000,
                  note: "Air France/KLM serve many African destinations from CDG/AMS.",
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
      business: { low: 45000, typical: 65000, high: 120000,
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      economy:  { low: 20000, typical: 35000, high: 70000,
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
      business: { low: 50000, typical: 70000, high: 130000,
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
    },
    [pk("Europe", "Oceania")]: {
      economy:  { low: 55000, typical: 80000, high: 150000,
                  note: "Usually involves a connection (e.g. CDG→SIN→SYD or CDG→LAX→SYD).",
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
      business: { low: 100000, typical: 140000, high: 250000,
                  source: "awardwallet.com/airlines/flying-blue Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 15000, typical: 30000, high: 70000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 70000, high: 140000,
                  note: "Air France serves GRU, EZE from CDG via connection.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 70000, high: 140000,
                  note: "Routed via CDG/AMS.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 100000, high: 200000,
                  note: "Routed via CDG/AMS.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 40000, typical: 70000, high: 140000,
                  note: "Routed via CDG/AMS.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 100000, high: 200000,
                  note: "Routed via CDG/AMS.",
                  source: "thepointsguy.com Jun 2026" },
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
      economy:  { low: 30000, typical: 50000, high: 200000,
                  note: "Partner economy (JL/CX) as low as 30k. Own AA metal to Asia can spike 200k+.",
                  source: "thepointsguy.com Jun 2026" },
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
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 30000, typical: 50000, high: 130000,
                  note: "Via CX/JL/QF partners. Own AA metal rare on these routes.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 60000, typical: 85000, high: 250000,
                  note: "Cathay Pacific partner sweet spot ~60k–70k. Long routing, fewer options.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 30000, typical: 55000, high: 130000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 65000, typical: 90000, high: 250000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 40000, typical: 65000, high: 160000,
                  note: "Via QF/CX/JL partners.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 110000, high: 300000,
                  note: "Qantas business from NA via QF partners is a strong option; own AA metal variable.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 45000, typical: 70000, high: 160000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 75000, typical: 110000, high: 300000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "Middle East")]: {
      economy:  { low: 35000, typical: 55000, high: 130000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 65000, typical: 90000, high: 250000,
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
      economy:  { low: 45000, typical: 100000, high: 300000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 90000, typical: 200000, high: 650000,
                  note: "Delta flies SEA/LAX to Tokyo/Seoul/Osaka with connections to Southeast Asia.",
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 20000, typical: 45000, high: 120000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 50000, typical: 100000, high: 300000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 45000, typical: 100000, high: 300000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 90000, typical: 220000, high: 700000,
                  note: "Delta flies JFK/LAX to Sydney. Very expensive in dynamic pricing on peak dates.",
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 45000, typical: 100000, high: 300000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 90000, typical: 200000, high: 600000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "Middle East")]: {
      economy:  { low: 40000, typical: 85000, high: 250000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 80000, typical: 180000, high: 550000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 50000, typical: 110000, high: 350000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 100000, typical: 230000, high: 700000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 45000, typical: 100000, high: 280000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 80000, typical: 180000, high: 500000,
                  note: "Delta partners with Korean Air (KE). Dynamic pricing applies.",
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 45000, typical: 100000, high: 280000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 80000, typical: 180000, high: 500000,
                  source: "awardwallet.com Jun 2026" },
    },
    [pk("North Asia", "Oceania")]: {
      economy:  { low: 40000, typical: 90000, high: 250000,
                  source: "awardwallet.com Jun 2026" },
      business: { low: 70000, typical: 160000, high: 450000,
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
      economy:  { low: 35000, typical: 55000, high: 150000,
                  note: "Own United metal to Japan/China/Korea. Saver levels visible; prices spike significantly at peak.",
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 65000, typical: 90000, high: 220000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 130000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 70000, typical: 100000, high: 250000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 20000, typical: 35000, high: 90000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 60000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 45000, typical: 70000, high: 200000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 80000, typical: 130000, high: 350000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 170000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 75000, typical: 110000, high: 280000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 45000, typical: 75000, high: 200000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 80000, typical: 120000, high: 300000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Middle East")]: {
      economy:  { low: 40000, typical: 60000, high: 160000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 70000, typical: 100000, high: 260000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Europe")]: {
      economy:  { low: 10000, typical: 20000, high: 50000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 20000, typical: 35000, high: 100000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 65000, typical: 110000, high: 300000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 65000, typical: 110000, high: 300000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "South Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 150000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 60000, typical: 100000, high: 280000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Oceania")]: {
      economy:  { low: 60000, typical: 100000, high: 280000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 100000, typical: 170000, high: 450000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North Asia", "Oceania")]: {
      economy:  { low: 35000, typical: 60000, high: 160000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 65000, typical: 110000, high: 300000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Southeast Asia", "Oceania")]: {
      economy:  { low: 25000, typical: 45000, high: 120000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 50000, typical: 85000, high: 220000,
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
      economy:  { low: 60000, typical: 110000, high: 220000,
                  note: "Via Dubai. Surcharges significant on all cabins.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 100000, typical: 180000, high: 350000,
                  note: "Via Dubai. Surcharges significant.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      economy:  { low: 20000, typical: 40000, high: 90000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 90000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "Southeast Asia")]: {
      economy:  { low: 30000, typical: 55000, high: 120000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 100000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "South Asia")]: {
      economy:  { low: 20000, typical: 40000, high: 90000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 40000, typical: 75000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "North Asia")]: {
      economy:  { low: 35000, typical: 60000, high: 140000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 65000, typical: 120000, high: 250000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "South Asia")]: {
      economy:  { low: 35000, typical: 60000, high: 140000,
                  note: "Emirates connects via DXB.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 120000, high: 250000,
                  note: "Fuel surcharges significant ($500+).",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 140000, high: 300000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 140000, high: 300000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Africa")]: {
      economy:  { low: 25000, typical: 45000, high: 100000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 90000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Oceania")]: {
      economy:  { low: 70000, typical: 120000, high: 280000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 130000, typical: 220000, high: 500000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 55000, typical: 100000, high: 250000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 100000, typical: 180000, high: 400000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 60000, typical: 110000, high: 280000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 120000, typical: 200000, high: 450000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 80000, typical: 140000, high: 350000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 150000, typical: 260000, high: 600000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Africa", "Middle East")]: {
      economy:  { low: 18000, typical: 35000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 40000, typical: 70000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Africa", "North Asia")]: {
      economy:  { low: 50000, typical: 90000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 100000, typical: 170000, high: 380000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Africa", "Southeast Asia")]: {
      economy:  { low: 45000, typical: 80000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 90000, typical: 160000, high: 350000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "Oceania")]: {
      economy:  { low: 55000, typical: 100000, high: 250000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 100000, typical: 180000, high: 420000,
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
      economy:  { low: 35000, typical: 60000, high: 130000,
                  note: "Via IST hub. Economy often competitive vs other dynamic programs.",
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 55000, typical: 90000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 30000, typical: 50000, high: 110000,
                  note: "Turkish has extensive European network from IST to Asia.",
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 65000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 30000, typical: 50000, high: 110000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 45000, typical: 70000, high: 150000,
                  note: "Turkish connects many Southeast Asian cities via IST.",
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "South Asia")]: {
      economy:  { low: 25000, typical: 45000, high: 100000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 65000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Africa")]: {
      economy:  { low: 20000, typical: 38000, high: 90000,
                  note: "Turkish has Africa routes from IST via connections.",
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 65000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Oceania")]: {
      economy:  { low: 55000, typical: 95000, high: 230000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 90000, typical: 150000, high: 350000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      economy:  { low: 18000, typical: 35000, high: 80000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 30000, typical: 55000, high: 130000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 40000, typical: 70000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 70000, typical: 110000, high: 260000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Middle East")]: {
      economy:  { low: 35000, typical: 60000, high: 160000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 60000, typical: 95000, high: 220000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 45000, typical: 75000, high: 200000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 80000, typical: 120000, high: 280000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 55000, typical: 95000, high: 250000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 90000, typical: 150000, high: 380000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 18000, typical: 35000, high: 90000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 65000, high: 160000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 180000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 60000, typical: 100000, high: 240000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Middle East", "Southeast Asia")]: {
      economy:  { low: 18000, typical: 35000, high: 80000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 35000, typical: 60000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Middle East", "South Asia")]: {
      economy:  { low: 15000, typical: 28000, high: 65000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 30000, typical: 50000, high: 120000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Africa", "Middle East")]: {
      economy:  { low: 15000, typical: 28000, high: 70000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 30000, typical: 55000, high: 130000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("Southeast Asia", "Oceania")]: {
      economy:  { low: 20000, typical: 38000, high: 90000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 40000, typical: 70000, high: 170000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North Asia", "Southeast Asia")]: {
      economy:  { low: 15000, typical: 28000, high: 70000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 30000, typical: 55000, high: 130000,
                  source: "upgradedpoints.com Jun 2026" },
    },
    [pk("North Asia", "Oceania")]: {
      economy:  { low: 30000, typical: 55000, high: 140000,
                  source: "upgradedpoints.com Jun 2026" },
      business: { low: 55000, typical: 95000, high: 240000,
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
      economy:  { low: 40000, typical: 65000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 85000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 90000, typical: 130000, high: 320000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North Asia", "Southeast Asia")]: {
      economy:  { low: 18000, typical: 32000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 25000, typical: 40000, high: 90000,
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 50000, typical: 80000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North Asia", "Oceania")]: {
      economy:  { low: 35000, typical: 60000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 60000, typical: 100000, high: 250000,
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 100000, typical: 160000, high: 400000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 65000, high: 170000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 130000, high: 320000,
                  note: "Via HKG. CX has great business class product.",
                  source: "thepointsguy.com Jun 2026" },
      first:    { low: 130000, typical: 200000, high: 500000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 45000, typical: 70000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 85000, typical: 140000, high: 350000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 35000, typical: 60000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 90000, high: 230000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Southeast Asia", "Oceania")]: {
      economy:  { low: 18000, typical: 32000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 30000, typical: 50000, high: 130000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Qatar Airways Avios (QMiles) ───────────────────────────────────────────
  // Qatar uses dynamic pricing for its own QMiles program.
  // Source: thepointsguy.com/loyalty-programs/qatar-privilege-club — Jun 2026
  "Qatar": {
    [pk("North America", "Middle East")]: {
      economy:  { low: 40000, typical: 70000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 70000, typical: 120000, high: 250000,
                  note: "QSuites business class. Also bookable via Alaska Miles (sweet spot ~70k).",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 50000, typical: 85000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 140000, high: 300000,
                  note: "Via DOH. QSuites via Alaska Miles sometimes available at lower rates.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      economy:  { low: 25000, typical: 45000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 45000, typical: 80000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 40000, typical: 70000, high: 170000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 130000, high: 300000,
                  note: "Via DOH. QSuites available on some routes.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "South Asia")]: {
      economy:  { low: 35000, typical: 60000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 65000, typical: 110000, high: 260000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 40000, typical: 70000, high: 170000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 80000, typical: 130000, high: 300000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Oceania")]: {
      economy:  { low: 65000, typical: 110000, high: 270000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 120000, typical: 200000, high: 480000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Africa")]: {
      economy:  { low: 25000, typical: 45000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 90000, high: 220000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "South Asia")]: {
      economy:  { low: 18000, typical: 32000, high: 75000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 35000, typical: 60000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "Southeast Asia")]: {
      economy:  { low: 25000, typical: 45000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 90000, high: 220000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "North Asia")]: {
      economy:  { low: 35000, typical: 60000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 65000, typical: 115000, high: 280000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Middle East", "Oceania")]: {
      economy:  { low: 50000, typical: 90000, high: 230000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 95000, typical: 165000, high: 400000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Africa", "Middle East")]: {
      economy:  { low: 18000, typical: 32000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 35000, typical: 65000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 30000, typical: 55000, high: 140000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 60000, typical: 100000, high: 260000,
                  note: "Via DOH. Limited routes to South America.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 60000, typical: 110000, high: 280000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 110000, typical: 190000, high: 450000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 80000, typical: 140000, high: 350000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 150000, typical: 250000, high: 600000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 55000, typical: 100000, high: 260000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 100000, typical: 175000, high: 420000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 60000, typical: 110000, high: 280000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 110000, typical: 190000, high: 460000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Etihad Guest ──────────────────────────────────────────────────────────
  // Dynamic pricing on Etihad own flights.
  // Source: thepointsguy.com/loyalty-programs/etihad-guest — Jun 2026
  "Etihad": {
    [pk("North America", "Middle East")]: {
      economy:  { low: 45000, typical: 80000, high: 200000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 75000, typical: 130000, high: 260000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Middle East")]: {
      economy:  { low: 20000, typical: 38000, high: 90000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 40000, typical: 75000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── JetBlue TrueBlue ─────────────────────────────────────────────────────
  // Fully dynamic — points cost = cashFare / 1.3¢ roughly, but varies widely.
  // Partners: Chase UR 1:1, Amex MR 0.8:1, Citi TYP 1:1, Bilt 1:1.
  // Mint (lie-flat on transcon/transatlantic) is priced like a premium-cabin award.
  // Source: thepointsguy.com/loyalty-programs/jetblue-trueblue — Jun 2026
  "JetBlue": {
    [pk("North America", "North America")]: {
      economy:  { low:  3000, typical:  8000, high: 20000,
                  note: "Domestic/Caribbean routes. Off-peak as low as 3k; peak/holiday up to 20k+.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low:  8000, typical: 18000, high: 40000,
                  note: "Mint on transcon (JFK/BOS/FLL↔LAX/SFO/LAS). Some of the best lie-flat value in TrueBlue.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Central America/Caribbean")]: {
      economy:  { low:  3500, typical:  9000, high: 22000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low:  8000, typical: 20000, high: 45000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 18000, typical: 40000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Europe")]: {
      economy:  { low: 18000, typical: 35000, high: 70000,
                  note: "JetBlue Mint transatlantic (JFK/BOS↔LHR/AMS/CDG/MAD). Economy widely variable.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 25000, typical: 50000, high: 90000,
                  note: "Mint lie-flat. Good value vs cash; availability limited to JetBlue-operated routes.",
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Finnair Plus ──────────────────────────────────────────────────────────
  // Oneworld member; dynamic pricing since ~2023.
  // Partners: Capital One 1:1.
  // Nordic routes and connections are Finnair's sweet spot. Long-haul via HEL hub.
  // Source: thepointsguy.com/loyalty-programs/finnair-plus — Jun 2026
  "Finnair": {
    [pk("North America", "Europe")]: {
      economy:  { low: 20000, typical: 35000, high:  70000,
                  note: "Routes via HEL. Off-peak JFK/BOS/ORD/LAX↔HEL available sub-25k.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 45000, typical: 70000, high: 120000,
                  note: "Finnair long-haul business is well-regarded. Bookable via Oneworld partners at lower fixed rates.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "North Asia")]: {
      economy:  { low: 25000, typical: 40000, high: 80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 75000, high: 130000,
                  note: "HEL↔NRT/HND/PEK/HKG. Consider booking via Oneworld partner programs instead.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Southeast Asia")]: {
      economy:  { low: 25000, typical: 40000, high:  80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 75000, high: 130000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Europe")]: {
      economy:  { low:  8000, typical: 15000, high:  35000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Southwest Rapid Rewards ───────────────────────────────────────────────
  // Fixed-value model: points ≈ 1.35¢/pt toward any Southwest fare.
  // Partners: Chase UR 1:1, Bilt 1:1.
  // No cabins — Southwest is all-economy. Points cost directly tracks cash price.
  // Domestic US / Caribbean / Mexico / Central America only.
  // Source: thepointsguy.com/loyalty-programs/southwest-rapid-rewards — Jun 2026
  "Southwest": {
    [pk("North America", "North America")]: {
      economy:  { low:  3000, typical:  9000, high: 25000,
                  note: "Points ≈ 1.35¢ each toward any Southwest fare. Buy cheap fares for best value; Wanna Get Away fares are the sweet spot. Anytime/Business Select fares cost far more points for little extra.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Central America/Caribbean")]: {
      economy:  { low:  5000, typical: 12000, high: 30000,
                  note: "International fares to Caribbean/Mexico/Central America. Points value same as domestic.",
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Virgin Atlantic Flying Club ───────────────────────────────────────────
  // Fully dynamic since 2021. "Reward seats" can be exceptional value; standard
  // seats are much worse. Partners: Chase UR, Amex MR, Citi TYP, Bilt, Capital One.
  // Upper Class = lie-flat business. No true First on most routes.
  // Source: thepointsguy.com/loyalty-programs/virgin-atlantic-flying-club — Jun 2026
  "Virgin Atlantic": {
    [pk("North America", "Europe")]: {
      economy:  { low:  6000, typical: 25000, high:  50000,
                  note: "Reward seats as low as 6,000 off-peak (rare). Standard economy 20k–35k. Upper Class is the sweet spot for this program.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 25000, typical: 50000, high:  90000,
                  note: "Upper Class OW. Off-peak 'Reward' fares 25k–35k are exceptional value. Standard seats cost 60k+. Fuel surcharges on partner metal.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      economy:  { low: 30000, typical: 50000, high: 100000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 80000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South Asia")]: {
      economy:  { low: 30000, typical: 55000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 85000, high: 160000,
                  note: "LHR connection on Virgin or partner metal.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Southeast Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 110000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 90000, high: 160000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Africa")]: {
      economy:  { low: 35000, typical: 60000, high: 120000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 60000, typical: 95000, high: 170000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("Europe", "Europe")]: {
      economy:  { low:  6000, typical: 12000, high:  25000,
                  note: "Short-haul within Europe on Virgin or partner metal.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Central America/Caribbean")]: {
      economy:  { low:  7500, typical: 18000, high:  35000,
                  note: "Caribbean routes including Barbados, Antigua, Tobago direct.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 15000, typical: 35000, high:  65000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Aeromexico Club Premier ────────────────────────────────────────────────
  // Dynamic; SkyTeam member. Partners: Amex MR 1.6:1, Capital One 1:1.
  // Strong for US↔Mexico routes and connections. Long-haul goes via MEX hub.
  // Source: thepointsguy.com/loyalty-programs/aeromexico-club-premier — Jun 2026
  "Aeromexico": {
    [pk("North America", "Central America/Caribbean")]: {
      economy:  { low:  8000, typical: 18000, high:  40000,
                  note: "US↔Mexico routes are the sweet spot. Short hops like LAX↔MEX can be as low as 8k off-peak.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 16000, typical: 35000, high:  70000,
                  note: "Club Premier lie-flat business on select routes.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "South America")]: {
      economy:  { low: 20000, typical: 40000, high:  80000,
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 40000, typical: 75000, high: 130000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Europe")]: {
      economy:  { low: 30000, typical: 60000, high: 120000,
                  note: "Routed via MEX. Consider SkyTeam partners (Flying Blue, Delta) for competing options.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 55000, typical: 100000, high: 180000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Hawaiian Airlines HawaiianMiles ───────────────────────────────────────
  // Dynamic. Partners: Amex MR 1:1 (with excise fee), Bilt 1:1 (via Atmos Rewards).
  // Best for mainland US↔Hawaii. Also flies to South Pacific and Japan.
  // Source: thepointsguy.com/loyalty-programs/hawaiian-airlines-hawaiianmiles — Jun 2026
  "Hawaiian": {
    [pk("North America", "North America")]: {
      economy:  { low:  5000, typical: 15000, high:  30000,
                  note: "Mainland↔Hawaii. Off-peak (especially midweek) as low as 5k. Peak summer/holiday 25k+.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 10000, typical: 25000, high:  50000,
                  note: "First Class on Hawaiian routes. Far better value than economy for extra points spent.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "North Asia")]: {
      economy:  { low: 35000, typical: 55000, high: 100000,
                  note: "Honolulu↔Tokyo/Osaka. Good-value Japan routes if space is available.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 60000, typical: 90000, high: 150000,
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Oceania")]: {
      economy:  { low: 25000, typical: 45000, high:  80000,
                  note: "Honolulu↔Sydney/Auckland routes.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 50000, typical: 80000, high: 130000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

  // ── Spirit Free Spirit ────────────────────────────────────────────────────
  // Fixed-value model (like Southwest but lower CPP ≈ 1.1¢).
  // Partners: Bilt 1:1.
  // Ultra-low-cost domestic US and Caribbean only. Points value is modest.
  // Source: thepointsguy.com/loyalty-programs/spirit-free-spirit — Jun 2026
  "Spirit": {
    [pk("North America", "North America")]: {
      economy:  { low: 2500, typical:  8000, high: 20000,
                  note: "Points ≈ 1.1¢ each toward Spirit fares. Best value on bare-bones saver fares. Bag fees add cash cost — factor that in before transferring.",
                  source: "thepointsguy.com Jun 2026" },
    },
    [pk("North America", "Central America/Caribbean")]: {
      economy:  { low: 4000, typical: 11000, high: 25000,
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
      economy:  { low: 15000, typical: 28000, high: 70000,
                  note: "EVA Air short-haul within Asia. TPE hub.",
                  source: "thepointsguy.com Jun 2026" },
      business: { low: 25000, typical: 45000, high: 100000,
                  source: "thepointsguy.com Jun 2026" },
    },
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// REGION AVERAGE DISTANCES (median great-circle miles per region pair)
// Computed from app/data/airportCoords.js — used to scale regional ranges to
// route-specific estimates. Rounded to nearest 100mi.
// ─────────────────────────────────────────────────────────────────────────────
export const regionAvgDistanceMi = {
  [pk("Africa", "Africa")]: 2500,
  [pk("Africa", "Central America/Caribbean")]: 7100,
  [pk("Africa", "Europe")]: 3500,
  [pk("Africa", "Middle East")]: 3000,
  [pk("Africa", "North America")]: 7600,
  [pk("Africa", "North Asia")]: 7000,
  [pk("Africa", "Oceania")]: 7800,
  [pk("Africa", "South America")]: 6000,
  [pk("Africa", "South Asia")]: 4300,
  [pk("Africa", "Southeast Asia")]: 5800,
  [pk("Central America/Caribbean", "Central America/Caribbean")]: 1100,
  [pk("Central America/Caribbean", "Europe")]: 5300,
  [pk("Central America/Caribbean", "Middle East")]: 8000,
  [pk("Central America/Caribbean", "North America")]: 2100,
  [pk("Central America/Caribbean", "North Asia")]: 8600,
  [pk("Central America/Caribbean", "Oceania")]: 8900,
  [pk("Central America/Caribbean", "South America")]: 3200,
  [pk("Central America/Caribbean", "South Asia")]: 9700,
  [pk("Central America/Caribbean", "Southeast Asia")]: 10800,
  [pk("Europe", "Europe")]: 800,
  [pk("Europe", "Middle East")]: 2900,
  [pk("Europe", "North America")]: 4800,
  [pk("Europe", "North Asia")]: 5700,
  [pk("Europe", "Oceania")]: 10200,
  [pk("Europe", "South America")]: 6400,
  [pk("Europe", "South Asia")]: 4500,
  [pk("Europe", "Southeast Asia")]: 6400,
  [pk("Middle East", "Middle East")]: 800,
  [pk("Middle East", "North America")]: 7300,
  [pk("Middle East", "North Asia")]: 4800,
  [pk("Middle East", "Oceania")]: 7700,
  [pk("Middle East", "South America")]: 8000,
  [pk("Middle East", "South Asia")]: 2100,
  [pk("Middle East", "Southeast Asia")]: 4300,
  [pk("North America", "North America")]: 1300,
  [pk("North America", "North Asia")]: 6800,
  [pk("North America", "Oceania")]: 9000,
  [pk("North America", "South America")]: 4800,
  [pk("North America", "South Asia")]: 8500,
  [pk("North America", "Southeast Asia")]: 8900,
  [pk("North Asia", "North Asia")]: 1100,
  [pk("North Asia", "Oceania")]: 4900,
  [pk("North Asia", "South America")]: 11400,
  [pk("North Asia", "South Asia")]: 3200,
  [pk("North Asia", "Southeast Asia")]: 2400,
  [pk("Oceania", "Oceania")]: 1600,
  [pk("Oceania", "South America")]: 8100,
  [pk("Oceania", "South Asia")]: 6100,
  [pk("Oceania", "Southeast Asia")]: 3900,
  [pk("South America", "South America")]: 1800,
  [pk("South America", "South Asia")]: 9700,
  [pk("South America", "Southeast Asia")]: 10700,
  [pk("South Asia", "South Asia")]: 900,
  [pk("South Asia", "Southeast Asia")]: 2300,
  [pk("Southeast Asia", "Southeast Asia")]: 1200,
};

// ─────────────────────────────────────────────────────────────────────────────
// CITY-PAIR OVERRIDES
// Explicit per-route data for high-volume routes where demand-based pricing
// diverges from the distance-scaled estimate. routeKey = [o,d].sort().join("-").
// Checked before distance scaling. Only for routes with published source data.
// ─────────────────────────────────────────────────────────────────────────────
const rk = (a, b) => [a, b].sort().join("-");

export const cityPairOverrides = {
  "Delta": {
    [rk("JFK","LHR")]: { business: { low:70000, typical:130000, high:500000,
      note:"JFK→LHR is Delta's flagship transatlantic. Sweet deals at 70k–97k on low-demand dates.",
      source:"thriftytraveler.com/news/points/book-business-class-delta-skymiles Jun 2026" }},
    [rk("JFK","CDG")]: { business: { low:70000, typical:140000, high:520000,
      source:"awardwallet.com Jun 2026" }},
    [rk("JFK","AMS")]: { business: { low:70000, typical:135000, high:500000,
      source:"awardwallet.com Jun 2026" }},
    [rk("ATL","LHR")]: { business: { low:75000, typical:150000, high:550000,
      note:"ATL is a Delta hub — more space but still dynamic.",
      source:"awardwallet.com Jun 2026" }},
    [rk("JFK","NRT")]: { business: { low:80000, typical:170000, high:550000,
      source:"awardwallet.com Jun 2026" }},
    [rk("LAX","NRT")]: { business: { low:80000, typical:160000, high:520000,
      source:"awardwallet.com Jun 2026" }},
    [rk("LAX","HND")]: { business: { low:80000, typical:160000, high:520000,
      source:"awardwallet.com Jun 2026" }},
  },
  "Flying Blue": {
    [rk("JFK","CDG")]: { economy: { low:12500, typical:25000, high:50000,
      note:"Direct AF JFK→CDG. Standard 25k economy, promo from 18,750.",
      source:"thepointsguy.com Jun 2026" },
      business: { low:45000, typical:60000, high:100000,
      note:"Standard 60k, promo to 45k. Add $250 surcharge.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("JFK","LHR")]: { economy: { low:12500, typical:25000, high:50000,
      source:"thepointsguy.com Jun 2026" },
      business: { low:45000, typical:60000, high:100000,
      note:"On KLM/AF codeshare. Comparable to CDG route.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("JFK","AMS")]: { economy: { low:12500, typical:25000, high:50000,
      source:"thepointsguy.com Jun 2026" },
      business: { low:45000, typical:60000, high:100000,
      note:"KLM flagship JFK→AMS. Standard 60k, promo to 45k.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("LAX","CDG")]: { business: { low:45000, typical:60000, high:110000,
      note:"Slightly longer than JFK, comparable pricing.",
      source:"thepointsguy.com Jun 2026" }},
  },
  "American Airlines": {
    [rk("JFK","LHR")]: { business: { low:57500, typical:62000, high:300000,
      note:"BA JFK→LHR partner. 57.5k is the sweet spot; surcharges ~$700.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("JFK","MAD")]: { business: { low:54000, typical:58000, high:200000,
      note:"Iberia JFK→MAD partner. 54k sweet spot + very low surcharges.",
      source:"thepointsguy.com/airline/sweet-spots-american-airlines-aadvantage Jun 2026" }},
    [rk("ORD","LHR")]: { business: { low:57500, typical:62000, high:300000,
      source:"thepointsguy.com Jun 2026" }},
    [rk("MIA","MAD")]: { business: { low:54000, typical:58000, high:200000,
      source:"thepointsguy.com Jun 2026" }},
    [rk("JFK","NRT")]: { business: { low:60000, typical:75000, high:250000,
      note:"JL partner JFK→NRT. 60k sweet spot + low fees.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("LAX","NRT")]: { business: { low:60000, typical:75000, high:250000,
      note:"JL partner LAX→NRT.",
      source:"thepointsguy.com Jun 2026" }},
    [rk("JFK","HKG")]: { business: { low:65000, typical:80000, high:260000,
      note:"Cathay partner. Alaska Miles is often better value for CX.",
      source:"thepointsguy.com Jun 2026" }},
  },
  "United": {
    [rk("EWR","LHR")]: { business: { low:55000, typical:75000, high:180000,
      note:"United's London hub. Polaris business.",
      source:"upgradedpoints.com Jun 2026" }},
    [rk("EWR","FRA")]: { business: { low:55000, typical:75000, high:180000,
      source:"upgradedpoints.com Jun 2026" }},
    [rk("ORD","LHR")]: { business: { low:55000, typical:75000, high:180000,
      source:"upgradedpoints.com Jun 2026" }},
    [rk("SFO","NRT")]: { business: { low:60000, typical:85000, high:210000,
      source:"upgradedpoints.com Jun 2026" }},
    [rk("SFO","ICN")]: { business: { low:60000, typical:85000, high:210000,
      source:"upgradedpoints.com Jun 2026" }},
    [rk("LAX","NRT")]: { business: { low:60000, typical:85000, high:210000,
      source:"upgradedpoints.com Jun 2026" }},
    [rk("EWR","SYD")]: { business: { low:80000, typical:150000, high:380000,
      note:"EWR→SYD via LAX. One of the longest routes.",
      source:"upgradedpoints.com Jun 2026" }},
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

function scaleRange(base, scaleFactor, cabin) {
  if (!base) return null;
  // Cap scale at 0.5–2.0 to avoid extreme outliers
  const s = Math.max(0.5, Math.min(2.0, scaleFactor));
  const round = (n) => {
    if (n >= 100000) return Math.round(n / 5000) * 5000;
    if (n >= 20000)  return Math.round(n / 2500) * 2500;
    return Math.round(n / 1000) * 1000;
  };
  return {
    low:     round(base.low     * s),
    typical: round(base.typical * s),
    high:    round(base.high    * s),
    note:    base.note,
    source:  base.source,
  };
}

/**
 * Get the historical range for a dynamic program × region pair × cabin.
 *
 * Lookup cascade:
 *   1. City-pair override (explicit route data)     → basis: "route-specific"
 *   2. Regional range × distance scale              → basis: "distance-scaled"
 *   3. Regional range (no coordinates available)    → basis: "regional"
 *   4. null if no data at all
 *
 * Pass originCode/destCode to enable distance scaling + city-pair lookup.
 */
export function getDynamicRange(program, fromRegion, toRegion, cabin, originCode, destCode) {
  if (!program || !fromRegion || !toRegion || !cabin) return null;
  const cab = String(cabin).toLowerCase();

  // 1. City-pair override
  if (originCode && destCode) {
    const routeKey = rk(originCode.toUpperCase(), destCode.toUpperCase());
    const override = cityPairOverrides[program]?.[routeKey];
    if (override) {
      const cell = override[cab] || (cab === "premium" ? override.economy : null);
      if (cell) return { ...cell, basis: "route-specific" };
    }
  }

  // 2 & 3. Regional range (with optional distance scaling)
  const programData = dynamicRanges[program];
  if (!programData) return null;
  const pairK = pk(fromRegion, toRegion);
  const routeData = programData[pairK];
  if (!routeData) return null;
  const base = routeData[cab] || (cab === "premium" ? routeData.economy : null) || null;
  if (!base) return null;

  return { ...base, basis: "regional" };
}

/**
 * Distance-scaled version. Called from awardEstimator.js which already imports
 * greatCircleMiles. Returns the ranged result with basis set.
 */
export function getDynamicRangeScaled(program, fromRegion, toRegion, cabin, originCode, destCode, distanceMi) {
  if (!program || !fromRegion || !toRegion || !cabin) return null;
  const cab = String(cabin).toLowerCase();

  // 1. City-pair override
  if (originCode && destCode) {
    const routeKey = rk(originCode.toUpperCase(), destCode.toUpperCase());
    const override = cityPairOverrides[program]?.[routeKey];
    if (override) {
      const cell = override[cab] || (cab === "premium" ? override.economy : null);
      if (cell) return { ...cell, basis: "route-specific" };
    }
  }

  const programData = dynamicRanges[program];
  if (!programData) return null;
  const pairK = pk(fromRegion, toRegion);
  const routeData = programData[pairK];
  if (!routeData) return null;
  const base = routeData[cab] || (cab === "premium" ? routeData.economy : null) || null;
  if (!base) return null;

  // 2. Distance scaling
  if (distanceMi && regionAvgDistanceMi[pairK]) {
    const avgDist = regionAvgDistanceMi[pairK];
    const scale = distanceMi / avgDist;
    const scaled = scaleRange(base, scale, cab);
    // Flag when route distance is very different from regional average (>50% off).
    // Linear scaling is a rough proxy — extreme outliers within a region pair may
    // see different pricing than the model predicts.
    let scaleNote = scaled.note || "";
    if (scale > 1.5 || scale < 0.6) {
      scaleNote += (scaleNote ? " " : "") +
        `This route (~${Math.round(distanceMi).toLocaleString()} mi) is ${scale > 1.5 ? "much longer" : "much shorter"} than the regional average (~${avgDist.toLocaleString()} mi) — estimate may be less accurate.`;
    }
    return { ...scaled, note: scaleNote || scaled.note, basis: "distance-scaled", distanceMi: Math.round(distanceMi) };
  }

  // 3. Unscaled regional fallback
  return { ...base, basis: "regional" };
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
