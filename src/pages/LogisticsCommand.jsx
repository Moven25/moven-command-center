import React, { useMemo, useState } from "react";
import "./LogisticsCommand.css";

const seedLoads = [
  {
    id: "LD-2046",
    lane: "NJ → VA",
    carrier: "BlueLine",
    nextEvent: "Delivery Appt",
    eta: "6:20p",
    status: "Watch",
    checkCallDue: "Now",
    pickup: "Tyson Foods • 34 Industrial Rd, Hartford, CT",
    timeline: [
      { label: "Pickup", time: "3:30p–4:30p", state: "done" },
      { label: "In Transit", time: "Next check call in 16m", state: "active" },
      { label: "Delivery Appt", time: "3:30p–4:30p", state: "upcoming" },
    ],
    docs: { rateConf: true, bol: true, pod: false },
  },
  {
    id: "LD-2043",
    lane: "CT → PA",
    carrier: "IronHorse",
    nextEvent: "Pickup Appt",
    eta: "7:45p",
    status: "Watch",
    checkCallDue: "16m",
    pickup: "Northern Foods • Ottawa, ON",
    timeline: [
      { label: "Pickup", time: "8:00p–9:00p", state: "upcoming" },
      { label: "In Transit", time: "—", state: "upcoming" },
      { label: "Delivery Appt", time: "—", state: "upcoming" },
    ],
    docs: { rateConf: true, bol: false, pod: false },
  },
  {
    id: "LD-2048",
    lane: "GA → NC",
    carrier: "ABC Transport",
    nextEvent: "Delivery Appt",
    eta: "7:15p",
    status: "Lane Risk",
    checkCallDue: "Now",
    pickup: "Savannah, GA",
    timeline: [
      { label: "Pickup", time: "3:30p–4:30p", state: "done" },
      { label: "In Transit", time: "Weather corridor watch", state: "active" },
      { label: "Delivery Appt", time: "4:50p", state: "upcoming" },
    ],
    docs: { rateConf: true, bol: true, pod: false },
  },
  {
    id: "LD-2039",
    lane: "ON → PA",
    carrier: "Merina",
    nextEvent: "Check Call Due",
    eta: "8:00p",
    status: "Attention",
    checkCallDue: "Now",
    pickup: "ON → PA",
    timeline: [
      { label: "Pickup", time: "Done", state: "done" },
      { label: "In Transit", time: "Check call due", state: "active" },
      { label: "Delivery Appt", time: "—", state: "upcoming" },
    ],
    docs: { rateConf: true, bol: true, pod: true },
  },
];

