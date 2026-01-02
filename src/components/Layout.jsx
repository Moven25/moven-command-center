import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="os">
      <aside className="osSidebar">
        <Sidebar />
      </aside>

      <main className="osMain">
        <header className="osTopbar">
          <Topbar />
        </header>

        <section className="osContent">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
