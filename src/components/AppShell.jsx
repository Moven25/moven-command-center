import React from "react";
import "./AppShell.css";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppShell({ children }) {
  return (
    <div className="shell">
      <div className="shellFrame">
        <TopBar />
        <div className="shellBody">
          <Sidebar />
          <main className="shellMain">{children}</main>
        </div>
      </div>
    </div>
  );
}
