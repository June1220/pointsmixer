import {
  programs,
  airlineAliases,
  alliances,
  allAirlines,
  pointValues,
  defaultPointValue,
  transferIncrements,
  exciseFeeCap,
  redemptionTiers,
  carrierSurcharges,
  valuationsAsOf,
  lastUpdated,
} from "../data/transferPartners";
import { judgeAward } from "./awardEstimator";
import { getCashBallpark } from "../data/fareBands";
import { regionForAirport, pairKey } from "../data/awardCharts";

// Estimate carrier-imposed surcharge (YQ/YR) in USD for an award booking.
function getCarrierSurcharge(airline, origin, destination) {
  const entry = carrierSurcharges[airline];
  if (!entry) return { amount: 0, note: null };
  const fromRegion = regionForAirport(origin);
  const toRegion = regionForAirport(destination);
  let amount = entry.default || 0;
  if (fromRegion && toRegion) {
    const key = pairKey(fromRegion, toRegion);
    if (entry.routes && entry.routes[key] != null) amount = entry.routes[key];
  }
  return { amount, note: entry.note || null };
}

// Resolve free-text airline input to a canonical key. Returns null if unknown.
export function resolveAirline(input) {
  if (!input) return null;
  const q = String(input).toLowerCase().trim();
  for (const [needle, canonical] of airlineAliases) {
    if (q.includes(needle)) return canonical;
  }
  return null;
}

// Banks (with balances) that can transfer to the resolved airline.
function partnerBanksFor(airline) {
  const out = [];
  for (const [bank, prog] of Object.entries(programs)) {
    const partner = prog.partners[airline];
    if (partner) {
      out.push({
        bank,
        ratio: partner.ratio,
        bonus: partner.bonus || 0,
        expires: partner.expires || null,
        feePerPoint: partner.feePerPoint || 0,
        days: partner.days || 0,
        note: partner.note || null,
      });
    }
  }
  return out;
}

const usd = (n) => Math.round(n * 100) / 100;

/**
 * Value-optimized, deterministic allocation engine. No network, no LLM.
 *
 * TRUE OBJECTIVE: minimize the total DOLLAR value of points spent to fund the
 * award. Because every transfer lands in the same target program, this is a
 * fractional-knapsack problem, so greedy-fill sorted ascending by dollar cost
 * per delivered mile is provably optimal.
 *
 *   effectiveRatio   = ratio * (1 + bonus)
 *   costPerMile ($)  = (pointValue + feePerPoint) / effectiveRatio
 *
 * input: { program, pointsRequired, balances, directBalances, cashPrice }
 */
