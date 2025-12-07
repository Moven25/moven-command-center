import React from "react";
import "./PerformanceCard.css";

export default function PerformanceCard({ title = "Performance", rows = [] }) {
  return (
    <div className="perf-card" role="region" aria-label={title}>
      <div className="perf-header">
        <h3>{title}</h3>
      </div>
      <div className="perf-body">
        {rows.map((r, i) => (
          <div className="perf-row" key={i}>
            <span>{r.label}</span>
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
