import React from "react";
import "./Gauge.css";

export default function Gauge({ value = 0, max = 100, size = 120 }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius;
  const dash = circumference * pct;

  return (
    <div className="gauge-container" style={{ width: size, height: size / 2 }} aria-hidden>
      <svg className="gauge-svg" width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#ff9f43" />
            <stop offset="100%" stopColor="#ff4b3e" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <path className="gauge-track" d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`} strokeWidth="12" fill="none" />
          <path
            className="gauge-arc"
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            style={{ strokeDasharray: `${dash} ${circumference}`, strokeDashoffset: 0 }}
          />
        </g>
      </svg>
      <div className="gauge-value">{Math.round(value)}</div>
    </div>
  );
}

