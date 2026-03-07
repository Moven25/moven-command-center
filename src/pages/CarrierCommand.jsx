// src/pages/CarrierCommand.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CommandShell.css";
import "./CarrierCommand.css";
import { createClient } from "@supabase/supabase-js";

/* -----------------------------
   Supabase (Vite env)
------------------------------ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

/* -----------------------------
   Helpers
------------------------------ */
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

function riskLabel(score) {
  const n = Number(score ?? 0);
  if (n <= 25) return "Low";
  if (n <= 55) return "Medium";
  return "High";
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function loadChipKey(status = "") {
  const s = String(status || "").toLowerCase();
  if (s.includes("book")) return "booked";
  if (s.includes("pick")) return "pickup";
  if (s.includes("in")) return "intransit";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";
  return "default";
}

/* -----------------------------
   Normalizers (handles snake_case or camelCase columns)
------------------------------ */
function stableId(row) {
  return (
    row?.id ??
    row?.carrier_id ??
    row?.uuid ??
    row?.mc ??
    row?.mc_number ??
    row?.dot ??
    row?.dot_number ??
    (row
      ? JSON.stringify([row.name ?? row.carrier_name ?? "carrier", row.created_at ?? row.createdAt ?? ""])
      : "—")
  );
}

function detectPkColumn(row) {
  if (!row) return "id";
  if (row.id != null) return "id";
  if (row.carrier_id != null) return "carrier_id";
  if (row.uuid != null) return "uuid";
  // fallback (not ideal, but avoids hard crash)
  return "id";
}

function normalizeCarrier(row) {
  if (!row) return row;
  return {
    id: stableId(row),
    _pkCol: detectPkColumn(row),

    name: row.name ?? row.carrier_name ?? row.company_name ?? row.legal_name ?? "—",
    status: row.status ?? row.carrier_status ?? "—",

    riskScore: row.riskScore ?? row.risk_score ?? row.risk ?? 0,
    equipment: row.equipment ?? row.equipment_type ?? row.trailer_type ?? "—",
    mc: row.mc ?? row.mc_number ?? row.mc_num ?? "—",
    dot: row.dot ?? row.dot_number ?? row.dot_num ?? "—",
    homeBase: row.homeBase ?? row.home_base ?? row.home_city ?? row.base ?? "—",

    phone: row.phone ?? row.phone_number ?? row.contact_phone ?? "—",
    email: row.email ?? row.contact_email ?? "—",
    notes: row.notes ?? row.dispatch_notes ?? row.internal_notes ?? "",

    lastContactAt: row.lastContactAt ?? row.last_contact_at ?? row.last_contact ?? null,

    insuranceOnFile: row.insuranceOnFile ?? row.insurance_on_file ?? row.insurance_onfile ?? false,
    w9OnFile: row.w9OnFile ?? row.w9_on_file ?? row.w9_onfile ?? false,
    authorityOnFile: row.authorityOnFile ?? row.authority_on_file ?? row.authority_onfile ?? false,

    insuranceExp:
      row.insuranceExp ??
      row.insurance_exp ??
      row.insurance_expiration ??
      row.insurance_expiry ??
      null,

    onTime: row.onTime ?? row.on_time ?? row.ontime_pct ?? null,
    claims: row.claims ?? row.claim_count ?? 0,

    recentLoadCount: row.recentLoadCount ?? row.recent_load_count ?? row.recent_loads ?? null,

    created_at: row.created_at ?? row.createdAt ?? null,

    _raw: row,
  };
}

function normalizeLoad(row) {
  if (!row) return row;
  return {
    id: row.id ?? row.load_id ?? row.reference ?? "—",
    broker: row.broker ?? row.broker_name ?? row.brokerCompany ?? "—",
    status: row.status ?? row.load_status ?? "—",
    lane: row.lane ?? row.route ?? row.origin_destination ?? "—",
    pickupAt: row.pickupAt ?? row.pickup_at ?? row.pickup_datetime ?? row.pickup_date ?? null,
    deliveryAt: row.deliveryAt ?? row.delivery_at ?? row.delivery_datetime ?? row.delivery_date ?? null,
    netRpm: row.netRpm ?? row.net_rpm ?? row.net_rpm_calc ?? row.net ?? 0,
    carrier_id: row.carrier_id ?? row.carrierId ?? row.carrier ?? null,
    createdAt: row.createdAt ?? row.created_at ?? null,
  };
}

/* -----------------------------
   Safe write helper:
   - If your table doesn't have a column we try to write,
     Supabase throws: "Could not find the '<col>' column of '<table>' in the schema cache"
   - We parse that and retry with the offending key removed.
------------------------------ */
function extractMissingColumn(msg = "") {
  const m = String(msg).match(/Could not find the '([^']+)' column/i);
  return m?.[1] || null;
}

async function safeInsert(table, payload) {
  let obj = { ...payload };
  for (let i = 0; i < 10; i++) {
    const res = await supabase.from(table).insert(obj).select("*").maybeSingle();
    if (!res.error) return res;
    const col = extractMissingColumn(res.error.message);
    if (!col) throw res.error;
    if (Object.prototype.hasOwnProperty.call(obj, col)) {
      const { [col]: _omit, ...rest } = obj;
      obj = rest;
      continue;
    }
    throw res.error;
  }
  throw new Error("Insert failed after retries (schema mismatch).");
}

