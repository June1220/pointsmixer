"use client";

import { useMemo, useState } from "react";
import { allAirlines, pointValues } from "./data/transferPartners";
import {
  Plane,
  Wallet,
  Calculator,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ClipboardList,
  Receipt,
  Sparkles,
  ChevronDown,
  Ticket,
  Trash2,
  Plus,
  Users,
  Gauge,
} from "lucide-react";

// Bank metadata — keys mirror the labels the backend emits in `transfers`.
const BANKS = [
  { key: "Chase UR", label: "Chase Ultimate Rewards", short: "Chase UR", color: "#2563eb" },
  { key: "Amex MR", label: "Amex Membership Rewards", short: "Amex MR", color: "#7c3aed" },
  { key: "Capital One", label: "Capital One Venture Miles", short: "Capital One", color: "#dc2626" },
  { key: "Citi TYP", label: "Citi ThankYou Points", short: "Citi TYP", color: "#059669" },
  { key: "Bilt", label: "Bilt Rewards", short: "Bilt", color: "#e2a03f" },
];

const fmt = (n) => Number(n || 0).toLocaleString();

const ratioLabel = (r) => {
  const map = { 1: "1:1", 0.8: "5:4", 0.75: "4:3", 0.6: "5:3", 1.6: "1:1.6" };
  return map[r] || `1:${r}`;
};

// Color treatment for the redemption-value verdict.
const VERDICT_STYLES = {
  great: { box: "bg-emerald-950/40 border-emerald-700/50", icon: "text-emerald-300", text: "text-emerald-200/90" },
  good: { box: "bg-sky-950/40 border-sky-700/50", icon: "text-sky-300", text: "text-sky-200/90" },
  fair: { box: "bg-amber-950/40 border-amber-700/50", icon: "text-amber-300", text: "text-amber-200/90" },
  bad: { box: "bg-rose-950/40 border-rose-700/50", icon: "text-rose-300", text: "text-rose-200/90" },
};

// Small stat tile used in the value summary.
function ValueStat({ label, value, sub, tone }) {
  const ring = tone === "emerald" ? "border-emerald-700/40" : "border-violet-700/40";
  const val = tone === "emerald" ? "text-emerald-300" : "text-violet-300";
  return (
    <div className={`bg-slate-800/50 border ${ring} rounded-xl px-4 py-3`}>
      <p className="text-slate-400 text-[11px] uppercase tracking-wider">{label}</p>
      <p className={`font-black text-lg ${val} mt-0.5`}>{value}</p>
      <p className="text-slate-500 text-xs">{sub}</p>
    </div>
  );
}

