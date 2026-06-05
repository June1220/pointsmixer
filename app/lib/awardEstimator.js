import {
  regionForAirport,
  pairKey,
  programMeta,
  programChartClass,
  programRtOnly,
  zoneCharts,
  aviosPrograms,
  aviosMilesForCabin,
  carrierInfo,
} from "../data/awardCharts";
import { greatCircleMiles } from "../data/airportCoords";
import { awardPegCents, defaultAwardPegCents } from "../data/transferPartners";
import { getDynamicRange, classifyVsRange } from "../data/dynamicRanges";

// Normalize cabin string to: economy | premium | business | first
export function normalizeCabin(cabin) {
  const c = String(cabin || "economy").toLowerCase();
  if (c.includes("first")) return "first";
  if (c.includes("business")) return "business";
  if (c.includes("premium")) return "premium";
  return "economy";
}

// Round to a tidy figure so we don't imply false precision.
function tidy(miles) {
  if (!miles) return null;
  if (miles >= 100000) return Math.round(miles / 5000) * 5000;
  if (miles >= 20000)  return Math.round(miles / 2500) * 2500;
  return Math.round(miles / 500) * 500;
}

// Look up a Class A zone chart cell for (program, fromRegion, toRegion, cabin).
function zoneChartMiles(program, fromRegion, toRegion, cabin) {
  const chart = zoneCharts[program];
  if (!chart) return null;
  const key = pairKey(fromRegion, toRegion);
  const cell = chart[key];
  if (!cell) return null;
  if (cabin === "premium") {
    return cell.economy != null ? Math.round(cell.economy * 1.3) : null;
  }
  return cell[cabin] ?? cell.business ?? cell.economy ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// estimateAwardCost — the core baseline lookup, three classes:
//
//   A (zone):     program's published zone chart, region-pair keyed.
//   B (distance): Avios/Iberia — great-circle distance → mileage band.
//   C (dynamic):  no fixed saver level → fall back to cash-based heuristic.
//
// input: { program, origin, destination, cabin, cashPrice, oneWay }
// returns: { points, basis, confidence, note, source, rtOnly }
// ─────────────────────────────────────────────────────────────────────────────
export function estimateAwardCost({ program, origin, destination, cabin, cashPrice, oneWay = true }) {
  const cab = normalizeCabin(cabin);
  const chartClass = programChartClass(program);
  const rtOnly = programRtOnly(program);

  // ── Class A: zone-based ───────────────────────────────────────────────────
  if (chartClass === "zone") {
    const fromRegion = regionForAirport(origin);
    const toRegion   = regionForAirport(destination);
    if (fromRegion && toRegion) {
      const rawMiles = zoneChartMiles(program, fromRegion, toRegion, cab);
      if (rawMiles != null) {
        // ANA partner awards are RT-only: stored value is the RT total.
        // We return the RT total and set rtOnly so the judge can surface it.
        return {
          points: tidy(rawMiles),
          basis: "zone-chart",
          confidence: "high",
          rtOnly,
          note: rtOnly
            ? `Based on ${program}'s published partner ${cab} zone award for ${fromRegion} ↔ ${toRegion}. IMPORTANT: ${program} requires round-trip bookings for partner awards — this is the round-trip total.`
            : `Based on ${program}'s published partner ${cab} saver level for ${fromRegion} ↔ ${toRegion}.`,
          source: "awardtravelfinder.com/award-charts — verified 2026-06-04",
        };
      }
    }
  }

  // ── Class B: distance-based (Avios/Iberia) ────────────────────────────────
  if (chartClass === "distance" || aviosPrograms.has(program)) {
    const distMi = greatCircleMiles(origin, destination);
    if (distMi != null) {
      const rawMiles = aviosMilesForCabin(distMi, cab);
      if (rawMiles != null) {
        return {
          points: tidy(rawMiles),
          basis: "distance-chart",
          confidence: "high",
          rtOnly: false,
          distanceMi: distMi,
          note: `Based on ${program}'s published Avios distance band for a ~${distMi.toLocaleString()}-mile flight (${cab}).`,
          source: "ba.com avios-flight-rewards chart — verified 2026-06-04",
        };
      }
    }
  }

  // ── Class C / fallback: cash-based heuristic ──────────────────────────────
  const cash = Math.max(0, Number(cashPrice) || 0);
  if (cash > 0) {
    const peg = awardPegCents[program] ?? defaultAwardPegCents;
    const cabinSkew = { economy: 1, premium: 1.05, business: 1.1, first: 1.15 }[cab] || 1;
    const points = (cash * 100) / (peg / cabinSkew);
    return {
      points: tidy(points),
      basis: "heuristic",
      confidence: "low",
      rtOnly: false,
      note: `${program} prices awards dynamically — no published saver chart. Rough estimate from the cash fare at ~${peg.toFixed(2)}¢/mile.`,
      source: null,
    };
  }

  return {
    points: null,
    basis: "unknown",
    confidence: "none",
    rtOnly: false,
    note: `No chart for ${program || "this program"} on ${origin}→${destination}, and no cash price for a heuristic estimate.`,
    source: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// judgeAward — compares a quoted miles cost against the chart baseline.
//
// input: { program, origin, destination, cabin, quotedMiles, cashPrice,
//          allPrograms (the full allAirlines set for alternative suggestions) }
// returns: {
//   band: "good"|"typical"|"high"|"dynamic"|"no-baseline",
//   baselineMiles, ratio, basis, source, rtOnly,
//   cheaperProgram: { program, baseline } | null,
//   note
// }
// ─────────────────────────────────────────────────────────────────────────────
export function judgeAward({ program, origin, destination, cabin, quotedMiles, cashPrice, allPrograms = [] }) {
  const cab = normalizeCabin(cabin);
  const quoted = Number(quotedMiles) || 0;
  const chartClass = programChartClass(program);

  // For dynamic programs: no fixed saver verdict, but surface historical range
  // (if available in dynamicRanges.js) and suggest a fixed-chart alternative.
  if (chartClass === null) {
    const fromRegion = regionForAirport(origin);
    const toRegion   = regionForAirport(destination);
    const dynamicRange = getDynamicRange(program, fromRegion, toRegion, cab);
    const rangeClass = dynamicRange ? classifyVsRange(quotedMiles, dynamicRange) : null;
    const alt = bestFixedAlt(program, origin, destination, cab, cashPrice, allPrograms);
    return {
      band: "dynamic",
      baselineMiles: null,
      ratio: null,
      basis: "dynamic",
      source: null,
      rtOnly: false,
      dynamicRange,   // { low, typical, high, note, source } or null
      rangeClass,     // "low" | "typical" | "high" | null (where quoted falls in history)
      cheaperProgram: alt,
      note: dynamicRange
        ? `${program} prices awards dynamically — no fixed saver chart. Historical observed range for this route: ${dynamicRange.low.toLocaleString()}–${dynamicRange.high.toLocaleString()} miles.`
        : `${program} prices awards dynamically — there's no published saver level to compare against. Award prices vary by date, demand, and availability.`,
    };
  }

  const est = estimateAwardCost({ program, origin, destination, cabin: cab, cashPrice, oneWay: true });

  if (!est.points) {
    return {
      band: "no-baseline",
      baselineMiles: null,
      ratio: null,
      basis: est.basis,
      source: est.source,
      rtOnly: est.rtOnly,
      cheaperProgram: null,
      note: est.note,
    };
  }

  const baseline = est.points;
  const ratio = quoted > 0 ? quoted / baseline : null;

  // For ANA (rtOnly): compare the quoted amount against the RT total.
  // A traveler quoting OW on ANA partners is quoting wrong, so we surface that.
  let band;
  if (est.rtOnly) {
    // Surface the RT constraint; don't attempt good/typical/high on a possibly-OW quote.
    band = "rt-only";
  } else if (ratio != null) {
    band = ratio <= 1.1 ? "good" : ratio <= 1.5 ? "typical" : "high";
  } else {
    band = "no-baseline";
  }

  const alt = (band === "high" || band === "typical")
    ? bestFixedAlt(program, origin, destination, cab, cashPrice, allPrograms)
    : null;

  return {
    band,
    baselineMiles: baseline,
    ratio: ratio != null ? Math.round(ratio * 100) / 100 : null,
    basis: est.basis,
    source: est.source,
    rtOnly: est.rtOnly,
    cheaperProgram: alt,
    note: est.note,
  };
}

// Find the lowest-baseline fixed-chart program (other than `program`) that
// could also book this route, for the cheaper-program hint.
function bestFixedAlt(excludeProgram, origin, destination, cabin, cashPrice, allPrograms) {
  let best = null;
  for (const prog of allPrograms) {
    if (prog === excludeProgram) continue;
    if (!programChartClass(prog)) continue; // skip dynamic
    const est = estimateAwardCost({ program: prog, origin, destination, cabin, cashPrice, oneWay: true });
    if (!est.points) continue;
    if (!best || est.points < best.baseline) {
      best = { program: prog, baseline: est.points, basis: est.basis, rtOnly: est.rtOnly };
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────────────────────
// candidateProgramsForOffer — used by searchPlanner.
// ─────────────────────────────────────────────────────────────────────────────
export function candidateProgramsForOffer(offer, { alliances, modeledAirlines }) {
  const out = [];
  const seen = new Set();
  const push = (a, awardType) => {
    if (a && modeledAirlines.has(a) && !seen.has(a)) {
      seen.add(a);
      out.push({ program: a, awardType });
    }
  };
  push(offer.ownProgram, "own");
  if (!offer.mixedAlliance && offer.alliance) {
    for (const [airline, alliance] of Object.entries(alliances)) {
      if (alliance === offer.alliance) push(airline, "partner");
    }
  }
  return out;
}
