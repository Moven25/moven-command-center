import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AppShell from "./layout/AppShell";
import { DataProvider } from "./state/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import MissionControl from "./pages/MissionControl";
import LaneCommand from "./pages/LaneCommand";
import LoadCommand from "./pages/LoadCommand";
import CarrierCommand from "./pages/CarrierCommand";
import BrokerCommand from "./pages/BrokerCommand";
import FinanceCommand from "./pages/FinanceCommand";
import ComplianceCommand from "./pages/ComplianceCommand";
import IntelligenceCommand from "./pages/IntelligenceCommand";
import LearningCommand from "./pages/LearningCommand";
import SupabaseTest from "./pages/SupabaseTest";

import { supabase } from "./lib/supabaseClient";

/* 🔐 Improved Logout Component */
function Logout() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    };

    doLogout();
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <React.StrictMode>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />

            {/* Protected OS */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/mission-control" replace />} />
              <Route path="/mission-control" element={<MissionControl />} />
              <Route path="/lane-command" element={<LaneCommand />} />
              <Route path="/load-command" element={<LoadCommand />} />
              <Route path="/carrier-command" element={<CarrierCommand />} />
              <Route path="/broker-command" element={<BrokerCommand />} />
              <Route path="/finance-command" element={<FinanceCommand />} />
              <Route path="/compliance-command" element={<ComplianceCommand />} />
              <Route path="/intelligence-command" element={<IntelligenceCommand />} />
              <Route path="/learning-command" element={<LearningCommand />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/mission-control" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </React.StrictMode>
  );
}