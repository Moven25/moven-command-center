import "./BrokerCommand.css";

function BrokerCommand() {
  return (
    <div className="broker-page">
      <h1>Broker Command</h1>
      <p className="page-subtitle">
        Evaluate brokers, check risk, score performance, and verify MC safety.
      </p>

      <div className="broker-grid">

        {/* ==== BROKER INFO CARD ==== */}
        <div className="card">
          <h2>Broker Information</h2>

          <div className="form-row">
            <div className="form-field">
              <label>Broker Name</label>
              <input type="text" placeholder="TQL, CH Robinson, etc." />
            </div>

            <div className="form-field">
              <label>Broker MC #</label>
              <input type="text" placeholder="123456" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Contact Name</label>
              <input type="text" placeholder="Rep Name" />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input type="text" placeholder="(555) 555-5555" />
            </div>
          </div>

          <div className="form-field full-width">
            <label>Email</label>
            <input type="email" placeholder="rep@broker.com" />
          </div>
        </div>

        {/* ==== RISK + PERFORMANCE ==== */}
        <div className="card">
          <h2>Risk & Performance Score</h2>

          <div className="form-field">
            <label>Credit Score</label>
            <input type="text" placeholder="MODAL/123? etc." />
          </div>

          <div className="form-field">
            <label>Avg Pay Days</label>
            <input type="text" placeholder="28 days, 40 days, etc." />
          </div>

          <div className="form-field">
            <label>Cancellation Rate (%)</label>
            <input type="text" placeholder="0–15%" />
          </div>

          <div className="form-field">
            <label>Notes</label>
            <textarea
              placeholder="Issues, reps to avoid, special requirements..."
            ></textarea>
          </div>
        </div>

        {/* ==== SAFETY & VERIFICATION ==== */}
        <div className="card">
          <h2>Safety & Compliance</h2>

          <div className="form-field">
            <label>FMCSA Status</label>
            <input type="text" placeholder="Active / Revoked / Suspended" />
          </div>

          <div className="form-field">
            <label>Bond Amount</label>
            <input type="text" placeholder="$75,000 (required)" />
          </div>

          <div className="form-field">
            <label>Insurance Verified?</label>
            <select>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          <div className="form-field">
            <label>Internal MOVEN Notes</label>
            <textarea placeholder="Payment issues, slow response, etc."></textarea>
          </div>
        </div>
      </div>

      <button className="save-btn">Save Broker Profile</button>
    </div>
  );
}

export default BrokerCommand;

