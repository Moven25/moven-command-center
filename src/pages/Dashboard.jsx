// src/pages/Dashboard.jsx
import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  // (Option A = visual only) handlers are placeholders so nothing breaks
  const handleStub = (label) => () => {
    console.log(`[MOVEN] Clicked: ${label}`);
  };

  return (
    <div className="dashRoot">
      {/* Top Bar */}
      <header className="dashTopbar">
        <div className="brand">
          <span className="brandText">MOVEN COMMAND</span>
        </div>

        {/* Top commands styled like sidebar */}
        <div className="top-command-bar">
          <button className="top-command-btn active" onClick={handleStub("Mission Control")}>
            Mission Control
          </button>
          <button className="top-command-btn" onClick={handleStub("Carrier Command")}>
            Carrier Command
          </button>
          <button className="top-command-btn" onClick={handleStub("Load Command")}>
            Load Command
          </button>
          <button className="top-command-btn" onClick={handleStub("Weather Command")}>
            Weather Command
          </button>
          <button className="top-command-btn" onClick={handleStub("Learning Command")}>
            Learning Command
          </button>
        </div>

        <div className="topIcons">
          <div className="topIcon" title="Notes">
            📓
          </div>
          <div className="topIcon" title="Settings">
            ⚙️
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashGrid">
        {/* Left Column */}
        <section className="colLeft">
          <div className="card glass tall">
            <div className="cardTitle">Live Carrier Data</div>

            <div className="gaugeWrap">
              <div className="gauge gaugeWarm">
                <div className="gaugeValue">84</div>
              </div>
              <div className="gaugeLabel">Carrier Performance Score</div>
            </div>

            <div className="statsList">
              <div className="statRow">
                <span>Live Carriers</span>
                <span className="statVal">1280</span>
              </div>
              <div className="statRow">
                <span>Insurance Alerts</span>
                <span className="statVal">6</span>
              </div>
              <div className="statRow">
                <span>Compliance Warnings</span>
                <span className="statVal">8</span>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Weather Command</div>
            <div className="statsList">
              <div className="statRow">
                <span>Active Loads</span>
                <span className="statVal">340</span>
              </div>
              <div className="statRow">
                <span>Loads This Week</span>
                <span className="statVal">799</span>
              </div>
              <div className="statRow">
                <span>Total Loaded Miles</span>
                <span className="statVal">1.28M</span>
              </div>
              <div className="statRow">
                <span>Weather Alerts</span>
                <span className="statVal">8</span>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Market Command</div>
            <div className="marketMeta">
              <span>Market</span>
              <span className="pill">Moderate</span>
            </div>
            <div className="marketSignals">
              <div className="signal">
                <span className="dot green" /> Cold Markets
              </div>
              <div className="signal">
                <span className="dot red" /> Volume
              </div>
            </div>
          </div>
        </section>

        {/* Center Column */}
        <section className="colCenter">
          <div className="card glass wide">
            <div className="cardTitle">Load Command Summary</div>

            <div className="tableHead">
              <span>Load ID</span>
              <span>Origin</span>
              <span>Pickup</span>
              <span>Delivery</span>
              <span>RPM</span>
              <span className="right">Suggested Score</span>
            </div>

            <div className="tableRow">
              <span className="bold">53081</span>
              <span>Chicago</span>
              <span>Dec. 5</span>
              <span>Feb. 7</span>
              <span>2.97</span>
              <span className="scorePill green">82</span>
            </div>
            <div className="tableRow">
              <span className="bold">53072</span>
              <span>Louisville</span>
              <span>Dec. 5</span>
              <span>Jul. 15</span>
              <span>3.15</span>
              <span className="scorePill green">77</span>
            </div>
            <div className="tableRow">
              <span className="bold">53056</span>
              <span>Charlotte</span>
              <span>Jul. 21</span>
              <span>Dec. 16</span>
              <span>2.46</span>
              <span className="scorePill amber">64</span>
            </div>
            <div className="tableRow">
              <span className="bold">53058</span>
              <span>Phoenix</span>
              <span>Jul. 29</span>
              <span>Dec. 7</span>
              <span>2.76</span>
              <span className="scorePill green">72</span>
            </div>
          </div>

          <div className="rowTwo">
            <div className="card glass">
              <div className="cardTitle">Today’s Priorities</div>
              <div className="prioList">
                <div className="prio">
                  <span className="prioSwatch orange" /> Urgent Loads
                </div>
                <div className="prio">
                  <span className="prioSwatch pink" /> Check Calls Due
                </div>
                <div className="prio">
                  <span className="prioSwatch green" /> Missing Documents
                </div>
                <div className="prio">
                  <span className="prioSwatch lime" /> Carrier Updates
                </div>
              </div>
            </div>

            <div className="card glass">
              <div className="cardTitle">Revenue Today</div>
              <div className="money">$36,847</div>
              <div className="subtle">Last Sync • —</div>
            </div>

            {/* DTL TILE (Option A: Visual only) */}
            <div className="card glass dtlTile">
              <div className="dtlTop">
                <div className="cardTitle" style={{ marginBottom: 0 }}>
                  DTL Command
                </div>
                <span className="dtlStatus">Idle</span>
              </div>

              <div className="dtlMeta">
                <div className="dtlLine">
                  <span className="dtlLabel">Best Lane</span>
                  <span className="dtlValue">—</span>
                </div>
                <div className="dtlLine">
                  <span className="dtlLabel">Projected RPM</span>
                  <span className="dtlValue">—</span>
                </div>
                <div className="dtlLine">
                  <span className="dtlLabel">Confidence</span>
                  <span className="dtlValue">—</span>
                </div>
              </div>

              <div className="dtlFooter">
                <button className="dtlBtn" onClick={handleStub("View DTL")}>
                  View DTL
                </button>
                <button className="dtlBtn dtlBtnPrimary" onClick={handleStub("Run DTL Scan")}>
                  Run Scan
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="actionBar">
            <button className="actionBtn" onClick={handleStub("Add Carrier")}>
              Add Carrier
            </button>
            <button className="actionBtn" onClick={handleStub("Add Load")}>
              Add Load
            </button>
            <button className="actionBtn" onClick={handleStub("Run DTL Scan (Action Bar)")}>
              Run DTL Scan
            </button>
            <button className="actionBtn" onClick={handleStub("Sync Sheets")}>
              Sync Sheets
            </button>
            <button className="actionBtn danger" onClick={handleStub("Emergency Alert")}>
              Emergency Alert
            </button>
          </div>
        </section>

        {/* Right Column */}
        <section className="colRight">
          <div className="card glass">
            <div className="cardTitle">Compliance Command</div>
            <div className="complianceList">
              <div className="comp">
                <span className="sq green" /> Insurance
              </div>
              <div className="comp">
                <span className="sq green" /> Permits
              </div>
              <div className="comp">
                <span className="sq amber" /> IFTA
              </div>
              <div className="comp">
                <span className="sq red" /> Medical
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Alerts Feed</div>
            <div className="alerts">
              <div className="alert">Weather alert on …</div>
              <div className="alert">Road 53095 late at pickup</div>
              <div className="alert">Carrier HF995 Insurance expiring</div>
              <div className="alert">New DTL opportunity detected</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Load Score</div>
            <div className="gaugeWrap small">
              <div className="gauge gaugeRed">
                <div className="gaugeValue">73</div>
              </div>
              <div className="gaugeLabel">Revenue Today</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">Revenue This Week</div>
            <div className="gaugeWrap small">
              <div className="gauge gaugeGreen">
                <div className="gaugeValue">33</div>
              </div>
              <div className="gaugeLabel">Revenue This Week</div>
            </div>
          </div>

          <div className="card glass">
            <div className="cardTitle">System Health</div>
            <div className="healthRows">
              <div className="healthRow">
                <span>Screen</span>
                <span className="healthBar">
                  <i style={{ width: "78%" }} />
                </span>
              </div>
              <div className="healthRow">
                <span>Load Board Sync</span>
                <span className="healthBar">
                  <i style={{ width: "62%" }} />
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
