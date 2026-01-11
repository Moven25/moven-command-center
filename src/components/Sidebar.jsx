import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

function commandKeyFromPath(pathname = "/") {
  const p = pathname.toLowerCase();
  if (p === "/" || p.includes("mission")) return "mission";
  if (p.includes("lane")) return "lane";
  if (p.includes("load")) return "load";
  if (p.includes("carrier")) return "carrier";
  if (p.includes("broker")) return "broker";
  if (p.includes("finance")) return "finance";
  if (p.includes("compliance")) return "compliance";
  if (p.includes("intelligence")) return "intelligence";
  if (p.includes("learning")) return "learning";
  return "mission";
}

export default function Sidebar({ theme = "day", onToggleTheme }) {
  const location = useLocation();
  const commandKey = commandKeyFromPath(location.pathname);

  const navClass = ({ isActive }) => `nav-item${isActive ? " active" : ""}`;

  return (
    <aside className={`sidebar sidebar--${commandKey}`}>
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-row">
          <div className="brand-title">LANESYNC</div>

          <button
            className="theme-toggle no-nav-style"
            type="button"
            onClick={onToggleTheme}
            title={theme === "night" ? "Night Ops (click for Day)" : "Day Ops (click for Night)"}
            aria-label="Toggle Night Ops"
          >
            {theme === "night" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="brand-sub">
          <span className="status-dot" />
          <span>Sync OS</span>
          <span className="mode-chip">{theme === "night" ? "Night" : "Day"}</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {/* OPERATIONS */}
        <div className="nav-section">
          <div className="nav-section-title">OPERATIONS</div>

          <NavLink to="/mission-control" className={navClass}>
            Mission Control
          </NavLink>
          <NavLink to="/lane-command" className={navClass}>
            Lane Command
          </NavLink>
          <NavLink to="/load-command" className={navClass}>
            Load Command
          </NavLink>
          <NavLink to="/carrier-command" className={navClass}>
            Carrier Command
          </NavLink>
          <NavLink to="/broker-command" className={navClass}>
            Broker Command
          </NavLink>
        </div>

        <div className="divider" />

        {/* MONEY & RISK */}
        <div className="nav-section">
          <div className="nav-section-title">MONEY &amp; RISK</div>

          <NavLink to="/finance-command" className={navClass}>
            Finance Command
          </NavLink>
          <NavLink to="/compliance-command" className={navClass}>
            Compliance Command
          </NavLink>
        </div>

        <div className="divider" />

        {/* STRATEGY */}
        <div className="nav-section">
          <div className="nav-section-title">STRATEGY</div>

          <NavLink to="/intelligence-command" className={navClass}>
            Intelligence Command
          </NavLink>
          <NavLink to="/learning-command" className={navClass}>
            Learning Command
          </NavLink>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="status-pill">
          <span>Status</span>
          <span className="status-value">Healthy</span>
        </div>

        <div className="hint">
          <span className="hint-kbd">Shift</span> + <span className="hint-kbd">N</span>
        </div>
      </div>
    </aside>
  );
}
