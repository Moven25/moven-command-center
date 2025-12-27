import React from "react";

const items = [
  { key: "mission", label: "Mission Control" },
  { key: "carrier", label: "Carrier Command" },
  { key: "load", label: "Load Command" },
  { key: "weather", label: "Weather Command" },
  { key: "learning", label: "Learning Command" },
  { key: "dtl", label: "DTL" },
  { key: "settings", label: "Settings" },
  { key: "admin", label: "Admin" },
];

export default function Sidebar({ activeCommand, onCommandChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebarBrand">
        <div className="sidebarBrandTop">MOVEN</div>
        <div className="sidebarBrandBottom">LOGISTICS</div>
      </div>

      <nav className="sidebarNav">
        {items.map((it) => {
          const isActive = activeCommand === it.key;
          return (
            <button
              key={it.key}
              className={`sideBtn ${isActive ? "active" : ""}`}
              onClick={() => onCommandChange(it.key)}
              type="button"
            >
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebarFooter">Owner</div>
    </aside>
  );
}