export function computeBlueprint({ program, pointsRequired, balances, directBalances, cashPrice, origin, destination, cabin }) {
  const needed = Number(pointsRequired) || 0;
  const cash = Math.max(0, Number(cashPrice) || 0);
  const airline = resolveAirline(program);

  // Unknown airline → can't map any partners.
  if (!airline) {
    return base({
      isPossible: false,
      shortfall: needed,
      rationale: `We couldn't match "${program}" to a known airline program in our 2026 transfer database. Double-check the spelling (e.g. "Flying Blue", "Aeroplan", "Virgin Atlantic").`,
      program,
      needed,
      cash,
      airline: null,
    });
  }

  const surcharge = getCarrierSurcharge(airline, origin, destination);
  const partners = partnerBanksFor(airline);
  const validPartners = partners.map((p) => p.bank);
  const allianceMiles = sameAllianceHoldings(airline, directBalances);

  // ── Direct miles already in the target program (best value: instant, 1:1) ───
  const directHeld = Math.max(0, Number(directBalances?.[airline]) || 0);
  const directApplied = Math.min(directHeld, needed);
  let remaining = needed - directApplied;

  if (remaining <= 0) {
    const r = base({
      isPossible: true,
      shortfall: 0,
      rationale: `You already hold ${directHeld.toLocaleString()} ${airline} miles — enough to cover this ${needed.toLocaleString()}-mile award outright. No transfers needed; keep all your bank points.`,
      program,
      needed,
      cash,
      airline,
    });
    r.validPartners = validPartners;
    r.allianceMiles = allianceMiles;
    r.directHeld = directHeld;
    r.directApplied = directApplied;
    r.valueSummary = summarize([], balances, []);
    r.redemption = redemptionVerdict(cash, needed, 0, surcharge.amount);
    r.surcharge = surcharge;
    return r;
  }

  // ── Capacity & per-bank economics ───────────────────────────────────────────
  const capacity = partners.map((p) => {
    const balance = Number(balances?.[p.bank]) || 0;
    const inc = transferIncrements[p.bank] || 1;
    const maxPoints = Math.floor(balance / inc) * inc; // only whole increments move
    const effRatio = p.ratio * (1 + p.bonus);
    const pv = pointValues[p.bank] ?? defaultPointValue;
    const deliverable = Math.floor(maxPoints * effRatio);
    const costPerMile = (pv + p.feePerPoint) / effRatio;
    return {
      ...p,
      balance,
      inc,
      maxPoints,
      effRatio,
      pv,
      deliverable,
      costPerMile,
    };
  });

  const totalDeliverable = capacity.reduce((s, c) => s + c.deliverable, 0);

  if (totalDeliverable < remaining) {
    const directNote =
      directApplied > 0
        ? `After applying your ${directApplied.toLocaleString()} ${airline} miles, you still need ${remaining.toLocaleString()} more. `
        : "";
    const r = base({
      isPossible: false,
      shortfall: remaining - totalDeliverable,
      rationale:
        validPartners.length === 0
          ? `${directNote}None of your five bank programs transfer to ${airline}, so you can't cover the rest.`
          : `${directNote}Your balances in the programs that partner with ${airline} only deliver ${totalDeliverable.toLocaleString()} of the remaining ${remaining.toLocaleString()} miles.`,
      program,
      needed,
      cash,
      airline,
    });
    r.validPartners = validPartners;
    r.allianceMiles = allianceMiles;
    r.directHeld = directHeld;
    r.directApplied = directApplied;
    r.redemption = redemptionVerdict(cash, needed, 0, surcharge.amount);
    r.surcharge = surcharge;
    return r;
  }

  // ── Greedy by TRUE cost ($ per mile). Tie-break: faster transfer first. ─────
  const ordered = [...capacity].sort((a, b) => {
    if (a.costPerMile !== b.costPerMile) return a.costPerMile - b.costPerMile;
    return a.days - b.days;
  });

  const transfers = [];
  const notes = [];
  for (const c of ordered) {
    if (remaining <= 0) break;
    if (c.deliverable <= 0) continue;

    const milesNeeded = Math.min(c.deliverable, remaining);
    // Bank points needed, rounded UP to the transfer increment, capped at balance.
    let bankPoints = Math.ceil(milesNeeded / c.effRatio);
    bankPoints = Math.min(Math.ceil(bankPoints / c.inc) * c.inc, c.maxPoints);

    const milesDelivered = Math.floor(bankPoints * c.effRatio);
    const contributed = Math.min(milesDelivered, remaining);
    const orphaned = milesDelivered - contributed;
    const fee = Math.min(bankPoints * c.feePerPoint, exciseFeeCap);

    transfers.push({
      bank: c.bank,
      amount: bankPoints,
      milesDelivered,
      contributed,
      orphaned,
      baseRatio: c.ratio,
      bonus: c.bonus,
      effRatio: c.effRatio,
      days: c.days,
      fee: usd(fee),
      pointValueUSD: usd(bankPoints * c.pv),
      expires: c.expires,
    });
    if (c.note) notes.push(`${c.bank} → ${airline}: ${c.note}`);
    remaining -= contributed;
  }

  const valueSummary = summarize(transfers, balances, capacity);
  const redemption = redemptionVerdict(cash, needed, valueSummary.totalCostUSD, surcharge.amount);

  // ── Rationale ───────────────────────────────────────────────────────────────
  const directPrefix =
    directApplied > 0
      ? `Applied your ${directApplied.toLocaleString()} ${airline} miles first, then funded the remaining ${(needed - directApplied).toLocaleString()} by `
      : `Funded ${needed.toLocaleString()} ${airline} miles by `;
  let rationale = directPrefix;
  rationale +=
    transfers.map((t) => `${t.amount.toLocaleString()} ${t.bank}`).join(" + ") + ". ";
  rationale += `Chosen to minimize the dollar value of points spent — about $${valueSummary.totalCostUSD.toLocaleString()} of points${
    valueSummary.feesUSD > 0 ? ` (incl. $${valueSummary.feesUSD.toLocaleString()} in fees)` : ""
  }. The engine spends your cheapest-per-point currencies first, so higher-value points are tapped only if needed, leaving $${valueSummary.preservedValueUSD.toLocaleString()} of treasury value intact.`;

  // ── Warnings (bonuses expiring, slow transfers, fees, ratios, partner notes) ─
  const warns = [];
  const bonusT = transfers.filter((t) => t.bonus > 0);
  for (const t of bonusT) {
    warns.push(
      `${t.bank} has an active +${Math.round(t.bonus * 100)}% transfer bonus to ${airline}${
        t.expires ? ` (ends ${t.expires})` : ""
      } — already factored into the plan.`
    );
  }
  const slow = transfers.filter((t) => t.days > 0);
  for (const t of slow) {
    warns.push(
      `${t.bank} → ${airline} isn't instant (~${t.days} day${t.days > 1 ? "s" : ""}). Transfer BEFORE your award space disappears.`
    );
  }
  const feeT = transfers.filter((t) => t.fee > 0);
  for (const t of feeT) {
    warns.push(`${t.bank} → ${airline} incurs a ~$${t.fee.toLocaleString()} transfer fee.`);
  }
  const ratioT = transfers.filter((t) => t.effRatio !== 1);
  for (const t of ratioT) {
    warns.push(
      `${t.bank} transfers at ${ratioLabel(t.baseRatio)}${
        t.bonus > 0 ? ` +${Math.round(t.bonus * 100)}% bonus` : ""
      } — ${t.amount.toLocaleString()} pts yield ${t.milesDelivered.toLocaleString()} miles.`
    );
  }
  const orphanTotal = transfers.reduce((s, t) => s + t.orphaned, 0);
  if (orphanTotal > 0) {
    warns.push(
      `Transfer increments leave ~${orphanTotal.toLocaleString()} extra ${airline} miles in your account beyond this award.`
    );
  }
  warns.push(...notes);

  // Cash fare ballpark: rough historical range for context only.
  // Cash fares are dynamic — no verdict, just a soft reference note.
  const fareQuality =
    origin && destination
      ? getCashBallpark(regionForAirport(origin), regionForAirport(destination), cabin)
      : null;

  // Programs the user can actually reach (at least one bank partners with them,
  // or the user holds direct miles). Used to filter "cheaper program" suggestions.
  const reachablePrograms = new Set();
  for (const prog of Object.values(programs)) {
    for (const a of Object.keys(prog.partners)) reachablePrograms.add(a);
  }
  if (directBalances && typeof directBalances === "object") {
    for (const [a, amt] of Object.entries(directBalances)) {
      if ((Number(amt) || 0) > 0) reachablePrograms.add(a);
    }
  }

  // Award-quality judgment: compare the quoted pointsRequired against the
  // chart baseline for this program/route/cabin (if provided).
  const awardQuality =
    origin && destination && airline
      ? judgeAward({
          program: airline,
          origin,
          destination,
          cabin: cabin || "economy",
          quotedMiles: needed,
          cashPrice: cash,
          allPrograms: allAirlines,
          reachablePrograms,
        })
      : null;

  // Surface surcharge warning if significant
  if (surcharge.amount > 0) {
    warns.push(`${airline} typically charges ~$${surcharge.amount.toLocaleString()} in carrier surcharges (YQ fees) on this route — you pay this in cash on top of the miles.${surcharge.note ? ` ${surcharge.note}` : ""}`);
  }

  return {
    isPossible: true,
    shortfall: 0,
    transfers,
    validPartners,
    allianceMiles,
    directHeld,
    directApplied,
    valueSummary,
    redemption,
    surcharge,
    awardQuality,
    fareQuality,
    rationale,
    warning: warns.length ? warns.join(" ") : null,
    program,
    pointsRequired: needed,
    cashPrice: cash || null,
    airline,
    origin: origin || null,
    destination: destination || null,
    cabin: cabin || null,
    dataAsOf: lastUpdated,
    valuationsAsOf,
  };
}

