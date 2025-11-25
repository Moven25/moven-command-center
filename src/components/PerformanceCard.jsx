import React from "react";
import "./PerformanceCard.css";

function PerformanceCard({ small }) {
  return (
    <div className={small ? "perf-card small" : "perf-card"}>
      <h3 className="panel-title">Performance Indicators</h3>

      <div className="perf-row">
        <span>Dispatch Efficiency</span>
        <strong>LOW</strong>
      </div>

      <div className="perf-row">
        <span>RPM Trend</span>
        <strong>UP</strong>
      </div>

      <div className="perf-row">
        <span>Projected Weekly Rate</span>
        <strong>2.40</strong>
      </div>

      {!small && (
        <div className="perf-row">
          <span>High-Priority Market</span>
          <strong>Atlanta</strong>
        </div>
      )}
    </div>
  );
}

export default PerformanceCard;
