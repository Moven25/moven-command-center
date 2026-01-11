// src/pages/LaneCommand.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LaneCommand.css";

/**
 * Lane Command (v1)
 * - Select lane dropdown (updates URL query params)
 * - Quick Actions now WORK (localStorage + modals + copy)
 */

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function statusFromNetRpm(net) {
  if (net >= 2.35) return { label: "Healthy", tone: "ok" };
  if (net >= 2.10) return { label: "Borderline", tone: "mid" };
  return { label: "Risk", tone: "risk" };
}

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function money(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

function buildSearchFromLane(lane) {
  const p = new URLSearchParams();
  if (lane?.id) p.set("laneId", lane.id);

  p.set("from", lane.from);
  p.set("to", lane.to);
  p.set("miles", String(lane.miles));
  p.set("rate", String(lane.rate));
  p.set("net", String(lane.netRpm));

  if (lane.fuel) p.set("fuel", lane.fuel);
  if (lane.detention) p.set("detention", lane.detention);
  if (lane.appt) p.set("appt", lane.appt);

  return `?${p.toString()}`;
}

function storageKeyLane(laneId) {
  return `lanesync:lane:${laneId || "demo"}`;
}
function storageKeyNotes(laneId) {
  return `lanesync:laneNotes:${laneId || "demo"}`;
}
function storageKeySavedLanes() {
  return `lanesync:savedLanes`;
}
function storageKeyTargets() {
  return `lanesync:laneTargets`;
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export default function LaneCommand() {
  const query = useQuery();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("intel"); // intel | dtl | history | profit

  // ---------- UI helpers (toast + modal) ----------
  const [toast, setToast] = useState(null); // {msg}
  const toastNow = (msg) => {
    setToast({ msg });
    window.clearTimeout(toastNow._t);
    toastNow._t = window.setTimeout(() => setToast(null), 2400);
  };

  const [modal, setModal] = useState(null);
  // modal shapes:
  // { type:"note" }
  // { type:"rateBump", bump, text }
  // { type:"targetRpm" }

  const closeModal = () => setModal(null);

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      toastNow("Copied to clipboard.");
    } catch {
      toastNow("Copy failed — try manually selecting the text.");
    }
  };

  // ---------- Lane options (demo set) ----------
  const laneOptions = useMemo(
    () => [
      {
        id: "chi-dal",
        label: "Chicago, IL → Dallas, TX",
        from: "Chicago, IL",
        to: "Dallas, TX",
        miles: 920,
        rate: 2600,
        netRpm: 2.17,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "Needs window",
      },
      {
        id: "dal-mem",
        label: "Dallas, TX → Memphis, TN",
        from: "Dallas, TX",
        to: "Memphis, TN",
        miles: 452,
        rate: 1050,
        netRpm: 1.88,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "FCFS",
      },
      {
        id: "chi-atl",
        label: "Chicago, IL → Atlanta, GA",
        from: "Chicago, IL",
        to: "Atlanta, GA",
        miles: 720,
        rate: 2400,
        netRpm: 2.45,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "AM window",
      },
      {
        id: "atl-nsh",
        label: "Atlanta, GA → Nashville, TN",
        from: "Atlanta, GA",
        to: "Nashville, TN",
        miles: 250,
        rate: 700,
        netRpm: 2.55,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "FCFS",
      },
    ],
    []
  );

  const laneIdFromUrl = query.get("laneId") || "";
  const [selectedLaneId, setSelectedLaneId] = useState(laneIdFromUrl);

  useEffect(() => {
    setSelectedLaneId(laneIdFromUrl);
  }, [laneIdFromUrl]);

  const selectedLaneObject = useMemo(() => {
    return laneOptions.find((l) => l.id === selectedLaneId) || null;
  }, [laneOptions, selectedLaneId]);

  // Lane base notes/markets (defaults)
  const baseNotes = useMemo(
    () => [
      "Avoid rush-hour pickup windows (I-94/I-90).",
      "Receivers may prefer early AM delivery.",
      "Watch for weekend deadhead spikes.",
    ],
    []
  );

  const baseMarkets = useMemo(
    () => [
      { label: "Headhaul strength", value: "Strong", tone: "ok" },
      { label: "Backhaul availability", value: "Moderate", tone: "mid" },
      { label: "Seasonality", value: "Stable", tone: "ok" },
    ],
    []
  );

  // Lane data: URL params > dropdown > demo
  const lane = useMemo(() => {
    const fromQ = query.get("from");
    const toQ = query.get("to");

    if (fromQ || toQ) {
      return {
        id: query.get("laneId") || "",
        from: fromQ || "Chicago, IL",
        to: toQ || "Dallas, TX",
        miles: num(query.get("miles"), 920),
        rate: num(query.get("rate"), 2600),
        fuel: query.get("fuel") || "Incl.",
        detention: query.get("detention") || "Confirm",
        appointment: query.get("appt") || "Needs window",
        notes: baseNotes,
        markets: baseMarkets,
      };
    }

    if (selectedLaneObject) {
      return {
        id: selectedLaneObject.id,
        from: selectedLaneObject.from,
        to: selectedLaneObject.to,
        miles: selectedLaneObject.miles,
        rate: selectedLaneObject.rate,
        fuel: selectedLaneObject.fuel || "Incl.",
        detention: selectedLaneObject.detention || "Confirm",
        appointment: selectedLaneObject.appt || "Needs window",
        notes: baseNotes,
        markets: baseMarkets,
      };
    }

    return {
      id: "",
      from: "Chicago, IL",
      to: "Dallas, TX",
      miles: 920,
      rate: 2600,
      fuel: "Incl.",
      detention: "Confirm",
      appointment: "Needs window",
      notes: baseNotes,
      markets: baseMarkets,
    };
  }, [query, selectedLaneObject, baseNotes, baseMarkets]);

  const hasSelectedLane = useMemo(() => {
    return Boolean(
      query.get("from") ||
        query.get("to") ||
        query.get("miles") ||
        query.get("rate") ||
        query.get("laneId")
    );
  }, [query]);

  const netRpm = useMemo(() => {
    const netQ = query.get("net");
    if (netQ != null) return num(netQ, 2.17);
    if (selectedLaneObject) return selectedLaneObject.netRpm;
    return 2.17;
  }, [query, selectedLaneObject]);

  const status = useMemo(() => statusFromNetRpm(netRpm), [netRpm]);

  // ---------- Load lane notes from localStorage (per-lane) ----------
  const [laneNotes, setLaneNotes] = useState([]);
  useEffect(() => {
    const raw = localStorage.getItem(storageKeyNotes(lane.id));
    const arr = safeJsonParse(raw, []);
    if (Array.isArray(arr) && arr.length) setLaneNotes(arr);
    else setLaneNotes([]);
  }, [lane.id]);

  const mergedNotes = useMemo(() => {
    // base notes + stored notes
    const all = [...lane.notes, ...laneNotes];
    // de-dupe
    return Array.from(new Set(all));
  }, [lane.notes, laneNotes]);

  // ---------- Targets (per-lane) ----------
  const [targetRpmMap, setTargetRpmMap] = useState({});
  useEffect(() => {
    const raw = localStorage.getItem(storageKeyTargets());
    const obj = safeJsonParse(raw, {});
    setTargetRpmMap(obj && typeof obj === "object" ? obj : {});
  }, []);
  const targetRpm = useMemo(() => {
    const t = targetRpmMap[lane.id || "demo"];
    return Number.isFinite(Number(t)) ? Number(t) : 2.30;
  }, [targetRpmMap, lane.id]);

  // ---------- Demo history (reactive to lane/net) ----------
  const history = useMemo(
    () => [
      {
        date: "01/06",
        rpm: Math.max(1.0, netRpm + 0.18),
        broker: "ABC Logistics",
        miles: lane.miles,
        rate: lane.rate,
      },
      {
        date: "12/28",
        rpm: Math.max(1.0, netRpm + 0.03),
        broker: "RoadStar",
        miles: lane.miles,
        rate: Math.round(lane.rate * 0.95),
      },
      {
        date: "12/16",
        rpm: Math.max(1.0, netRpm - 0.07),
        broker: "BlueHaul",
        miles: lane.miles,
        rate: Math.round(lane.rate * 0.92),
      },
      {
        date: "12/03",
        rpm: Math.max(1.0, netRpm - 0.19),
        broker: "Atlas Freight",
        miles: lane.miles,
        rate: Math.round(lane.rate * 0.87),
      },
    ],
    [lane.miles, lane.rate, netRpm]
  );

  // DTL preview
  const dtl = useMemo(
    () => ({
      score: 78,
      suggestions: [
        "Ask for +$150 to cover appointment constraint.",
        "Confirm detention policy before tender.",
        "If reload < $2.10 RPM, consider alternate exit market (Fort Worth).",
      ],
      checks: [
        { label: "Deadhead under 60 mi", ok: true },
        { label: "Receiver appt risk", ok: false },
        { label: "Fuel surcharge included", ok: true },
        { label: "Reload probability", ok: true },
      ],
    }),
    []
  );

  // ---------- Actions ----------
  const onSelectLane = (e) => {
    const id = e.target.value;
    setSelectedLaneId(id);

    if (!id) {
      navigate("/lane-command", { replace: false });
      toastNow("Lane cleared (demo mode).");
      return;
    }

    const chosen = laneOptions.find((l) => l.id === id);
    if (!chosen) return;

    navigate(`/lane-command${buildSearchFromLane(chosen)}`, { replace: false });
    toastNow(`Loaded: ${chosen.label}`);
  };

  const popOut = () => {
    window.open(
      `/lane-command${window.location.search}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const saveLane = () => {
    const payload = {
      id: lane.id || "demo",
      from: lane.from,
      to: lane.to,
      miles: lane.miles,
      rate: lane.rate,
      netRpm,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKeyLane(lane.id), JSON.stringify(payload));

    const raw = localStorage.getItem(storageKeySavedLanes());
    const arr = safeJsonParse(raw, []);
    const next = Array.isArray(arr) ? arr : [];

    // upsert by id
    const idx = next.findIndex((x) => x?.id === payload.id);
    if (idx >= 0) next[idx] = payload;
    else next.unshift(payload);

    localStorage.setItem(storageKeySavedLanes(), JSON.stringify(next));
    toastNow("Lane saved.");
  };

  const openAddNote = () => {
    setModal({ type: "note" });
  };

  const addNote = (text) => {
    const note = (text || "").trim();
    if (!note) {
      toastNow("Note is empty.");
      return;
    }
    const raw = localStorage.getItem(storageKeyNotes(lane.id));
    const arr = safeJsonParse(raw, []);
    const next = Array.isArray(arr) ? arr : [];
    next.unshift(note);
    localStorage.setItem(storageKeyNotes(lane.id), JSON.stringify(next));
    setLaneNotes(next);
    closeModal();
    toastNow("Note added.");
  };

  const openRateBump = () => {
    const bump = 150; // default
    const desiredRate = lane.rate + bump;
    const script = `Hey — to make ${lane.from} → ${lane.to} work with the appointment/fuel, we’d need ${money(
      desiredRate
    )}. If you can get close, we can move fast and cover it clean.`;
    setModal({ type: "rateBump", bump, desiredRate, script });
  };

  const setTarget = (value) => {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) {
      toastNow("Invalid target RPM.");
      return;
    }
    const raw = localStorage.getItem(storageKeyTargets());
    const obj = safeJsonParse(raw, {});
    const next = obj && typeof obj === "object" ? { ...obj } : {};
    next[lane.id || "demo"] = v;
    localStorage.setItem(storageKeyTargets(), JSON.stringify(next));
    setTargetRpmMap(next);
    closeModal();
    toastNow(`Target RPM set to $${v.toFixed(2)}.`);
  };

  // Rate needed for target (simple placeholder calc)
  const rateNeeded = useMemo(() => {
    // v1 simple: miles * target RPM
    return Math.round(lane.miles * targetRpm);
  }, [lane.miles, targetRpm]);

  const openBrokerScript = () => {
    const txt = `For ${lane.from} → ${lane.to} (${lane.miles} mi), we’re targeting $${targetRpm.toFixed(
      2
    )} net RPM. That puts us at ${money(rateNeeded)}. If you can get close, we’ll take it and move immediately.`;
    setModal({ type: "script", title: "Broker Script", text: txt });
  };

  const openLoadCommand = () => {
    toastNow("Load Command hook coming next (wiring needed).");
  };

  // ---------- Render helpers ----------
  const Modal = ({ children }) => {
    return (
      <div
        onMouseDown={closeModal}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          zIndex: 50,
        }}
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: "min(720px, 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(12,16,24,0.86)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 26px 70px rgba(0,0,0,0.55)",
            padding: 14,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const ModalHeader = ({ title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontWeight: 950, letterSpacing: "0.02em" }}>{title}</div>
      <div style={{ marginLeft: "auto" }}>
        <button className="lc-mini-btn" onClick={closeModal} type="button">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="lc-page">
      <div className="lc-canvas">
        <div className="lc-panel">
          {/* Top strip */}
          <div className="lc-topstrip">
            <div className="lc-pill">Lane Command</div>

            {/* Select Lane dropdown */}
            <div className="lc-pill" style={{ padding: 0, overflow: "hidden" }}>
              <select
                value={selectedLaneId}
                onChange={onSelectLane}
                aria-label="Select lane"
                style={{
                  height: 30,
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 900,
                  padding: "0 10px",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="">Select lane…</option>
                {laneOptions.map((l) => (
                  <option key={l.id} value={l.id} style={{ color: "#0b1220" }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lc-pill">
              {lane.from} → {lane.to}
            </div>
            <div className="lc-pill">Miles: {lane.miles}</div>
            <div className="lc-pill">Rate: ${lane.rate.toLocaleString()}</div>

            <div className="lc-actions">
              <button className="lc-btn" onClick={popOut} type="button">
                Pop Out ↗
              </button>
            </div>
          </div>

          {!hasSelectedLane && (
            <div
              style={{
                padding: "0 18px 10px",
                opacity: 0.8,
                fontSize: 12,
                fontWeight: 750,
              }}
            >
              No lane selected yet — showing demo lane. Use the{" "}
              <b>Select lane…</b> dropdown above.
            </div>
          )}

          {/* Header */}
          <div className="lc-header">
            <div className="lc-brand">
              <div className="lc-brand-big">LANESYNC</div>
              <div className="lc-brand-small">Lane Command</div>
            </div>

            <div className="lc-title">
              {lane.from} → {lane.to}
            </div>

            <div className="lc-badges">
              <div className={`lc-badge ${status.tone}`}>
                {status.label} • Net ${netRpm.toFixed(2)} RPM
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="lc-tabs">
            <button
              className={`lc-tab ${activeTab === "intel" ? "on" : ""}`}
              onClick={() => setActiveTab("intel")}
              type="button"
            >
              Intel
            </button>
            <button
              className={`lc-tab ${activeTab === "dtl" ? "on" : ""}`}
              onClick={() => setActiveTab("dtl")}
              type="button"
            >
              DTL Logic
            </button>
            <button
              className={`lc-tab ${activeTab === "history" ? "on" : ""}`}
              onClick={() => setActiveTab("history")}
              type="button"
            >
              History
            </button>
            <button
              className={`lc-tab ${activeTab === "profit" ? "on" : ""}`}
              onClick={() => setActiveTab("profit")}
              type="button"
            >
              Profitability
            </button>
          </div>

          {/* Body */}
          <div className="lc-body">
            {activeTab === "intel" && (
              <div className="lc-grid">
                <div className="lc-card">
                  <div className="lc-card-title">Lane Intel</div>

                  <div className="lc-kv">
                    <div className="k">From:</div>
                    <div className="v">{lane.from}</div>
                    <div className="k">To:</div>
                    <div className="v">{lane.to}</div>
                    <div className="k">Miles:</div>
                    <div className="v">{lane.miles}</div>
                    <div className="k">Fuel:</div>
                    <div className="v">{lane.fuel}</div>
                    <div className="k">Detention:</div>
                    <div className="v">{lane.detention}</div>
                    <div className="k">Appt:</div>
                    <div className="v">{lane.appointment}</div>
                  </div>

                  <div className="lc-card-subtitle">Notes</div>
                  <ul className="lc-notes">
                    {mergedNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Market Signals</div>

                  <div className="lc-signal-list">
                    {lane.markets.map((m) => (
                      <div key={m.label} className={`lc-signal ${m.tone}`}>
                        <div className="lc-signal-label">{m.label}</div>
                        <div className="lc-signal-value">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Quick Actions</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={saveLane}>
                      Save lane
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openAddNote}>
                      Add note
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openRateBump}>
                      Request rate bump
                    </button>
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Snapshot</div>
                  <div className="lc-big">
                    <div className="lc-big-label">Net RPM</div>
                    <div className="lc-big-value">${netRpm.toFixed(2)}</div>
                    <div className={`lc-tag ${status.tone}`}>{status.label}</div>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Last 3 Rates</div>
                  <div className="lc-rate-chips">
                    {history.slice(0, 3).map((h) => (
                      <div key={h.date} className="lc-rate-chip">
                        <div className="lc-rate-date">{h.date}</div>
                        <div className="lc-rate-val">${h.rpm.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dtl" && (
              <div className="lc-grid dtl">
                <div className="lc-card">
                  <div className="lc-card-title">DTL Score</div>
                  <div className="lc-score">
                    <div className="lc-score-num">{dtl.score}</div>
                    <div className="lc-score-sub">/ 100</div>
                  </div>
                  <div className="lc-score-hint">
                    Higher score = better fit for DTL / reload flow.
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Checks</div>
                  <div className="lc-checks">
                    {dtl.checks.map((c) => (
                      <div key={c.label} className={`lc-check ${c.ok ? "ok" : "risk"}`}>
                        <span className="dot" />
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Recommendations</div>
                  <ol className="lc-recs">
                    {dtl.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Next step</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={openBrokerScript}>
                      Open Broker Script
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openLoadCommand}>
                      Open Load Command
                    </button>
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => setModal({ type: "targetRpm" })}
                    >
                      Set Target RPM
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="lc-grid history">
                <div className="lc-card">
                  <div className="lc-card-title">Lane History</div>

                  <div className="lc-table-wrap">
                    <table className="lc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Broker</th>
                          <th>Miles</th>
                          <th>Rate</th>
                          <th>Net RPM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.date}>
                            <td>{h.date}</td>
                            <td>{h.broker}</td>
                            <td>{h.miles}</td>
                            <td>${h.rate.toLocaleString()}</td>
                            <td>${h.rpm.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lc-hint">
                    (Next) We’ll connect this to your real “loads booked” and rate history.
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Tools</div>
                  <div className="lc-actions-row">
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => toastNow("Export CSV coming next (wire to real history).")}
                    >
                      Export CSV
                    </button>
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => toastNow("Compare lanes coming next.")}
                    >
                      Compare 2 lanes
                    </button>
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => toastNow("Alerts coming next.")}
                    >
                      Set alert
                    </button>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Alert Rules (preview)</div>
                  <div className="lc-rule">
                    Notify if Net RPM drops below <b>$2.10</b> for this lane.
                  </div>
                  <div className="lc-rule">
                    Notify if rate is under <b>{money(Math.round(lane.miles * 2.45))}</b> for {lane.miles} miles.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profit" && (
              <div className="lc-grid profit">
                <div className="lc-card">
                  <div className="lc-card-title">Profitability</div>

                  <div className="lc-profit-row">
                    <div className="lc-profit-box">
                      <div className="lbl">Current Net RPM</div>
                      <div className="val">${netRpm.toFixed(2)}</div>
                      <div className={`lc-tag ${status.tone}`}>{status.label}</div>
                    </div>

                    <div className="lc-profit-box">
                      <div className="lbl">Target Net RPM</div>
                      <div className="val">${targetRpm.toFixed(2)}</div>
                      <div className="sub">Saved per lane</div>
                    </div>

                    <div className="lc-profit-box">
                      <div className="lbl">Rate Needed</div>
                      <div className="val">{money(rateNeeded)}</div>
                      <div className="sub">For {lane.miles} miles</div>
                    </div>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">What to say (quick)</div>
                  <div className="lc-script">
                    “To make this lane work with the appointment and fuel, we’d need
                    <b> {money(rateNeeded)}</b>. If you can get close, we can move fast.”
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Decision</div>
                  <div className="lc-actions-row">
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => toastNow("Approved (hook to Load Command next).")}
                    >
                      Approve lane
                    </button>
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={openRateBump}
                    >
                      Counter offer
                    </button>
                    <button
                      className="lc-mini-btn"
                      type="button"
                      onClick={() => toastNow("Rejected (hook to tracking next).")}
                    >
                      Reject lane
                    </button>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-hint">
                    Next we’ll wire these buttons into your “Load Command” flow.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lc-footer">
            Tip: Press <b>Shift + N</b> to toggle Day/Night.
          </div>

          {/* Toast */}
          {toast && (
            <div
              style={{
                position: "absolute",
                left: 18,
                bottom: 14,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(12,16,24,0.75)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                fontSize: 12,
                fontWeight: 850,
                color: "rgba(255,255,255,0.92)",
                zIndex: 40,
                maxWidth: 360,
              }}
            >
              {toast.msg}
            </div>
          )}

          {/* Modal */}
          {modal?.type === "note" && (
            <Modal>
              <ModalHeader title="Add note" />
              <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12, fontWeight: 750 }}>
                This note will be saved for this lane.
              </div>

              <NoteForm onSubmit={addNote} onCancel={closeModal} />
            </Modal>
          )}

          {modal?.type === "rateBump" && (
            <Modal>
              <ModalHeader title="Request rate bump" />
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, opacity: 0.85 }}>
                Current rate: <b>{money(lane.rate)}</b> • Suggested bump: <b>{money(modal.bump)}</b> • New ask:{" "}
                <b>{money(modal.desiredRate)}</b>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85, marginBottom: 8 }}>
                  Message to broker
                </div>
                <textarea
                  readOnly
                  value={modal.script}
                  style={{
                    width: "100%",
                    minHeight: 110,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.92)",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 750,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button className="lc-mini-btn" onClick={() => copyText(modal.script)} type="button">
                  Copy
                </button>
                <button className="lc-mini-btn" onClick={closeModal} type="button">
                  Done
                </button>
              </div>
            </Modal>
          )}

          {modal?.type === "targetRpm" && (
            <Modal>
              <ModalHeader title="Set Target RPM" />
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, opacity: 0.85 }}>
                Current target for this lane: <b>${targetRpm.toFixed(2)}</b>
              </div>
              <TargetForm
                defaultValue={targetRpm}
                onSubmit={setTarget}
                onCancel={closeModal}
              />
            </Modal>
          )}

          {modal?.type === "script" && (
            <Modal>
              <ModalHeader title={modal.title || "Script"} />
              <div style={{ marginTop: 10 }}>
                <textarea
                  readOnly
                  value={modal.text || ""}
                  style={{
                    width: "100%",
                    minHeight: 120,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.92)",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 750,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button className="lc-mini-btn" onClick={() => copyText(modal.text || "")} type="button">
                  Copy
                </button>
                <button className="lc-mini-btn" onClick={closeModal} type="button">
                  Done
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Small subcomponents (in same file, no new deps) ----------
function NoteForm({ onSubmit, onCancel }) {
  const [text, setText] = useState("");
  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note…"
        style={{
          width: "100%",
          minHeight: 100,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.92)",
          padding: 10,
          fontSize: 12,
          fontWeight: 750,
          outline: "none",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
        <button className="lc-mini-btn" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="lc-mini-btn"
          onClick={() => onSubmit(text)}
          type="button"
        >
          Save note
        </button>
      </div>
    </div>
  );
}

function TargetForm({ defaultValue, onSubmit, onCancel }) {
  const [val, setVal] = useState(String(defaultValue ?? 2.3));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
          Target Net RPM
        </label>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="2.30"
          inputMode="decimal"
          style={{
            height: 38,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 900,
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
        <button className="lc-mini-btn" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="lc-mini-btn"
          onClick={() => onSubmit(val)}
          type="button"
        >
          Save target
        </button>
      </div>
    </div>
  );
}
