import "./Dashboard.css";

function Gauge({ value = 92, label = "Carrier Score", sublabel = "On-time delivery, communication, safety trend." }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="gauge">
      <svg className="gauge__svg" viewBox="0 0 120 120" aria-label={`${label} ${clamped}`}>
        <circle className="gauge__track" cx="60" cy="60" r={radius} />
        <circle
          className="gauge__value"
          cx="60"
          cy="60"
          r={radius}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      <div className="gauge__center">
        <div className="gauge__number">{clamped}</div>
        <div className="gauge__label">{label}</div>
      </div>

      <div className="gauge__sub">{sublabel}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="mc-dashboard" data-mockup="dashboard-locked-v2">
      {/* Top header (matches mockup “Mission Control” bar) */}
      <div className="mc-header">
        <div className="mc-header__left">
          <div className="mc-header__title">MOVEN Mission Control</div>
          <div className="mc-header__subtitle">Command Dashboard</div>
        </div>

        <div className="mc-header__right">
          <button className="mc-btn" type="button">
            Sync
          </button>
          <button className="mc-btn mc-btn--ghost" type="button">
            Profile
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mc-grid">
        {/* CARRIER SCORE (Gauge) */}
        <section className="mc-card mc-card--carrier">
          <div className="mc-card__head">
            <div className="mc-card__title">CARRIER SCORE</div>
          </div>
          <div className="mc-card__body">
            <Gauge value={92} label="Carrier Score" sublabel="On-time delivery, communication, safety trend." />
          </div>
        </section>

        {/* LOAD SUMMARY */}
        <section className="mc-card mc-card--load">
          <div className="mc-card__head">
            <div className="mc-card__title">LOAD SUMMARY</div>
          </div>
          <div className="mc-card__body">
            <div className="mc-stats">
              <Stat label="Active loads" value="18" />
              <Stat label="On-time rate" value="94%" />
              <Stat label="Avg RPM" value="$2.31" />
            </div>
          </div>
        </section>

        {/* COMPLIANCE */}
        <section className="mc-card mc-card--compliance">
          <div className="mc-card__head">
            <div className="mc-card__title">COMPLIANCE</div>
          </div>
          <div className="mc-card__body">
            <ul className="mc-list">
              <li>HOS violations: <strong>7%</strong></li>
              <li>DOT audits: <strong>2</strong></li>
              <li>Open inspections: <strong>1</strong></li>
            </ul>
          </div>
        </section>

        {/* ACTIVE ALERTS (Wide) */}
        <section className="mc-card mc-card--alerts">
          <div className="mc-card__head">
            <div className="mc-card__title">ACTIVE ALERTS</div>
          </div>
          <div className="mc-card__body">
            <ul className="mc-list">
              <li>2 loads at risk of late delivery</li>
              <li>4 carriers require check-in</li>
              <li>1 weather disruption flagged</li>
            </ul>
          </div>
        </section>

        {/* REVENUE TODAY */}
        <section className="mc-card mc-card--revToday">
          <div className="mc-card__head">
            <div className="mc-card__title">REVENUE TODAY</div>
          </div>
          <div className="mc-card__body mc-kpi">
            <div className="mc-kpi__value">$84k</div>
            <div className="mc-kpi__sub">Target: $90k</div>
          </div>
        </section>

        {/* REVENUE THIS WEEK */}
        <section className="mc-card mc-card--revWeek">
          <div className="mc-card__head">
            <div className="mc-card__title">REVENUE THIS WEEK</div>
          </div>
          <div className="mc-card__body mc-kpi">
            <div className="mc-kpi__value">$412k</div>
            <div className="mc-kpi__sub">Target: $450k</div>
          </div>
        </section>
      </div>
    </div>
  );
}
