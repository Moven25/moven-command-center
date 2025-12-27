import React from "react";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="mc-sidebar">
      <div className="mc-sidebar-brand">
        MOVEN<br />Mission
      </div>

      <nav className="mc-sidebar-nav">
        <button className="nav-btn active">Mission Control</button>
        <button className="nav-btn">Load Command</button>
        <button className="nav-btn">Carrier Command</button>
        <button className="nav-btn">Weather</button>
        <button className="nav-btn">DTL</button>
        <button className="nav-btn">Learning</button>
        <button className="nav-btn">Settings</button>
        <button className="nav-btn">Admin</button>
      </nav>

      <div className="mc-sidebar-footer">Owner</div>
    </aside>
  );
}
