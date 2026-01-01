import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";

import MissionControl from "./pages/MissionControl.jsx";
import CarrierCommand from "./pages/CarrierCommand.jsx";
import BrokerCommand from "./pages/BrokerCommand.jsx";
import FinanceCommand from "./pages/FinanceCommand.jsx";
import LogisticsCommand from "./pages/LogisticsCommand.jsx";
import DispatchCommand from "./pages/Dispatchcommand.jsx";
import ComplianceCommand from "./pages/ComplianceCommand.jsx";
import LearningCommand from "./pages/LearningCommand.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/mission-control" replace />} />
        <Route path="/mission-control" element={<MissionControl />} />

        <Route path="/dispatch" element={<DispatchCommand />} />
        <Route path="/logistics" element={<LogisticsCommand />} />
        <Route path="/carriers" element={<CarrierCommand />} />
        <Route path="/brokers" element={<BrokerCommand />} />
        <Route path="/finance" element={<FinanceCommand />} />
        <Route path="/compliance" element={<ComplianceCommand />} />
        <Route path="/learning" element={<LearningCommand />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/mission-control" replace />} />
      </Route>
    </Routes>
  );
}
