// src/pages/MissionControl.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MissionControl.css";

/**
 * Mission Control (v4 - KPI ROUTING)
 * ✅ CLICK-THROUGH FIX:
 * - Stop propagation on menu interactions (onMouseDown + onClick)
 * - Guard KPI/table clicks if any menu/modal is open
 *
 * ✅ SETTINGS:
 * - Tips toggle (persisted)
 * - Compact UI toggle (persisted + body class)
 * - Mobile Compact toggle (persisted + body class, only used by CSS media queries)
 */

export default function MissionControl() {
  const navigate = useNavigate();

  // Top-right menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Lane History menu
  const [laneHistoryMenuOpen, setLaneHistoryMenuOpen] = useState(false);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings keys
  const LS_MC_COMPACT = "lanesync_mc_compact_ui_v1";
  const LS_MC_TIPS = "lanesync_mc_show_tips_v1";
  const LS_MC_MOBILE_COMPACT = "lanesync_mc_mobile_compact_v1";

  // Settings state
  const [showTips, setShowTips] = useState(() => {
    const v = localStorage.getItem(LS_MC_TIPS);
    if (v === null) return true;
    return v === "true";
  });

  const [compactUi, setCompactUi] = useState(() => {
    const v = localStorage.getItem(LS_MC_COMPACT);
    if (v === null) return false;
    return v === "true";
  });

  const [mobileCompact, setMobileCompact] = useState(() => {
    const v = localStorage.getItem(LS_MC_MOBILE_COMPACT);
    if (v === null) return true; // default ON for better phone/tablet experience
    return v === "true";
  });

  // Apply + persist compact UI
  useEffect(() => {
    document.body.classList.toggle("compact-ui", !!compactUi);
    try {
      localStorage.setItem(LS_MC_COMPACT, String(!!compactUi));
    } catch {
      // ignore
    }
  }, [compactUi]);

  // Persist tips
  useEffect(() => {
    try {
      localStorage.setItem(LS_MC_TIPS, String(!!showTips));
    } catch {
      // ignore
    }
  }, [showTips]);

  // Apply + persist mobile compact (CSS will decide when to use it via media queries)
  useEffect(() => {
    document.body.classList.toggle("mobile-compact", !!mobileCompact);
    try {
      localStorage.setItem(LS_MC_MOBILE_COMPACT, String(!!mobileCompact));
    } catch {
      // ignore
    }
  }, [mobileCompact]);

  // Lane selector state
  const lanes = useMemo(
    () => [
      {
        id: "chi-dal",
        label: "Chicago, IL → Dallas, TX",
        from: "Chicago, IL",
        to: "Dallas, TX",
        miles: 920,
        rate: 2600,
        netRpm: 2.17,
      },
      {
        id: "dal-mem",
        label: "Dallas, TX → Memphis, TN",
        from: "Dallas, TX",
        to: "Memphis, TN",
        miles: 452,
        rate: 1050,
        netRpm: 1.88,
      },
      {
        id: "chi-atl",
        label: "Chicago, IL → Atlanta, GA",
        from: "Chicago, IL",
        to: "Atlanta, GA",
        miles: 720,
        rate: 1760,
        netRpm: 2.45,
      },
      {
        id: "atl-nsh",
        label: "Atlanta, GA → Nashville, TN",
        from: "Atlanta, GA",
        to: "Nashville, TN",
        miles: 250,
        rate: 700,
        netRpm: 2.55,
      },
    ],
    []
  );

  const [selectedLaneId, setSelectedLaneId] = useState(lanes[0]?.id || "");
  const selectedLane = useMemo(
    () => lanes.find((l) => l.id === selectedLaneId) || lanes[0],
    [lanes, selectedLaneId]
  );

  // KPIs
  const kpis = useMemo(
    () => [
      { id: "lanes", label: "Active Lanes", value: "8", sub: "", actionable: true },
      { id: "trucks", label: "Active Trucks", value: "14", sub: "Healthy", actionable: true },
      { id: "booked", label: "Loads Booked", value: "29", sub: "This Week", actionable: true },
      { id: "below", label: "Trucks Below Target", value: "3", sub: "", actionable: true },
      { id: "avg", label: "Avg Net RPM", value: "$2.38", sub: "This Week", actionable: true },
    ],
    []
  );

  const buildLaneQuery = (laneObj, extra = {}) => {
    const params = new URLSearchParams({
      from: laneObj.from,
      to: laneObj.to,
      miles: String(laneObj.miles),
      rate: String(laneObj.rate),
      net: String(laneObj.netRpm),
      laneId: laneObj.id,
      ...extra,
    });
    return params.toString();
  };

  const rememberLane = (laneObj) => {
    try {
      sessionStorage.setItem("lanesync_selected_lane", JSON.stringify(laneObj));
    } catch {
      // ignore
    }
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setLaneHistoryMenuOpen(false);
  };

  const anyOverlayOpen = menuOpen || laneHistoryMenuOpen || settingsOpen;

  // helper: prevent click-through / ghost clicks
  const stopMenuEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // KPI routing
  const handleKpiClick = (kpiId) => {
    if (anyOverlayOpen) return;

    if (kpiId === "lanes") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane)}`);
      } else {
        navigate("/lane-command");
      }
      return;
    }

    if (kpiId === "trucks") return navigate("/carrier-command");
    if (kpiId === "booked") return navigate("/load-command");

    if (kpiId === "below") return navigate("/carrier-command?filter=below-target");

    if (kpiId === "avg") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane, { focus: "net" })}`);
      } else {
        navigate("/lane-command");
      }
    }
  };

  // Carrier Performance row click -> Carrier Command
  const openCarrierFromPerformance = (carrierName) => {
    if (anyOverlayOpen) return;

    const params = new URLSearchParams({
      carrier: carrierName,
      from: "mission-control",
    });

    navigate(`/carrier-command?${params.toString()}`);
  };

  // Close menus/modals on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeAllMenus();
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close top-right menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutside = (e) => {
      if (!e.target.closest(".top-actions")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [menuOpen]);

  // Close Lane History menu on outside click
  useEffect(() => {
    if (!laneHistoryMenuOpen) return;
    const closeOnOutside = (e) => {
      if (!e.target.closest(".lane-history-actions")) setLaneHistoryMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [laneHistoryMenuOpen]);

  // Broker panel
  const broker = useMemo(
    () => ({
      broker: "ABC Logistics",
      mc: "567432",
      notesShort: "Needs quick confirmation.",
      notesList: [
        "Confirm delivery appointment window",
        "Verify fuel surcharge inclusion",
        "Check detention policy before tender",
      ],
    }),
    []
  );

  // Lane history rows
  const laneHistoryRows = useMemo(() => {
    if (!selectedLane) return [];
    if (selectedLane.id === "dal-mem") {
      return [
        { date: "01/04", netRpm: 1.88, miles: 452, rate: 1050, broker: "RoadStar" },
        { date: "12/28", netRpm: 1.95, miles: 452, rate: 1100, broker: "BlueHaul" },
        { date: "12/16", netRpm: 2.1, miles: 452, rate: 1180, broker: "Atlas Freight" },
      ];
    }
    if (selectedLane.id === "chi-atl") {
      return [
        { date: "01/05", netRpm: 2.45, miles: 720, rate: 1760, broker: "ABC Logistics" },
        { date: "12/28", netRpm: 2.32, miles: 720, rate: 1680, broker: "RoadStar" },
        { date: "12/16", netRpm: 2.18, miles: 720, rate: 1580, broker: "BlueHaul" },
      ];
    }
    if (selectedLane.id === "atl-nsh") {
      return [
        { date: "01/06", netRpm: 2.73, miles: 250, rate: 740, broker: "ABC Logistics" },
        { date: "12/28", netRpm: 2.55, miles: 250, rate: 700, broker: "RoadStar" },
        { date: "12/16", netRpm: 2.48, miles: 250, rate: 680, broker: "BlueHaul" },
      ];
    }
    return [
      { date: "01/06", netRpm: 2.35, miles: 920, rate: 2600, broker: "ABC Logistics" },
      { date: "12/28", netRpm: 2.2, miles: 920, rate: 2480, broker: "RoadStar" },
      { date: "12/16", netRpm: 2.1, miles: 920, rate: 2400, broker: "BlueHaul" },
    ];
  }, [selectedLane]);

  const carrierRows = useMemo(
    () => [
      { carrier: "Swift Transport", trucks: "5", rpm: "$2.42", loads: "3.0" },
      { carrier: "Reliable Freight", trucks: "7", rpm: "$1.95", loads: "2.1" },
    ],
    []
  );

  const recentLoads = useMemo(
    () => [
      { date: "01/05", laneId: "chi-atl", lane: "Chicago, IL → Atlanta, GA", miles: "720", rpm: "$2.45", status: "Ok" },
      { date: "01/04", laneId: "dal-mem", lane: "Dallas, TX → Memphis, TN", miles: "452", rpm: "$1.88", status: "Risk" },
    ],
    []
  );

  const statusLabel = (selectedLane?.netRpm ?? 2.17) >= 2.35 ? "HEALTHY" : (selectedLane?.netRpm ?? 2.17) >= 2.1 ? "BORDERLINE" : "RISK";

  const openLaneCommandHere = () => {
    if (!selectedLane || anyOverlayOpen) return;
    rememberLane(selectedLane);
    navigate(`/lane-command?${buildLaneQuery(selectedLane)}`);
  };

  const popOutLaneCommand = (extra = {}) => {
    if (!selectedLane) return;
    rememberLane(selectedLane);
    window.open(`/lane-command?${buildLaneQuery(selectedLane, extra)}`, "_blank", "noopener,noreferrer");
  };

  const popOutMissionControl = () => {
    window.open(`/mission-control`, "_blank", "noopener,noreferrer");
  };

  const exportLaneHistoryCSV = () => {
    if (!selectedLane) return;

    const header = ["Lane", "Date", "Broker", "Miles", "Rate", "Net RPM"];
    const laneLabel = `${selectedLane.from} -> ${selectedLane.to}`;

    const csvLines = [
      header.join(","),
      ...laneHistoryRows.map((r) =>
        [`"${laneLabel}"`, `"${r.date}"`, `"${r.broker}"`, r.miles, r.rate, r.netRpm.toFixed(2)].join(",")
      ),
    ];

    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `lane-history_${selectedLane.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openLaneCommandHistoryHere = () => {
    if (!selectedLane || anyOverlayOpen) return;
    rememberLane(selectedLane);
    navigate(`/lane-command?${buildLaneQuery(selectedLane, { tab: "history" })}`);
  };

  const openFromRecentLoad = (laneId) => {
    if (anyOverlayOpen) return;
    const laneObj = lanes.find((l) => l.id === laneId);
    if (!laneObj) return;
    setSelectedLaneId(laneObj.id);
    rememberLane(laneObj);
    navigate(`/lane-command?${buildLaneQuery(laneObj)}`);
  };

  const resetMissionPrefs = () => {
    try {
      localStorage.removeItem(LS_MC_COMPACT);
      localStorage.removeItem(LS_MC_TIPS);
      localStorage.removeItem(LS_MC_MOBILE_COMPACT);
      localStorage.removeItem("lanesync_sidebar_open");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="mission-page">
      <div className="mission-canvas">
        <div className="mission-panel">
          {/* TOP STRIP */}
          <div className="mission-topstrip">
            <div className="top-pill">Week of Jan 6</div>
            <div className="top-pill">Active Trucks: 14</div>
            <div className="top-pill">Weekly Gross: $8,760</div>

            <div className="top-actions">
              <button className="icon-btn" title="Pop Out" type="button" onClick={popOutMissionControl}>
                ↗
              </button>

              <button
                className="icon-btn"
                title="More"
                type="button"
                onMouseDown={stopMenuEvent}
                onClick={(e) => {
                  stopMenuEvent(e);
                  setLaneHistoryMenuOpen(false);
                  setMenuOpen((v) => !v);
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                ⋯
              </button>

              {/* ✅ FIXED: cleaned popout-menu element (no duplicates / broken JSX) */}
              <div
                className={`popout-menu ${menuOpen ? "open" : ""}`}
                role="menu"
                onMouseDown={stopMenuEvent}
                onClick={stopMenuEvent}
              >
                <div className="popout-menu-title">Options</div>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    popOutMissionControl();
                    closeAllMenus();
                  }}
                >
                  🪟 Pop out Mission Control
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    closeAllMenus();
                    setSettingsOpen(true);
                  }}
                >
                  ⚙️ Settings
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    setCompactUi((v) => !v);
                    closeAllMenus();
                  }}
                >
                  📐 Toggle compact layout
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    popOutLaneCommand();
                    closeAllMenus();
                  }}
                >
                  🧭 Pop out Lane Command (selected lane)
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    closeAllMenus();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* HEADER */}
          <div className="mission-header">
            <div className="brand-stack">
              <div className="brand-big">LANESYNC</div>
              <div className="brand-small">Sync OS</div>
            </div>

            <div className="mission-title">Mission Control</div>

            <div className="mission-header-right" />
          </div>

          {/* KPI ROW */}
          <div className="kpi-row">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className={["kpi-card", kpi.actionable ? "actionable" : ""].join(" ")}
                onClick={(e) => {
                  if (anyOverlayOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (kpi.actionable) handleKpiClick(kpi.id);
                }}
                role={kpi.actionable ? "button" : undefined}
                tabIndex={kpi.actionable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!kpi.actionable) return;
                  if (anyOverlayOpen) return;
                  if (e.key === "Enter" || e.key === " ") handleKpiClick(kpi.id);
                }}
                title={`Open ${kpi.label}`}
              >
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                {kpi.sub ? <div className="kpi-sub">{kpi.sub}</div> : <div className="kpi-sub kpi-sub-empty">.</div>}
              </div>
            ))}
          </div>

          <div className="soft-sep" />

          {/* LANE STRIP */}
          <div className="lane-strip">
            <div className="lane-strip-title">Lane Command</div>

            <div className="lane-chip wide">
              <div className="chip-label">Lane</div>

              <div className="chip-value" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  value={selectedLaneId}
                  onChange={(e) => setSelectedLaneId(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    outline: "none",
                  }}
                  aria-label="Select lane"
                >
                  {lanes.map((l) => (
                    <option key={l.id} value={l.id} style={{ color: "#0b1020" }}>
                      {l.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={openLaneCommandHere}
                  style={{
                    height: 34,
                    padding: "0 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 850,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  title="Open Lane Command"
                >
                  Open
                </button>
              </div>
            </div>

            <div className="lane-chip">
              <div className="chip-label">Miles</div>
              <div className="chip-value">{selectedLane?.miles}</div>
            </div>

            <div className="lane-chip">
              <div className="chip-label">Rate</div>
              <div className="chip-value">${selectedLane?.rate?.toLocaleString?.() ?? selectedLane?.rate}</div>
            </div>

            <button className="popout-btn" type="button" onClick={() => popOutLaneCommand()}>
              Pop Out
            </button>
          </div>

          <div className="soft-sep" />

          {/* MAIN GRID */}
          <div className="mission-grid">
            {/* Broker */}
            <div className="panel-card">
              <div className="panel-title">Broker</div>

              <div className="kv">
                <div className="k">Broker:</div>
                <div className="v">{broker.broker}</div>

                <div className="k">MC#:</div>
                <div className="v">{broker.mc}</div>

                <div className="k">Notes:</div>
                <div className="v">{broker.notesShort}</div>
              </div>

              <div className="panel-title sub">Notes</div>
              <ul className="notes-list">
                {broker.notesList.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>

            {/* NET RPM */}
            <div className="panel-card netrpm-card">
              <div className="netrpm-label">NET RPM</div>
              <div className="netrpm-value">${(selectedLane?.netRpm ?? 2.17).toFixed(2)}</div>

              <div className="netrpm-status">
                <div className="status-label">STATUS</div>
                <div className="status-pill">{statusLabel}</div>
              </div>
            </div>

            {/* Lane History */}
            <div className="panel-card">
              <div className="panel-title row lane-history-actions">
                <span>Lane History</span>

                <button
                  className="mini-icon"
                  type="button"
                  title="Lane history options"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    setMenuOpen(false);
                    setLaneHistoryMenuOpen((v) => !v);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={laneHistoryMenuOpen}
                >
                  ⋯
                </button>

                <div className={`lh-menu ${laneHistoryMenuOpen ? "open" : ""}`} role="menu" onMouseDown={stopMenuEvent} onClick={stopMenuEvent}>
                  <div className="lh-menu-title">Lane History</div>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      exportLaneHistoryCSV();
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    ⬇️ Export CSV
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      openLaneCommandHistoryHere();
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    📜 Open in Lane Command (History)
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      popOutLaneCommand({ tab: "history" });
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    🪟 Pop out Lane Command (History)
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="history-sub">Last Rates:</div>
              <div className="history-list">
                {laneHistoryRows.map((r) => (
                  <div key={r.date} className="history-item">
                    ${r.netRpm.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-sep" />

          {/* BOTTOM ROW */}
          <div className="bottom-row">
            {/* Carrier Performance */}
            <div className="panel-card table-card">
              <div className="panel-title">Carrier Performance</div>

              <div className="table-wrap">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>Trucks</th>
                      <th>Avg Net RPM</th>
                      <th>Loads / Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrierRows.map((r) => (
                      <tr
                        key={r.carrier}
                        onClick={(e) => {
                          if (anyOverlayOpen) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          openCarrierFromPerformance(r.carrier);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (anyOverlayOpen) return;
                          if (e.key === "Enter" || e.key === " ") openCarrierFromPerformance(r.carrier);
                        }}
                        style={{ cursor: "pointer" }}
                        title={`Open Carrier Command for ${r.carrier}`}
                      >
                        <td style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{r.carrier}</td>
                        <td>{r.trucks}</td>
                        <td>{r.rpm}</td>
                        <td>{r.loads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showTips ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Tip: Click a carrier row to open Carrier Command.</div> : null}
            </div>

            {/* Recent Loads */}
            <div className="panel-card table-card">
              <div className="panel-title">Recent Loads</div>

              <div className="table-wrap">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lane</th>
                      <th>Miles</th>
                      <th>Net RPM</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoads.map((r) => (
                      <tr
                        key={`${r.date}-${r.lane}`}
                        onClick={(e) => {
                          if (anyOverlayOpen) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          openFromRecentLoad(r.laneId);
                        }}
                        style={{ cursor: "pointer" }}
                        title="Open Lane Command for this lane"
                      >
                        <td>{r.date}</td>
                        <td style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{r.lane}</td>
                        <td>{r.miles}</td>
                        <td>{r.rpm}</td>
                        <td>
                          <span className={`tag ${r.status === "Risk" ? "risk" : "ok"}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showTips ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Tip: Click a row to open Lane Command for that lane.</div> : null}
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {settingsOpen ? (
        <div className="mc-overlay" role="dialog" aria-modal="true" onClick={() => setSettingsOpen(false)}>
          <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modalHeader">
              <div>
                <div className="mc-modalTitle">Settings</div>
                <div className="mc-modalSub">Mission Control preferences</div>
              </div>
              <button className="mc-close" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close">
                ✕
              </button>
            </div>

            <div className="mc-modalBody">
              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Show tips</div>
                  <div className="mc-settingHelp">Shows the “Tip:” lines under tables and cards.</div>
                </div>
                <label className="mc-toggle" title="Toggle tips">
                  <input type="checkbox" checked={showTips} onChange={(e) => setShowTips(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Compact layout</div>
                  <div className="mc-settingHelp">Tightens spacing using the existing compact-ui class.</div>
                </div>
                <label className="mc-toggle" title="Toggle compact layout">
                  <input type="checkbox" checked={compactUi} onChange={(e) => setCompactUi(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Mobile compact mode</div>
                  <div className="mc-settingHelp">Tightens spacing on phones/tablets (used by CSS media queries).</div>
                </div>
                <label className="mc-toggle" title="Toggle mobile compact">
                  <input type="checkbox" checked={mobileCompact} onChange={(e) => setMobileCompact(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Reset preferences</div>
                  <div className="mc-settingHelp">Clears saved UI settings (compact, tips, mobile compact, sidebar preference).</div>
                </div>
                <button className="mc-btn" type="button" onClick={resetMissionPrefs}>
                  Reset
                </button>
              </div>
            </div>

            <div className="mc-modalFooter">
              <button className="mc-btn" type="button" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
              <button className="mc-btn mc-btn--primary" type="button" onClick={() => setSettingsOpen(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
