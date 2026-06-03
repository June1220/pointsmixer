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
  ClipboardList,
  Receipt,
  ChevronDown,
  Ticket,
  Trash2,
  Plus,
  Users,
  Gauge,
  ArrowLeftRight,
} from "lucide-react";

// Bank metadata — keys mirror the labels the backend emits in `transfers`.
// Tones are calm + desaturated (no bright fintech colors), used only as thin
// accents on the treasury dots, transfer rows, and the allocation bar.
const BANKS = [
  { key: "Chase UR", label: "Chase Ultimate Rewards", tone: "#2F5D50" },
  { key: "Amex MR", label: "Amex Membership Rewards", tone: "#6B6F66" },
  { key: "Capital One", label: "Capital One Venture Miles", tone: "#9A5C4E" },
  { key: "Citi TYP", label: "Citi ThankYou Points", tone: "#54703F" },
  { key: "Bilt", label: "Bilt Rewards", tone: "#9A8456" },
];
const toneOf = (k) => (BANKS.find((b) => b.key === k) || {}).tone || "#6B7066";

const fmt = (n) => Number(n || 0).toLocaleString();

const ratioLabel = (r) => {
  const map = { 1: "1:1", 0.8: "5:4", 0.75: "4:3", 0.6: "5:3", 1.6: "1:1.6" };
  return map[r] || `1:${r}`;
};

// Maps the engine's verdict tone → result panel style modifier.
const VERDICT_CLASS = { great: "v-great", good: "v-good", fair: "v-fair", bad: "v-bad" };

