import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LaneProvider } from "./state/LaneContext";

import AppShell from "./layout/AppShell";
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
    <BrowserRouter>
      <LaneProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/mission-control" replace />} />

            <Route path="/mission-control" element={<MissionControl />} />
            <Route path="/lane-command" element={<LaneCommand />} />
            <Route path="/load-command" element={<LoadCommand />} />
            <Route path="/carrier-command" element={<CarrierCommand />} />
            <Route path="/broker-command" element={<BrokerCommand />} />
            <Route path="/finance-command" element={<FinanceCommand />} />

            {/* NEW SCAFFOLDED COMMANDS */}
            <Route path="/compliance-command" element={<ComplianceCommand />} />
            <Route path="/intelligence-command" element={<IntelligenceCommand />} />
            <Route path="/learning-command" element={<LearningCommand />} />

            <Route path="*" element={<Navigate to="/mission-control" replace />} />
          </Routes>
        </AppShell>
      </LaneProvider>
    </BrowserRouter>
  );
}
