// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";

import getSheet from "../utils/movenSheets";
import Gauge from "../components/Gauge";
import PerformanceCard from "../components/PerformanceCard";
import WeatherMini from "../components/WeatherMini";
import Alerts from "../components/Alerts";

const Dashboard = () => {
  // --- Basic state (with safe fallback demo values) ---
  const [carrierScore, setCarrierScore] = useState(84);
  const [liveCarriers, setLiveCarriers] = useState(1280);
  const [insuranceAlerts, setInsuranceAlerts] = useState(6);
  const [complianceWarnings, setComplianceWarnings] = useState(8);

  const [activeLoads, setActiveLoads] = useState(4);
  const [loadsThisWeek, setLoadsThisWeek] = useState(79);
  const [totalMiles, setTotalMiles] = useState("1.28M");
  const [weatherAlerts, setWeatherAlerts] = useState(8);

  const [loadScore, setLoadScore] = useState(73);
  const [revenueToday, setRevenueToday] = useState(36847);
  const [revenueThisWeek, setRevenueThisWeek] = useState(56487);

  const [loads, setLoads] = useState([
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
  ]);

  const [alerts, setAlerts] = useState([
    "Weather alert on I-80. Adjust ETAs.",
    "Road 53095 late at pickup.",
    "Carrier HF995 insurance expiring.",
    "New DTL opportunity opens Thursday.",
  ]);

  // --- Optional: hook Zoho data in later ---
  useEffect(() => {
    // Example pattern – you can wire this to your real sheets when ready.
    // getSheet("dashboard").then((rows) => {
    //   // map Zoho rows into the state above
    // }).catch((err) => {
    //   console.error("Dashboard data error:", err);
    // });
  }, []);

  const formatCurrency = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="mc-shell">
      {/* TOP BAR */}
      <header className="mc-topbar">
        <div className="mc-logo-wordmark">
          <span className="mc-logo-move">MOVE</span>
          <span className="mc-logo-n">N</span>
        </div>
        <nav className="mc-nav">
          <button className="mc-nav-item mc-nav-item--active">Mission Control</button>
          <button className="mc-nav-item">Carrier Command</button>
          <button className="mc-nav-item">Load Command</button>
          <button className="mc-nav-item">Weather Command</button>
          <button className="mc-nav-item">Learning Command</button>
        </nav>
        <div className="mc-topbar-right">
          <span className="mc-topbar-user">Owner Console</span>
          <div className="mc-topbar-dot" />
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="mc-main">
        <section className="mc-grid">

          {/* LEFT COLUMN */}
          <div className="mc-column mc-column-left">
            <section className="mc-card mc-card--carrier">
              <header className="mc-card-header"><h2>Live Carrier Data</h2></header>
              <div className="mc-live-body">
                <div className="mc-live-gauge">
                  <Gauge value={carrierScore} max={100} />
                  <div className="mc-live-score">{carrierScore}</div>
                  <div className="mc-live-label">Carrier Performance Score</div>
                </div>
                <ul className="mc-metric-list">
                  <li>
                    <span>Live Carriers</span>
                    <strong>{liveCarriers.toLocaleString()}</strong>
                  </li>
                  <li>
                    <span>Insurance Alerts</span>
                    <strong>{insuranceAlerts}</strong>
                  </li>
                  <li>
                    <span>Compliance Warnings</span>
                    <strong>{complianceWarnings}</strong>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mc-card mc-card--weather">
              <header className="mc-card-header"><h2>Weather Command</h2></header>
              <WeatherMini />
            </section>

            <section className="mc-card mc-card--market">
              <header className="mc-card-header"><h2>Market Command</h2></header>
              <div className="mc-market-body">
                <div className="mc-market-row">
                  <span className="mc-market-label">Market</span>
                  <span className="mc-market-value">Moderate</span>
                </div>
                <div className="mc-market-legend">
                  <div className="mc-market-dot mc-market-dot--green" />
                  <span>Cold markers</span>
                </div>
                <div className="mc-market-legend">
                  <div className="mc-market-dot mc-market-dot--red" />
                  <span>Volume</span>
                </div>
              </div>
            </section>
          </div>

          {/* CENTER COLUMN */}
          <div className="mc-column mc-column-center">
            <section className="mc-card mc-card--load-summary">
              <header className="mc-card-header"><h2>Load Command Summary</h2></header>
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
                        <span className={`mc-pill mc-pill--score mc-pill--score-${scoreBucket(row.score)}`}>
                          {row.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mc-card mc-card--priorities">
              <header className="mc-card-header"><h2>Today's Priorities</h2></header>
              <ul className="mc-priority-list">
                <li><span className="mc-dot mc-dot--orange" />Urgent Loads</li>
                <li><span className="mc-dot mc-dot--pink" />Check Calls Due</li>
                <li><span className="mc-dot mc-dot--yellow" />Missing Documents</li>
                <li><span className="mc-dot mc-dot--green" />Carrier Updates</li>
              </ul>
            </section>

            <div className="mc-revenue-row">
              <section className="mc-card mc-card--revenue-today">
                <header className="mc-card-header"><h2>Revenue Today</h2></header>
                <div className="mc-card-body mc-revenue-centered">
                  <div className="mc-revenue-amount">{formatCurrency(revenueToday)}</div>
                </div>
              </section>

              <section className="mc-card mc-card--revenue-week">
                <header className="mc-card-header"><h2>Revenue This Week</h2></header>
                <div className="mc-card-body mc-revenue-centered">
                  <div className="mc-revenue-amount">{formatCurrency(revenueThisWeek)}</div>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="mc-column mc-column-right">
            <section className="mc-card mc-card--compliance">
              <header className="mc-card-header"><h2>Compliance Command</h2></header>
              <ul className="mc-compliance-list">
                <li><span className="mc-pill mc-pill--green" /> Insurance</li>
                <li><span className="mc-pill mc-pill--yellow" /> Permits</li>
                <li><span className="mc-pill mc-pill--orange" /> IFTA</li>
                <li><span className="mc-pill mc-pill--red" /> Medical</li>
              </ul>
            </section>

            <section className="mc-card mc-card--alerts">
              <header className="mc-card-header"><h2>Alerts Feed</h2></header>
              <Alerts items={alerts} />
            </section>
          </div>
        </section>

        {/* SUB ROW: DTL & HOS left as compact cards below main grid */}
        <section className="mc-subgrid">
          <section className="mc-card mc-card-dtl">
            <header className="mc-card-header"><h2>DTL</h2></header>
            <p className="mc-small-label">Double Triangle Routing</p>
            <p className="mc-small-copy">Headhaul-first strategy scanning your priority lanes for profitable double-tri options this week.</p>
          </section>

          <section className="mc-card mc-card-hos">
            <header className="mc-card-header"><h2>Hours of Service</h2></header>
            <p className="mc-small-label">System Health</p>
            <p className="mc-small-copy">Live violations, resets, and on-duty trends across all active trucks.</p>
          </section>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="mc-footer-actions">
          <button className="mc-footer-btn">Add Carrier</button>
          <button className="mc-footer-btn">Add Load</button>
          <button className="mc-footer-btn">Run DTL Scan</button>
          <button className="mc-footer-btn">Sync Sheets</button>
          <button className="mc-footer-btn mc-footer-btn--danger">Emergency Alert</button>
        </footer>
      </main>
    </div>
  );
};

function scoreBucket(score) {
  if (score >= 80) return "good";
  if (score >= 70) return "ok";
  return "bad";
}

export default Dashboard;
