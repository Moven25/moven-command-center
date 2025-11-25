import React from "react";
import "./HOS.css";

function HOS({ hours, minutes }) {
  return (
    <div className="hos-card">
      <h3 className="panel-title">Hours of Service</h3>
      <div className="hos-time">{hours}:{minutes}</div>
      <span className="hos-sub">Available</span>
    </div>
  );
}

export default HOS;
