// ─────────────────────────────────────────────────────────────────────────────
// PointsMixer — AWARD-CHART SOURCE OF TRUTH
//
// Every number here is backed by a published, fixed award chart (Class A/B) or
// explicitly labeled as a dynamic estimate (Class C). Sources are cited with URLs
// and dates. This file is the single source of truth for baseline comparisons —
// ask Claude Code to "refresh the PointsMixer award charts" to update.
//
// IMPORTANT — ANA PARTNER AWARDS ARE ROUND-TRIP ONLY:
//   ANA Mileage Club requires round-trip bookings for partner airline awards.
//   One-way redemptions are only allowed on ANA-operated flights. The chart below
//   stores the ROUND-TRIP total; the judge surfaces this constraint explicitly
//   rather than silently halving.
//
// CLASS A — Zone-based fixed chart (region-pair lookup).
//   Programs charge a flat rate for ANY flight in a zone pair, regardless of city.
//   ANA biz NA↔EU: the SAME 88,000 miles RT for JFK→LIS as JFK→LHR.
//
// CLASS B — Distance-based fixed chart (great-circle miles → mileage band).
//   BA Executive Club and Iberia Plus price by actual flight distance.
//   JFK→DUB (~3,170mi) costs fewer Avios than JFK→LHR (~3,450mi), same region.
//   Requires app/data/airportCoords.js for distance calculation.
//
// CLASS C — Dynamic pricing (no fixed saver level; heuristic estimate only).
//   Confirmed dynamic in 2026: Delta, American, Turkish, Flying Blue, Emirates,
//   Aeromexico, United own metal, Air Canada own metal.
// ─────────────────────────────────────────────────────────────────────────────

export const awardChartsAsOf = "2026-06-05";
export const awardChartsSource = "https://awardtravelfinder.com/award-charts — verified 2026-06-04";

// Award geography zones.
export const regions = [
  "North America",
  "Central America/Caribbean",
  "South America",
  "Europe",
  "Africa",
  "Middle East",
  "South Asia",
  "Southeast Asia",
  "North Asia",
  "Oceania",
];

// ─────────────────────────────────────────────────────────────────────────────
// Airport (IATA) → region. Curated list of major airports. Returns null if
// unknown (estimator falls back to heuristic).
// ─────────────────────────────────────────────────────────────────────────────
export const airportRegion = {
  // North America
  JFK: "North America", EWR: "North America", LGA: "North America", BOS: "North America",
  IAD: "North America", DCA: "North America", PHL: "North America", ATL: "North America",
  MIA: "North America", FLL: "North America", MCO: "North America", ORD: "North America",
  DFW: "North America", IAH: "North America", DEN: "North America", PHX: "North America",
  LAS: "North America", LAX: "North America", SFO: "North America", SEA: "North America",
  SAN: "North America", YYZ: "North America", YVR: "North America", YUL: "North America",
  MEX: "North America",
  // Central America / Caribbean
  SJU: "Central America/Caribbean", SJO: "Central America/Caribbean",
  PTY: "Central America/Caribbean", CUN: "Central America/Caribbean",
  MBJ: "Central America/Caribbean", NAS: "Central America/Caribbean",
  // South America
  GRU: "South America", GIG: "South America", EZE: "South America",
  SCL: "South America", BOG: "South America", LIM: "South America",
  // Europe
  LHR: "Europe", LGW: "Europe", LCY: "Europe", MAN: "Europe", DUB: "Europe", CDG: "Europe",
  ORY: "Europe", AMS: "Europe", FRA: "Europe", MUC: "Europe", ZRH: "Europe", GVA: "Europe",
  VIE: "Europe", MAD: "Europe", BCN: "Europe", LIS: "Europe", OPO: "Europe", FCO: "Europe",
  MXP: "Europe", ATH: "Europe", CPH: "Europe", ARN: "Europe", OSL: "Europe", HEL: "Europe",
  BRU: "Europe", IST: "Europe", LIN: "Europe", PRG: "Europe", WAW: "Europe", BUD: "Europe",
  // Africa
  CAI: "Africa", JNB: "Africa", CPT: "Africa", NBO: "Africa", LOS: "Africa", ADD: "Africa",
  CMN: "Africa", ACC: "Africa",
  // Middle East
  DXB: "Middle East", AUH: "Middle East", DOH: "Middle East", TLV: "Middle East",
  RUH: "Middle East", JED: "Middle East", AMM: "Middle East", KWI: "Middle East",
  // South Asia
  DEL: "South Asia", BOM: "South Asia", BLR: "South Asia", HYD: "South Asia",
  MAA: "South Asia", CMB: "South Asia", DAC: "South Asia", KTM: "South Asia",
  // Southeast Asia
  SIN: "Southeast Asia", BKK: "Southeast Asia", KUL: "Southeast Asia", CGK: "Southeast Asia",
  MNL: "Southeast Asia", SGN: "Southeast Asia", HAN: "Southeast Asia", DPS: "Southeast Asia",
  RGN: "Southeast Asia", PNH: "Southeast Asia",
  // North Asia
  NRT: "North Asia", HND: "North Asia", KIX: "North Asia", ICN: "North Asia",
  PVG: "North Asia", PEK: "North Asia", PKX: "North Asia", HKG: "North Asia",
  TPE: "North Asia", CAN: "North Asia", CTU: "North Asia", XIY: "North Asia",
  // Oceania
  SYD: "Oceania", MEL: "Oceania", BNE: "Oceania", PER: "Oceania",
  AKL: "Oceania", NAN: "Oceania", CHC: "Oceania",
};

