import React from "react";
import "./PerformanceCard.css";

// Option B2 Performance Card
const PerformanceCard = ({ type, score }) => {
  if (type === "carrier") {
    return (
      <div className="perf-card-b2 perf-card--carrier">
        <div className="perf-title-b2">Live Carrier Data</div>
        <div className="perf-metrics-b2">
          <div className="perf-metric-b2"><span>Score</span><strong>{score}</strong></div>
          <div className="perf-metric-b2"><span>Live Carriers</span><strong>1280</strong></div>
          <div className="perf-metric-b2"><span>Insurance Alerts</span><strong>6</strong></div>
          <div className="perf-metric-b2"><span>Compliance Warnings</span><strong>8</strong></div>
        </div>
      </div>
    );
  }
  if (type === "compliance") {
    return (
      <div className="perf-card-b2 perf-card--compliance">
        <div className="perf-title-b2">Compliance Command</div>
        <div className="perf-metrics-b2">
          <div className="perf-metric-b2"><span className="perf-dot-b2 perf-dot--green" />Insurance</div>
          <div className="perf-metric-b2"><span className="perf-dot-b2 perf-dot--yellow" />Permits</div>
          <div className="perf-metric-b2"><span className="perf-dot-b2 perf-dot--yellow" />IFTA</div>
          <div className="perf-metric-b2"><span className="perf-dot-b2 perf-dot--red" />Medical</div>
        </div>
      </div>
    );
  }
  if (type === "market") {
    return (
      <div className="perf-card-b2 perf-card--market">
        <div className="perf-title-b2">Market Command</div>
        <div className="perf-metrics-b2">
          <div className="perf-market-row-b2"><span>Market</span><span className="perf-market-tag-b2">Moderate</span></div>
          <div className="perf-market-legend-b2">
            <span className="perf-dot-b2 perf-dot--green" />Cold markers
            <span className="perf-dot-b2 perf-dot--yellow" />Volume
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default PerformanceCard;
