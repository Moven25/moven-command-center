// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// MOVEN logo
import MovenLogo from "../assets/moven-logo.png";

// Existing helpers
import { getSheet } from "../utils/movenSheets";
import Gauge from "../components/Gauge";

const MOCK_LOADS = [
  {
    LoadID: "53081",
    Origin: "Chicago",
    PickupDate: "Dec 5",
    DeliveryDate: "Feb 7",
    RPM: 2.97,
    Score: 93,
  },
  {
    LoadID: "53072",
    Origin: "Louisville",
    PickupDate: "Dec 5",
    DeliveryDate: "Jul 15",
    RPM: 3.15,
    Score: 77,
  },
  {
    LoadID: "53056",
    Origin: "Charlotte",
    PickupDate: "Jul 29",
    DeliveryDate: "Dec 16",
    RPM: 2.46,
    Score: 64,
  },
  {
    LoadID: "53058",
    Origin: "Phoenix",
    PickupDate: "Jul 28",
    DeliveryDate: "Dec 7",
    RPM: 2.6,
    Score: 72,
  },
];

const MOCK_ALERTS = [
  "Weather alert on I-80, slow downs expected.",
  "Road 53095 late at pickup – confirm ETA.",
  "Carrier HF995 insurance expiring soon.",
  "New DTL opportunity: Atlanta → Columbus.",
];

const MOCK_PRIORITIES = [
  { label: "Urgent Loads", color: "#ff5f56" },
  { label: "Check Calls Due", color: "#ffb347" },
  { label: "Missing Documents", color: "#ffdf5d" },
  { label: "Carrier Updates", color: "#2ecc71" },
];

