// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// MOVEN logo (top-left card)
import MovenLogo from "../assets/moven-logo.png";

// Data helper (Zoho CSV → JSON)
// Safe: if Zoho is not ready it will fall back to mock data.
import getSheet from "../utils/movenSheets";

// Existing components
import Gauge from "../components/Gauge";
import WeatherMini from "../components/WeatherMini";
import DTLCard from "../components/DTLCard";
import HOS from "../components/HOS";

// --- MOCK DATA (used as fallback so layout always works) ---
const MOCK_LOADS = [
  {
    LoadID: "53081",
    Origin: "Chicago",
    PickupDate: "Dec. 5",
    DeliveryDate: "Feb. 7",
    RPM: 2.97,
    Score: 93,
  },
  {
    LoadID: "53072",
    Origin: "Louisville",
    PickupDate: "Dec. 5",
    DeliveryDate: "Jul. 15",
    RPM: 3.15,
    Score: 77,
  },
  {
    LoadID: "53056",
    Origin: "Charlotte",
    PickupDate: "Jul. 21",
    DeliveryDate: "Dec. 16",
    RPM: 2.46,
    Score: 64,
  },
  {
    LoadID: "53058",
    Origin: "Phoenix",
    PickupDate: "Jul. 29",
    DeliveryDate: "Dec. 7",
    RPM: 2.6,
    Score: 72,
  },
];

const MOCK_ALERTS = [
  "Weather alert on I-80. Adjust ETAs.",
  "Road 53095 – late at pickup.",
  "Carrier HF995 insurance expiring.",
  "New DTL opportunity opens Thursday.",
];

const MOCK_PRIORITIES = [
  "Urgent Loads",
  "Check Calls Due",
  "Missing Documents",
  "Carrier Updates",
];

const MOCK_MARKET = {
  label: "Market Command",
  status: "Moderate",
  cold: "Cold markers",
  volume: "Volume",
};

// --- HELPER FUNCTIONS ---

const getCarrierScore = (carriers) => {
  if (!carriers || !carriers.length) return 84; // default mock
  // example: percent of carriers with good status
  const good = carriers.filter(
    (c) => c.InsuranceStatus !== "ALERT" && c.ComplianceStatus !== "ALERT"
  ).length;
  return Math.round((good / carriers.length) * 100);
};

const getInsuranceAlerts = (carriers) =>
  carriers?.filter((c) => c.InsuranceStatus === "ALERT").length || 0;

const getComplianceWarnings = (carriers) =>
  carriers?.filter((c) => c.ComplianceStatus === "ALERT").length || 0;

const getLoadScore = (loads) => {
  if (!loads || !loads.length) return 73; // default mock
  const sum = loads.reduce(
    (acc, l) => acc + (parseFloat(l.Score) || 0),
    0
  );
  return Math.round(sum / loads.length);
};