// Roll transfers up into a dollar-value summary across the whole treasury.
function summarize(transfers, balances, capacity) {
  const pointsCostUSD = transfers.reduce((s, t) => s + t.pointValueUSD, 0);
  const feesUSD = transfers.reduce((s, t) => s + t.fee, 0);
  const milesDelivered = transfers.reduce((s, t) => s + t.contributed, 0);
  const orphanedMiles = transfers.reduce((s, t) => s + t.orphaned, 0);

  // Value of every point NOT spent (across all five currencies).
  const spent = {};
  for (const t of transfers) spent[t.bank] = (spent[t.bank] || 0) + t.amount;
  let preservedValueUSD = 0;
  for (const [bank, pv] of Object.entries(pointValues)) {
    const bal = Number(balances?.[bank]) || 0;
    preservedValueUSD += Math.max(0, bal - (spent[bank] || 0)) * pv;
  }

  return {
    pointsCostUSD: usd(pointsCostUSD),
    feesUSD: usd(feesUSD),
    totalCostUSD: usd(pointsCostUSD + feesUSD),
    milesDelivered,
    orphanedMiles,
    preservedValueUSD: usd(preservedValueUSD),
  };
}

// Is this award actually a good deal vs paying cash? Needs the ticket's cash price.
// surchargeUSD = estimated carrier-imposed fees the traveler pays cash on top of miles.
function redemptionVerdict(cash, needed, totalCostUSD, surchargeUSD = 0) {
  if (!cash || !needed) return null;
  const yq = Math.max(0, surchargeUSD || 0);
  // Naive cpp ignores surcharges — shown for reference so users can compare to
  // standard "cents per point" benchmarks they see on blogs.
  const centsPerPoint = usd((cash / needed) * 100);
  // Adjusted cpp: what your miles are truly worth after you account for the cash
  // surcharge you still have to pay. This is the number the verdict keys on.
  const adjCpp = yq > 0 ? usd(((cash - yq) / needed) * 100) : centsPerPoint;
  // Net savings = (cash you'd otherwise pay) − ($ value of points burned) − surcharge
  const netSavingsUSD = usd(cash - totalCostUSD - yq);

  let verdict, tone;
  const yqNote = yq > 0 ? ` After ~$${yq.toLocaleString()} in carrier surcharges,` : "";
  const adjLabel = yq > 0 ? ` (${adjCpp}¢ adjusted for surcharges)` : "";

  if (totalCostUSD > 0 && cash <= totalCostUSD + yq) {
    verdict = `At ${centsPerPoint}¢/mile${adjLabel} this award costs MORE than paying cash when you include the ~$${totalCostUSD.toLocaleString()} of points${yq > 0 ? ` + ~$${yq.toLocaleString()} in carrier fees` : ""} — paying the $${cash.toLocaleString()} cash fare and keeping your points is the better move.`;
    tone = "bad";
  } else if (adjCpp >= redemptionTiers.great) {
    verdict = `Excellent redemption: ${centsPerPoint}¢/mile${adjLabel}.${yqNote} netting ~$${netSavingsUSD.toLocaleString()} vs the cash fare. Transfer with confidence.`;
    tone = "great";
  } else if (adjCpp >= redemptionTiers.good) {
    verdict = `Solid redemption: ${centsPerPoint}¢/mile${adjLabel}.${yqNote} netting ~$${netSavingsUSD.toLocaleString()} vs the cash fare.`;
    tone = "good";
  } else if (adjCpp >= redemptionTiers.fair) {
    verdict = `Fair redemption: ${centsPerPoint}¢/mile${adjLabel}.${yqNote} decent, but not a standout — make sure you're not better off saving these points for a higher-value award.`;
    tone = "fair";
  } else {
    verdict = `Weak redemption: ${centsPerPoint}¢/mile${adjLabel}.${yqNote} strongly consider paying the $${cash.toLocaleString()} cash fare and keeping your points for a better use.`;
    tone = "bad";
  }
  return { centsPerPoint, adjCentsPerPoint: yq > 0 ? adjCpp : null, surchargeUSD: yq, netSavingsUSD, verdict, tone };
}

