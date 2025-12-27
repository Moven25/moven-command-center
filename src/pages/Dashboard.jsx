import React from "react";
import "./Dashboard.css";

function safeCount(arr) {
  return Array.isArray(arr) ? arr.length : 0;
}

function formatNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toLocaleString();
}

function formatSyncTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Dashboard({
  activeCommand = "mission",
  onCommandChange,
  movenData,
  movenSync,
  refreshAllSheets,
  addCarrierLocal,
}) {
  const setCmd = (key) => onCommandChange?.(key);

  // REAL counts
  const carriersCount = safeCount(movenData?.carriers);
  const loadsCount = safeCount(movenData?.loads);

  // Modal state (Option A)
  const [showAddCarrier, setShowAddCarrier] = React.useState(false);
  const [carrierForm, setCarrierForm] = React.useState({
    carrierName: "",
    mc: "",
    dot: "",
    phone: "",
    email: "",
  });

  const onCarrierField = (key, val) =>
    setCarrierForm((p) => ({ ...p, [key]: val }));

  const submitCarrier = (e) => {
    e.preventDefault();

    const payload = {
      id: (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now())),
      carrierName: carrierForm.carrierName.trim(),
      mc: carrierForm.mc.trim(),
      dot: carrierForm.dot.trim(),
      phone: carrierForm.phone.trim(),
      email: carrierForm.email.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!payload.carrierName) return alert("Carrier Name is required.");

    addCarrierLocal?.(payload);
    setShowAddCarrier(false);
    setCarrierForm({ carrierName: "", mc: "", dot: "", phone: "", email: "" });
  };

  const carriers = Array.isArray(movenData?.carriers) ? movenData.carriers : [];
  const loads = Array.isArray(movenData?.loads) ? movenData.loads : [];

  // Simple “Top Command” buttons should match the side style
  const TopCmdBtn = ({ id, label }) => (
    <button
      className={`topCommandBtn ${activeCommand === id ? "active" : ""}`}
      onClick={() => setCmd(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="dashRoot liquidBg">
      {/* Sidebar */}
      <aside className="mcSidebar">
        <div className="mcSidebarBrand">
          <div className="mcSidebarBrandTop">MOVEN</div>
          <div className="mcSidebarBrandBottom">LOGISTICS</div>
        </div>

        <nav className="mcSidebarNav">
          <button className={`sideBtn ${activeCommand === "mission" ? "active" : ""}`} onClick={() => setCmd("mission")} type="button">
            Mission Control
          </button>
          <button className={`sideBtn ${activeCommand === "carrier" ? "active" : ""}`} onClick={() => setCmd("carrier")} type="button">
            Carrier Command
          </button>
          <button className={`sideBtn ${activeCommand === "load" ? "active" : ""}`} onClick={() => setCmd("load")} type="button">
            Load Command
          </button>
          <button className={`sideBtn ${activeCommand === "weather" ? "active" : ""}`} onClick={() => setCmd("weather")} type="button">
            Weather Command
          </button>
          <button className={`sideBtn ${activeCommand === "learning" ? "active" : ""}`} onClick={() => setCmd("learning")} type="button">
            Learning Command
          </button>

          <div className="sideDivider" />

          <button className={`sideBtn ${activeCommand === "dtl" ? "active" : ""}`} onClick={() => setCmd("dtl")} type="button">
            DTL
          </button>

          <button className={`sideBtn ${activeCommand === "settings" ? "active" : ""}`} onClick={() => setCmd("settings")} type="button">
            Settings
          </button>
          <button className={`sideBtn ${activeCommand === "admin" ? "active" : ""}`} onClick={() => setCmd("admin")} type="button">
            Admin
          </button>
        </nav>

        <div className="mcSidebarFooter">Owner</div>
      </aside>

      {/* Main */}
      <main className="dashMain">
        <header className="dashTopbar">
          <div className="topBrand">MOVEN COMMAND</div>

          <div className="topCommands">
            <TopCmdBtn id="mission" label="Mission Control" />
            <TopCmdBtn id="carrier" label="Carrier Command" />
            <TopCmdBtn id="load" label="Load Command" />
            <TopCmdBtn id="weather" label="Weather Command" />
            <TopCmdBtn id="learning" label="Learning Command" />
          </div>

          <div className="topActions">
            <button className="iconBtn" type="button" title="Info">i</button>
            <button className="iconBtn" type="button" title="Settings">⚙</button>
          </div>
        </header>

        {/* ====== MISSION CONTROL (counts + summary tiles) ====== */}
        {activeCommand === "mission" && (
          <div className="pageInner">
            <section className="grid">
              <div className="card glass">
                <div className="cardTitle">Live Carrier Data</div>
                <div className="bigNumber">{carriersCount}</div>
                <div className="subtle">Live Carriers</div>
                <div className="miniStats">
                  <div>Insurance Alerts <span>—</span></div>
                  <div>Compliance Warnings <span>—</span></div>
                </div>
              </div>

              <div className="card glass span2">
                <div className="cardTitle">Load Command Summary</div>
                <div className="subtle">Showing sample rows until we map your real columns perfectly.</div>

                <div className="tableWrap">
                  <table className="miniTable">
                    <thead>
                      <tr>
                        <th>Load ID</th>
                        <th>Origin</th>
                        <th>Pickup</th>
                        <th>Delivery</th>
                        <th>RPM</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loads.slice(0, 5).length ? loads.slice(0, 5) : [{}, {}, {}, {}, {}]).map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.LoadID || row.loadId || row.id || "—"}</td>
                          <td>{row.Origin || row.origin || "—"}</td>
                          <td>{row.Pickup || row.pickup || "—"}</td>
                          <td>{row.Delivery || row.delivery || "—"}</td>
                          <td>{row.RPM || row.rpm || "—"}</td>
                          <td>{row.Score || row.score || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card glass">
                <div className="cardTitle">Alerts Feed</div>
                <div className="alerts">
                  <div className="alertLine">
                    {movenSync?.loading ? "Syncing sheets now..." : "Sheets loaded. Next: real alerts."}
                  </div>
                  <div className="alertLine">Carriers: <b>{carriersCount}</b></div>
                  <div className="alertLine">Loads: <b>{loadsCount}</b></div>
                  {movenSync?.error ? (
                    <div className="alertLine dangerText">Sync Error: {movenSync.error}</div>
                  ) : null}
                </div>
              </div>

              <div className="card glass">
                <div className="cardTitle">Revenue Today</div>
                <div className="money">$—</div>
                <div className="subtle">Last Sync: {formatSyncTime(movenSync?.lastSyncAt)}</div>
              </div>

              <div className="card glass">
                <div className="cardTitle">DTL Command</div>
                <div className="subtle">Best Lane</div>
                <div className="subtle">Projected RPM</div>
                <div className="subtle">Confidence</div>
                <div className="btnRow">
                  <button className="actionBtn" onClick={() => setCmd("dtl")} type="button">View DTL</button>
                  <button className="actionBtn primary" onClick={() => console.log("[MOVEN] Run DTL (stub)")} type="button">
                    Run Scan
                  </button>
                </div>
              </div>
            </section>

            <div className="actionBar">
              <button className="actionBtn" type="button" onClick={() => setShowAddCarrier(true)}>
                Add Carrier
              </button>

              <button
                className="actionBtn"
                type="button"
                onClick={refreshAllSheets}
                disabled={!!movenSync?.loading}
              >
                {movenSync?.loading ? "Syncing..." : "Sync Sheets"}
              </button>

              <button className="actionBtn danger" type="button" onClick={() => console.log("[MOVEN] Emergency (stub)")}>
                Emergency Alert
              </button>
            </div>
          </div>
        )}

        {/* ====== CARRIER COMMAND (FULL: list + add carrier) ====== */}
        {activeCommand === "carrier" && (
          <div className="pageInner">
            <div className="card glass" style={{ marginBottom: 14 }}>
              <div className="cardTitle">Carrier Command</div>
              <div className="subtle">
                Total carriers: <b>{carriersCount}</b>
              </div>

              <div className="btnRow" style={{ marginTop: 12 }}>
                <button className="actionBtn" type="button" onClick={() => setShowAddCarrier(true)}>
                  Add Carrier
                </button>
                <button
                  className="actionBtn"
                  type="button"
                  onClick={refreshAllSheets}
                  disabled={!!movenSync?.loading}
                >
                  {movenSync?.loading ? "Syncing..." : "Sync Sheets"}
                </button>
              </div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Carrier List</div>

              <div className="tableWrap">
                <table className="miniTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>MC</th>
                      <th>DOT</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carriersCount === 0 ? (
                      <tr>
                        <td colSpan="5" className="subtle">
                          No carriers yet. Click <b>Add Carrier</b>.
                        </td>
                      </tr>
                    ) : (
                      carriers.map((c, idx) => (
                        <tr key={c.id || c.MC || c.DOT || c.mc || c.dot || idx}>
                          <td>{c.carrierName || c.Carrier || c.name || "—"}</td>
                          <td>{c.mc || c.MC || "—"}</td>
                          <td>{c.dot || c.DOT || "—"}</td>
                          <td>{c.phone || c.Phone || "—"}</td>
                          <td>{c.email || c.Email || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="subtle" style={{ marginTop: 10 }}>
                If your Zoho headers are different, we’ll map them next so the table fills perfectly.
              </div>
            </div>
          </div>
        )}

        {/* ====== Load / Weather / Learning placeholders (wired) ====== */}
        {activeCommand === "load" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">Load Command</div>
              <div className="subtle">
                Loaded loads: <b>{formatNumber(loadsCount)}</b>
              </div>
              <div className="subtle">
                Next: map your real loads columns into the table.
              </div>
            </div>
          </div>
        )}

        {activeCommand === "weather" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">Weather Command</div>
              <div className="subtle">Next: connect lane/truck locations to weather lookups.</div>
            </div>
          </div>
        )}

        {activeCommand === "learning" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">Learning Command</div>
              <div className="subtle">Next: Quick Start + walkthrough modules.</div>
            </div>
          </div>
        )}

        {activeCommand === "dtl" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">DTL Command</div>
              <div className="subtle">Next: DTL scan logic + best lane suggestions.</div>
            </div>
          </div>
        )}

        {activeCommand === "settings" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">Settings</div>
              <div className="subtle">Owner controls + diagnostics next.</div>
            </div>
          </div>
        )}

        {activeCommand === "admin" && (
          <div className="pageInner">
            <div className="card glass">
              <div className="cardTitle">Admin</div>
              <div className="subtle">Admin functions next.</div>
            </div>
          </div>
        )}

        {/* ====== Modal ====== */}
        {showAddCarrier && (
          <div className="modalOverlay" onMouseDown={() => setShowAddCarrier(false)}>
            <div className="modalCard glass" onMouseDown={(e) => e.stopPropagation()}>
              <div className="cardTitle">Add Carrier</div>

              <form onSubmit={submitCarrier} style={{ marginTop: 10 }}>
                <div className="formGrid">
                  <input
                    placeholder="Carrier Name *"
                    value={carrierForm.carrierName}
                    onChange={(e) => onCarrierField("carrierName", e.target.value)}
                  />
                  <input
                    placeholder="MC #"
                    value={carrierForm.mc}
                    onChange={(e) => onCarrierField("mc", e.target.value)}
                  />
                  <input
                    placeholder="DOT #"
                    value={carrierForm.dot}
                    onChange={(e) => onCarrierField("dot", e.target.value)}
                  />
                  <input
                    placeholder="Phone"
                    value={carrierForm.phone}
                    onChange={(e) => onCarrierField("phone", e.target.value)}
                  />
                  <input
                    placeholder="Email"
                    value={carrierForm.email}
                    onChange={(e) => onCarrierField("email", e.target.value)}
                  />
                </div>

                <div className="btnRow" style={{ marginTop: 12 }}>
                  <button className="actionBtn primary" type="submit">
                    Save
                  </button>
                  <button className="actionBtn danger" type="button" onClick={() => setShowAddCarrier(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
