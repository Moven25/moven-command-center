import React, { useMemo } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

import MissionControl from "../pages/MissionControl";
import PlaceholderPage from "../pages/PlaceholderPage";

// If these pages exist, import them. If not, keep them as Placeholder routes for now.
// import LaneCommand from "../pages/LaneCommand";
// import CarrierCommand from "../pages/CarrierCommand";
// import LoadCommand from "../pages/LoadCommand";

const SECTIONS = [
  { key: "mission", label: "Mission Control", path: "/mission-control" },
  { key: "dispatch", label: "Dispatch Command", path: "/dispatch-command" },
  { key: "logistics", label: "Logistics Command", path: "/logistics-command" },
  { key: "carrier", label: "Carrier Command", path: "/carrier-command" },
  { key: "broker", label: "Broker Command", path: "/broker-command" },
  { key: "finance", label: "Finance Command", path: "/finance-command" },
  { key: "compliance", label: "Compliance Command", path: "/compliance-command" },
  { key: "learning", label: "Learning Command", path: "/learning-command" },
  { key: "settings", label: "Settings / Utilities", path: "/settings" },
];

function keyFromPath(pathname) {
  const found = SECTIONS.find((s) => pathname === s.path);
  if (found) return found.key;

  // Treat subroutes as belonging to their section
  if (pathname.startsWith("/lane-command")) return "dispatch"; // or "logistics" if you prefer
  if (pathname.startsWith("/carrier-command")) return "carrier";
  if (pathname.startsWith("/broker-command")) return "broker";
  if (pathname.startsWith("/load-command")) return "dispatch";

  return "mission";
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(() => keyFromPath(location.pathname), [location.pathname]);
  const activeLabel = useMemo(
    () => SECTIONS.find((s) => s.key === activeKey)?.label ?? "Mission Control",
    [activeKey]
  );

  const handleSidebarChange = (nextKey) => {
    const target = SECTIONS.find((s) => s.key === nextKey)?.path || "/mission-control";
    navigate(target);
  };

  return (
    <div className="osRoot">
      <aside className="osSidebar">
        <Sidebar sections={SECTIONS} active={activeKey} onChange={handleSidebarChange} />
      </aside>

      <main className="osMain">
        <TopBar section={activeLabel} />
        <div className="osContent">
          <Routes>
            {/* Default */}
            <Route path="/" element={<Navigate to="/mission-control" replace />} />

            {/* Core pages */}
            <Route path="/mission-control" element={<MissionControl />} />

            {/* If you haven't built these pages yet, keep them as placeholders. */}
            <Route path="/lane-command" element={<PlaceholderPage title="Lane Command" />} />
            <Route path="/carrier-command" element={<PlaceholderPage title="Carrier Command" />} />
            <Route path="/load-command" element={<PlaceholderPage title="Load Command" />} />

            {/* Commands */}
            <Route path="/dispatch-command" element={<PlaceholderPage title="Dispatch Command" />} />
            <Route path="/logistics-command" element={<PlaceholderPage title="Logistics Command" />} />
            <Route path="/broker-command" element={<PlaceholderPage title="Broker Command" />} />
            <Route path="/finance-command" element={<PlaceholderPage title="Finance Command" />} />
            <Route path="/compliance-command" element={<PlaceholderPage title="Compliance Command" />} />
            <Route path="/learning-command" element={<PlaceholderPage title="Learning Command" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings / Utilities" />} />

            {/* 404 */}
            <Route path="*" element={<PlaceholderPage title="Not Found" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}