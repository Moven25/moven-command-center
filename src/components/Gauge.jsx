import React from "react";
import "./Gauge.css";

function Gauge({ value = 0, label = "", size = 180 }) {
  const clamped = Math.max(0, Math.min(100, value));
  const rotation = (clamped / 100) * 180; // 0–180deg

  return (
    <div
      className="mc-gauge"
      style={{ width: size, height: size / 2 + 40 }}
    >
      <div className="mc-gauge-arc">
        <div
          className="mc-gauge-fill"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="mc-gauge-cover">
          <div className="mc-gauge-value">{clamped}</div>
          <div className="mc-gauge-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default Gauge;

