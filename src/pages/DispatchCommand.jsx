import React, { useMemo, useState } from "react";
import "./DispatchCommand.css";

const seed = [
  {
    id: "LD-2041",
    lane: "GA → NC",
    status: "In Transit",
    eta: "Today 4:10p",
    carrier: "ABC Transport",
    driver: "J. Miller",
    rpm: 2.31,
    dtl: "Active",
    notes: "Watch weather corridor.",
  },
  {
    id: "LD-2043",
    lane: "CT → PA",
    status: "Booked",
    eta: "Tomorrow 9:00a",
    carrier: "IronHorse",
    driver: "S. Reed",
    rpm: 2.36,
    dtl: "Off",
    notes: "Pickup appt confirmed.",
  },
  {
    id: "LD-2046",
    lane: "NJ → VA",
    status: "At Risk",
    eta: "Today 6:30p",
    carrier: "BlueLine",
    driver: "K. Jones",
    rpm: 2.48,
    dtl: "Active",
    notes: "Check call due soon.",
  },
];

const STATUS = ["All", "Booked", "In Transit", "At Risk", "Delivered", "Exception"];
const DTL = ["All", "Active", "Off"];

export default function DispatchCommand() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [lane, setLane] = useState("All");
  const [carrier, setCarrier] = useState("All");
  const [dtl, setDtl] = useState("All");

  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [rows, setRows] = useState(seed);

  const lanes = useMemo(() => ["All", ...Array.from(new Set(seed.map((x) => x.lane)))], []);
  const carriers = useMemo(() => ["All", ...Array.from(new Set(seed.map((x) => x.carrier)))], []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "All" && r.status !== status) return false;
      if (lane !== "All" && r.lane !== lane) return false;
      if (carrier !== "All" && r.carrier !== carrier) return false;
      if (dtl !== "All" && r.dtl !== dtl) return false;
      if (!s) return true;
      const hay = `${r.id} ${r.lane} ${r.status} ${r.eta} ${r.carrier} ${r.driver} ${r.dtl}`.toLowerCase();
      return hay.includes(s);
    });
  }, [q, status, lane, carrier, dtl, rows]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || rows[0], [rows, selectedId]);

  const setSelected = (patch) => {
    setRows((prev) => prev.map((r) => (r.id === selectedId ? { ...r, ...patch } : r)));
  };

  const mark = (nextStatus) => setSelected({ status: nextStatus });
  const toggleDTL = () => setSelected({ dtl: selected?.dtl === "Active" ? "Off" : "Active" });

  return (
    <div className="dcPage">
      {/* Header row */}
      <div className="dcHeader">
        <div className="dcTitleWrap">
          <div className="dcTitle">Dispatch Command</div>
          <div className="dcSub">All activity view • filters • dispatch board</div>
        </div>

        <div className="dcHeaderActions">
          <button className="dcBtn" onClick={() => alert("Assign (stub)")}>Assign</button>
          <button className="dcBtnGhost" onClick={() => alert("Open board (stub)")}>View Board</button>
        </div>
      </div>

      {/* Filters */}
      <div className="dcFilters">
        <div className="dcSearchWrap">
          <span className="dcSearchIcon">⌕</span>
          <input
            className="dcSearch"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search load, lane, carrier, driver..."
          />
        </div>

        <div className="dcFilterGroup">
          <div className="dcField">
            <div className="dcLabel">Status</div>
            <select className="dcSelect" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          <div className="dcField">
            <div className="dcLabel">Lane</div>
            <select className="dcSelect" value={lane} onChange={(e) => setLane(e.target.value)}>
              {lanes.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          <div className="dcField">
            <div className="dcLabel">Carrier</div>
            <select className="dcSelect" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              {carriers.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          <div className="dcField">
            <div className="dcLabel">DTL</div>
            <select className="dcSelect" value={dtl} onChange={(e) => setDtl(e.target.value)}>
              {DTL.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="dcGrid">
        {/* Board */}
        <div className="dcCard">
          <div className="dcCardHeader">
            <div className="dcCardTitle">Dispatch Board</div>
            <div className="dcCardMeta">Showing {filtered.length} loads</div>
          </div>

          <div className="dcTable">
            <div className="dcTH">
              <div>Load</div>
              <div>Lane</div>
              <div>Status</div>
              <div>ETA</div>
              <div>Carrier</div>
              <div>Driver</div>
              <div className="taRight">RPM</div>
            </div>

            <div className="dcTB">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  className={`dcTR ${selectedId === r.id ? "isActive" : ""}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="dcCellBold">{r.id}</div>
                  <div>{r.lane}</div>
                  <div>
                    <span className={`dcPill ${pillClass(r.status)}`}>{r.status}</span>
                  </div>
                  <div>{r.eta}</div>
                  <div>{r.carrier}</div>
                  <div>{r.driver}</div>
                  <div className="taRight">${r.rpm.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="dcStack">
          <div className="dcCard">
            <div className="dcCardHeader">
              <div className="dcCardTitle">Load Details</div>
              <div className="dcCardMeta">{selected?.id}</div>
            </div>

            <div className="dcDetails">
              <div className="dcKV">
                <div className="k">Lane</div>
                <div className="v">{selected?.lane}</div>
              </div>
              <div className="dcKV">
                <div className="k">Status</div>
                <div className="v">
                  <span className={`dcPill ${pillClass(selected?.status)}`}>{selected?.status}</span>
                </div>
              </div>
              <div className="dcKV">
                <div className="k">ETA</div>
                <div className="v">{selected?.eta}</div>
              </div>
              <div className="dcKV">
                <div className="k">Carrier</div>
                <div className="v">{selected?.carrier}</div>
              </div>
              <div className="dcKV">
                <div className="k">Driver</div>
                <div className="v">{selected?.driver}</div>
              </div>
              <div className="dcKV">
                <div className="k">RPM</div>
                <div className="v">${selected?.rpm?.toFixed(2)}</div>
              </div>

              <div className="dcKV">
                <div className="k">DTL</div>
                <div className="v">
                  <button className="dcSmallBtn" onClick={toggleDTL}>
                    {selected?.dtl === "Active" ? "Active (toggle)" : "Off (toggle)"}
                  </button>
                </div>
              </div>

              <div className="dcNotes">
                <div className="dcNotesTitle">Notes</div>
                <textarea
                  className="dcTextarea"
                  value={selected?.notes || ""}
                  onChange={(e) => setSelected({ notes: e.target.value })}
                  placeholder="Internal notes…"
                />
              </div>
            </div>
          </div>

          <div className="dcCard">
            <div className="dcCardHeader">
              <div className="dcCardTitle">Quick Actions</div>
              <div className="dcCardMeta">One click status updates</div>
            </div>

            <div className="dcActions">
              <button className="dcBtnBlock" onClick={() => mark("Booked")}>Mark Booked</button>
              <button className="dcBtnBlock" onClick={() => mark("In Transit")}>Mark In Transit</button>
              <button className="dcBtnBlock" onClick={() => mark("At Risk")}>Mark At Risk</button>
              <button className="dcBtnBlock" onClick={() => mark("Delivered")}>Mark Delivered</button>
              <button className="dcBtnBlock" onClick={() => mark("Exception")}>Mark Exception</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pillClass(status) {
  switch (status) {
    case "At Risk":
      return "warn";
    case "Exception":
      return "danger";
    case "Booked":
      return "info";
    case "In Transit":
      return "ok";
    case "Delivered":
      return "neutral";
    default:
      return "neutral";
  }
}
