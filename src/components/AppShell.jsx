import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <TopNav />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
