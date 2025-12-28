// src/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import "./Dashboard.css";

function safeArr(x) {
  return Array.isArray(x) ? x : [];
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== "") return obj[k];
  }
  return "";
}

function normalizeCarrier(row) {
  // Tries multiple common header names from CSV
  const name = pick(row, ["Carrier Name", "carrier", "Carrier", "Name", "company", "Company"]);
  const mc = pick(row, ["MC", "MC#", "MC Number", "MC_Number", "MC_Number#", "mc"]);
  const dot = pick(row, ["DOT", "USDOT", "USDOT#", "dot"]);
  const phone = pick(row, ["Phone", "Phone Number", "phone"]);
  const email = pick(row, ["Email", "email"]);
  return { name, mc, dot, phone, email };
}

export default function Dashboard({
  // these are expected from your AppShell/data loader
  activeCommand = "mission",
  onCommandChange,
  movenData,
  movenSync,
  refreshAllSheets,
}) {
  const setCmd = (key) => onCommandChange?.(key);

  const carriers = safeArr(movenData?.carriers);
  const loads = safeArr(movenData?.loads);

  const carrierRows = useMemo(() => carriers.map(normalizeCarrier), [carriers]);
  const carriersCount = carriers.length;
  const loadsCount = loads.length;

  // Local add-carrier so you can use it immediately (no backend yet)
  const [localCarriers, setLocalCarriers] = useState([]);
  const combinedCarriers = useMemo(
    () => [...carrierRows, ...localCarriers],
    [carrierRows, localCarriers]
  );

 const addCarrier = async () => {
  const name = prompt("Carrier name?");
  if (!name) return;

  const mc = prompt("MC number (optional)") || "";
  const dot = prompt("DOT number (optional)") || "";
  const phone = prompt("Phone (optional)") || "";
  const email = prompt("Email (optional)") || "";

  const res = await fetch("/.netlify/functions/save-carrier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mc, dot, phone, email }),
  });

  if (!res.ok) {
    alert("Failed to save carrier");
    return;
  }

  // Reload from Zoho
  refreshAllSheets();
};

  const sideItems = [
    { key: "mission", label: "Mission Control" },
    { key: "carrier", label: "Carrier Command" },
    { key: "load", label: "Load Command" },
    { key: "weather", label: "Weather Command" },
    { key: "learning", label: "Learning Command" },
    { key: "dtl", label: "DTL" },
  ];

  const topItems = [
    { key: "mission", label: "Mission Control" },
    { key: "carrier", label: "Carrier Command" },
    { key: "load", label: "Load Command" },
    { key: "weather", label: "Weather Command" },
    { key: "learning", label: "Learning Command" },
  ];

  const syncLabel = movenSync?.loading ? "Syncing..." : "Sync Sheets";

  // Mission Control view (the screenshot layout)
  const MissionGrid = () => (
    <div className="card">
      <div className="grid">
        {/* LEFT COLUMN */}
        <section className="colLeft">
          <div className="card">
            <div className="cardTitle">Live Carrier Data</div>
            <div className="cardBody">
              <div style={{ fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                84
              </div>

              <div style={{ marginTop: 10 }}>
                <div>Carrier Performance Score</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Live Carriers</span>
                  <strong style={{ color: "rgba(255,255,255,0.9)" }}>
                    {combinedCarriers.length || carriersCount || 0}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Insurance Alerts</span>
                  <strong style={{ color: "rgba(255,255,255,0.9)" }}>—</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Compliance Warnings</span>
                  <strong style={{ color: "rgba(255,255,255,0.9)" }}>—</strong>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Carrier List</div>
                <table className="table compact">
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>MC</th>
                      <th>DOT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedCarriers.slice(0, 3).map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.name || "—"}</td>
                        <td>{c.mc || "—"}</td>
                        <td>{c.dot || "—"}</td>
                      </tr>
                    ))}
                    {!combinedCarriers.length && (
                      <tr>
                        <td colSpan={3} style={{ opacity: 0.75 }}>
                          Add a carrier to populate this list.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Weather Command</div>
            <div className="cardBody">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Active Loads</span>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>0</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span>Loads This Week</span>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>0</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span>Total Loaded Miles</span>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>—</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span>Weather Alerts</span>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>—</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Market Command</div>
            <div className="cardBody">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>Market</span>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  Moderate
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div>• Cold Markets</div>
                <div style={{ marginTop: 6 }}>• Volume</div>
              </div>
            </div>
          </div>
        </section>

        {/* MID COLUMN */}
        <section className="colMid">
          <div className="card">
            <div className="cardTitle">Load Command Summary</div>
            <div className="cardBody">
              <table className="table">
                <thead>
                  <tr>
                    <th>Load ID</th>
                    <th>Origin</th>
                    <th>Pickup</th>
                    <th>Delivery</th>
                    <th>RPM</th>
                    <th>Suggested Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loads.slice(0, 5).map((r, idx) => (
                    <tr key={idx}>
                      <td>{pick(r, ["Load ID", "LoadID", "id", "Load"]) || "—"}</td>
                      <td>{pick(r, ["Origin", "origin"]) || "—"}</td>
                      <td>{pick(r, ["Pickup", "pickup"]) || "—"}</td>
                      <td>{pick(r, ["Delivery", "delivery"]) || "—"}</td>
                      <td>{pick(r, ["RPM", "rpm"]) || "—"}</td>
                      <td>{pick(r, ["Suggested Score", "Score", "score"]) || "—"}</td>
                    </tr>
                  ))}
                  {!loads.length && (
                    <tr>
                      <td colSpan={6} style={{ opacity: 0.75 }}>
                        No loads found yet (after Sync Sheets, loads should appear here).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 8, opacity: 0.85 }}>Loads: {loadsCount}</div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Today’s Priorities</div>
            <div className="cardBody">
              <div>• Urgent Loads</div>
              <div style={{ marginTop: 6 }}>• Check Calls Due</div>
              <div style={{ marginTop: 6 }}>• Missing Documents</div>
              <div style={{ marginTop: 6 }}>• Carrier Updates</div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="colRight">
          <div className="card">
            <div className="cardTitle">Alerts Feed</div>
            <div className="cardBody">
              <div>Sheets loaded. Next: real alerts.</div>
              <div style={{ marginTop: 6 }}>Carriers: {carriersCount}</div>
              <div style={{ marginTop: 6 }}>Loads: {loadsCount}</div>
              {movenSync?.error && (
                <div style={{ marginTop: 8, color: "rgba(255,59,48,0.95)", fontWeight: 900 }}>
                  Sync Error: {movenSync.error}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">System Health</div>
            <div className="cardBody">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Screen</span>
                  <span style={{ opacity: 0.8 }}>OK</span>
                </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  overflow: "hidden",
                  marginTop: 6,
                }}
              >
                <div style={{ width: "88%", height: "100%", background: "rgba(229,57,53,0.65)" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <span>Sheet Sync</span>
                <span style={{ opacity: 0.8 }}>{movenSync?.loading ? "Syncing" : "Idle"}</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  overflow: "hidden",
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    width: movenSync?.loading ? "45%" : "70%",
                    height: "100%",
                    background: "rgba(229,57,53,0.65)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Command Tip</div>
            <div className="cardBody">
              Next: render real Carrier + Load tables from your sheets, and wire up “Add Carrier”.
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">DTL Command</div>
            <div className="cardBody">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Status</span>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Idle</strong>
              </div>
              <div style={{ marginTop: 10 }}>Best Lane: —</div>
              <div style={{ marginTop: 6 }}>Projected RPM: —</div>
              <div style={{ marginTop: 6 }}>Confidence: —</div>

              <div className="actionBar" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <button className="actionBtn primary" onClick={() => setCmd("dtl")}>
                  View DTL
                </button>
                <button className="actionBtn danger" onClick={() => console.log("[MOVEN] Run DTL (stub)")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom actions */}
      <div className="actionBar">
        <button className="actionBtn primary" onClick={addCarrierLocal}>
          Add Carrier
        </button>

        <button className="actionBtn" onClick={() => console.log("[MOVEN] Add Load (stub)")}>
          Add Load
        </button>

        <button
          className="actionBtn"
          onClick={() => refreshAllSheets?.()}
          disabled={!!movenSync?.loading}
          title="Pull latest data from Zoho sheets"
        >
          {syncLabel}
        </button>

        <button className="actionBtn danger" onClick={() => console.log("[MOVEN] Emergency (stub)")}>
          Emergency Alert
        </button>
      </div>
    </div>
  );

  // Carrier Command view shows the carrier list table
  const CarrierCommand = () => (
    <div className="card">
      <div className="cardTitle">Carrier Command</div>
      <div className="cardBody">
        <div style={{ marginBottom: 10, opacity: 0.85 }}>
          Total carriers: <strong style={{ color: "rgba(255,255,255,0.92)" }}>{combinedCarriers.length}</strong>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Carrier</th>
              <th>MC</th>
              <th>DOT</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {combinedCarriers.slice(0, 12).map((c, idx) => (
              <tr key={idx}>
                <td>{c.name || "—"}</td>
                <td>{c.mc || "—"}</td>
                <td>{c.dot || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.email || "—"}</td>
              </tr>
            ))}
            {!combinedCarriers.length && (
              <tr>
                <td colSpan={5} style={{ opacity: 0.75 }}>
                  No carrier rows yet. Hit “Sync Sheets” (after URLs are correct), or use “Add Carrier”.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="actionBar" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <button className="actionBtn primary" onClick={addCarrierLocal}>
            Add Carrier
          </button>
          <button className="actionBtn" onClick={() => refreshAllSheets?.()} disabled={!!movenSync?.loading}>
            {syncLabel}
          </button>
          <button className="actionBtn" onClick={() => setCmd("mission")}>
            Back to Mission Control
          </button>
        </div>
      </div>
    </div>
  );

  const PlaceholderCommand = ({ title }) => (
    <div className="card">
      <div className="cardTitle">{title}</div>
      <div className="cardBody">
        This section is wired (buttons work). Next step is rendering real tables + actions for {title}.
        <div className="actionBar" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <button className="actionBtn" onClick={() => setCmd("mission")}>Back to Mission Control</button>
          <button className="actionBtn" onClick={() => refreshAllSheets?.()} disabled={!!movenSync?.loading}>{syncLabel}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashRoot">
      <div className="dashWrap">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sideTitle">MOVEN LOGISTICS</div>
          {sideItems.map((it) => (
            <button
              key={it.key}
              className={`sideBtn ${activeCommand === it.key ? "active" : ""}`}
              onClick={() => setCmd(it.key)}
            >
              {it.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="main">
          <header className="dashTopbar">
            <div className="brand">
              <div className="brandText">MOVEN COMMAND</div>
            </div>

            <div className="topCmds">
              {topItems.map((it) => (
                <button
                  key={it.key}
                  className={activeCommand === it.key ? "top-command-btn active" : "top-command-btn"}
                  onClick={() => setCmd(it.key)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </header>
<p>DASHBOARD LOADED</p>
<div className="p-6 bg-red-700 text-white rounded-xl">
  Tailwind is working 🔥
</div>
          {activeCommand === "mission" && <MissionGrid />}
          {activeCommand === "carrier" && <CarrierCommand />}

          {activeCommand === "load" && <PlaceholderCommand title="Load Command" />}
          {activeCommand === "weather" && <PlaceholderCommand title="Weather Command" />}
          {activeCommand === "learning" && <PlaceholderCommand title="Learning Command" />}
          {activeCommand === "dtl" && <PlaceholderCommand title="DTL Command" />}
        </main>
      </div>
    </div>
  );
}

