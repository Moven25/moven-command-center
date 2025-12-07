import React, { useState, useEffect } from "react";

export default function CarrierCommand() {
  const [carrier, setCarrier] = useState({ carrierName: "", mcNumber: "", trucks: "1", preferredLanes: "", homeTerminalCity: "", minRatePerMile: "", targetRatePerMile: "", factoringCompany: "", factoringTerms: "", eldProvider: "", notes: "" });
  const [status, setStatus] = useState({ isActive: true, thisWeekRevenue: "", lastWeekRevenue: "", onTimePercentage: "", riskNotes: "" });
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  const trucks = Number(carrier.trucks) || 0;
  const thisWeekRev = Number(status.thisWeekRevenue) || 0;
  const lastWeekRev = Number(status.lastWeekRevenue) || 0;
  const avgRevPerTruck = trucks > 0 ? (thisWeekRev / trucks).toFixed(2) : "0";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/.netlify/functions/fetch-sheets?sheet=carriers");
        if (!res.ok) return setCarriers([]);
        const csv = await res.text();
        const lines = csv.replace(/\r/g, "").trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const parsed = lines.slice(1).map((ln) => {
          const cols = ln.split(",").map((c) => c.trim());
          const obj = {};
          headers.forEach((h, i) => (obj[h] = cols[i] || ""));
          return obj;
        });
        setCarriers(parsed);
      } catch (err) {
        console.error(err);
        setCarriers([]);
      }
    }
    load();
  }, []);

  const handleCarrierChange = (e) => setCarrier((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleStatusChange = (e) => setStatus((p) => ({ ...p, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const handleSelectCarrier = (e) => {
    const id = e.target.value;
    setSelectedCarrierId(id);
    const found = carriers.find((c) => c.Carrier_ID === id);
    if (!found) return;
    setCarrier((p) => ({ ...p, carrierName: found.Carrier_Name || "", mcNumber: found.MC || "", contactPhone: found.Phone || "", email: found.Email || "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch("/.netlify/functions/save-carrier", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carrierId: selectedCarrierId, carrier, status }) });
      alert("Saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <main className="main-content carrier-page">
      <h1>Carrier Command</h1>
      <p className="page-subtitle">Carrier setup and MOVEN metrics.</p>

      <div className="carrier-selector-row" style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Select Carrier:</label>
        <select value={selectedCarrierId} onChange={handleSelectCarrier}>
          <option value="">-- Select Carrier --</option>
          {carriers.map((c) => (
            <option key={c.Carrier_ID} value={c.Carrier_ID}>{c.Carrier_Name}</option>
          ))}
        </select>
      </div>

      <div className="carrier-grid">
        <form className="card" onSubmit={handleSave}>
          <h2>Carrier Profile</h2>
          <div className="form-row">
            <div className="form-field"><label>Carrier Name</label><input name="carrierName" value={carrier.carrierName} onChange={handleCarrierChange} /></div>
            <div className="form-field"><label>MC #</label><input name="mcNumber" value={carrier.mcNumber} onChange={handleCarrierChange} /></div>
          </div>

          <div className="form-row">
            <div className="form-field"><label>Primary Contact</label><input name="primaryContact" value={carrier.primaryContact} onChange={handleCarrierChange} /></div>
            <div className="form-field"><label>Phone</label><input name="contactPhone" value={carrier.contactPhone} onChange={handleCarrierChange} /></div>
          </div>

          <div className="form-row"><button type="submit" className="primary-btn">Save Carrier Profile</button></div>
        </form>

        <div className="card">
          <h2>MOVEN Metrics</h2>
          <div className="form-row"><label className="toggle"><input type="checkbox" name="isActive" checked={status.isActive} onChange={handleStatusChange} /> <span>Carrier Active on MOVEN</span></label></div>
          <div className="metrics-grid">
            <div className="metric"><div className="metric-label">Avg Rev / Truck</div><div className="metric-value">${avgRevPerTruck}</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}

            <div className="form-field">
              <label>Risk Notes / Special Instructions</label>
              <textarea name="riskNotes" value={status.riskNotes} onChange={handleStatusChange} rows={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="carrier-summary">MOVEN will use this profile later to <strong>filter loads, protect RPM, and plan DTL / triangle routes</strong> around <strong>{carrier.homeTerminalCity || 'home base'}</strong> and <strong>{carrier.preferredLanes || 'your preferred lanes'}</strong>.</div>
    </main>
  );
}

export default CarrierCommand;
          <div className="form-row">
            <div className="form-field">
              <label>Factoring Company</label>
              <input
                type="text"
                name="factoringCompany"
                value={carrier.factoringCompany}
                onChange={handleCarrierChange}
                placeholder="e.g. RTS, OTR, Triumph"
              />
            </div>

            <div className="form-field">
              <label>Factoring Terms</label>
              <input
                type="text"
                name="factoringTerms"
                value={carrier.factoringTerms}
                onChange={handleCarrierChange}
                placeholder="3% fee, 90% advance, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>ELD Provider</label>
              <input
                type="text"
                name="eldProvider"
                value={carrier.eldProvider}
                onChange={handleCarrierChange}
                placeholder="KeepTruckin, Samsara, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Internal MOVEN Notes</label>
              <textarea
                name="notes"
                value={carrier.notes}
                onChange={handleCarrierChange}
                rows={3}
                placeholder="Anything that helps you dispatch smarter for this carrier."
              />
            </div>
          </div>

          <button type="submit" className="primary-btn">
            Save Carrier Profile
          </button>
        </form>

        {/* RIGHT SIDE — live MOVEN metrics & risk */}
        <div className="card">
          <h2>MOVEN Metrics</h2>

          <div className="form-row">
            <label className="toggle">
              <input
                type="checkbox"
                name="isActive"
                checked={status.isActive}
                onChange={handleStatusChange}
              />
              <span>Carrier Active on MOVEN</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Current Market</label>
              <input
                type="text"
                name="currentMarket"
                value={status.currentMarket}
                onChange={handleStatusChange}
                placeholder="e.g. Atlanta, GA"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Next Home Time</label>
              <input
                type="date"
                name="nextHomeTime"
                value={status.nextHomeTime}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>This Week Revenue ($)</label>
              <input
                type="number"
                name="thisWeekRevenue"
                value={status.thisWeekRevenue}
                onChange={handleStatusChange}
              />
            </div>

            <div className="form-field">
              <label>Last Week Revenue ($)</label>
              <input
                type="number"
                name="lastWeekRevenue"
                value={status.lastWeekRevenue}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>On-Time %</label>
              <input
                type="number"
                name="onTimePercentage"
                value={status.onTimePercentage}
                onChange={handleStatusChange}
              />
            </div>

            <div className="form-field">
              <label>Safety Score</label>
              <input
                type="text"
                name="safetyScore"
                value={status.safetyScore}
                onChange={handleStatusChange}
                placeholder="Green / Yellow / Red"
              />
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-label">Avg Rev / Truck (This Week)</div>
              <div className="metric-value">${avgRevPerTruck}</div>
            </div>

            <div className="metric">
              <div className="metric-label">RPM Band (Min → Target)</div>
              <div className="metric-value">{rpmBand}</div>
            </div>

            <div className="metric">
              <div className="metric-label">Revenue Trend</div>
              <div className="metric-value">
                {trend === "up" && "⬆ Up"}
                {trend === "down" && "⬇ Down"}
                {trend === "flat" && "➡ Flat"}
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">MOVEN Health</div>
              <div className="metric-value">
                <span
                  className={
                    health === "green"
                      ? "badge badge-green"
                      : health === "yellow"
                      ? "badge badge-yellow"
                      : "badge badge-red"
                  }
                >
                  {health === "green"
                    ? "Prime"
                    : health === "yellow"
                    ? "Watch"
                    : "At Risk"}
                </span>
              </div>
            </div>
          </div>

          <h3 className="section-title">Risk &amp; Alerts</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Risk Notes / Special Instructions</label>
              <textarea
                name="riskNotes"
                value={status.riskNotes}
                onChange={handleStatusChange}
                rows={3}
                placeholder="Breakdown history, cancellations, special broker notes, etc."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="carrier-summary">
        MOVEN will use this profile later to **filter loads, protect RPM, and
        plan DTL / triangle routes** around{" "}
        <strong>{carrier.homeTerminalCity || "home base"}</strong> and{" "}
        <strong>{carrier.preferredLanes || "your preferred lanes"}</strong>.
      </div>
    </main>
  );

// Simple CSV parser: header row → objects
function parseCSV(csv) {
  // Normalize line endings
  const lines = csv.replace(/\r/g, "").trim().split("\n");

  // Extract headers
  const headers = lines[0].split(",").map((h) => h.trim());

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue; // Skip empty lines

    // Split respecting empty fields
    const cols = row.split(",").map((c) => c.trim() || "");

    const obj = {};
    headers.forEach((h, index) => {
      obj[h] = cols[index] || "";
    });

    rows.push(obj);
  }

  return rows;
}
export default CarrierCommand;
