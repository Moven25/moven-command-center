import React from "react";
import "./TopNav.css";

export default function TopNav(){
  return (
    <header className="mc-topnav">
      <div className="mc-topnav-left">
        <div className="mc-topnav-logo">MOVEN Mission Control</div>
      </div>
      <div className="mc-topnav-right">
        <button className="mc-topnav-btn">Sync</button>
        <button className="mc-topnav-btn">Profile</button>
      </div>
    </header>
  );
}
