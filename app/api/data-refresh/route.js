// ─────────────────────────────────────────────────────────────────────────────
// /api/data-refresh — Cash price sampling endpoint for the weekly AI refresh.
//
// NOT for production use — only called by Claude during a local refresh session
// to get real Duffel cash prices for computing award peg cents (CPP).
//
// POST { routes: [{ origin, destination, cabin, dates: ["YYYY-MM-DD", ...] }] }
// Returns { results: [{ origin, destination, cabin, date, cashUSD, carrier }] }
//
// Strategy: for each route, tries each date and keeps the median fare found.
// Requires DUFFEL_ACCESS_TOKEN env var — returns { needsKey: true } if absent.
// ─────────────────────────────────────────────────────────────────────────────
import { searchFlights, hasDuffelKey } from "../../lib/duffel";

export const runtime = "nodejs";

export async function POST(req) {
  if (!hasDuffelKey()) {
    return Response.json({ needsKey: true, results: [] });
  }

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const routes = Array.isArray(body?.routes) ? body.routes : [];
  if (routes.length === 0 || routes.length > 20) {
    return Response.json({ error: "Provide 1–20 routes." }, { status: 400 });
  }

  const results = [];

  for (const route of routes) {
    const { origin, destination, cabin = "economy", dates = [] } = route;
    if (!origin || !destination || dates.length === 0) continue;

    const fares = [];
    for (const date of dates.slice(0, 3)) { // max 3 dates per route
      try {
        const { offers } = await searchFlights({ origin, destination, date, cabin, adults: 1, max: 10 });
        if (offers.length > 0) {
          // Take the median offer price for this date (exclude outliers)
          const prices = offers.map(o => o.cashPrice).filter(p => p > 0).sort((a, b) => a - b);
          const median = prices[Math.floor(prices.length / 2)];
          if (median) fares.push({ date, cashUSD: median, carrier: offers[0].carrierName });
        }
      } catch {
        // Skip failed date, try next
      }
    }

    if (fares.length > 0) {
      // Return the median across all sampled dates
      const sorted = fares.sort((a, b) => a.cashUSD - b.cashUSD);
      const best = sorted[Math.floor(sorted.length / 2)];
      results.push({ origin, destination, cabin, ...best });
    }
  }

  return Response.json({ needsKey: false, results });
}
