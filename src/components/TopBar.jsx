import React from "react";
import "./Topbar.css";

export default function Topbar({ section = "Mission Control" }) {
  return (
    <div className="osTopbar">
      {/* Left (can be empty or keep minimal) */}
      <div className="osTopbarLeft" aria-hidden="true" />

      {/* Center (TRUE centered) */}
      <div className="osTopbarCenter">
        <div className="osBrandPill">
          <div className="osBrandMark">LS</div>

          <div className="osBrandText">
            <div className="osBrandName">LaneSync</div>
            <div className="osBrandSub">Sync OS</div>
          </div>

          <div className="osDivider" />

          <div className="osSection">{section}</div>
        </div>
      </div>

      {/* Right actions (ALWAYS far right) */}
      <div className="osTopbarRight">
        <button className="osIconBtn" title="Notifications">🔔</button>
        <button className="osIconBtn" title="Popout">↗</button>
        <button className="osIconBtn" title="Settings">⚙</button>
      </div>
    </div>
  );
}