const Dashboard = () => {
  const [carriers, setCarriers] = useState([]);
  const [loads, setLoads] = useState(MOCK_LOADS);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  // -------- DATA LOAD (Zoho → state) ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        const carrierData = (await getSheet("carriers")) || [];
        const loadData = (await getSheet("loads")) || MOCK_LOADS;

        setCarriers(carrierData);
        setLoads(loadData);

        // Simple dynamic alerts from data
        const dynamicAlerts = [];
        const lateLoads = loadData.filter((l) => l.Status === "LATE");
        if (lateLoads.length) {
          dynamicAlerts.push(
            `There are ${lateLoads.length} late loads on the board.`
          );
        }
        if (getInsuranceAlerts(carrierData) > 0) {
          dynamicAlerts.push("Some carriers have insurance alerts.");
        }
        setAlerts(dynamicAlerts.length ? dynamicAlerts : MOCK_ALERTS);
      } catch (err) {
        console.error("Dashboard data error:", err);
        // Fallback to mock so layout is never broken
        setCarriers([]);
        setLoads(MOCK_LOADS);
        setAlerts(MOCK_ALERTS);
      }
    };

    loadData();
  }, []);

  const carrierScore = getCarrierScore(carriers);
  const loadScore = getLoadScore(loads);
  const liveCarriers = carriers?.length || 0;

  return (
    <div className="mc-dashboard">
      {/* MAIN GRID */}
      <div className="mc-grid">
        {/* LIVE CARRIER DATA (top-left, tall) */}
        <section className="mc-card mc-card-tall" id="mc-live-carriers">
          <div className="mc-card-header">
            <img src={MovenLogo} alt="MOVEN" className="mc-logo" />
            <h2>Live Carrier Data</h2>
          </div>

          <div className="mc-live-grid">
            <div className="mc-gauge-wrap">
              <Gauge value={carrierScore} />
              <div className="mc-gauge-label">{carrierScore}</div>
            </div>

            <ul className="mc-metric-list">
              <li>
                <span>Carrier Performance Score</span>
                <strong>{carrierScore}</strong>
              </li>
              <li>
                <span>Live Carriers</span>
                <strong>{liveCarriers}</strong>
              </li>
              <li>
                <span>Insurance Alerts</span>
                <strong>{getInsuranceAlerts(carriers)}</strong>
              </li>
              <li>
                <span>Compliance Warnings</span>
                <strong>{getComplianceWarnings(carriers)}</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* LOAD COMMAND SUMMARY (top middle, wide) */}
        <section className="mc-card mc-card-wide" id="mc-load-summary">
          <h2 className="mc-card-title">Load Command Summary</h2>
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
              {loads.slice(0, 4).map((l, idx) => (
                <tr key={idx}>
                  <td>{l.LoadID}</td>
                  <td>{l.Origin}</td>
                  <td>{l.PickupDate}</td>
                  <td>{l.DeliveryDate}</td>
                  <td>{l.RPM}</td>
                  <td>
                    <span
                      className={`mc-pill ${
                        (l.Score || 0) >= 80
                          ? "mc-pill-good"
                          : (l.Score || 0) >= 70
                          ? "mc-pill-warn"
                          : "mc-pill-bad"
                      }`}
                    >
                      {l.Score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* COMPLIANCE COMMAND (top-right) */}
        <section className="mc-card" id="mc-compliance">
          <h2 className="mc-card-title">Compliance Command</h2>
          <ul className="mc-compliance-list">
            <li>
              <span className="mc-dot mc-dot-green" /> Insurance
            </li>
            <li>
              <span className="mc-dot mc-dot-yellow" /> Permits
            </li>
            <li>
              <span className="mc-dot mc-dot-orange" /> IFTA
            </li>
            <li>
              <span className="mc-dot mc-dot-red" /> Medical
            </li>
          </ul>
        </section>

        {/* WEATHER COMMAND (middle-left) */}
        <section className="mc-card" id="mc-weather">
          <h2 className="mc-card-title">Weather Command</h2>
          <div className="mc-weather-layout">
            <div>
              <ul className="mc-metric-list">
                <li>
                  <span>Active Loads</span>
                  <strong>{loads.length}</strong>
                </li>
                <li>
                  <span>Loads This Week</span>
                  <strong>{loads.length}</strong>
                </li>
                <li>
                  <span>Total Loaded Miles</span>
                  <strong>1.28M</strong>
                </li>
                <li>
                  <span>Weather Alerts</span>
                  <strong>8</strong>
                </li>
              </ul>
            </div>
            <div className="mc-weather-mini">
              <WeatherMini />
            </div>
          </div>
        </section>

        {/* TODAY'S PRIORITIES (middle-center) */}
        <section className="mc-card" id="mc-priorities">
          <h2 className="mc-card-title">Today&apos;s Priorities</h2>
          <ul className="mc-priority-list">
            {MOCK_PRIORITIES.map((item, idx) => (
              <li key={idx}>
                <span className={`mc-priority-dot mc-priority-${idx}`} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mc-priority-map-glow" />
        </section>

        {/* ALERTS FEED (middle-right) */}
        <section className="mc-card" id="mc-alerts">
          <h2 className="mc-card-title">Alerts Feed</h2>
          <ul className="mc-alerts-list">
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>

        {/* MARKET COMMAND (bottom-left small card) */}
        <section className="mc-card" id="mc-market">
          <h2 className="mc-card-title">{MOCK_MARKET.label}</h2>
          <p className="mc-market-status">
            Market: <strong>{MOCK_MARKET.status}</strong>
          </p>
          <ul className="mc-metric-list mc-market-legend">
            <li>
              <span className="mc-dot mc-dot-green" /> {MOCK_MARKET.cold}
            </li>
            <li>
              <span className="mc-dot mc-dot-red" /> {MOCK_MARKET.volume}
            </li>
          </ul>
        </section>

        {/* LOAD SCORE + REVENUE + DTL + HOS (bottom center & right) */}
        <section className="mc-card mc-card-wide" id="mc-bottom-metrics">
          <div className="mc-bottom-grid">
            {/* Load score gauge */}
            <div className="mc-bottom-tile">
              <h3 className="mc-subtitle">Load Score</h3>
              <Gauge value={loadScore} small />
              <p className="mc-bottom-caption">Revenue Today</p>
              <p className="mc-bottom-number">$0</p>
            </div>

            {/* Revenue this week (simple ring style using Gauge) */}
            <div className="mc-bottom-tile">
              <h3 className="mc-subtitle">Revenue This Week</h3>
              <Gauge value={33} small />
              <p className="mc-bottom-caption">Projected</p>
              <p className="mc-bottom-number">$56,487</p>
            </div>

            {/* DTL card */}
            <div className="mc-bottom-tile">
              <h3 className="mc-subtitle">DTL</h3>
              <DTLCard />
            </div>

            {/* HOS / Hours of Service */}
            <div className="mc-bottom-tile">
              <h3 className="mc-subtitle">Hours of Service</h3>
              <HOS />
            </div>
          </div>
        </section>

        {/* ACTION BAR (bottom full-width) */}
        <section className="mc-card mc-action-bar">
          <button className="mc-action-btn">Add Carrier</button>
          <button className="mc-action-btn">Add Load</button>
          <button className="mc-action-btn">Run DTL Scan</button>
          <button className="mc-action-btn">Sync Sheets</button>
          <button className="mc-action-btn mc-action-alert">
            Emergency Alert
          </button>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
