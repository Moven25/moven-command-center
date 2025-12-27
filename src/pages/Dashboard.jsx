import React from "react";
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
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function PlaceholderGrid({
  title,
  subtitle,
  activeCommand,
  onCommandChange,
  movenData,
  movenSync,
  refreshAllSheets,
  tableTitle = "Command Queue",
  tableCols = ["Item", "Status", "Owner", "Priority", "Updated", "Score"],
  rightTitle = "Intel Feed",
  rightItems = [],
}) {
  const setCmd = (key) => () => onCommandChange?.(key);
  const topBtnClass = (key) =>
    activeCommand === key ? "top-command-btn active" : "top-command-btn";

  const carriersCount = safeCount(movenData?.carriers);
  const loadsCount = safeCount(movenData?.loads);

  return (
    <div className="dashRoot">
      <header className="dashTopbar">
        <div className="brand">
          <span className="brandText">MOVEN COMMAND</span>
        </div>

        <div className="top-command-bar">
          <button className={topBtnClass("mission")} onClick={setCmd("mission")}>Mission Control</button>
          <button className={topBtnClass("carrier")} onClick={setCmd("carrier")}>Carrier Command</button>
          <button className={topBtnClass("load")} onClick={setCmd("load")}>Load Command</button>
          <button className={topBtnClass("weather")} onClick={setCmd("weather")}>Weather Command</button>
          <button className={topBtnClass("learning")} onClick={setCmd("learning")}>Learning Command</button>
        </div>

        <div className="topIcons">
          <div className="topIcon" title="Notes">📓</div>
          <div className="topIcon" title="Settings">⚙️</div>
        </div>
      </header>

      <main className="dashGrid">
        <section className="colLeft">
          <div className="card glass tall">
            <div className="cardTitle">{title}</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              {subtitle}
            </div>

            <div className="statsList" style={{ marginTop: 14 }}>
              <div className="statRow">
                <span>Live Carriers</span>
                <span className="statVal">{formatNumber(carriersCount)}</span>
              </div>
              <div className="statRow">
                <span>Loads</span>
                <span className="statVal">{formatNumber(loadsCount)}</span>
              </div>
              <div className="statRow">
                <span>Last Sync</span>
                <span className="statVal">{formatSyncTime(movenSync?.lastSyncAt)}</span>
              </div>
            </div>

            {movenSync?.error ? (
              <div style={{ marginTop: 12, color: "rgba(255,90,90,.95)", fontWeight: 700 }}>
                Sync error: {movenSync.error}
              </div>
            ) : null}
          </div>

          <div className="card glass">
            <div className="cardTitle">Quick Actions</div>
            <div className="prioList">
              <div className="prio"><span className="prioSwatch green" /> Review Queue</div>
              <div className="prio"><span className="prioSwatch lime" /> Run Scan</div>
              <div className="prio"><span className="prioSwatch pink" /> Check Alerts</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Notes</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              This command page matches Mission Control layout. Next we’ll connect real workflows and actions.
            </div>
          </div>
        </section>

        <section className="colCenter">
          <div className="card glass wide">
            <div className="cardTitle">{tableTitle}</div>

            <div className="tableHead">
              {tableCols.map((c) => <span key={c}>{c}</span>)}
            </div>

            {/* placeholder rows (we’ll replace with real data next) */}
            <div className="tableRow">
              <span className="bold">Queue Item 001</span><span>Open</span><span>Owner</span><span>High</span><span>—</span>
              <span className="scorePill green">—</span>
            </div>
            <div className="tableRow">
              <span className="bold">Queue Item 002</span><span>Pending</span><span>Owner</span><span>Med</span><span>—</span>
              <span className="scorePill green">—</span>
            </div>
            <div className="tableRow">
              <span className="bold">Queue Item 003</span><span>Done</span><span>Owner</span><span>Low</span><span>—</span>
              <span className="scorePill green">—</span>
            </div>
          </div>

          <div className="rowTwo">
            <div className="card glass">
              <div className="cardTitle">Command Focus</div>
              <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
                Build the workflow first, then automate.
              </div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Live Totals</div>
              <div className="money">{formatNumber(loadsCount)}</div>
              <div className="subtle">Loads in system</div>
            </div>

            <div className="card glass dtlTile">
              <div className="dtlTop">
                <div className="cardTitle" style={{ marginBottom: 0 }}>DTL Command</div>
                <span className="dtlStatus">{activeCommand === "dtl" ? "Active" : "Idle"}</span>
              </div>

              <div className="dtlMeta">
                <div className="dtlLine"><span className="dtlLabel">Best Lane</span><span className="dtlValue">—</span></div>
                <div className="dtlLine"><span className="dtlLabel">Projected RPM</span><span className="dtlValue">—</span></div>
                <div className="dtlLine"><span className="dtlLabel">Confidence</span><span className="dtlValue">—</span></div>
              </div>

              <div className="dtlFooter">
                <button className="dtlBtn" onClick={setCmd("dtl")}>View DTL</button>
                <button className="dtlBtn dtlBtnPrimary" onClick={() => console.log("[MOVEN] Run DTL (stub)")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>

          <div className="actionBar">
            <button className="actionBtn" onClick={setCmd("mission")}>Back to Mission Control</button>

            <button className="actionBtn" onClick={refreshAllSheets} disabled={!!movenSync?.loading}>
              {movenSync?.loading ? "Syncing..." : "Sync Sheets"}
            </button>

            <button className="actionBtn danger" onClick={() => console.log("[MOVEN] Emergency (stub)")}>
              Emergency Alert
            </button>
          </div>
        </section>

        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">{rightTitle}</div>
            <div className="alerts">
              {(rightItems.length ? rightItems : [
                movenSync?.loading ? "Syncing sheets now..." : "Sheets loaded. Next: real alerts.",
                `Carriers loaded: ${formatNumber(carriersCount)}`,
                `Loads loaded: ${formatNumber(loadsCount)}`,
              ]).map((t, i) => (
                <div className="alert" key={i}>{t}</div>
              ))}
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Health</div>
            <div className="healthRows">
              <div className="healthRow">
                <span>UI</span>
                <span className="healthBar"><i style={{ width: "82%" }} /></span>
              </div>
              <div className="healthRow">
                <span>Data Layer</span>
                <span className="healthBar"><i style={{ width: movenSync?.error ? "20%" : "65%" }} /></span>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Command Tip</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              Next step: replace each table with real rows from your sheets.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Dashboard({
  activeCommand = "mission",
  onCommandChange,
  movenData,
  movenSync,
  refreshAllSheets,
}) {
  const setCmd = (key) => () => onCommandChange?.(key);
  const topBtnClass = (key) =>
    activeCommand === key ? "top-command-btn active" : "top-command-btn";

  // REAL counts (now live)
  const carriersCount = safeCount(movenData?.carriers);
  const loadsCount = safeCount(movenData?.loads);

  // === NON-MISSION COMMANDS: match the full grid layout ===
  if (activeCommand !== "mission") {
    const configs = {
      carrier: {
        title: "Carrier Command",
        subtitle: "Carrier profiles, compliance status, factoring, documents, and performance scoring will live here.",
        tableTitle: "Carrier Queue",
        tableCols: ["Carrier", "Status", "MC#", "Plan", "Updated", "Score"],
        rightTitle: "Carrier Alerts",
        rightItems: [
          movenSync?.loading ? "Syncing carriers..." : `Carriers loaded: ${formatNumber(carriersCount)}`,
          movenSync?.error ? `Sync error: ${movenSync.error}` : "Next: show carriers list + compliance warnings.",
        ],
      },
      load: {
        title: "Load Command",
        subtitle: "Load pipeline, scoring, booking workflow, check-calls, and lane intelligence will live here.",
        tableTitle: "Load Pipeline",
        tableCols: ["Load", "Origin", "Pickup", "Delivery", "RPM", "Score"],
        rightTitle: "Load Alerts",
        rightItems: [
          movenSync?.loading ? "Syncing loads..." : `Loads loaded: ${formatNumber(loadsCount)}`,
          movenSync?.error ? `Sync error: ${movenSync.error}` : "Next: render loads table from live data.",
        ],
      },
      weather: {
        title: "Weather Command",
        subtitle: "Weather risk by lane/truck, alerts, and route impact will live here.",
        tableTitle: "Weather Risk Queue",
        tableCols: ["Zone", "Impact", "Window", "Trucks", "Action", "Risk"],
        rightTitle: "Weather Alerts",
        rightItems: ["Next: wire weather API by truck/lane.", "This panel is ready."],
      },
      learning: {
        title: "Learning Command",
        subtitle: "Training, onboarding, SOPs, and walkthroughs will live here.",
        tableTitle: "Learning Modules",
        tableCols: ["Module", "Type", "Level", "Owner", "Updated", "Progress"],
        rightTitle: "Learning Notes",
        rightItems: ["Next: Quick Start + walkthroughs + owner-only lessons."],
      },
      dtl: {
        title: "DTL Command",
        subtitle: "DTL scanning, opportunity ranking, triangle routing, and profit projections will live here.",
        tableTitle: "DTL Opportunities",
        tableCols: ["Route", "Legs", "Miles", "RPM", "Net", "Score"],
        rightTitle: "DTL Alerts",
        rightItems: ["Next: scan loads → populate Best Lane/RPM/Confidence."],
      },
      settings: {
        title: "Settings",
        subtitle: "System settings, integrations, diagnostics, and utilities will live here.",
        tableTitle: "Settings",
        tableCols: ["Setting", "Value", "Scope", "Owner", "Updated", "Status"],
        rightTitle: "System Messages",
        rightItems: ["Next: add integration toggles + diagnostics."],
      },
      admin: {
        title: "Admin",
        subtitle: "Owner-only admin tools, access control, logs, and permissions will live here.",
        tableTitle: "Admin Queue",
        tableCols: ["Item", "Type", "Scope", "Owner", "Updated", "Status"],
        rightTitle: "Admin Alerts",
        rightItems: ["Next: user access control + audit logs."],
      },
    };

    const cfg = configs[activeCommand] || configs.carrier;

    return (
      <PlaceholderGrid
        title={cfg.title}
        subtitle={cfg.subtitle}
        activeCommand={activeCommand}
        onCommandChange={onCommandChange}
        movenData={movenData}
        movenSync={movenSync}
        refreshAllSheets={refreshAllSheets}
        tableTitle={cfg.tableTitle}
        tableCols={cfg.tableCols}
        rightTitle={cfg.rightTitle}
        rightItems={cfg.rightItems}
      />
    );
  }

  // === MISSION CONTROL (YOUR DASHBOARD) ===
  return (
    <div className="dashRoot">
      <header className="dashTopbar">
        <div className="brand">
          <span className="brandText">MOVEN COMMAND</span>
        </div>

        <div className="top-command-bar">
          <button className={topBtnClass("mission")} onClick={setCmd("mission")}>Mission Control</button>
          <button className={topBtnClass("carrier")} onClick={setCmd("carrier")}>Carrier Command</button>
          <button className={topBtnClass("load")} onClick={setCmd("load")}>Load Command</button>
          <button className={topBtnClass("weather")} onClick={setCmd("weather")}>Weather Command</button>
          <button className={topBtnClass("learning")} onClick={setCmd("learning")}>Learning Command</button>
        </div>

        <div className="topIcons">
          <div className="topIcon" title="Notes">📓</div>
          <div className="topIcon" title="Settings">⚙️</div>
        </div>
      </header>

      <main className="dashGrid">
        {/* Left Column */}
        <section className="colLeft">
          <div className="card glass tall">
            <div className="cardTitle">Live Carrier Data</div>

            <div className="gaugeWrap">
              <div className="gauge gaugeWarm">
                <div className="gaugeValue">84</div>
              </div>
              <div className="gaugeLabel">Carrier Performance Score</div>
            </div>

            <div className="statsList">
              <div className="statRow">
                <span>Live Carriers</span>
                <span className="statVal">{formatNumber(carriersCount)}</span>
              </div>
              <div className="statRow">
                <span>Insurance Alerts</span>
                <span className="statVal">—</span>
              </div>
              <div className="statRow">
                <span>Compliance Warnings</span>
                <span className="statVal">—</span>
              </div>
            </div>

            {movenSync?.error ? (
              <div style={{ marginTop: 10, color: "rgba(255,90,90,.95)", fontWeight: 800 }}>
                Sync error: {movenSync.error}
              </div>
            ) : null}
          </div>

          <div className="card glass">
            <div className="cardTitle">Weather Command</div>
            <div className="statsList">
              <div className="statRow"><span>Active Loads</span><span className="statVal">{formatNumber(loadsCount)}</span></div>
              <div className="statRow"><span>Loads This Week</span><span className="statVal">{formatNumber(loadsCount)}</span></div>
              <div className="statRow"><span>Total Loaded Miles</span><span className="statVal">—</span></div>
              <div className="statRow"><span>Weather Alerts</span><span className="statVal">—</span></div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Market Command</div>
            <div className="marketMeta">
              <span>Market</span>
              <span className="pill">Moderate</span>
            </div>
            <div className="marketSignals">
              <div className="signal"><span className="dot green" /> Cold Markets</div>
              <div className="signal"><span className="dot red" /> Volume</div>
            </div>
          </div>
        </section>

        {/* Center Column */}
        <section className="colCenter">
          <div className="card glass wide">
            <div className="cardTitle">Load Command Summary</div>

            <div className="tableHead">
              <span>Load ID</span><span>Origin</span><span>Pickup</span><span>Delivery</span><span>RPM</span>
              <span className="right">Suggested Score</span>
            </div>

            {/* Still placeholder rows for now (next step is real rows from movenData.loads) */}
            <div className="tableRow">
              <span className="bold">53081</span><span>Chicago</span><span>Dec. 5</span><span>Feb. 7</span><span>2.97</span>
              <span className="scorePill green">82</span>
            </div>
            <div className="tableRow">
              <span className="bold">53072</span><span>Louisville</span><span>Dec. 5</span><span>Jul. 15</span><span>3.15</span>
              <span className="scorePill green">77</span>
            </div>
            <div className="tableRow">
              <span className="bold">53056</span><span>Charlotte</span><span>Jul. 21</span><span>Dec. 16</span><span>2.46</span>
              <span className="scorePill amber">64</span>
            </div>
            <div className="tableRow">
              <span className="bold">53058</span><span>Phoenix</span><span>Jul. 29</span><span>Dec. 7</span><span>2.76</span>
              <span className="scorePill green">72</span>
            </div>
          </div>

          <div className="rowTwo">
            <div className="card glass">
              <div className="cardTitle">Today’s Priorities</div>
              <div className="prioList">
                <div className="prio"><span className="prioSwatch orange" /> Urgent Loads</div>
                <div className="prio"><span className="prioSwatch pink" /> Check Calls Due</div>
                <div className="prio"><span className="prioSwatch green" /> Missing Documents</div>
                <div className="prio"><span className="prioSwatch lime" /> Carrier Updates</div>
              </div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Revenue Today</div>
              <div className="money">$—</div>
              <div className="subtle">Last Sync • {formatSyncTime(movenSync?.lastSyncAt)}</div>
            </div>

            <div className="card glass dtlTile">
              <div className="dtlTop">
                <div className="cardTitle" style={{ marginBottom: 0 }}>DTL Command</div>
                <span className="dtlStatus">Idle</span>
              </div>

              <div className="dtlMeta">
                <div className="dtlLine"><span className="dtlLabel">Best Lane</span><span className="dtlValue">—</span></div>
                <div className="dtlLine"><span className="dtlLabel">Projected RPM</span><span className="dtlValue">—</span></div>
                <div className="dtlLine"><span className="dtlLabel">Confidence</span><span className="dtlValue">—</span></div>
              </div>

              <div className="dtlFooter">
                <button className="dtlBtn" onClick={setCmd("dtl")}>View DTL</button>
                <button className="dtlBtn dtlBtnPrimary" onClick={() => console.log("[MOVEN] Run DTL Scan (next)")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>

          <div className="actionBar">
            <button className="actionBtn" onClick={setCmd("carrier")}>Add Carrier</button>
            <button className="actionBtn" onClick={setCmd("load")}>Add Load</button>

            <button className="actionBtn" onClick={refreshAllSheets} disabled={!!movenSync?.loading}>
              {movenSync?.loading ? "Syncing..." : "Sync Sheets"}
            </button>

            <button className="actionBtn danger" onClick={() => console.log("[MOVEN] Emergency Alert (next)")}>
              Emergency Alert
            </button>
          </div>
        </section>

        {/* Right Column */}
        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">Alerts Feed</div>
            <div className="alerts">
              <div className="alert">{movenSync?.loading ? "Syncing sheets..." : "Sheets loaded. Next: real alerts."}</div>
              <div className="alert">Carriers: {formatNumber(carriersCount)}</div>
              <div className="alert">Loads: {formatNumber(loadsCount)}</div>
              {movenSync?.error ? <div className="alert">Error: {movenSync.error}</div> : null}
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Health</div>
            <div className="healthRows">
              <div className="healthRow"><span>Screen</span><span className="healthBar"><i style={{ width: "78%" }} /></span></div>
              <div className="healthRow"><span>Sheet Sync</span><span className="healthBar"><i style={{ width: movenSync?.error ? "20%" : "70%" }} /></span></div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Command Tip</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              Next: render the Load Command Summary table from your real loads sheet.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
