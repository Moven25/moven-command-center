// src/pages/BrokerCommand.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CommandShell.css";
import "./BrokerCommand.css";
import { useData } from "../state/DataContext";

/* -----------------------------
  Local fallback store (if DataContext doesn't have brokers yet)
------------------------------ */
const LS_KEY = "lanesync_brokers_v1";

function loadLocalBrokers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalBrokers(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function nextBrokerId() {
  return `BR-${Math.floor(10000 + Math.random() * 89999)}`;
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function riskLabel(score) {
  const n = Number(score || 0);
  if (n <= 25) return "Low";
  if (n <= 55) return "Medium";
  return "High";
}

export default function BrokerCommand() {
  const data = useData?.() || {};
  const ctxBrokers = data.brokers; // optional
  const ctxAddBroker = data.addBroker; // optional
  const ctxUpdateBroker = data.updateBroker; // optional

  const [localBrokers, setLocalBrokers] = useState(() => loadLocalBrokers());

  // Use DataContext brokers if present, else localStorage brokers
  const brokers = Array.isArray(ctxBrokers) ? ctxBrokers : localBrokers;

  // persist local fallback
  useEffect(() => {
    if (!Array.isArray(ctxBrokers)) saveLocalBrokers(localBrokers);
  }, [localBrokers, ctxBrokers]);

  const [selectedId, setSelectedId] = useState(brokers[0]?.id || null);

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

  // KPI-ish counters
  const stats = useMemo(() => {
    const total = brokers.length;
    const atRisk = brokers.filter((b) => (b.riskScore || 0) > 55).length;
    const hot = brokers.filter((b) => (b.hotList ? true : false)).length;
    const noNotes = brokers.filter((b) => !String(b.negotiationNotes || "").trim()).length;
    return { total, atRisk, hot, noNotes };
  }, [brokers]);

  // Add Broker modal
  const [addOpen, setAddOpen] = useState(false);
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
  });

  function doAddBroker(newBroker) {
    // If context has addBroker, use it, else local fallback
    if (typeof ctxAddBroker === "function") {
      const created = ctxAddBroker(newBroker);
      return created || null;
    }
    setLocalBrokers((prev) => [newBroker, ...prev]);
    return newBroker;
  }

  function doUpdateBroker(id, patch) {
    if (!id) return;
    if (typeof ctxUpdateBroker === "function") {
      ctxUpdateBroker(id, patch);
      return;
    }
    setLocalBrokers((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function openProfile(nextTab = "Overview") {
    if (!selected) return;
    setTab(nextTab);
    setDrawerOpen(true);
  }

  function markContact() {
    if (!selected) return;
    doUpdateBroker(selected.id, { lastContactAt: new Date().toISOString() });
  }

  function saveAdd(e) {
    e.preventDefault();
    const name = String(draft.name || "").trim();
    if (!name) return;

    const id = String(draft.id || "").trim() || nextBrokerId();
    const record = {
      ...draft,
      id,
      name,
      lastContactAt: new Date().toISOString(),
    };

    const created = doAddBroker(record);
    if (created?.id) {
      setSelectedId(created.id);
      setAddOpen(false);
      setDrawerOpen(true);
      setTab("Overview");
    }
  }

  // simple “action buttons” that actually do things
  const actions = useMemo(() => {
    if (!selected) return null;

    const risk = riskLabel(selected.riskScore || 0);
    const hasNotes = !!String(selected.negotiationNotes || "").trim();

    if (risk === "High") {
      return {
        tone: "warn",
        icon: "⚠️",
        title: "High Risk Broker",
        detail: "Confirm credit / factoring approval, tighten terms, and require setup packet.",
        cta: "Open Notes",
        tab: "Notes",
      };
    }

    if (!hasNotes) {
      return {
        tone: "warn",
        icon: "📝",
        title: "Missing Negotiation Notes",
        detail: "Add your “pain extraction” script + fallback counters so every call is consistent.",
        cta: "Add Notes",
        tab: "Notes",
      };
    }

    return {
      tone: "ok",
      icon: "✅",
      title: "Ready",
      detail: "Notes exist. Review lanes and keep contact cadence tight.",
      cta: "Open Lanes",
      tab: "Lanes",
    };
  }, [selected]);

  function formatWhen(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  const notesRef = useRef(null);

  return (
    <div className="command-shell brokercmd">
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
              <div className="brokercmd__cardSub">Select a broker to view details and notes.</div>
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
                        <div className="brokercmd__cellSub">{b.id} · {b.city || "—"}</div>
                      </td>
                      <td><span className={`brokercmd__chip brokercmd__chip--${risk.toLowerCase()}`}>{risk}</span></td>
                      <td>{Number(b.creditDays || 0)}d</td>
                      <td>{b.hotList ? "🔥" : "—"}</td>
                      <td>{formatWhen(b.lastContactAt)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="brokercmd__empty">
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
                  {selected.phone || "—"}<br />
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
                <div className="brokercmd__modalSub">Create a broker profile for consistent negotiation and lanes.</div>
              </div>
              <button className="brokercmd__close" type="button" onClick={() => setAddOpen(false)}>✕</button>
            </div>

            <form className="brokercmd__form" onSubmit={saveAdd}>
              <div className="brokercmd__formGrid">
                <label className="brokercmd__field">
                  <span>Broker ID (optional)</span>
                  <input value={draft.id} onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))} placeholder="BR-10201" />
                </label>

                <label className="brokercmd__field brokercmd__field--wide">
                  <span>Broker Name</span>
                  <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Brokerage name" required />
                </label>

                <label className="brokercmd__field">
                  <span>Email</span>
                  <input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="ops@broker.com" />
                </label>

                <label className="brokercmd__field">
                  <span>Phone</span>
                  <input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="(555) 555-5555" />
                </label>

                <label className="brokercmd__field">
                  <span>City</span>
                  <input value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} placeholder="Chicago, IL" />
                </label>

                <label className="brokercmd__field">
                  <span>Credit Days</span>
                  <input type="number" value={draft.creditDays} onChange={(e) => setDraft((d) => ({ ...d, creditDays: Number(e.target.value || 0) }))} />
                </label>

                <label className="brokercmd__field">
                  <span>Risk Score (0-100)</span>
                  <input type="number" value={draft.riskScore} onChange={(e) => setDraft((d) => ({ ...d, riskScore: Number(e.target.value || 0) }))} />
                </label>

                <label className="brokercmd__toggle brokercmd__field--wide">
                  <input type="checkbox" checked={!!draft.hotList} onChange={(e) => setDraft((d) => ({ ...d, hotList: e.target.checked }))} />
                  <span>Hot List (preferred broker)</span>
                </label>
              </div>

              <div className="brokercmd__modalActions">
                <button className="command-shell__btn" type="button" onClick={() => setAddOpen(false)}>Cancel</button>
                <button className="command-shell__btn command-shell__btn--primary" type="submit">Save Broker</button>
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
                <div className="brokercmd__drawerSub">{selected.id} · {selected.city || "—"}</div>
              </div>
              <button className="brokercmd__drawerClose" type="button" onClick={() => setDrawerOpen(false)}>✕</button>
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
                    <div className="brokercmd__drawerLine"><span>Email</span><strong>{selected.email || "—"}</strong></div>
                    <div className="brokercmd__drawerLine"><span>Phone</span><strong>{selected.phone || "—"}</strong></div>
                    <div className="brokercmd__drawerLine"><span>Last Contact</span><strong>{formatWhen(selected.lastContactAt)}</strong></div>
                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn" type="button" onClick={markContact}>Mark Contact</button>
                      <button className="command-shell__btn" type="button" onClick={() => doUpdateBroker(selected.id, { hotList: !selected.hotList })}>
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
                      onChange={(e) => doUpdateBroker(selected.id, { negotiationNotes: e.target.value })}
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
                      onChange={(e) => doUpdateBroker(selected.id, { lanesNotes: e.target.value })}
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
                      Later we can attach actual files like we did for Carrier docs. For now: track the checklist.
                    </div>

                    <div className="brokercmd__checklist">
                      {[
                        "Setup packet received",
                        "Credit check / factoring approval",
                        "Rate confirmation process confirmed",
                        "Detention / TONU terms confirmed",
                        "After-hours / weekend contact",
                      ].map((label) => {
                        const key = `ck_${label.replace(/\W+/g, "_")}`;
                        const on = !!selected[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`brokercmd__check ${on ? "is-on" : "is-off"}`}
                            onClick={() => doUpdateBroker(selected.id, { [key]: !on })}
                          >
                            <span>{on ? "☑" : "☐"}</span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="brokercmd__drawerActions">
                      <button className="command-shell__btn" type="button" onClick={markContact}>
                        Mark Contact
                      </button>
                      <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={() => setTab("Notes")}>
                        Go To Notes
                      </button>
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
