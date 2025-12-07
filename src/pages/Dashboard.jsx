
import React from "react";
import "./Dashboard.css";

/**
 * Option B2 – MOVEN Mission Control dashboard
 * Pure React + CSS, no external helpers.
 */

const LOADS = [
  {
    id: "53081",
    origin: "Chicago",
    pickup: "Dec. 5",
    delivery: "Feb. 7",
    rpm: 2.97,
    score: 82,
  },
  {
    id: "53072",
    origin: "Louisville",
    pickup: "Dec. 5",
    delivery: "Jul. 15",
    rpm: 3.15,
    score: 77,
  },
  {
    id: "53056",
    origin: "Charlotte",
    pickup: "Jul. 21",
    delivery: "Dec. 16",
    rpm: 2.46,
    score: 64,
  },
  {
    id: "53058",
    origin: "Phoenix",
    pickup: "Jul. 29",
    delivery: "Dec. 7",
    rpm: 2.6,
    score: 72,
  },
];

const Dashboard = () => {
  const carrierScore = 84;
  const liveCarriers = 1280;
  const insuranceAlerts = 6;
  const complianceWarnings = 8;

  const activeLoads = 340;
  const loadsThisWeek = 799;
  const totalMiles = "1.28M";
  const weatherAlerts = 8;

  const loadScore = 73;
  const revenueToday = 36847;
  const revenueThisWeek = 56487;

  return (
    <div className="mc-root">
      {/* Top header / nav */}
      <header className="mc-header">
        <div className="mc-logo">
          <span className="logo-move">MOVE</span>
          <span className="logo-n">N</span>
        </div>

        <nav className="mc-nav">
          <button className="nav-item nav-item--active">Mission Control</button>
          <button className="nav-item">Carrier Command</button>
          <button className="nav-item">Load Command</button>
          <button className="nav-item">Weather Command</button>
          <button className="nav-item">Learning Command</button>
        </nav>

        <div className="mc-header-right">
          <div className="mc-profile-dot" />
        </div>
      </header>

      {/* Main grid */}
      <main className="mc-main">
        {/* LEFT COLUMN */}
        <section className="mc-col mc-col-left">
          {/* Live carrier data */}
          <div className="mc-card mc-card-gauge">
            <div className="mc-card-header">
              <h2>Live Carrier Data</h2>
            </div>

            <div className="gauge-shell">
              <div className="gauge-arc">
                <div className="gauge-needle" />
              </div>
              <div className="gauge-value">{carrierScore}</div>
              <div className="gauge-label">Carrier Performance Score</div>
            </div>

            <div className="metric-row">
              <span>Live Carriers</span>
              <span className="metric-value">{liveCarriers.toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span>Insurance Alerts</span>
              <span className="metric-value">{insuranceAlerts}</span>
            </div>
            <div className="metric-row">
              <span>Compliance Warnings</span>
              <span className="metric-value">{complianceWarnings}</span>
            </div>
          </div>

          {/* Weather command */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2>Weather Command</h2>
            </div>
            <div className="metric-row">
              <span>Active Loads</span>
              <span className="metric-value">{activeLoads}</span>
            </div>
            <div className="metric-row">
              <span>Loads This Week</span>
              <span className="metric-value">{loadsThisWeek}</span>
            </div>
            <div className="metric-row">
              <span>Total Loaded Miles</span>
              <span className="metric-value">{totalMiles}</span>
            </div>
            <div className="metric-row">
              <span>Weather Alerts</span>
              <span className="metric-value">{weatherAlerts}</span>
            </div>
          </div>

          {/* Market command */}
          <div className="mc-card mc-card-market">
            <div className="mc-card-header">
              <h2>Market Command</h2>
            </div>

            <div className="metric-row">
              <span>Market</span>
              <span className="metric-value">Moderate</span>
            </div>

            <div className="market-tags">
              <div className="market-tag market-tag--good">
                <span className="bullet" /> Cold Markets
              </div>
              <div className="market-tag market-tag--warn">
                <span className="bullet" /> Volume
              </div>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="mc-col mc-col-center">
          {/* Load summary */}
          <div className="mc-card mc-card-table">
            <div className="mc-card-header">
              <h2>Load Command Summary</h2>
            </div>
            <table>
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
                {LOADS.map((load) => (
                  <tr key={load.id}>
                    <td>{load.id}</td>
                    <td>{load.origin}</td>
                    <td>{load.pickup}</td>
                    <td>{load.delivery}</td>
                    <td>{load.rpm.toFixed(2)}</td>
                    <td>
                      <span
                        className={`score-pill ${
                          load.score >= 80
                            ? "score-pill--good"
                            : load.score >= 70
                            ? "score-pill--ok"
                            : "score-pill--warn"
                        }`}
                      >
                        {load.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Today's priorities */}
          <div className="mc-card mc-card-priorities">
            <div className="mc-card-header">
              <h2>Today's Priorities</h2>
            </div>
            <ul className="priority-list">
              <li className="priority-item priority-item--urgent">
                <span className="priority-dot" />
                Urgent Loads
              </li>
              <li className="priority-item">
                <span className="priority-dot" />
                Check Calls Due
              </li>
              <li className="priority-item">
                <span className="priority-dot" />
                Missing Documents
              </li>
              <li className="priority-item">
                <span className="priority-dot" />
                Carrier Updates
              </li>
            </ul>
          </div>

          {/* Lower center row – load score + revenue */}
          <div className="mc-row">
            <div className="mc-card mc-card-mini-gauge">
              <div className="mc-card-header">
                <h3>Load Score</h3>
              </div>
              <div className="mini-gauge-shell">
                <div className="mini-gauge-arc">
                  <div className="mini-gauge-needle" />
                </div>
                <div className="mini-gauge-value">{loadScore}</div>
                <div className="mini-gauge-sub">Revenue Today</div>
              </div>
            </div>

            <div className="mc-card mc-card-revenue">
              <div className="mc-card-header">
                <h3>Revenue Today</h3>
              </div>
              <div className="revenue-main">
                <div className="revenue-block">
                  <div className="label">Revenue Today</div>
                  <div className="value">
                    ${revenueToday.toLocaleString("en-US")}
                  </div>
                </div>
                <div className="revenue-block">
                  <div className="label">Revenue This Week</div>
                  <div className="value">
                    ${revenueThisWeek.toLocaleString("en-US")}
                  </div>
                </div>
              </div>
              <div className="revenue-bar">
                <div className="revenue-bar-fill" />
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="mc-actions">
            <button>Add Carrier</button>
            <button>Add Load</button>
            <button>Run DTL Scan</button>
            <button>Sync Sheets</button>
            <button className="danger">Emergency Alert</button>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="mc-col mc-col-right">
          {/* Compliance */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2>Compliance Command</h2>
            </div>
            <ul className="compliance-list">
              <li>
                <span className="status-dot status-dot--good" />
                Insurance
              </li>
              <li>
                <span className="status-dot status-dot--warn" />
                Permits
              </li>
              <li>
                <span className="status-dot status-dot--warn" />
                IFTA
              </li>
              <li>
                <span className="status-dot status-dot--alert" />
                Medical
              </li>
            </ul>
          </div>

          {/* Alerts feed */}
          <div className="mc-card mc-card-alerts">
            <div className="mc-card-header">
              <h2>Alerts Feed</h2>
            </div>
            <ul className="alerts-list">
              <li>Weather alert on I-80. Adjust ETAs.</li>
              <li>Road 53095 late at pickup.</li>
              <li>Carrier HF995 insurance expiring.</li>
              <li>New DTL opportunity opens Thursday.</li>
            </ul>
          </div>

          {/* System health / mini alerts */}
          <div className="mc-card mc-card-system">
            <div className="mc-card-header">
              <h3>System Health</h3>
            </div>
            <div className="system-row">
              <span>Loads image</span>
              <span className="system-pill system-pill--ok">Stable</span>
            </div>
            <div className="system-row">
              <span>Stream Name</span>
              <span className="system-pill">Normal</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

