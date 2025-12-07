import React, { useState, useEffect } from "react";

export default function CarrierCommand() {
  const [carrier, setCarrier] = useState({ carrierName: "", mcNumber: "", trucks: "1" });
  const [status, setStatus] = useState({ isActive: true, thisWeekRevenue: "", lastWeekRevenue: "" });
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  useEffect(() => {
    (async () => {
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
      }
    })();
  }, []);

  const handleCarrierChange = (e) => setCarrier((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSelectCarrier = (e) => {
    const id = e.target.value;
    setSelectedCarrierId(id);
    const found = carriers.find((c) => c.Carrier_ID === id);
    if (!found) return;
    setCarrier((p) => ({ ...p, carrierName: found.Carrier_Name || "", mcNumber: found.MC || "" }));
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

          <div className="form-row"><button type="submit" className="primary-btn">Save Carrier Profile</button></div>
        </form>

        <div className="card">
          <h2>MOVEN Metrics</h2>
        </div>
      </div>
    </main>
  );
}
