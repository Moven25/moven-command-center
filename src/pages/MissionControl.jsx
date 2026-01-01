import React from "react";
import "./MissionControl.css";

function StatTile({ label, value, tone = "blue", sub }) {
  return (
    <div className={`mcStat mcTone-${tone}`}>
      <div className="mcStatLabel">{label}</div>
      <div className="mcStatValue">{value}</div>
      {sub ? <div className="mcStatSub">{sub}</div> : null}
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <section className="mcPanel">
      <header className="mcPanelHeader">
        <div className="mcPanelTitle">{title}</div>
        {right ? <div className="mcPanelRight">{right}</div> : null}
      </header>
      <div className="mcPanelBody">{children}</div>
    </section>
  );
}

export default function MissionControl() {
  return (
    <div className="mc">
      {/* KPI Row */}
      <div className="mcKpis">
        <StatTile label="Active Loads" value="12" tone="blue" sub="Live" />
        <StatTile label="Active Carriers" value="7" tone="green" sub="On duty" />
        <StatTile label="Carriers Risky" value="2" tone="red" sub="Docs expiring" />
        <StatTile label="Revenue (MTD)" value="$18,420" tone="purple" sub="Commission only" />
        <StatTile label="Avg RPM" value="$2.36" tone="orange" sub="7-day avg" />
      </div>

      {/* Main Grid */}
      <div className="mcGrid">
        {/* Left / Center */}
        <div className="mcMain">
          <Panel
            title="Loads Overview"
            right={
              <div className="mcBtns">
                <button className="mcBtnPrimary">Assign</button>
                <button className="mcBtn">View Board</button>
              </div>
            }
          >
            <div className="mcTwoCol">
              <div className="mcMini">
                <div className="mcMiniTitle">Today</div>
                <div className="mcMiniRow">
                  <span>Booked</span><strong>6</strong>
                </div>
                <div className="mcMiniRow">
                  <span>In Transit</span><strong>4</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Late / At Risk</span><strong className="mcWarn">2</strong>
                </div>
              </div>
              <div className="mcMini">
                <div className="mcMiniTitle">This Week</div>
                <div className="mcMiniRow">
                  <span>Loads Planned</span><strong>19</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Delivered</span><strong>11</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Exceptions</span><strong className="mcWarn">3</strong>
                </div>
              </div>
            </div>

            <div className="mcTable">
              <div className="mcTableRow mcTableHead">
                <span>Load</span><span>Lane</span><span>Status</span><span>ETA</span><span>Carrier</span>
              </div>

              {[
                { id: "LD-2041", lane: "GA → NC", status: "In Transit", eta: "Today 4:10p", carrier: "ABC Transport" },
                { id: "LD-2043", lane: "CT → PA", status: "Booked", eta: "Tomorrow 9:00a", carrier: "IronHorse" },
                { id: "LD-2046", lane: "NJ → VA", status: "At Risk", eta: "Today 6:30p", carrier: "BlueLine" },
              ].map((r) => (
                <div key={r.id} className="mcTableRow">
                  <span className="mcMono">{r.id}</span>
                  <span>{r.lane}</span>
                  <span className={`mcPill ${r.status === "At Risk" ? "risk" : r.status === "Booked" ? "booked" : "transit"}`}>
                    {r.status}
                  </span>
                  <span>{r.eta}</span>
                  <span>{r.carrier}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* SINGLE DTL Widget (locked) */}
          <Panel
            title="DTL Optimization (Snapshot)"
            right={<span className="mcMuted">Lane: Savannah, GA • Window: 48h</span>}
          >
            <div className="mcDtl">
              <div className="mcDtlMap">
                <div className="mcDtlMapBadge">Map Preview</div>
              </div>

              <div className="mcDtlInfo">
                <div className="mcDtlRow">
                  <div className="mcDtlLabel">Recommended Outbound RPM</div>
                  <div className="mcDtlValue">$2.55 – $2.85</div>
                </div>

                <div className="mcDtlRow">
                  <div className="mcDtlLabel">Market Risk</div>
                  <div className="mcDtlValue">
                    <span className="mcDot green" /> Stable
                  </div>
                </div>

                <div className="mcDtlRow">
                  <div className="mcDtlLabel">Weather / Disruption</div>
                  <div className="mcDtlValue">
                    <span className="mcDot orange" /> Watch
                  </div>
                </div>

                <div className="mcDtlActions">
                  <button className="mcBtnPrimary">Run Sync Now</button>
                  <button className="mcBtn">Open Logistics Command</button>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Rail */}
        <aside className="mcRail">
          <Panel title="Today’s Tasks" right={<span className="mcMuted">3 open</span>}>
            <div className="mcChecklist">
              <label><input type="checkbox" /> Confirm POD for LD-2038</label>
              <label><input type="checkbox" /> Update carrier insurance (ABC)</label>
              <label><input type="checkbox" /> Follow up on detention request</label>
            </div>
          </Panel>

          <Panel title="RPM Leaderboard" right={<span className="mcMuted">Last 7 days</span>}>
            <div className="mcList">
              <div className="mcListRow"><span>GA → NC</span><strong>$2.62</strong></div>
              <div className="mcListRow"><span>NJ → VA</span><strong>$2.48</strong></div>
              <div className="mcListRow"><span>CT → PA</span><strong>$2.31</strong></div>
            </div>
          </Panel>

          <Panel title="Compliance Alerts" right={<span className="mcPill risk">2</span>}>
            <div className="mcAlerts">
              <div className="mcAlert">
                <div className="mcAlertTitle">Insurance expiring</div>
                <div className="mcAlertSub">BlueLine • 5 days</div>
              </div>
              <div className="mcAlert">
                <div className="mcAlertTitle">W-9 missing</div>
                <div className="mcAlertSub">IronHorse • Needs upload</div>
              </div>
            </div>
          </Panel>

          <Panel title="System Status" right={<span className="mcPill ok">OK</span>}>
            <div className="mcList">
              <div className="mcListRow"><span>Data Sync</span><strong>Online</strong></div>
              <div className="mcListRow"><span>Alerts Engine</span><strong>Running</strong></div>
              <div className="mcListRow"><span>Last Refresh</span><strong>12s ago</strong></div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
