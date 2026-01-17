// src/pages/BrokerCommand.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CommandShell.css";
import "./BrokerCommand.css";
import { useData } from "../state/DataContext";

/* -----------------------------
  Helpers
------------------------------ */
function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function riskLabel(score) {
  const n = Number(score || 0);
  if (n <= 25) return "Low";
  if (n <= 55) return "Medium";
  return "High";
}

function formatWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SETUP_ITEMS = [
  { key: "setupPacketReceived", label: "Setup packet received" },
  { key: "creditApproved", label: "Credit check / factoring approval" },
  { key: "rateConfProcessConfirmed", label: "Rate confirmation process confirmed" },
  { key: "detentionTonuConfirmed", label: "Detention / TONU terms confirmed" },
  { key: "afterHoursContact", label: "After-hours / weekend contact" },
];

function setupProgress(broker) {
  const s = broker?.setup || {};
  const done = SETUP_ITEMS.reduce((acc, it) => acc + (s[it.key] ? 1 : 0), 0);
  const total = SETUP_ITEMS.length;
  const pct = Math.round((done / total) * 100);
  return { done, total, pct };
}

function statusTone(status) {
  const v = String(status || "").toLowerCase();
  if (v === "ready") return "ok";
  return "warn";
}

/* -----------------------------
  Component
------------------------------ */
export default function BrokerCommand() {
  const data = useData();
  const { brokers, addBroker, updateBroker, markBrokerContact, toggleBrokerSetupItem } = data;

  const [selectedId, setSelectedId] = useState(brokers?.[0]?.id || null);

  useEffect(() => {
    if (!brokers?.length) return;
    const exists = brokers.some((b) => b.id === selectedId);
    if (!exists) setSelectedId(brokers[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokers]);

  const selected = useMemo(
    () => brokers.find((b) => b.id === selectedId) || null,
    [brokers, selectedId]
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("Overview");

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return brokers;
    return brokers.filter((b) => {
      const hay = `${b.name || ""} ${b.id || ""} ${b.email || ""} ${b.phone || ""} ${b.city || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [brokers, search]);

  // KPIs
  const stats = useMemo(() => {
    const total = brokers.length;
    const atRisk = brokers.filter((b) => (b.riskScore || 0) > 55).length;
    const hot = brokers.filter((b) => (b.hotList ? true : false)).length;
    const noNotes = brokers.filter((b) => !String(b.negotiationNotes || "").trim()).length;
    return { total, atRisk, hot, noNotes };
  }, [brokers]);

  // Add Broker modal
  const [addOpen, setAddOpen] = useState(false);

  const emptySetup = useMemo(
    () => ({
      setupPacketReceived: false,
      creditApproved: false,
      rateConfProcessConfirmed: false,
      detentionTonuConfirmed: false,
      afterHoursContact: false,
    }),
    []
  );

  const [draft, setDraft] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    creditDays: 30,
    riskScore: 35,
    hotList: false,
    negotiationNotes: "",
    lanesNotes: "",
    lastContactAt: new Date().toISOString(),
    // ✅ NEW: setup lives in the add modal too
    setup: { ...emptySetup },
    setupStatus: "Blocked",
    setupConfirmedAt: "",
    activity: [],
  });

  // Lightweight toast (no new libs)
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  function openProfile(nextTab = "Overview") {
    if (!selected) return;
    setTab(nextTab);
    setDrawerOpen(true);
  }

  function markContact() {
    if (!selected) return;
    if (typeof markBrokerContact === "function") {
      markBrokerContact(selected.id);
      setToast({ tone: "ok", text: "Contact marked." });
      return;
    }
    updateBroker(selected.id, { lastContactAt: new Date().toISOString() });
    setToast({ tone: "ok", text: "Contact marked." });
  }

  // ----- Add Modal Setup Logic -----
  const draftProg = useMemo(() => setupProgress(draft), [draft]);
  const canConfirmDraftSetup = draftProg.pct === 100;

  function toggleDraftSetupItem(key) {
    setDraft((d) => {
      const setup = { ...(d.setup || {}) };
      setup[key] = !setup[key];
      const next = { ...d, setup };

      // auto setupStatus based on progress
      const prog = setupProgress(next);
      next.setupStatus = prog.pct === 100 ? "Ready" : "Blocked";
      if (prog.pct !== 100) next.setupConfirmedAt = "";

      return next;
    });
  }

  function confirmDraftSetupComplete() {
    if (!canConfirmDraftSetup) return;
    const now = new Date().toISOString();
    setDraft((d) => ({
      ...d,
      setupStatus: "Ready",
      setupConfirmedAt: now,
      activity: [{ at: now, text: "Setup confirmed complete (during creation)." }, ...(Array.isArray(d.activity) ? d.activity : [])].slice(0, 50),
    }));
    setToast({ tone: "ok", text: "Setup confirmed ✅" });
  }

  function saveAdd(e) {
    e.preventDefault();
    const name = String(draft.name || "").trim();
    if (!name) return;

    const now = new Date().toISOString();

    // Ensure status is correct at save-time
    const prog = setupProgress(draft);
    const setupStatus = prog.pct === 100 ? "Ready" : "Blocked";

    const record = {
      ...draft,
      name,
      lastContactAt: now,
      setupStatus,
      setupConfirmedAt: prog.pct === 100 ? (draft.setupConfirmedAt || now) : "",
      activity: [
        { at: now, text: "Broker created." },
        ...(Array.isArray(draft.activity) ? draft.activity : []),
      ].slice(0, 50),
    };

    const created = addBroker(record);
    if (created?.id) {
      setSelectedId(created.id);
      setAddOpen(false);
      setDrawerOpen(true);
      setTab("Overview");
      setToast({ tone: "ok", text: setupStatus === "Ready" ? "Broker created (READY)." : "Broker created (BLOCKED)." });
    }
  }

  const actions = useMemo(() => {
    if (!selected) return null;

    const risk = riskLabel(selected.riskScore || 0);
    const hasNotes = !!String(selected.negotiationNotes || "").trim();
    const prog = setupProgress(selected);

    if (prog.pct < 100) {
      return {
        tone: "warn",
        icon: "🧾",
        title: "Setup not complete",
        detail: `Finish broker setup checklist (${prog.done}/${prog.total}). Don’t trust payment terms until confirmed.`,
        cta: "Open Setup",
        tab: "Setup",
      };
    }

    if (risk === "High") {
      return {
        tone: "warn",
        icon: "⚠️",
        title: "High Risk Broker",
        detail: "Confirm credit/factoring approval, tighten terms, and require setup packet every time.",
        cta: "Open Notes",
        tab: "Notes",
      };
    }

    if (!hasNotes) {
      return {
        tone: "warn",
        icon: "📝",
        title: "Missing Negotiation Notes",
        detail: "Add your script + fallback counters so every call is consistent.",
        cta: "Add Notes",
        tab: "Notes",
      };
    }

    return {
      tone: "ok",
      icon: "✅",
      title: "Ready",
      detail: "Setup complete and notes exist. Keep contact cadence tight.",
      cta: "Open Lanes",
      tab: "Lanes",
    };
  }, [selected]);

  const notesRef = useRef(null);

  // Setup confirmation behaviors (existing brokers)
  const selProg = useMemo(
    () => (selected ? setupProgress(selected) : { done: 0, total: SETUP_ITEMS.length, pct: 0 }),
    [selected]
  );
  const canConfirmSetup = !!selected && selProg.pct === 100;

  function confirmSetupComplete() {
    if (!selected) return;
    const now = new Date().toISOString();

    updateBroker(selected.id, {
      setupStatus: "Ready",
      setupConfirmedAt: now,
      activity: [
        { at: now, text: "Setup confirmed complete." },
        ...(Array.isArray(selected.activity) ? selected.activity : []),
      ].slice(0, 50),
    });

    setToast({ tone: "ok", text: "Setup confirmed ✅" });
  }

  return (
    <div className="command-shell brokercmd">
      {/* Toast */}
      {toast ? (
        <div className={`brokercmd__toast brokercmd__toast--${toast.tone}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      ) : null}

      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Operations</div>
          <h1 className="command-shell__title">Broker Command</h1>
          <p className="command-shell__subtitle">
            Broker profiles, negotiation notes, credit/risk signals, and lane preferences — all in one place.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={markContact} disabled={!selected}>
            Mark Contact
          </button>
          <button className="command-shell__btn" type="button" onClick={() => setDrawerOpen(true)} disabled={!selected}>
            Open Profile
          </button>
          <button
            className="command-shell__btn command-shell__btn--primary"
            type="button"
            onClick={() => {
              setDraft({
                id: "",
                name: "",
                email: "",
                phone: "",
                city: "",
                creditDays: 30,
                riskScore: 35,
                hotList: false,
                negotiationNotes: "",
                lanesNotes: "",
                lastContactAt: new Date().toISOString(),
                setup: { ...emptySetup },
                setupStatus: "Blocked",
                setupConfirmedAt: "",
                activity: [],
              });
              setAddOpen(true);
            }}
          >
            Add Broker
          </button>
        </div>
      </header>

      {/* KPIs */}
      <section className="brokercmd__kpis">
        <div className="brokercmd__kpi">
          <div className="brokercmd__kpiLabel">Total</div>
          <div className="brokercmd__kpiValue">{stats.total}</div>
        </div>
        <div className="brokercmd__kpi brokercmd__kpi--warn">
          <div className="brokercmd__kpiLabel">High Risk</div>
          <div className="brokercmd__kpiValue">{stats.atRisk}</div>
        </div>
        <div className="brokercmd__kpi brokercmd__kpi--info">
          <div className="brokercmd__kpiLabel">Hot List</div>
          <div className="brokercmd__kpiValue">{stats.hot}</div>
        </div>
        <div className="brokercmd__kpi brokercmd__kpi--warn">
          <div className="brokercmd__kpiLabel">No Notes</div>
          <div className="brokercmd__kpiValue">{stats.noNotes}</div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="brokercmd__grid">
        {/* LIST */}
        <div className="brokercmd__card brokercmd__card--wide">
          <div className="brokercmd__cardHeader">
            <div>
              <div className="brokercmd__cardTitle">Broker List</div>
              <div className="brokercmd__cardSub">Click to select · Double click to open profile.</div>
            </div>

            <div className="brokercmd__search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search broker name, email, city, id…"
              />
            </div>
          </div>

          <div className="brokercmd__tableWrap">
            <table className="brokercmd__table">
              <thead>
                <tr>
                  <th>Broker</th>
                  <th>Setup</th>
                  <th>Risk</th>
                  <th>Credit</th>
                  <th>Hot</th>
                  <th>Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const isSel = b.id === selectedId;
                  const risk = riskLabel(b.riskScore || 0);
                  const prog = setupProgress(b);
                  const tone = statusTone(b.setupStatus);

                  return (
                    <tr
                      key={b.id}
                      className={`${isSel ? "is-selected" : ""} row--risk-${risk.toLowerCase()}`}
                      onClick={() => setSelectedId(b.id)}
                      onDoubleClick={() => {
                        setSelectedId(b.id);
                        setDrawerOpen(true);
                        setTab("Overview");
                      }}
                      title="Click to select · Double click to open profile"
                    >
                      <td>
                        <div className="brokercmd__cellMain">{b.name}</div>
                        <div className="brokercmd__cellSub">
                          {b.id} · {b.city || "—"}
                        </div>
                      </td>

                      <td>
                        <span className={`brokercmd__chip brokercmd__chip--${tone}`}>
                          {String(b.setupStatus || "Blocked").toUpperCase()}
                        </span>
                        <span className="brokercmd__setupPct">{prog.pct}%</span>
                      </td>

                      <td>
                        <span className={`brokercmd__chip brokercmd__chip--${risk.toLowerCase()}`}>{risk}</span>
                      </td>
                      <td>{Number(b.creditDays || 0)}d</td>
                      <td>{b.hotList ? "🔥" : "—"}</td>
                      <td>{formatWhen(b.lastContactAt)}</td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="brokercmd__empty">
                      No brokers found. Click <strong>Add Broker</strong>.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL */}
        <div className="brokercmd__card">
          <div className="brokercmd__cardHeader">
            <div>
              <div className="brokercmd__cardTitle">Broker Detail</div>
              <div className="brokercmd__cardSub">{selected ? selected.name : "Select a broker"}</div>
            </div>
          </div>

          {!selected ? (
            <div className="brokercmd__detailEmpty">Select a broker from the list.</div>
          ) : (
            <div className="brokercmd__detail">
              {actions ? (
                <div className={`brokercmd__suggest brokercmd__suggest--${actions.tone}`}>
                  <div className="brokercmd__suggestTop">
                    <div className="brokercmd__suggestTitle">
                      <span className="brokercmd__suggestIcon">{actions.icon}</span>
                      <span>Suggested Action</span>
                    </div>
                    <span className="brokercmd__suggestBadge">{actions.title}</span>
                  </div>
                  <div className="brokercmd__suggestDetail">{actions.detail}</div>
                  <div className="brokercmd__suggestActions">
                    <button
                      className="command-shell__btn command-shell__btn--primary"
                      type="button"
                      onClick={() => openProfile(actions.tab)}
                    >
                      {actions.cta}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="brokercmd__detailRow">
                <div className="brokercmd__label">Setup</div>
                <div className="brokercmd__value">
                  <strong>{String(selected.setupStatus || "Blocked")}</strong> · {selProg.done}/{selProg.total} ({selProg.pct}%)
                  {selected.setupConfirmedAt ? (
                    <div className="brokercmd__tiny">Confirmed: {formatWhen(selected.setupConfirmedAt)}</div>
                  ) : null}
                </div>
              </div>

              <div className="brokercmd__detailRow">
                <div className="brokercmd__label">Risk</div>
                <div className="brokercmd__value">
                  <strong>{riskLabel(selected.riskScore || 0)}</strong> ({selected.riskScore || 0})
                </div>
              </div>

              <div className="brokercmd__detailRow">
                <div className="brokercmd__label">Credit Terms</div>
                <div className="brokercmd__value">{Number(selected.creditDays || 0)} days</div>
              </div>

              <div className="brokercmd__detailRow">
                <div className="brokercmd__label">Contact</div>
                <div className="brokercmd__value">
                  {selected.phone || "—"}
                  <br />
                  {selected.email || "—"}
                </div>
              </div>

              <div className="brokercmd__detailActions">
                <button className="command-shell__btn" type="button" onClick={() => openProfile("Overview")}>
                  Overview
                </button>
                <button className="command-shell__btn" type="button" onClick={() => openProfile("Notes")}>
                  Notes
                </button>
                <button className="command-shell__btn" type="button" onClick={() => openProfile("Lanes")}>
                  Lanes
                </button>
                <button className="command-shell__btn" type="button" onClick={() => openProfile("Setup")}>
                  Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ADD BROKER MODAL */}
      {addOpen ? (
        <div className="brokercmd__overlay" role="dialog" aria-modal="true" onClick={() => setAddOpen(false)}>
          <div className="brokercmd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="brokercmd__modalHeader">
              <div>
                <div className="brokercmd__modalTitle">Add Broker</div>
                <div className="brokercmd__modalSub">
                  Create a broker profile for consistent negotiation and lanes. Add setup items now to activate.
                </div>
              </div>
              <button className="brokercmd__close" type="button" onClick={() => setAddOpen(false)}>
                ✕
              </button>
            </div>

            <form className="brokercmd__form" onSubmit={saveAdd}>
              <div className="brokercmd__formGrid">
                <label className="brokercmd__field">
                  <span>Broker ID (optional)</span>
                  <input
                    value={draft.id}
                    onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
                    placeholder="BR-10201"
                  />
                </label>

                <label className="brokercmd__field brokercmd__field--wide">
                  <span>Broker Name</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Brokerage name"
                    required
                  />
                </label>

                <label className="brokercmd__field">
                  <span>Email</span>
                  <input
                    value={draft.email}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    placeholder="ops@broker.com"
                  />
                </label>

                <label className="brokercmd__field">
                  <span>Phone</span>
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(555) 555-5555"
                  />
                </label>

                <label className="brokercmd__field">
                  <span>City</span>
                  <input
                    value={draft.city}
                    onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                    placeholder="Chicago, IL"
                  />
                </label>

                <label className="brokercmd__field">
                  <span>Credit Days</span>
                  <input
                    type="number"
                    value={draft.creditDays}
                    onChange={(e) => setDraft((d) => ({ ...d, creditDays: Number(e.target.value || 0) }))}
                  />
                </label>

                <label className="brokercmd__field">
                  <span>Risk Score (0-100)</span>
                  <input
                    type="number"
                    value={draft.riskScore}
                    onChange={(e) => setDraft((d) => ({ ...d, riskScore: Number(e.target.value || 0) }))}
                  />
                </label>

                <label className="brokercmd__toggle brokercmd__field--wide">
                  <input
                    type="checkbox"
                    checked={!!draft.hotList}
                    onChange={(e) => setDraft((d) => ({ ...d, hotList: e.target.checked }))}
                  />
                  <span>Hot List (preferred broker)</span>
                </label>
              </div>

              {/* ✅ NEW: Activation / Setup Checklist inside Add Broker */}
              <div className="brokercmd__modalSetup">
                <div className="brokercmd__modalSetupTop">
                  <div>
                    <div className="brokercmd__modalSetupTitle">Broker Setup (Activation)</div>
                    <div className="brokercmd__modalSetupSub">
                      {draftProg.done}/{draftProg.total} complete · {draftProg.pct}% ·{" "}
                      <strong>{String(draft.setupStatus || "Blocked")}</strong>
                      {draft.setupConfirmedAt ? (
                        <span className="brokercmd__tiny"> · Confirmed: {formatWhen(draft.setupConfirmedAt)}</span>
                      ) : null}
                    </div>
                  </div>

                  {canConfirmDraftSetup ? (
                    <button
                      type="button"
                      className="command-shell__btn command-shell__btn--primary"
                      onClick={confirmDraftSetupComplete}
                    >
                      Confirm Setup Complete
                    </button>
                  ) : (
                    <button type="button" className="command-shell__btn" disabled>
                      Confirm Setup Complete
                    </button>
                  )}
                </div>

                <div className="brokercmd__setupBar">
                  <div className="brokercmd__setupBarTop">
                    <strong>{draftProg.done}/{draftProg.total}</strong>
                    <span>{draftProg.pct}%</span>
                  </div>
                  <div className="brokercmd__setupBarTrack">
                    <div className="brokercmd__setupBarFill" style={{ width: `${draftProg.pct}%` }} />
                  </div>
                </div>

                <div className="brokercmd__checklist">
                  {SETUP_ITEMS.map((it) => {
                    const on = !!(draft.setup || {})[it.key];
                    return (
                      <button
                        key={it.key}
                        type="button"
                        className={`brokercmd__check ${on ? "is-on" : "is-off"}`}
                        onClick={() => toggleDraftSetupItem(it.key)}
                      >
                        <span>{on ? "☑" : "☐"}</span>
                        <span>{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="brokercmd__modalActions">
                <button className="command-shell__btn" type="button" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
                <button className="command-shell__btn command-shell__btn--primary" type="submit">
                  Save Broker
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* PROFILE DRAWER */}
      {drawerOpen && selected ? (
        <div className="brokercmd__drawerOverlay" role="dialog" aria-modal="true" onClick={() => setDrawerOpen(false)}>
          <aside className="brokercmd__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="brokercmd__drawerHeader">
              <div>
                <div className="brokercmd__drawerTitle">{selected.name}</div>
                <div className="brokercmd__drawerSub">
                  {selected.id} · {selected.city || "—"}
                </div>
              </div>
              <button className="brokercmd__drawerClose" type="button" onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>

            <div className="brokercmd__tabs" role="tablist" aria-label="Broker profile tabs">
              {["Overview", "Notes", "Lanes", "Setup"].map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`brokercmd__tab ${tab === t ? "is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="brokercmd__drawerBody">
              {tab === "Overview" ? (
                <div className="brokercmd__drawerGrid">
                  <div className="brokercmd__drawerCard">
                    <div className="brokercmd__drawerCardTitle">Setup</div>
                    <div className="brokercmd__drawerBig">{setupProgress(selected).pct}%</div>
                    <div className="brokercmd__drawerHint">
                      {setupProgress(selected).done}/{setupProgress(selected).total} complete ·{" "}
                      {String(selected.setupStatus || "Blocked")}
                    </div>
                  </div>

                  <div className="brokercmd__drawerCard">
                    <div className="brokercmd__drawerCardTitle">Risk</div>
                    <div className="brokercmd__drawerBig">{riskLabel(selected.riskScore || 0)}</div>
                    <div className="brokercmd__drawerHint">Score: {selected.riskScore || 0}</div>
                  </div>

                  <div className="brokercmd__drawerCard">
                    <div className="brokercmd__drawerCardTitle">Credit Terms</div>
                    <div className="brokercmd__drawerBig">{Number(selected.creditDays || 0)}d</div>
                    <div className="brokercmd__drawerHint">Store invoice expectations here later.</div>
                  </div>

                  <div className="brokercmd__drawerCard brokercmd__drawerCard--wide">
                    <div className="brokercmd__drawerCardTitle">Contact</div>
                    <div className="brokercmd__drawerLine">
                      <span>Email</span>
                      <strong>{selected.email || "—"}</strong>
                    </div>
                    <div className="brokercmd__drawerLine">
                      <span>Phone</span>
                      <strong>{selected.phone || "—"}</strong>
                    </div>
                    <div className="brokercmd__drawerLine">
                      <span>Last Contact</span>
                      <strong>{formatWhen(selected.lastContactAt)}</strong>
                    </div>
                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn" type="button" onClick={markContact}>
                        Mark Contact
                      </button>
                      <button
                        className="command-shell__btn"
                        type="button"
                        onClick={() => updateBroker(selected.id, { hotList: !selected.hotList })}
                      >
                        {selected.hotList ? "Remove Hot List" : "Add Hot List"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "Notes" ? (
                <div className="brokercmd__drawerGrid">
                  <div className="brokercmd__drawerCard brokercmd__drawerCard--wide">
                    <div className="brokercmd__drawerCardTitle">Negotiation Notes</div>
                    <div className="brokercmd__drawerHint">
                      Put your script here (pain extraction, counters, minimums, detention, TONU, rate floor).
                    </div>
                    <textarea
                      ref={notesRef}
                      className="brokercmd__textarea"
                      value={selected.negotiationNotes || ""}
                      onChange={(e) => updateBroker(selected.id, { negotiationNotes: e.target.value })}
                      placeholder="Example: If they say ‘that’s all I have’ → ask ‘what’s your target?’ → anchor higher → confirm accessorials…"
                    />
                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn" type="button" onClick={() => notesRef.current?.focus()}>
                        Focus Editor
                      </button>
                      <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={markContact}>
                        Save + Mark Contact
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "Lanes" ? (
                <div className="brokercmd__drawerGrid">
                  <div className="brokercmd__drawerCard brokercmd__drawerCard--wide">
                    <div className="brokercmd__drawerCardTitle">Lane Preferences</div>
                    <div className="brokercmd__drawerHint">
                      Track lanes they post, strong markets, weak markets, and “don’t touch” rules.
                    </div>
                    <textarea
                      className="brokercmd__textarea"
                      value={selected.lanesNotes || ""}
                      onChange={(e) => updateBroker(selected.id, { lanesNotes: e.target.value })}
                      placeholder="Examples: CHI→DAL headhaul ok, pay ≥ $2.10 all-in. Avoid NE winter. Weekend pickups need +$150…"
                    />
                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={markContact}>
                        Save + Mark Contact
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "Setup" ? (
                <div className="brokercmd__drawerGrid">
                  <div className="brokercmd__drawerCard brokercmd__drawerCard--wide">
                    <div className="brokercmd__drawerCardTitle">Broker Setup Checklist</div>
                    <div className="brokercmd__drawerHint">
                      Checklist drives status. When all items are checked, you can <strong>Confirm Setup Complete</strong>.
                    </div>

                    <div className="brokercmd__setupBar">
                      <div className="brokercmd__setupBarTop">
                        <strong>{setupProgress(selected).done}/{setupProgress(selected).total}</strong>
                        <span>{setupProgress(selected).pct}%</span>
                      </div>
                      <div className="brokercmd__setupBarTrack">
                        <div className="brokercmd__setupBarFill" style={{ width: `${setupProgress(selected).pct}%` }} />
                      </div>
                    </div>

                    <div className="brokercmd__checklist">
                      {SETUP_ITEMS.map((it) => {
                        const on = !!(selected.setup || {})[it.key];
                        return (
                          <button
                            key={it.key}
                            type="button"
                            className={`brokercmd__check ${on ? "is-on" : "is-off"}`}
                            onClick={() => {
                              if (typeof toggleBrokerSetupItem === "function") {
                                toggleBrokerSetupItem(selected.id, it.key);
                              } else {
                                const nextSetup = { ...(selected.setup || {}), [it.key]: !on };
                                updateBroker(selected.id, { setup: nextSetup });
                              }
                            }}
                          >
                            <span>{on ? "☑" : "☐"}</span>
                            <span>{it.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn" type="button" onClick={markContact}>
                        Mark Contact
                      </button>

                      <button className="command-shell__btn" type="button" onClick={() => setTab("Notes")}>
                        Go To Notes
                      </button>

                      {canConfirmSetup ? (
                        <button
                          className="command-shell__btn command-shell__btn--primary"
                          type="button"
                          onClick={confirmSetupComplete}
                        >
                          Confirm Setup Complete
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
