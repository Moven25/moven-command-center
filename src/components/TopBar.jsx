export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topLeft">Week of Jan 6</div>

      <div className="topCenter">
        <div className="topMetric">
          <div className="muted small">Active Trucks</div>
          <div className="topMetricValue">14</div>
        </div>

        <div className="topMetric">
          <div className="muted small">Weekly Gross</div>
          <div className="topMetricValue">$8,750</div>
        </div>
      </div>

      <div className="topRight">
        <div className="statusPill">Healthy</div>
        <button className="iconBtn" type="button" title="Pop out">
          ↗
        </button>
        <button className="iconBtn" type="button" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
