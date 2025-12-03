// src/pages/CarrierCommand.jsx

import React, { useState, useEffect } from "react";

function CarrierCommand() {
  // ---------------- Carrier profile state (left panel) ----------------
  const [carrier, setCarrier] = useState({
    carrierName: "",
    mcNumber: "",
    primaryContact: "",
    contactPhone: "",
    email: "",
    factoringCompany: "",
    factoringTerms: "",
    equipmentType: "Dry Van",
    trucks: "1",
    homeTerminalCity: "",
    homeTerminalState: "",
    preferredLanes: "",
    doNotRunLanes: "",
    minRatePerMile: "",
    targetRatePerMile: "",
    maxDailyMiles: "",
    eldProvider: "",
    notes: "",
  });

  // ---------------- Status / metrics state (right panel) ----------------
  const [status, setStatus] = useState({
    isActive: true,
    currentMarket: "",
    nextHomeTime: "",
    thisWeekRevenue: "",
    lastWeekRevenue: "",
    onTimePercentage: "",
    safetyScore: "",
    riskNotes: "",
  });

  // ---------------- Derived metrics for right-hand panel ----------------
  const trucks = Number(carrier.trucks) || 0;
  const thisWeekRev = Number(status.thisWeekRevenue) || 0;
  const lastWeekRev = Number(status.lastWeekRevenue) || 0;

  const avgRevPerTruck =
    trucks > 0 ? (thisWeekRev / trucks).toFixed(2) : "0";

  const minRpm = Number(carrier.minRatePerMile) || 0;
  const targetRpm = Number(carrier.targetRatePerMile) || 0;

  const rpmBand =
    minRpm && targetRpm
      ? `${minRpm.toFixed(2)} – ${targetRpm.toFixed(2)}`
      : "—";

  const trend =
    thisWeekRev > lastWeekRev
      ? "up"
      : thisWeekRev < lastWeekRev
      ? "down"
      : "flat";

  const onTime = Number(status.onTimePercentage) || 0;
  const health =
    onTime >= 97 ? "green" : onTime >= 93 ? "yellow" : "red";

  // ---------------- Handlers for manual edits ----------------
  const handleCarrierChange = (e) => {
    const { name, value } = e.target;
    setCarrier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    const { name, type, value, checked } = e.target;
    setStatus((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleSave = async (e) => {
  e.preventDefault();

  try {
    // payload going to Netlify
    const payload = {
      carrierId: selectedCarrierId,   // from the dropdown
      carrier,
      status,
    };

    const res = await fetch('/.netlify/functions/save-carrier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Save error:', text);
      alert('Save failed – check DevTools console.');
      return;
    }

    const result = await res.json();
    console.log('Save result:', result);

    alert('Carrier profile synced (server received data).');
  } catch (err) {
    console.error('Save error:', err);
    alert('Save failed – see console for details.');
  }
};
    e.preventDefault();
    // For now this just confirms wiring.
    // Later this will push to Zoho Sheets / MOVEN CRM.
    console.log("Carrier profile:", carrier);
    console.log("Carrier status:", status);
    alert("Carrier profile saved locally. Later this will sync into MOVEN Command.");
  };

  // ---------------- NEW: carrier selector state ----------------
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  // Fetch carriers from Zoho via Netlify function
  useEffect(() => {
    async function fetchCarriers() {
      try {
        async function fetchCarriers() {
  try {
    const res = await fetch('/.netlify/functions/fetch-sheets?sheet=carriers');
    const csv = await res.text();

    console.log("Fetched raw CSV:", csv);  // <-- ADD THIS

    const parsed = parseCSV(csv);

    console.log("Parsed carriers:", parsed);  // <-- ADD THIS

    setCarriers(parsed);
  } catch (err) {
    console.error("Failed to load carriers:", err);
  }
}
const res = await fetch('/.netlify/functions/fetch-sheets?sheet=carriers');
        if (!res.ok) throw new Error("Failed to load carriers CSV");
        const csv = await res.text();
        const parsed = parseCSV(csv);
        setCarriers(parsed);
      } catch (err) {
        console.error("Failed to load carriers:", err);
      }
    }
    fetchCarriers();
  }, []);

  // When user selects a carrier from dropdown, map CSV → carrier form
  const handleSelectCarrier = (e) => {
    const id = e.target.value;
    setSelectedCarrierId(id);

    const selected = carriers.find((c) => c.Carrier_ID === id);
    if (!selected) return;

    // Map Zoho columns into your carrier state
    setCarrier((prev) => ({
      ...prev,
      carrierName: selected.Carrier_Name || "",
      mcNumber: selected.MC || "",
      // CSV doesn't have primary contact column, so keep old
      contactPhone: selected.Phone || "",
      email: selected.Email || "",
      equipmentType: selected.Equipment || prev.equipmentType,
      homeTerminalCity: selected.Home_City || "",
      homeTerminalState: selected.Home_State || "",
      // You can add more mappings later if you add columns
    }));
  };

  // ---------------- JSX ----------------
  return (
    <main className="main-content carrier-page">
      <h1>Carrier Command</h1>
      <p className="page-subtitle">
        Build a full MOVEN profile for each carrier: lanes, home time, money,
        and risk — all in one place.
      </p>

      {/* NEW: Carrier Selector Row */}
      <div className="carrier-selector-row" style={{ marginBottom: "16px" }}>
        <label className="form-label" style={{ marginRight: "8px" }}>
          Select Carrier:
        </label>
        <select
          value={selectedCarrierId}
          onChange={handleSelectCarrier}
        >
          <option value="">-- Select Carrier --</option>
          {carriers.map((c) => (
            <option key={c.Carrier_ID} value={c.Carrier_ID}>
              {c.Carrier_Name}
            </option>
          ))}
        </select>
      </div>

      <div className="carrier-grid">
        {/* LEFT SIDE — profile + preferences */}
        <form className="card" onSubmit={handleSave}>
          <h2>Carrier Profile</h2>

          {/* Carrier Name / MC / Primary Contact / Phone / Email */}
          <div className="form-row">
            <div className="form-field">
              <label>Carrier Name</label>
              <input
                type="text"
                name="carrierName"
                value={carrier.carrierName}
                onChange={handleCarrierChange}
                placeholder="Example Transport LLC"
              />
            </div>

            <div className="form-field">
              <label>MC #</label>
              <input
                type="text"
                name="mcNumber"
                value={carrier.mcNumber}
                onChange={handleCarrierChange}
                placeholder="MC123456"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Primary Contact</label>
              <input
                type="text"
                name="primaryContact"
                value={carrier.primaryContact}
                onChange={handleCarrierChange}
                placeholder="Owner / Dispatcher name"
              />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={carrier.contactPhone}
                onChange={handleCarrierChange}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={carrier.email}
                onChange={handleCarrierChange}
                placeholder="owner@example.com"
              />
            </div>

            <div className="form-field">
              <label>Equipment Type</label>
              <select
                name="equipmentType"
                value={carrier.equipmentType}
                onChange={handleCarrierChange}
              >
                <option>Dry Van</option>
                <option>Reefer</option>
                <option>Flatbed</option>
                <option>Power Only</option>
              </select>
            </div>
          </div>

          {/* Trucks / Home terminal / State */}
          <div className="form-row">
            <div className="form-field">
              <label># of Trucks on MOVEN</label>
              <input
                type="number"
                min="1"
                name="trucks"
                value={carrier.trucks}
                onChange={handleCarrierChange}
              />
            </div>

            <div className="form-field">
              <label>Home Terminal (City)</label>
              <input
                type="text"
                name="homeTerminalCity"
                value={carrier.homeTerminalCity}
                onChange={handleCarrierChange}
                placeholder="Atlanta"
              />
            </div>

            <div className="form-field">
              <label>State</label>
              <input
                type="text"
                name="homeTerminalState"
                value={carrier.homeTerminalState}
                onChange={handleCarrierChange}
                placeholder="GA"
              />
            </div>
          </div>

          {/* Lanes & Preferences */}
          <h2 className="section-title">Lanes &amp; Preferences</h2>

          <div className="form-row">
            <div className="form-field">
              <label>Preferred Lanes</label>
              <textarea
                name="preferredLanes"
                value={carrier.preferredLanes}
                onChange={handleCarrierChange}
                rows={3}
                placeholder="ATL → CHI, CHI → DAL, SE regional, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>DO NOT Run</label>
              <textarea
                name="doNotRunLanes"
                value={carrier.doNotRunLanes}
                onChange={handleCarrierChange}
                rows={3}
                placeholder="NYC boroughs, CO mountains in winter, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Min Rate Per Mile (won’t book below)</label>
              <input
                type="number"
                step="0.01"
                name="minRatePerMile"
                value={carrier.minRatePerMile}
                onChange={handleCarrierChange}
                placeholder="2.25"
              />
            </div>

            <div className="form-field">
              <label>Target Rate Per Mile</label>
              <input
                type="number"
                step="0.01"
                name="targetRatePerMile"
                value={carrier.targetRatePerMile}
                onChange={handleCarrierChange}
                placeholder="2.75"
              />
            </div>

            <div className="form-field">
              <label>Max Daily Miles (ELD)</label>
              <input
                type="number"
                name="maxDailyMiles"
                value={carrier.maxDailyMiles}
                onChange={handleCarrierChange}
                placeholder="550"
              />
            </div>
          </div>

          {/* Factoring & Notes */}
          <h2 className="section-title">Factoring &amp; Notes</h2>

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
