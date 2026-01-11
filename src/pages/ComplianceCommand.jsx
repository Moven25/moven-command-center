import React from "react";
import "./CommandShell.css";

export default function ComplianceCommand() {
  return (
    <div className="command-shell">
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Money & Risk</div>
          <h1 className="command-shell__title">Compliance Command</h1>
          <p className="command-shell__subtitle">
            Monitor expirations, documents, insurance, and risk signals — before they become shutdowns.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button">
            Add Reminder
          </button>
          <button className="command-shell__btn command-shell__btn--primary" type="button">
            Run Audit
          </button>
        </div>
      </header>

      <section className="command-shell__grid">
        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Expiring Soon</div>
          <div className="command-shell__placeholder">
            Placeholder: list of items expiring in 30/14/7 days.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Missing Docs</div>
          <div className="command-shell__placeholder">
            Placeholder: drivers, W-9, COI, authority, agreements.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Insurance Snapshot</div>
          <div className="command-shell__placeholder">
            Placeholder: coverage levels + last verified date.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Alerts</div>
          <div className="command-shell__placeholder">
            Placeholder: high-risk events, lapses, violations, urgent follow-ups.
          </div>
        </div>
      </section>
    </div>
  );
}
