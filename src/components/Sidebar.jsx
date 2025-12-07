import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="mc-sidebar">
      <div className="mc-sidebar-brand">MOVEN<br/>Mission</div>
      <nav className="mc-sidebar-nav">
        <NavLink to="/dashboard" className={({isActive})=> isActive? 'active':''}>Mission Control</NavLink>
        <NavLink to="/load">Load Command</NavLink>
        <NavLink to="/carrier">Carrier Command</NavLink>
        <NavLink to="/weather">Weather</NavLink>
        <NavLink to="/dtl">DTL</NavLink>
        <NavLink to="/learning">Learning</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      <div className="mc-sidebar-footer">Owner</div>
    </aside>
  );
}
