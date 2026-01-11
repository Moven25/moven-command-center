// src/components/LaneCommand.jsx
import React from "react";
import "./LaneCommand.css";

export default function LaneCommand() {
  // Demo data (replace later with real state/data)
  const lane = "Chicago, IL → Dallas, TX";
  const miles = 920;
  const rate = 2500;

  const netRpm = 2.17;
  const status = "BORDERLINE";

  const lastRates = [2.35, 2.20, 2.10];

  const broker = {
    name: "ABC Logistics",
    mc: "567432",
    notes: "Needs quick confirmation.",
  };

  const carrierPerformance = [
    { carrier: "Swift Transport", trucks: 5, avgNetRpm: 2.42, loadsPerWeek: 3.0 },
    { carrier: "Reliable Freight", trucks: 7, avgNetRpm: 1.95, loadsPerWeek: 2.1 },
  ];

  const recentLoads = [
    { date: "01/05", lane: "Chicago, IL → Atlanta, GA", miles: 780, netRpm: 2.45, status: "Work" },
    { date: "01/04", lane: "Dallas, TX → Memphis, TN", miles: 460, netRpm: 1.88, status: "Risk" },
  ];

  return (
    <div className="lc-wrap">
      {/* Section header */}
      <div className="lc-sectionHeader">
        <div className="lc-title">Lane Command</div>
        <button className="lc-popoutBtn" type="button">Pop Out</button>
      </div>

      {/* Lane bar */}
      <div className="lc-laneBar">
        <div className="lc-laneLeft">
          <div className="lc-k">Lane</div>
          <div className="lc-v">{lane}</div>
        </div>

        <div className="lc-laneMid">
          <div className="lc-k">Miles</div>
          <div className="lc-v">{miles}</div>
        </div>

        <div className="lc-laneRight">
          <div className="lc-k">Rate</div>
          <div className="lc-v">${rate.toLocaleString()}</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="lc-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: "grid", gap: 12 }}>
          {/* NET RPM */}
          <div className="lc-card lc-netRpm">
            <div className="lc-netLabel">NET RPM</div>
            <div className="lc-netValue">${netRpm.toFixed(2)}</div>

            <div className="lc-statusRow">
              <div className="lc-statusIcon">⚠️</div>
              <div className="lc-statusLabel">STATUS</div>
              <div className="lc-statusPill">{status}</div>
            </div>
          </div>

          {/* Broker card */}
          <div className="lc-card">
            <div className="lc-cardTitle">Broker</div>

            <div className="lc-infoRow">
              <div className="lc-infoKey">Broker</div>
              <div className="lc-infoVal">{broker.name}</div>
            </div>

            <div className="lc-infoRow">
              <div className="lc-infoKey">MC#</div>
              <div className="lc-infoVal">{broker.mc}</div>
            </div>

            <div className="lc-infoRow">
              <div className="lc-infoKey">Notes</div>
              <div className="lc-infoVal">{broker.notes}</div>
            </div>
          </div>

          {/* Carrier Performance */}
          <div className="lc-card">
            <div className="lc-cardTitle">Carrier Performance</div>

            <div className="lc-table">
              <div className="lc-tr lc-th">
                <div className="lc-td">Carrier</div>
                <div className="lc-td lc-tdCenter">Trucks</div>
                <div className="lc-td lc-tdCenter">Avg Net RPM</div>
                <div className="lc-td lc-tdCenter">Loads / Week</div>
              </div>

              {carrierPerformance.map((r) => (
                <div className="lc-tr" key={r.carrier}>
                  <div className="lc-td">{r.carrier}</div>
                  <div className="lc-td lc-tdCenter">{r.trucks}</div>
                  <div className="lc-td lc-tdCenter lc-green">${r.avgNetRpm.toFixed(2)}</div>
                  <div className="lc-td lc-tdCenter">{r.loadsPerWeek.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "grid", gap: 12 }}>
          {/* Lane History */}
          <div className="lc-card">
            <div className="lc-cardTitle">Lane History</div>
            <div className="lc-subTitle">Last Rates:</div>

            <div className="lc-historyList">
              {lastRates.map((v, i) => (
                <div className="lc-historyRow" key={i}>
                  <div className="lc-historyVal">${v.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="lc-card">
            <div className="lc-cardTitle">Notes:</div>
            <div className="lc-noteLine">
              <span className="lc-noteIcon">📄</span>
              <span>{broker.notes}</span>
            </div>
          </div>

          {/* Recent Loads */}
          <div className="lc-card lc-recent">
            <div className="lc-cardTitle">Recent Loads</div>

            <div className="lc-table">
              <div className="lc-tr lc-th">
                <div className="lc-td">Date</div>
                <div className="lc-td">Lane</div>
                <div className="lc-td lc-tdCenter">Miles</div>
                <div className="lc-td lc-tdCenter">Net RPM</div>
                <div className="lc-td lc-tdCenter">Status</div>
              </div>

              {recentLoads.map((r) => {
                const isGood = r.status.toLowerCase() === "work";
                return (
                  <div className="lc-tr" key={`${r.date}-${r.lane}`}>
                    <div className="lc-td">{r.date}</div>
                    <div className="lc-td">{r.lane}</div>
                    <div className="lc-td lc-tdCenter">{r.miles}</div>
                    <div className="lc-td lc-tdCenter">${r.netRpm.toFixed(2)}</div>
                    <div className="lc-td lc-tdCenter">
                      <span className={`lc-dot ${isGood ? "lc-dot-green" : "lc-dot-red"}`} />
                      <span className={`lc-statusText ${isGood ? "lc-status-green" : "lc-status-red"}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
