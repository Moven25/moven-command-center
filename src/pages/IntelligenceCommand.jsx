// src/pages/IntelligenceCommand.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommandShell.css";
import "./IntelligenceCommand.css";
import { useData } from "../state/DataContext";

/* -----------------------------
  Helpers
------------------------------ */
function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmt2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}
function normalize(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function docComplete(c) {
  return !!c?.insuranceOnFile && !!c?.w9OnFile && !!c?.authorityOnFile;
}

/* -----------------------------
  Seen flags for attention glow
------------------------------ */
const LS_SEEN_RISK = "lanesync_intel_seen_risk_v2";
const LS_SEEN_ISSUES = "lanesync_intel_seen_issues_v2";

function getLSBool(key, fallback = false) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}
function setLSBool(key, val) {
  try {
    localStorage.setItem(key, String(!!val));
  } catch {
    // ignore
  }
}

/* =============================
  Intelligence Command
============================= */
export default function IntelligenceCommand() {
  const navigate = useNavigate();
  const { loads, carriers, trainingMode, setTrainingMode } = useData();

  const [laneResearchOpen, setLaneResearchOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Market Pulse tabs: MODE | RPM | RISK | ISSUES
  const [pulseTab, setPulseTab] = useState("MODE");

  // Attention "seen" flags
  const [seenRisk, setSeenRisk] = useState(() => getLSBool(LS_SEEN_RISK, false));
  const [seenIssues, setSeenIssues] = useState(() => getLSBool(LS_SEEN_ISSUES, false));

  const q = normalize(query);

  /* -----------------------------
    Market Pulse
  ------------------------------ */
  const marketPulse = useMemo(() => {
    const totalLoads = (loads || []).length;
    const activeLoads = (loads || []).filter((l) => !["Completed"].includes(l.status)).length;

    const issues = (loads || []).filter((l) =>
      String(l.status || "").toLowerCase().includes("issue")
    ).length;

    const risk = (loads || []).filter(
      (l) => !!l.detentionRisk && !["Completed"].includes(l.status)
    ).length;

    const pickupsToday = (loads || []).filter((l) => isToday(l.pickupAt)).length;
    const deliveriesToday = (loads || []).filter((l) => isToday(l.deliveryAt)).length;

    const avgNet = totalLoads
      ? (loads || []).reduce((acc, l) => acc + safeNum(l.netRpm), 0) / Math.max(1, totalLoads)
      : 0;

    return { totalLoads, activeLoads, issues, risk, pickupsToday, deliveriesToday, avgNet };
  }, [loads]);

  // If risk/issues become 0, reset "seen" so the alert can trigger again later
  useEffect(() => {
    if (marketPulse.risk === 0 && seenRisk) {
      setSeenRisk(false);
      setLSBool(LS_SEEN_RISK, false);
    }
    if (marketPulse.issues === 0 && seenIssues) {
      setSeenIssues(false);
      setLSBool(LS_SEEN_ISSUES, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketPulse.risk, marketPulse.issues]);

  // Ensure if user is already ON a tab, we mark it as "seen"
  useEffect(() => {
    if (pulseTab === "RISK" && !seenRisk) {
      setSeenRisk(true);
      setLSBool(LS_SEEN_RISK, true);
    }
    if (pulseTab === "ISSUES" && !seenIssues) {
      setSeenIssues(true);
      setLSBool(LS_SEEN_ISSUES, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulseTab]);

  function selectTab(key) {
    setPulseTab(key);

    // Clicking risk/issues clears attention (amber + glow) until count returns to 0 later
    if (key === "RISK") {
      setSeenRisk(true);
      setLSBool(LS_SEEN_RISK, true);
    }
    if (key === "ISSUES") {
      setSeenIssues(true);
      setLSBool(LS_SEEN_ISSUES, true);
    }
  }

  /* -----------------------------
    Lane Profitability
  ------------------------------ */
  const laneRows = useMemo(() => {
    const map = new Map();

    (loads || []).forEach((l) => {
      const lane = (l.lane || "").trim();
      if (!lane) return;

      if (!map.has(lane)) {
        map.set(lane, {
          lane,
          count: 0,
          sumNet: 0,
          avgNet: 0,
          riskCount: 0,
          issueCount: 0,
        });
      }
      const row = map.get(lane);
      row.count += 1;
      row.sumNet += safeNum(l.netRpm);
      row.riskCount += l.detentionRisk ? 1 : 0;
      row.issueCount += String(l.status || "").toLowerCase().includes("issue") ? 1 : 0;
      row.avgNet = row.sumNet / Math.max(1, row.count);
    });

    let arr = Array.from(map.values());
    if (q) arr = arr.filter((r) => normalize(r.lane).includes(q));

    // Make each tab "do something"
    if (pulseTab === "RISK") arr = arr.filter((r) => r.riskCount > 0).sort((a, b) => b.riskCount - a.riskCount);
    if (pulseTab === "ISSUES") arr = arr.filter((r) => r.issueCount > 0).sort((a, b) => b.issueCount - a.issueCount);
    if (pulseTab === "RPM") arr = arr.sort((a, b) => b.avgNet - a.avgNet);
    if (pulseTab === "MODE") arr = arr.sort((a, b) => b.count - a.count || b.avgNet - a.avgNet);

    return arr.slice(0, 12);
  }, [loads, q, pulseTab]);

  /* -----------------------------
    Broker Intelligence
  ------------------------------ */
  const brokerRows = useMemo(() => {
    const map = new Map();

    (loads || []).forEach((l) => {
      const broker = (l.broker || "").trim();
      if (!broker) return;

      if (!map.has(broker)) {
        map.set(broker, {
          broker,
          count: 0,
          sumNet: 0,
          avgNet: 0,
          riskCount: 0,
          issueCount: 0,
          score: 0,
        });
      }
      const row = map.get(broker);
      row.count += 1;
      row.sumNet += safeNum(l.netRpm);
      row.riskCount += l.detentionRisk ? 1 : 0;
      row.issueCount += String(l.status || "").toLowerCase().includes("issue") ? 1 : 0;
      row.avgNet = row.sumNet / Math.max(1, row.count);

      const penalty = row.issueCount * 1.25 + row.riskCount * 0.5;
      row.score = row.avgNet * 10 + Math.min(10, row.count) - penalty;
    });

    let arr = Array.from(map.values());
    if (q) arr = arr.filter((r) => normalize(r.broker).includes(q));

    if (pulseTab === "RISK") arr = arr.filter((r) => r.riskCount > 0).sort((a, b) => b.riskCount - a.riskCount);
    if (pulseTab === "ISSUES") arr = arr.filter((r) => r.issueCount > 0).sort((a, b) => b.issueCount - a.issueCount);
    if (pulseTab === "RPM") arr = arr.sort((a, b) => b.avgNet - a.avgNet);
    if (pulseTab === "MODE") arr = arr.sort((a, b) => b.count - a.count || b.score - a.score);

    return arr.slice(0, 12);
  }, [loads, q, pulseTab]);

  /* -----------------------------
    Carrier Performance
  ------------------------------ */
  const carrierRows = useMemo(() => {
    let arr = (carriers || []).map((c) => {
      const onTime = safeNum(c.onTime);
      const claims = safeNum(c.claims);
      const docsOk = docComplete(c);

      const riskScore = safeNum(c.riskScore);
      const riskLabel = riskScore <= 25 ? "Low" : riskScore <= 55 ? "Medium" : "High";

      const score =
        onTime / 10 -
        claims * 2 -
        (docsOk ? 0 : 6) -
        (riskLabel === "High" ? 4 : riskLabel === "Medium" ? 2 : 0);

      return {
        id: c.id,
        name: c.name,
        homeBase: c.homeBase || "—",
        onTime,
        claims,
        docsOk,
        riskLabel,
        score,
      };
    });

    if (q) arr = arr.filter((r) => normalize(`${r.name} ${r.id} ${r.homeBase}`).includes(q));

    if (pulseTab === "RPM") arr = arr.sort((a, b) => b.onTime - a.onTime);
    if (pulseTab === "MODE") arr = arr.sort((a, b) => b.score - a.score);
    if (pulseTab === "RISK") arr = arr.filter((r) => r.riskLabel !== "Low");
    if (pulseTab === "ISSUES") arr = arr.filter((r) => !r.docsOk || r.claims > 0);

    return arr.slice(0, 12);
  }, [carriers, q, pulseTab]);

  // Attention only until clicked/viewed
  const riskNeedsAttention = marketPulse.risk > 0 && !seenRisk;
  const issuesNeedsAttention = marketPulse.issues > 0 && !seenIssues;

  function chipClass(key, extra = "") {
    const isActive = pulseTab === key;
    return `intelcmd__chipBtn ${isActive ? "is-active" : ""} ${extra}`.trim();
  }

  return (
    <div className="command-shell intelcmd">
      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Strategy</div>
          <h1 className="command-shell__title">Intelligence Command</h1>
          <p className="command-shell__subtitle">
            Research lanes, brokers, markets, and performance — then turn insights into decisions.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={() => setLaneResearchOpen(true)}>
            Lane Research
          </button>
          <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={() => setBriefOpen(true)}>
            Generate Brief
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <section className="intelcmd__toolbar">
        <input
          className="intelcmd__search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lanes, brokers, carriers…"
        />

        {/* CLICKABLE CHIPS */}
        <div className="intelcmd__chips">
          <button
            type="button"
            className={chipClass("MODE")}
            onClick={() => {
              // ✅ REAL toggle Training ↔ Live
              setTrainingMode((v) => !v);
              // keep tab behavior consistent
              selectTab("MODE");
            }}
            aria-pressed={pulseTab === "MODE"}
            title="Toggle environment (Training vs Live) + Mode view sorting"
          >
            Env: <strong>{trainingMode ? "Training" : "Live"}</strong>
          </button>

          <button
            type="button"
            className={chipClass("RPM")}
            onClick={() => selectTab("RPM")}
            aria-pressed={pulseTab === "RPM"}
            title="RPM view (profit-first sorting)"
          >
            Avg Net RPM: <strong>{fmt2(marketPulse.avgNet)}</strong>
          </button>

          <button
            type="button"
            className={chipClass("RISK", riskNeedsAttention ? "is-attn" : "")}
            onClick={() => selectTab("RISK")}
            aria-pressed={pulseTab === "RISK"}
            title="Risk view (focus on detention risk hotspots)"
          >
            Detention Risk: <strong>{marketPulse.risk}</strong>
          </button>

          <button
            type="button"
            className={chipClass("ISSUES", issuesNeedsAttention ? "is-attn" : "")}
            onClick={() => selectTab("ISSUES")}
            aria-pressed={pulseTab === "ISSUES"}
            title="Issues view (focus on problem hotspots)"
          >
            Issues: <strong>{marketPulse.issues}</strong>
          </button>
        </div>
      </section>

      {/* GRID */}
      <section className="intelcmd__grid">
        {/* Market Pulse */}
        <div className="intelcmd__card intelcmd__card--wide">
          <div className="intelcmd__cardHeader">
            <div>
              <div className="intelcmd__cardTitle">Market Pulse</div>
              <div className="intelcmd__cardSub">
                Click chips (or tiles) to change sorting/filters across lanes, brokers, and carriers.
              </div>
            </div>
          </div>

          {/* ✅ Tiles are clickable too */}
          <div className="intelcmd__pulse">
            <button type="button" className="intelcmd__pulseItem" onClick={() => selectTab("MODE")}>
              <div className="intelcmd__pulseLabel">Active Loads</div>
              <div className="intelcmd__pulseValue">{marketPulse.activeLoads}</div>
            </button>

            <div className="intelcmd__pulseItem">
              <div className="intelcmd__pulseLabel">Pickups Today</div>
              <div className="intelcmd__pulseValue">{marketPulse.pickupsToday}</div>
            </div>

            <div className="intelcmd__pulseItem">
              <div className="intelcmd__pulseLabel">Deliveries Today</div>
              <div className="intelcmd__pulseValue">{marketPulse.deliveriesToday}</div>
            </div>

            <button type="button" className="intelcmd__pulseItem" onClick={() => selectTab("RPM")}>
              <div className="intelcmd__pulseLabel">Avg Net RPM</div>
              <div className="intelcmd__pulseValue">{fmt2(marketPulse.avgNet)}</div>
            </button>

            <button
              type="button"
              className={`intelcmd__pulseItem ${riskNeedsAttention ? "is-attn" : ""}`}
              onClick={() => selectTab("RISK")}
            >
              <div className="intelcmd__pulseLabel">Detention Risk</div>
              <div className="intelcmd__pulseValue">{marketPulse.risk}</div>
            </button>

            <button
              type="button"
              className={`intelcmd__pulseItem ${issuesNeedsAttention ? "is-attn" : ""}`}
              onClick={() => selectTab("ISSUES")}
            >
              <div className="intelcmd__pulseLabel">Issues</div>
              <div className="intelcmd__pulseValue">{marketPulse.issues}</div>
            </button>
          </div>
        </div>

        {/* Lane Profitability */}
        <div className="intelcmd__card">
          <div className="intelcmd__cardHeader">
            <div>
              <div className="intelcmd__cardTitle">Lane Profitability</div>
              <div className="intelcmd__cardSub">
                {pulseTab === "MODE" ? "Sorted by volume (mode)." : pulseTab === "RPM" ? "Sorted by Net RPM." : "Filtered by selection."}
              </div>
            </div>
            <button className="intelcmd__miniBtn" type="button" onClick={() => setLaneResearchOpen(true)}>
              Open
            </button>
          </div>

          <div className="intelcmd__list">
            {laneRows.length === 0 ? (
              <div className="intelcmd__empty">No lanes found.</div>
            ) : (
              laneRows.map((r) => (
                <button
                  key={r.lane}
                  className="intelcmd__row"
                  type="button"
                  onClick={() => navigate(`/lane-command?lane=${encodeURIComponent(r.lane)}`)}
                >
                  <div className="intelcmd__rowMain">
                    <div className="intelcmd__rowTitle">{r.lane}</div>
                    <div className="intelcmd__rowSub">
                      Vol {r.count} · Risk {r.riskCount} · Issues {r.issueCount}
                    </div>
                  </div>
                  <div className="intelcmd__rowRight">
                    <div className="intelcmd__metric">{fmt2(r.avgNet)}</div>
                    <div className="intelcmd__metricLabel">Avg Net</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Broker Intelligence */}
        <div className="intelcmd__card">
          <div className="intelcmd__cardHeader">
            <div>
              <div className="intelcmd__cardTitle">Broker Intelligence</div>
              <div className="intelcmd__cardSub">
                {pulseTab === "MODE" ? "Sorted by volume (mode)." : pulseTab === "RPM" ? "Sorted by Avg Net." : "Filtered by selection."}
              </div>
            </div>
          </div>

          <div className="intelcmd__list">
            {brokerRows.length === 0 ? (
              <div className="intelcmd__empty">No brokers found.</div>
            ) : (
              brokerRows.map((r) => (
                <button
                  key={r.broker}
                  className="intelcmd__row"
                  type="button"
                  onClick={() => navigate(`/broker-command?broker=${encodeURIComponent(r.broker)}`)}
                >
                  <div className="intelcmd__rowMain">
                    <div className="intelcmd__rowTitle">{r.broker}</div>
                    <div className="intelcmd__rowSub">
                      Vol {r.count} · Avg Net {fmt2(r.avgNet)} · Risk {r.riskCount} · Issues {r.issueCount}
                    </div>
                  </div>
                  <div className="intelcmd__rowRight">
                    <div className={`intelcmd__metric ${r.score < 15 ? "is-warn" : ""}`}>{fmt2(r.score)}</div>
                    <div className="intelcmd__metricLabel">Score</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Carrier Performance */}
        <div className="intelcmd__card">
          <div className="intelcmd__cardHeader">
            <div>
              <div className="intelcmd__cardTitle">Carrier Performance</div>
              <div className="intelcmd__cardSub">Scroll list (won’t cut off).</div>
            </div>
          </div>

          <div className="intelcmd__list intelcmd__list--scroll">
            {carrierRows.length === 0 ? (
              <div className="intelcmd__empty">No carriers found.</div>
            ) : (
              carrierRows.map((r) => (
                <button
                  key={r.id}
                  className="intelcmd__row"
                  type="button"
                  onClick={() => navigate(`/carrier-command?carrierId=${encodeURIComponent(r.id)}`)}
                >
                  <div className="intelcmd__rowMain">
                    <div className="intelcmd__rowTitle">
                      {r.name} <span className="intelcmd__muted">({r.id})</span>
                    </div>
                    <div className="intelcmd__rowSub">
                      On-time {r.onTime}% · Claims {r.claims} · Docs {r.docsOk ? "Complete" : "Missing"} · Risk {r.riskLabel}
                    </div>
                  </div>
                  <div className="intelcmd__rowRight">
                    <div className={`intelcmd__pill ${r.docsOk ? "is-ok" : "is-warn"}`}>
                      {r.docsOk ? "✓" : "!"}
                    </div>
                    <div className="intelcmd__metricLabel">Docs</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Overlays */}
      {laneResearchOpen ? (
        <div className="intelcmd__overlay" role="dialog" aria-modal="true" onClick={() => setLaneResearchOpen(false)}>
          <aside className="intelcmd__panel" onClick={(e) => e.stopPropagation()}>
            <div className="intelcmd__panelHeader">
              <div>
                <div className="intelcmd__panelTitle">Lane Research</div>
                <div className="intelcmd__panelSub">Click a lane to open Lane Command.</div>
              </div>
              <button className="intelcmd__close" type="button" onClick={() => setLaneResearchOpen(false)}>
                ✕
              </button>
            </div>

            <div className="intelcmd__panelBody">
              {laneRows.map((r) => (
                <button
                  key={r.lane}
                  className="intelcmd__panelRow"
                  type="button"
                  onClick={() => navigate(`/lane-command?lane=${encodeURIComponent(r.lane)}`)}
                >
                  <div>
                    <div className="intelcmd__rowTitle">{r.lane}</div>
                    <div className="intelcmd__rowSub">
                      Vol {r.count} · Risk {r.riskCount} · Issues {r.issueCount}
                    </div>
                  </div>
                  <div className="intelcmd__panelRight">
                    <div className="intelcmd__metric">{fmt2(r.avgNet)}</div>
                    <div className="intelcmd__metricLabel">Avg Net</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {briefOpen ? (
        <div className="intelcmd__overlay" role="dialog" aria-modal="true" onClick={() => setBriefOpen(false)}>
          <div className="intelcmd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="intelcmd__panelHeader">
              <div>
                <div className="intelcmd__panelTitle">Generated Brief</div>
                <div className="intelcmd__panelSub">Brief builder is next.</div>
              </div>
              <button className="intelcmd__close" type="button" onClick={() => setBriefOpen(false)}>
                ✕
              </button>
            </div>
            <pre className="intelcmd__brief">Brief generator is connected next (txt + json export).</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
