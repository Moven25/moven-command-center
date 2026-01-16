// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./layout/AppShell";

// Data
import { DataProvider } from "./state/DataContext";

// Pages (adjust paths if your folder names differ)
import MissionControl from "./pages/MissionControl";
import LaneCommand from "./pages/LaneCommand";
import LoadCommand from "./pages/LoadCommand";
import CarrierCommand from "./pages/CarrierCommand";
import BrokerCommand from "./pages/BrokerCommand";
import FinanceCommand from "./pages/FinanceCommand";
import ComplianceCommand from "./pages/ComplianceCommand";
import IntelligenceCommand from "./pages/IntelligenceCommand";
import LearningCommand from "./pages/LearningCommand";

export default function App() {
  return (
    <React.StrictMode>
      <DataProvider>
        <BrowserRouter>
          {/* AppShell renders Sidebar + background + <Outlet /> */}
          <Routes>
            <Route element={<AppShell />}>
              {/* Home */}
              <Route path="/" element={<MissionControl />} />

              {/* Commands */}
              <Route path="/mission-control" element={<MissionControl />} />
              <Route path="/lane-command" element={<LaneCommand />} />
              <Route path="/load-command" element={<LoadCommand />} />
              <Route path="/carrier-command" element={<CarrierCommand />} />
              <Route path="/broker-command" element={<BrokerCommand />} />
              <Route path="/finance-command" element={<FinanceCommand />} />
              <Route path="/compliance-command" element={<ComplianceCommand />} />
              <Route path="/intelligence-command" element={<IntelligenceCommand />} />
              <Route path="/learning-command" element={<LearningCommand />} />

              {/* Back-compat (optional) */}
              <Route path="/compliance" element={<Navigate to="/compliance-command" replace />} />
              <Route path="/carrier" element={<Navigate to="/carrier-command" replace />} />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </React.StrictMode>
  );
}