function Dashboard() {
  const [carriers, setCarriers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [isLiveData, setIsLiveData] = useState(false);

  // --- DATA LOAD (live if available, mock fallback) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const carrierData = await getSheet("carriers");
        const loadData = await getSheet("loads");

        if (carrierData?.length || loadData?.length) {
          setCarriers(carrierData || []);
          setLoads(loadData || []);
          setIsLiveData(true);
        } else {
          setIsLiveData(false);
        }
      } catch (err) {
        console.error("Dashboard data error:", err);
        setIsLiveData(false);
      }
    };

    loadData();
  }, []);

  // --- DERIVED METRICS (fall back to mock numbers) ---
  const carrierScore = (() => {
    if (!carriers.length) return 84;
    // simple example score: % of carriers not in ALERT
    const safe = carriers.filter(
      (c) => c.InsuranceStatus !== "ALERT" && c.ComplianceStatus !== "ALERT"
    ).length;
    return Math.round((safe / carriers.length) * 100);
  })();

  const liveCarriers = carriers.length || 1280;
  const insuranceAlerts =
    carriers.filter((c) => c.InsuranceStatus === "ALERT").length || 6;
  const complianceWarnings =
    carriers.filter((c) => c.ComplianceStatus === "ALERT").length || 8;

  const activeLoads = loads.length || 340;
  const loadsThisWeek = loads.length || 739;
  const totalLoadedMiles = loads.length ? loads.length * 400 : 1280000;
  const weatherAlertsCount = 8;

  const tableLoads = (loads.length ? loads : MOCK_LOADS).slice(0, 4);

  const avgLoadScore = (() => {
    const data = loads.length ? loads : MOCK_LOADS;
    if (!data.length) return 0;
    const sum = data.reduce(
      (acc, l) => acc + (parseFloat(l.Score || l.score) || 0),
      0
    );
    return Math.round(sum / data.length);
  })();

  const loadScoreToday = avgLoadScore || 73;
  const loadScoreWeek = 33;

  const revenueToday = isLiveData ? 0 : 36847;
  const revenueThisWeek = isLiveData ? 0 : 56487;

  return (
    <div className="mc-shell">
      {/* HEADER */}
      <header className="mc-header">
        <div className="mc-header-left">
          <img
            src={MovenLogo}
            alt="MOVEN Logistics"
            className="mc-logo"
            draggable="false"
          />
          <div>
            <h1 className="mc-title">Mission Control</h1>
            <p className="mc-subtitle">
              Command overview for MOVEN Logistics
              {!isLiveData && " · demo data"}
            </p>
          </div>
        </div>

        <nav className="mc-top-tabs">
          <button className="mc-tab mc-tab--active">Mission Control</button>
          <button className="mc-tab">Carrier Command</button>
          <button className="mc-tab">Load Command</button>
          <button className="mc-tab">Weather Command</button>
          <button className="mc-tab">Learning Command</button>
        </nav>

        <div className="mc-header-right">
          <span className="mc-header-pill">Live System · {isLiveData ? "Online" : "Demo"}</span>
          <span className="mc-header-dot" />
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="mc-layout">
        {/* LEFT COLUMN */}
        <section className="mc-column mc-column-left">
          {/* Live Carrier Data */}
          <div className="mc-card mc-card-tall">
            <div className="mc-card-header">
              <h2>Live Carrier Data</h2>
            </div>
            <div className="mc-card-body mc-live-carrier">
              <div className="mc-gauge-wrap">
                <Gauge value={carrierScore} />
                <div className="mc-gauge-number">{carrierScore}</div>
                <div className="mc-gauge-label">Carrier Performance Score</div>
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
          </div>

          {/* Weather Command */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2>Weather Command</h2>
            </div>
            <div className="mc-card-body">
              <ul className="mc-metric-list">
                <li>
                  <span>Active Loads</span>
                  <strong>{activeLoads}</strong>
                </li>
                <li>
                  <span>Loads This Week</span>
                  <strong>{loadsThisWeek}</strong>
                </li>
                <li>
                  <span>Total Loaded Miles</span>
                  <strong>
                    {totalLoadedMiles.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </li>
                <li>
                  <span>Weather Alerts</span>
                  <strong>{weatherAlertsCount}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* Market Command */}
          <div className="mc-card mc-card-market">
            <div className="mc-card-header">
              <h2>Market Command</h2>
            </div>
            <div className="mc-card-body mc-market-body">
              <div className="mc-market-meta">
                <span className="mc-label">Market</span>
                <strong>Moderate</strong>
              </div>
              <div className="mc-market-legend">
                <div className="mc-legend-item">
                  <span className="mc-legend-dot mc-legend-dot--cold" />
                  <span>Cold Markets</span>
                </div>
                <div className="mc-legend-item">
                  <span className="mc-legend-dot mc-legend-dot--hot" />
                  <span>Volume</span>
                </div>
              </div>
              <div className="mc-market-map-placeholder">
                {/* Placeholder map - replace with real heatmap later */}
                DTL heatmap coming soon
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE COLUMN */}
        <section className="mc-column mc-column-middle">
          {/* Load Command Summary */}
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
                  {tableLoads.map((l, idx) => (
                    <tr key={idx}>
                      <td>{l.LoadID || l.id}</td>
                      <td>{l.Origin || l.origin}</td>
                      <td>{l.PickupDate || l.pickup}</td>
                      <td>{l.DeliveryDate || l.delivery}</td>
                      <td>{(l.RPM || l.rpm).toFixed ? (l.RPM || l.rpm).toFixed(2) : l.RPM || l.rpm}</td>
                      <td>
                        <span className="mc-pill mc-pill--score">
                          {l.Score || l.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Priorities */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2>Today's Priorities</h2>
            </div>
            <div className="mc-card-body mc-priorities">
              <ul>
                {MOCK_PRIORITIES.map((p) => (
                  <li key={p.label}>
                    <span
                      className="mc-priority-dot"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mc-priority-map-placeholder">
                {/* Placeholder radar / map */}
              </div>
            </div>
          </div>

          {/* Revenue tiles */}
          <div className="mc-row mc-row-split">
            <div className="mc-card mc-card-small">
              <div className="mc-card-header">
                <h2>Revenue Today</h2>
              </div>
              <div className="mc-card-body mc-revenue-tile">
                <div className="mc-revenue-main">
                  ${revenueToday.toLocaleString()}
                </div>
                <div className="mc-revenue-label">Last Sync · manual</div>
              </div>
            </div>

            <div className="mc-card mc-card-small">
              <div className="mc-card-header">
                <h2>Revenue This Week</h2>
              </div>
              <div className="mc-card-body mc-revenue-tile">
                <div className="mc-revenue-main">
                  ${revenueThisWeek.toLocaleString()}
                </div>
                <div className="mc-revenue-bar">
                  <span className="mc-revenue-bar-fill" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="mc-column mc-column-right">
          {/* Compliance Command */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2>Compliance Command</h2>
            </div>
            <div className="mc-card-body mc-compliance">
              <ul>
                <li>
                  <span className="mc-status-dot mc-status-dot--ok" />
                  <span>Insurance</span>
                </li>
                <li>
                  <span className="mc-status-dot mc-status-dot--ok" />
                  <span>Permits</span>
                </li>
                <li>
                  <span className="mc-status-dot mc-status-dot--warn" />
                  <span>IFTA</span>
                </li>
                <li>
                  <span className="mc-status-dot mc-status-dot--alert" />
                  <span>Medical</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Load Score Today */}
          <div className="mc-card mc-card-gauge">
            <div className="mc-card-header">
              <h2>Load Score</h2>
            </div>
            <div className="mc-card-body mc-gauge-card">
              <Gauge value={loadScoreToday} />
              <div className="mc-gauge-number">{loadScoreToday}</div>
              <div className="mc-gauge-label">Revenue Today</div>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="mc-card mc-card-alerts">
            <div className="mc-card-header">
              <h2>Alerts Feed</h2>
            </div>
            <div className="mc-card-body mc-alerts-body">
              <ul>
                {MOCK_ALERTS.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weekly Load Score + System Health */}
          <div className="mc-card mc-card-gauge">
            <div className="mc-card-header">
              <h2>Weekly Load Score</h2>
            </div>
            <div className="mc-card-body mc-gauge-card">
              <Gauge value={loadScoreWeek} />
              <div className="mc-gauge-number">{loadScoreWeek}</div>
              <div className="mc-gauge-label">Revenue This Week</div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER ACTION BAR */}
      <footer className="mc-footer">
        <button className="mc-footer-btn">Add Carrier</button>
        <button className="mc-footer-btn">Add Load</button>
        <button className="mc-footer-btn">Run DTL Scan</button>
        <button className="mc-footer-btn">Sync Sheets</button>
        <button className="mc-footer-btn mc-footer-btn--alert">
          Emergency Alert
        </button>
      </footer>
    </div>
  );
}

export default Dashboard;
