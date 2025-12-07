import React from "react";
import "./Dashboard.css";
import movenLogo from "../assets/moven-logo.png";
import Gauge from "../components/Gauge";

const loads = [
  { id: "53081", origin: "Chicago", pickup: "Dec. 5", delivery: "Feb. 7", rpm: 2.97, score: 82 },
  { id: "53072", origin: "Louisville", pickup: "Dec. 5", delivery: "Jul. 15", rpm: 3.15, score: 77 },
  { id: "53056", origin: "Charlotte", pickup: "Jul. 21", delivery: "Dec. 16", rpm: 2.46, score: 64 },
  { id: "53058", origin: "Phoenix", pickup: "Jul. 29", delivery: "Dec. 7", rpm: 2.60, score: 72 },
];

const priorities = [
  "Urgent Loads",
  "Check Calls Due",
  "Missing Documents",
  "Carrier Updates",
];

const alerts = [
  "Weather alert on I-80. Adjust ETAs.",
  "Road 53095 late at pickup.",
  "Carrier HF995 insurance expiring.",
  "New DTL opportunity opens Thursday.",
];

function Dashboard() {
  return (
    <div className="mc-shell">
      {/* Top bar */}
      <header className="mc-topbar">
        <div className="mc-topbar-left">
          <div className="mc-logo-lockup">
            <img src={movenLogo} alt="MOVEN" className="mc-logo" />
            <span className="mc-logo-text">Mission Control</span>
          </div>
        </div>

        <nav className="mc-topnav">
          <button className="active">Mission Control</button>
          <button>Carrier Command</button>
          <button>Load Command</button>
          <button>Weather Command</button>
          <button>Learning Command</button>
        </nav>

        <div className="mc-topbar-right">
          <button className="mc-pill">Owner Console</button>
        </div>
      </header>

      {/* Main grid */}
      <main className="mc-layout">
        {/* LEFT COLUMN */}
        <section className="mc-col-left">
          <div className="mc-card mc-card-large">
                            <div className="mc-card-header">
                              <h2>Live Carrier Data</h2>
                            </div>
                            <div className="mc-card-body mc-flex-row">
                              <div className="mc-gauge-wrap">
                                <Gauge value={84} label="Carrier Performance Score" />
                              </div>
                              <div className="mc-metrics">
                                <div className="mc-metric-row">
                                  <span>Live Carriers</span>
                                  <span>1280</span>
                                </div>
                                <div className="mc-metric-row">
                                  <span>Insurance Alerts</span>
                                  <span>6</span>
                                </div>
                                <div className="mc-metric-row">
                                  <span>Compliance Warnings</span>
                                  <span>8</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mc-card">
                            <div className="mc-card-header">
                              <h2>Weather Command</h2>
                            </div>
                            <div className="mc-card-body mc-two-col">
                              <div className="mc-stat-block">
                                <span className="mc-stat-label">Active Loads</span>
                                <span className="mc-stat-value">340</span>
                              </div>
                              <div className="mc-stat-block">
                                <span className="mc-stat-label">Loads This Week</span>
                                <span className="mc-stat-value">799</span>
                              </div>
                              <div className="mc-stat-block">
                                <span className="mc-stat-label">Total Loaded Miles</span>
                                <span className="mc-stat-value">1.28M</span>
                              </div>
                              <div className="mc-stat-block">
                                <span className="mc-stat-label">Weather Alerts</span>
                                <span className="mc-stat-value">8</span>
                              </div>
                            </div>
                          </div>

                          <div className="mc-card mc-card-market">
                            <div className="mc-card-header">
                              <h2>Market Command</h2>
                            </div>
                            <div className="mc-card-body mc-market-body">
                              <div className="mc-market-meta">
                                <div className="mc-stat-block">
                                  <span className="mc-stat-label">Market</span>
                                  <span className="mc-stat-value">Moderate</span>
                                </div>
                                <ul className="mc-legend">
                                  <li>
                                    <span className="mc-dot mc-dot-green" />
                                    Cold Markers
                                  </li>
                                  <li>
                                    <span className="mc-dot mc-dot-red" />
                                    Volume
                                  </li>
                                </ul>
                              </div>
                              <div className="mc-market-map" />
                            </div>
                          </div>
                        </section>

                        {/* CENTER COLUMN */}
                        <section className="mc-col-center">
                          <div className="mc-card mc-card-wide">
                            <div className="mc-card-header">
                              <h2>Load Command Summary</h2>
                            </div>
                            <div className="mc-card-body">
                              <table className="mc-table">
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
                                  {loads.map((row) => (
                                    <tr key={row.id}>
                                      <td>{row.id}</td>
                                      <td>{row.origin}</td>
                                      <td>{row.pickup}</td>
                                      <td>{row.delivery}</td>
                                      <td>{row.rpm.toFixed(2)}</td>
                                      <td>
                                        <span className="mc-badge">{row.score}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="mc-card">
                            <div className="mc-card-header">
                              <h2>Today&apos;s Priorities</h2>
                            </div>
                            <div className="mc-card-body">
                              <ul className="mc-priority-list">
                                {priorities.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mc-card mc-card-revenue">
                            <div className="mc-card-header">
                              <h2>Today&apos;s Priorities • Revenue</h2>
                            </div>
                            <div className="mc-card-body mc-revenue-body">
                              <div className="mc-revenue-pair">
                                <div>
                                  <div className="mc-stat-label">Revenue Today</div>
                                  <div className="mc-revenue-number">$36,847</div>
                                  <div className="mc-revenue-caption">RPM</div>
                                </div>
                                <div>
                                  <div className="mc-stat-label">Revenue This Week</div>
                                  <div className="mc-revenue-number">$56,487</div>
                                  <div className="mc-revenue-caption">Pickup</div>
                                </div>
                              </div>
                              <div className="mc-revenue-meter">
                                <div className="mc-revenue-fill" />
                              </div>
                              <div className="mc-revenue-meta">
                                <span>Last Sync: 3 min ago</span>
                              </div>
                            </div>
                          </div>

                          <div className="mc-action-bar">
                            <button>Add Carrier</button>
                            <button>Add Load</button>
                            <button>Run DTL Scan</button>
                            <button>Sync Sheets</button>
                            <button>Emergency Alert</button>
                          </div>
                        </section>

                        {/* RIGHT COLUMN */}
                        <section className="mc-col-right">
                          <div className="mc-card">
                            <div className="mc-card-header">
                              <h2>Compliance Command</h2>
                            </div>
                            <div className="mc-card-body mc-checklist">
                              <div className="mc-check-row mc-ok">
                                <span className="mc-check-dot" />
                                <span>Insurance</span>
                              </div>
                              <div className="mc-check-row mc-warning">
                                <span className="mc-check-dot" />
                                <span>Permits</span>
                              </div>
                              <div className="mc-check-row mc-warning">
                                <span className="mc-check-dot" />
                                <span>IFTA</span>
                              </div>
                              <div className="mc-check-row mc-alert">
                                <span className="mc-check-dot" />
                                <span>Medical</span>
                              </div>
                            </div>
                          </div>

                          <div className="mc-card mc-card-tall">
                            <div className="mc-card-header">
                              <h2>Alerts Feed</h2>
                            </div>
                            <div className="mc-card-body mc-alerts-body">
                              <ul className="mc-alert-list">
                                {alerts.map((text, idx) => (
                                  <li key={idx}>{text}</li>
                                ))}
                              </ul>
                              <div className="mc-alert-map" />
                            </div>
                          </div>

                          <div className="mc-card">
                            <div className="mc-card-header">
                              <h2>Load Score</h2>
                            </div>
                            <div className="mc-card-body mc-flex-row">
                              <div className="mc-gauge-wrap small">
                                <Gauge value={73} label="Revenue Today" size={150} />
                              </div>
                            </div>
                          </div>

                          <div className="mc-card">
                            <div className="mc-card-header">
                              <h2>Revenue This Week</h2>
                            </div>
                            <div className="mc-card-body mc-flex-row">
                              <div className="mc-gauge-wrap small">
                                <Gauge value={33} label="Projected" size={150} />
                              </div>
                            </div>
                          </div>
                        </section>
                      </main>
                    </div>
                  );
                }

                export default Dashboard;

