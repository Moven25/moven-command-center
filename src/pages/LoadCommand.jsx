// src/pages/LoadCommand.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./CommandShell.css";
import "./LoadCommand.css";
import { supabase } from "../lib/supabaseClient";

/**
 * Load Command — Option A (Supabase CRUD)
 * ✅ Auth-based (gets userId)
 * ✅ Scopes loads to owner_id = userId
 * ✅ Add / Edit / Delete loads in Supabase
 * ✅ Optional carriers dropdown (if carriers table exists)
 *
 * Expected tables:
 * - public.loads (must have owner_id uuid column)
 * Optional:
 * - public.carriers (id, company_name, owner_id)
 */

const STATUS_OPTIONS = ["Booked", "En Route", "At Pickup", "At Delivery", "Completed", "Issue"];
const PRIORITY_OPTIONS = ["Normal", "High"];

function fmt(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(iso);
  }
}

function pick(row, keys, fallback = "") {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
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

/* -----------------------------
   DB -> UI mapping (important)
------------------------------ */
function dbLoadToUi(row) {
  if (!row) return null;

  const id = row.id ?? "";
  const ref = pick(row, ["ref"], "");
  const status = pick(row, ["status"], "Booked");
  const priority = pick(row, ["priority"], "Normal");
  const broker = pick(row, ["broker"], "");

  const carrierId = pick(row, ["carrier_id", "carrierId"], "");
  const carrierName = pick(row, ["carrier_name", "carrierName", "carrier"], "");

  const lane = pick(row, ["lane"], "");

  const pickupCity = pick(row, ["pickup_city", "pickupCity"], "");
  const pickupAt = row?.pickup_at ?? row?.pickupAt ?? null;

  const deliveryCity = pick(row, ["delivery_city", "deliveryCity"], "");
  const deliveryAt = row?.delivery_at ?? row?.deliveryAt ?? null;

  const miles = Number(row?.miles ?? 0) || 0;
  const rpm = Number(row?.rpm ?? 0) || 0;
  const netRpm = Number(row?.net_rpm ?? row?.netRpm ?? 0) || 0;

  const notes = pick(row, ["notes"], "");
  const detentionRisk = !!row?.detention_risk;
  const lastCheckCallAt = row?.last_check_call_at ?? null;

  const createdAt = row?.created_at ?? null;

  return {
    id,
    ref,
    status,
    priority,
    broker,
    carrierId,
    carrierName,
    lane,
    pickupCity,
    pickupAt,
    deliveryCity,
    deliveryAt,
    miles,
    rpm,
    netRpm,
    notes,
    detentionRisk,
    lastCheckCallAt,
    createdAt,
    _raw: row,
  };
}

function uiPatchToDb(patch) {
  const out = {};
  if ("ref" in patch) out.ref = patch.ref || null;
  if ("status" in patch) out.status = patch.status || null;
  if ("priority" in patch) out.priority = patch.priority || null;
  if ("broker" in patch) out.broker = patch.broker || null;

  if ("carrierId" in patch) out.carrier_id = patch.carrierId || null;
  if ("carrierName" in patch) out.carrier_name = patch.carrierName || null;

  if ("lane" in patch) out.lane = patch.lane || null;

  if ("pickupCity" in patch) out.pickup_city = patch.pickupCity || null;
  if ("pickupAt" in patch) out.pickup_at = patch.pickupAt || null;

  if ("deliveryCity" in patch) out.delivery_city = patch.deliveryCity || null;
  if ("deliveryAt" in patch) out.delivery_at = patch.deliveryAt || null;

  if ("miles" in patch) out.miles = patch.miles ?? 0;
  if ("rpm" in patch) out.rpm = patch.rpm ?? 0;
  if ("netRpm" in patch) out.net_rpm = patch.netRpm ?? 0;

  if ("notes" in patch) out.notes = patch.notes || null;
  if ("detentionRisk" in patch) out.detention_risk = !!patch.detentionRisk;

  if ("lastCheckCallAt" in patch) out.last_check_call_at = patch.lastCheckCallAt || null;

  return out;
}

export default function LoadCommand() {
  // auth
  const [userId, setUserId] = useState(null);

  // data
  const [rows, setRows] = useState([]);
  const [carriers, setCarriers] = useState([]);

  // ui
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // add/edit
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [draft, setDraft] = useState({
    ref: "",
    status: "Booked",
    priority: "Normal",
    broker: "",
    carrierId: "",
    carrierName: "",
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

  const [editDraft, setEditDraft] = useState(null);

  // Boot auth
  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      if (mounted) setUserId(uid);
    }

    boot().catch(() => {});

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Optional: fetch carriers (safe if table doesn't exist)
  const fetchCarriers = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("carriers")
        .select("id, company_name, owner_id")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ui = (data || []).map((r) => ({
        id: r.id,
        name: r.company_name || "",
      }));
      setCarriers(ui.filter((c) => c.id && c.name));
    } catch (e) {
      // Don’t break Load Command if carriers table isn’t ready
      console.warn("[LoadCommand] carriers not available:", e?.message || e);
      setCarriers([]);
    }
  }, [userId]);

  // Fetch loads (THIS is where `.eq("owner_id", userId)` belongs)
  const fetchLoads = useCallback(async () => {
    if (!userId) return;

    console.log("[LoadCommand] userId:", userId);

    const { data, error } = await supabase
      .from("loads")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    console.log("[LoadCommand] loads data:", data);
    console.log("[LoadCommand] loads error:", error);

    if (error) throw error;

    const ui = (data || []).map(dbLoadToUi).filter(Boolean);
    setRows(ui);

    // keep selection valid
    if (!ui.length) setSelectedId(null);
    else setSelectedId((prev) => (prev && ui.some((l) => l.id === prev) ? prev : ui[0].id));
  }, [userId]);

  // initial load
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setRows([]);
      setSelectedId(null);
      setErr("");
      return;
    }

    (async () => {
      setLoading(true);
      setErr("");
      try {
        await Promise.all([fetchCarriers(), fetchLoads()]);
      } catch (e) {
        setErr(e?.message || "Failed to load data from Supabase");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, fetchCarriers, fetchLoads]);

  // filtering
  const filtered = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((r) => {
      const hay = [
        r.ref,
        r.id,
        r.status,
        r.priority,
        r.broker,
        r.carrierName,
        r.lane,
        r.pickupCity,
        r.deliveryCity,
        r.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || null, [rows, selectedId]);

  const displayId = (r) => (r?.ref && String(r.ref).trim() ? String(r.ref).trim() : String(r?.id || "").slice(0, 8));

  /* -----------------------------
     CRUD
  ------------------------------ */
  function openAdd() {
    setDraft({
      ref: "",
      status: "Booked",
      priority: "Normal",
      broker: "",
      carrierId: "",
      carrierName: "",
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

  async function saveNewLoad(e) {
    e.preventDefault();
    if (!userId) {
      alert("Not logged in. Go to /login.");
      return;
    }

    const pickupCity = (draft.pickupCity || "").trim();
    const deliveryCity = (draft.deliveryCity || "").trim();

    const lane =
      (draft.lane || "").trim() ||
      (pickupCity || deliveryCity ? `${pickupCity || "—"} → ${deliveryCity || "—"}` : "");

    // carrier resolution
    let carrierName = (draft.carrierName || "").trim();
    if (draft.carrierId && carriers.length) {
      const c = carriers.find((x) => x.id === draft.carrierId);
      if (c?.name) carrierName = c.name;
    }

    const insertRow = {
      owner_id: userId,
      ref: (draft.ref || "").trim() || null,
      status: draft.status || "Booked",
      priority: draft.priority || "Normal",
      broker: (draft.broker || "").trim() || null,

      carrier_id: draft.carrierId || null,
      carrier_name: carrierName || null,

      lane: lane || null,

      pickup_city: pickupCity || null,
      pickup_at: toISOOrNull(draft.pickupAt),
      delivery_city: deliveryCity || null,
      delivery_at: toISOOrNull(draft.deliveryAt),

      miles: draft.miles === "" ? 0 : Number(draft.miles),
      rpm: draft.rpm === "" ? 0 : Number(draft.rpm),
      net_rpm: draft.netRpm === "" ? 0 : Number(draft.netRpm),

      notes: (draft.notes || "").trim() || null,
      detention_risk: !!draft.detentionRisk,
      last_check_call_at: null,
    };

    const { data, error } = await supabase.from("loads").insert(insertRow).select("*").single();
    if (error) {
      alert(error.message || "Failed to save load");
      return;
    }

    const created = dbLoadToUi(data);
    setRows((prev) => [created, ...prev]);
    setAddOpen(false);
    setSelectedId(created.id);
  }

  function buildEditDraft(load) {
    return {
      id: load.id || "",
      ref: load.ref || "",
      status: load.status || "Booked",
      priority: load.priority || "Normal",
      broker: load.broker || "",
      carrierId: load.carrierId || "",
      carrierName: load.carrierName || "",
      lane: load.lane || "",
      pickupCity: load.pickupCity || "",
      pickupAt: toLocalInputValue(load.pickupAt),
      deliveryCity: load.deliveryCity || "",
      deliveryAt: toLocalInputValue(load.deliveryAt),
      miles: load.miles ?? 0,
      rpm: load.rpm ?? 0,
      netRpm: load.netRpm ?? 0,
      notes: load.notes || "",
      detentionRisk: !!load.detentionRisk,
    };
  }

  function openEdit() {
    if (!selected) return;
    setEditDraft(buildEditDraft(selected));
    setEditOpen(true);
  }

  function cancelEdit() {
    setEditOpen(false);
    setEditDraft(null);
  }

  async function updateLoad(loadId, patch) {
    // optimistic
    setRows((prev) => prev.map((l) => (l.id === loadId ? { ...l, ...patch } : l)));

    const dbPatch = uiPatchToDb(patch);
    const { error } = await supabase.from("loads").update(dbPatch).eq("id", loadId).eq("owner_id", userId);

    if (error) {
      console.error("[LoadCommand] update failed:", error);
      await fetchLoads(); // rollback safely
    }
  }

  async function saveEdits() {
    if (!selected || !editDraft) return;

    const pickupCity = (editDraft.pickupCity || "").trim();
    const deliveryCity = (editDraft.deliveryCity || "").trim();
    const lane =
      (editDraft.lane || "").trim() ||
      (pickupCity || deliveryCity ? `${pickupCity || "—"} → ${deliveryCity || "—"}` : "");

    // carrier name resolution
    let carrierName = (editDraft.carrierName || "").trim();
    if (editDraft.carrierId && carriers.length) {
      const c = carriers.find((x) => x.id === editDraft.carrierId);
      if (c?.name) carrierName = c.name;
    }

    const patch = {
      ref: (editDraft.ref || "").trim(),
      status: editDraft.status,
      priority: editDraft.priority,
      broker: (editDraft.broker || "").trim(),
      carrierId: editDraft.carrierId || "",
      carrierName,
      lane,
      pickupCity,
      pickupAt: toISOOrNull(editDraft.pickupAt),
      deliveryCity,
      deliveryAt: toISOOrNull(editDraft.deliveryAt),
      miles: toNumberOrZero(editDraft.miles),
      rpm: toNumberOrZero(editDraft.rpm),
      netRpm: toNumberOrZero(editDraft.netRpm),
      notes: (editDraft.notes || "").trim(),
      detentionRisk: !!editDraft.detentionRisk,
    };

    await updateLoad(selected.id, patch);
    setEditOpen(false);
    setEditDraft(null);
  }

  async function deleteSelected() {
    if (!selected) return;
    const ok = window.confirm(`Delete load ${displayId(selected)}? This cannot be undone.`);
    if (!ok) return;

    // optimistic remove
    setRows((prev) => prev.filter((l) => l.id !== selected.id));

    const { error } = await supabase.from("loads").delete().eq("id", selected.id).eq("owner_id", userId);
    if (error) {
      console.error("[LoadCommand] delete failed:", error);
      alert(error.message || "Delete failed");
      await fetchLoads();
      return;
    }

    // selection fix
    setSelectedId((prev) => {
      if (prev !== selected.id) return prev;
      const remaining = rows.filter((l) => l.id !== selected.id);
      return remaining[0]?.id ?? null;
    });
  }

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <div className="command-shell loadcmd">
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Operations</div>
          <h1 className="command-shell__title">Load Command</h1>
          <p className="command-shell__subtitle">Supabase (Option A): scoped to your account, with Add/Edit/Delete.</p>

          {!userId ? (
            <div style={{ marginTop: 6, color: "#ffb86b", fontSize: 12 }}>
              Not logged in. Go to <b>/login</b> so loads can filter by owner_id.
            </div>
          ) : null}

          {loading ? <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>Loading from Supabase…</div> : null}
          {err ? <div style={{ marginTop: 6, color: "#ff7b7b", fontSize: 12 }}>{err}</div> : null}

          <div style={{ marginTop: 6, opacity: 0.7, fontSize: 12 }}>
            Debug: userId = <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{userId || "—"}</span>
          </div>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={fetchLoads} disabled={!userId}>
            Refresh
          </button>

          <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={openAdd} disabled={!userId}>
            Add Load
          </button>
        </div>
      </header>

      <section className="loadcmd__toolbar">
        <div className="loadcmd__search">
          <input
            className="loadcmd__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search loads, brokers, carriers, lanes…"
          />
        </div>

        <div className="loadcmd__filters" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Showing <b>{filtered.length}</b> of <b>{rows.length}</b>
          </div>
          <button className="command-shell__btn" type="button" onClick={() => setQ("")}>
            Clear
          </button>
        </div>
      </section>

      <section className="loadcmd__grid">
        {/* TABLE */}
        <div className="loadcmd__card loadcmd__card--wide">
          <div className="loadcmd__cardHeader">
            <div>
              <div className="loadcmd__cardTitle">Loads</div>
              <div className="loadcmd__cardSub">Click a row to view detail.</div>
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
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={selectedId === r.id ? "is-selected" : ""}
                    onClick={() => setSelectedId(r.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <td>
                      <div className="loadcmd__cellMain">{displayId(r)}</div>
                      <div className="loadcmd__cellSub">
                        {(r.broker || "—")} · {(r.carrierName || "—")}
                      </div>
                    </td>

                    <td>
                      <span className={`loadcmd__chip loadcmd__chip--${String(r.status || "").replace(/\s+/g, "-").toLowerCase()}`}>
                        {r.status || "—"}
                      </span>
                      {r.priority === "High" ? <span className="loadcmd__badge">High</span> : null}
                      {r.detentionRisk ? <span className="loadcmd__badge loadcmd__badge--warn">Risk</span> : null}
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{r.lane || "—"}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{r.pickupCity || "—"}</div>
                      <div className="loadcmd__cellSub">{fmt(r.pickupAt)}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{r.deliveryCity || "—"}</div>
                      <div className="loadcmd__cellSub">{fmt(r.deliveryAt)}</div>
                    </td>

                    <td>
                      <div className="loadcmd__cellMain">{Number(r.netRpm || 0).toFixed(2)}</div>
                      <div className="loadcmd__cellSub">{r.miles} mi</div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="loadcmd__empty">
                      {userId ? "No rows found for this user." : "Login to see your loads."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL */}
        <div className="loadcmd__card">
          <div className="loadcmd__cardHeader">
            <div>
              <div className="loadcmd__cardTitle">Load Detail</div>
              <div className="loadcmd__cardSub">{selected ? displayId(selected) : "Select a load from the table"}</div>
            </div>

            {selected ? (
              <div className="loadcmd__cardActions">
                {!editOpen ? (
                  <>
                    <button className="command-shell__btn" type="button" onClick={openEdit}>
                      Edit
                    </button>
                    <button className="command-shell__btn" type="button" onClick={deleteSelected}>
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {!selected ? (
            <div className="loadcmd__detailEmpty">Click a row to view details.</div>
          ) : editOpen && editDraft ? (
            <div className="loadcmd__detail">
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Load Ref</div>
                <div className="loadcmd__value">
                  <input className="loadcmd__input" value={editDraft.ref} onChange={(e) => setEditDraft((d) => ({ ...d, ref: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Status</div>
                <div className="loadcmd__value">
                  <select className="loadcmd__select" value={editDraft.status} onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Priority</div>
                <div className="loadcmd__value">
                  <select className="loadcmd__select" value={editDraft.priority} onChange={(e) => setEditDraft((d) => ({ ...d, priority: e.target.value }))}>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Broker</div>
                <div className="loadcmd__value">
                  <input className="loadcmd__input" value={editDraft.broker} onChange={(e) => setEditDraft((d) => ({ ...d, broker: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Carrier</div>
                <div className="loadcmd__value" style={{ display: "grid", gap: 8 }}>
                  {carriers.length ? (
                    <select
                      className="loadcmd__select"
                      value={editDraft.carrierId}
                      onChange={(e) => {
                        const carrierId = e.target.value;
                        const c = carriers.find((x) => x.id === carrierId) || null;
                        setEditDraft((d) => ({ ...d, carrierId, carrierName: c?.name || d.carrierName }));
                      }}
                    >
                      <option value="">(No carrier selected)</option>
                      {carriers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Carriers table not loaded (optional). Using text field.</div>
                  )}

                  <input
                    className="loadcmd__input"
                    value={editDraft.carrierName}
                    onChange={(e) => setEditDraft((d) => ({ ...d, carrierName: e.target.value }))}
                    placeholder="Carrier name (text fallback)"
                  />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Lane</div>
                <div className="loadcmd__value">
                  <input className="loadcmd__input" value={editDraft.lane} onChange={(e) => setEditDraft((d) => ({ ...d, lane: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pickup</div>
                <div className="loadcmd__value" style={{ display: "grid", gap: 10 }}>
                  <input className="loadcmd__input" value={editDraft.pickupCity} onChange={(e) => setEditDraft((d) => ({ ...d, pickupCity: e.target.value }))} placeholder="Pickup city" />
                  <input className="loadcmd__input" type="datetime-local" value={editDraft.pickupAt} onChange={(e) => setEditDraft((d) => ({ ...d, pickupAt: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Delivery</div>
                <div className="loadcmd__value" style={{ display: "grid", gap: 10 }}>
                  <input className="loadcmd__input" value={editDraft.deliveryCity} onChange={(e) => setEditDraft((d) => ({ ...d, deliveryCity: e.target.value }))} placeholder="Delivery city" />
                  <input className="loadcmd__input" type="datetime-local" value={editDraft.deliveryAt} onChange={(e) => setEditDraft((d) => ({ ...d, deliveryAt: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pricing</div>
                <div className="loadcmd__value" style={{ display: "grid", gap: 10 }}>
                  <input className="loadcmd__input" value={editDraft.netRpm} onChange={(e) => setEditDraft((d) => ({ ...d, netRpm: e.target.value }))} placeholder="Net RPM" />
                  <input className="loadcmd__input" value={editDraft.miles} onChange={(e) => setEditDraft((d) => ({ ...d, miles: e.target.value }))} placeholder="Miles" />
                  <input className="loadcmd__input" value={editDraft.rpm} onChange={(e) => setEditDraft((d) => ({ ...d, rpm: e.target.value }))} placeholder="RPM (optional)" />
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Risk</div>
                <div className="loadcmd__value">
                  <label className="loadcmd__toggle">
                    <input type="checkbox" checked={!!editDraft.detentionRisk} onChange={(e) => setEditDraft((d) => ({ ...d, detentionRisk: e.target.checked }))} />
                    <span>Detention Risk</span>
                  </label>
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Notes</div>
                <div className="loadcmd__value">
                  <textarea className="loadcmd__textarea" value={editDraft.notes} onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))} />
                </div>
              </div>

              <div className="loadcmd__detailActions">
                <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={saveEdits}>
                  Save Changes
                </button>
                <button className="command-shell__btn" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="loadcmd__detail">
              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Status</div>
                <div className="loadcmd__value">{selected.status || "—"}</div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Broker</div>
                <div className="loadcmd__value">{selected.broker || "—"}</div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Carrier</div>
                <div className="loadcmd__value">{selected.carrierName || "—"}</div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Lane</div>
                <div className="loadcmd__value">{selected.lane || "—"}</div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pickup</div>
                <div className="loadcmd__value">
                  {(selected.pickupCity || "—")} · {fmt(selected.pickupAt)}
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Delivery</div>
                <div className="loadcmd__value">
                  {(selected.deliveryCity || "—")} · {fmt(selected.deliveryAt)}
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Pricing</div>
                <div className="loadcmd__value">
                  Net RPM {Number(selected.netRpm || 0).toFixed(2)} · {selected.miles} miles
                </div>
              </div>

              <div className="loadcmd__detailRow">
                <div className="loadcmd__label">Created</div>
                <div className="loadcmd__value">{fmt(selected.createdAt)}</div>
              </div>
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
                <div className="loadcmd__modalSub">Saved to Supabase (owner_id = your user).</div>
              </div>
              <button className="loadcmd__close" type="button" onClick={() => setAddOpen(false)}>
                ✕
              </button>
            </div>

            <form className="loadcmd__form" onSubmit={saveNewLoad}>
              <div className="loadcmd__formGrid">
                <label className="loadcmd__field">
                  <span>Load Ref (optional)</span>
                  <input className="loadcmd__input" value={draft.ref} onChange={(e) => setDraft((d) => ({ ...d, ref: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Status</span>
                  <select className="loadcmd__select" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label className="loadcmd__field">
                  <span>Priority</span>
                  <select className="loadcmd__select" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>

                <label className="loadcmd__field">
                  <span>Broker</span>
                  <input className="loadcmd__input" value={draft.broker} onChange={(e) => setDraft((d) => ({ ...d, broker: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Carrier (optional)</span>
                  {carriers.length ? (
                    <select
                      className="loadcmd__select"
                      value={draft.carrierId}
                      onChange={(e) => {
                        const carrierId = e.target.value;
                        const c = carriers.find((x) => x.id === carrierId) || null;
                        setDraft((d) => ({ ...d, carrierId, carrierName: c?.name || d.carrierName }));
                      }}
                    >
                      <option value="">(No carrier selected)</option>
                      {carriers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="loadcmd__input"
                      value={draft.carrierName}
                      onChange={(e) => setDraft((d) => ({ ...d, carrierName: e.target.value }))}
                      placeholder="Carrier name (text fallback)"
                    />
                  )}
                </label>

                <label className="loadcmd__field loadcmd__field--wide">
                  <span>Lane (optional)</span>
                  <input className="loadcmd__input" value={draft.lane} onChange={(e) => setDraft((d) => ({ ...d, lane: e.target.value }))} placeholder="City, ST → City, ST" />
                </label>

                <label className="loadcmd__field">
                  <span>Pickup City</span>
                  <input className="loadcmd__input" value={draft.pickupCity} onChange={(e) => setDraft((d) => ({ ...d, pickupCity: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Pickup Date/Time</span>
                  <input className="loadcmd__input" type="datetime-local" value={draft.pickupAt} onChange={(e) => setDraft((d) => ({ ...d, pickupAt: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Delivery City</span>
                  <input className="loadcmd__input" value={draft.deliveryCity} onChange={(e) => setDraft((d) => ({ ...d, deliveryCity: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Delivery Date/Time</span>
                  <input className="loadcmd__input" type="datetime-local" value={draft.deliveryAt} onChange={(e) => setDraft((d) => ({ ...d, deliveryAt: e.target.value }))} />
                </label>

                <label className="loadcmd__field">
                  <span>Miles</span>
                  <input className="loadcmd__input" value={draft.miles} onChange={(e) => setDraft((d) => ({ ...d, miles: e.target.value }))} placeholder="0" />
                </label>

                <label className="loadcmd__field">
                  <span>RPM</span>
                  <input className="loadcmd__input" value={draft.rpm} onChange={(e) => setDraft((d) => ({ ...d, rpm: e.target.value }))} placeholder="0" />
                </label>

                <label className="loadcmd__field">
                  <span>Net RPM</span>
                  <input className="loadcmd__input" value={draft.netRpm} onChange={(e) => setDraft((d) => ({ ...d, netRpm: e.target.value }))} placeholder="0" />
                </label>

                <label className="loadcmd__field loadcmd__field--wide">
                  <span>Notes</span>
                  <textarea className="loadcmd__textarea" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
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
    </div>
  );
}