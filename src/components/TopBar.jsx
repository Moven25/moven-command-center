import React from "react";
import "./TopBar.css";

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"
        stroke="rgba(255,255,255,.75)" strokeWidth="1.6" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 7l10 10M17 7 7 17" stroke="rgba(255,255,255,.8)" strokeWidth="1.8" />
    </svg>
  );
}
function MovenMark() {
  return (
    <div className="movenMark">
      <span className="mBar" />
      <span className="mBar" />
      <span className="mBar" />
    </div>
  );
}

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <MovenMark />
          <div className="brandText">
            <div className="brandLine">
              <span className="brandName">MOVEN</span>
              <span className="brandSlash">/</span>
              <span className="brandSection">MISSION CONTROL</span>
            </div>
          </div>
        </div>

        <div className="topRight">
          <button className="iconBtn" aria-label="Home">
            <IconHome />
          </button>
          <button className="closeBtn">
            <span className="closeIcon"><IconClose /></span>
            Close
          </button>
        </div>
      </div>
      <div className="topbarRedLine" />
    </header>
  );
}
