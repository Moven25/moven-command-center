// src/pages/DTL.jsx
import { useState } from "react";
import "./DTL.css";

function DTL() {
  const [triangleType, setTriangleType] = useState("primary");

  const isPrimary = triangleType === "primary";

  return (
    <div className="page dtl-page">
      {/* HEADER */}
      <header className="page-header">
        <div>
          <h1>DTL Command</h1>
          <p>
            Double Triangle Lane routing tuned for headhaul first, home-time
            protected, and profit-forward planning.
          </p>
        </div>

        <div className="dtl-header-right">
          <div className="badge badge-red">MOVEN DTL · Double Triangle</div>
          <div className="badge badge-outline">
            Ideal start: Mon 8–11 AM · Backup: Tue AM
          </div>
        </div>
      </header>

      {/* TOP GRID */}
      <section className="dtl-top-grid">
        {/* Carrier Snapshot */}
        <div className="card dtl-card">
          <h2 className="card-title">Carrier Snapshot</h2>
          <div className="dtl-card-body two-col">
            <div className="field">
              <label>Carrier</label>
              <input type="text" placeholder="Example Transport LLC" />
            </div>
            <div className="field">
              <label>Home Terminal (City)</label>
              <input type="text" placeholder="Atlanta, GA" />
            </div>

            <div className="field">
              <label>Equipment</label>
              <input type="text" placeholder="53' Dry Van" />
            </div>
            <div className="field">
              <label>Next Home Time Window</label>
              <input type="text" placeholder="Fri 18:00 – Sun 10:00" />
            </div>

            <div className="field">
              <label>Target Weekly Revenue</label>
              <input type="text" placeholder="$6,500+" />
            </div>
            <div className="field">
              <label>Target Avg RPM (All miles)</label>
              <input type="text" placeholder="$2.25+ headhaul" />
            </div>
          </div>
        </div>

        {/* DTL Performance Snapshot */}
        <div className="card dtl-card">
          <h2 className="card-title">DTL Performance Snapshot</h2>
          <div className="dtl-card-body dtl-metrics">
            <div className="metric">
              <span className="metric-label">Avg RPM (Triangle)</span>
              <span className="metric-value">$2.55</span>
              <span className="metric-sub">Target: $2.25+ all miles</span>
              <div className="metric-bar">
                <div className="metric-bar-fill good" style={{ width: "78%" }} />
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Deadhead %</span>
              <span className="metric-value">7%</span>
              <span className="metric-sub">Goal: under 10%</span>
              <div className="metric-bar">
                <div className="metric-bar-fill ok" style={{ width: "40%" }} />
              </div>
            </div>

            <div className="metric metric-row">
              <div>
                <span className="metric-label">DTL Score</span>
                <span className="metric-value">92</span>
                <span className="metric-sub">Route strength &amp; risk</span>
              </div>
              <div>
                <span className="metric-label">Weekly Revenue</span>
                <span className="metric-value">$6,225</span>
                <span className="metric-sub">2× DTL cycles, 3 legs each</span>
              </div>
            </div>
          </div>
        </div>

        {/* DTL Rules */}
        <div className="card dtl-card dtl-rules-card">
          <h2 className="card-title">DTL Rules</h2>
          <ul className="dtl-rules-list">
            <li>Start: Mon 8–11 AM for max freight volume.</li>
            <li>Backup: Tue DTL start if Monday misses.</li>
            <li>Avoid new DTL launches Thu–Fri.</li>
            <li>Protect home time one every 2–3 cycles.</li>
            <li>Use strong outbound markets as anchors.</li>
            <li>Prioritize RPM &amp; reload density over miles only.</li>
          </ul>
        </div>
      </section>

      {/* BOTTOM GRID */}
      <section className="dtl-bottom-grid">
        {/* ROUTE PLANNER */}
        <div className="card dtl-card dtl-route-planner">
          <div className="section-header">
            <div>
              <h2 className="card-title">DTL Route Planner</h2>
              <p className="section-subtitle">
                Build and compare double triangle cycles. MOVEN prioritizes
                headhaul RPM, reload density, and home-time windows.
              </p>
            </div>
            <div className="pill-toggle">
              <button
                className={
                  triangleType === "primary" ? "pill-button active" : "pill-button"
                }
                onClick={() => setTriangleType("primary")}
                type="button"
              >
                Primary Triangle
              </button>
              <button
                className={
                  triangleType === "alternate" ? "pill-button active" : "pill-button"
                }
                onClick={() => setTriangleType("alternate")}
                type="button"
              >
                Alternate Triangle
              </button>
            </div>
          </div>

          <div className="dtl-legs-grid">
            {/* Leg 1 */}
            <div className="dtl-leg">
              <h3>Leg 1 — Outbound Headhaul</h3>
              <div className="field">
                <label>Origin</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Home → Strong headhaul market" : "Home → Alt headhaul market"}
                />
              </div>
              <div className="field">
                <label>Destination</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Atlanta, GA → Chicago, IL" : "Atlanta, GA → Columbus, OH"}
                />
              </div>

              <div className="dtl-leg-row">
                <div className="field">
                  <label>Miles</label>
                  <input type="text" placeholder={isPrimary ? "720" : "610"} />
                </div>
                <div className="field">
                  <label>Rate ($)</label>
                  <input type="text" placeholder={isPrimary ? "2050" : "1850"} />
                </div>
                <div className="field">
                  <label>RPM</label>
                  <input type="text" placeholder={isPrimary ? "$2.84" : "$3.03"} />
                </div>
              </div>

              <div className="chip-row">
                <span className="chip chip-green">Primary headhaul</span>
                <span className="chip chip-amber">High demand</span>
              </div>
            </div>

            {/* Leg 2 */}
            <div className="dtl-leg">
              <h3>Leg 2 — Mid Triangle</h3>
              <div className="field">
                <label>Origin</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Chicago, IL" : "Columbus, OH"}
                />
              </div>
              <div className="field">
                <label>Destination</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Dallas, TX" : "Memphis, TN"}
                />
              </div>

              <div className="dtl-leg-row">
                <div className="field">
                  <label>Miles</label>
                  <input type="text" placeholder={isPrimary ? "650" : "520"} />
                </div>
                <div className="field">
                  <label>Rate ($)</label>
                  <input type="text" placeholder={isPrimary ? "2375" : "1900"} />
                </div>
                <div className="field">
                  <label>RPM</label>
                  <input type="text" placeholder={isPrimary ? "$2.50" : "$3.65"} />
                </div>
              </div>

              <div className="chip-row">
                <span className="chip chip-blue">Good reload market</span>
                <span className="chip chip-amber">Positioning</span>
              </div>
            </div>

            {/* Leg 3 */}
            <div className="dtl-leg">
              <h3>Leg 3 — Return Triangle</h3>
              <div className="field">
                <label>Origin</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Dallas, TX" : "Memphis, TN"}
                />
              </div>
              <div className="field">
                <label>Destination</label>
                <input
                  type="text"
                  placeholder={isPrimary ? "Atlanta, GA (Home)" : "Atlanta, GA (Home)"}
                />
              </div>

              <div className="dtl-leg-row">
                <div className="field">
                  <label>Miles</label>
                  <input type="text" placeholder={isPrimary ? "780" : "690"} />
                </div>
                <div className="field">
                  <label>Rate ($)</label>
                  <input type="text" placeholder={isPrimary ? "1800" : "1650"} />
                </div>
                <div className="field">
                  <label>RPM</label>
                  <input type="text" placeholder={isPrimary ? "$2.31" : "$2.39"} />
                </div>
              </div>

              <div className="chip-row">
                <span className="chip chip-purple">Return-to-base</span>
                <span className="chip chip-amber">Watch RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY CYCLE */}
        <div className="card dtl-card dtl-weekly-cycle">
          <h2 className="card-title">DTL Weekly Cycle</h2>
          <p className="section-subtitle">
            Build around home-time windows. Keep start day and reset timing
            locked in.
          </p>

          <div className="week-grid">
            <div className="day">
              <span className="day-label">Mon</span>
              <span className="day-main">DTL Leg 1</span>
              <span className="day-sub">Outbound headhaul</span>
            </div>
            <div className="day">
              <span className="day-label">Tue</span>
              <span className="day-main">DTL Leg 2</span>
              <span className="day-sub">Positioning / reload</span>
            </div>
            <div className="day">
              <span className="day-label">Wed</span>
              <span className="day-main">DTL Leg 3</span>
              <span className="day-sub">Return toward home</span>
            </div>
            <div className="day">
              <span className="day-label">Thu</span>
              <span className="day-main">Buffer / extra headhaul</span>
              <span className="day-sub">Optional bonus load</span>
            </div>
            <div className="day">
              <span className="day-label">Fri</span>
              <span className="day-main">Home time anchor</span>
              <span className="day-sub">Protect arrival</span>
            </div>
            <div className="day">
              <span className="day-label">Sat</span>
              <span className="day-main">Home time</span>
              <span className="day-sub">Reset, maintenance</span>
            </div>
            <div className="day">
              <span className="day-label">Sun</span>
              <span className="day-main">Light reload</span>
              <span className="day-sub">Stage for Mon DTL</span>
            </div>
          </div>
        </div>

        {/* RISK MATRIX */}
        <div className="card dtl-card dtl-risk-matrix">
          <h2 className="card-title">Risk Matrix</h2>
          <p className="section-subtitle">
            Keep eyes on the most important DTL risks before committing.
          </p>

          <div className="risk-row">
            <div className="risk-labels">
              <span className="risk-name">Weather Risk</span>
              <span className="risk-sub">
                Snow/ice or storm risk on planned lanes.
              </span>
            </div>
            <div className="risk-bar">
              <div className="risk-bar-fill ok" style={{ width: "55%" }} />
            </div>
            <span className="risk-score">Moderate</span>
          </div>

          <div className="risk-row">
            <div className="risk-labels">
              <span className="risk-name">Reload Density</span>
              <span className="risk-sub">
                Strong reloads in CHI, DAL; ATL home is stable.
              </span>
            </div>
            <div className="risk-bar">
              <div className="risk-bar-fill good" style={{ width: "82%" }} />
            </div>
            <span className="risk-score good-text">Strong</span>
          </div>

          <div className="risk-row">
            <div className="risk-labels">
              <span className="risk-name">RPM Volatility</span>
              <span className="risk-sub">
                Leg 3 more sensitive to market dips — monitor board.
              </span>
            </div>
            <div className="risk-bar">
              <div className="risk-bar-fill warn" style={{ width: "60%" }} />
            </div>
            <span className="risk-score warn-text">Watch</span>
          </div>

          <div className="risk-row">
            <div className="risk-labels">
              <span className="risk-name">Home-Time Risk</span>
              <span className="risk-sub">
                Protect Fri PM arrival; avoid late Wed/Thu pickups.
              </span>
            </div>
            <div className="risk-bar">
              <div className="risk-bar-fill good" style={{ width: "74%" }} />
            </div>
            <span className="risk-score good-text">Protected</span>
          </div>
        </div>

        {/* DISPATCHER NOTES */}
        <div className="card dtl-card dtl-notes">
          <h2 className="card-title">Dispatcher Notes</h2>
          <p className="section-subtitle">
            Capture playbook notes so future DTL runs get smarter over time.
          </p>
          <textarea
            className="notes-input"
            placeholder="What worked, which brokers paid best on this cycle, where reloads were strongest, and what you'd change next week..."
          />
        </div>
      </section>
    </div>
  );
}

export default DTL;
