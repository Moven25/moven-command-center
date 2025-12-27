import React, { useMemo } from "react";
import "./Dashboard.css";

function safeCount(arr) {
  return Array.isArray(arr) ? arr.length : 0;
}

function formatNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toLocaleString();
}

function formatSyncTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Dashboard({
  activeCommand = "mission",
  onCommandChange,
  movenData,
  movenSync,
  refreshAllSheets,
}) {
  const carriersCount = safeCount(movenData?.carriers);
  const loadsCount = safeCount(movenData?.loads);

  // pick a few loads for the summary table
  const loadRows = useMemo(() => {
    const rows = Array.isArray(movenData?.loads) ? movenData.loads : [];
    return rows.slice(0, 6);
  }, [movenData]);

  const topButtons = [
    { key: "mission", label: "Mission Control" },
    { key: "carrier", label: "Carrier Command" },
    { key: "load", label: "Load Command" },
    { key: "weather", label: "Weather Command" },
    { key: "learning", label: "Learning Command" },
  ];

  return (
    <div className="dashRoot">
      <header className="dashTopbar">
        <div className="brandText">MOVEN COMMAND</div>

        <div className="topCommands">
          {topButtons.map((b) => (
            <button
              key={b.key}
              className={`top-command-btn ${activeCommand === b.key ? "active" : ""}`}
              onClick={() => onCommandChange?.(b.key)}
              type="button"
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="topIcons">
          <button className="iconBtn" type="button" title="Tools">
            ⚙️
          </button>
          <button className="iconBtn" type="button" title="Panel">
            ⬛
          </button>
        </div>
      </header>

      {/* Mission Control renders the exact dashboard grid like your screenshot */}
      <div className="pageInner">
        {/* LEFT COLUMN */}
        <section className="colLeft">
          <div className="card glass">
            <div className="cardTitle">Live Carrier Data</div>

            <div className="gaugeWrap">
              <div className="gaugeCircle">
                <div className="gaugeValue">84</div>
              </div>
            </div>

            <div className="metric"><span>Carrier Performance Score</span><span>—</span></div>
            <div className="metric"><span>Live Carriers</span><span>{carriersCount}</span></div>
            <div className="metric"><span>Insurance Alerts</span><span>—</span></div>
            <div className="metric"><span>Compliance Warnings</span><span>—</span></div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Weather Command</div>
            <div className="metric"><span>Active Loads</span><span>—</span></div>
            <div className="metric"><span>Loads This Week</span><span>—</span></div>
            <div className="metric"><span>Total Loaded Miles</span><span>—</span></div>
            <div className="metric"><span>Weather Alerts</span><span>—</span></div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Market Command</div>
            <div className="marketRow">
              <span className="pill">Moderate</span>
            </div>
            <div className="dotRow"><span className="dot green" /> Cold Markets</div>
            <div className="dotRow"><span className="dot red" /> Volume</div>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="colCenter">
          <div className="card glass">
            <div className="cardTitle">Load Command Summary</div>

            <table className="miniTable">
              <thead>
                <tr>
                  <th>Load ID</th>
                  <th>Origin</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>RPM</th>
                  <th>Suggested Score</th>
                </tr>
              </thead>
              <tbody>
                {loadRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="subtle">
                      No loads found yet (sync your Zoho loads sheet).
                    </td>
                  </tr>
                ) : (
                  loadRows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.LoadID || r["Load ID"] || r.id || "—"}</td>
                      <td>{r.Origin || r.origin || "—"}</td>
                      <td>{r.Pickup || r.pickup || "—"}</td>
                      <td>{r.Delivery || r.delivery || "—"}</td>
                      <td>{r.RPM || r.rpm || "—"}</td>
                      <td>
                        <span className="scorePill green">{r.Score || r.score || "—"}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="midRow">
            <div className="card glass">
              <div className="cardTitle">Today’s Priorities</div>
              <div className="prioRow"><span className="dot yellow" /> Urgent Loads</div>
              <div className="prioRow"><span className="dot green" /> Check Calls Due</div>
              <div className="prioRow"><span className="dot red" /> Missing Documents</div>
              <div className="prioRow"><span className="dot green" /> Carrier Updates</div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Revenue Today</div>
              <div className="money">$—</div>
              <div className="subtle">Last Sync: {formatSyncTime(movenSync?.lastSyncAt)}</div>
            </div>

            <div className="card glass dtlCard">
              <div className="dtlTitle">
                <div className="cardTitle" style={{ marginBottom: 0 }}>
                  DTL Command
                </div>
                <span className="dtlStatus">{activeCommand === "dtl" ? "Active" : "Idle"}</span>
              </div>

              <div className="dtlLine"><span>Best Lane</span><span>—</span></div>
              <div className="dtlLine"><span>Projected RPM</span><span>—</span></div>
              <div className="dtlLine"><span>Confidence</span><span>—</span></div>

              <div className="dtlFooter">
                <button className="dtlBtn" type="button" onClick={() => onCommandChange?.("dtl")}>
                  View DTL
                </button>
                <button className="dtlBtn dtlBtnPrimary" type="button" onClick={() => console.log("Run scan (stub)")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>

          <div className="actionBar">
            <button className="actionBtn" type="button" onClick={() => console.log("Add Carrier (next step)")}>
              Add Carrier
            </button>
            <button className="actionBtn" type="button" onClick={() => console.log("Add Load (next step)")}>
              Add Load
            </button>
            <button
              className="actionBtn primary"
              type="button"
              onClick={refreshAllSheets}
              disabled={!!movenSync?.loading}
            >
              {movenSync?.loading ? "Syncing..." : "Sync Sheets"}
            </button>
            <button className="actionBtn danger" type="button" onClick={() => console.log("Emergency (stub)")}>
              Emergency Alert
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">Alerts Feed</div>
            <div className="alerts">
              <div>Sheets loaded. Next: real alerts.</div>
              <div>Carriers: {formatNumber(carriersCount)}</div>
              <div>Loads: {formatNumber(loadsCount)}</div>
              {movenSync?.error ? (
                <div className="alertError">Sync Error: {movenSync.error}</div>
              ) : null}
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Health</div>
            <div className="healthRow">
              <span>Screen</span>
              <div className="healthBar"><div className="healthFill" style={{ width: "92%" }} /></div>
            </div>
            <div className="healthRow">
              <span>Sheet Sync</span>
              <div className="healthBar"><div className="healthFill" style={{ width: movenSync?.error ? "35%" : "80%" }} /></div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Command Tip</div>
            <div className="subtle">
              Next: render real Carrier + Load tables from your sheets, and wire up “Add Carrier”.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
