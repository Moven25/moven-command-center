// src/pages/MissionControl.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MissionControl.css";

/**
 * Mission Control (Sync OS)
 * Includes:
 * - KPI tiles (clickable navigation shortcuts)
 * - Loads Overview + quick actions
 * - DTL Snapshot panel
 * - Today’s Tasks (checkbox completes; row opens details)
 * - RPM Leaderboard
 * - Compliance Alerts
 * - Weather / Disruption Alerts (right rail)
 * - System Status
 */

function StatTile({ label, value, tone = "blue", sub, onClick, title }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      className={`mcStat mcTone-${tone} ${clickable ? "clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={title || (clickable ? "Click to open" : undefined)}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
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

function statusPillClass(status) {
  if (status === "At Risk") return "risk";
  if (status === "Booked") return "booked";
  return "transit";
}

export default function MissionControl() {
  const navigate = useNavigate();

  // ---------- TASKS: open vs complete ----------
  const initialTasks = useMemo(
    () => [
      {
        id: "t1",
        title: "Confirm POD for LD-2038",
        notes: "Request POD and attach to load record.",
        related: { type: "load", id: "LD-2038", route: "/dispatch" },
        priority: "High",
        due: "Today",
        done: false,
      },
      {
        id: "t2",
        title: "Update carrier insurance (ABC)",
        notes: "Insurance expiring soon; request updated COI.",
        related: { type: "carrier", id: "ABC Transport", route: "/carriers" },
        priority: "Medium",
        due: "Today",
        done: false,
      },
      {
        id: "t3",
        title: "Follow up on detention request",
        notes: "Broker follow-up; confirm detention approval & amount.",
        related: { type: "broker", id: "Roadlinq Logistics", route: "/brokers" },
        priority: "Medium",
        due: "Today",
        done: false,
      },
    ],
    []
  );

  const [tasks, setTasks] = useState(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) || null,
    [tasks, activeTaskId]
  );

  const openCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);
  const weatherAlertCount = 2;

  const toggleTaskDone = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const openTask = (taskId) => setActiveTaskId(taskId);
  const closeTaskPanel = () => setActiveTaskId(null);

  const goToRelated = () => {
    if (!activeTask?.related?.route) return;
    navigate(activeTask.related.route);
  };

  return (
    <div className="mc">
      {/* KPI Row (navigation shortcuts) */}
      <div className="mcKpis">
        <StatTile
          label="Active Loads"
          value="12"
          tone="blue"
          sub="Live"
          onClick={() => navigate("/dispatch")}
          title="Open Dispatch Command"
        />
        <StatTile
          label="Active Carriers"
          value="7"
          tone="green"
          sub="On duty"
          onClick={() => navigate("/carriers")}
          title="Open Carrier Command"
        />
        <StatTile
          label="Carriers Risky"
          value="2"
          tone="red"
          sub="Docs expiring"
          onClick={() => navigate("/compliance")}
          title="Open Compliance Command"
        />
        <StatTile
          label="Revenue (MTD)"
          value="$18,420"
          tone="purple"
          sub="Commission only"
          onClick={() => navigate("/finance")}
          title="Open Finance Command"
        />
        <StatTile label="Avg RPM" value="$2.36" tone="orange" sub="7-day avg" />
        <StatTile
          label="Weather"
          value="Watch"
          tone="orange"
          sub={`${weatherAlertCount} alerts`}
          onClick={() => navigate("/logistics")}
          title="Open Logistics Command"
        />
      </div>

      {/* Main Grid */}
      <div className="mcGrid">
        {/* Left / Center */}
        <div className="mcMain">
          <Panel
            title="Loads Overview"
            right={
              <div className="mcBtns">
                <button
                  className="mcBtnPrimary"
                  onClick={() => navigate("/dispatch")}
                  title="Go to Dispatch Command to assign loads"
                >
                  Assign
                </button>
                <button
                  className="mcBtn"
                  onClick={() => navigate("/dispatch")}
                  title="Open Dispatch Command load board"
                >
                  View Board
                </button>
              </div>
            }
          >
            <div className="mcTwoCol">
              <div className="mcMini">
                <div className="mcMiniTitle">Today</div>
                <div className="mcMiniRow">
                  <span>Booked</span>
                  <strong>6</strong>
                </div>
                <div className="mcMiniRow">
                  <span>In Transit</span>
                  <strong>4</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Late / At Risk</span>
                  <strong className="mcWarn">2</strong>
                </div>
              </div>

              <div className="mcMini">
                <div className="mcMiniTitle">This Week</div>
                <div className="mcMiniRow">
                  <span>Loads Planned</span>
                  <strong>19</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Delivered</span>
                  <strong>11</strong>
                </div>
                <div className="mcMiniRow">
                  <span>Exceptions</span>
                  <strong className="mcWarn">3</strong>
                </div>
              </div>
            </div>

            <div className="mcTable">
              <div className="mcTableRow mcTableHead">
                <span>Load</span>
                <span>Lane</span>
                <span>Status</span>
                <span>ETA</span>
                <span>Carrier</span>
              </div>

              {[
                {
                  id: "LD-2041",
                  lane: "GA → NC",
                  status: "In Transit",
                  eta: "Today 4:10p",
                  carrier: "ABC Transport",
                },
                {
                  id: "LD-2043",
                  lane: "CT → PA",
                  status: "Booked",
                  eta: "Tomorrow 9:00a",
                  carrier: "IronHorse",
                },
                {
                  id: "LD-2046",
                  lane: "NJ → VA",
                  status: "At Risk",
                  eta: "Today 6:30p",
                  carrier: "BlueLine",
                },
              ].map((r) => (
                <div key={r.id} className="mcTableRow">
                  <span className="mcMono">{r.id}</span>
                  <span>{r.lane}</span>
                  <span className={`mcPill ${statusPillClass(r.status)}`}>
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
            right={
              <span className="mcMuted">
                Lane: Savannah, GA • Window: 48h
              </span>
            }
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
                  <button
                    className="mcBtnPrimary"
                    onClick={() => alert("Run Sync Now (coming soon)")}
                    title="Will trigger a DTL refresh + data sync"
                  >
                    Run Sync Now
                  </button>
                  <button
                    className="mcBtn"
                    onClick={() => navigate("/logistics")}
                    title="Open Logistics Command (DTL full engine)"
                  >
                    Open Logistics Command
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Rail */}
        <aside className="mcRail">
          {/* Today’s Tasks: checkbox completes, row opens */}
          <Panel
            title="Today’s Tasks"
            right={<span className="mcMuted">{openCount} open</span>}
          >
            <div className="mcTaskList">
              {tasks.map((t) => {
                const isActive = t.id === activeTaskId;
                return (
                  <div
                    key={t.id}
                    className={`mcTaskRow ${t.done ? "done" : ""} ${
                      isActive ? "active" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openTask(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openTask(t.id);
                    }}
                    title="Click row to open task"
                  >
                    {/* Checkbox: completes task only */}
                    <input
                      className="mcTaskCheck"
                      type="checkbox"
                      checked={t.done}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleTaskDone(t.id)}
                      aria-label={`Mark complete: ${t.title}`}
                      title="Check to complete"
                    />

                    <div className="mcTaskText">
                      <div className="mcTaskTitle">{t.title}</div>
                      <div className="mcTaskMeta">
                        <span className="mcTaskBadge">{t.priority}</span>
                        <span className="mcTaskDim">•</span>
                        <span className="mcTaskDim">{t.due}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task Detail Panel */}
            {activeTask && (
              <div className="mcTaskPanel" aria-label="Task details">
                <div className="mcTaskPanelHeader">
                  <div className="mcTaskPanelTitle">Task</div>
                  <button
                    className="mcTaskClose"
                    onClick={closeTaskPanel}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="mcTaskPanelBody">
                  <div className="mcTaskPanelMain">{activeTask.title}</div>

                  <div className="mcTaskPanelSection">
                    <div className="mcTaskPanelLabel">Notes</div>
                    <div className="mcTaskPanelText">{activeTask.notes}</div>
                  </div>

                  <div className="mcTaskPanelSection">
                    <div className="mcTaskPanelLabel">Related</div>
                    <div className="mcTaskPanelText">
                      {activeTask.related.type.toUpperCase()}:{" "}
                      <span className="mcTaskLink">{activeTask.related.id}</span>
                    </div>
                  </div>

                  <div className="mcTaskPanelActions">
                    <button
                      className="mcBtnPrimary"
                      onClick={goToRelated}
                      title="Open related Command"
                    >
                      Open Related
                    </button>

                    <button
                      className="mcBtn"
                      onClick={() => toggleTaskDone(activeTask.id)}
                      title="Toggle completion"
                    >
                      {activeTask.done ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="RPM Leaderboard"
            right={<span className="mcMuted">Last 7 days</span>}
          >
            <div className="mcList">
              <div className="mcListRow">
                <span>GA → NC</span>
                <strong>$2.62</strong>
              </div>
              <div className="mcListRow">
                <span>NJ → VA</span>
                <strong>$2.48</strong>
              </div>
              <div className="mcListRow">
                <span>CT → PA</span>
                <strong>$2.31</strong>
              </div>
            </div>
          </Panel>

          <Panel
            title="Compliance Alerts"
            right={<span className="mcPill risk">2</span>}
          >
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

          {/* Weather / Disruption Alerts (right rail) */}
          <Panel
            title="Weather / Disruption Alerts"
            right={<span className="mcPill watch">Watch</span>}
          >
            <div className="mcAlerts">
              <div className="mcAlert">
                <div className="mcAlertTitle">Wind advisory</div>
                <div className="mcAlertSub">
                  I-95 corridor • Potential slowdowns
                </div>
              </div>

              <div className="mcAlert">
                <div className="mcAlertTitle">Heavy rain</div>
                <div className="mcAlertSub">GA → NC lanes • Monitor ETAs</div>
              </div>

              <div className="mcAlert">
                <div className="mcAlertTitle">Traffic disruption</div>
                <div className="mcAlertSub">
                  NJ inbound • Increased dwell time risk
                </div>
              </div>
            </div>

            <div className="mcAlertActions">
              <button
                className="mcBtn"
                onClick={() => alert("Weather details (coming soon)")}
              >
                View Details
              </button>
              <button className="mcBtn" onClick={() => navigate("/logistics")}>
                Open Logistics
              </button>
            </div>
          </Panel>

          <Panel title="System Status" right={<span className="mcPill ok">OK</span>}>
            <div className="mcList">
              <div className="mcListRow">
                <span>Data Sync</span>
                <strong>Online</strong>
              </div>
              <div className="mcListRow">
                <span>Alerts Engine</span>
                <strong>Running</strong>
              </div>
              <div className="mcListRow">
                <span>Last Refresh</span>
                <strong>12s ago</strong>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
