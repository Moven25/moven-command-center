// Option B2 Neon Gauge
import React from "react";
import "./Gauge.css";

const Gauge = ({ value = 0, label = "", max = 100 }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = 54;
  const circumference = Math.PI * radius;
  const dash = circumference * pct;

  return (
    <div className="gauge-b2">
      <svg className="gauge-svg-b2" width={140} height={80} viewBox="0 0 140 80">
        <defs>
          <linearGradient id="gaugeNeon" x1="0" x2="1">
            <stop offset="0%" stopColor="#00ffb2" />
            <stop offset="100%" stopColor="#ffe066" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <path className="gauge-track-b2" d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`} strokeWidth="14" fill="none" />
          <path
            className="gauge-arc-b2"
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
            stroke="url(#gaugeNeon)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            style={{ strokeDasharray: `${dash} ${circumference}`, strokeDashoffset: 0 }}
          />
        </g>
      </svg>
      <div className="gauge-value-b2">{Math.round(value)}</div>
      <div className="gauge-label-b2">{label}</div>
    </div>
  );
};

export default Gauge;

