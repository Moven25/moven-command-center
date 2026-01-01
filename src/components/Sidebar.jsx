import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const nav = [
  { to: "/mission-control", label: "Mission Control" },
  { to: "/dispatch", label: "Dispatch Command" },
  { to: "/logistics", label: "Logistics Command" },
  { to: "/carriers", label: "Carrier Command" },
  { to: "/brokers", label: "Broker Command" },
  { to: "/finance", label: "Finance Command" },
  { to: "/compliance", label: "Compliance Command" },
  { to: "/learning", label: "Learning Command" },
  { to: "/settings", label: "Settings / Utilities" },
];

export default function Sidebar() {
  return (
    <div className="sb">
      <div className="sbHeader">
        <div className="sbTitle">Sync OS</div>
        <div className="sbSub">Navigation</div>
      </div>

      <nav className="sbNav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sbLink ${isActive ? "active" : ""}`}
          >
            <span className="sbDot" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sbFooter">
        <div className="sbFootLine">
          <span className="sbPill">Live</span>
          <span className="sbMuted">Data connected</span>
        </div>
      </div>
    </div>
  );
}