async function safeUpdate(table, pkCol, pkVal, patch) {
  let obj = { ...patch };
  for (let i = 0; i < 10; i++) {
    const res = await supabase.from(table).update(obj).eq(pkCol, pkVal).select("*").maybeSingle();
    if (!res.error) return res;
    const col = extractMissingColumn(res.error.message);
    if (!col) throw res.error;
    if (Object.prototype.hasOwnProperty.call(obj, col)) {
      const { [col]: _omit, ...rest } = obj;
      obj = rest;
      continue;
    }
    throw res.error;
  }
  throw new Error("Update failed after retries (schema mismatch).");
}

/* -----------------------------
   IndexedDB (local docs)
------------------------------ */
const DB_NAME = "lanesync_docs";
const DB_VERSION = 1;
const STORE = "carrier_docs";

function idbAvailable() {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (!idbAvailable()) {
      reject(new Error("IndexedDB not available in this browser/session."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const st = tx.objectStore(STORE);
    const req = st.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(rec) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    const req = st.put(rec);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    const req = st.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/* -----------------------------
   DocRow
------------------------------ */
function DocRow({ label, docType, record, highlight, onUpload, onDownload, onRemove }) {
  return (
    <div className={`carriercmd__docRow ${highlight ? "is-highlight" : ""}`}>
      <div className="carriercmd__docLeft">
        <div className="carriercmd__docLabel">{label}</div>
        <div className="carriercmd__docSub">
          {record?.name ? (
            <>
              <span className="carriercmd__docStatus is-on">On file</span>
              <span className="carriercmd__docName">{record.name}</span>
            </>
          ) : (
            <>
              <span className="carriercmd__docStatus is-off">Missing</span>
              <span className="carriercmd__docName">—</span>
            </>
          )}
        </div>
      </div>

      <div className="carriercmd__docActions">
        <label className="carriercmd__miniBtn">
          Upload
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(docType, f);
              e.target.value = "";
            }}
          />
        </label>

        <button
          className="carriercmd__miniBtn"
          type="button"
          onClick={() => onDownload(docType)}
          disabled={!record}
        >
          Download
        </button>

        <button
          className="carriercmd__miniBtn carriercmd__miniBtn--warn"
          type="button"
          onClick={() => onRemove(docType)}
          disabled={!record}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Main
------------------------------ */
export default function CarrierCommand() {
  const carriersTable = "carriers";
  const loadsTable = "loads";

  // auth (Option A: scoped)
  const [userId, setUserId] = useState("");
  const [authErr, setAuthErr] = useState("");

  // Supabase-backed state
  const [carriers, setCarriers] = useState([]);
  const [carriersLoading, setCarriersLoading] = useState(true);
  const [carriersErr, setCarriersErr] = useState("");

  // Add/Edit/Delete modal
  const [addOpen, setAddOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addErr, setAddErr] = useState("");

  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState("");

  const blankCarrierForm = {
    name: "",
    status: "active",
    mc: "",
    dot: "",
    homeBase: "",
    equipment: "",
    phone: "",
    email: "",
    notes: "",
    riskScore: 0,
    insuranceOnFile: false,
    w9OnFile: false,
    authorityOnFile: false,
    insuranceExp: "", // YYYY-MM-DD
  };
  const [carrierForm, setCarrierForm] = useState(blankCarrierForm);

  // left panel controls
  const [q, setQ] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | atRisk | missingDocs
  const [selectedId, setSelectedId] = useState(null);

  // drawer
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("Overview");
  const [docFocus, setDocFocus] = useState(null);

  // notes editor
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesErr, setNotesErr] = useState("");

  // docs state
  const [docs, setDocs] = useState({ insurance: null, w9: null, authority: null });
  const [docBusy, setDocBusy] = useState(false);

  // loads in drawer (fetched from Supabase on demand)
  const [loadingLoads, setLoadingLoads] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [selectedLoads, setSelectedLoads] = useState([]);

  // KPI ack
  const ackRef = useRef({ atRisk: false, missingDocs: false });
  const acknowledgeKpi = (key) => {
    ackRef.current[key] = true;
  };

  const selected = useMemo(
    () => carriers.find((c) => String(c.id) === String(selectedId)) || null,
    [carriers, selectedId]
  );

  const insuranceDays = useMemo(() => {
    const d = daysUntil(selected?.insuranceExp);
    return d == null ? null : d;
  }, [selected?.insuranceExp]);

  const insuranceSoon = useMemo(() => {
    if (insuranceDays == null) return false;
    return insuranceDays <= 14;
  }, [insuranceDays]);

  const missingDocsCount = useMemo(() => {
    const list = carriers || [];
    let missing = 0;
    for (const c of list) {
      const miss =
        (c.insuranceOnFile === false ? 1 : 0) +
        (c.w9OnFile === false ? 1 : 0) +
        (c.authorityOnFile === false ? 1 : 0);
      if (miss > 0) missing += 1;
    }
    return missing;
  }, [carriers]);

  const atRiskCount = useMemo(() => {
    const list = carriers || [];
    return list.filter((c) => Number(c.riskScore ?? 0) > 55).length;
  }, [carriers]);

  const activeCount = useMemo(() => {
    const list = carriers || [];
    return list.filter((c) => String(c.status || "").toLowerCase() !== "inactive").length;
  }, [carriers]);

  const filtered = useMemo(() => {
    const list = carriers || [];
    const qq = q.trim().toLowerCase();
    let out = list;

    if (filterMode === "atRisk") out = out.filter((c) => Number(c.riskScore ?? 0) > 55);

    if (filterMode === "missingDocs") {
      out = out.filter(
        (c) => c.insuranceOnFile === false || c.w9OnFile === false || c.authorityOnFile === false
      );
    }

    if (qq) {
      out = out.filter((c) => {
        const hay = [c.name, c.id, c.mc, c.dot, c.homeBase, c.phone, c.email, c.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(qq);
      });
    }

    return out;
  }, [carriers, q, filterMode]);

  /* -----------------------------
     Auth + carriers fetch (Option A)
  ------------------------------ */
  async function getUserId() {
    if (!supabase) return "";
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user?.id || "";
  }

  async function fetchCarriers() {
    if (!supabase) {
      setCarriersErr("Supabase env missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setCarriers([]);
      setCarriersLoading(false);
      return;
    }

    setCarriersLoading(true);
    setCarriersErr("");

    try {
      let uid = userId;
      if (!uid) {
        uid = await getUserId();
        setUserId(uid);
      }

      if (!uid) {
        setCarriersErr("No logged-in user found. Option A requires Supabase Auth sign-in.");
        setCarriers([]);
        setCarriersLoading(false);
        return;
      }

      // Try ordering safely, but ALWAYS scope by owner_id
      let data = null;
      let error = null;

      // Attempt 1: created_at
      {
        const res = await supabase
          .from(carriersTable)
          .select("*")
          .eq("owner_id", uid)
          .order("created_at", { ascending: false });
        data = res.data;
        error = res.error;
      }

      // Attempt 2: createdAt
      if (error && String(error.message || "").toLowerCase().includes("column")) {
        const res2 = await supabase
          .from(carriersTable)
          .select("*")
          .eq("owner_id", uid)
          .order("createdAt", { ascending: false });
        data = res2.data;
        error = res2.error;
      }

      // Attempt 3: no order
      if (error && String(error.message || "").toLowerCase().includes("column")) {
        const res3 = await supabase.from(carriersTable).select("*").eq("owner_id", uid);
        data = res3.data;
        error = res3.error;
      }

      if (error) throw error;

      const normalized = (data || []).map(normalizeCarrier);
      setCarriers(normalized);

      if (selectedId != null && !normalized.some((c) => String(c.id) === String(selectedId))) {
        setSelectedId(null);
        setProfileOpen(false);
      }
    } catch (e) {
      setCarriersErr(e?.message || "Could not load carriers from Supabase.");
      setCarriers([]);
    } finally {
      setCarriersLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      try {
        const uid = await getUserId();
        setUserId(uid);
        setAuthErr(uid ? "" : "No logged-in user. Sign in to enable Add/Edit/Delete.");
      } catch (e) {
        setAuthErr(e?.message || "Auth error.");
      } finally {
        fetchCarriers();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProfile = (carrierId) => {
    setSelectedId(carrierId);
    setProfileOpen(true);
    setProfileTab("Overview");
    setDocFocus(null);

    const c = carriers.find((x) => String(x.id) === String(carrierId));
    if (c) {
      // preload edit form from selected row
      setCarrierForm({
        ...blankCarrierForm,
        name: c.name === "—" ? "" : c.name,
        status: c.status === "—" ? "active" : c.status,
        mc: c.mc === "—" ? "" : c.mc,
        dot: c.dot === "—" ? "" : c.dot,
        homeBase: c.homeBase === "—" ? "" : c.homeBase,
        equipment: c.equipment === "—" ? "" : c.equipment,
        phone: c.phone === "—" ? "" : c.phone,
        email: c.email === "—" ? "" : c.email,
        notes: c.notes || "",
        riskScore: Number(c.riskScore || 0),
        insuranceOnFile: Boolean(c.insuranceOnFile),
        w9OnFile: Boolean(c.w9OnFile),
        authorityOnFile: Boolean(c.authorityOnFile),
        insuranceExp: c.insuranceExp || "",
      });
    }
  };

  /* -----------------------------
     Add Carrier (Option A)
  ------------------------------ */
  function openAdd() {
    setAddErr("");
    setCarrierForm(blankCarrierForm);
    setAddOpen(true);
  }

  function dbCarrierFromForm(form, uid) {
    // Prefer snake_case columns that are most likely in DB
    // safeInsert/safeUpdate will automatically drop columns that don't exist in your schema.
    const payload = {
      owner_id: uid,
      name: form.name?.trim() || null,
      status: form.status?.trim() || "active",
      mc: form.mc?.trim() || null,
      dot: form.dot?.trim() || null,
      home_base: form.homeBase?.trim() || null,
      equipment: form.equipment?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      notes: form.notes || "",
      risk_score: Number(form.riskScore || 0),
      insurance_on_file: Boolean(form.insuranceOnFile),
      w9_on_file: Boolean(form.w9OnFile),
      authority_on_file: Boolean(form.authorityOnFile),
      insurance_exp: form.insuranceExp?.trim() || null,
      last_contact_at: null,
    };

    // Remove nulls (keeps inserts clean)
    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === "") delete payload[k];
    });

    return payload;
  }

  async function addCarrier() {
    if (!supabase) return;
    setAddBusy(true);
    setAddErr("");

    try {
      const uid = userId || (await getUserId());
      setUserId(uid);

      if (!uid) throw new Error("No logged-in user. Sign in to add a carrier.");

      if (!carrierForm.name.trim()) {
        throw new Error("Carrier name is required.");
      }

      const payload = dbCarrierFromForm(carrierForm, uid);
      const res = await safeInsert(carriersTable, payload);
      const created = normalizeCarrier(res.data);

      setCarriers((prev) => [created, ...prev]);
      setAddOpen(false);
      setSelectedId(created.id);
    } catch (e) {
      setAddErr(e?.message || "Could not add carrier.");
    } finally {
      setAddBusy(false);
    }
  }

  /* -----------------------------
     Edit / Delete (Option A)
  ------------------------------ */
  async function saveCarrierEdits() {
    if (!selected?.id) return;
    if (!supabase) return;

    setEditBusy(true);
    setEditErr("");

    try {
      const uid = userId || (await getUserId());
      setUserId(uid);
      if (!uid) throw new Error("No logged-in user. Sign in to edit.");

      const pkCol = selected._pkCol || "id";
      const patch = dbCarrierFromForm(carrierForm, uid);
      // never allow ownership change in UI beyond ensuring it's set
      patch.owner_id = uid;

      const res = await safeUpdate(carriersTable, pkCol, selected._raw?.[pkCol] ?? selected.id, patch);
      const updated = normalizeCarrier(res.data);

      setCarriers((prev) =>
        prev.map((c) => (String(c.id) === String(selected.id) ? { ...c, ...updated } : c))
      );
    } catch (e) {
      setEditErr(e?.message || "Could not save changes.");
    } finally {
      setEditBusy(false);
    }
  }

  async function deleteCarrier() {
    if (!selected?.id) return;
    if (!supabase) return;

    const ok = window.confirm(`Delete carrier "${selected.name}"? This cannot be undone.`);
    if (!ok) return;

    setEditBusy(true);
    setEditErr("");

    try {
      const uid = userId || (await getUserId());
      setUserId(uid);
      if (!uid) throw new Error("No logged-in user. Sign in to delete.");

      const pkCol = selected._pkCol || "id";
      const pkVal = selected._raw?.[pkCol] ?? selected.id;

      const res = await supabase.from(carriersTable).delete().eq(pkCol, pkVal);
      if (res.error) throw res.error;

      setCarriers((prev) => prev.filter((c) => String(c.id) !== String(selected.id)));
      setProfileOpen(false);
      setSelectedId(null);
    } catch (e) {
      setEditErr(e?.message || "Could not delete carrier.");
    } finally {
      setEditBusy(false);
    }
  }

  /* -----------------------------
     Docs + Loads
  ------------------------------ */
  const docKey = (carrierId, docType) => `carrier:${carrierId}:${docType}`;

  async function loadDocsForCarrier(carrierId) {
    if (!carrierId) return;
    setDocBusy(true);
    try {
      const [insurance, w9, authority] = await Promise.all([
        idbGet(docKey(carrierId, "insurance")),
        idbGet(docKey(carrierId, "w9")),
        idbGet(docKey(carrierId, "authority")),
      ]);
      setDocs({
        insurance: insurance?.payload || null,
        w9: w9?.payload || null,
        authority: authority?.payload || null,
      });
    } catch {
      setDocs({ insurance: null, w9: null, authority: null });
    } finally {
      setDocBusy(false);
    }
  }

  async function handleUpload(docType, file) {
    if (!selected?.id) return;
    setDocBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);

      const payload = {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        updatedAt: new Date().toISOString(),
        data: bytes,
      };
      await idbPut({ key: docKey(selected.id, docType), payload });
      await loadDocsForCarrier(selected.id);
    } finally {
      setDocBusy(false);
    }
  }

  function downloadBlob(payload) {
    const blob = new Blob([payload.data], { type: payload.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = payload.name || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownload(docType) {
    const rec = docs[docType];
    if (!rec) return;
    downloadBlob(rec);
  }

  async function handleRemove(docType) {
    if (!selected?.id) return;
    setDocBusy(true);
    try {
      await idbDel(docKey(selected.id, docType));
      await loadDocsForCarrier(selected.id);
    } finally {
      setDocBusy(false);
    }
  }

  const openDocs = (focusType) => {
    setProfileTab("Docs");
    setDocFocus(focusType);
  };

  async function loadLoadsForCarrier(carrierId) {
    setLoadingLoads(true);
    setLoadErr("");
    try {
      if (!supabase) throw new Error("Supabase env missing.");

      const carrierIdStr = String(carrierId);

      let data = null;
      let error = null;

      {
        const res = await supabase
          .from(loadsTable)
          .select("*")
          .eq("carrier_id", carrierIdStr)
          .order("pickup_at", { ascending: false });
        data = res.data;
        error = res.error;
      }

      if (error && String(error.message || "").toLowerCase().includes("column")) {
        const res2 = await supabase
          .from(loadsTable)
          .select("*")
          .eq("carrierId", carrierIdStr)
          .order("pickupAt", { ascending: false });
        data = res2.data;
        error = res2.error;
      }

      if (error && String(error.message || "").toLowerCase().includes("column")) {
        const res3 = await supabase.from(loadsTable).select("*").eq("carrier_id", carrierIdStr);
        data = res3.data;
        error = res3.error;
      }

      if (error) throw error;

      const mine = (data || []).map(normalizeLoad);
      mine.sort((a, b) => {
        const ad = new Date(a.pickupAt || a.createdAt || 0).getTime();
        const bd = new Date(b.pickupAt || b.createdAt || 0).getTime();
        return bd - ad;
      });

      setSelectedLoads(mine);
    } catch (e) {
      setLoadErr(e?.message || "Could not load loads for this carrier.");
      setSelectedLoads([]);
    } finally {
      setLoadingLoads(false);
    }
  }

  useEffect(() => {
    if (!profileOpen || !selected?.id) return;
    loadDocsForCarrier(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen, selected?.id]);

  useEffect(() => {
    setNotesErr("");
    setNotesDraft(selected?.notes ?? "");
  }, [selected?.id]);

  async function saveNotes() {
    if (!selected?.id) return;
    if (!supabase) {
      setNotesErr("Supabase env missing. Cannot save notes.");
      return;
    }
    setSavingNotes(true);
    setNotesErr("");

    try {
      const nowIso = new Date().toISOString();
      const pkCol = selected._pkCol || "id";
      const pkVal = selected._raw?.[pkCol] ?? selected.id;

      let res = await supabase
        .from(carriersTable)
        .update({ notes: notesDraft, last_contact_at: nowIso })
        .eq(pkCol, pkVal)
        .select("*")
        .maybeSingle();

      if (res.error && String(res.error.message || "").toLowerCase().includes("column")) {
        res = await supabase
          .from(carriersTable)
          .update({ notes: notesDraft })
          .eq(pkCol, pkVal)
          .select("*")
          .maybeSingle();
      }

      if (res.error) throw res.error;

      const updated = normalizeCarrier(res.data || { ...selected, notes: notesDraft });
      setCarriers((prev) =>
        prev.map((c) => (String(c.id) === String(selected.id) ? { ...c, ...updated } : c))
      );
    } catch (e) {
      setNotesErr(e?.message || "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  useEffect(() => {
    if (!profileOpen || !selected?.id) return;
    if (profileTab !== "Loads") return;
    loadLoadsForCarrier(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileTab, profileOpen, selected?.id]);

  return (
    <div className="commandshell">
      <div className="commandshell__header">
        <div className="commandshell__title">
          <div className="commandshell__kicker">OPERATIONS</div>
          <div className="commandshell__h1">Carrier Command</div>
          <div className="commandshell__sub">
            Manage carriers, compliance, performance, documents, and load history.
          </div>

          {userId ? (
            <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>Debug userId: {userId}</div>
          ) : authErr ? (
            <div style={{ marginTop: 6, color: "#ffb86b", fontSize: 12 }}>{authErr}</div>
          ) : null}
        </div>

        <div className="commandshell__actions">
          <button className="commandshell__btn" type="button" onClick={fetchCarriers}>
            Refresh
          </button>

          <button
            className="commandshell__btn"
            type="button"
            onClick={openAdd}
            disabled={!userId}
            title={!userId ? "Sign in to enable Add Carrier (Option A)." : "Add Carrier"}
          >
            Add Carrier
          </button>
        </div>
      </div>

      {/* ADD MODAL */}
      {addOpen ? (
        <div className="carriercmd__drawerOverlay" role="dialog" aria-modal="true" onClick={() => setAddOpen(false)}>
          <aside className="carriercmd__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="carriercmd__drawerHeader">
              <div>
                <div className="carriercmd__drawerTitle">Add Carrier</div>
                <div className="carriercmd__drawerSub">Saved to Supabase (owner_id = your user).</div>
              </div>
              <button className="carriercmd__drawerClose" type="button" onClick={() => setAddOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="carriercmd__drawerBody">
              <div className="carriercmd__drawerGrid">
                <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                  <div className="carriercmd__drawerCardTitle">Carrier Info</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input
                      className="carriercmd__search"
                      value={carrierForm.name}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Carrier name (required)"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.homeBase}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, homeBase: e.target.value }))}
                      placeholder="Home base (City, ST)"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.mc}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, mc: e.target.value }))}
                      placeholder="MC (optional)"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.dot}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, dot: e.target.value }))}
                      placeholder="DOT (optional)"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.phone}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Phone"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.email}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Email"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.equipment}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, equipment: e.target.value }))}
                      placeholder="Equipment (e.g., Dry Van)"
                    />
                    <select
                      className="carriercmd__search"
                      value={carrierForm.status}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="onboarding">onboarding</option>
                    </select>

                    <input
                      className="carriercmd__search"
                      type="number"
                      value={carrierForm.riskScore}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, riskScore: Number(e.target.value || 0) }))}
                      placeholder="Risk score (0-100)"
                    />
                    <input
                      className="carriercmd__search"
                      value={carrierForm.insuranceExp}
                      onChange={(e) => setCarrierForm((p) => ({ ...p, insuranceExp: e.target.value }))}
                      placeholder="Insurance exp (YYYY-MM-DD)"
                    />
                  </div>

                  <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, opacity: 0.9 }}>
                      <input
                        type="checkbox"
                        checked={carrierForm.insuranceOnFile}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, insuranceOnFile: e.target.checked }))}
                      />
                      Insurance on file
                    </label>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, opacity: 0.9 }}>
                      <input
                        type="checkbox"
                        checked={carrierForm.w9OnFile}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, w9OnFile: e.target.checked }))}
                      />
                      W-9 on file
                    </label>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, opacity: 0.9 }}>
                      <input
                        type="checkbox"
                        checked={carrierForm.authorityOnFile}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, authorityOnFile: e.target.checked }))}
                      />
                      Authority on file
                    </label>
                  </div>

                  <textarea
                    value={carrierForm.notes}
                    onChange={(e) => setCarrierForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Notes (preferences, lanes, check-call rules, etc.)"
                    style={{
                      width: "100%",
                      minHeight: 120,
                      resize: "vertical",
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.25)",
                      color: "inherit",
                      outline: "none",
                      marginTop: 10,
                    }}
                  />

                  {addErr ? (
                    <div className="carriercmd__drawerHint" style={{ color: "#ff7b7b", marginTop: 10 }}>
                      {addErr}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="carriercmd__primaryBtn" type="button" onClick={addCarrier} disabled={addBusy}>
                      {addBusy ? "Saving…" : "Save Carrier"}
                    </button>
                    <button className="carriercmd__filterBtn" type="button" onClick={() => setAddOpen(false)} disabled={addBusy}>
                      Cancel
                    </button>
                  </div>

                  <div className="carriercmd__drawerHint" style={{ marginTop: 10 }}>
                    If you get a “Could not find column…” error, your DB schema doesn’t include that field.
                    This build auto-retries by removing unknown fields.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="carriercmd">
        {/* KPI cards */}
        <div className="carriercmd__kpis">
          <button className="carriercmd__kpi" type="button" onClick={() => setFilterMode("all")}>
            <div className="carriercmd__kpiLabel">ACTIVE</div>
            <div className="carriercmd__kpiValue">{activeCount}</div>
          </button>

          <button className="carriercmd__kpi" type="button" onClick={() => setFilterMode("atRisk")}>
            <div className="carriercmd__kpiLabel">AT RISK</div>
            <div className="carriercmd__kpiValue">{atRiskCount}</div>
          </button>

          <button className="carriercmd__kpi" type="button" onClick={() => setFilterMode("missingDocs")}>
            <div className="carriercmd__kpiLabel">MISSING DOCS</div>
            <div className="carriercmd__kpiValue">{missingDocsCount}</div>
          </button>
        </div>

        {/* Search / filters */}
        <div className="carriercmd__toolbar">
          <input
            className="carriercmd__search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search carriers, MC/DOT, phone, email, notes…"
          />

          <div className="carriercmd__filters">
            <button
              className={`carriercmd__filterBtn ${filterMode === "all" ? "is-on" : ""}`}
              type="button"
              onClick={() => setFilterMode("all")}
            >
              All
            </button>
            <button
              className={`carriercmd__filterBtn ${filterMode === "atRisk" ? "is-on" : ""}`}
              type="button"
              onClick={() => setFilterMode("atRisk")}
            >
              At Risk
            </button>
            <button
              className={`carriercmd__filterBtn ${filterMode === "missingDocs" ? "is-on" : ""}`}
              type="button"
              onClick={() => setFilterMode("missingDocs")}
            >
              Missing Docs
            </button>

            <button
              className="carriercmd__filterBtn"
              type="button"
              onClick={() => {
                setQ("");
                setFilterMode("all");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="carriercmd__content">
          {/* list */}
          <div className="carriercmd__listWrap">
            <div className="carriercmd__listMeta">
              <div className="carriercmd__listMetaLeft">
                <strong>Carriers</strong>
                <span className="carriercmd__listMetaSub">
                  {carriersLoading ? "Loading…" : `Showing ${filtered.length} of ${carriers.length}`}
                </span>
              </div>
            </div>

            <div className="carriercmd__tableWrap">
              <table className="carriercmd__table">
                <thead>
                  <tr>
                    <th>Carrier</th>
                    <th>Status</th>
                    <th>MC/DOT</th>
                    <th>Home Base</th>
                    <th>Risk</th>
                    <th>Docs</th>
                    <th>Last Contact</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {carriersErr ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="carriercmd__muted" style={{ color: "#ff7b7b" }}>
                          {carriersErr}
                        </div>
                      </td>
                    </tr>
                  ) : carriersLoading ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="carriercmd__muted">Loading carriers from Supabase…</div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="carriercmd__muted">No carriers match this filter/search.</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const docsMissing =
                        (c.insuranceOnFile ? 0 : 1) + (c.w9OnFile ? 0 : 1) + (c.authorityOnFile ? 0 : 1);

                      return (
                        <tr
                          key={c.id}
                          onClick={() => openProfile(c.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <div className="carriercmd__cellMain">{c.name || "—"}</div>
                            <div className="carriercmd__cellSub">{c.id}</div>
                          </td>
                          <td>{c.status || "—"}</td>
                          <td>
                            <div className="carriercmd__cellMain">{c.mc || "—"}</div>
                            <div className="carriercmd__cellSub">{c.dot ? `DOT ${c.dot}` : "—"}</div>
                          </td>
                          <td>{c.homeBase || "—"}</td>
                          <td>
                            <span className={`carriercmd__chip carriercmd__chip--${riskLabel(c.riskScore).toLowerCase()}`}>
                              {riskLabel(c.riskScore)}
                            </span>
                          </td>
                          <td>
                            <span className={`carriercmd__chip ${docsMissing > 0 ? "carriercmd__chip--warn" : "carriercmd__chip--ok"}`}>
                              {docsMissing > 0 ? `${docsMissing} missing` : "OK"}
                            </span>
                          </td>
                          <td>{formatWhen(c.lastContactAt)}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="carriercmd__rowBtn"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProfile(c.id);
                              }}
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* right side quick detail */}
          <div className="carriercmd__side">
            <div className="carriercmd__sideCard">
              <div className="carriercmd__sideTitle">Carrier Detail</div>
              {!selected ? (
                <div className="carriercmd__muted">Select a carrier to see details.</div>
              ) : (
                <>
                  <div className="carriercmd__detailRow">
                    <div className="carriercmd__label">Status</div>
                    <div className="carriercmd__value">{selected.status || "—"}</div>
                  </div>

                  <div className="carriercmd__detailRow">
                    <div className="carriercmd__label">MC / DOT</div>
                    <div className="carriercmd__value">
                      {selected.mc || "—"} {selected.dot ? `/ DOT ${selected.dot}` : ""}
                    </div>
                  </div>

                  <div className="carriercmd__detailRow">
                    <div className="carriercmd__label">Home Base</div>
                    <div className="carriercmd__value">{selected.homeBase || "—"}</div>
                  </div>

                  <div className="carriercmd__detailRow">
                    <div className="carriercmd__label">Contact</div>
                    <div className="carriercmd__value">
                      {selected.phone || "—"} {selected.email ? ` / ${selected.email}` : ""}
                    </div>
                  </div>

                  <div className="carriercmd__sideActions">
                    <button className="carriercmd__primaryBtn" type="button" onClick={() => setProfileOpen(true)}>
                      Open Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FULL PROFILE DRAWER */}
        {profileOpen && selected ? (
          <div className="carriercmd__drawerOverlay" role="dialog" aria-modal="true" onClick={() => setProfileOpen(false)}>
            <aside className="carriercmd__drawer" onClick={(e) => e.stopPropagation()}>
              <div className="carriercmd__drawerHeader">
                <div>
                  <div className="carriercmd__drawerTitle">{selected.name}</div>
                  <div className="carriercmd__drawerSub">
                    {selected.id} · {selected.mc || "—"} · {selected.homeBase || "—"}
                  </div>
                </div>

                <button className="carriercmd__drawerClose" type="button" onClick={() => setProfileOpen(false)} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="carriercmd__drawerTabs" role="tablist" aria-label="Carrier profile tabs">
                {["Overview", "Compliance", "Performance", "Notes", "Docs", "Loads"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={profileTab === t}
                    className={`carriercmd__tab ${profileTab === t ? "is-active" : ""}`}
                    onClick={() => {
                      setProfileTab(t);
                      if (t === "Performance") acknowledgeKpi("atRisk");
                      if (t === "Compliance" || t === "Docs") acknowledgeKpi("missingDocs");
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="carriercmd__drawerBody">
                {/* QUICK EDIT BAR (always visible inside drawer) */}
                <div className="carriercmd__drawerGrid" style={{ marginBottom: 10 }}>
                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Edit Carrier</div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input
                        className="carriercmd__search"
                        value={carrierForm.name}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Carrier name"
                      />
                      <select
                        className="carriercmd__search"
                        value={carrierForm.status}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="onboarding">onboarding</option>
                      </select>

                      <input
                        className="carriercmd__search"
                        value={carrierForm.homeBase}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, homeBase: e.target.value }))}
                        placeholder="Home base"
                      />
                      <input
                        className="carriercmd__search"
                        value={carrierForm.equipment}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, equipment: e.target.value }))}
                        placeholder="Equipment"
                      />

                      <input
                        className="carriercmd__search"
                        value={carrierForm.mc}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, mc: e.target.value }))}
                        placeholder="MC"
                      />
                      <input
                        className="carriercmd__search"
                        value={carrierForm.dot}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, dot: e.target.value }))}
                        placeholder="DOT"
                      />

                      <input
                        className="carriercmd__search"
                        value={carrierForm.phone}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="Phone"
                      />
                      <input
                        className="carriercmd__search"
                        value={carrierForm.email}
                        onChange={(e) => setCarrierForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email"
                      />
                    </div>

                    {editErr ? (
                      <div className="carriercmd__drawerHint" style={{ color: "#ff7b7b", marginTop: 10 }}>
                        {editErr}
                      </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                      <button className="carriercmd__primaryBtn" type="button" onClick={saveCarrierEdits} disabled={!userId || editBusy}>
                        {editBusy ? "Saving…" : "Save Changes"}
                      </button>
                      <button className="carriercmd__filterBtn" type="button" onClick={deleteCarrier} disabled={!userId || editBusy}>
                        Delete
                      </button>

                      {!userId ? (
                        <span style={{ fontSize: 12, opacity: 0.75 }}>
                          (Sign in to enable edit/delete)
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Existing tabs (your original content) */}
                {profileTab === "Compliance" ? (
                  <div className="carriercmd__drawerGrid">
                    <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                      <div className="carriercmd__drawerCardTitle">Compliance Snapshot</div>

                      {insuranceSoon ? (
                        <div className="carriercmd__drawerAlert">
                          Insurance expires in <strong>{insuranceDays} day(s)</strong>.
                        </div>
                      ) : null}

                      <div className="carriercmd__drawerDocs">
                        <button
                          className={`carriercmd__doc ${selected.insuranceOnFile ? "is-on" : "is-off"}`}
                          type="button"
                          onClick={() => openDocs("insurance")}
                          title="Open Docs tab (Insurance)"
                        >
                          <span>Insurance</span>
                          <span className="carriercmd__docMeta">
                            {selected.insuranceExp ? `exp ${selected.insuranceExp}` : "no exp date"}
                          </span>
                        </button>

                        <button
                          className={`carriercmd__doc ${selected.w9OnFile ? "is-on" : "is-off"}`}
                          type="button"
                          onClick={() => openDocs("w9")}
                          title="Open Docs tab (W-9)"
                        >
                          <span>W-9</span>
                          <span className="carriercmd__docMeta">{selected.w9OnFile ? "on file" : "missing"}</span>
                        </button>

                        <button
                          className={`carriercmd__doc ${selected.authorityOnFile ? "is-on" : "is-off"}`}
                          type="button"
                          onClick={() => openDocs("authority")}
                          title="Open Docs tab (Authority)"
                        >
                          <span>Authority</span>
                          <span className="carriercmd__docMeta">{selected.authorityOnFile ? "verified" : "missing"}</span>
                        </button>
                      </div>

                      <div className="carriercmd__drawerHint" style={{ marginTop: 10 }}>
                        Tip: Docs tab is where you upload / download / replace the actual files.
                      </div>
                    </div>
                  </div>
                ) : null}

                {profileTab === "Performance" ? (
                  <div className="carriercmd__drawerGrid">
                    <div className="carriercmd__drawerCard">
                      <div className="carriercmd__drawerCardTitle">On-time</div>
                      <div className="carriercmd__drawerBig">{selected.onTime ? `${selected.onTime}%` : "—"}</div>
                    </div>
                    <div className="carriercmd__drawerCard">
                      <div className="carriercmd__drawerCardTitle">Claims</div>
                      <div className="carriercmd__drawerBig">{selected.claims ?? 0}</div>
                    </div>
                    <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                      <div className="carriercmd__drawerCardTitle">Risk Model Notes</div>
                      <div className="carriercmd__drawerHint">
                        Risk label: <strong>{riskLabel(selected.riskScore)}</strong>. Later: combine claims, on-time %,
                        check-call compliance, and doc expiry.
                      </div>
                    </div>
                  </div>
                ) : null}

                {profileTab === "Notes" ? (
                  <div className="carriercmd__drawerGrid">
                    <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                      <div className="carriercmd__drawerCardTitle">Notes</div>

                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add dispatch notes, preferences, lanes, check-call rules…"
                        style={{
                          width: "100%",
                          minHeight: 160,
                          resize: "vertical",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.25)",
                          color: "inherit",
                          outline: "none",
                        }}
                      />

                      {notesErr ? (
                        <div className="carriercmd__drawerHint" style={{ color: "#ff7b7b", marginTop: 10 }}>
                          {notesErr}
                        </div>
                      ) : null}

                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button className="carriercmd__primaryBtn" type="button" onClick={saveNotes} disabled={savingNotes}>
                          {savingNotes ? "Saving…" : "Save Notes"}
                        </button>
                        <button className="carriercmd__filterBtn" type="button" onClick={() => setNotesDraft(selected?.notes ?? "")} disabled={savingNotes}>
                          Reset
                        </button>
                        <button className="carriercmd__filterBtn" type="button" onClick={() => setNotesDraft("")} disabled={savingNotes}>
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {profileTab === "Docs" ? (
                  <div className="carriercmd__drawerGrid">
                    <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                      <div className="carriercmd__drawerCardTitle">Documents</div>
                      <div className="carriercmd__drawerHint">
                        Real uploads stored locally (IndexedDB). Next step later: sync to Supabase Storage.
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <DocRow
                          label="Insurance"
                          docType="insurance"
                          record={docs.insurance}
                          highlight={docFocus === "insurance"}
                          onUpload={handleUpload}
                          onDownload={handleDownload}
                          onRemove={handleRemove}
                        />
                        <DocRow
                          label="W-9"
                          docType="w9"
                          record={docs.w9}
                          highlight={docFocus === "w9"}
                          onUpload={handleUpload}
                          onDownload={handleDownload}
                          onRemove={handleRemove}
                        />
                        <DocRow
                          label="Authority"
                          docType="authority"
                          record={docs.authority}
                          highlight={docFocus === "authority"}
                          onUpload={handleUpload}
                          onDownload={handleDownload}
                          onRemove={handleRemove}
                        />
                      </div>

                      {docBusy ? <div className="carriercmd__drawerHint" style={{ marginTop: 10 }}>Saving…</div> : null}

                      {!idbAvailable() ? (
                        <div className="carriercmd__drawerHint" style={{ marginTop: 10, color: "#ffb86b" }}>
                          IndexedDB is not available in this browser/session, so uploads may not work here.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {profileTab === "Loads" ? (
                  <div className="carriercmd__drawerGrid">
                    <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                      <div className="carriercmd__drawerCardTitle">Load History</div>

                      {loadingLoads ? (
                        <div className="carriercmd__drawerHint">Loading loads…</div>
                      ) : loadErr ? (
                        <div className="carriercmd__drawerHint" style={{ color: "#ff7b7b" }}>{loadErr}</div>
                      ) : selectedLoads.length === 0 ? (
                        <div className="carriercmd__drawerHint">
                          No loads tied to this carrier yet. Once loads use <strong>carrier_id</strong>, they will appear here automatically.
                        </div>
                      ) : (
                        <div className="carriercmd__loadsTableWrap">
                          <table className="carriercmd__loadsTable">
                            <thead>
                              <tr>
                                <th>Load</th>
                                <th>Status</th>
                                <th>Lane</th>
                                <th>Pickup</th>
                                <th>Delivery</th>
                                <th>Net</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedLoads.map((l) => (
                                <tr key={l.id}>
                                  <td>
                                    <div className="carriercmd__cellMain">{l.id}</div>
                                    <div className="carriercmd__cellSub">{l.broker}</div>
                                  </td>
                                  <td>
                                    <span className={`carriercmd__loadChip carriercmd__loadChip--${loadChipKey(l.status)}`}>
                                      {l.status}
                                    </span>
                                  </td>
                                  <td>{l.lane}</td>
                                  <td>{formatWhen(l.pickupAt)}</td>
                                  <td>{formatWhen(l.deliveryAt)}</td>
                                  <td>{Number(l.netRpm || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}