export function regionForAirport(code) {
  if (!code) return null;
  return airportRegion[String(code).toUpperCase().trim()] || null;
}

export function pairKey(a, b) {
  return [a, b].sort().join(" | ");
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM CLASSIFICATION
//
// chartClass:       "zone" | "distance" | null — the program's own redemption chart
//                   (what it costs to spend THIS program's miles on any flight).
// rtOnly:           true = program only allows round-trip partner awards.
// dataConfidence:   "official"       — chart from the airline/bank's own published page
//                   "crossreferenced"— verified against 2+ independent third-party sources
//                   "estimate"       — approximated from partial or aggregated data
// ownMetalDynamic:  true = the airline's OWN flights on ITS OWN program are dynamic
//                   even though partner programs may book those same seats at a fixed rate.
//                   Example: Aeroplan chart covers United/Lufthansa/etc. at fixed rates,
//                   but United miles on United flights are dynamic.
// partnerNote:      Human-readable hint about the own-metal vs partner distinction.
// ─────────────────────────────────────────────────────────────────────────────
export const programMeta = {
  // CLASS A — zone-based fixed charts
  "ANA":           { chartClass: "zone",     rtOnly: true,  dataConfidence: "official",        sourceUrl: "https://www.ana.co.jp/en/us/amc/partner-flight-awards/",                                                          partnerNote: "Partner awards only; own-metal ANA bookings have a separate (lower) chart." },
  "Aeroplan":      { chartClass: "zone",     rtOnly: false, dataConfidence: "official",        sourceUrl: "https://www.aircanada.com/us/en/aco/home/aeroplan/redeem/travel/flight-rewards.html",                             ownMetalDynamic: true,  partnerNote: "Air Canada own metal is dynamic; this chart covers Star Alliance partners (United, Lufthansa, etc.)." },
  "Avianca":       { chartClass: "zone",     rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.lifemiles.com/flight/search",                                                                          partnerNote: "LifeMiles covers Star Alliance partners. Own Avianca metal follows the same zone chart." },
  "Alaska Airlines":{ chartClass: "zone",   rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.alaskaair.com/content/mileage-plan/use-miles/award-travel",                                            partnerNote: "Per-partner tables approximated as zones; actual cost varies slightly by partner airline." },
  "Singapore":     { chartClass: "zone",     rtOnly: false, dataConfidence: "official",        sourceUrl: "https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/miles/saver-awards/",                                     partnerNote: "KrisFlyer chart covers partner bookings (Star Alliance). Singapore own metal follows the same chart." },
  "Qantas":        { chartClass: "zone",     rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.qantas.com/us/en/frequent-flyer/use-points/classic-flight-rewards.html",                             partnerNote: "Covers Oneworld partners. Qantas own metal follows the same zone chart." },
  "Japan Airlines":{ chartClass: "zone",     rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.jal.co.jp/en/jalmile/use/partner/",                                                                   partnerNote: "JMB chart covers Oneworld partners. JAL own metal follows the same chart." },
  "TAP Air Portugal":{ chartClass: "zone",   rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.flytap.com/en-us/miles-and-go/rewards-flights/award-chart",                                          partnerNote: "Covers Star Alliance partners. TAP own metal follows the same chart." },
  "Thai Airways":  { chartClass: "zone",     rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.thaiairways.com/en_TH/privilege_lounge/rop/award_flights/award_chart.page",                          partnerNote: "Royal Orchid Plus covers Star Alliance partners. Thai own metal follows the same chart." },
  "Korean Air":    { chartClass: "zone",     rtOnly: false, dataConfidence: "crossreferenced", sourceUrl: "https://www.koreanair.com/content/dam/koreanair/en/skypass/pdf/award_chart.pdf",                                  partnerNote: "SKYPASS covers SkyTeam partners. No US bank transfers directly to SKYPASS." },
  // CLASS B — distance-based fixed charts
  "British Airways":{ chartClass: "distance", rtOnly: false, dataConfidence: "official",       sourceUrl: "https://www.britishairways.com/content/dam/ba/documents/pdfs/avios-flight-rewards.pdf",                          partnerNote: "Avios distance bands cover BA own metal and Oneworld partners. Peak pricing can add 50–100% on high-demand dates." },
  "Iberia":        { chartClass: "distance",  rtOnly: false, dataConfidence: "official",       sourceUrl: "https://www.iberia.com/us/iberia-plus/use-avios/flight-rewards/",                                                 partnerNote: "Same Avios distance bands as BA. Iberia often has lower surcharges than BA for the same routes." },
  "Aer Lingus":    { chartClass: "distance",  rtOnly: false, dataConfidence: "official",       sourceUrl: "https://www.aerlingus.com/aer-club/spend-avios/",                                                                 partnerNote: "AerClub uses the same Avios distance bands as BA. Minimal fuel surcharges on Aer Lingus metal." },
  // CLASS C — dynamic (no fixed saver baseline)
  "United":        { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/united-mileageplus-award-guide/",        partnerNote: "United own metal is dynamic. Book United flights via Aeroplan, ANA, or Singapore for fixed-chart rates." },
  "Delta":         { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/complete-guide-to-delta-skymiles/",       partnerNote: "Delta is fully dynamic — no fixed saver level exists. Flying Blue partner awards on Delta metal may have published rates." },
  "American Airlines":{ chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/american-airlines-award-chart/",       partnerNote: "AAdvantage went fully dynamic in 2023. Book AA metal via Alaska, Iberia, or British Airways for fixed rates." },
  "Flying Blue":   { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/loyalty-programs/ultimate-guide-flying-blue/",  ownMetalDynamic: true, partnerNote: "Flying Blue is dynamic but predictable. Monthly Promo Rewards offer discounts. Surcharges apply ($200–$350 OW)." },
  "Turkish":       { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/turkish-airlines-miles-smiles-guide/",    partnerNote: "Miles&Smiles went fully dynamic. Book Turkish metal via other Star Alliance programs (Aeroplan, Singapore) for fixed rates." },
  "Emirates":      { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/emirates-skywards-award-chart/",          partnerNote: "Emirates Skywards is dynamic. No partner programs offer Emirates at a fixed rate — you must use Skywards miles." },
  "Aeromexico":    { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/aeromexico-club-premier-award-chart/",    partnerNote: "Club Premier is dynamic. Book Aeromexico via SkyTeam partners like Flying Blue or Korean Air for approximate fixed rates." },
  "Cathay Pacific":{ chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/asia-miles-award-chart/",                 partnerNote: "Asia Miles moved to dynamic pricing. Book Cathay metal via Alaska or oneworld partners for more predictable rates." },
  "EVA Air":       { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/eva-air-infinity-mileagelands-award-chart/", partnerNote: "EVA Air Infinity MileageLands is dynamic. Book via Aeroplan or Singapore for Star Alliance fixed rates." },
  "Qatar":         { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/qatar-airways-privilege-club-guide/",     partnerNote: "Avios (Qatar) is distance-based for some routes but pricing varies. Book Qatar metal via British Airways Avios for published distance-band rates." },
  "Etihad":        { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/etihad-guest-award-chart/",               partnerNote: "Etihad Guest is dynamic. No major US bank transfers to Etihad after mid-2026." },
  "Finnair":       { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/finnair-plus-award-chart/",               partnerNote: "Finnair Plus went dynamic. Book Finnair metal via Avios (BA/Iberia distance bands) for published rates." },
  "Virgin Atlantic":{ chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/virgin-atlantic-flying-club-award-chart/", partnerNote: "Flying Club has been fully dynamic since 2021. Book Virgin metal via Delta SkyMiles or Air France/KLM Flying Blue." },
  "Hawaiian":      { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/hawaiian-airlines-mileageplan-award-chart/", partnerNote: "HawaiianMiles is dynamic. Now under Alaska/Atmos; book via Alaska Mileage Plan for better rates." },
  "JetBlue":       { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/jetblue-trueblue-award-chart/",           partnerNote: "TrueBlue is fully dynamic (1.4¢/point fixed-value redemption model, not award chart)." },
  "Southwest":     { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/southwest-airlines-rapid-rewards-guide/", partnerNote: "Rapid Rewards is fully dynamic — 1.5¢/point fixed-value model, no award chart." },
  "Spirit":        { chartClass: null, dataConfidence: "estimate", sourceUrl: "https://thepointsguy.com/guide/spirit-airlines-free-spirit-award-chart/", partnerNote: "Free Spirit is dynamic. Redemption rates are low; points best used for short domestic routes." },
};

export function programChartClass(program) {
  return programMeta[program]?.chartClass ?? null;
}
export function programRtOnly(program) {
  return programMeta[program]?.rtOnly ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASS A — ZONE-BASED CHARTS
// Source: awardtravelfinder.com + program sites, verified 2026-06-04.
// All values are ONE-WAY miles (RT ÷ 2 where applicable, except ANA which is
// stored as RT total with rtOnly:true).
// C(economy, business, first) — first=null means not available/published.
// ─────────────────────────────────────────────────────────────────────────────
const C = (economy, business, first = null) => ({ economy, business, first });

// ── ANA Mileage Club partner awards (ROUND-TRIP total; rtOnly=true) ──────────
// Source: https://www.ana.co.jp/en/us/amc/partner-flight-awards/ ; verified 2026-06-04
// Seasonal: High/Regular/Low seasons exist but partner awards are NO seasonality.
// Stored as RT totals. The judge must display "RT total — partner awards require RT."
export const anaPartnerChartRT = {
  // Low range is off-peak; high is peak. Store midpoint for the baseline.
  [pairKey("North America", "North Asia")]:    C(45000, 82500, 150000), // 35k-55k / 75k-90k / 150k RT
  [pairKey("North America", "Europe")]:        C(53000, 88000, 165000), // 46k-60k / 88k / 165k RT
  [pairKey("North America", "Southeast Asia")]:C(45000, 88000, 165000), // 35k-55k / 88k / 165k RT
  [pairKey("North America", "Oceania")]:       C(46000, 90000, 165000), // 37k-55k / 90k / 165k RT
  [pairKey("Europe", "North Asia")]:           C(50500, 85500, 157500), // 45k-56k / 83k-88k / 150k-165k
  [pairKey("North Asia", "Southeast Asia")]:   C(35000, 59000, 105000), // 30k-40k / 55k-63k / 105k
  [pairKey("Europe", "Southeast Asia")]:       C(40000, 75000, 130000),
  [pairKey("North America", "South Asia")]:    C(45000, 88000, 165000),
  [pairKey("Europe", "Europe")]:               C(20000, 40000, null),
  [pairKey("North Asia", "North Asia")]:       C(20000, 40000, null),
};

// ── Aeroplan (Air Canada) — fixed for Star Alliance partners ─────────────────
// Source: awardtravelfinder.com/award-charts/aeroplan ; verified 2026-06-04
// Air Canada own metal is dynamic; partner awards remain fixed.
// Stored as one-way midpoint of published bands.
export const aeroplanChart = {
  [pairKey("North America", "North America")]:     C(9250, 25000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(15000, 30000, null),
  [pairKey("North America", "South America")]:     C(25000, 50000, null),
  [pairKey("North America", "Europe")]:            C(30000, 62500, 90000),
  [pairKey("North America", "North Asia")]:        C(38750, 68750, 93750),
  [pairKey("North America", "Southeast Asia")]:    C(38750, 68750, 93750),
  [pairKey("North America", "South Asia")]:        C(38750, 68750, 93750),
  [pairKey("North America", "Middle East")]:       C(45000, 75000, 97500),
  [pairKey("North America", "Africa")]:            C(45000, 75000, null),
  [pairKey("North America", "Oceania")]:           C(45000, 80000, 110000),
  [pairKey("Europe", "Europe")]:                   C(10000, 25000, null),
  [pairKey("Europe", "North Asia")]:               C(35000, 65000, 85000),
  [pairKey("Europe", "Southeast Asia")]:           C(35000, 65000, 85000),
  [pairKey("Europe", "Middle East")]:              C(22500, 45000, null),
  [pairKey("Europe", "Africa")]:                   C(22500, 45000, null),
  [pairKey("Europe", "Oceania")]:                  C(42500, 80000, 100000),
  [pairKey("North Asia", "North Asia")]:           C(12500, 25000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(20000, 40000, null),
  [pairKey("North Asia", "Oceania")]:              C(35000, 65000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(30000, 55000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C(12500, 25000, null),
};

// ── Alaska Airlines Mileage Plan — per-region partner table ──────────────────
// Source: awardtravelfinder.com/award-charts/alaska-airlines ; verified 2026-06-04
// Alaska uses a per-partner table rather than strict zones; region approximation.
export const alaskaChart = {
  [pairKey("North America", "North America")]:     C( 7500, 15000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(12500, 25000, null),
  [pairKey("North America", "South America")]:     C(20000, 40000, null),
  [pairKey("North America", "Europe")]:            C(25000, 56250, 80000),
  [pairKey("North America", "North Asia")]:        C(27500, 55000, 77500),
  [pairKey("North America", "Southeast Asia")]:    C(27500, 55000, 77500),
  [pairKey("North America", "South Asia")]:        C(27500, 55000, null),
  [pairKey("North America", "Middle East")]:       C(30000, 60000, null),
  [pairKey("North America", "Africa")]:            C(35000, 70000, null),
  [pairKey("North America", "Oceania")]:           C(32500, 55000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "Middle East")]:              C(22500, 45000, null),
  [pairKey("Europe", "South Asia")]:               C(25000, 50000, null),
  [pairKey("Europe", "North Asia")]:               C(30000, 60000, null),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 60000, null),
  [pairKey("Europe", "Oceania")]:                  C(40000, 75000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(17500, 35000, null),
  [pairKey("North Asia", "Oceania")]:              C(30000, 55000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(25000, 50000, null),
};

// ── Avianca LifeMiles — region-based chart ───────────────────────────────────
// Source: lifemiles.com award chart (Star Alliance partners) ; approximated from
// awardtravelfinder.com ; verified 2026-06-04 (check for devaluations).
export const aviancaChart = {
  [pairKey("North America", "North America")]:     C(7500,  15000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(7500, 15000, null),
  [pairKey("North America", "South America")]:     C(17500, 35000, null),
  [pairKey("North America", "Europe")]:            C(30000, 55000, 80000),
  [pairKey("North America", "North Asia")]:        C(35000, 60000, null),
  [pairKey("North America", "Southeast Asia")]:    C(35000, 60000, null),
  [pairKey("North America", "South Asia")]:        C(35000, 60000, null),
  [pairKey("North America", "Middle East")]:       C(30000, 55000, null),
  [pairKey("North America", "Africa")]:            C(35000, 60000, null),
  [pairKey("North America", "Oceania")]:           C(40000, 70000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "North Asia")]:               C(30000, 55000, null),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 55000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(17500, 35000, null),
  [pairKey("North Asia", "Oceania")]:              C(30000, 55000, null),
};

// ── Singapore KrisFlyer — zone chart (Star Alliance partners) ────────────────
// Source: singaporeair.com/en_UK/us/ppsclub-krisflyer/miles/saver-awards/ ;
// approximated from awardtravelfinder.com ; verified 2026-06-04.
export const singaporeChart = {
  [pairKey("North America", "North America")]:     C(10000, 25000, null),
  [pairKey("North America", "Europe")]:            C(35000, 67500, 95000),
  [pairKey("North America", "North Asia")]:        C(35000, 67500, 95000),
  [pairKey("North America", "Southeast Asia")]:    C(35000, 67500, 95000),
  [pairKey("North America", "South Asia")]:        C(35000, 67500, null),
  [pairKey("North America", "Middle East")]:       C(37500, 72500, null),
  [pairKey("North America", "Africa")]:            C(40000, 75000, null),
  [pairKey("North America", "Oceania")]:           C(40000, 75000, null),
  [pairKey("North America", "South America")]:     C(40000, 75000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 22500, 35000),
  [pairKey("Europe", "North Asia")]:               C(35000, 67500, 95000),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 57500, 80000),
  [pairKey("Europe", "South Asia")]:               C(25000, 47500, null),
  [pairKey("Europe", "Middle East")]:              C(22500, 42500, null),
  [pairKey("Europe", "Africa")]:                   C(27500, 52500, null),
  [pairKey("Europe", "Oceania")]:                  C(42500, 80000, null),
  [pairKey("Middle East", "Southeast Asia")]:      C(17500, 35000, null),
  [pairKey("Middle East", "North Asia")]:          C(25000, 50000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(17500, 35000, 50000),
  [pairKey("North Asia", "Oceania")]:              C(35000, 65000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C(10000, 22500, null),
  [pairKey("Southeast Asia", "South Asia")]:       C(12500, 25000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(30000, 57500, null),
  [pairKey("South Asia", "South Asia")]:           C( 7500, 17500, null),
};

// ── Japan Airlines (JAL) Mileage Bank — zone chart ───────────────────────────
// Source: jal.co.jp award redemption chart ; approximated from awardtravelfinder ;
// verified 2026-06-04.
export const jalChart = {
  [pairKey("North America", "North America")]:     C( 7500, 15000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(15000, 30000, null),
  [pairKey("North America", "South America")]:     C(30000, 60000, null),
  [pairKey("North America", "Europe")]:            C(30000, 57500, 80000),
  [pairKey("North America", "North Asia")]:        C(25000, 45000, 67500),
  [pairKey("North America", "Southeast Asia")]:    C(35000, 67500, 95000),
  [pairKey("North America", "South Asia")]:        C(35000, 67500, null),
  [pairKey("North America", "Middle East")]:       C(35000, 67500, null),
  [pairKey("North America", "Oceania")]:           C(40000, 75000, null),
  [pairKey("Europe", "Europe")]:                   C( 7500, 15000, null),
  [pairKey("Europe", "North Asia")]:               C(27500, 50000, 70000),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 57500, 80000),
  [pairKey("Europe", "Middle East")]:              C(20000, 40000, null),
  [pairKey("Europe", "Oceania")]:                  C(40000, 75000, null),
  [pairKey("North Asia", "North Asia")]:           C( 7500, 15000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(15000, 30000, null),
  [pairKey("North Asia", "Oceania")]:              C(30000, 57500, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(25000, 50000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C( 7500, 15000, null),
};

// ── Qantas Frequent Flyer — zone chart ───────────────────────────────────────
// Source: qantas.com rewards flight awards chart ; approximated from awardtravelfinder ;
// verified 2026-06-04. Oneworld partner redemptions.
export const qantasChart = {
  [pairKey("North America", "North America")]:     C(10000, 22500, null),
  [pairKey("North America", "Central America/Caribbean")]: C(15000, 30000, null),
  [pairKey("North America", "South America")]:     C(30000, 55000, null),
  [pairKey("North America", "Europe")]:            C(35000, 70000, 110000),
  [pairKey("North America", "North Asia")]:        C(30000, 55000, null),
  [pairKey("North America", "Southeast Asia")]:    C(35000, 70000, null),
  [pairKey("North America", "South Asia")]:        C(35000, 70000, null),
  [pairKey("North America", "Middle East")]:       C(37500, 75000, null),
  [pairKey("North America", "Oceania")]:           C(35000, 55000, 80000),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "Middle East")]:              C(22500, 45000, null),
  [pairKey("Europe", "South Asia")]:               C(27500, 55000, null),
  [pairKey("Europe", "North Asia")]:               C(30000, 55000, null),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 60000, null),
  [pairKey("Europe", "Oceania")]:                  C(40000, 82500, null),
  [pairKey("Middle East", "Oceania")]:             C(30000, 60000, null),
  [pairKey("North Asia", "Oceania")]:              C(25000, 50000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(20000, 42500, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C(10000, 22500, null),
};

// ── TAP Air Portugal Miles&Go — Star Alliance zone chart ─────────────────────
// Source: flytap.com/en-us/miles-and-go/rewards-flights/award-chart
//         awardtravelfinder.com/award-charts/tap-air-portugal — verified 2026-06-05
// One-way saver miles for partner (Star Alliance) awards.
export const tapChart = {
  [pairKey("North America", "North America")]:     C(10000, 22500, null),
  [pairKey("North America", "Central America/Caribbean")]: C(12500, 25000, null),
  [pairKey("North America", "South America")]:     C(20000, 40000, null),
  [pairKey("North America", "Europe")]:            C(30000, 60000, 90000),
  [pairKey("North America", "North Asia")]:        C(37500, 67500, null),
  [pairKey("North America", "Southeast Asia")]:    C(37500, 67500, null),
  [pairKey("North America", "South Asia")]:        C(37500, 67500, null),
  [pairKey("North America", "Middle East")]:       C(35000, 62500, null),
  [pairKey("North America", "Africa")]:            C(35000, 62500, null),
  [pairKey("North America", "Oceania")]:           C(42500, 75000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "North Asia")]:               C(32500, 60000, null),
  [pairKey("Europe", "Southeast Asia")]:           C(32500, 60000, null),
  [pairKey("Europe", "South Asia")]:               C(27500, 52500, null),
  [pairKey("Europe", "Middle East")]:              C(20000, 40000, null),
  [pairKey("Europe", "Africa")]:                   C(20000, 37500, null),
  [pairKey("Europe", "Oceania")]:                  C(42500, 77500, null),
  [pairKey("North Asia", "North Asia")]:           C(12500, 25000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(17500, 35000, null),
  [pairKey("North Asia", "Oceania")]:              C(32500, 60000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C(10000, 22500, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(27500, 52500, null),
};

// ── Thai Airways Royal Orchid Plus — Star Alliance zone chart ─────────────────
// Source: thaiairways.com/en_TH/privilege_lounge/rop/award_flights/award_chart.page
//         awardtravelfinder.com/award-charts/thai-airways — verified 2026-06-05
// One-way saver miles for partner (Star Alliance) awards.
export const thaiChart = {
  [pairKey("North America", "North America")]:     C(10000, 20000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(15000, 30000, null),
  [pairKey("North America", "South America")]:     C(25000, 45000, null),
  [pairKey("North America", "Europe")]:            C(35000, 70000, 100000),
  [pairKey("North America", "North Asia")]:        C(30000, 55000,  80000),
  [pairKey("North America", "Southeast Asia")]:    C(40000, 80000, 115000),
  [pairKey("North America", "South Asia")]:        C(40000, 80000, null),
  [pairKey("North America", "Middle East")]:       C(35000, 70000, null),
  [pairKey("North America", "Oceania")]:           C(40000, 80000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "North Asia")]:               C(30000, 60000, 90000),
  [pairKey("Europe", "Southeast Asia")]:           C(32500, 65000, 95000),
  [pairKey("Europe", "South Asia")]:               C(25000, 50000, null),
  [pairKey("Europe", "Middle East")]:              C(20000, 40000, null),
  [pairKey("Europe", "Africa")]:                   C(25000, 50000, null),
  [pairKey("Europe", "Oceania")]:                  C(42500, 85000, null),
  [pairKey("North Asia", "North Asia")]:           C(10000, 20000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(12500, 25000, 40000),
  [pairKey("North Asia", "Oceania")]:              C(30000, 60000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C(10000, 20000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(25000, 50000, null),
  [pairKey("Southeast Asia", "South Asia")]:       C(12500, 25000, null),
  [pairKey("Middle East", "North Asia")]:          C(25000, 50000, null),
  [pairKey("Middle East", "Southeast Asia")]:      C(20000, 40000, null),
};

// ── Korean Air SKYPASS — SkyTeam zone chart ───────────────────────────────────
// Source: koreanair.com/content/dam/koreanair/en/skypass/pdf/award_chart.pdf
//         awardtravelfinder.com/award-charts/korean-air — verified 2026-06-05
// One-way saver miles for partner (SkyTeam) awards.
// NOTE: No US bank currently transfers directly to Korean Air SKYPASS.
//       Useful for users holding SKYPASS miles earned via Korean Air credit cards.
export const koreanAirChart = {
  [pairKey("North America", "North America")]:     C( 7500, 15000, null),
  [pairKey("North America", "Central America/Caribbean")]: C(12500, 25000, null),
  [pairKey("North America", "South America")]:     C(25000, 50000, null),
  [pairKey("North America", "Europe")]:            C(35000, 70000,  90000),
  [pairKey("North America", "North Asia")]:        C(30000, 55000,  75000),
  [pairKey("North America", "Southeast Asia")]:    C(35000, 70000,  90000),
  [pairKey("North America", "South Asia")]:        C(35000, 70000, null),
  [pairKey("North America", "Middle East")]:       C(35000, 70000, null),
  [pairKey("North America", "Oceania")]:           C(37500, 75000, null),
  [pairKey("Europe", "Europe")]:                   C(10000, 20000, null),
  [pairKey("Europe", "North Asia")]:               C(25000, 55000,  70000),
  [pairKey("Europe", "Southeast Asia")]:           C(30000, 60000, null),
  [pairKey("Europe", "South Asia")]:               C(27500, 55000, null),
  [pairKey("Europe", "Middle East")]:              C(22500, 45000, null),
  [pairKey("Europe", "Oceania")]:                  C(40000, 80000, null),
  [pairKey("North Asia", "North Asia")]:           C( 7500, 15000, null),
  [pairKey("North Asia", "Southeast Asia")]:       C(15000, 30000, null),
  [pairKey("North Asia", "Oceania")]:              C(30000, 55000, null),
  [pairKey("Southeast Asia", "Southeast Asia")]:   C( 7500, 15000, null),
  [pairKey("Southeast Asia", "Oceania")]:          C(25000, 50000, null),
};

// Dispatch table: program → its zone chart.
export const zoneCharts = {
  "ANA": anaPartnerChartRT,
  "Aeroplan": aeroplanChart,
  "Alaska Airlines": alaskaChart,
  "Avianca": aviancaChart,
  "Singapore": singaporeChart,
  "Japan Airlines": jalChart,
  "Qantas": qantasChart,
  "TAP Air Portugal": tapChart,
  "Thai Airways": thaiChart,
  "Korean Air": koreanAirChart,
};

// ─────────────────────────────────────────────────────────────────────────────
// CLASS B — DISTANCE-BASED CHART (BA Executive Club / Iberia Plus)
// Source: ba.com/content/dam/ba/documents/pdfs/avios-flight-rewards.pdf ;
// awardtravelfinder.com/award-charts/british-airways ; verified 2026-06-04.
// Note from source: "pricing may vary with dynamic pricing or seasonal adjustments"
// but bands are the published standard levels.
// Applies to: British Airways, Iberia, Aer Lingus, Qatar Airways (Avios partners).
// ─────────────────────────────────────────────────────────────────────────────
export const aviosBands = [
  // { maxMiles, economy, business, first }
  { maxMiles:    650, economy:  4000, business:  7750, first:  null  },
  { maxMiles:   1150, economy:  6500, business: 13000, first:  null  },
  { maxMiles:   2000, economy:  8500, business: 17000, first: 25500  },
  { maxMiles:   3000, economy: 10000, business: 22000, first: 34000  },
  { maxMiles:   4000, economy: 13000, business: 29500, first: 44000  },
  { maxMiles:   5500, economy: 16250, business: 47750, first: 68000  },
  { maxMiles:   6500, economy: 21750, business: 56000, first: 85000  },
  { maxMiles: Infinity, economy: 32500, business: 68000, first: 102000 },
];

// Programs that use the Avios distance chart.
// Aer Lingus AerClub uses the same Avios distance bands as BA Executive Club.
export const aviosPrograms = new Set(["British Airways", "Iberia", "Aer Lingus"]);

export function aviosMilesForCabin(flightDistanceMi, cabin) {
  const band = aviosBands.find((b) => flightDistanceMi <= b.maxMiles);
  if (!band) return null;
  return band[cabin] ?? band.economy ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARRIER (operating airline IATA code) → { airline, alliance }
// ─────────────────────────────────────────────────────────────────────────────
export const carriers = {
  // Star Alliance
  UA: { airline: "United",            alliance: "Star Alliance" },
  AC: { airline: "Aeroplan",          alliance: "Star Alliance" },
  NH: { airline: "ANA",               alliance: "Star Alliance" },
  AV: { airline: "Avianca",           alliance: "Star Alliance" },
  SQ: { airline: "Singapore",         alliance: "Star Alliance" },
  TP: { airline: "TAP Air Portugal",  alliance: "Star Alliance" },
  TG: { airline: "Thai Airways",      alliance: "Star Alliance" },
  TK: { airline: "Turkish",           alliance: "Star Alliance" }, // program is dynamic (Class C)
  BR: { airline: "EVA Air",           alliance: "Star Alliance" },
  LH: { airline: null,                alliance: "Star Alliance" },
  LX: { airline: null,                alliance: "Star Alliance" },
  OS: { airline: null,                alliance: "Star Alliance" },
  SN: { airline: null,                alliance: "Star Alliance" },
  SK: { airline: null,                alliance: "Star Alliance" },
  NZ: { airline: null,                alliance: "Star Alliance" },
  SA: { airline: null,                alliance: "Star Alliance" },
  ET: { airline: null,                alliance: "Star Alliance" },
  CA: { airline: null,                alliance: "Star Alliance" },
  // SkyTeam
  DL: { airline: "Delta",             alliance: "SkyTeam" },
  AF: { airline: "Flying Blue",       alliance: "SkyTeam" },
  KL: { airline: "Flying Blue",       alliance: "SkyTeam" },
  AM: { airline: "Aeromexico",        alliance: "SkyTeam" },
  KE: { airline: "Korean Air",        alliance: "SkyTeam" },
  AZ: { airline: null,                alliance: "SkyTeam" },
  MU: { airline: null,                alliance: "SkyTeam" },
  VS: { airline: "Virgin Atlantic",   alliance: null },
  // Oneworld
  AA: { airline: "American Airlines", alliance: "Oneworld" },
  BA: { airline: "British Airways",   alliance: "Oneworld" },
  IB: { airline: "Iberia",            alliance: "Oneworld" },
  EI: { airline: "Aer Lingus",        alliance: null },
  CX: { airline: "Cathay Pacific",    alliance: "Oneworld" },
  JL: { airline: "Japan Airlines",    alliance: "Oneworld" },
  QF: { airline: "Qantas",            alliance: "Oneworld" },
  QR: { airline: "Qatar",             alliance: "Oneworld" },
  AY: { airline: "Finnair",           alliance: "Oneworld" },
  AS: { airline: "Alaska Airlines",   alliance: "Oneworld" },
  // Non-alliance
  EK: { airline: "Emirates",          alliance: null },
  EY: { airline: "Etihad",            alliance: null },
  B6: { airline: "JetBlue",           alliance: null },
  WN: { airline: "Southwest",         alliance: null },
  HA: { airline: "Hawaiian",          alliance: null },
  NK: { airline: "Spirit",            alliance: null },
};

export function carrierInfo(code) {
  if (!code) return null;
  return carriers[String(code).toUpperCase().trim()] || null;
}

// Legacy compatibility — kept for searchPlanner which imports this.
export const chartBasedPrograms = new Set(
  Object.entries(programMeta)
    .filter(([, m]) => m.chartClass !== null)
    .map(([k]) => k)
);
