// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// Component imports
import Gauge from "../components/Gauge";
import Tile from "../components/Tile";
import PerformanceCard from "../components/PerformanceCard";
import WeatherMini from "../components/WeatherMini";
import HOS from "../components/HOS";
import DTLCard from "../components/DTLCard";

// Live data fetcher
import  movenSheets  from "../utils/movenSheets";

function Dashboard() {
  // === Live Data State ===
  const [activeTrucks, setActiveTrucks] = useState(0);
  const [loadsToday, setLoadsToday] = useState(0);
  const [avgRPM, setAvgRPM] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);

  // === Load data from backend ===
  useEffect(() => {
    async function loadDashboard() {
      try {
        const carriers = await movenSheets.carriers();
        const loads = await movenSheets.loads();

        // Active trucks
        setActiveTrucks(carriers.length);

        // Loads dispatched today
        const today = new Date().toISOString().split("T")[0];
        const todayLoads = loads.filter(
          (row) =>
            row.pickup?.trim() === today ||
            row.pickup_date?.trim() === today ||
            row.date === today
        );
        setLoadsToday(todayLoads.length);

        // Avg RPM
        if (loads.length > 0) {
          const avg =
            loads.reduce((sum, r) => sum + Number(r.rpm || 0), 0) /
            loads.length;
          setAvgRPM(Math.round(avg));
        }

        // Weekly Revenue
        const revenue = loads.reduce(
          (sum, r) => sum + Number(r.rate || 0),
          0
        );
        setWeeklyRevenue(revenue);
      } catch (err) {
        console.error("❌ Dashboard load failed:", err);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dash-title">MOVEN Command Dashboard</h1>

      {/* === TOP KPIs === */}
      <div className="kpi-row">
        <Tile title="Active Trucks" value={activeTrucks} sub="Goal: 10" />
        <Tile title="Loads Dispatched Today" value={loadsToday} sub="Target: 4" />
        <Tile title="Avg RPM (Today)" value={avgRPM} sub="Threshold Exceed" />
        <Tile
          title="Weekly Revenue"
          value={`$${weeklyRevenue.toLocaleString()}`}
          sub="Goal: $29,900"
        />
      </div>

      {/* === MIDDLE ROW === */}
      <div className="middle-row">
        <PerformanceCard />

        <div className="gauge-wrapper">
          <h3 className="panel-title">RPM Gauge</h3>
          <Gauge value={avgRPM} />
        </div>

        <DTLCard />
      </div>

      {/* === LOWER ROW === */}
      <div className="lower-row">
        <PerformanceCard small />

        <WeatherMini city="Atlanta" temperature={72} />

        <HOS hours="3" minutes="12" />

        <div className="lower-gauge">
          <Gauge value={avgRPM} small />
        </div>
      </div>

      {/* === RECENT LOADS === */}
      <div className="recent-loads">
        <h3>No loads yet</h3>
      </div>
    </div>
  );
}

export default Dashboard;


