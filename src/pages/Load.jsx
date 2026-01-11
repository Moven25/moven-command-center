// src/pages/Loads.jsx
import React, { useMemo, useState } from "react";
import "./Loads.css";

export default function Loads() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  // Demo rows (replace with your Zoho/CSV data later)
  const rows = useMemo(
    () => [
      {
        id: "LD-0105-001",
        date: "01/05",
        lane: "Chicago, IL → Atlanta, GA",
        miles: 780,
        rate: 2450,
        rpm: 2.45,
        status: "Work",
        broker: "ABC Logistics",
      },
      {
        id: "LD-0104-002",
        date: "01/04",
        lane: "Dallas, TX → Memphis, TN",
        miles: 460,
        rate: 860,
        rpm: 1.88,
        status: "Risk",
        broker: "Prime Freight",
      },
      {
        id: "LD-0103-003",
        date: "01/03",
        lane: "Columbus, OH → Nashville, TN",
        miles: 420,
        rate: 980,
        rpm: 2.33,
        status: "Work",
        broker: "Reliable Freight",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.lane.toLowerCase().includes(q) ||
        r.broker.toLowerCase().includes(q);

      const matchStatus = status === "All" ? true : r.status === status;
      return matchQ && matchStatus;
    });
  }, [rows, query, status]);

  const totals = useMemo(() => {
    const miles = filtered.reduce((a, r) => a + (Number(r.miles) || 0), 0);
    const rate = filtered.reduce((a, r) => a + (Number(r.rate) || 0), 0);
    const avgRpm = miles > 0 ? rate / miles : 0;
    return { miles, rate, avgRpm };
  }, [filtered]);

  return (
    <div className="loads-page">
      <div className="loads-header">
        <div className="loads-title">Loads</div>

        <div className="loads-controls">
          <input
            className="loads-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search load ID, lane, broker…"
          />

          <select
            className="loads-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            <option>Work</option>
            <option>Risk</option>
          </select>

          <button
            className="loads-btn"
            onClick={() => alert("New Load (hook this to your form later)")}
          >
            + New Load
          </button>
        </div>
      </div>

      <div className="loads-kpis">
        <div className="loads-kpi">
          <div className="loads-kpiLabel">Visible Loads</div>
          <div className="loads-kpiValue">{filtered.length}</div>
        </div>

        <div className="loads-kpi">
          <div className="loads-kpiLabel">Total Miles</div>
          <div className="loads-kpiValue">{totals.miles.toLocaleString()}</div>
        </div>

        <div className="loads-kpi">
          <div className="loads-kpiLabel">Total Rate</div>
          <div className="loads-kpiValue">
            ${totals.rate.toLocaleString()}
          </div>
        </div>

        <div className="loads-kpi">
          <div className="loads-kpiLabel">Avg RPM</div>
          <div className="loads-kpiValue">
            ${totals.avgRpm.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="loads-tableCard">
        <div className="loads-tableHeader">
          <div>DATE</div>
          <div>LOAD</div>
          <div>MILES</div>
          <div>RATE</div>
          <div>NET RPM</div>
          <div>STATUS</div>
        </div>

        {filtered.map((r) => (
          <div
            key={r.id}
            className="loads-row"
            onClick={() => alert(`Open ${r.id} (details drawer later)`)}
          >
            <div className="loads-date">{r.date}</div>

            <div className="loads-load">
              <div className="loads-id">{r.id}</div>
              <div className="loads-lane">{r.lane}</div>
              <div className="loads-broker">{r.broker}</div>
            </div>

            <div className="loads-num">{r.miles}</div>
            <div className="loads-num">${r.rate.toLocaleString()}</div>

            <div className="loads-rpm">
              <span className={r.rpm >= 2.20 ? "rpm-good" : "rpm-risk"}>
                ${r.rpm.toFixed(2)}
              </span>
            </div>

            <div className="loads-status">
              <span className={`pill ${r.status === "Work" ? "work" : "risk"}`}>
                <span className="dot">●</span>
                {r.status}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="loads-empty">No loads match your filters.</div>
        )}
      </div>
    </div>
  );
}
