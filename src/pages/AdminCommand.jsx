// src/pages/AdminCommand.jsx
import React from "react";
import "./AdminCommand.css";

function AdminCommand() {
  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>Admin Command</h1>
          <p className="admin-subtitle">
            MOVEN control center for system health, data sync, and automations.
          </p>
        </div>
        <div className="admin-header-badge">
          <span className="badge-pill badge-live">SYSTEM: ONLINE</span>
          <span className="badge-pill badge-version">v0.1 • Builder Mode</span>
        </div>
      </header>

      {/* Main grid */}
      <div className="admin-grid">
        {/* System overview card */}
        <section className="admin-card admin-overview">
          <h2>System Overview</h2>
          <p className="card-description">
            High-level snapshot of MOVEN modules and status.
          </p>

          <div className="admin-metrics">
            <div className="metric">
              <span className="metric-label">Active Modules</span>
              <span className="metric-value">6 / 6</span>
              <span className="metric-note">Dashboard, Loads, Carrier, Broker, DTL, Learning</span>
            </div>

            <div className="metric">
              <span className="metric-label">Data Connections</span>
              <span className="metric-value metric-ok">OK</span>
              <span className="metric-note">Zoho Sheets • CSV Fetch • UI Shell</span>
            </div>

            <div className="metric">
              <span className="metric-label">Last Sync</span>
              <span className="metric-value">Manual</span>
              <span className="metric-note">Use tools below to trigger fresh syncs.</span>
            </div>
          </div>
        </section>

        {/* Data & sync tools */}
        <section className="admin-card admin-sync">
          <h2>Data & Sync Tools</h2>
          <p className="card-description">
            Trigger safe, manual refreshes while you’re still building the system.
          </p>

          <div className="button-group">
            <button className="btn-primary">Refresh Carrier Data (Zoho)</button>
            <button className="btn-primary">Refresh Broker Data (Zoho)</button>
            <button className="btn-primary">Refresh Load Command Data</button>
          </div>

          <div className="button-group">
            <button className="btn-outline">Rebuild Dashboard Snapshot</button>
            <button className="btn-outline">Recalculate DTL Preview</button>
          </div>

          <p className="helper-text">
            Later these buttons can call real APIs / Netlify functions. For now
            they’re your visual checklist of admin actions.
          </p>
        </section>

        {/* Alert & automation controls */}
        <section className="admin-card admin-alerts">
          <h2>Alerts & Automations</h2>
          <p className="card-description">
            Decide what MOVEN should warn you about once automations go live.
          </p>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">RPM Warning Alerts</div>
              <div className="toggle-note">
                Notify when loads drop below your target RPM.
              </div>
            </div>
            <div className="toggle-switch toggle-on">On</div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">DTL Cycle Alerts</div>
              <div className="toggle-note">
                Ping when it’s time to launch a new DTL / triangle week.
              </div>
            </div>
            <div className="toggle-switch toggle-on">Enabled</div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Home-Time Alerts</div>
              <div className="toggle-note">
                Flag loads that violate a driver’s home-time window.
              </div>
            </div>
            <div className="toggle-switch toggle-off">Planned</div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Email & SMS Automations</div>
              <div className="toggle-note">
                Control outbound messages to carriers and brokers.
              </div>
            </div>
            <div className="toggle-switch toggle-off">Builder Mode</div>
          </div>
        </section>

        {/* Account & system settings */}
        <section className="admin-card admin-account">
          <h2>Account & System Settings</h2>
          <p className="card-description">
            High-level owner settings separate from normal dispatcher options.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label>Owner / Admin Name</label>
              <input type="text" placeholder="MOVEN Owner" />
            </div>

            <div className="form-field">
              <label>Admin Email</label>
              <input type="email" placeholder="owner@example.com" />
            </div>

            <div className="form-field">
              <label>Dispatch Fee (%)</label>
              <input type="number" placeholder="10" />
            </div>

            <div className="form-field">
              <label>Default Currency</label>
              <select>
                <option>USD</option>
                <option>CAD</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>FMCSA Import Mode</label>
              <select>
                <option>Carriers Only</option>
                <option>Brokers Only</option>
                <option>Carriers & Brokers</option>
              </select>
            </div>

            <div className="form-field">
              <label>System Environment</label>
              <select>
                <option>Builder / Test</option>
                <option>Live Dispatch</option>
              </select>
            </div>
          </div>

          <div className="button-row-right">
            <button className="btn-primary">Save Admin Settings</button>
          </div>
        </section>

        {/* Dev / debug tools */}
        <section className="admin-card admin-dev">
          <h2>Developer & Debug Tools</h2>
          <p className="card-description">
            Notes for you and your brother when tweaking code, APIs, and sheets.
          </p>

          <ul className="dev-list">
            <li>
              <span className="dev-label">Last Zoho Fetch URL:</span>
              <span className="dev-value">/netlify/functions/fetch-sheets?sheet=loads</span>
            </li>
            <li>
              <span className="dev-label">CSV Status:</span>
              <span className="dev-value">Publishing from Zoho → CSV • OK</span>
            </li>
            <li>
              <span className="dev-label">React Shell:</span>
              <span className="dev-value">Sidebar + Routes working correctly</span>
            </li>
            <li>
              <span className="dev-label">Next Dev Task:</span>
              <span className="dev-value">
                Connect Load Command “Save” to Zoho (or local JSON) for testing.
              </span>
            </li>
          </ul>

          <div className="button-group">
            <button className="btn-outline">View System Checklist</button>
            <button className="btn-outline">Export Debug Notes</button>
          </div>
        </section>

        {/* Admin notes */}
        <section className="admin-card admin-notes">
          <h2>Admin Notes</h2>
          <p className="card-description">
            Drop running notes as you build MOVEN so nothing gets lost.
          </p>
          <textarea
            className="admin-notes-input"
            placeholder="Example: Connect FMCSA import, add factoring comparison, build carrier portal gauges, etc."
          />
          <div className="button-row-right">
            <button className="btn-outline">Save Notes (Future)</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminCommand;

