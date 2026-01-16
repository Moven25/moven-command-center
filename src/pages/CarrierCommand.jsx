// src/pages/CarrierCommand.jsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./CommandShell.css";
import "./CarrierCommand.css";
import { useData } from "../state/DataContext";

/* -----------------------------
   Helpers
------------------------------ */
function formatWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskLabel(score) {
  if (score <= 25) return "Low";
  if (score <= 55) return "Medium";
  return "High";
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function loadChipKey(status = "") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function nextCarrierId() {
  return `CR-${Math.floor(10000 + Math.random() * 89999)}`;
}

function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function statusKey(status = "") {
  const s = String(status || "").toLowerCase();
  if (s.includes("risk")) return "risk";
  if (s.includes("onboard")) return "onboarding";
  return "active";
}

function complianceKey(c) {
  const ok = !!c?.insuranceOnFile && !!c?.w9OnFile && !!c?.authorityOnFile;
  return ok ? "complete" : "missing";
}

function calcSuggestedAction(carrier) {
  if (!carrier) return null;

  const missingDocs =
    !carrier.insuranceOnFile || !carrier.w9OnFile || !carrier.authorityOnFile;

  if (missingDocs) {
    const missing = [];
    if (!carrier.insuranceOnFile) missing.push("Insurance");
    if (!carrier.w9OnFile) missing.push("W-9");
    if (!carrier.authorityOnFile) missing.push("Authority");
    return {
      tone: "warn",
      icon: "📄",
      title: "Docs Missing",
      detail: `Request: ${missing.join(", ")}.`,
      cta: "Open Compliance",
      tab: "Compliance",
    };
  }

  const insuranceDays =
    carrier.insuranceExp && typeof carrier.insuranceExp === "string"
      ? daysUntil(carrier.insuranceExp)
      : null;

  if (insuranceDays !== null && insuranceDays <= 30) {
    return {
      tone: "warn",
      icon: "⏳",
      title: "Insurance Expiring",
      detail: `Expires in ${insuranceDays} day(s). Request updated COI.`,
      cta: "Open Compliance",
      tab: "Compliance",
    };
  }

  if (carrier.status === "At Risk") {
    const claims = Number(carrier.claims ?? 0);
    if (claims > 0) {
      return {
        tone: "warn",
        icon: "⚠️",
        title: "At Risk: Claims",
        detail: `Review recent claims (${claims}) and confirm check-call expectations.`,
        cta: "Open Performance",
        tab: "Performance",
      };
    }
    return {
      tone: "warn",
      icon: "⚠️",
      title: "At Risk",
      detail: "Verify on-time performance and set a follow-up check call.",
      cta: "Mark Contact",
      tab: null,
    };
  }

  const last = carrier.lastContactAt ? new Date(carrier.lastContactAt).getTime() : 0;
  const daysSince = last ? Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24)) : null;
  if (daysSince !== null && daysSince >= 2) {
    return {
      tone: "info",
      icon: "📞",
      title: "Follow Up",
      detail: `No contact in ${daysSince} day(s). Quick check-in recommended.`,
      cta: "Mark Contact",
      tab: null,
    };
  }

  return {
    tone: "ok",
    icon: "✅",
    title: "Healthy",
    detail: "No urgent actions. Keep monitoring loads and check calls.",
    cta: "Open Overview",
    tab: "Overview",
  };
}

/* -----------------------------
   IndexedDB (Docs storage)
   - Persists uploads locally
------------------------------ */
const DOC_DB = "lanesync_docs_db_v1";
const DOC_STORE = "docs";

function openDocsDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DOC_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        db.createObjectStore(DOC_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetDoc(key) {
  const db = await openDocsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, "readonly");
    const store = tx.objectStore(DOC_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function dbPutDoc(record) {
  const db = await openDocsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, "readwrite");
    const store = tx.objectStore(DOC_STORE);
    const req = store.put(record);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function dbDeleteDoc(key) {
  const db = await openDocsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, "readwrite");
    const store = tx.objectStore(DOC_STORE);
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

function docKey(carrierId, docType) {
  return `${carrierId}::${docType}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "document";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -----------------------------
   Query param helpers
------------------------------ */
function qp(location) {
  return new URLSearchParams(location.search || "");
}

function mapFilterToListFilter(filter) {
  const f = String(filter || "").toLowerCase();

  if (f === "active") return "ACTIVE";
  if (f === "onboarding") return "ONBOARDING";
  if (f === "atrisk" || f === "at_risk" || f === "at-risk" || f === "risk") return "ATRISK";

  // ComplianceCommand filters
  if (f === "insurance_missing" || f === "docs_missing" || f === "missing_docs") return "MISSINGDOCS";

  if (f === "insurance_on_file") return "ALL";
  if (f === "insurance_expiring") return "ALL";

  if (f === "below-target") return "ALL";

  return "ALL";
}

function mapFocusToTab(focus, doc) {
  const f = String(focus || "").toLowerCase();
  const d = String(doc || "").toLowerCase();

  if (d === "w9" || d === "coi" || d === "authority") return "Docs";

  if (f === "docs") return "Docs";
  if (f === "insurance") return "Compliance";
  if (f === "onboarding") return "Compliance";
  if (f === "risk") return "Performance";
  if (f === "reminders") return "Notes";
  if (f === "performance") return "Performance";
  if (f === "loads") return "Loads";
  return null;
}

/* =============================
   Carrier Command
============================= */
export default function CarrierCommand() {
  const location = useLocation();
  const { carriers, loads, addCarrier, updateCarrier } = useData();

  const [selectedId, setSelectedId] = useState(carriers[0]?.id || null);

  // KPI filter state
  const [listFilter, setListFilter] = useState("ALL");

  // Drawer state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("Overview");

  // Docs focus (for Compliance -> Docs deep link)
  const [docFocus, setDocFocus] = useState(null); // "insurance" | "w9" | "authority"

  // Add Carrier modal
  const [addOpen, setAddOpen] = useState(false);
  const [draftCarrier, setDraftCarrier] = useState({
    id: "",
    name: "",
    status: "Active",
    mc: "",
    dot: "",
    phone: "",
    email: "",
    homeBase: "",
    equipment: "",
    insuranceOnFile: true,
    insuranceExp: "",
    w9OnFile: true,
    authorityOnFile: true,
    notes: "",
  });

  const selected = useMemo(
    () => carriers.find((c) => c.id === selectedId) || null,
    [carriers, selectedId]
  );

  // keep selectedId valid if carriers swap (training/live) or list changes
  useEffect(() => {
    if (!carriers?.length) return;
    const exists = carriers.some((c) => c.id === selectedId);
    if (!exists) setSelectedId(carriers[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carriers]);

  /* ---------------------------------------------------
     URL PARAM SUPPORT
  --------------------------------------------------- */
  useEffect(() => {
    if (!carriers.length) return;

    const params = qp(location);
    const qpCarrierId = (params.get("carrierId") || "").trim();
    const qpCarrierName = (params.get("carrier") || "").trim();
    const qpFilter = (params.get("filter") || "").trim();
    const qpFocus = (params.get("focus") || "").trim();
    const qpDoc = (params.get("doc") || "").trim();

    if (qpFilter) setListFilter(mapFilterToListFilter(qpFilter));

    let match = null;
    if (qpCarrierId) {
      match = carriers.find((c) => c.id === qpCarrierId) || null;
    } else if (qpCarrierName) {
      const wanted = normalize(qpCarrierName);
      match =
        carriers.find((c) => normalize(c.name) === wanted) ||
        carriers.find((c) => normalize(c.name).includes(wanted)) ||
        carriers.find((c) => wanted.includes(normalize(c.name))) ||
        null;
    }
    if (match) setSelectedId(match.id);

    const tab = mapFocusToTab(qpFocus, qpDoc);
    if (tab) {
      setProfileTab(tab);
      setProfileOpen(true);
      if (qpDoc) {
        const d = qpDoc.toLowerCase();
        if (d === "coi") setDocFocus("insurance");
        if (d === "w9") setDocFocus("w9");
        if (d === "authority") setDocFocus("authority");
      }
    }
  }, [location.search, carriers]);

  /* -----------------------------
     KPI values
  ------------------------------ */
  const kpis = useMemo(() => {
    return {
      total: carriers.length,
      active: carriers.filter((c) => c.status === "Active").length,
      onboarding: carriers.filter((c) => c.status === "Onboarding").length,
      atRisk: carriers.filter((c) => c.status === "At Risk").length,
      missingDocs: carriers.filter(
        (c) => !c.insuranceOnFile || !c.w9OnFile || !c.authorityOnFile
      ).length,
    };
  }, [carriers]);

  /* -----------------------------
     KPI "seen" (acknowledge) state
  ------------------------------ */
  const [kpiSeen, setKpiSeen] = useState({ atRisk: 0, missingDocs: 0 });

  useEffect(() => {
    setKpiSeen((prev) => ({
      atRisk: prev.atRisk === kpis.atRisk ? prev.atRisk : 0,
      missingDocs: prev.missingDocs === kpis.missingDocs ? prev.missingDocs : 0,
    }));
  }, [kpis.atRisk, kpis.missingDocs]);

  const acknowledgeKpi = useCallback(
    (key) => {
      if (key === "atRisk") setKpiSeen((p) => ({ ...p, atRisk: kpis.atRisk }));
      if (key === "missingDocs") setKpiSeen((p) => ({ ...p, missingDocs: kpis.missingDocs }));
    },
    [kpis.atRisk, kpis.missingDocs]
  );

  const atRiskPulse = kpis.atRisk > 0 && kpiSeen.atRisk !== kpis.atRisk;
  const missingDocsPulse = kpis.missingDocs > 0 && kpiSeen.missingDocs !== kpis.missingDocs;

  /* -----------------------------
     Filtered list
  ------------------------------ */
  const filteredCarriers = useMemo(() => {
    switch (listFilter) {
      case "ACTIVE":
        return carriers.filter((c) => c.status === "Active");
      case "ONBOARDING":
        return carriers.filter((c) => c.status === "Onboarding");
      case "ATRISK":
        return carriers.filter((c) => c.status === "At Risk");
      case "MISSINGDOCS":
        return carriers.filter(
          (c) => !c.insuranceOnFile || !c.w9OnFile || !c.authorityOnFile
        );
      default:
        return carriers;
    }
  }, [carriers, listFilter]);

  function toggleFilter(next) {
    setListFilter((prev) => (prev === next ? "ALL" : next));
  }

  function markContact() {
    if (!selected) return;
    updateCarrier(selected.id, { lastContactAt: new Date().toISOString() });
  }

  function openProfile(tab = "Overview") {
    if (!selected) return;
    setProfileTab(tab);
    setProfileOpen(true);

    if (tab === "Performance") acknowledgeKpi("atRisk");
    if (tab === "Compliance" || tab === "Docs") acknowledgeKpi("missingDocs");
  }

  function openDocs(docType) {
    if (!selected) return;
    setDocFocus(docType);
    setProfileTab("Docs");
    setProfileOpen(true);
    acknowledgeKpi("missingDocs");
  }

  // helper to make div "button" tiles behave like buttons
  const onTileKeyDown = (e, onActivate) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate?.();
    }
  };

  // Loads tied to selected carrier
  const selectedLoads = useMemo(() => {
    if (!selected) return [];
    const byId = loads.filter((l) => l.carrierId && l.carrierId === selected.id);
    if (byId.length) return byId;
    const name = (selected.name || "").trim().toLowerCase();
    return loads.filter((l) => (l.carrier || "").trim().toLowerCase() === name);
  }, [loads, selected]);

  const recentLoads = useMemo(() => {
    const sorted = [...selectedLoads].sort((a, b) => {
      const ad = new Date(a.pickupAt || a.deliveryAt || 0).getTime();
      const bd = new Date(b.pickupAt || b.deliveryAt || 0).getTime();
      return bd - ad;
    });
    return sorted.slice(0, 4);
  }, [selectedLoads]);

  const insuranceDays = useMemo(() => {
    if (!selected?.insuranceExp) return null;
    return daysUntil(selected.insuranceExp);
  }, [selected]);

  const insuranceSoon = insuranceDays !== null && insuranceDays <= 30;
  const suggested = useMemo(() => calcSuggestedAction(selected), [selected]);

  function openAddCarrier() {
    setDraftCarrier({
      id: "",
      name: "",
      status: "Active",
      mc: "",
      dot: "",
      phone: "",
      email: "",
      homeBase: "",
      equipment: "",
      insuranceOnFile: true,
      insuranceExp: "",
      w9OnFile: true,
      authorityOnFile: true,
      notes: "",
    });
    setAddOpen(true);
  }

  function saveCarrier(e) {
    e.preventDefault();

    const id = (draftCarrier.id || "").trim() || nextCarrierId();
    const name = (draftCarrier.name || "").trim();
    if (!name) return;

    const created = addCarrier({
      ...draftCarrier,
      id,
      name,
      riskScore: 22,
      onTime: 0,
      claims: 0,
      lastContactAt: new Date().toISOString(),
    });

    if (!created) return;
    setSelectedId(created.id);
    setAddOpen(false);
  }

  // Keyboard navigation inside list
  const onListKeyDown = useCallback(
    (e) => {
      if (!filteredCarriers?.length) return;

      const idx = filteredCarriers.findIndex((c) => c.id === selectedId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = filteredCarriers[Math.min(filteredCarriers.length - 1, Math.max(0, idx) + 1)];
        if (next) setSelectedId(next.id);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = filteredCarriers[Math.max(0, Math.max(0, idx) - 1)];
        if (prev) setSelectedId(prev.id);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (selected) {
          setProfileTab("Overview");
          setProfileOpen(true);
        }
      }
    },
    [filteredCarriers, selectedId, selected]
  );

  /* -----------------------------
     REAL DOCS (IndexedDB)
  ------------------------------ */
  const [docs, setDocs] = useState({
    insurance: null,
    w9: null,
    authority: null,
  });
  const [docBusy, setDocBusy] = useState(false);

  const insuranceInputRef = useRef(null);
  const w9InputRef = useRef(null);
  const authorityInputRef = useRef(null);

  const insuranceRowRef = useRef(null);
  const w9RowRef = useRef(null);
  const authorityRowRef = useRef(null);

  const inputRefByType = useMemo(
    () => ({
      insurance: insuranceInputRef,
      w9: w9InputRef,
      authority: authorityInputRef,
    }),
    []
  );

  const rowRefByType = useMemo(
    () => ({
      insurance: insuranceRowRef,
      w9: w9RowRef,
      authority: authorityRowRef,
    }),
    []
  );

  async function refreshDocsForSelected() {
    if (!selected?.id) return;
    const [ins, w9, auth] = await Promise.all([
      dbGetDoc(docKey(selected.id, "insurance")),
      dbGetDoc(docKey(selected.id, "w9")),
      dbGetDoc(docKey(selected.id, "authority")),
    ]);
    setDocs({ insurance: ins, w9: w9, authority: auth });
  }

  useEffect(() => {
    if (!selected?.id) return;
    refreshDocsForSelected().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, profileOpen]);

  // auto-scroll/highlight when Docs tab opens via focus
  useEffect(() => {
    if (!profileOpen) return;
    if (profileTab !== "Docs") return;
    if (!docFocus) return;

    const el = rowRefByType[docFocus]?.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

    const t = setTimeout(() => setDocFocus(null), 1200);
    return () => clearTimeout(t);
  }, [profileOpen, profileTab, docFocus, rowRefByType]);

  async function handleUpload(docType, file) {
    if (!selected?.id || !file) return;
    setDocBusy(true);
    try {
      const record = {
        key: docKey(selected.id, docType),
        carrierId: selected.id,
        docType,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        updatedAt: new Date().toISOString(),
        blob: file,
      };
      await dbPutDoc(record);

      setDocs((prev) => ({ ...prev, [docType]: record }));

      if (docType === "insurance") updateCarrier(selected.id, { insuranceOnFile: true });
      if (docType === "w9") updateCarrier(selected.id, { w9OnFile: true });
      if (docType === "authority") updateCarrier(selected.id, { authorityOnFile: true });

      acknowledgeKpi("missingDocs");
    } finally {
      setDocBusy(false);
    }
  }

  async function handleRemove(docType) {
    if (!selected?.id) return;
    setDocBusy(true);
    try {
      await dbDeleteDoc(docKey(selected.id, docType));
      setDocs((prev) => ({ ...prev, [docType]: null }));

      // IMPORTANT: removing a real uploaded doc should reflect in compliance flags too
      if (docType === "insurance") updateCarrier(selected.id, { insuranceOnFile: false });
      if (docType === "w9") updateCarrier(selected.id, { w9OnFile: false });
      if (docType === "authority") updateCarrier(selected.id, { authorityOnFile: false });
    } finally {
      setDocBusy(false);
    }
  }

  function DocRow({ label, docType, record, highlight }) {
    const ref = inputRefByType[docType];
    const rowRef = rowRefByType[docType];

    return (
      <div
        ref={rowRef}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          border: highlight
            ? "1px solid rgba(255,255,255,0.28)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: highlight ? "0 0 0 2px rgba(255,255,255,0.10)" : "none",
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 240 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>
            {record ? (
              <>
                {record.name} · {(record.size / 1024).toFixed(1)} KB ·{" "}
                {formatWhen(record.updatedAt)}
              </>
            ) : (
              "No file uploaded yet."
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            ref={ref}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(docType, f);
              e.target.value = "";
            }}
          />

          <button
            className="command-shell__btn"
            type="button"
            onClick={() => ref?.current?.click()}
            disabled={docBusy}
          >
            {record ? "Replace" : "Upload"}
          </button>

          <button
            className="command-shell__btn"
            type="button"
            onClick={() => {
              if (!record?.blob) return;
              downloadBlob(record.blob, record.name || `${label}.pdf`);
            }}
            disabled={!record || docBusy}
          >
            Download
          </button>

          <button
            className="command-shell__btn"
            type="button"
            onClick={() => handleRemove(docType)}
            disabled={!record || docBusy}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="command-shell carriercmd">
      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Operations</div>
          <h1 className="command-shell__title">Carrier Command</h1>
          <p className="command-shell__subtitle">
            Carrier profiles, onboarding, compliance, performance, and carrier-linked load history.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" onClick={markContact}>
            Mark Contact
          </button>
          <button
            className="command-shell__btn command-shell__btn--primary"
            type="button"
            onClick={openAddCarrier}
          >
            Add Carrier
          </button>
        </div>
      </header>

      {/* KPIs (CLICKABLE) */}
      <section className="carriercmd__kpis">
        <div
          className={`carriercmd__kpi carriercmd__kpi--neutral ${listFilter === "ALL" ? "is-selected" : ""}`}
          role="button"
          tabIndex={0}
          title="Show all carriers"
          onClick={() => setListFilter("ALL")}
          onKeyDown={(e) => onTileKeyDown(e, () => setListFilter("ALL"))}
        >
          <div className="carriercmd__kpiLabel">Total</div>
          <div className="carriercmd__kpiValue">{kpis.total}</div>
        </div>

        <div
          className={`carriercmd__kpi carriercmd__kpi--ok ${listFilter === "ACTIVE" ? "is-selected" : ""}`}
          role="button"
          tabIndex={0}
          title="Filter Active carriers"
          onClick={() => toggleFilter("ACTIVE")}
          onKeyDown={(e) => onTileKeyDown(e, () => toggleFilter("ACTIVE"))}
        >
          <div className="carriercmd__kpiLabel">Active</div>
          <div className="carriercmd__kpiValue">{kpis.active}</div>
        </div>

        <div
          className={`carriercmd__kpi carriercmd__kpi--info ${listFilter === "ONBOARDING" ? "is-selected" : ""}`}
          role="button"
          tabIndex={0}
          title="Filter Onboarding carriers"
          onClick={() => toggleFilter("ONBOARDING")}
          onKeyDown={(e) => onTileKeyDown(e, () => toggleFilter("ONBOARDING"))}
        >
          <div className="carriercmd__kpiLabel">Onboarding</div>
          <div className="carriercmd__kpiValue">{kpis.onboarding}</div>
        </div>

        <div
          className={`carriercmd__kpi carriercmd__kpi--warn ${listFilter === "ATRISK" ? "is-selected" : ""} ${atRiskPulse ? "is-pulsing" : ""}`}
          role="button"
          tabIndex={0}
          title="Filter At Risk carriers"
          onClick={() => {
            toggleFilter("ATRISK");
            acknowledgeKpi("atRisk");
          }}
          onKeyDown={(e) =>
            onTileKeyDown(e, () => {
              toggleFilter("ATRISK");
              acknowledgeKpi("atRisk");
            })
          }
        >
          <div className="carriercmd__kpiLabel">At Risk</div>
          <div className="carriercmd__kpiValue">{kpis.atRisk}</div>
        </div>

        <div
          className={`carriercmd__kpi carriercmd__kpi--warn ${listFilter === "MISSINGDOCS" ? "is-selected" : ""} ${missingDocsPulse ? "is-pulsing" : ""}`}
          role="button"
          tabIndex={0}
          title="Filter carriers missing documents"
          onClick={() => {
            toggleFilter("MISSINGDOCS");
            acknowledgeKpi("missingDocs");
          }}
          onKeyDown={(e) =>
            onTileKeyDown(e, () => {
              toggleFilter("MISSINGDOCS");
              acknowledgeKpi("missingDocs");
            })
          }
        >
          <div className="carriercmd__kpiLabel">Docs Missing</div>
          <div className="carriercmd__kpiValue">{kpis.missingDocs}</div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="carriercmd__grid">
        {/* LIST */}
        <div className="carriercmd__card carriercmd__card--wide">
          <div className="carriercmd__cardHeader">
            <div>
              <div className="carriercmd__cardTitle">Carrier List</div>
              <div className="carriercmd__cardSub">
                Showing {filteredCarriers.length}
                {listFilter !== "ALL" ? " (filtered)" : ""}
                <span className="carriercmd__kbdHint">↑ ↓ to move · Enter to open</span>
              </div>
            </div>
          </div>

          <div className="carriercmd__tableWrap" tabIndex={0} onKeyDown={onListKeyDown}>
            <table className="carriercmd__table">
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Compliance</th>
                  <th>Performance</th>
                  <th>Last Contact</th>
                </tr>
              </thead>

              <tbody>
                {filteredCarriers.map((c) => {
                  const sKey = statusKey(c.status);
                  const comp = complianceKey(c);
                  const compText = comp === "complete" ? "Complete" : "Docs Missing";

                  const onTime = Number(c.onTime || 0);
                  const claims = Number(c.claims ?? 0);

                  const perfHint =
                    claims > 0 || (onTime > 0 && onTime < 85)
                      ? "Needs attention"
                      : onTime >= 85
                      ? "Solid"
                      : "—";

                  return (
                    <tr
                      key={c.id}
                      className={[
                        selectedId === c.id ? "is-selected" : "",
                        `row--${sKey}`,
                        `row--comp-${comp}`,
                      ].filter(Boolean).join(" ")}
                      onClick={() => setSelectedId(c.id)}
                      onDoubleClick={() => {
                        setSelectedId(c.id);
                        setProfileTab("Overview");
                        setProfileOpen(true);
                      }}
                      title="Click to view · Double-click to open Full Profile"
                    >
                      <td>
                        <div className="carriercmd__cellMain">{c.name}</div>
                        <div className="carriercmd__cellSub">
                          {c.id} · {c.homeBase || "—"}
                        </div>
                      </td>

                      <td>
                        <span className={`carriercmd__chip carriercmd__chip--${sKey}`}>
                          {sKey === "active" ? "Active" : sKey === "onboarding" ? "Onboarding" : "At Risk"}
                        </span>
                      </td>

                      <td>
                        <span className={`carriercmd__pill carriercmd__pill--${comp}`}>
                          {comp === "complete" ? "✓" : "!"}
                        </span>
                        <span className="carriercmd__inlineText">{compText}</span>
                      </td>

                      <td>
                        <span className="carriercmd__inlinePerf">
                          ⏱ {c.onTime || "—"}% · 🧾 {claims}
                        </span>
                        <span className={`carriercmd__perfHint ${perfHint === "Needs attention" ? "is-warn" : ""}`}>
                          {perfHint}
                        </span>
                      </td>

                      <td>{formatWhen(c.lastContactAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL */}
        <div className="carriercmd__card">
          <div className="carriercmd__cardHeader">
            <div>
              <div className="carriercmd__cardTitle">Carrier Detail</div>
              <div className="carriercmd__cardSub">
                {selected ? selected.name : "Select a carrier"}
              </div>
            </div>
          </div>

          {!selected ? (
            <div className="carriercmd__detailEmpty">Select a carrier.</div>
          ) : (
            <div className="carriercmd__detail">
              {suggested ? (
                <div className={`carriercmd__suggest carriercmd__suggest--${suggested.tone}`}>
                  <div className="carriercmd__suggestTop">
                    <div className="carriercmd__suggestTitle">
                      <span className="carriercmd__suggestIcon">{suggested.icon}</span>
                      <span>Suggested Action</span>
                    </div>
                    <span className="carriercmd__suggestBadge">{suggested.title}</span>
                  </div>

                  <div className="carriercmd__suggestDetail">{suggested.detail}</div>

                  <div className="carriercmd__suggestActions">
                    {suggested.cta === "Mark Contact" ? (
                      <button className="command-shell__btn" onClick={markContact}>
                        Mark Contact
                      </button>
                    ) : (
                      <button
                        className="command-shell__btn command-shell__btn--primary"
                        onClick={() => {
                          if (suggested.tab) openProfile(suggested.tab);
                          else openProfile("Overview");
                        }}
                      >
                        {suggested.cta}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="carriercmd__detailRow">
                <div className="carriercmd__label">Status</div>
                <div className="carriercmd__value">
                  <span className={`carriercmd__chip carriercmd__chip--${statusKey(selected.status)}`}>
                    {selected.status}
                  </span>
                  <span className="carriercmd__inlineText">
                    Risk: <strong>{riskLabel(selected.riskScore)}</strong>
                  </span>
                </div>
              </div>

              <div className="carriercmd__detailRow">
                <div className="carriercmd__label">MC / DOT</div>
                <div className="carriercmd__value">
                  {selected.mc || "—"} · {selected.dot || "—"}
                </div>
              </div>

              <div className="carriercmd__detailRow">
                <div className="carriercmd__label">Contact</div>
                <div className="carriercmd__value">
                  {selected.phone || "—"}
                  <br />
                  {selected.email || "—"}
                </div>
              </div>

              <div className="carriercmd__detailRow carriercmd__detailRow--stack">
                <div className="carriercmd__label">Recent Loads</div>
                <div className="carriercmd__value">
                  {recentLoads.length === 0 ? (
                    <div className="carriercmd__muted">No loads tied to this carrier yet.</div>
                  ) : (
                    <div className="carriercmd__loadList">
                      {recentLoads.map((l) => (
                        <div key={l.id} className="carriercmd__loadItem">
                          <div>
                            <div className="carriercmd__loadTop">
                              <span className="carriercmd__loadId">{l.id}</span>
                              <span className={`carriercmd__loadChip carriercmd__loadChip--${loadChipKey(l.status)}`}>
                                {l.status}
                              </span>
                            </div>
                            <div className="carriercmd__loadSub">
                              {l.lane} · Net {Number(l.netRpm || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="carriercmd__loadTime">{formatWhen(l.pickupAt)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="carriercmd__detailActions">
                <button className="command-shell__btn" onClick={markContact}>
                  Mark Contact
                </button>

                <button className="command-shell__btn" onClick={() => openProfile("Overview")}>
                  Open Full Profile
                </button>

                <button className="command-shell__btn" onClick={() => openProfile("Loads")}>
                  View Load History
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ADD CARRIER MODAL */}
      {addOpen ? (
        <div className="carriercmd__modalOverlay" role="dialog" aria-modal="true" onClick={() => setAddOpen(false)}>
          <div className="carriercmd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="carriercmd__modalHeader">
              <div>
                <div className="carriercmd__modalTitle">Add Carrier</div>
                <div className="carriercmd__modalSub">
                  Shared store — adding here shows up in Load Command dropdown instantly.
                </div>
              </div>
              <button className="carriercmd__close" type="button" onClick={() => setAddOpen(false)}>
                ✕
              </button>
            </div>

            <form className="carriercmd__form" onSubmit={saveCarrier}>
              <div className="carriercmd__formGrid">
                <label className="carriercmd__field">
                  <span>Carrier ID (optional)</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.id}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, id: e.target.value }))}
                    placeholder="CR-10201"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Status</span>
                  <select
                    className="carriercmd__select"
                    value={draftCarrier.status}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </label>

                <label className="carriercmd__field carriercmd__field--wide">
                  <span>Carrier Name</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.name}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Carrier legal name"
                    required
                  />
                </label>

                <label className="carriercmd__field">
                  <span>MC</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.mc}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, mc: e.target.value }))}
                    placeholder="MC-123456"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>DOT</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.dot}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, dot: e.target.value }))}
                    placeholder="DOT-123456"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Phone</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.phone}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(555) 555-5555"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Email</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.email}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, email: e.target.value }))}
                    placeholder="dispatch@carrier.com"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Home Base</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.homeBase}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, homeBase: e.target.value }))}
                    placeholder="City, ST"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Equipment</span>
                  <input
                    className="carriercmd__input"
                    value={draftCarrier.equipment}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, equipment: e.target.value }))}
                    placeholder="Dry Van / Reefer / Flatbed"
                  />
                </label>

                <label className="carriercmd__field">
                  <span>Insurance Exp</span>
                  <input
                    className="carriercmd__input"
                    type="date"
                    value={draftCarrier.insuranceExp}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, insuranceExp: e.target.value }))}
                  />
                </label>

                <label className="carriercmd__toggle carriercmd__toggle--wide">
                  <input
                    type="checkbox"
                    checked={draftCarrier.insuranceOnFile}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, insuranceOnFile: e.target.checked }))}
                  />
                  <span>Insurance On File</span>
                </label>

                <label className="carriercmd__toggle carriercmd__toggle--wide">
                  <input
                    type="checkbox"
                    checked={draftCarrier.w9OnFile}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, w9OnFile: e.target.checked }))}
                  />
                  <span>W-9 On File</span>
                </label>

                <label className="carriercmd__toggle carriercmd__toggle--wide">
                  <input
                    type="checkbox"
                    checked={draftCarrier.authorityOnFile}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, authorityOnFile: e.target.checked }))}
                  />
                  <span>Authority Verified</span>
                </label>

                <label className="carriercmd__field carriercmd__field--wide">
                  <span>Notes</span>
                  <textarea
                    className="carriercmd__textarea"
                    value={draftCarrier.notes}
                    onChange={(e) => setDraftCarrier((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Preferences, performance notes, special instructions…"
                  />
                </label>
              </div>

              <div className="carriercmd__formActions">
                <button className="command-shell__btn" type="button" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
                <button className="command-shell__btn command-shell__btn--primary" type="submit">
                  Save Carrier
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
              {profileTab === "Overview" ? (
                <div className="carriercmd__drawerGrid">
                  <div className="carriercmd__drawerCard">
                    <div className="carriercmd__drawerCardTitle">Profile</div>
                    <div className="carriercmd__drawerLine">
                      <span>Status</span>
                      <strong>{selected.status}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>Risk</span>
                      <strong>{riskLabel(selected.riskScore)}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>Equipment</span>
                      <strong>{selected.equipment || "—"}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>MC</span>
                      <strong>{selected.mc || "—"}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>DOT</span>
                      <strong>{selected.dot || "—"}</strong>
                    </div>
                  </div>

                  <div className="carriercmd__drawerCard">
                    <div className="carriercmd__drawerCardTitle">Contact</div>
                    <div className="carriercmd__drawerLine">
                      <span>Phone</span>
                      <strong>{selected.phone || "—"}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>Email</span>
                      <strong>{selected.email || "—"}</strong>
                    </div>
                    <div className="carriercmd__drawerLine">
                      <span>Last contact</span>
                      <strong>{formatWhen(selected.lastContactAt)}</strong>
                    </div>
                  </div>

                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Notes</div>
                    <div className="carriercmd__drawerHint">{selected.notes || "—"}</div>
                  </div>
                </div>
              ) : null}

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
                        <span className="carriercmd__docMeta">
                          {selected.w9OnFile ? "on file" : "missing"}
                        </span>
                      </button>

                      <button
                        className={`carriercmd__doc ${selected.authorityOnFile ? "is-on" : "is-off"}`}
                        type="button"
                        onClick={() => openDocs("authority")}
                        title="Open Docs tab (Authority)"
                      >
                        <span>Authority</span>
                        <span className="carriercmd__docMeta">
                          {selected.authorityOnFile ? "verified" : "missing"}
                        </span>
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
                    <div className="carriercmd__drawerBig">
                      {selected.onTime ? `${selected.onTime}%` : "—"}
                    </div>
                  </div>

                  <div className="carriercmd__drawerCard">
                    <div className="carriercmd__drawerCardTitle">Claims</div>
                    <div className="carriercmd__drawerBig">{selected.claims ?? 0}</div>
                  </div>

                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Risk Model Notes</div>
                    <div className="carriercmd__drawerHint">
                      Risk label: <strong>{riskLabel(selected.riskScore)}</strong>. Later: combine
                      claims, on-time %, check-call compliance, and doc expiry.
                    </div>
                  </div>
                </div>
              ) : null}

              {profileTab === "Notes" ? (
                <div className="carriercmd__drawerGrid">
                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Notes</div>
                    <div className="carriercmd__drawerNotes">{selected.notes || "—"}</div>
                  </div>
                </div>
              ) : null}

              {profileTab === "Docs" ? (
                <div className="carriercmd__drawerGrid">
                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Documents</div>
                    <div className="carriercmd__drawerHint">
                      Real uploads stored locally (IndexedDB). Next step later: sync to Zoho/Drive.
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <DocRow label="Insurance" docType="insurance" record={docs.insurance} highlight={docFocus === "insurance"} />
                      <DocRow label="W-9" docType="w9" record={docs.w9} highlight={docFocus === "w9"} />
                      <DocRow label="Authority" docType="authority" record={docs.authority} highlight={docFocus === "authority"} />
                    </div>

                    {docBusy ? (
                      <div className="carriercmd__drawerHint" style={{ marginTop: 10 }}>
                        Saving…
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {profileTab === "Loads" ? (
                <div className="carriercmd__drawerGrid">
                  <div className="carriercmd__drawerCard carriercmd__drawerCard--wide">
                    <div className="carriercmd__drawerCardTitle">Load History</div>

                    {selectedLoads.length === 0 ? (
                      <div className="carriercmd__drawerHint">
                        No loads tied to this carrier yet. Once loads use <strong>carrierId</strong>, they will appear here automatically.
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
                            {selectedLoads
                              .slice()
                              .sort((a, b) => new Date(b.pickupAt || 0).getTime() - new Date(a.pickupAt || 0).getTime())
                              .map((l) => (
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
  );
}
