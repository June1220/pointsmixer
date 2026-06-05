// ─────────────────────────────────────────────────────────────────────────────
// Duffel flight-search wrapper (server-only).
//
// Real airline content (cash fares + operating carriers + segments). Auth is a
// single access token — NEVER commit it:
//   DUFFEL_ACCESS_TOKEN   (test tokens start with "duffel_test_...")
//
// If the token is absent, searchFlights() returns { offers: [], needsKey: true }
// so the UI prompts to connect the API — we never fabricate flights.
//
// NOTE on test tokens: Duffel's TEST environment mostly returns the fictional
// "Duffel Airways" (IATA "ZZ"), which maps to no real loyalty program — so test
// searches will usually show "no fundable options". Use a LIVE token (activate
// your Duffel account) to see real carriers and the full ranking.
// ─────────────────────────────────────────────────────────────────────────────
import { carrierInfo } from "../data/awardCharts";

const API = "https://api.duffel.com";

export function hasDuffelKey() {
  return Boolean(process.env.DUFFEL_ACCESS_TOKEN);
}

const CABIN_MAP = {
  economy: "economy",
  premium: "premium_economy",
  business: "business",
  first: "first",
};

// Normalize one Duffel offer (single one-way slice) into our internal shape.
// Award bookability follows the OPERATING carrier; a single alliance is assigned
// only if every segment shares it, else mixedAlliance=true.
function normalizeOffer(offer) {
  const slice = offer.slices?.[0];
  const segs = slice?.segments || [];
  const first = segs[0];
  const last = segs[segs.length - 1];

  const opCodes = segs
    .map((s) => s.operating_carrier?.iata_code || s.marketing_carrier?.iata_code)
    .filter(Boolean);
  const primary = opCodes[0] || offer.owner?.iata_code || null;

  const allianceList = opCodes.map((c) => carrierInfo(c)?.alliance || null);
  const uniqueAlliances = [...new Set(allianceList)];
  let alliance = null;
  let mixedAlliance = false;
  if (uniqueAlliances.length === 1) alliance = uniqueAlliances[0];
  else mixedAlliance = true;

  const ownProgram = carrierInfo(primary)?.airline || null;
  // Prefer the embedded operating-carrier name; fall back to owner.
  const primaryName =
    segs.find((s) => (s.operating_carrier?.iata_code || s.marketing_carrier?.iata_code) === primary)
      ?.operating_carrier?.name ||
    offer.owner?.name ||
    primary;
  const operatingCarrierNames = [
    ...new Set(segs.map((s) => s.operating_carrier?.name).filter(Boolean)),
  ];

  return {
    carrierCode: primary,
    carrierName: primaryName,
    operatingCarriers: [...new Set(opCodes)],
    operatingCarrierNames: operatingCarrierNames.length ? operatingCarrierNames : [primaryName],
    alliance,
    mixedAlliance,
    ownProgram,
    cashPrice: Math.round(Number(offer.total_amount) || 0),
    currency: offer.total_currency || "USD",
    stops: Math.max(0, segs.length - 1),
    depart: first?.departing_at || null,
    arrive: last?.arriving_at || null,
    duration: slice?.duration || null,
    origin: first?.origin?.iata_code || null,
    destination: last?.destination?.iata_code || null,
  };
}

/**
 * Search flights (ONE-WAY). Returns { offers, needsKey }.
 * input: { origin, destination, date, cabin, adults, max }
 */
export async function searchFlights({ origin, destination, date, cabin = "economy", adults = 1, max = 30 }) {
  if (!hasDuffelKey()) return { offers: [], needsKey: true };

  const passengers = Array.from({ length: Math.max(1, adults) }, () => ({ type: "adult" }));
  const body = {
    data: {
      slices: [
        {
          origin: String(origin).toUpperCase(),
          destination: String(destination).toUpperCase(),
          departure_date: date,
        },
      ],
      passengers,
      cabin_class: CABIN_MAP[cabin] || "economy",
    },
  };

  const res = await fetch(`${API}/air/offer_requests?return_offers=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
      "Duffel-Version": "v2",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Duffel search failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const rawOffers = json.data?.offers || [];
  const offers = rawOffers.slice(0, max).map(normalizeOffer);
  return { offers, needsKey: false };
}
