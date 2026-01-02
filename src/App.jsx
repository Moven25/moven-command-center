import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";

// Pages
import MissionControl from "./pages/MissionControl.jsx";
import DispatchCommand from "./pages/DispatchCommand.jsx";
import LogisticsCommand from "./pages/LogisticsCommand.jsx";

export default function App() {
  return (
    <Routes>
      {/* App Shell */}
      <Route element={<Layout />}>
        {/* Default */}
        <Route path="/" element={<Navigate to="/mission-control" replace />} />

        {/* Core routes */}
        <Route path="/mission-control" element={<MissionControl />} />
        <Route path="/dispatch" element={<DispatchCommand />} />
        <Route path="/logistics" element={<LogisticsCommand />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/mission-control" replace />} />
      </Route>
    </Routes>
  );
}
