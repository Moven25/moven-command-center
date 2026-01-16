// src/pages/LoadCommand.jsx
import React, { useMemo, useState, useEffect } from "react";
import "./CommandShell.css";
import "./LoadCommand.css";
import { useData } from "../state/DataContext";
import LoadDocsPanel from "../components/LoadDocsPanel";

const STATUS_OPTIONS = ["Booked", "En Route", "At Pickup", "At Delivery", "Completed", "Issue"];
const PRIORITY_OPTIONS = ["Normal", "High"];

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(iso);
  }
}

// datetime-local -> ISO
function toISOOrNull(value) {
  const v = (value || "").trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ISO -> datetime-local string
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toNumberOrZero(v) {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function LoadCommand() {
  const { loads, carriers, addLoad, updateLoad } = useData();

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [onlyRisk, setOnlyRisk] = useState(false);

  // Panels / modal
  const [addOpen, setAddOpen] = useState(false);
  const [checkCallsOpen, setCheckCallsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // RIGHT PANEL EDIT MODE
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

  // ✅ Right panel tabs
  const [detailTab, setDetailTab] = useState("Overview"); // Overview | Docs

  // Add form
  const [draft, setDraft] = useState({
    id: "",
    status: "Booked",
    priority: "Normal",
    broker: "",
    carrierId: "",
    carrier: "",
    lane: "",
    pickupCity: "",
    pickupAt: "",
    deliveryCity: "",
    deliveryAt: "",
    miles: "",
    rpm: "",
    netRpm: "",
    notes: "",
    detentionRisk: false,
  });

  const filteredLoads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return loads
      .filter((l) => (statusFilter === "All" ? true : l.status === statusFilter))
      .filter((l) => (onlyRisk ? !!l.detentionRisk : true))
      .filter((l) => {
        if (!q) return true;
        const hay = [l.id, l.status, l.priority, l.broker, l.carrier, l.lane, l.pickupCity, l.deliveryCity, l.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [loads, query, statusFilter, onlyRisk]);

  const selectedLoad = useMemo(() => loads.find((l) => l.id === selectedId) || null, [loads, selectedId]);

  // Keep edit draft in sync
  useEffect(() => {
    if (!editOpen) return;
    if (!selectedLoad) {
      setEditOpen(false);
      setEditDraft(null);
      return;
    }
    if (!editDraft || editDraft.id !== selectedLoad.id) {
      setEditDraft(buildEditDraft(selectedLoad));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen, selectedLoad?.id]);

  // When load changes, default tab to Overview
  useEffect(() => {
    setDetailTab("Overview");
  }, [selectedId]);

  function buildEditDraft(load) {
    return {
      id: load.id || "",
      status: load.status || "Booked",
      priority: load.priority || "Normal",
      broker: load.broker || "",
      carrierId: load.carrierId || "",
      lane: load.lane || "",
      pickupCity: load.pickupCity || "",
      pickupAt: toLocalInputValue(load.pickupAt),
      deliveryCity: load.deliveryCity || "",
      deliveryAt: toLocalInputValue(load.deliveryAt),
      miles: load.miles ?? 0,
      netRpm: load.netRpm ?? 0,
      notes: load.notes || "",
      detentionRisk: !!load.detentionRisk,
    };
  }

  function openEditForLoad(load) {
    setSelectedId(load.id);
    setEditDraft(buildEditDraft(load));
    setEditOpen(true);
    setDetailTab("Overview");
  }

  // KPIs
  const now = new Date();
  const sameDay = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const kpis = useMemo(() => {
    const active = loads.filter((l) => !["Completed"].includes(l.status)).length;
    const pickupsToday = loads.filter((l) => sameDay(l.pickupAt)).length;
    const deliveriesToday = loads.filter((l) => sameDay(l.deliveryAt)).length;
    const risk = loads.filter((l) => l.detentionRisk && !["Completed"].includes(l.status)).length;
    return { active, pickupsToday, deliveriesToday, risk };
  }, [loads]);

  function openAdd() {
    setDraft({
      id: "",
      status: "Booked",
      priority: "Normal",
      broker: "",
      carrierId: "",
      carrier: "",
      lane: "",
      pickupCity: "",
      pickupAt: "",
      deliveryCity: "",
      deliveryAt: "",
      miles: "",
      rpm: "",
      netRpm: "",
      notes: "",
      detentionRisk: false,
    });
    setAddOpen(true);
  }

  function saveDraft(e) {
    e.preventDefault();

    if (!draft.carrierId) {
      alert("Please select a Carrier before saving.");
      return;
    }

    const selectedCarrier = carriers.find((c) => c.id === draft.carrierId) || null;
    const carrierName = selectedCarrier?.name || (draft.carrier || "").trim();

    const pickupCity = (draft.pickupCity || "").trim();
    const deliveryCity = (draft.deliveryCity || "").trim();
    const lane =
      (draft.lane || "").trim() ||
      (pickupCity || deliveryCity ? `${pickupCity || "—"} → ${deliveryCity || "—"}` : "");

    const pickupAtISO = toISOOrNull(draft.pickupAt);
    const deliveryAtISO = toISOOrNull(draft.deliveryAt);

    const newLoad = addLoad({
      ...draft,
      broker: (draft.broker || "").trim(),
      carrier: carrierName,
      lane,
      pickupCity,
      deliveryCity,
      pickupAt: pickupAtISO,
      deliveryAt: deliveryAtISO,
      miles: draft.miles === "" ? 0 : Number(draft.miles),
      rpm: draft.rpm === "" ? 0 : Number(draft.rpm),
      netRpm: draft.netRpm === "" ? 0 : Number(draft.netRpm),
      lastCheckCallAt: null,
    });

    setAddOpen(false);
    setSelectedId(newLoad.id);
  }

  function markCheckCall(loadId) {
    updateLoad(loadId, { lastCheckCallAt: new Date().toISOString() });
  }

  function cycleStatus(loadId) {
    const l = loads.find((x) => x.id === loadId);
    if (!l) return;
    const idx = STATUS_OPTIONS.indexOf(l.status);
    const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    updateLoad(loadId, { status: next });
  }

  function saveEdits() {
    if (!selectedLoad || !editDraft) return;

    if (!editDraft.carrierId) {
      alert("Please select a Carrier before saving.");
      return;
    }

    const pickupCity = (editDraft.pickupCity || "").trim();
    const deliveryCity = (editDraft.deliveryCity || "").trim();
    const lane =
      (editDraft.lane || "").trim() ||
      (pickupCity || deliveryCity ? `${pickupCity || "—"} → ${deliveryCity || "—"}` : "");

    const patch = {
      status: editDraft.status,
      priority: editDraft.priority,
      broker: (editDraft.broker || "").trim(),
      carrierId: editDraft.carrierId,
      lane,
      pickupCity,
      pickupAt: toISOOrNull(editDraft.pickupAt),
      deliveryCity,
      deliveryAt: toISOOrNull(editDraft.deliveryAt),
      miles: toNumberOrZero(editDraft.miles),
      netRpm: toNumberOrZero(editDraft.netRpm),
      notes: (editDraft.notes || "").trim(),
      detentionRisk: !!editDraft.detentionRisk,
    };

    updateLoad(selectedLoad.id, patch);
    setEditOpen(false);
    setEditDraft(null);
  }

  function cancelEdits() {
    setEditOpen(false);
    setEditDraft(null);
  }

  return (
    <div className="command-shell loadcmd">
      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Operations</div>
          <h1 className="command-shell__title">Load Command</h1>
          <p className="command-shell__subtitle">
            Manage active loads, booking flow, check calls, and execution status from pickup to delivery.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={() => setCheckCallsOpen(true)}>
            Check Calls
          </button>

          <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={openAdd}>
            Add Load
          </button>
        </div>
      </header>

      {/* KPI STRIP */}
      <section className="loadcmd__kpis">
        <button
          className="loadcmd__kpi"
          type="button"
          onClick={() => {
            setStatusFilter("All");
            setOnlyRisk(false);
          }}
        >
          <div className="loadcmd__kpiLabel">Active</div>
          <div className="loadcmd__kpiValue">{kpis.active}</div>
        </button>

        <button className="loadcmd__kpi" type="button" onClick={() => setQuery("pickup")}>
          <div className="loadcmd__kpiLabel">Pickups Today</div>
          <div className="loadcmd__kpiValue">{kpis.pickupsToday}</div>
        </button>

        <button className="loadcmd__kpi" type="button" onClick={() => setQuery("delivery")}>
          <div className="loadcmd__kpiLabel">Deliveries Today</div>
          <div className="loadcmd__kpiValue">{kpis.deliveriesToday}</div>
        </button>

        <button className="loadcmd__kpi loadcmd__kpi--warn" type="button" onClick={() => setOnlyRisk((v) => !v)}>
          <div className="loadcmd__kpiLabel">Detention Risk</div>
          <div className="loadcmd__kpiValue">{kpis.risk}</div>
        </button>
      </section>

      {/* TOOLBAR */}
      <section className="loadcmd__toolbar">
        <div className="loadcmd__search">
          <input
            className="loadcmd__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search loads, brokers, carriers, cities, notes…"
          />
        </div>

        <div className="loadcmd__filters">
          <select className="loadcmd__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="loadcmd__toggle">
            <input type="checkbox" checked={onlyRisk} onChange={(e) => setOnlyRisk(e.target.checked)} />
            <span>Risk Only</span>
          </label>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="loadcmd__grid">
        {/* TABLE */}
        <div className="loadcmd__card loadcmd__card--wide">
          <div className="loadcmd__cardHeader">
            <div>
              <div className="loadcmd__cardTitle">Active Loads</div>
              <div className="loadcmd__cardSub">
                Showing <strong>{filteredLoads.length}</strong> of <strong>{loads.length}</strong>
              </div>
            </div>

            <div className="loadcmd__cardActions">
              <button
                className="command-shell__btn"
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("All");
                  setOnlyRisk(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="loadcmd__tableWrap">
            <table className="loadcmd__table">
              <thead>
                <tr>
                  <th>Load</th>
                  <th>Status</th>
                  <th>Lane</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Net RPM</th>
                  <th>Check Call</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoads.map((l) => (
                  <tr
                    key={l.id}
                    className={selectedId === l.id ? "is-selected" : ""}
                    onClick={() => setSelectedId(l.id)}
                    onDoubleClick={() => openEditForLoad(l)}
                    role="button"
                    tabIndex={0}
                    title="Double-click to edit"
                  >
                    <td>
                      <div className="loadcmd__cellMain">{l.id}</div>
                      <div className="loadcmd__cellSub">{(l.broker || "—")} · {(l.carrier || "—")}</div>
                    </td>

                    <td>
                      <span
                        className={`loadcmd__chip loadcmd__chip--${String(l.status || "").replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {l.status || "—"}
                      </span>
                      {l.priority === "High" ? <span className="loadcmd__badge">High</span> : null}
                      {l.detentionRisk ? <span className="loadcmd__badge loadcmd__badge--warn">Risk</span> : null}
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{l.lane || "—"}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{l.pickupCity || "—"}</div>
                      <div className="loadcmd__cellSub">{formatDateTime(l.pickupAt)}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{l.deliveryCity || "—"}</div>
                      <div className="loadcmd__cellSub">{formatDateTime(l.deliveryAt)}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{Number(l.netRpm || 0).toFixed(2)}</div>
                      <div className="loadcmd__cellSub">{l.miles ?? 0} mi</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{l.lastCheckCallAt ? formatDateTime(l.lastCheckCallAt) : "—"}</div>
                      <div className="loadcmd__rowActions">
                        <button
                          className="loadcmd__miniBtn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markCheckCall(l.id);
                          }}
                        >
                          Mark
                        </button>
                        <button
                          className="loadcmd__miniBtn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleStatus(l.id);
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLoads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="loadcmd__empty">
                      No loads match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS */}
        <div className="loadcmd__card">
          <div className="loadcmd__cardHeader">
            <div>
              <div className="loadcmd__cardTitle">{editOpen ? "Edit Load" : "Load Detail"}</div>
              <div className="loadcmd__cardSub">{selectedLoad ? selectedLoad.id : "Select a load from the table"}</div>

              {/* ✅ Tabs (only when a load is selected and not editing) */}
              {selectedLoad && !editOpen ? (
                <div className="loadcmd__tabs" style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Overview", "Docs"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`loadcmd__tabBtn ${detailTab === t ? "is-active" : ""}`}
                      onClick={() => setDetailTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {selectedLoad ? (
              <div className="loadcmd__cardActions">
                {!editOpen ? (
                  <button className="command-shell__btn" type="button" onClick={() => openEditForLoad(selectedLoad)} title="Edit this load">
                    Edit
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!selectedLoad ? (
            <div className="loadcmd__detailEmpty">Click a row to view details. Double-click a row to edit.</div>
          ) : editOpen && editDraft ? (
            // EDIT MODE (unchanged)
            <div className="loadcmd__detail">
              {/* Status */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Status</div>
                <div className="loadcmd__value">
                  <select
                    className="loadcmd__select"
                    value={editDraft.status}
                    onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Priority</div>
                <div className="loadcmd__value">
                  <select
                    className="loadcmd__select"
                    value={editDraft.priority}
                    onChange={(e) => setEditDraft((d) => ({ ...d, priority: e.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Broker */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Broker</div>
                <div className="loadcmd__value">
                  <input
                    className="loadcmd__input"
                    value={editDraft.broker}
                    onChange={(e) => setEditDraft((d) => ({ ...d, broker: e.target.value }))}
                    placeholder="Broker name (optional)"
                  />
                </div>
              </div>

              {/* Carrier */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Carrier</div>
                <div className="loadcmd__value">
                  <select
                    className="loadcmd__select"
                    value={editDraft.carrierId}
                    onChange={(e) => setEditDraft((d) => ({ ...d, carrierId: e.target.value }))}
                  >
                    <option value="" disabled>
                      Select carrier…
                    </option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lane */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Lane</div>
                <div className="loadcmd__value">
                  <input
                    className="loadcmd__input"
                    value={editDraft.lane}
                    onChange={(e) => setEditDraft((d) => ({ ...d, lane: e.target.value }))}
                    placeholder="City, ST → City, ST (optional)"
                  />
                </div>
              </div>

              {/* Pickup */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pickup</div>
                <div className="loadcmd__value">
                  <div style={{ display: "grid", gap: 10 }}>
                    <input
                      className="loadcmd__input"
                      value={editDraft.pickupCity}
                      onChange={(e) => setEditDraft((d) => ({ ...d, pickupCity: e.target.value }))}
                      placeholder="Pickup city (optional)"
                    />
                    <input
                      className="loadcmd__input"
                      type="datetime-local"
                      value={editDraft.pickupAt}
                      onChange={(e) => setEditDraft((d) => ({ ...d, pickupAt: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Delivery</div>
                <div className="loadcmd__value">
                  <div style={{ display: "grid", gap: 10 }}>
                    <input
                      className="loadcmd__input"
                      value={editDraft.deliveryCity}
                      onChange={(e) => setEditDraft((d) => ({ ...d, deliveryCity: e.target.value }))}
                      placeholder="Delivery city (optional)"
                    />
                    <input
                      className="loadcmd__input"
                      type="datetime-local"
                      value={editDraft.deliveryAt}
                      onChange={(e) => setEditDraft((d) => ({ ...d, deliveryAt: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pricing</div>
                <div className="loadcmd__value">
                  <div style={{ display: "grid", gap: 10 }}>
                    <input
                      className="loadcmd__input"
                      value={editDraft.netRpm}
                      onChange={(e) => setEditDraft((d) => ({ ...d, netRpm: e.target.value }))}
                      placeholder="Net RPM"
                    />
                    <input
                      className="loadcmd__input"
                      value={editDraft.miles}
                      onChange={(e) => setEditDraft((d) => ({ ...d, miles: e.target.value }))}
                      placeholder="Miles"
                    />
                  </div>
                </div>
              </div>

              {/* Risk */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Risk</div>
                <div className="loadcmd__value">
                  <label className="loadcmd__toggle">
                    <input
                      type="checkbox"
                      checked={!!editDraft.detentionRisk}
                      onChange={(e) => setEditDraft((d) => ({ ...d, detentionRisk: e.target.checked }))}
                    />
                    <span>Detention Risk</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Notes</div>
                <div className="loadcmd__value">
                  <textarea
                    className="loadcmd__textarea"
                    value={editDraft.notes}
                    onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Notes (optional)"
                  />
                </div>
              </div>

              <div className="loadcmd__detailActions">
                <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={saveEdits}>
                  Save Changes
                </button>
                <button className="command-shell__btn" type="button" onClick={cancelEdits}>
                  Cancel
                </button>

                <button className="command-shell__btn" type="button" onClick={() => markCheckCall(selectedLoad.id)}>
                  Mark Check Call
                </button>
                <button className="command-shell__btn" type="button" onClick={() => cycleStatus(selectedLoad.id)}>
                  Advance Status
                </button>
              </div>
            </div>
          ) : (
            // VIEW MODE (Overview / Docs)
            <div className="loadcmd__detail">
              {detailTab === "Docs" ? (
                <LoadDocsPanel loadId={selectedLoad.id} />
              ) : (
                <>
                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Status</div>
                    <div className="loadcmd__value">
                      <span
                        className={`loadcmd__chip loadcmd__chip--${String(selectedLoad.status || "").replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {selectedLoad.status || "—"}
                      </span>
                      {selectedLoad.detentionRisk ? <span className="loadcmd__badge loadcmd__badge--warn">Detention Risk</span> : null}
                    </div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Broker</div>
                    <div className="loadcmd__value">{selectedLoad.broker || "—"}</div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Carrier</div>
                    <div className="loadcmd__value">{selectedLoad.carrier || "—"}</div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Lane</div>
                    <div className="loadcmd__value">{selectedLoad.lane || "—"}</div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Pickup</div>
                    <div className="loadcmd__value">
                      {(selectedLoad.pickupCity || "—")} · {formatDateTime(selectedLoad.pickupAt)}
                    </div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Delivery</div>
                    <div className="loadcmd__value">
                      {(selectedLoad.deliveryCity || "—")} · {formatDateTime(selectedLoad.deliveryAt)}
                    </div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Pricing</div>
                    <div className="loadcmd__value">
                      Net RPM {Number(selectedLoad.netRpm || 0).toFixed(2)} · {selectedLoad.miles ?? 0} miles
                    </div>
                  </div>

                  <div className="loadcmd__detailRow">
                    <div className="loadcmd__label">Notes</div>
                    <div className="loadcmd__value loadcmd__value--notes">{selectedLoad.notes || "—"}</div>
                  </div>

                  <div className="loadcmd__detailActions">
                    <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={() => openEditForLoad(selectedLoad)}>
                      Edit
                    </button>

                    <button className="command-shell__btn" type="button" onClick={() => markCheckCall(selectedLoad.id)}>
                      Mark Check Call
                    </button>
                    <button className="command-shell__btn" type="button" onClick={() => cycleStatus(selectedLoad.id)}>
                      Advance Status
                    </button>

                    <button className="command-shell__btn" type="button" onClick={() => setDetailTab("Docs")}>
                      Open Docs
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ADD LOAD MODAL */}
      {addOpen ? (
        <div className="loadcmd__modalOverlay" role="dialog" aria-modal="true">
          <div className="loadcmd__modal">
            <div className="loadcmd__modalHeader">
              <div>
                <div className="loadcmd__modalTitle">Add Load</div>
                <div className="loadcmd__modalSub">Shared store — saving here updates Carrier Load History instantly.</div>
              </div>
              <button className="loadcmd__close" type="button" onClick={() => setAddOpen(false)}>
                ✕
              </button>
            </div>

            <form className="loadcmd__form" onSubmit={saveDraft}>
              <div className="loadcmd__formGrid">
                <label className="loadcmd__field">
                  <span>Load ID (optional)</span>
                  <input className="loadcmd__input" value={draft.id} onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))} placeholder="LD-10299" />
                </label>

                <label className="loadcmd__field">
                  <span>Status</span>
                  <select className="loadcmd__select" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="loadcmd__field">
                  <span>Broker (optional)</span>
                  <input className="loadcmd__input" value={draft.broker} onChange={(e) => setDraft((d) => ({ ...d, broker: e.target.value }))} placeholder="Broker name" />
                </label>

                <label className="loadcmd__field">
                  <span>Carrier (required)</span>
                  <select
                    className="loadcmd__select"
                    value={draft.carrierId}
                    onChange={(e) => {
                      const carrierId = e.target.value;
                      const c = carriers.find((x) => x.id === carrierId) || null;
                      setDraft((d) => ({ ...d, carrierId, carrier: c?.name || "" }));
                    }}
                    required
                  >
                    <option value="" disabled>
                      Select carrier…
                    </option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="loadcmd__field loadcmd__field--wide">
                  <span>Lane (optional)</span>
                  <input className="loadcmd__input" value={draft.lane} onChange={(e) => setDraft((d) => ({ ...d, lane: e.target.value }))} placeholder="City, ST → City, ST" />
                </label>

                <label className="loadcmd__field">
                  <span>Pickup City (optional)</span>
                  <input className="loadcmd__input" value={draft.pickupCity} onChange={(e) => setDraft((d) => ({ ...d, pickupCity: e.target.value }))} placeholder="Chicago, IL" />
                </label>

                <label className="loadcmd__field">
                  <span>Pickup Date/Time (optional)</span>
                  <input className="loadcmd__input" type="datetime-local" value={draft.pickupAt} onChange={(e) => setDraft((d) => ({ ...d, pickupAt: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Delivery City (optional)</span>
                  <input className="loadcmd__input" value={draft.deliveryCity} onChange={(e) => setDraft((d) => ({ ...d, deliveryCity: e.target.value }))} placeholder="Dallas, TX" />
                </label>

                <label className="loadcmd__field">
                  <span>Delivery Date/Time (optional)</span>
                  <input className="loadcmd__input" type="datetime-local" value={draft.deliveryAt} onChange={(e) => setDraft((d) => ({ ...d, deliveryAt: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Miles (optional)</span>
                  <input className="loadcmd__input" value={draft.miles} onChange={(e) => setDraft((d) => ({ ...d, miles: e.target.value }))} placeholder="925" />
                </label>

                <label className="loadcmd__field">
                  <span>Net RPM (optional)</span>
                  <input className="loadcmd__input" value={draft.netRpm} onChange={(e) => setDraft((d) => ({ ...d, netRpm: e.target.value }))} placeholder="2.18" />
                </label>

                <label className="loadcmd__field loadcmd__field--wide">
                  <span>Notes (optional)</span>
                  <textarea className="loadcmd__textarea" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="Special instructions, appointment notes, contact preferences…" />
                </label>

                <label className="loadcmd__toggle loadcmd__toggle--wide">
                  <input type="checkbox" checked={draft.detentionRisk} onChange={(e) => setDraft((d) => ({ ...d, detentionRisk: e.target.checked }))} />
                  <span>Flag as Detention Risk</span>
                </label>
              </div>

              <div className="loadcmd__formActions">
                <button className="command-shell__btn" type="button" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
                <button className="command-shell__btn command-shell__btn--primary" type="submit">
                  Save Load
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* CHECK CALLS PANEL */}
      {checkCallsOpen ? (
        <div className="loadcmd__modalOverlay" role="dialog" aria-modal="true">
          <div className="loadcmd__modal loadcmd__modal--panel">
            <div className="loadcmd__modalHeader">
              <div>
                <div className="loadcmd__modalTitle">Check Calls</div>
                <div className="loadcmd__modalSub">Quick list of loads that need updates. (Shared)</div>
              </div>
              <button className="loadcmd__close" type="button" onClick={() => setCheckCallsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="loadcmd__panelBody">
              {loads
                .filter((l) => !["Completed"].includes(l.status))
                .map((l) => (
                  <div key={l.id} className="loadcmd__panelRow">
                    <div>
                      <div className="loadcmd__cellMain">
                        {l.id} · {(l.carrier || "—")}
                      </div>
                      <div className="loadcmd__cellSub">{l.lane || "—"}</div>
                    </div>

                    <div className="loadcmd__panelRight">
                      <span
                        className={`loadcmd__chip loadcmd__chip--${String(l.status || "").replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {l.status || "—"}
                      </span>
                      <button className="loadcmd__miniBtn" type="button" onClick={() => markCheckCall(l.id)}>
                        Mark
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
