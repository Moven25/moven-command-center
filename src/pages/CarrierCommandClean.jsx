import React, { useState, useEffect } from "react";

export default function CarrierCommandClean() {
  const [carrier, setCarrier] = useState({ carrierName: "", mcNumber: "", trucks: "1", preferredLanes: "", homeTerminalCity: "", factoringCompany: "", factoringTerms: "", eldProvider: "", notes: "" });
  const [status, setStatus] = useState({ isActive: true, thisWeekRevenue: "", lastWeekRevenue: "", onTimePercentage: "", riskNotes: "" });
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/.netlify/functions/fetch-sheets?sheet=carriers");
        if (!res.ok) return setCarriers([]);
        const csv = await res.text();
        if (!csv) return setCarriers([]);
        const lines = csv.replace(/\r/g, "").trim().split("\n");
        if (!lines.length) return setCarriers([]);
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
        <select value={selectedCarrierId} onChange={(e) => setSelectedCarrierId(e.target.value)}>
          <option value="">-- Select Carrier --</option>
          {carriers.map((c, idx) => (
            <option key={c.Carrier_ID || c.id || idx} value={c.Carrier_ID || c.id || idx}>{c.Carrier_Name || c.name || `Carrier ${idx + 1}`}</option>
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
            <div className="form-field"><label>Primary Contact</label><input name="primaryContact" value={carrier.primaryContact || ""} onChange={handleCarrierChange} /></div>
            <div className="form-field"><label>Phone</label><input name="contactPhone" value={carrier.contactPhone || ""} onChange={handleCarrierChange} /></div>
          </div>

          <div className="form-row">
            <div className="form-field"><label>Internal MOVEN Notes</label><textarea name="notes" value={carrier.notes} onChange={handleCarrierChange} rows={3} /></div>
          </div>

          <button type="submit" className="primary-btn">Save Carrier Profile</button>
        </form>

        <div className="card">
          <h2>MOVEN Metrics</h2>
          <div className="metrics-grid">
            <div className="metric"><div className="metric-label">Avg Rev / Truck</div><div className="metric-value">$0.00</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}
