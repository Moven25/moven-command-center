import React from "react";
import "./Sidebar.css";

export default function Sidebar({ activeCommand, onCommandChange }) {
  const btn = (key) => {
    const isActive = activeCommand === key;
    const base = "nav-btn red";
    return isActive ? `${base} active` : base;
  };

  return (
    <aside className="mc-sidebar">
      <div className="mc-sidebar-brand">
        MOVEN<br />LOGISTICS
      </div>

      <nav className="mc-sidebar-nav">
        <button className={btn("mission")} onClick={() => onCommandChange("mission")}>
          Mission Control
        </button>
        <button className={btn("carrier")} onClick={() => onCommandChange("carrier")}>
          Carrier Command
        </button>
        <button className={btn("load")} onClick={() => onCommandChange("load")}>
          Load Command
        </button>
        <button className={btn("weather")} onClick={() => onCommandChange("weather")}>
          Weather Command
        </button>
        <button className={btn("learning")} onClick={() => onCommandChange("learning")}>
          Learning Command
        </button>

        <button className="nav-btn gray" onClick={() => onCommandChange("dtl")}>
          DTL
        </button>
        <button className="nav-btn gray" onClick={() => onCommandChange("settings")}>
          Settings
        </button>
        <button className="nav-btn gray" onClick={() => onCommandChange("admin")}>
          Admin
        </button>
      </nav>

      <div className="mc-sidebar-footer">Owner</div>
    </aside>
  );
}