export default function LogisticsCommand() {
  const [loadsState, setLoadsState] = useState(seedLoads);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState("All Active");
  const [day, setDay] = useState("Today");
  const [selectedId, setSelectedId] = useState(seedLoads[0].id);

  const [alerts, setAlerts] = useState([
    "LD-2048 POD not uploaded",
    "LD-2046 at risk",
    "LD-2043 BOL pending",
  ]);
  const [activityLog, setActivityLog] = useState([
    "System ready • actions enabled",
  ]);

  const addLog = (msg) => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setActivityLog((prev) => [`${stamp} • ${msg}`, ...prev].slice(0, 12));
  };

  const addAlert = (msg) => {
    setAlerts((prev) => [msg, ...prev].slice(0, 12));
  };

  const loads = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = loadsState;

    if (activity !== "All Active") {
      list = list.filter((l) => l.status === activity);
    }

    if (!s) return list;

    return list.filter((l) => {
      const hay = `${l.id} ${l.lane} ${l.carrier} ${l.nextEvent} ${l.status}`.toLowerCase();
      return hay.includes(s);
    });
  }, [q, activity, loadsState]);

  const selected = useMemo(() => {
    return loadsState.find((l) => l.id === selectedId) || loadsState[0];
  }, [loadsState, selectedId]);

  const updateSelected = (patch) => {
    setLoadsState((prev) =>
      prev.map((l) => (l.id === selectedId ? { ...l, ...patch } : l))
    );
  };

  const updateSelectedDocs = (patch) => {
    setLoadsState((prev) =>
      prev.map((l) => {
        if (l.id !== selectedId) return l;
        return { ...l, docs: { ...l.docs, ...patch } };
      })
    );
  };

  // Ops Actions
  const markArrivedPU = () => {
    updateSelected({
      status: "Watch",
      nextEvent: "Mark Loaded",
      timeline: [
        { label: "Arrived PU", time: "Now", state: "done" },
        { label: "Loading", time: "In progress", state: "active" },
        { label: "Depart PU", time: "—", state: "upcoming" },
      ],
    });
    addLog(`${selectedId} • Marked Arrived PU`);
  };

  const markLoaded = () => {
    updateSelected({
      nextEvent: "In Transit",
      timeline: [
        { label: "Loaded", time: "Now", state: "done" },
        { label: "In Transit", time: "Next check call in 60m", state: "active" },
        { label: "Delivery Appt", time: selected?.eta || "—", state: "upcoming" },
      ],
      checkCallDue: "60m",
    });
    addLog(`${selectedId} • Marked Loaded`);
  };

  const markArrivedDEL = () => {
    updateSelected({
      status: "Watch",
      nextEvent: "Mark Delivered",
      timeline: [
        { label: "Arrived DEL", time: "Now", state: "active" },
        { label: "Unloading", time: "In progress", state: "upcoming" },
        { label: "Delivered", time: "—", state: "upcoming" },
      ],
    });
    addLog(`${selectedId} • Marked Arrived DEL`);
  };

  const markDelivered = () => {
    updateSelected({
      status: "Watch",
      nextEvent: "Docs / POD",
      timeline: [
        { label: "Delivered", time: "Now", state: "done" },
        { label: "POD", time: "Upload required", state: "active" },
        { label: "Closeout", time: "—", state: "upcoming" },
      ],
    });
    addAlert(`${selectedId} delivered • POD required`);
    addLog(`${selectedId} • Marked Delivered`);
  };

  const updateETA = () => {
    const newEta = prompt("Enter new ETA (e.g. 7:10p):", selected?.eta || "");
    if (!newEta) return;
    updateSelected({ eta: newEta });
    addAlert(`${selectedId} ETA updated to ${newEta}`);
    addLog(`${selectedId} • ETA updated → ${newEta}`);
  };

  const logCheckCall = () => {
    updateSelected({ checkCallDue: "90m" });
    addLog(`${selectedId} • Check call logged (next in 90m)`);
  };

  // Docs Checklist actions
  const toggleRateConf = () => {
    const next = !selected?.docs?.rateConf;
    updateSelectedDocs({ rateConf: next });
    addLog(`${selectedId} • Rate Conf ${next ? "OK" : "unset"}`);
  };

  const toggleBOL = () => {
    const next = !selected?.docs?.bol;
    updateSelectedDocs({ bol: next });
    addLog(`${selectedId} • BOL ${next ? "OK" : "pending"}`);
    if (!next) addAlert(`${selectedId} BOL pending`);
  };

  const uploadPOD = () => {
    updateSelectedDocs({ pod: true });
    addLog(`${selectedId} • POD uploaded`);
    setAlerts((prev) => prev.filter((a) => !a.includes(`${selectedId} POD`)));
  };

  // Exceptions & Costs
  const createException = () => {
    const reason = prompt("Exception reason (short):", "Late delivery");
    if (!reason) return;
    addAlert(`${selectedId} exception: ${reason}`);
    updateSelected({ status: "Attention" });
    addLog(`${selectedId} • Exception created (${reason})`);
  };

  const logDetention = () => {
    addAlert(`${selectedId} detention logged`);
    updateSelected({ status: "Attention" });
    addLog(`${selectedId} • Detention logged`);
  };

  const logTONU = () => {
    addAlert(`${selectedId} TONU logged`);
    updateSelected({ status: "Attention" });
    addLog(`${selectedId} • TONU logged`);
  };

  const logLayover = () => {
    addAlert(`${selectedId} layover logged`);
    updateSelected({ status: "Attention" });
    addLog(`${selectedId} • Layover logged`);
  };

  const onPopout = () => {
    window.open(window.location.href, "_blank", "noopener,noreferrer,width=1200,height=800");
  };

  return (
    <div className="lcPage lcNoLocalHeader">
      {/* Controls */}
      <div className="lcControls">
        <div className="lcSearchWrap">
          <span className="lcSearchIcon">⌕</span>
          <input
            className="lcSearch"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search loads, carrier, lane, broker, shipper..."
          />
        </div>

        <div className="lcControlGroup">
          <select className="lcSelect" value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option>All Active</option>
            <option>Watch</option>
            <option>Lane Risk</option>
            <option>Attention</option>
          </select>

          <select className="lcSelect" value={day} onChange={(e) => setDay(e.target.value)}>
            <option>Today</option>
            <option>Tomorrow</option>
            <option>Next 48h</option>
          </select>

          <button className="lcBtn" onClick={onPopout}>↗ Popout</button>
          <button className="lcBtnGhost" onClick={() => addLog("Opened settings (stub)")}>⚙ Settings</button>
        </div>
      </div>

      {/* Grid */}
      <div className="lcGrid">
        {/* Left: Ops Queue */}
        <div className="lcCard">
          <div className="lcCardHeader">
            <div className="lcCardTitle">
              <span className="lcDot" /> Operations Queue
            </div>
            <div className="lcCardTools">
              <button className="lcMiniIcon" title="Pin" onClick={() => addLog("Pinned queue (stub)")}>★</button>
              <button className="lcMiniIcon" title="Refresh" onClick={() => addLog("Refreshed (stub)")}>↻</button>
            </div>
          </div>

          <div className="lcQueueHead">
            <div>Load</div>
            <div>Lane</div>
            <div>Next Event</div>
            <div className="taRight">ETA</div>
          </div>

          <div className="lcQueueList">
            {loads.map((l) => (
              <button
                key={l.id}
                className={`lcQueueRow ${selectedId === l.id ? "isActive" : ""}`}
                onClick={() => setSelectedId(l.id)}
              >
                <div className="lcQueueLoad">
                  <div className="lcQueueId">{l.id}</div>
                  <div className={`lcBadge ${badgeClass(l.status)}`}>{l.status}</div>
                </div>
                <div className="lcQueueLane">{l.lane}</div>
                <div className="lcQueueEvent">{l.nextEvent}</div>
                <div className="lcQueueEta taRight">{l.eta}</div>
              </button>
            ))}
          </div>

          <div className="lcCardFooter">
            <div className="lcMuted">Last update</div>
            <div className="lcMutedStrong">{day} • 3:00p</div>
          </div>
        </div>

        {/* Middle: Live Ops */}
        <div className="lcCard lcLive">
          <div className="lcCardHeader">
            <div className="lcCardTitle">
              <span className="lcDot" /> Live Ops
            </div>
            <div className="lcCardTools">
              <span className="lcDots">•••••</span>
            </div>
          </div>

          <div className="lcMap">
            <div className="lcMapOverlay">
              <div className="lcChipRow">
                <span className="lcChip">📍 {selected?.lane}</span>
                <span className="lcChip">🚚 {selected?.carrier}</span>
              </div>
              <div className="lcMapLine" />
              <div className="lcTruck" title="Truck">🚚</div>
            </div>
          </div>

          <div className="lcTimeline">
            <div className="lcTimelineHeader">
              <div className="lcTimelineStatus">In Transit</div>
              <div className="lcTimelineWindow">{selected?.timeline?.[0]?.time || "—"}</div>
              <div className="lcTimelineEta">ETC: {selected?.eta || "—"}</div>
            </div>

            <div className="lcTimelineBody">
              {selected?.timeline?.map((t, idx) => (
                <div key={idx} className="lcStep">
                  <div className={`lcStepDot ${t.state}`} />
                  <div className="lcStepText">
                    <div className="lcStepLabel">{t.label}</div>
                    <div className="lcStepSub">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lcCheckCall">
              <div className="lcCheckCallDots">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className={`lcCCDot ${i < 8 ? "on" : ""}`} />
                ))}
              </div>
              <div className="lcCheckCallLabel">
                Today • check call in{" "}
                <span className="lcEmph">
                  {selected?.checkCallDue === "Now" ? "Now" : selected?.checkCallDue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Stack */}
        <div className="lcStack">
          <div className="lcCard">
            <div className="lcCardHeader">
              <div className="lcCardTitle">Ops Actions</div>
            </div>
            <div className="lcBtnGrid">
              <button className="lcBtnBlock" onClick={markArrivedPU}>Mark Arrived PU</button>
              <button className="lcBtnBlock" onClick={markLoaded}>Mark Loaded</button>
              <button className="lcBtnBlock" onClick={markArrivedDEL}>Mark Arrived DEL</button>
              <button className="lcBtnBlock" onClick={markDelivered}>Mark Delivered</button>
              <button className="lcBtnBlock" onClick={updateETA}>Update ETA</button>
              <button className="lcBtnBlock" onClick={logCheckCall}>Log Check Call</button>
            </div>
          </div>

          <div className="lcCard">
            <div className="lcCardHeader">
              <div className="lcCardTitle">Docs Checklist</div>
            </div>

            <div className="lcChecklist">
              <button className="lcCheckRowBtn" onClick={toggleRateConf}>
                <label className="lcCheckLabel">
                  <input type="checkbox" checked={!!selected?.docs?.rateConf} readOnly /> Rate Confirmation
                </label>
                <span className={`lcCheckPill ${selected?.docs?.rateConf ? "ok" : "pending"}`}>
                  {selected?.docs?.rateConf ? "OK" : "PENDING"}
                </span>
              </button>

              <button className="lcCheckRowBtn" onClick={toggleBOL}>
                <label className="lcCheckLabel">
                  <input type="checkbox" checked={!!selected?.docs?.bol} readOnly /> BOL
                </label>
                <span className={`lcCheckPill ${selected?.docs?.bol ? "ok" : "pending"}`}>
                  {selected?.docs?.bol ? "OK" : "PENDING"}
                </span>
              </button>

              <button className="lcCheckRowBtn" onClick={uploadPOD}>
                <label className="lcCheckLabel">
                  <input type="checkbox" checked={!!selected?.docs?.pod} readOnly /> POD
                </label>
                <span className={`lcCheckPill ${selected?.docs?.pod ? "ok" : "upload"}`}>
                  {selected?.docs?.pod ? "OK" : "UPLOAD"}
                </span>
              </button>
            </div>
          </div>

          <div className="lcCard">
            <div className="lcCardHeader">
              <div className="lcCardTitle">Exceptions & Costs</div>
            </div>
            <div className="lcBtnGrid">
              <button className="lcBtnBlock" onClick={createException}>Create Exception</button>
              <button className="lcBtnBlock" onClick={logDetention}>Log Detention</button>
              <button className="lcBtnBlock" onClick={logTONU}>Log TONU</button>
              <button className="lcBtnBlock" onClick={logLayover}>Log Layover</button>
            </div>

            <input
              className="lcNote"
              placeholder="Add internal note…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (!val) return;
                  addLog(`${selectedId} • Note: ${val}`);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="lcTiny">Press Enter to log a note (local only).</div>
          </div>

          <div className="lcCard">
            <div className="lcCardHeader">
              <div className="lcCardTitle">Alerts & Attention</div>
            </div>

            <div className="lcAlerts">
              {alerts.map((a, i) => (
                <div key={i} className="lcAlertRow">
                  <span className="lcAlertDot" />
                  <span className="lcAlertText">{a}</span>
                </div>
              ))}
            </div>

            <div className="lcActivityWrap">
              <div className="lcActivityTitle">Activity Log</div>
              <div className="lcActivityList">
                {activityLog.map((x, i) => (
                  <div key={i} className="lcActivityRow">{x}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function badgeClass(status) {
  switch (status) {
    case "Attention":
      return "bDanger";
    case "Lane Risk":
      return "bWarn";
    case "Watch":
      return "bInfo";
    default:
      return "bNeutral";
  }
}
