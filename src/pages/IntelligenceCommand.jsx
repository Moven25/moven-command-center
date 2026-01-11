import React from "react";
import "./CommandShell.css";

export default function IntelligenceCommand() {
  return (
    <div className="command-shell">
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Strategy</div>
          <h1 className="command-shell__title">Intelligence Command</h1>
          <p className="command-shell__subtitle">
            Research lanes, brokers, markets, and performance — then turn insights into decisions.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button">
            Lane Research
          </button>
          <button className="command-shell__btn command-shell__btn--primary" type="button">
            Generate Brief
          </button>
        </div>
      </header>

      <section className="command-shell__grid">
        <div className="command-shell__card command-shell__card--wide">
          <div className="command-shell__cardTitle">Market Pulse</div>
          <div className="command-shell__placeholder">
            Placeholder: RPM trends, seasonal notes, top lanes, hot/cold markets.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Lane Profitability</div>
          <div className="command-shell__placeholder">
            Placeholder: net RPM, deadhead %, avg wait, quick score.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Broker Intelligence</div>
          <div className="command-shell__placeholder">
            Placeholder: pay history, responsiveness, notes, risk flags.
          </div>
        </div>

        <div className="command-shell__card">
          <div className="command-shell__cardTitle">Carrier Performance</div>
          <div className="command-shell__placeholder">
            Placeholder: on-time %, claims, detention patterns, utilization.
          </div>
        </div>
      </section>
    </div>
  );
}
