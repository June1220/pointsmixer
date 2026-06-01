import { computeBlueprint } from "../../lib/engine";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic allocation engine — NO LLM, NO API KEY, NO PER-CALL COST.
// The transfer-partner "source of truth" lives in app/data/transferPartners.js.
// Ask Claude Code to "refresh the PointsMixer transfer data" to update it.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (_) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { program, pointsRequired, balances, directBalances, cashPrice } = body || {};

  if (!program || typeof program !== "string" || !program.trim()) {
    return Response.json(
      { error: "Target Airline Program is required." },
      { status: 400 }
    );
  }
  const needed = Number(pointsRequired);
  if (!Number.isFinite(needed) || needed <= 0) {
    return Response.json(
      { error: "Total Points Required must be a positive number." },
      { status: 400 }
    );
  }
  if (!balances || typeof balances !== "object") {
    return Response.json({ error: "User balances are required." }, { status: 400 });
  }

  const result = computeBlueprint({
    program: program.trim(),
    pointsRequired: needed,
    balances,
    directBalances: directBalances && typeof directBalances === "object" ? directBalances : {},
    cashPrice: Number(cashPrice) || 0,
  });

  return Response.json(result);
}
