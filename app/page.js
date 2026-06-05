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
  ChevronLeft,
  ExternalLink,
  Ticket,
  Trash2,
  Plus,
  Users,
  Gauge,
  ArrowLeftRight,
  Search,
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

const CABINS = [
  { key: "economy", label: "Economy" },
  { key: "premium", label: "Premium econ." },
  { key: "business", label: "Business" },
  { key: "first", label: "First" },
];
const SORTS = [
  { key: "value", label: "Best value (¢/mi)" },
  { key: "cost", label: "Lowest $ of points" },
  { key: "points", label: "Fewest miles" },
];

// Default search date ≈ 90 days out, YYYY-MM-DD.
function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

// "2026-09-12T07:30:00" → "Sep 12, 07:30"
function fmtWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

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
  // "search" = destination-first funnel · "manual" = bring-your-own-flight.
  const [mode, setMode] = useState("manual");

  // ── Manual ("I know my flight") mode state ──────────────────────────────
  const [program, setProgram] = useState("ANA");
  const [pointsRequired, setPointsRequired] = useState(88000);
  const [cashPrice, setCashPrice] = useState(3200);
  const [mOrigin, setMOrigin] = useState("JFK");
  const [mDest, setMDest] = useState("LIS");
  const [mCabin, setMCabin] = useState("business");

  // ── Flight-search funnel state ──────────────────────────────────────────
  const [sOrigin, setSOrigin] = useState("JFK");
  const [sDest, setSDest] = useState("LIS");
  const [sDate, setSDate] = useState(defaultDate());
  const [sCabin, setSCabin] = useState("business");
  const [sAdults, setSAdults] = useState(1);
  const [sSort, setSSort] = useState("value");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchData, setSearchData] = useState(null); // { mock, query, results }
  const [selected, setSelected] = useState(null); // a chosen ranked candidate
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
          origin: mOrigin.trim().toUpperCase() || undefined,
          destination: mDest.trim().toUpperCase() || undefined,
          cabin: mCabin,
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

  async function handleSearch() {
    setSearchError(null);
    setSearchData(null);
    setSelected(null);
    const code = (v) => /^[A-Za-z]{3}$/.test(String(v || "").trim());
    if (!code(sOrigin) || !code(sDest)) {
      setSearchError("Enter 3-letter airport codes for origin and destination (e.g. JFK, LIS).");
      return;
    }
    if (sOrigin.trim().toUpperCase() === sDest.trim().toUpperCase()) {
      setSearchError("Origin and destination must differ.");
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: sOrigin.trim().toUpperCase(),
          destination: sDest.trim().toUpperCase(),
          date: sDate,
          cabin: sCabin,
          adults: Number(sAdults) || 1,
          sort: sSort,
          balances,
          directBalances,
        }),
      });
      const data = await res.json();
      if (!res.ok) setSearchError(data.error || "Search failed.");
      else setSearchData(data);
    } catch (e) {
      setSearchError("Network error — is the dev server running?");
    } finally {
      setSearchLoading(false);
    }
  }

  // Treasury + direct-miles cards are shared by both modes (rendered inline so
  // inputs keep focus across re-renders — these are plain functions, not components).
  const treasuryCard = () => (
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
                <span className="bank-cpp">~{(pointValues[bank.key] * 100).toFixed(2)}¢/pt</span>
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
  );

  const directMilesCard = () => (
    <section className="card">
      <div className="card-head">
        <div className="card-title">
          <Ticket className="ic" size={18} /> Miles you already have
        </div>
        <p className="card-desc">
          Hold miles directly in an airline program (e.g. AAdvantage from a Citi AA card)? Add
          them — they’re used first, with no transfer.
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
                      e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
              />
              <button className="icon-btn" aria-label="Remove" onClick={() => removeDirectRow(row.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="add-row" onClick={addDirectRow} disabled={availableAirlines.length === 0}>
        <Plus size={15} /> Add airline balance
      </button>
    </section>
  );

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
          <h1>Is this award worth it? How to fund it?</h1>
          <p>
            PointsMixer is a free, no-API award-travel companion. It judges whether a
            mileage cost is good or high (vs. published saver charts), tells you if the cash
            price is typical for the route, then computes the optimal way to transfer your
            credit-card points to fund it — all in one place.
          </p>
          <div style={{ display:"flex", gap:18, marginTop:12, flexWrap:"wrap", fontSize:13, color:"var(--muted)" }}>
            <span><b style={{color:"var(--ink)"}}>① Find the flight</b> — use Google Flights ↗</span>
            <span><b style={{color:"var(--ink)"}}>② Judge the price here</b> — is it a good deal?</span>
            <span><b style={{color:"var(--ink)"}}>③ Transfer plan here</b> — optimal bank → miles</span>
          </div>
        </div>

        <div className="tabs" role="tablist">
          <button
            role="tab"
            className={`tab${mode === "search" ? " on" : ""}`}
            onClick={() => setMode("search")}
          >
            Live search (optional)
          </button>
          <button
            role="tab"
            className={`tab${mode === "manual" ? " on" : ""}`}
            onClick={() => setMode("manual")}
          >
            Judge &amp; plan a flight
          </button>
        </div>

        {mode === "search" ? (
          <div className="grid">
            {/* ── LEFT: search inputs ─────────────────────────────────────── */}
            <div className="stack">
              <section className="card">
                <div className="card-head">
                  <div className="card-title">
                    <Search className="ic" size={18} /> Where to?
                  </div>
                  <p className="card-desc">Enter a route and date. Airport codes (IATA), e.g. JFK → LIS.</p>
                </div>

                <div className="route-grid">
                  <Field label="From">
                    <input
                      className="input up"
                      value={sOrigin}
                      maxLength={3}
                      placeholder="JFK"
                      onChange={(e) => setSOrigin(e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label="To">
                    <input
                      className="input up"
                      value={sDest}
                      maxLength={3}
                      placeholder="LIS"
                      onChange={(e) => setSDest(e.target.value.toUpperCase())}
                    />
                  </Field>
                </div>

                <Field label="Departure date">
                  <input
                    type="date"
                    className="input tnum"
                    value={sDate}
                    onChange={(e) => setSDate(e.target.value)}
                  />
                </Field>

                <div className="route-grid">
                  <Field label="Cabin">
                    <div className="select-wrap">
                      <select className="select" value={sCabin} onChange={(e) => setSCabin(e.target.value)}>
                        {CABINS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="chev" size={16} />
                    </div>
                  </Field>
                  <Field label="Travelers" hint="One-way search.">
                    <input
                      type="number"
                      className="input tnum"
                      value={sAdults}
                      min={1}
                      max={9}
                      onChange={(e) => setSAdults(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                  </Field>
                </div>

                <Field label="Rank by" hint="Award mile costs are estimates — always confirm live space and price before transferring.">
                  <div className="select-wrap">
                    <select className="select" value={sSort} onChange={(e) => setSSort(e.target.value)}>
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="chev" size={16} />
                  </div>
                </Field>
              </section>

              {treasuryCard()}
              {directMilesCard()}

              <button className="btn-primary" onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Searching…
                  </>
                ) : (
                  <>
                    <Search size={18} /> Find best ways to fly
                  </>
                )}
              </button>
            </div>

            {/* ── RIGHT: ranked results / drill-down ──────────────────────── */}
            <div className="results-col">
              {selected ? (
                <div className="panel">
                  <button className="back-btn" onClick={() => setSelected(null)}>
                    <ChevronLeft size={16} /> Back to results
                  </button>
                  <Blueprint loading={false} error={null} result={selected.blueprint} />
                </div>
              ) : (
                <SearchResults
                  loading={searchLoading}
                  error={searchError}
                  data={searchData}
                  onSelect={setSelected}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="grid">
            {/* ── LEFT: manual inputs ─────────────────────────────────────── */}
            <div className="stack">
              <section className="card">
                <div className="card-head">
                  <div className="card-title">
                    <Plane className="ic" size={18} /> Target flight
                  </div>
                  <p className="card-desc">Already confirmed your award seat? Enter what it costs.</p>
                </div>

                {/* Route — enables the award-quality baseline comparison */}
                <div className="route-grid">
                  <Field label="From (airport code)" hint="e.g. JFK, LAX, ORD">
                    <input
                      className="input up"
                      value={mOrigin}
                      maxLength={3}
                      placeholder="JFK"
                      onChange={(e) => setMOrigin(e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label="To (airport code)" hint="e.g. LIS, LHR, NRT">
                    <input
                      className="input up"
                      value={mDest}
                      maxLength={3}
                      placeholder="LIS"
                      onChange={(e) => setMDest(e.target.value.toUpperCase())}
                    />
                  </Field>
                </div>

                <Field label="Cabin">
                  <div className="select-wrap">
                    <select className="select" value={mCabin} onChange={(e) => setMCabin(e.target.value)}>
                      {CABINS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="chev" size={16} />
                  </div>
                </Field>

                <Field label="Redemption program">
                  <div className="select-wrap">
                    <select className="select" value={program} onChange={(e) => setProgram(e.target.value)}>
                      {allAirlines.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="chev" size={16} />
                  </div>
                </Field>

                <Field label="Points quoted" hint="How many miles/points the airline is asking for this award.">
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
                  hint="Enables the 'is this award worth it vs cash?' verdict."
                >
                  <div className="money-wrap">
                    <span className="dollar">$</span>
                    <input
                      type="number"
                      className="input tnum"
                      value={cashPrice}
                      min={0}
                      step={50}
                      placeholder="e.g. 3200"
                      onChange={(e) =>
                        setCashPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </div>
                </Field>
              </section>

              {treasuryCard()}
              {directMilesCard()}

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
        )}
      </main>
    </>
  );
}

// ── Search results list (ranked candidates) ─────────────────────────────────
function SearchResults({ loading, error, data, onSelect }) {
  if (loading) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="spinner" style={{ marginBottom: 18 }} />
          <h3>Searching flights & estimating awards</h3>
          <p>Finding routes, then pricing each loyalty program.</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="panel">
        <div className="note-box" style={{ background: "var(--neg-soft)", borderColor: "var(--neg-line)" }}>
          <AlertTriangle size={18} style={{ color: "var(--neg)", flex: "none" }} />
          <div>
            <p className="note-title">Search failed</p>
            <p className="note-body" style={{ color: "var(--neg)" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="ring">
            <Search size={22} />
          </div>
          <h3>Ranked options appear here</h3>
          <p>Enter a route and date, then search to compare points vs cash across airlines.</p>
        </div>
      </div>
    );
  }
  if (data.needsKey) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="ring">
            <Plane size={22} />
          </div>
          <h3>Connect a flight API to search</h3>
          <p>
            Real fares come from Duffel. Add <code>DUFFEL_ACCESS_TOKEN</code> to{" "}
            <code>.env.local</code> (sign up free at duffel.com → Developers → Access tokens),
            then restart. We don’t fake flights.
          </p>
        </div>
      </div>
    );
  }
  if (!data.results.length) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="ring">
            <Plane size={22} />
          </div>
          <h3>No fundable options found</h3>
          <p>
            We couldn’t map your points to a program that books this route, or no fares came back.
            Try another date, cabin, or a nearby airport.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel fade">
      <div className="est-flag">
        <Info className="ic" size={15} />
        <span>
          <b>Award miles are estimates.</b> Cash fares are live; points costs are modeled from
          published charts/heuristics, not real-time award space. <b>Own-airline</b> awards are
          more reliable than <b>alliance-partner</b> estimates — confirm space and price on the
          airline site before transferring.
        </span>
      </div>

      <div className="results-head">
        <p className="sec-label" style={{ margin: 0 }}>
          {data.query.origin} → {data.query.destination} · {data.query.date}
        </p>
        <span className="count">{data.results.length} flights</span>
      </div>

      {data.results.map((r, i) => (
        <ResultCard key={i} r={r} onSelect={onSelect} />
      ))}
    </div>
  );
}

function awardTypeLabel(t) {
  return t === "own" ? "own-airline award" : "alliance-partner estimate";
}

function ResultCard({ r, onSelect }) {
  const tone = VERDICT_CLASS[r.verdictTone] || "";
  return (
    <div className="rc-wrap">
      <button className={`rc${r.fundable ? "" : " dim"}`} onClick={() => onSelect(r)}>
        <div className="rc-top">
          <div>
            <p className="rc-airline">
              {r.carrierName}{" "}
              <span style={{ color: "var(--faint)", fontWeight: 500 }}>· book via {r.program}</span>
            </p>
            <p className="rc-route">
              {r.stops === 0 ? "Nonstop" : `${r.stops} stop${r.stops > 1 ? "s" : ""}`}
              {r.depart && <> · {fmtWhen(r.depart)}</>}
              {r.mixedAlliance && <> · mixed carriers</>}
            </p>
          </div>
          <div className={`rc-cpp ${tone}`}>
            <p className="big tnum">{r.centsPerPoint != null ? `${r.centsPerPoint}¢` : "—"}</p>
            <p className="lbl">per mile</p>
          </div>
        </div>

        <div className="rc-mid">
          <div className="rc-metric">
            <p className="m-lab">Cash</p>
            <p className="m-val tnum">${fmt(r.cashPrice)}</p>
          </div>
          <div className="rc-metric">
            <p className="m-lab">Est. miles</p>
            <p className="m-val tnum">{fmt(r.estPoints)}</p>
          </div>
          <div className="rc-metric">
            <p className="m-lab">Points worth</p>
            <p className="m-val green tnum">
              {r.pointsCostUSD != null ? `$${fmt(r.pointsCostUSD)}` : "—"}
            </p>
          </div>
        </div>

        <div className="rc-badges">
          <span className={`rc-badge ${r.awardType === "own" ? "chart" : "heuristic"}`}>
            {awardTypeLabel(r.awardType)}
          </span>
          <span className="rc-badge">{r.estBasis === "chart" ? "chart estimate" : "heuristic estimate"}</span>
          <span className={`rc-badge ${r.fundable ? "chart" : "no"}`}>
            {r.fundable ? "fundable" : "not enough points"}
          </span>
        </div>
      </button>

      {r.alternatives && r.alternatives.length > 0 && (
        <details className="rc-alts">
          <summary>
            +{r.alternatives.length} other program{r.alternatives.length > 1 ? "s" : ""} for this flight
          </summary>
          {r.alternatives.map((alt, j) => (
            <button key={j} className="rc-alt" onClick={() => onSelect(alt)}>
              <span className="alt-prog">
                {alt.program}
                <span className={`alt-tag ${alt.awardType === "own" ? "own" : "partner"}`}>
                  {alt.awardType === "own" ? "own" : "partner"}
                </span>
              </span>
              <span className="alt-nums tnum">
                ~{fmt(alt.estPoints)} mi · {alt.pointsCostUSD != null ? `$${fmt(alt.pointsCostUSD)}` : "—"} ·{" "}
                {alt.centsPerPoint != null ? `${alt.centsPerPoint}¢` : "—"}
                {!alt.fundable && <span className="alt-no"> · short</span>}
              </span>
            </button>
          ))}
        </details>
      )}
    </div>
  );
}

// ── Blueprint output panel ──────────────────────────────────────────────────
// ── Google Flights deep-link ────────────────────────────────────────────────
// ── Google Flights link — Step 1 ─────────────────────────────────────────────
function GoogleFlightsLink({ origin, destination }) {
  if (!origin || !destination) return null;
  const q = `Flights from ${origin} to ${destination}`;
  const href = `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="gf-link">
      <ExternalLink size={14} />
      ① Check live prices on Google Flights ↗
    </a>
  );
}

// ── Award quality panel ──────────────────────────────────────────────────────
const AQ_BAND_LABELS = {
  good:           "✓ Good deal",
  typical:        "~ Typical",
  high:           "↑ High",
  dynamic:        "Dynamic pricing",
  "rt-only":      "RT required",
  "no-baseline":  "No baseline",
};

// Where quoted miles fall within the dynamic historical range.
const RANGE_CLASS_LABELS = {
  low:     { label: "⬇ Below typical range", cls: "pos",  note: "Unusually low — confirm availability before transferring." },
  typical: { label: "✓ Within historical range", cls: "info", note: null },
  high:    { label: "⬆ Above typical range", cls: "warn", note: "This program is pricing high for this route right now." },
};

function AwardQuality({ aq, program, origin, destination, cabin, quotedMiles }) {
  if (!aq || aq.band === "no-baseline") return null;
  const band = aq.band;
  const label = AQ_BAND_LABELS[band] || band;
  return (
    <div className="aq">
      <div className="aq-head">
        <span className="aq-title">
          <Gauge size={13} /> ② Miles benchmark
        </span>
        <span className={`aq-badge ${band}`}>{label}</span>
      </div>

      {/* Dynamic program: show historical range + where quote falls */}
      {band === "dynamic" && aq.dynamicRange ? (
        <>
          <p className="aq-row">
            <b>{program}</b> uses dynamic pricing — no fixed saver chart.{" "}
            Historical observed range ({cabin}, {origin}→{destination}):{" "}
            <b>~{fmt(aq.dynamicRange.low)}–{fmt(aq.dynamicRange.high)} miles</b>.
            {aq.rangeClass && (() => {
              const rc = RANGE_CLASS_LABELS[aq.rangeClass];
              return rc ? (
                <> You&apos;re quoted <b>{fmt(quotedMiles)}</b> miles —{" "}
                  <b style={{ color: `var(--${rc.cls})` }}>{rc.label}</b>
                  {rc.note ? ` ${rc.note}` : "."}</>
              ) : null;
            })()}
          </p>
          {aq.dynamicRange.note && (
            <p className="aq-row" style={{ color: "var(--muted)", fontSize: "12.5px" }}>
              {aq.dynamicRange.note}
            </p>
          )}
          <p className="aq-source" style={{ marginTop: 6 }}>
            Historical data — not a saver guarantee. Dynamic prices vary by date and demand.{" "}
            {aq.dynamicRange.source && <>Source: {aq.dynamicRange.source}</>}
          </p>
        </>
      ) : band === "dynamic" ? (
        <p className="aq-row">
          <b>{program}</b> prices awards dynamically — no published saver chart and no
          historical range data available for this route. Award prices vary significantly.
        </p>
      ) : null}

      {/* RT-only (ANA) */}
      {band === "rt-only" && aq.baselineMiles && (
        <p className="aq-row">
          <b>{program}</b> partner awards require <b>round-trip</b> bookings. Published{" "}
          {cabin} round-trip: <b>~{fmt(aq.baselineMiles)} miles</b> total.
        </p>
      )}

      {/* Fixed-chart programs: good / typical / high */}
      {(band === "good" || band === "typical" || band === "high") && aq.baselineMiles && (
        <p className="aq-row">
          Published saver level ({cabin}, {origin}→{destination}) via{" "}
          <b>{program}</b>: ~<b>{fmt(aq.baselineMiles)} miles</b>.{" "}
          {aq.ratio != null && (
            <span>
              You&apos;re quoted{" "}
              {band === "good"
                ? "≈ the published saver level — a good value."
                : band === "typical"
                ? `~${Math.round((aq.ratio - 1) * 100)}% above the saver baseline.`
                : `~${Math.round((aq.ratio - 1) * 100)}% above the saver baseline — high for this route.`}
            </span>
          )}
        </p>
      )}

      {/* Cheaper-program hint */}
      {aq.cheaperProgram && (
        <p className="aq-alt">
          Lower-cost option: <b>{aq.cheaperProgram.program}</b> typically prices this route at{" "}
          ~<b>{fmt(aq.cheaperProgram.baseline)} miles</b>
          {aq.cheaperProgram.rtOnly ? " (RT total)" : ""}{" "}
          [{aq.cheaperProgram.basis}].
        </p>
      )}

      {aq.source && band !== "dynamic" && (
        <p className="aq-source">Source: {aq.source}</p>
      )}
    </div>
  );
}

// ── Cash fare context note (no verdict — fares are dynamic) ──────────────────
function FareQuality({ fq }) {
  // fq = { ballpark, low, high } or null
  if (!fq || !fq.ballpark) return null;
  return (
    <p className="aq-source" style={{ marginBottom: 14, marginTop: -4 }}>
      Cash context: {fq.ballpark} for this route/cabin.{" "}
      Use ① Google Flights ↗ for today&apos;s actual price.
    </p>
  );
}

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
        {/* Google Flights step-2 link */}
        {(result.cashPrice || result.pointsRequired) && (
          <GoogleFlightsLink origin={result.origin} destination={result.destination} />
        )}

        {/* Award quality judgment (miles baseline + dynamic range) */}
        <AwardQuality
          aq={result.awardQuality}
          program={result.program}
          origin={result.origin}
          destination={result.destination}
          cabin={result.cabin}
          quotedMiles={result.pointsRequired}
        />

        {/* Cash fare ballpark context note */}
        <FareQuality fq={result.fareQuality} />

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
