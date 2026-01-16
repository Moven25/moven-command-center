// src/pages/MissionControl.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MissionControl.css";

/**
 * Mission Control (v4 - KPI ROUTING)
 * - KPI clicks NAVIGATE to command pages:
 *    Active Lanes -> Lane Command
 *    Active Trucks -> Carrier Command
 *    Loads Booked -> Load Command
 *    Trucks Below Target -> Carrier Command (with filter hint)
 *    Avg Net RPM -> Lane Command (focus hint)
 * - Keeps:
 *    top-right ⋯ menu
 *    lane selector -> lane command with selected lane (query params)
 *    pop out lane command with selected lane (query params)
 *    lane history ⋯ menu + CSV export + open history
 *    recent loads row click -> lane command for that lane
 *
 * - NEW:
 *    Carrier Performance rows click -> Carrier Command (with carrier query)
 */

export default function MissionControl() {
  const navigate = useNavigate();

  // Top-right menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Lane History menu
  const [laneHistoryMenuOpen, setLaneHistoryMenuOpen] = useState(false);

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

  // ✅ KPI -> Route to Command pages
  const handleKpiClick = (kpiId) => {
    // close any menus so nothing blocks clicks
    setMenuOpen(false);
    setLaneHistoryMenuOpen(false);

    if (kpiId === "lanes") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane)}`);
      } else {
        navigate("/lane-command");
      }
      return;
    }

    if (kpiId === "trucks") {
      navigate("/carrier-command");
      return;
    }

    if (kpiId === "booked") {
      navigate("/load-command");
      return;
    }

    if (kpiId === "below") {
      // filter hint (optional for later)
      navigate("/carrier-command?filter=below-target");
      return;
    }

    if (kpiId === "avg") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane, { focus: "net" })}`);
      } else {
        navigate("/lane-command");
      }
    }
  };

  // ✅ Carrier Performance row click -> Carrier Command (with carrier query)
  const openCarrierFromPerformance = (carrierName) => {
    setMenuOpen(false);
    setLaneHistoryMenuOpen(false);

    const params = new URLSearchParams({
      carrier: carrierName,
      from: "mission-control",
    });

    navigate(`/carrier-command?${params.toString()}`);
  };

  // Close menus on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLaneHistoryMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close top-right ⋯ menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutside = (e) => {
      if (!e.target.closest(".top-actions")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [menuOpen]);

  // Close Lane History ⋯ menu on outside click
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

  const netRpm = selectedLane?.netRpm ?? 2.17;
  const statusLabel = netRpm >= 2.35 ? "HEALTHY" : netRpm >= 2.1 ? "BORDERLINE" : "RISK";

  const openLaneCommandHere = () => {
    if (!selectedLane) return;
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
    if (!selectedLane) return;
    rememberLane(selectedLane);
    navigate(`/lane-command?${buildLaneQuery(selectedLane, { tab: "history" })}`);
  };

  const openFromRecentLoad = (laneId) => {
    const laneObj = lanes.find((l) => l.id === laneId);
    if (!laneObj) return;
    setSelectedLaneId(laneObj.id);
    rememberLane(laneObj);
    navigate(`/lane-command?${buildLaneQuery(laneObj)}`);
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
                onClick={(e) => {
                  e.stopPropagation();
                  setLaneHistoryMenuOpen(false);
                  setMenuOpen((v) => !v);
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                ⋯
              </button>

              <div className={`popout-menu ${menuOpen ? "open" : ""}`} role="menu">
                <div className="popout-menu-title">Options</div>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    popOutMissionControl();
                    setMenuOpen(false);
                  }}
                >
                  🪟 Pop out Mission Control
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    console.log("[Mission Control] Settings clicked");
                    setMenuOpen(false);
                  }}
                >
                  ⚙️ Settings
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    document.body.classList.toggle("compact-ui");
                    setMenuOpen(false);
                  }}
                >
                  📐 Toggle compact layout
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    popOutLaneCommand();
                    setMenuOpen(false);
                  }}
                >
                  🧭 Pop out Lane Command (selected lane)
                </button>

                <button className="popout-menu-item" role="menuitem" type="button" onClick={() => setMenuOpen(false)}>
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
                onClick={() => (kpi.actionable ? handleKpiClick(kpi.id) : null)}
                role={kpi.actionable ? "button" : undefined}
                tabIndex={kpi.actionable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!kpi.actionable) return;
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setLaneHistoryMenuOpen((v) => !v);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={laneHistoryMenuOpen}
                >
                  ⋯
                </button>

                <div className={`lh-menu ${laneHistoryMenuOpen ? "open" : ""}`} role="menu">
                  <div className="lh-menu-title">Lane History</div>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onClick={() => {
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
                    onClick={() => {
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
                    onClick={() => {
                      popOutLaneCommand({ tab: "history" });
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    🪟 Pop out Lane Command (History)
                  </button>

                  <button className="lh-menu-item" role="menuitem" type="button" onClick={() => setLaneHistoryMenuOpen(false)}>
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
                        onClick={() => openCarrierFromPerformance(r.carrier)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
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

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                Tip: Click a carrier row to open Carrier Command.
              </div>
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
                        onClick={() => openFromRecentLoad(r.laneId)}
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

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                Tip: Click a row to open Lane Command for that lane.
              </div>
            </div>
          </div>
          {/* /bottom-row */}
        </div>
      </div>
    </div>
  );
}
