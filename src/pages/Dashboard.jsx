import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <div className="dash-title">MOVEN Mission Control</div>
          <div className="dash-subtitle">Command Dashboard</div>
        </div>

        <div className="dash-actions">
          <button className="dash-btn">Sync</button>
          <button className="dash-btn dash-btn-primary">Profile</button>
        </div>
      </div>

      <div className="dash-grid">
        {/* Row 1 */}
        <div className="tile tile-gauge">
          <div className="tile-label">CARRIER SCORE</div>
          <div className="gauge">
            <div className="gauge-value">92</div>
            <div className="gauge-sub">On-time delivery, communication, safety trend.</div>
          </div>
        </div>

        <div className="tile tile-wide">
          <div className="tile-label">LOAD SUMMARY</div>
          <div className="tile-body">
            <div className="metric">
              <div className="metric-title">Active loads</div>
              <div className="metric-value">18</div>
            </div>
            <div className="metric">
              <div className="metric-title">On-time rate</div>
              <div className="metric-value">94%</div>
            </div>
            <div className="metric">
              <div className="metric-title">Avg RPM</div>
              <div className="metric-value">$2.31</div>
            </div>
          </div>
        </div>

        <div className="tile">
          <div className="tile-label">COMPLIANCE</div>
          <ul className="tile-list">
            <li>HOS violations: 7%</li>
            <li>DOT audits: 2</li>
            <li>Open inspections: 1</li>
          </ul>
        </div>

        {/* Row 2 */}
        <div className="tile tile-wide2">
          <div className="tile-label">ACTIVE ALERTS</div>
          <ul className="tile-list">
            <li>2 loads at risk of late delivery</li>
            <li>4 carriers require check-in</li>
            <li>1 weather disruption flagged</li>
          </ul>
        </div>

        <div className="tile tile-money">
          <div className="tile-label">REVENUE TODAY</div>
          <div className="money">
            <div className="money-value">$84k</div>
            <div className="money-sub">Target: $90k</div>
          </div>
        </div>

        <div className="tile tile-money">
          <div className="tile-label">REVENUE THIS WEEK</div>
          <div className="money">
            <div className="money-value">$412k</div>
            <div className="money-sub">Target: $450k</div>
          </div>
        </div>
      </div>
    </div>
  );
}