export default function Page() {
  const [program, setProgram] = useState("Flying Blue");
  const [pointsRequired, setPointsRequired] = useState(150000);
  const [cashPrice, setCashPrice] = useState(4200);
  const [balances, setBalances] = useState({
    "Chase UR": 120000,
    "Amex MR": 90000,
    "Capital One": 60000,
    "Citi TYP": 40000,
    Bilt: 30000,
  });

  // Miles the user already holds DIRECTLY in airline programs (e.g. AAdvantage
  // from a Citi AA card). Dynamic add-your-own rows: [{ id, airline, amount }].
  const [directRows, setDirectRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const totalTreasury = useMemo(
    () => Object.values(balances).reduce((s, v) => s + (Number(v) || 0), 0),
    [balances]
  );

  const setBalance = (key, value) => {
    const v = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setBalances((b) => ({ ...b, [key]: v }));
  };

  // ── Direct airline-miles row helpers ──────────────────────────────────────
  const usedAirlines = directRows.map((r) => r.airline);
  const availableAirlines = allAirlines.filter((a) => !usedAirlines.includes(a));

  const addDirectRow = () => {
    const next = availableAirlines[0];
    if (!next) return;
    setDirectRows((rows) => [
      ...rows,
      { id: Date.now() + Math.random(), airline: next, amount: 0 },
    ]);
  };
  const updateDirectRow = (id, patch) =>
    setDirectRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeDirectRow = (id) =>
    setDirectRows((rows) => rows.filter((r) => r.id !== id));

  // Collapse rows into { airline: amount } for the request.
  const directBalances = useMemo(() => {
    const out = {};
    for (const r of directRows) {
      const amt = Number(r.amount) || 0;
      if (amt > 0) out[r.airline] = (out[r.airline] || 0) + amt;
    }
    return out;
  }, [directRows]);

  async function handleCalculate() {
    setError(null);
    setResult(null);
    if (!program.trim()) {
      setError("Enter the target airline program.");
      return;
    }
    if (!pointsRequired || pointsRequired <= 0) {
      setError("Enter the total points the flight costs.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: program.trim(),
          pointsRequired: Number(pointsRequired),
          balances,
          directBalances,
          cashPrice: Number(cashPrice) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight">PointsMixer</span>
              <span className="hidden sm:inline text-slate-500 text-sm ml-2">
                Bring-Your-Own-Flight Transfer Engine
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Treasury:</span>
            <span className="font-bold text-violet-400">{fmt(totalTreasury)} pts</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── LEFT: Input Ledger ─────────────────────────────────────────── */}
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-5 h-5 text-violet-400" />
                <h2 className="font-bold text-lg">Target Flight</h2>
              </div>
              <p className="text-slate-500 text-sm mb-5">
                Already confirmed your award seat? Enter what it costs.
              </p>

              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Airline Program
              </label>
              <div className="relative mb-4">
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-100 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  {allAirlines.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Total Points Required
              </label>
              <input
                type="number"
                value={pointsRequired}
                min={0}
                step={1000}
                onChange={(e) =>
                  setPointsRequired(e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0)
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-lg font-bold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />

              <label className="block text-sm font-medium text-slate-300 mb-1.5 mt-4">
                Cash Price of This Ticket{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={cashPrice}
                  min={0}
                  step={50}
                  placeholder="e.g. 4200"
                  onChange={(e) =>
                    setCashPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1.5">
                Lets us tell you if this award is actually worth it vs. paying cash.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-violet-400" />
                <h2 className="font-bold text-lg">Your Point Treasury</h2>
              </div>
              <p className="text-slate-500 text-sm mb-5">
                Enter your current balance in each program.
              </p>

              <div className="space-y-3">
                {BANKS.map((bank) => (
                  <div key={bank.key} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: bank.color }}
                    />
                    <label className="flex-1 text-sm text-slate-300">
                      {bank.label}
                      {pointValues[bank.key] != null && (
                        <span className="ml-2 text-[10px] tracking-wider text-slate-500 font-semibold">
                          ~{(pointValues[bank.key] * 100).toFixed(2)}¢/pt
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={balances[bank.key]}
                      min={0}
                      step={1000}
                      onChange={(e) => setBalance(bank.key, e.target.value)}
                      className="w-32 text-right bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Direct airline miles already held */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-lg">Miles You Already Have</h2>
              </div>
              <p className="text-slate-500 text-sm mb-5">
                Already hold miles directly in an airline program (e.g. AAdvantage from a
                Citi AA card)? Add them — they’re used first, with no transfer.
              </p>

              {directRows.length > 0 && (
                <div className="space-y-3 mb-4">
                  {directRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={row.airline}
                          onChange={(e) => updateDirectRow(row.id, { airline: e.target.value })}
                          className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          {/* keep the row's current airline selectable, plus any not used by other rows */}
                          {allAirlines
                            .filter(
                              (a) => a === row.airline || !usedAirlines.includes(a)
                            )
                            .map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <input
                        type="number"
                        value={row.amount}
                        min={0}
                        step={1000}
                        onChange={(e) =>
                          updateDirectRow(row.id, {
                            amount:
                              e.target.value === ""
                                ? 0
                                : Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        className="w-28 text-right bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => removeDirectRow(row.id)}
                        aria-label="Remove"
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addDirectRow}
                disabled={availableAirlines.length === 0}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-600 hover:border-emerald-500/60 hover:text-emerald-300 text-slate-400 text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add airline balance
              </button>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating…
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculate Transfer Blueprint
                </>
              )}
            </button>
          </section>

          {/* ── RIGHT: Output Blueprint ────────────────────────────────────── */}
          <section className="lg:sticky lg:top-24 self-start w-full">
            <Blueprint
              loading={loading}
              error={error}
              result={result}
              pointsRequired={pointsRequired}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Blueprint output panel ──────────────────────────────────────────────────
function Blueprint({ loading, error, result, pointsRequired }) {
  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
          <p className="text-slate-300 font-medium">Calculating optimal allocation…</p>
          <p className="text-slate-500 text-sm mt-1">
            Checking transfer partners & preservation rules.
          </p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Couldn’t build the blueprint</p>
            <p className="text-red-200/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!result) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Receipt className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-300 font-medium">Your blueprint will appear here</p>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Enter your flight and balances, then hit calculate to get an exact transfer plan.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Insufficient points state ──
  if (!result.isPossible) {
    return (
      <Shell>
        <div className="fade-in">
          <div className="bg-red-950/50 border border-red-700/50 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-red-200 text-lg">Insufficient Valid Points</h3>
            </div>
            <p className="text-red-200/80 text-sm">
              You’re short{" "}
              <span className="font-bold text-white">{fmt(result.shortfall)}</span> points in
              programs that actually transfer to{" "}
              <span className="font-semibold text-white">{result.program}</span>.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Banks that partner with {result.program}
            </p>
            {result.validPartners?.length ? (
              <div className="flex flex-wrap gap-2">
                {result.validPartners.map((p) => (
                  <span
                    key={p}
                    className="text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                None of your current programs transfer to this airline. Double-check the program
                name, or you may need points in a different currency entirely.
              </p>
            )}
            <p className="text-slate-400 text-sm mt-4">
              Earn or move at least{" "}
              <span className="font-bold text-white">{fmt(result.shortfall)}</span> more points into
              the programs above to fund this flight.
            </p>
          </div>

          {result.rationale && (
            <Rationale text={result.rationale} />
          )}
        </div>
      </Shell>
    );
  }

  // ── Success state ──
  const totalTransfer = result.transfers.reduce((s, t) => s + t.amount, 0);

  return (
    <Shell>
      <div className="fade-in">
        {/* Receipt header */}
        <div className="text-center pb-5 mb-5 border-b border-dashed border-slate-700">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fundable
          </div>
          <p className="text-slate-400 text-sm">Transfer blueprint for</p>
          <h3 className="font-black text-2xl text-white">{result.program}</h3>
          <p className="text-slate-400 text-sm mt-1">
            {fmt(result.pointsRequired)} points required
          </p>
        </div>

        {/* Redemption value verdict (is this award worth it vs cash?) */}
        {result.redemption && (
          <div
            className={`mb-5 rounded-xl p-4 border flex items-start gap-2.5 ${VERDICT_STYLES[result.redemption.tone].box}`}
          >
            <Gauge className={`w-4 h-4 mt-0.5 shrink-0 ${VERDICT_STYLES[result.redemption.tone].icon}`} />
            <div className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className={`font-black text-lg ${VERDICT_STYLES[result.redemption.tone].icon}`}>
                  {result.redemption.centsPerPoint}¢
                </span>
                <span className="text-slate-400 text-xs">per mile redemption value</span>
              </div>
              <p className={`mt-1 leading-relaxed ${VERDICT_STYLES[result.redemption.tone].text}`}>
                {result.redemption.verdict}
              </p>
            </div>
          </div>
        )}

        {/* Direct miles already held */}
        {result.directApplied > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Already in your account
            </p>
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-700/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm">
                    {result.airline} miles
                  </p>
                  <p className="text-emerald-300/70 text-xs">No transfer needed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-emerald-300">{fmt(result.directApplied)}</p>
                <p className="text-emerald-300/60 text-xs">miles applied</p>
              </div>
            </div>
          </div>
        )}

        {/* Same-alliance hint: miles you hold that could book this seat via another program */}
        {result.allianceMiles && result.allianceMiles.length > 0 && (
          <div className="mb-4 bg-sky-950/30 border border-sky-700/40 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-sky-300 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-sky-200 font-semibold">
                  Alliance option: you may not need to transfer at all
                </p>
                <p className="text-sky-300/80 mt-1 leading-relaxed">
                  You hold{" "}
                  {result.allianceMiles
                    .map((m) => `${fmt(m.amount)} ${m.airline}`)
                    .join(" + ")}{" "}
                  — same {result.allianceMiles[0].alliance} as {result.airline}. Many{" "}
                  {result.allianceMiles[0].alliance} programs can book a seat on a partner&apos;s
                  flight, so you might redeem this award directly through{" "}
                  {result.allianceMiles.length === 1
                    ? result.allianceMiles[0].airline
                    : "one of those programs"}
                  . Award prices differ by program, so check the cost there before transferring.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No-transfer case: direct miles cover the whole award */}
        {result.transfers.length === 0 ? (
          <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl p-4 text-center mb-4">
            <p className="text-emerald-200 font-semibold">No transfers required 🎉</p>
            <p className="text-emerald-300/70 text-sm mt-1">
              Your existing {result.airline} miles cover this award outright — keep all your
              bank points.
            </p>
          </div>
        ) : (
        <>
        {/* Transfers */}
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          {result.directApplied > 0 ? "Then transfer the rest" : "Pull from these banks"}
        </p>
        <div className="space-y-2 mb-4">
          {result.transfers.map((t, i) => {
            const meta = BANKS.find((b) => b.key === t.bank);
            return (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: meta?.color || "#8b5cf6" }}
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">{meta?.label || t.bank}</p>
                    <p className="text-slate-500 text-xs">
                      → {result.airline || result.program}
                      {t.effRatio !== 1 && (
                        <span className="ml-1.5 text-amber-400/90">
                          ({ratioLabel(t.baseRatio)}
                          {t.bonus > 0 && ` +${Math.round(t.bonus * 100)}%`})
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {t.days > 0 && (
                        <span className="text-[10px] bg-amber-500/15 text-amber-300 rounded px-1.5 py-0.5">
                          ~{t.days}d transfer
                        </span>
                      )}
                      {t.fee > 0 && (
                        <span className="text-[10px] bg-rose-500/15 text-rose-300 rounded px-1.5 py-0.5">
                          ~${fmt(t.fee)} fee
                        </span>
                      )}
                      {t.bonus > 0 && (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-300 rounded px-1.5 py-0.5">
                          bonus active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-white">{fmt(t.amount)}</p>
                  <p className="text-slate-500 text-xs">
                    {t.effRatio !== 1 ? `pts → ${fmt(t.milesDelivered)} miles` : "points"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Allocation bar */}
        <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-0.5 mb-2">
          {result.transfers.map((t, i) => {
            const meta = BANKS.find((b) => b.key === t.bank);
            return (
              <div
                key={i}
                style={{
                  width: `${(t.amount / totalTransfer) * 100}%`,
                  background: meta?.color || "#8b5cf6",
                }}
                title={`${t.bank}: ${fmt(t.amount)}`}
              />
            );
          })}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-dashed border-slate-700 pt-4 mt-4">
          <span className="font-bold text-slate-300">Total transferred</span>
          <span className="font-black text-xl text-white">{fmt(totalTransfer)} pts</span>
        </div>
        </>
        )}

        {/* Value summary — the dollar truth behind the plan */}
        {result.valueSummary && result.transfers.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <ValueStat
              label="Value of points spent"
              value={`$${fmt(result.valueSummary.totalCostUSD)}`}
              sub={
                result.valueSummary.feesUSD > 0
                  ? `incl. $${fmt(result.valueSummary.feesUSD)} fees`
                  : "no transfer fees"
              }
              tone="violet"
            />
            <ValueStat
              label="Treasury value preserved"
              value={`$${fmt(result.valueSummary.preservedValueUSD)}`}
              sub="left in your accounts"
              tone="emerald"
            />
          </div>
        )}

        {result.warning && (
          <div className="mt-4 bg-amber-950/40 border border-amber-700/40 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200/90 text-sm">{result.warning}</p>
          </div>
        )}

        {result.rationale && <Rationale text={result.rationale} />}

        {/* Execution checklist */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Execution Checklist
            </p>
          </div>
          <ol className="space-y-2">
            {[
              "Confirm the seat is still available on the airline’s own website.",
              "Log into your bank portals and initiate the transfers above.",
              "If points don’t show immediately, log out and back into the airline portal.",
              "Book the ticket.",
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/30 rounded-lg p-3"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {result.dataAsOf && (
          <p className="mt-5 text-center text-[11px] text-slate-600">
            Transfer data as of {result.dataAsOf}
            {result.valuationsAsOf && <> · point valuations as of {result.valuationsAsOf}</>} ·
            computed locally, no API
          </p>
        )}
      </div>
    </Shell>
  );
}

function Rationale({ text }) {
  return (
    <div className="mt-4 bg-violet-950/30 border border-violet-800/40 rounded-xl p-4 flex items-start gap-2.5">
      <Info className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1">
          Strategic Rationale
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[200px]">
      {children}
    </div>
  );
}
