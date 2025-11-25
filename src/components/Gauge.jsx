import React from "react";
import "./Gauge.css";

function Gauge({ value, small }) {
  const size = small ? 120 : 180;
  const rotate = (value / 600) * 180;

  return (
    <div className="gauge-container" style={{ width: size, height: size }}>
      <div className="gauge-arc"></div>
      <div className="gauge-needle" style={{ transform: `rotate(${rotate}deg)` }}></div>
      <div className="gauge-value">{value}</div>
      <div className="gauge-label">RPM</div>
    </div>
  );
}

export default Gauge;

