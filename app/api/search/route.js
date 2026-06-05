import { planSearch } from "../../lib/searchPlanner";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Flight-search funnel endpoint.
//   POST { origin, destination, date, cabin, adults, oneWay, balances,
//          directBalances, sort }
// Returns ranked (flight × redemption program) candidates with the existing
// allocation engine's verdict attached. Award points are ESTIMATES.
// Cash data comes from Duffel (or a "connect the API" state when no token is set).
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (_) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { origin, destination, date, cabin, adults, balances, directBalances, sort } = body || {};

  const iata = (v) => /^[A-Za-z]{3}$/.test(String(v || "").trim());
  if (!iata(origin) || !iata(destination)) {
    return Response.json(
      { error: "Origin and destination must be 3-letter airport codes (e.g. JFK, LIS)." },
      { status: 400 }
    );
  }
  if (String(origin).toUpperCase() === String(destination).toUpperCase()) {
    return Response.json({ error: "Origin and destination must differ." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    return Response.json({ error: "Date must be in YYYY-MM-DD format." }, { status: 400 });
  }

  try {
    const result = await planSearch({
      origin: String(origin).toUpperCase().trim(),
      destination: String(destination).toUpperCase().trim(),
      date,
      cabin: cabin || "economy",
      adults: Math.max(1, Number(adults) || 1),
      balances: balances && typeof balances === "object" ? balances : {},
      directBalances: directBalances && typeof directBalances === "object" ? directBalances : {},
      sort: sort || "value",
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: `Flight search failed: ${e.message || "unknown error"}` },
      { status: 502 }
    );
  }
}
