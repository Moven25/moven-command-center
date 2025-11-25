import "./BrokerCommand.css"; // temporary shared styling

function Settings() {
  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">
        System preferences, account settings, and UI options.
      </p>

      <div className="settings-grid">

        {/* UI / THEME SETTINGS */}
        <div className="card">
          <h2 className="section-title">UI Theme</h2>
          <div className="form-row">
            <select className="input-field">
              <option>Dark Mode</option>
              <option>Light Mode</option>
              <option>Auto</option>
            </select>
          </div>
        </div>

        {/* SYSTEM BEHAVIOR */}
        <div className="card">
          <h2 className="section-title">System Behavior</h2>
          <div className="form-row">
            <label>Default Dashboard View</label>
            <select className="input-field">
              <option>Performance Snapshot</option>
              <option>Markets & Lanes</option>
              <option>Latest Activity</option>
            </select>
          </div>

          <div className="form-row">
            <label>Default DTL Start Day</label>
            <select className="input-field">
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
            </select>
          </div>

          <div className="form-row">
            <label>Weekly Reset Time</label>
            <select className="input-field">
              <option>Sun 10:00 PM</option>
              <option>Sun Midnight</option>
              <option>Mon 6 AM</option>
            </select>
          </div>
        </div>

        {/* ALERTS & NOTIFICATIONS */}
        <div className="card">
          <h2 className="section-title">Alerts & Notifications</h2>
          <div className="form-row">
            <label>RPM Warning Alert</label>
            <select className="input-field">
              <option>On</option>
              <option>Off</option>
            </select>
          </div>

          <div className="form-row">
            <label>DTL Cycle Alerts</label>
            <select className="input-field">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>

          <div className="form-row">
            <label>Home-Time Alerts</label>
            <select className="input-field">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="card">
          <h2 className="section-title">Account Settings</h2>

          <div className="form-row">
            <label>User Name</label>
            <input className="input-field" placeholder="Dispatcher / Admin" />
          </div>

          <div className="form-row">
            <label>Contact Email</label>
            <input className="input-field" placeholder="you@example.com" />
          </div>

          <div className="form-row">
            <label>FMCSA Import Mode</label>
            <select className="input-field">
              <option>Carriers Only</option>
              <option>Brokers Only</option>
              <option>Carriers + Brokers</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
