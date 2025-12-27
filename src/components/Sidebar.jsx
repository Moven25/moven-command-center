import React from "react";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="mc-sidebar">
      <div className="mc-sidebar-brand">
        MOVEN<br />Mission
      </div>

      <nav className="mc-sidebar-nav">
        <button className="nav-btn red active">Mission Control</button>
        <button className="nav-btn red">Carrier Command</button>
        <button className="nav-btn red">Load Command</button>
        <button className="nav-btn red">Weather Command</button>
        <button className="nav-btn red">Learning Command</button>

        <button className="nav-btn gray">DTL</button>
        <button className="nav-btn gray">Settings</button>
        <button className="nav-btn gray">Admin</button>
      </nav>

      <div className="mc-sidebar-footer">Owner</div>
    </aside>
  );
}
