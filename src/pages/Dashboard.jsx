import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [mode, setMode] = useState("dispatch"); // dispatch | executive
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const alertsRef = useRef(null);
  const profileRef = useRef(null);

  const stats = useMemo(
    () => ({
      activeLoads: 562,
      availableTrucks: 82,
      avgRpm: 2.37,
      profit: 42730,
      netAfterFuel: 2720,
    }),
    []
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      const t = e.target;
      if (alertsRef.current && !alertsRef.current.contains(t)) setAlertsOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handlePopout() {
    // Opens same page in new tab (dual monitor)
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`mc ${mode === "executive" ? "isExecutive" : ""}`}>
      <header className="mcTop">
        <div className="mcTitle">
          <div className="mcH1">
            Mission Control <span className="mcLive">· Live Operations</span>
          </div>
          <div className="mcSub">All lanes. All trucks. One system.</div>
        </div>

        <div className="mcRight">
          <div className="mcSearch">
            <span className="mcSearchIcon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loads, lanes, carriers..."
            />
          </div>

          <div className="mcMode">
            <button
              type="button"
              className={mode === "dispatch" ? "pill active" : "pill"}
              onClick={() => setMode("dispatch")}
            >
              Dispatch
            </button>
            <button
              type="button"
              className={mode === "executive" ? "pill active" : "pill"}
              onClick={() => setMode("executive")}
            >
              Executive
            </button>
          </div>

          <button
            type="button"
            className="iconBtn"
            onClick={handlePopout}
            title="Pop out (dual monitor)"
          >
            ⤢
          </button>

          {/* Alerts dropdown */}
          <div className="iconWrap" ref={alertsRef}>
            <button
              type="button"
              className={`iconBtn ${alertsOpen ? "on" : ""}`}
              onClick={() => {
                setAlertsOpen((v) => !v);
                setProfileOpen(false);
              }}
              title="Alerts"
              aria-expanded={alertsOpen}
            >
              🔔
            </button>

            {alertsOpen && (
              <div className="dropdown">
                <div className="dropHeader">Alerts</div>
                <button type="button" className="dropItem">
                  <span className="dot warn" /> Risk <span className="muted">Revenue Impact</span>
                  <span className="right">$1,220</span>
                </button>
                <button type="button" className="dropItem">
                  <span className="dot risk" /> Rate Drop: ORD → PMX <span className="right muted">5:45 PM</span>
                </button>
                <button type="button" className="dropItem">
                  <span className="dot info" /> Carrier Compliance <span className="right muted">3:17 PM</span>
                </button>
                <button type="button" className="dropItem">
                  <span className="dot warn" /> Idle Truck: Unassigned <span className="right muted">2:30 PM</span>
                </button>
                <button
                  type="button"
                  className="dropCta"
                  onClick={() => alert("All alerts view coming next")}
                >
                  View All Alerts
                </button>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="iconWrap" ref={profileRef}>
            <button
              type="button"
              className={`avatarBtn ${profileOpen ? "on" : ""}`}
              onClick={() => {
                setProfileOpen((v) => !v);
                setAlertsOpen(false);
              }}
              title="Profile"
              aria-expanded={profileOpen}
            >
              <span className="avatarDot" />
            </button>

            {profileOpen && (
              <div className="dropdown">
                <div className="dropHeader">Profile</div>
                <button type="button" className="dropItem" onClick={() => alert("Settings coming next")}>
                  Settings
                </button>
                <button type="button" className="dropItem" onClick={() => alert("Account coming next")}>
                  Account
                </button>
                <button type="button" className="dropItem danger" onClick={() => alert("Logout coming next")}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Visible proof Executive button works */}
      {mode === "executive" && (
        <div className="execBadge" role="status">
          Executive Mode is ON — showing profitability-first recommendations.
        </div>
      )}

      <div className="actionsRow">
        <div className="actionsLabel">Recommended Actions</div>
        <button type="button" className="chip" onClick={() => alert("Idle truck flow coming next")}>
          ⚠ Idle Truck: DAL (45 min)
        </button>
        <button type="button" className="chip" onClick={() => alert("Book headhaul flow coming next")}>
          ↗ Book Headhaul
        </button>
        <button type="button" className="chip" onClick={() => alert("Compliance flow coming next")}>
          ✓ Compliance Expiring (7 days)
        </button>
        <button type="button" className="chip danger" onClick={() => alert("Hold/Renegotiate flow coming next")}>
          ⛔ Hold / Renegotiate
        </button>
      </div>

      <section className="mcGrid">
        <div className="card stat">
          <div className="label">Active Loads</div>
          <div className="value">{stats.activeLoads}</div>
          <div className="spark">+12</div>
        </div>

        <div className="card stat">
          <div className="label">Available Trucks</div>
          <div className="value">{stats.availableTrucks}</div>
          <div className="spark">Idle / Ready</div>
        </div>

        <div className="card stat">
          <div className="label">Avg RPM (Live)</div>
          <div className="value">${stats.avgRpm.toFixed(2)}</div>
          <div className="spark">Fuel-adjusted</div>
        </div>

        <div className="card wide">
          <div className="cardHeader">
            <div className="cardTitle">Lane Performance Intelligence</div>
            <div className="cardTools">
              <button type="button" className="mini">7d</button>
              <button type="button" className="mini active">30d</button>
              <button type="button" className="mini">Custom</button>
              <button type="button" className="mini ghost" onClick={() => alert("Headhaul filter coming next")}>
                Headhaul Only
              </button>
            </div>
          </div>
          <div className="chartMock">[Chart Placeholder — we’ll wire real data later]</div>
        </div>

        <div className="card side">
          <div className="cardHeader">
            <div className="cardTitle">Profit Snapshot</div>
            <button type="button" className="mini" onClick={() => alert("Profit details coming next")}>⋯</button>
          </div>
          <div className="bigMoney">${stats.profit.toLocaleString()}</div>
          <div className="row">
            <span className="muted">Net After Fuel</span>
            <span>${stats.netAfterFuel.toLocaleString()}</span>
          </div>
          <div className="barMock" />
        </div>

        <div className="card table">
          <div className="cardHeader">
            <div className="cardTitle">Live Loads</div>
            <div className="cardTools">
              <button type="button" className="mini" onClick={() => alert("Filters coming next")}>Filter</button>
              <button type="button" className="mini" onClick={() => alert("Search within table coming next")}>🔎</button>
            </div>
          </div>

          <div className="tableHead">
            <div>Load ID</div><div>Lane</div><div>Carrier</div><div>Rate</div><div>RPM</div><div>Status</div>
          </div>

          {[
            ["99217", "ATL → NYC", "Priority Transport", "$3,200", "$2.93", "En Route"],
            ["99216", "ATL → CTL", "Metro Haul", "$4,150", "$1.96", "Delayed"],
            ["99215", "DFW → ATL", "Swift Freight", "$2,900", "$2.34", "Dispatched"],
            ["99214", "LAX → SEA", "Swift Freight", "$5,100", "$1.99", "Delivered"],
            ["99212", "MIA → CLT", "Apex Transit", "$3,750", "$1.71", "Late Truck"],
          ].map((r) => (
            <div className="tableRow" key={r[0]}>
              {r.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
