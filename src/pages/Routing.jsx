// src/Routing.jsx
import React from "react";

// ✅ Import your command pages (adjust names only if yours differ)
import MissionControl from "./pages/MissionControl.jsx"; // or Dashboard.jsx if that's your Mission Control
import LaneIntelligence from "./pages/LaneIntelligence.jsx"; // if you have it
import CarrierCommand from "./pages/CarrierCommand.jsx";
import BrokerCommand from "./pages/BrokerCommand.jsx";
import MapCommand from "./pages/MapCommand.jsx";
import FinanceCommand from "./pages/FinanceCommand.jsx";
import Settings from "./pages/Settings.jsx";

// Optional Admin if you have it
import AdminCommand from "./pages/AdminCommand.jsx";

export default function Routing({ activeCommand }) {
  switch (activeCommand) {
    case "mission":
      return <MissionControl />;

    case "lane-intel":
      return <LaneIntelligence />;

    case "carrier":
      return <CarrierCommand />;

    case "broker":
      return <BrokerCommand />;

    case "map":
      return <MapCommand />;

    case "finance":
      return <FinanceCommand />;

    case "settings":
      return <Settings />;

    case "admin":
      return <AdminCommand />;

    default:
      return <MissionControl />;
  }
}
