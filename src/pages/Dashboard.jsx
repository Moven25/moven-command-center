import React from "react";
import "./Dashboard.css";

import Gauge from "../components/Gauge";
import Tile from "../components/Tile";
import PerformanceCard from "../components/PerformanceCard";
import WeatherMini from "../components/WeatherMini";
import HOS from "../components/HOS";
import DTLCard from "../components/DTLCard";

function Dashboard() {

  // Temporary placeholder data. We will connect it later.
  const activeTrucks = 27;
  const loadsToday = 14;
  const avgRPM = 475;
  const weeklyRevenue = 18900;

  return (
    <div className="dashboard-container">

      <h1 className="dash-title">MOVEN Command Dashboard</h1>

      {/* TOP ROW KPI CARDS */}
      <div className="kpi-row">
        <Tile title="Active Trucks" value={activeTrucks} sub="Goal: 10" />
        <Tile title="Loads Dispatched Today" value={loadsToday} sub="Target: 4" />
        <Tile title="Avg RPM (Today)" value={avgRPM} sub="Threshold Exceed" />
        <Tile title="Weekly Revenue" value={`$${weeklyRevenue.toLocaleString()}`} sub="Goal: $29,900" />
      </div>

      {/* MIDDLE ROW */}
      <div className="middle-row">
        <PerformanceCard />

        <div className="gauge-wrapper">
          <h3 className="panel-title">RPM Gauge</h3>
          <Gauge value={avgRPM} />
        </div>

        <DTLCard />
      </div>

      {/* LOWER ROW */}
      <div className="lower-row">
        <PerformanceCard small />

        <WeatherMini city="Atlanta" temperature={72} />

        <HOS hours="3" minutes="12" />

        <div className="lower-gauge">
          <Gauge value={avgRPM} small />
        </div>
      </div>

      <div className="recent-loads">
        <h3>Recent Loads</h3>
        <div className="recent-box">No loads yet</div>
      </div>

    </div>
  );
}

export default Dashboard;