function Field({ label, opt, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {opt && <span className="opt"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function ValueStat({ label, value, sub, green }) {
  return (
    <div className={`stat${green ? " green" : ""}`}>
      <p className="lab">{label}</p>
      <p className="num tnum">{value}</p>
      <p className="sub">{sub}</p>
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

  // Miles held DIRECTLY in airline programs. Rows: [{ id, airline, amount }].
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
    <>
      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <ArrowLeftRight size={17} />
            </span>
            <span className="brand-name">PointsMixer</span>
            <span className="brand-sub">Award transfer engine</span>
          </div>
          <div className="treasury-chip">
            <Wallet size={16} style={{ color: "var(--muted)" }} />
            <span>Treasury</span>
            <span className="val tnum">{fmt(totalTreasury)} pts</span>
          </div>
        </div>
      </header>

      <main className="shell">
        <div className="intro">
          <h1>Fund your award flight, the optimal way.</h1>
          <p>
            You found the seat. Tell PointsMixer what it costs and which points you hold — it
            computes the exact, lowest-value-cost way to transfer your way there.
          </p>
        </div>

        <div className="grid">
          {/* ── LEFT: inputs ─────────────────────────────────────────────── */}
          <div className="stack">
            <section className="card">
              <div className="card-head">
                <div className="card-title">
                  <Plane className="ic" size={18} /> Target flight
                </div>
                <p className="card-desc">Already confirmed your award seat? Enter what it costs.</p>
              </div>

              <Field label="Airline program">
                <div className="select-wrap">
                  <select
                    className="select"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    {allAirlines.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="chev" size={16} />
                </div>
              </Field>

              <Field label="Total points required">
                <input
                  type="number"
                  className="input lg tnum"
                  value={pointsRequired}
                  min={0}
                  step={1000}
                  onChange={(e) =>
                    setPointsRequired(e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0)
                  }
                />
              </Field>

              <Field
                label="Cash price of this ticket"
                opt
                hint="Lets us tell you if this award is actually worth it vs. paying cash."
              >
                <div className="money-wrap">
                  <span className="dollar">$</span>
                  <input
                    type="number"
                    className="input tnum"
                    value={cashPrice}
                    min={0}
                    step={50}
                    placeholder="e.g. 4200"
                    onChange={(e) =>
                      setCashPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>
              </Field>
            </section>

            <section className="card">
              <div className="card-head">
                <div className="card-title">
                  <Wallet className="ic" size={18} /> Your point treasury
                </div>
                <p className="card-desc">Enter your current balance in each program.</p>
              </div>
              <div>
                {BANKS.map((bank) => (
                  <div key={bank.key} className="balrow">
                    <span className="bank-dot" style={{ background: bank.tone }} />
                    <span className="bank-name">
                      {bank.label}
                      {pointValues[bank.key] != null && (
                        <span className="bank-cpp">
                          ~{(pointValues[bank.key] * 100).toFixed(2)}¢/pt
                        </span>
                      )}
                    </span>
                    <input
                      type="number"
                      className="input right bal-input tnum"
                      value={balances[bank.key]}
                      min={0}
                      step={1000}
                      onChange={(e) => setBalance(bank.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <div className="card-title">
                  <Ticket className="ic" size={18} /> Miles you already have
                </div>
                <p className="card-desc">
                  Hold miles directly in an airline program (e.g. AAdvantage from a Citi AA card)?
                  Add them — they’re used first, with no transfer.
                </p>
              </div>

              {directRows.length > 0 && (
                <div>
                  {directRows.map((row) => (
                    <div key={row.id} className="airline-row">
                      <div className="select-wrap" style={{ flex: 1 }}>
                        <select
                          className="select"
                          value={row.airline}
                          onChange={(e) => updateDirectRow(row.id, { airline: e.target.value })}
                        >
                          {allAirlines
                            .filter((a) => a === row.airline || !usedAirlines.includes(a))
                            .map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="chev" size={16} />
                      </div>
                      <input
                        type="number"
                        className="input right tnum"
                        style={{ width: 116 }}
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
                      />
                      <button
                        className="icon-btn"
                        aria-label="Remove"
                        onClick={() => removeDirectRow(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="add-row"
                onClick={addDirectRow}
                disabled={availableAirlines.length === 0}
              >
                <Plus size={15} /> Add airline balance
              </button>
            </section>

            <button className="btn-primary" onClick={handleCalculate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Calculating…
                </>
              ) : (
                <>
                  <Calculator size={18} /> Calculate transfer blueprint
                </>
              )}
            </button>
          </div>

          {/* ── RIGHT: results ───────────────────────────────────────────── */}
          <div className="results-col">
            <Blueprint loading={loading} error={error} result={result} />
          </div>
        </div>
      </main>
    </>
  );
}

// ── Blueprint output panel ──────────────────────────────────────────────────
function Blueprint({ loading, error, result }) {
  if (loading) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="spinner" style={{ marginBottom: 18 }} />
          <h3>Calculating optimal allocation</h3>
          <p>Minimizing the dollar value of points spent.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div
          className="note-box"
          style={{ background: "var(--neg-soft)", borderColor: "var(--neg-line)" }}
        >
          <AlertTriangle size={18} style={{ color: "var(--neg)", flex: "none" }} />
          <div>
            <p className="note-title">Couldn’t build the blueprint</p>
            <p className="note-body" style={{ color: "var(--neg)" }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="ring">
            <Receipt size={22} />
          </div>
          <h3>Your blueprint appears here</h3>
          <p>Enter your flight and balances, then calculate to get an exact transfer plan.</p>
        </div>
      </div>
    );
  }

  // ── Insufficient ──
  if (!result.isPossible) {
    return (
      <div className="panel">
        <div className="fade">
          <div
            className="note-box"
            style={{
              background: "var(--neg-soft)",
              borderColor: "var(--neg-line)",
              marginBottom: 18,
            }}
          >
            <AlertTriangle size={18} style={{ color: "var(--neg)", flex: "none" }} />
            <div>
              <p className="note-title">Insufficient valid points</p>
              <p className="note-body" style={{ color: "var(--neg)" }}>
                You’re short <b>{fmt(result.shortfall)}</b> points in programs that actually transfer
                to <b>{result.program}</b>.
              </p>
            </div>
          </div>

          <div className="callout info" style={{ display: "block" }}>
            <p className="sec-label" style={{ marginBottom: 12 }}>
              Banks that partner with {result.program}
            </p>
            {result.validPartners?.length ? (
              <div className="chips">
                {result.validPartners.map((p) => (
                  <span key={p} className="chip">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                None of your current programs transfer to this airline. Double-check the program
                name.
              </p>
            )}
            <p style={{ margin: "14px 0 0", color: "var(--muted)", fontSize: 13 }}>
              Earn or move at least{" "}
              <b style={{ color: "var(--ink)" }}>{fmt(result.shortfall)}</b> more points into the
              programs above.
            </p>
          </div>

          {result.rationale && <Rationale text={result.rationale} />}
        </div>
      </div>
    );
  }

  // ── Success ──
  const totalTransfer = result.transfers.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="panel">
      <div className="fade">
        <div className="result-head">
          <span className="pill pos">
            <CheckCircle2 size={13} /> Fundable
          </span>
          <p className="lead">Transfer blueprint for</p>
          <p className="prog">{result.program}</p>
          <p className="req tnum">{fmt(result.pointsRequired)} points required</p>
        </div>

        {/* Verdict */}
        {result.redemption && (
          <div className={`verdict ${VERDICT_CLASS[result.redemption.tone]} block`}>
            <Gauge className="ic" size={17} style={{ marginTop: 3, flex: "none" }} />
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="cpp tnum">{result.redemption.centsPerPoint}¢</span>
                <span className="unit">per mile redemption value</span>
              </div>
              <p className="txt">{result.redemption.verdict}</p>
            </div>
          </div>
        )}

        {/* Direct miles */}
        {result.directApplied > 0 && (
          <div className="block">
            <p className="sec-label">Already in your account</p>
            <div className="note-box pos direct-applied">
              <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                <CheckCircle2 className="ic pos" size={18} style={{ flex: "none" }} />
                <div>
                  <p className="note-title">{result.airline} miles</p>
                  <p className="note-body">No transfer needed</p>
                </div>
              </div>
              <div>
                <p className="num tnum">{fmt(result.directApplied)}</p>
                <p className="num-sub">miles applied</p>
              </div>
            </div>
          </div>
        )}

        {/* Alliance hint */}
        {result.allianceMiles && result.allianceMiles.length > 0 && (
          <div className="note-box info block">
            <Users className="ic info" size={17} style={{ flex: "none", marginTop: 2 }} />
            <div>
              <p className="note-title" style={{ color: "var(--info)" }}>
                Alliance option: you may not need to transfer
              </p>
              <p className="note-body">
                You hold{" "}
                {result.allianceMiles.map((m) => `${fmt(m.amount)} ${m.airline}`).join(" + ")} — same{" "}
                {result.allianceMiles[0].alliance} as {result.airline}. Many{" "}
                {result.allianceMiles[0].alliance} programs can book a partner’s seat, so you might
                redeem this award directly. Award prices differ by program, so check the cost there
                before transferring.
              </p>
            </div>
          </div>
        )}

        {/* Transfers */}
        {result.transfers.length === 0 ? (
          <div className="note-box pos block" style={{ textAlign: "center", display: "block" }}>
            <p className="note-title" style={{ color: "var(--pos)" }}>
              No transfers required
            </p>
            <p className="note-body">
              Your existing {result.airline} miles cover this award outright — keep all your bank
              points.
            </p>
          </div>
        ) : (
          <div className="block">
            <p className="sec-label">
              {result.directApplied > 0 ? "Then transfer the rest" : "Pull from these banks"}
            </p>
            {result.transfers.map((t, i) => {
              const meta = BANKS.find((b) => b.key === t.bank);
              return (
                <div key={i} className="xfer">
                  <div className="xfer-l">
                    <span className="xfer-bar" style={{ background: toneOf(t.bank) }} />
                    <div>
                      <p className="xfer-bank">{meta?.label || t.bank}</p>
                      <p className="xfer-route">
                        → {result.airline || result.program}
                        {t.effRatio !== 1 && (
                          <span className="ratio">
                            {" "}
                            ({ratioLabel(t.baseRatio)}
                            {t.bonus > 0 && ` +${Math.round(t.bonus * 100)}%`})
                          </span>
                        )}
                      </p>
                      {(t.days > 0 || t.fee > 0 || t.bonus > 0) && (
                        <div className="tags">
                          {t.days > 0 && <span className="tag time">~{t.days}d transfer</span>}
                          {t.fee > 0 && <span className="tag fee">~${fmt(t.fee)} fee</span>}
                          {t.bonus > 0 && <span className="tag bonus">bonus active</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="xfer-r">
                    <p className="xfer-amt tnum">{fmt(t.amount)}</p>
                    <p className="xfer-amt-sub">
                      {t.effRatio !== 1 ? `pts → ${fmt(t.milesDelivered)} mi` : "points"}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="allocbar">
              {result.transfers.map((t, i) => (
                <div
                  key={i}
                  title={`${t.bank}: ${fmt(t.amount)}`}
                  style={{
                    width: `${(t.amount / totalTransfer) * 100}%`,
                    background: toneOf(t.bank),
                  }}
                />
              ))}
            </div>

            <div className="total-row">
              <span className="lab">Total transferred</span>
              <span className="val tnum">{fmt(totalTransfer)} pts</span>
            </div>
          </div>
        )}

        {/* Value summary */}
        {result.valueSummary && result.transfers.length > 0 && (
          <div className="stats">
            <ValueStat
              label="Value of points spent"
              value={`$${fmt(result.valueSummary.totalCostUSD)}`}
              sub={
                result.valueSummary.feesUSD > 0
                  ? `incl. $${fmt(result.valueSummary.feesUSD)} fees`
                  : "no transfer fees"
              }
            />
            <ValueStat
              green
              label="Treasury value preserved"
              value={`$${fmt(result.valueSummary.preservedValueUSD)}`}
              sub="left in your accounts"
            />
          </div>
        )}

        {result.warning && (
          <div className="callout warn block" style={{ alignItems: "flex-start" }}>
            <AlertTriangle className="ic warn" size={16} />
            <p style={{ margin: 0 }}>{result.warning}</p>
          </div>
        )}

        {result.rationale && <Rationale text={result.rationale} />}

        {/* Checklist */}
        <div className="checklist">
          <p className="sec-label" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ClipboardList size={14} style={{ color: "var(--green)" }} /> Execution checklist
          </p>
          {[
            "Confirm the seat is still available on the airline’s own website.",
            "Log into your bank portals and initiate the transfers above.",
            "If points don’t show immediately, log out and back into the airline portal.",
            "Book the ticket.",
          ].map((step, i) => (
            <div key={i} className="step">
              <span className="step-num">{i + 1}</span>
              <span className="step-txt">{step}</span>
            </div>
          ))}
        </div>

        {result.dataAsOf && (
          <p className="footnote">
            Transfer data as of {result.dataAsOf}
            {result.valuationsAsOf && ` · point valuations as of ${result.valuationsAsOf}`} ·
            computed locally, no API
          </p>
        )}
      </div>
    </div>
  );
}

function Rationale({ text }) {
  return (
    <div className="callout info block" style={{ alignItems: "flex-start" }}>
      <Info className="ic info" size={16} />
      <div>
        <p className="r-title">Strategic rationale</p>
        <p style={{ margin: 0, color: "var(--body)" }}>{text}</p>
      </div>
    </div>
  );
}
