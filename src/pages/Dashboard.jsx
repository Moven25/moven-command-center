// src/pages/Dashboard.jsx
import React from "react";
import "./Dashboard.css";

function PlaceholderGrid({
  title,
  subtitle,
  activeCommand,
  onCommandChange,
  primaryActions = [],
  kpis = [],
  tableTitle = "Command Queue",
  tableCols = ["Item", "Status", "Owner", "Priority", "Updated", "Score"],
  tableRows = [],
  rightTitle = "Intel Feed",
  rightItems = [],
}) {
  const setCmd = (key) => () => onCommandChange?.(key);
  const topBtnClass = (key) =>
    activeCommand === key ? "top-command-btn active" : "top-command-btn";

  return (
    <div className="dashRoot">
      {/* Top Bar */}
      <header className="dashTopbar">
        <div className="brand">
          <span className="brandText">MOVEN COMMAND</span>
        </div>

        <div className="top-command-bar">
          <button className={topBtnClass("mission")} onClick={setCmd("mission")}>
            Mission Control
          </button>
          <button className={topBtnClass("carrier")} onClick={setCmd("carrier")}>
            Carrier Command
          </button>
          <button className={topBtnClass("load")} onClick={setCmd("load")}>
            Load Command
          </button>
          <button className={topBtnClass("weather")} onClick={setCmd("weather")}>
            Weather Command
          </button>
          <button className={topBtnClass("learning")} onClick={setCmd("learning")}>
            Learning Command
          </button>
        </div>

        <div className="topIcons">
          <div className="topIcon" title="Notes">📓</div>
          <div className="topIcon" title="Settings">⚙️</div>
        </div>
      </header>

      {/* Main Grid (MATCHES Mission Control) */}
      <main className="dashGrid">
        {/* Left Column */}
        <section className="colLeft">
          <div className="card glass tall">
            <div className="cardTitle">{title}</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              {subtitle}
            </div>

            <div className="statsList" style={{ marginTop: 14 }}>
              {kpis.length ? (
                kpis.map((k) => (
                  <div className="statRow" key={k.label}>
                    <span>{k.label}</span>
                    <span className="statVal">{k.value}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="statRow">
                    <span>Status</span>
                    <span className="statVal">Ready</span>
                  </div>
                  <div className="statRow">
                    <span>Last Sync</span>
                    <span className="statVal">—</span>
                  </div>
                  <div className="statRow">
                    <span>Next Step</span>
                    <span className="statVal">Wire Data</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Quick Actions</div>
            <div className="prioList">
              {(primaryActions.length ? primaryActions : ["Run Primary Action", "Sync Data", "Review Alerts"]).map(
                (a) => (
                  <div className="prio" key={a}>
                    <span className="prioSwatch green" /> {a}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Notes</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              This command panel is live and styled. Next we’ll connect it to real data + actions.
            </div>
          </div>
        </section>

        {/* Center Column */}
        <section className="colCenter">
          <div className="card glass wide">
            <div className="cardTitle">{tableTitle}</div>

            <div className="tableHead">
              {tableCols.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>

            {(tableRows.length ? tableRows : [
              { a: "Queue Item 001", b: "Open", c: "Owner", d: "High", e: "—", f: "—" },
              { a: "Queue Item 002", b: "Pending", c: "Owner", d: "Med", e: "—", f: "—" },
              { a: "Queue Item 003", b: "Done", c: "Owner", d: "Low", e: "—", f: "—" },
              { a: "Queue Item 004", b: "Open", c: "Owner", d: "High", e: "—", f: "—" },
            ]).map((r, idx) => (
              <div className="tableRow" key={idx}>
                <span className="bold">{r.a}</span>
                <span>{r.b}</span>
                <span>{r.c}</span>
                <span>{r.d}</span>
                <span>{r.e}</span>
                <span className="scorePill green">{r.f === "—" ? "—" : r.f}</span>
              </div>
            ))}
          </div>

          <div className="rowTwo">
            <div className="card glass">
              <div className="cardTitle">Command Focus</div>
              <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
                Keep this command tight: build the workflow first, then automate.
              </div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Today</div>
              <div className="money">$—</div>
              <div className="subtle">Live metrics will appear after data wiring.</div>
            </div>

            <div className="card glass dtlTile">
              <div className="dtlTop">
                <div className="cardTitle" style={{ marginBottom: 0 }}>
                  DTL Command
                </div>
                <span className="dtlStatus">{activeCommand === "dtl" ? "Active" : "Idle"}</span>
              </div>

              <div className="dtlMeta">
                <div className="dtlLine">
                  <span className="dtlLabel">Best Lane</span>
                  <span className="dtlValue">—</span>
                </div>
                <div className="dtlLine">
                  <span className="dtlLabel">Projected RPM</span>
                  <span className="dtlValue">—</span>
                </div>
                <div className="dtlLine">
                  <span className="dtlLabel">Confidence</span>
                  <span className="dtlValue">—</span>
                </div>
              </div>

              <div className="dtlFooter">
                <button className="dtlBtn" onClick={setCmd("dtl")}>
                  View DTL
                </button>
                <button className="dtlBtn dtlBtnPrimary" onClick={() => console.log("[MOVEN] Run DTL (stub)")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>

          <div className="actionBar">
            <button className="actionBtn" onClick={setCmd("mission")}>
              Back to Mission Control
            </button>
            <button className="actionBtn" onClick={() => console.log("[MOVEN] Primary action (stub)")}>
              Primary Action
            </button>
            <button className="actionBtn" onClick={() => console.log("[MOVEN] Sync (stub)")}>
              Sync Sheets
            </button>
            <button className="actionBtn danger" onClick={() => console.log("[MOVEN] Emergency (stub)")}>
              Emergency Alert
            </button>
          </div>
        </section>

        {/* Right Column */}
        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">{rightTitle}</div>
            <div className="alerts">
              {(rightItems.length ? rightItems : [
                "No live alerts yet — connect the data layer.",
                "Once wired, this feed becomes your command brain.",
                "DTL opportunities will post here automatically.",
                "Compliance deadlines will auto-alert here.",
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
                <span className="healthBar"><i style={{ width: "35%" }} /></span>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Command Tip</div>
            <div style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.45 }}>
              Next build: wire <b>Sync Sheets</b> → state → tiles update instantly.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Dashboard({ activeCommand = "mission", onCommandChange }) {
  const setCmd = (key) => () => onCommandChange?.(key);
  const topBtnClass = (key) =>
    activeCommand === key ? "top-command-btn active" : "top-command-btn";

  // === NON-MISSION COMMANDS: now they MATCH the full dashboard grid ===
  if (activeCommand !== "mission") {
    const configs = {
      carrier: {
        title: "Carrier Command",
        subtitle: "Carrier profiles, compliance status, factoring, documents, and performance scoring will live here.",
        tableTitle: "Carrier Queue",
        tableCols: ["Carrier", "Status", "MC#", "Plan", "Updated", "Score"],
        rightTitle: "Carrier Alerts",
        rightItems: ["Insurance expiring (stub)", "Missing docs (stub)", "New carrier lead (stub)"],
      },
      load: {
        title: "Load Command",
        subtitle: "Load pipeline, load scoring, booking workflow, check-calls, and lane intelligence will live here.",
        tableTitle: "Load Pipeline",
        tableCols: ["Load", "Origin", "Pickup", "Delivery", "RPM", "Score"],
        rightTitle: "Load Alerts",
        rightItems: ["Late pickup risk (stub)", "Rate confirmation missing (stub)", "Reload opportunity (stub)"],
      },
      weather: {
        title: "Weather Command",
        subtitle: "Weather risk by lane/truck, alerts, and route impact will live here.",
        tableTitle: "Weather Risk Queue",
        tableCols: ["Zone", "Impact", "Window", "Trucks", "Action", "Risk"],
        rightTitle: "Weather Alerts",
        rightItems: ["Storm watch (stub)", "I-xx corridor risk (stub)", "Freeze warning (stub)"],
      },
      learning: {
        title: "Learning Command",
        subtitle: "Training, onboarding, SOPs, and walkthroughs will live here.",
        tableTitle: "Learning Modules",
        tableCols: ["Module", "Type", "Level", "Owner", "Updated", "Progress"],
        rightTitle: "Learning Notes",
        rightItems: ["Add Quick Start (stub)", "Add walkthroughs (stub)", "Owner training (stub)"],
      },
      dtl: {
        title: "DTL Command",
        subtitle: "DTL scanning, opportunity ranking, triangle routing, and profit projections will live here.",
        tableTitle: "DTL Opportunities",
        tableCols: ["Route", "Legs", "Miles", "RPM", "Net", "Score"],
        rightTitle: "DTL Alerts",
        rightItems: ["DTL scan ready (stub)", "Triangle start window (stub)", "Headhaul signal (stub)"],
      },
      settings: {
        title: "Settings",
        subtitle: "System settings, integrations, diagnostics, and utilities will live here.",
        tableTitle: "Settings Queue",
        tableCols: ["Setting", "Value", "Scope", "Owner", "Updated", "Status"],
        rightTitle: "System Messages",
        rightItems: ["Integration status (stub)", "Webhooks (stub)", "Diagnostics (stub)"],
      },
      admin: {
        title: "Admin",
        subtitle: "Owner-only admin tools, access control, logs, and permissions will live here.",
        tableTitle: "Admin Queue",
        tableCols: ["Item", "Type", "Scope", "Owner", "Updated", "Status"],
        rightTitle: "Admin Alerts",
        rightItems: ["Permission change (stub)", "Audit log (stub)", "User access request (stub)"],
      },
    };

    const cfg = configs[activeCommand] || configs.carrier;

    return (
      <PlaceholderGrid
        title={cfg.title}
        subtitle={cfg.subtitle}
        activeCommand={activeCommand}
        onCommandChange={onCommandChange}
        tableTitle={cfg.tableTitle}
        tableCols={cfg.tableCols}
        rightTitle={cfg.rightTitle}
        rightItems={cfg.rightItems}
        primaryActions={[
          "Open Queue",
          "Run Review",
          "Sync Data",
        ]}
        kpis={[
          { label: "Status", value: "Ready" },
          { label: "Data", value: "Not Wired" },
          { label: "Next", value: "Connect Fetch" },
        ]}
      />
    );
  }

  // === MISSION CONTROL (UNCHANGED UI) ===
  const handleStub = (label) => () => console.log(`[MOVEN] Clicked: ${label}`);

  return (
    <div className="dashRoot">
      {/* Top Bar */}
      <header className="dashTopbar">
        <div className="brand">
          <span className="brandText">MOVEN COMMAND</span>
        </div>

        <div className="top-command-bar">
          <button className={topBtnClass("mission")} onClick={setCmd("mission")}>
            Mission Control
          </button>
          <button className={topBtnClass("carrier")} onClick={setCmd("carrier")}>
            Carrier Command
          </button>
          <button className={topBtnClass("load")} onClick={setCmd("load")}>
            Load Command
          </button>
          <button className={topBtnClass("weather")} onClick={setCmd("weather")}>
            Weather Command
          </button>
          <button className={topBtnClass("learning")} onClick={setCmd("learning")}>
            Learning Command
          </button>
        </div>

        <div className="topIcons">
          <div className="topIcon" title="Notes">📓</div>
          <div className="topIcon" title="Settings">⚙️</div>
        </div>
      </header>

      {/* Main Grid */}
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
              <div className="statRow"><span>Live Carriers</span><span className="statVal">1280</span></div>
              <div className="statRow"><span>Insurance Alerts</span><span className="statVal">6</span></div>
              <div className="statRow"><span>Compliance Warnings</span><span className="statVal">8</span></div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Weather Command</div>
            <div className="statsList">
              <div className="statRow"><span>Active Loads</span><span className="statVal">340</span></div>
              <div className="statRow"><span>Loads This Week</span><span className="statVal">799</span></div>
              <div className="statRow"><span>Total Loaded Miles</span><span className="statVal">1.28M</span></div>
              <div className="statRow"><span>Weather Alerts</span><span className="statVal">8</span></div>
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
              <div className="money">$36,847</div>
              <div className="subtle">Last Sync • —</div>
            </div>

            {/* DTL TILE (Visual Only) */}
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
                <button className="dtlBtn dtlBtnPrimary" onClick={handleStub("Run DTL Scan")}>Run Scan</button>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="actionBar">
            <button className="actionBtn" onClick={handleStub("Add Carrier")}>Add Carrier</button>
            <button className="actionBtn" onClick={handleStub("Add Load")}>Add Load</button>
            <button className="actionBtn" onClick={setCmd("dtl")}>Run DTL Scan</button>
            <button className="actionBtn" onClick={handleStub("Sync Sheets")}>Sync Sheets</button>
            <button className="actionBtn danger" onClick={handleStub("Emergency Alert")}>Emergency Alert</button>
          </div>
        </section>

        {/* Right Column */}
        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">Compliance Command</div>
            <div className="complianceList">
              <div className="comp"><span className="sq green" /> Insurance</div>
              <div className="comp"><span className="sq green" /> Permits</div>
              <div className="comp"><span className="sq amber" /> IFTA</div>
              <div className="comp"><span className="sq red" /> Medical</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Alerts Feed</div>
            <div className="alerts">
              <div className="alert">Weather alert on …</div>
              <div className="alert">Road 53095 late at pickup</div>
              <div className="alert">Carrier HF995 Insurance expiring</div>
              <div className="alert">New DTL opportunity detected</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Load Score</div>
            <div className="gaugeWrap small">
              <div className="gauge gaugeRed"><div className="gaugeValue">73</div></div>
              <div className="gaugeLabel">Revenue Today</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Revenue This Week</div>
            <div className="gaugeWrap small">
              <div className="gauge gaugeGreen"><div className="gaugeValue">33</div></div>
              <div className="gaugeLabel">Revenue This Week</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Health</div>
            <div className="healthRows">
              <div className="healthRow"><span>Screen</span><span className="healthBar"><i style={{ width: "78%" }} /></span></div>
              <div className="healthRow"><span>Load Board Sync</span><span className="healthBar"><i style={{ width: "62%" }} /></span></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