function sameAllianceHoldings(targetAirline, directBalances) {
  const alliance = alliances[targetAirline];
  if (!alliance || !directBalances || typeof directBalances !== "object") return [];
  const out = [];
  for (const [name, amt] of Object.entries(directBalances)) {
    if (name === targetAirline) continue;
    const held = Math.max(0, Number(amt) || 0);
    if (held <= 0) continue;
    if (alliances[name] === alliance) out.push({ airline: name, amount: held, alliance });
  }
  return out;
}

// Shared shell for early-return results so every path has the same shape.
function base({ isPossible, shortfall, rationale, program, needed, cash, airline }) {
  return {
    isPossible,
    shortfall,
    transfers: [],
    validPartners: [],
    allianceMiles: [],
    directHeld: 0,
    directApplied: 0,
    valueSummary: null,
    redemption: null,
    rationale,
    warning: null,
    program,
    pointsRequired: needed,
    cashPrice: cash || null,
    airline,
    dataAsOf: lastUpdated,
    valuationsAsOf,
  };
}

function ratioLabel(r) {
  if (r === 1) return "1:1";
  if (r === 0.8) return "5:4";
  if (r === 0.75) return "4:3";
  if (r === 0.6) return "5:3";
  if (r === 1.6) return "1:1.6";
  return `1:${r}`;
}
