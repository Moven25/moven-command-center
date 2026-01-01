import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import "./layout.css";

export default function Layout() {
  const location = useLocation();

  // Derive section label
  const section =
    location.pathname.startsWith("/mission-control") ? "MISSION CONTROL" :
    location.pathname.startsWith("/dispatch") ? "DISPATCH COMMAND" :
    location.pathname.startsWith("/logistics") ? "LOGISTICS COMMAND" :
    location.pathname.startsWith("/carriers") ? "CARRIER COMMAND" :
    location.pathname.startsWith("/brokers") ? "BROKER COMMAND" :
    location.pathname.startsWith("/finance") ? "FINANCE COMMAND" :
    location.pathname.startsWith("/compliance") ? "COMPLIANCE COMMAND" :
    location.pathname.startsWith("/learning") ? "LEARNING COMMAND" :
    location.pathname.startsWith("/settings") ? "SETTINGS / UTILITIES" :
    "SYNC OS";

  return (
    <div className="os">
      <aside className="osSidebar">
        <Sidebar />
      </aside>

      <div className="osMain">
        <header className="osTopbar">
          <div className="osBrand">
            <div className="osBrandMark">LS</div>
            <div className="osBrandText">
              <div className="osBrandName">LaneSync</div>
              <div className="osBrandSub">Sync OS</div>
            </div>
          </div>

          <div className="osSection">{section}</div>

          <div className="osActions">
            <button className="osBtn" title="Pop Out">↗</button>
            <button className="osBtn" title="Notifications">🔔</button>
            <button className="osBtn" title="Settings">⚙</button>
          </div>
        </header>

        <main className="osContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
