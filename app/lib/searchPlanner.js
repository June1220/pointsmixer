import { searchFlights } from "./duffel";
import { estimateAwardCost, candidateProgramsForOffer } from "./awardEstimator";
import { computeBlueprint } from "./engine";
import { alliances, programs, allAirlines } from "../data/transferPartners";

const MODELED = new Set(allAirlines);

// Sort comparators by mode. `own` awards (operating carrier's own program) are
// more reliable than `partner` estimates, so they win ties.
const RELIABILITY = { own: 0, partner: 1 };
const SORTERS = {
  value: (a, b) =>
    Number(b.fundable) - Number(a.fundable) ||
    (b.centsPerPoint || 0) - (a.centsPerPoint || 0) ||
    RELIABILITY[a.awardType] - RELIABILITY[b.awardType],
  cost: (a, b) =>
    Number(b.fundable) - Number(a.fundable) ||
    (a.pointsCostUSD ?? Infinity) - (b.pointsCostUSD ?? Infinity) ||
    RELIABILITY[a.awardType] - RELIABILITY[b.awardType],
  points: (a, b) =>
    Number(b.fundable) - Number(a.fundable) ||
    (a.estPoints ?? Infinity) - (b.estPoints ?? Infinity) ||
    RELIABILITY[a.awardType] - RELIABILITY[b.awardType],
};

// Build one candidate (flight × program) with estimate + engine verdict.
function buildCandidate(offer, program, awardType, { origin, destination, cabin, balances, directBalances }) {
  const est = estimateAwardCost({
    program,
    origin: offer.origin || origin,
    destination: offer.destination || destination,
    cabin,
    cashPrice: offer.cashPrice,
    oneWay: true, // Fix E: search is one-way only
  });
  if (est.points == null) return null;

  const blueprint = computeBlueprint({
    program,
    pointsRequired: est.points,
    balances,
    directBalances,
    cashPrice: offer.cashPrice,
    origin: offer.origin || origin,
    destination: offer.destination || destination,
    cabin,
  });

  return {
    program,
    awardType, // "own" | "partner"
    estPoints: est.points,
    estPointsRange: est.pointsRange ?? null,  // { low, high } for heuristic estimates only
    estBasis: est.basis,
    estConfidence: est.confidence,
    estDataConfidence: est.dataConfidence ?? null,
    estNote: est.note,
    fundable: blueprint.isPossible,
    pointsCostUSD: blueprint.valueSummary?.totalCostUSD ?? null,
    centsPerPoint: blueprint.redemption?.centsPerPoint ?? null,
    verdictTone: blueprint.redemption?.tone ?? null,
    verdict: blueprint.redemption?.verdict ?? null,
    blueprint,
  };
}

/**
 * Full search funnel (ONE-WAY).
 *
 * Returns { needsKey, query, results }.
 * Each result = ONE flight, with its BEST redemption program as the headline and
 * any other viable programs in `alternatives` (Fix C). Award type is tagged so
 * the UI can flag reliability (Fix D).
 */
export async function planSearch({
  origin,
  destination,
  date,
  cabin = "economy",
  adults = 1,
  balances = {},
  directBalances = {},
  sort = "value",
}) {
  const { offers, needsKey } = await searchFlights({ origin, destination, date, cabin, adults });
  if (needsKey) {
    return { needsKey: true, query: { origin, destination, date, cabin, adults, sort }, results: [] };
  }

  // Keep the cheapest cash offer per primary operating carrier.
  const cheapestByCarrier = new Map();
  for (const o of offers) {
    const prev = cheapestByCarrier.get(o.carrierCode);
    if (!prev || o.cashPrice < prev.cashPrice) cheapestByCarrier.set(o.carrierCode, o);
  }

  const sorter = SORTERS[sort] || SORTERS.value;
  const results = [];

  for (const offer of cheapestByCarrier.values()) {
    const candPrograms = candidateProgramsForOffer(offer, {
      alliances,
      modeledAirlines: MODELED,
    });
    if (candPrograms.length === 0) continue; // no modeled program can book this flight

    // Build + rank this flight's candidates; headline = best, rest = alternatives.
    const candidates = candPrograms
      .map((c) => buildCandidate(offer, c.program, c.awardType, { origin, destination, cabin, balances, directBalances }))
      .filter(Boolean)
      .sort(sorter);
    if (candidates.length === 0) continue;

    const [best, ...alternatives] = candidates;
    results.push({
      // flight
      carrierCode: offer.carrierCode,
      carrierName: offer.carrierName,
      operatingCarrierNames: offer.operatingCarrierNames,
      mixedAlliance: offer.mixedAlliance,
      cashPrice: offer.cashPrice,
      currency: offer.currency,
      stops: offer.stops,
      depart: offer.depart,
      arrive: offer.arrive,
      duration: offer.duration,
      // headline redemption (flattened so the comparator + UI can read it directly)
      ...best,
      // other viable programs for this same flight
      alternatives,
    });
  }

  // Rank flights by their headline candidate.
  results.sort(sorter);

  return { needsKey: false, query: { origin, destination, date, cabin, adults, sort }, results };
}

export { programs };
