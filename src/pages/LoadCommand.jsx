// src/pages/LoadCommand.jsx

import React, { useState } from "react";
import "./LoadCommand.css";
import movenData from "../data/movenData";

function LoadCommand() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [miles, setMiles] = useState("");
  const [rate, setRate] = useState("");
  const [rpm, setRPM] = useState(null);
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");

  // ===============================
  // CALCULATE RPM
  // ===============================
  const calculateRPM = () => {
    if (!miles || !rate) return null;
    const result = (rate / miles).toFixed(2);
    setRPM(result);
    return parseFloat(result);
  };

  // ===============================
  // SUBMIT HANDLER
  // ===============================
  const handleSubmit = (e) => {
    e.preventDefault();

    const calculatedRPM = calculateRPM();
    if (!calculatedRPM) return;

    // MOVEN CALCULATIONS
    const grossProfit = (rate - miles * 0.45).toFixed(2);
    const movenFee = (rate * 0.1).toFixed(2);
    const carrierNet = (rate - movenFee).toFixed(2);

    // ACTIVITY OBJECT
    const activityEntry = {
      origin,
      destination,
      miles: Number(miles),
      rate: Number(rate),
      rpm: calculatedRPM.toFixed(2),
      grossProfit,
      movenFee,
      carrierNet,
      decision,
      notes,
      timestamp: new Date().toISOString(),
    };

    // PUSH INTO movenData
    movenData.addActivity(activityEntry);
    movenData.updateWeeklyRevenue(Number(rate));
    movenData.updateWeeklyAvgRPM(calculatedRPM);
    movenData.updateLoadsDispatched();

    // RESET FORM
    setOrigin("");
    setDestination("");
    setMiles("");
    setRate("");
    setNotes("");
    setDecision("");
    setRPM(null);
  };

  return (
    <div className="load-full-container">
      {/* LEFT SIDE — FORM */}
      <div className="load-form-panel">
        <h2>Load Command</h2>

        <form className="load-form" onSubmit={handleSubmit}>
          <label>Origin</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter origin"
          />

          <label>Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
          />

          <label>Miles</label>
          <input
            type="number"
            value={miles}
            onChange={(e) => setMiles(e.target.value)}
            placeholder="Enter miles"
          />

          <label>Rate ($)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Enter rate"
          />

          {/* RPM Preview */}
          {rpm && (
            <div className="rpm-preview">
              <strong>RPM:</strong> ${rpm}
            </div>
          )}

          {/* DECISION */}
          <label>Decision</label>
          <div className="decision-buttons">
            <button
              type="button"
              className={decision === "ACCEPTED" ? "active" : ""}
              onClick={() => setDecision("ACCEPTED")}
            >
              Accept
            </button>

            <button
              type="button"
              className={decision === "REJECTED" ? "active" : ""}
              onClick={() => setDecision("REJECTED")}
            >
              Reject
            </button>
          </div>

          <label>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason / comments"
          />

          <button className="add-load-btn" type="submit">
            Add Load
          </button>
        </form>
      </div>

      {/* RIGHT SIDE — SUMMARY */}
      <div className="load-summary-panel">
        <h2>Load Summary</h2>

        <div className="summary-box">
          <p>Enter miles + rate to see summary</p>

          {rpm && (
            <>
              <p><strong>Trip:</strong> {origin} ➝ {destination}</p>
              <p><strong>Miles:</strong> {miles}</p>
              <p><strong>Rate:</strong> ${rate}</p>
              <p><strong>RPM:</strong> ${rpm}</p>
            </>
          )}
        </div>

        <h3>Last 10 Loads</h3>
        <div className="last-loads-box">
          {movenData.activity.length === 0 ? (
            <p>No loads yet</p>
          ) : (
            movenData.activity.slice(0, 10).map((item, i) => (
              <div key={i} className="load-item">
                {item.origin} ➝ {item.destination} | {item.miles} mi | ${item.rate} | RPM {item.rpm} | {item.decision}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadCommand;




