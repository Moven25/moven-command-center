import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dash-grid">
      {/* LIVE CARRIER DATA */}
      <section className="card card-live">
        <header className="card-header">
          <h2>Live Carrier Data</h2>
        </header>

        <div className="live-main">
          <div className="live-gauge">
            <div className="gauge-arc" />
              <Gauge value={carrierScore} label="Carrier Performance Score" />
            </div>

            <ul className="mc-stat-list">
              <li>
                <span className="mc-stat-label">Live Carriers</span>
                <span className="mc-stat-value">{liveCarriers.toLocaleString()}</span>
              </li>
              <li>
                <span className="mc-stat-label">Insurance Alerts</span>
                <span className="mc-stat-value">{insuranceAlerts}</span>
              </li>
              <li>
                <span className="mc-stat-label">Compliance Warnings</span>
                <span className="mc-stat-value">{complianceWarnings}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Load Command Summary */}
        <div className="mc-panel mc-panel--loads">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Load Command Summary</h2>
          </header>

          <div className="mc-panel-body">
            <div className="mc-table">
              <div className="mc-table-row mc-table-row--head">
                <div>Load ID</div>
                <div>Origin</div>
                <div>Pickup</div>
                <div>Delivery</div>
                <div>RPM</div>
                <div>Suggested Score</div>
              </div>
              {MOCK_LOADS.map((load) => (
                <div className="mc-table-row" key={load.id}>
                  <div>{load.id}</div>
                  <div>{load.origin}</div>
                  <div>{load.pickup}</div>
                  <div>{load.delivery}</div>
                  <div>{load.rpm.toFixed(2)}</div>
                  <div>
                    <span className="mc-pill mc-pill--score">{load.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Command */}
        <div className="mc-panel mc-panel--compliance">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Compliance Command</h2>
          </header>

          <div className="mc-panel-body mc-panel-body--compliance">
            <div className="mc-compliance-row">
              <span className="mc-status-dot mc-status-dot--good" />
              <span className="mc-compliance-label">Insurance</span>
            </div>
            <div className="mc-compliance-row">
              <span className="mc-status-dot mc-status-dot--warn" />
              <span className="mc-compliance-label">Permits</span>
            </div>
            <div className="mc-compliance-row">
              <span className="mc-status-dot mc-status-dot--warn" />
              <span className="mc-compliance-label">IFTA</span>
            </div>
            <div className="mc-compliance-row">
              <span className="mc-status-dot mc-status-dot--bad" />
              <span className="mc-compliance-label">Medical</span>
            </div>
          </div>
        </div>

        {/* Weather Command */}
        <div className="mc-panel mc-panel--weather">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Weather Command</h2>
          </header>

          <div className="mc-panel-body">
            <ul className="mc-stat-list">
              <li>
                <span className="mc-stat-label">Active Loads</span>
                <span className="mc-stat-value">{activeLoads}</span>
              </li>
              <li>
                <span className="mc-stat-label">Loads This Week</span>
                <span className="mc-stat-value">{loadsThisWeek}</span>
              </li>
              <li>
                <span className="mc-stat-label">Total Loaded Miles</span>
                <span className="mc-stat-value">{totalMiles}</span>
              </li>
              <li>
                <span className="mc-stat-label">Weather Alerts</span>
                <span className="mc-stat-value">{weatherAlerts}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Market Command */}
        <div className="mc-panel mc-panel--market">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Market Command</h2>
          </header>

          <div className="mc-panel-body mc-panel-body--market">
            <div className="mc-market-row">
              <span className="mc-stat-label">Market</span>
              <span className="mc-market-tag">{marketTemp}</span>
            </div>
            <div className="mc-market-legend">
              <div className="mc-legend-item">
                <span className="mc-legend-dot mc-legend-dot--good" />
                <span>Cold markers</span>
              </div>
              <div className="mc-legend-item">
                <span className="mc-legend-dot mc-legend-dot--warn" />
                <span>Volume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today’s Priorities */}
        <div className="mc-panel mc-panel--priorities">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Today&apos;s Priorities</h2>
          </header>

          <div className="mc-panel-body">
            <ul className="mc-priority-list">
              {TODAY_PRIORITIES.map((item, idx) => (
                <li key={item}>
                  <span className={`mc-priority-dot mc-priority-dot-${idx}`} />
                  <span className="mc-priority-label">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="mc-panel mc-panel--alerts">
          <header className="mc-panel-header">
            <h2 className="mc-panel-title">Alerts Feed</h2>
          </header>

          <div className="mc-panel-body mc-panel-body--alerts">
            <ul className="mc-alert-list">
              {ALERT_FEED.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Load Score + Revenue + DTL row */}
        <div className="mc-panel mc-panel--load-score">
          <header className="mc-panel-header mc-panel-header--compact">
            <h2 className="mc-panel-title">Load Score</h2>
          </header>
          <div className="mc-panel-body mc-panel-body--gauge">
            <Gauge value={loadScore} label="Revenue Today" />
          </div>
        </div>

        <div className="mc-panel mc-panel--revenue">
          <header className="mc-panel-header mc-panel-header--compact">
            <h2 className="mc-panel-title">Revenue This Week</h2>
          </header>
          <div className="mc-panel-body mc-panel-body--revenue">
            <div className="mc-revenue-row">
              <span className="mc-stat-label">Revenue Today</span>
              <span className="mc-stat-value">
                ${revenueToday.toLocaleString()}
              </span>
            </div>
            <div className="mc-revenue-row">
              <span className="mc-stat-label">This Week</span>
              <span className="mc-stat-value">
                ${revenueThisWeek.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mc-panel mc-panel--dtl">
          <header className="mc-panel-header mc-panel-header--compact">
            <h2 className="mc-panel-title">DTL</h2>
          </header>
          <div className="mc-panel-body mc-panel-body--dtl">
            <p className="mc-dtl-text">
              Double Triangle Routing scanning your priority lanes for profitable
              double-tri hauls each week.
            </p>
          </div>
        </div>
      {/* Bottom action bar (Add Carrier / Add Load / Run DTL Scan / Sync Sheets / Emergency Alert) */}
      <footer className="mc-footer-bar">
        <button type="button">Add Carrier</button>
        <button type="button">Add Load</button>
        <button type="button">Run DTL Scan</button>
        <button type="button">Sync Sheets</button>
        <button type="button" className="mc-footer-danger">
          Emergency Alert
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;

