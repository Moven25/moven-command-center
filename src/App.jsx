import React, { useState } from "react";
import "./App.css";

import Dashboard from "./pages/Dashboard.jsx";
import CarrierCommand from "./pages/CarrierCommand.jsx";
import LoadCommand from "./pages/LoadCommand.jsx";
import Weather from "./pages/Weather.jsx";
import LearningCommand from "./pages/LearningCommand.jsx";
import AdminCommand from "./pages/AdminCommand.jsx"; // safe even if simple
import movenLogo from "./assets/moven-logo.png";

const TABS = [
  { id: "mission", label: "Mission Control" },
  { id: "carrier", label: "Carrier Command" },
  { id: "load", label: "Load Command" },
  { id: "weather", label: "Weather Command" },
  { id: "learning", label: "Learning Command" },
];

function App() {
  const [activeTab, setActiveTab] = useState("mission");

  const renderActive = () => {
    switch (activeTab) {
      case "carrier":
        return <CarrierCommand />;
      case "load":
        return <LoadCommand />;
      case "weather":
        return <Weather />;
      case "learning":
        return <LearningCommand />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-root">
      <header className="mc-header">
        <div className="mc-header-left">
          <div className="mc-logo-wrap">
            <img src={movenLogo} alt="MOVEN" className="mc-logo" />
          </div>
        </div>

        <nav className="mc-nav" aria-label="Main navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                "mc-nav-item" + (activeTab === tab.id ? " mc-nav-item--active" : "")
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mc-header-right">
          {/* Placeholder for future icons / user menu */}
        </div>
      </header>

      <main className="mc-main">{renderActive()}</main>
    </div>
  );
}

export default App;
