// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// MOVEN logo asset
import MovenLogo from "../assets/moven-logo.png";

// Existing components you already have
import Gauge from "../components/Gauge";
import Tile from "../components/Tile";
import PerformanceCard from "../components/PerformanceCard";
import WeatherMini from "../components/WeatherMini";

// Data fetcher (your Zoho CSV function)
import { getSheet } from "../utils/movenSheets";

const Dashboard = () => {
  const [carriers, setCarriers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // ---------- DATA LOAD ----------
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const carrierData = await getSheet("carriers");
      const loadData = await getSheet("loads");

      setCarriers(carrierData || []);
      setLoads(loadData || []);
      setAlerts(generateAlerts(carrierData || [], loadData || []));
    } catch (err) {
      console.error("Dashboard data error:", err);
    }
  };

  // ---------- HELPERS ----------

  const generateAlerts = (carrierData = [], loadData = []) => {
    const list = [];

    carrierData.forEach((c) => {
      if (c.InsuranceStatus === "ALERT") {
        list.push(
          `Carrier ${c.Name || c.CarrierName || c.MC || "Unknown"} insurance expiring soon.`
        );
      }
      if (c.ComplianceStatus === "ALERT") {
        list.push(
          `Carrier ${c.Name || c.CarrierName || c.MC || "Unknown"} has compliance issues.`
        );
      }
    });

    loadData.forEach((l) => {
      if (l.Status === "LATE") {
        list.push(`Load ${l.LoadID} is late at pickup.`);
      }
      if (l.Risk === "WEATHER") {
        list.push(`Weather risk on ${l.Origin} → ${l.Destination}.`);
      }
    });

    if (list.length === 0) list.push("No active alerts at this time.");

    return list.slice(0, 6);
  };

  const liveCarrierScore = () => {
    if (!carriers.length) return 0;
    const safe = carriers.filter(
      (c) =>
        c.InsuranceStatus !== "ALERT" && c.ComplianceStatus !== "ALERT"
    ).length;
    return Math.round((safe / carriers.length) * 100);
  };

  const avgLoadScore = () => {
    if (!loads.length) return 0;
    const total = loads.reduce(
      (sum, l) => sum + (parseFloat(l.Score) || 0),
      0
    );
    return Math.round(total / loads.length);
  };

  const revenueThisWeek = () => {
    if (!loads.length) return 0;
    // Adjust this field name to whatever you use for revenue in the loads sheet
    const total = loads.reduce(
      (sum, l) => sum + (parseFloat(l.Revenue) || 0),
      0
    );
    return total;
  };

  const formatCurrency = (value) =>
    "$" +
    Number(value || 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

  // ---------- RENDER ----------
  return (
    <>
      {/* ===== MOVEN DASHBOARD HEADER ===== */}
      <div className="dashboard-header">
        <img src={MovenLogo} alt="MOVEN Logo" className="moven-logo" />

        <nav className="dashboard-nav">
          <button className="active">Mission Control</button>
          <button>Carrier Command</button>
          <button>Load Command</button>
          <button>Broker Command</button>
          <button>Routing Command</button>
          <button>Finance Command</button>
          <button>Weather Command</button>
          <button>Learning Command</button>
        </nav>
      </div>

      {/* ===== MAIN DASHBOARD GRID ===== */}
      <div className="dashboard-container">
        {/* Top Left: Live Carrier Data */}
        <PerformanceCard
          title="Live Carrier Data"
          score={liveCarrierScore()}
          metrics={{
            "Live Carriers": carriers.length,
            "Insurance Alerts": carriers.filter(
              (c) => c.InsuranceStatus === "ALERT"
            ).length,
            "Compliance Warnings": carriers.filter(
              (c) => c.ComplianceStatus === "ALERT"
            ).length,
          }}
        />

        {/* Middle: Load Summary */}
        <Tile title="Load Command Summary">
          <table className="load-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Origin</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>RPM</th>
                <th>Score</th>
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
                  <td>{l.Score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tile>

        {/* Weather Command mini tile */}
        <WeatherMini />

        {/* Alerts Feed */}
        <Tile title="Alerts Feed">
          <ul className="alerts-list">
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Tile>

        {/* Load Score Gauge */}
        <Tile title="Load Score">
          <Gauge value={avgLoadScore()} />
        </Tile>

        {/* Weekly Revenue */}
        <Tile title="Revenue This Week">
          <div className="revenue-number">
            {formatCurrency(revenueThisWeek())}
          </div>
        </Tile>
      </div>
    </>
  );
};

export default Dashboard;
