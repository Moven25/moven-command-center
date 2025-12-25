import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">

        <div className="card carrier-score">
          <h3>Live Carrier Data</h3>
          <div className="gauge-placeholder">84</div>
          <p>Carrier Performance Score</p>
        </div>

        <div className="card load-summary">
          <h3>Load Command Summary</h3>
          <ul>
            <li>Chicago → TX</li>
            <li>Atlanta → FL</li>
            <li>NY → IL</li>
          </ul>
        </div>

        <div className="card compliance">
          <h3>Compliance Command</h3>
          <ul>
            <li>Insurance ✔</li>
            <li>IFTA ⚠</li>
            <li>Medical ✖</li>
          </ul>
        </div>

        <div className="card alerts">
          <h3>Alerts Feed</h3>
          <p>No critical alerts</p>
        </div>

        <div className="card revenue-today">
          <h3>Revenue Today</h3>
          <div className="gauge-placeholder">73</div>
        </div>

        <div className="card revenue-week">
          <h3>Revenue This Week</h3>
          <div className="gauge-placeholder">33</div>
        </div>

      </div>
    </div>
  );
}
