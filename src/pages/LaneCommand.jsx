// src/pages/LaneCommand.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LaneCommand.css";
import { createClient } from "@supabase/supabase-js";

/**
 * Lane Command (v2 - Supabase wired + buttons functional)
 * - Lane dropdown loads lanes from Supabase (with safe fallbacks)
 * - Notes saved per lane in Supabase (fallback to localStorage if offline)
 * - Targets (RPM) saved per lane in Supabase (fallback to localStorage)
 * - Save lane writes/upserts lane record in Supabase
 * - History pulls from Supabase loads table by lane (fallback to demo)
 * - Export CSV works (downloads CSV)
 * - Compare 2 lanes works (modal)
 * - Set alert works (saves to localStorage for now)
 * - Open Load Command navigates with query params to /load-command
 *
 * ENV required (Vite):
 *   VITE_SUPABASE_URL=
 *   VITE_SUPABASE_ANON_KEY=
 */

// -----------------------------
// Supabase
// -----------------------------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

// -----------------------------
// Query helpers
// -----------------------------
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function statusFromNetRpm(net) {
  if (net >= 2.35) return { label: "Healthy", tone: "ok" };
  if (net >= 2.10) return { label: "Borderline", tone: "mid" };
  return { label: "Risk", tone: "risk" };
}

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function money(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

function buildSearchFromLane(lane) {
  const p = new URLSearchParams();
  if (lane?.id) p.set("laneId", String(lane.id));

  p.set("from", lane.from);
  p.set("to", lane.to);
  p.set("miles", String(lane.miles));
  p.set("rate", String(lane.rate));
  p.set("net", String(lane.netRpm));

  if (lane.fuel) p.set("fuel", lane.fuel);
  if (lane.detention) p.set("detention", lane.detention);
  if (lane.appt) p.set("appt", lane.appt);

  return `?${p.toString()}`;
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// -----------------------------
// LocalStorage fallbacks (still used for offline + alerts)
// -----------------------------
function storageKeyNotes(laneId) {
  return `lanesync:laneNotes:${laneId || "demo"}`;
}
function storageKeyTargets() {
  return `lanesync:laneTargets`;
}
function storageKeySavedLanes() {
  return `lanesync:savedLanes`;
}
function storageKeyAlerts() {
  return `lanesync:laneAlerts`;
}

// -----------------------------
// Normalizers for DB rows
// -----------------------------
function normalizeLane(row) {
  if (!row) return null;
  return {
    id: row.id ?? row.lane_id ?? row.uuid ?? row.code ?? "",
    label:
      row.label ??
      row.name ??
      row.display_name ??
      `${row.from ?? row.origin ?? "—"} → ${row.to ?? row.destination ?? "—"}`,
    from: row.from ?? row.origin ?? "—",
    to: row.to ?? row.destination ?? "—",
    miles: num(row.miles ?? row.distance_miles, 0),
    rate: num(row.rate ?? row.linehaul_rate, 0),
    netRpm: num(row.net_rpm ?? row.netRpm ?? row.net, 0),
    fuel: row.fuel ?? row.fuel_surcharge ?? "Incl.",
    detention: row.detention ?? row.detention_policy ?? "Confirm",
    appt: row.appt ?? row.appointment ?? row.appt_window ?? "FCFS",
  };
}

function normalizeLoadToHistory(row) {
  // We map loads to the history table rows expected by UI.
  // We *try* common columns; adjust if your schema differs.
  const pickup = row.pickup_at ?? row.pickupAt ?? row.pickup_date ?? row.pickupDate ?? null;
  const created = row.created_at ?? row.createdAt ?? null;
  const dateObj = pickup ? new Date(pickup) : created ? new Date(created) : null;
  const mm = dateObj ? String(dateObj.getMonth() + 1).padStart(2, "0") : "—";
  const dd = dateObj ? String(dateObj.getDate()).padStart(2, "0") : "—";
  const date = dateObj ? `${mm}/${dd}` : "—";

  const miles = num(row.miles ?? row.distance_miles, 0);
  const rate = num(row.rate ?? row.linehaul_rate ?? row.total_rate, 0);
  const net = num(row.net_rpm ?? row.netRpm ?? row.net, 0);

  return {
    date,
    rpm: Math.max(1.0, net || 1.0),
    broker: row.broker ?? row.broker_name ?? row.brokerCompany ?? "—",
    miles,
    rate,
  };
}

export default function LaneCommand() {
  const query = useQuery();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("intel"); // intel | dtl | history | profit

  // ---------- UI helpers (toast + modal) ----------
  const [toast, setToast] = useState(null); // {msg}
  const toastNow = (msg) => {
    setToast({ msg });
    window.clearTimeout(toastNow._t);
    toastNow._t = window.setTimeout(() => setToast(null), 2400);
  };

  const [modal, setModal] = useState(null);
  // modal shapes:
  // { type:"note" }
  // { type:"rateBump", bump, desiredRate, script }
  // { type:"targetRpm" }
  // { type:"script", title, text }
  // { type:"compare", options, aId, bId }
  const closeModal = () => setModal(null);

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      toastNow("Copied to clipboard.");
    } catch {
      toastNow("Copy failed — try manually selecting the text.");
    }
  };

  // ---------- Base notes/markets (defaults) ----------
  const baseNotes = useMemo(
    () => [
      "Avoid rush-hour pickup windows (major metros).",
      "Receivers may prefer early AM delivery.",
      "Watch for weekend deadhead spikes.",
    ],
    []
  );

  const baseMarkets = useMemo(
    () => [
      { label: "Headhaul strength", value: "Strong", tone: "ok" },
      { label: "Backhaul availability", value: "Moderate", tone: "mid" },
      { label: "Seasonality", value: "Stable", tone: "ok" },
    ],
    []
  );

  // ---------- Lane options (Supabase + fallback demo) ----------
  const demoLaneOptions = useMemo(
    () => [
      {
        id: "chi-dal",
        label: "Chicago, IL → Dallas, TX",
        from: "Chicago, IL",
        to: "Dallas, TX",
        miles: 920,
        rate: 2600,
        netRpm: 2.17,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "Needs window",
      },
      {
        id: "dal-mem",
        label: "Dallas, TX → Memphis, TN",
        from: "Dallas, TX",
        to: "Memphis, TN",
        miles: 452,
        rate: 1050,
        netRpm: 1.88,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "FCFS",
      },
      {
        id: "chi-atl",
        label: "Chicago, IL → Atlanta, GA",
        from: "Chicago, IL",
        to: "Atlanta, GA",
        miles: 720,
        rate: 2400,
        netRpm: 2.45,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "AM window",
      },
      {
        id: "atl-nsh",
        label: "Atlanta, GA → Nashville, TN",
        from: "Atlanta, GA",
        to: "Nashville, TN",
        miles: 250,
        rate: 700,
        netRpm: 2.55,
        fuel: "Incl.",
        detention: "Confirm",
        appt: "FCFS",
      },
    ],
    []
  );

  const lanesTable = "lanes"; // ✅ change if your schema uses a different table name
  const loadsTable = "loads"; // ✅ used for History

  const [laneOptions, setLaneOptions] = useState(demoLaneOptions);
  const [lanesErr, setLanesErr] = useState("");
  const [lanesLoading, setLanesLoading] = useState(true);

  async function fetchLanes() {
    setLanesErr("");
    if (!supabase) {
      setLaneOptions(demoLaneOptions);
      setLanesLoading(false);
      setLanesErr("Supabase env missing. Using demo lanes.");
      return;
    }

    setLanesLoading(true);

    // Try a few common order columns to avoid “blank screen” if column doesn't exist.
    let data = null;
    let error = null;

    // Attempt 1: created_at
    {
      const res = await supabase.from(lanesTable).select("*").order("created_at", { ascending: false });
      data = res.data;
      error = res.error;
    }
    // Attempt 2: createdAt
    if (error && String(error.message || "").toLowerCase().includes("column")) {
      const res2 = await supabase.from(lanesTable).select("*").order("createdAt", { ascending: false });
      data = res2.data;
      error = res2.error;
    }
    // Attempt 3: no order
    if (error && String(error.message || "").toLowerCase().includes("column")) {
      const res3 = await supabase.from(lanesTable).select("*");
      data = res3.data;
      error = res3.error;
    }

    if (error) {
      setLaneOptions(demoLaneOptions);
      setLanesErr(error.message || "Could not load lanes from Supabase. Using demo lanes.");
      setLanesLoading(false);
      return;
    }

    const normalized = (data || []).map(normalizeLane).filter(Boolean);
    setLaneOptions(normalized.length ? normalized : demoLaneOptions);
    setLanesLoading(false);
  }

  useEffect(() => {
    fetchLanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Selected lane state ----------
  const laneIdFromUrl = query.get("laneId") || "";
  const [selectedLaneId, setSelectedLaneId] = useState(laneIdFromUrl);

  useEffect(() => setSelectedLaneId(laneIdFromUrl), [laneIdFromUrl]);

  const selectedLaneObject = useMemo(() => {
    return laneOptions.find((l) => String(l.id) === String(selectedLaneId)) || null;
  }, [laneOptions, selectedLaneId]);

  // Lane data: URL params > dropdown > demo
  const lane = useMemo(() => {
    const fromQ = query.get("from");
    const toQ = query.get("to");

    if (fromQ || toQ) {
      return {
        id: query.get("laneId") || "",
        from: fromQ || "Chicago, IL",
        to: toQ || "Dallas, TX",
        miles: num(query.get("miles"), 920),
        rate: num(query.get("rate"), 2600),
        fuel: query.get("fuel") || "Incl.",
        detention: query.get("detention") || "Confirm",
        appointment: query.get("appt") || "Needs window",
        notes: baseNotes,
        markets: baseMarkets,
      };
    }

    if (selectedLaneObject) {
      return {
        id: String(selectedLaneObject.id),
        from: selectedLaneObject.from,
        to: selectedLaneObject.to,
        miles: selectedLaneObject.miles,
        rate: selectedLaneObject.rate,
        fuel: selectedLaneObject.fuel || "Incl.",
        detention: selectedLaneObject.detention || "Confirm",
        appointment: selectedLaneObject.appt || "Needs window",
        notes: baseNotes,
        markets: baseMarkets,
      };
    }

    return {
      id: "",
      from: "Chicago, IL",
      to: "Dallas, TX",
      miles: 920,
      rate: 2600,
      fuel: "Incl.",
      detention: "Confirm",
      appointment: "Needs window",
      notes: baseNotes,
      markets: baseMarkets,
    };
  }, [query, selectedLaneObject, baseNotes, baseMarkets]);

  const hasSelectedLane = useMemo(() => {
    return Boolean(
      query.get("from") || query.get("to") || query.get("miles") || query.get("rate") || query.get("laneId")
    );
  }, [query]);

  const netRpm = useMemo(() => {
    const netQ = query.get("net");
    if (netQ != null) return num(netQ, 2.17);
    if (selectedLaneObject) return num(selectedLaneObject.netRpm, 2.17);
    return 2.17;
  }, [query, selectedLaneObject]);

  const status = useMemo(() => statusFromNetRpm(netRpm), [netRpm]);

  // ---------- Notes: Supabase first, localStorage fallback ----------
  const [laneNotes, setLaneNotes] = useState([]);
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesErr, setNotesErr] = useState("");

  async function fetchNotes(laneId) {
    setNotesErr("");
    if (!laneId) {
      // demo mode uses localStorage
      const raw = localStorage.getItem(storageKeyNotes("demo"));
      const arr = safeJsonParse(raw, []);
      setLaneNotes(Array.isArray(arr) ? arr : []);
      return;
    }

    // Supabase path (preferred)
    if (supabase) {
      setNotesBusy(true);
      try {
        // Table: lane_notes (lane_id, note, created_at)
        // If you don’t have this table yet, it will gracefully fall back to localStorage.
        const res = await supabase
          .from("lane_notes")
          .select("*")
          .eq("lane_id", String(laneId))
          .order("created_at", { ascending: false });

        if (res.error) throw res.error;

        const arr = (res.data || []).map((r) => r.note).filter(Boolean);
        setLaneNotes(arr);
        return;
      } catch (e) {
        setNotesErr("Notes table not available — using local notes.");
        // fallthrough to local
      } finally {
        setNotesBusy(false);
      }
    }

    const raw = localStorage.getItem(storageKeyNotes(laneId));
    const arr = safeJsonParse(raw, []);
    setLaneNotes(Array.isArray(arr) ? arr : []);
  }

  useEffect(() => {
    fetchNotes(lane.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lane.id]);

  const mergedNotes = useMemo(() => {
    const all = [...(lane.notes || []), ...(laneNotes || [])];
    return Array.from(new Set(all));
  }, [lane.notes, laneNotes]);

  // ---------- Targets: Supabase first, localStorage fallback ----------
  const [targetRpmMap, setTargetRpmMap] = useState({});
  const [targetsErr, setTargetsErr] = useState("");

  async function fetchTargets() {
    setTargetsErr("");

    // Supabase: lane_targets (lane_id, target_rpm)
    if (supabase) {
      try {
        const res = await supabase.from("lane_targets").select("*");
        if (res.error) throw res.error;
        const map = {};
        for (const r of res.data || []) {
          map[String(r.lane_id)] = Number(r.target_rpm);
        }
        setTargetRpmMap(map);
        return;
      } catch {
        setTargetsErr("Targets table not available — using local targets.");
      }
    }

    const raw = localStorage.getItem(storageKeyTargets());
    const obj = safeJsonParse(raw, {});
    setTargetRpmMap(obj && typeof obj === "object" ? obj : {});
  }

  useEffect(() => {
    fetchTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targetRpm = useMemo(() => {
    const t = targetRpmMap[lane.id || "demo"];
    return Number.isFinite(Number(t)) ? Number(t) : 2.3;
  }, [targetRpmMap, lane.id]);

  // ---------- History: Supabase loads by lane (fallback demo) ----------
  const [historyRows, setHistoryRows] = useState([]);
  const [historyErr, setHistoryErr] = useState("");
  const [historyBusy, setHistoryBusy] = useState(false);

  const demoHistory = useMemo(
    () => [
      { date: "01/06", rpm: Math.max(1.0, netRpm + 0.18), broker: "ABC Logistics", miles: lane.miles, rate: lane.rate },
      { date: "12/28", rpm: Math.max(1.0, netRpm + 0.03), broker: "RoadStar", miles: lane.miles, rate: Math.round(lane.rate * 0.95) },
      { date: "12/16", rpm: Math.max(1.0, netRpm - 0.07), broker: "BlueHaul", miles: lane.miles, rate: Math.round(lane.rate * 0.92) },
      { date: "12/03", rpm: Math.max(1.0, netRpm - 0.19), broker: "Atlas Freight", miles: lane.miles, rate: Math.round(lane.rate * 0.87) },
    ],
    [lane.miles, lane.rate, netRpm]
  );

  async function fetchHistory(laneId) {
    setHistoryErr("");

    // No lane selected: demo
    if (!laneId) {
      setHistoryRows(demoHistory);
      return;
    }

    if (!supabase) {
      setHistoryRows(demoHistory);
      setHistoryErr("Supabase env missing — showing demo history.");
      return;
    }

    setHistoryBusy(true);
    try {
      // Try to pull loads tied to lane via a few common columns
      // Attempt 1: lane_id
      let data = null;
      let error = null;

      {
        const res = await supabase.from(loadsTable).select("*").eq("lane_id", String(laneId)).limit(50);
        data = res.data;
        error = res.error;
      }

      // Attempt 2: laneId
      if (error && String(error.message || "").toLowerCase().includes("column")) {
        const res2 = await supabase.from(loadsTable).select("*").eq("laneId", String(laneId)).limit(50);
        data = res2.data;
        error = res2.error;
      }

      // Attempt 3: origin/destination string match (weak fallback)
      if ((error && String(error.message || "").toLowerCase().includes("column")) || (!error && (data || []).length === 0)) {
        const res3 = await supabase
          .from(loadsTable)
          .select("*")
          .ilike("lane", `%${lane.from}%${lane.to}%`)
          .limit(50);
        if (!res3.error) {
          data = res3.data;
          error = null;
        }
      }

      if (error) throw error;

      const rows = (data || []).map(normalizeLoadToHistory);
      setHistoryRows(rows.length ? rows : demoHistory);
      if (!rows.length) setHistoryErr("No loads found for this lane yet — showing demo history.");
    } catch (e) {
      setHistoryRows(demoHistory);
      setHistoryErr(e?.message || "Could not load history — showing demo history.");
    } finally {
      setHistoryBusy(false);
    }
  }

  useEffect(() => {
    if (activeTab !== "history") return;
    fetchHistory(lane.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, lane.id, lane.from, lane.to]);

  // DTL preview (still demo)
  const dtl = useMemo(
    () => ({
      score: 78,
      suggestions: [
        "Ask for +$150 to cover appointment constraint.",
        "Confirm detention policy before tender.",
        "If reload < $2.10 RPM, consider alternate exit market (Fort Worth).",
      ],
      checks: [
        { label: "Deadhead under 60 mi", ok: true },
        { label: "Receiver appt risk", ok: false },
        { label: "Fuel surcharge included", ok: true },
        { label: "Reload probability", ok: true },
      ],
    }),
    []
  );

  // ---------- Actions ----------
  const onSelectLane = (e) => {
    const id = e.target.value;
    setSelectedLaneId(id);

    if (!id) {
      navigate("/lane-command", { replace: false });
      toastNow("Lane cleared (demo mode).");
      return;
    }

    const chosen = laneOptions.find((l) => String(l.id) === String(id));
    if (!chosen) return;

    navigate(`/lane-command${buildSearchFromLane(chosen)}`, { replace: false });
    toastNow(`Loaded: ${chosen.label}`);
  };

  const popOut = () => {
    window.open(`/lane-command${window.location.search}`, "_blank", "noopener,noreferrer");
  };

  const saveLane = async () => {
    const payload = {
      id: lane.id || "demo",
      from: lane.from,
      to: lane.to,
      miles: lane.miles,
      rate: lane.rate,
      net_rpm: netRpm,
      updated_at: new Date().toISOString(),
      label: `${lane.from} → ${lane.to}`,
    };

    // Always keep local “saved lanes” (fast UX)
    const raw = localStorage.getItem(storageKeySavedLanes());
    const arr = safeJsonParse(raw, []);
    const next = Array.isArray(arr) ? arr : [];
    const idx = next.findIndex((x) => String(x?.id) === String(payload.id));
    if (idx >= 0) next[idx] = { ...next[idx], ...payload, netRpm };
    else next.unshift({ ...payload, netRpm });
    localStorage.setItem(storageKeySavedLanes(), JSON.stringify(next));

    // Supabase upsert (if lane id is not demo)
    if (!supabase) {
      toastNow("Saved locally (Supabase not configured).");
      return;
    }
    if (!lane.id) {
      toastNow("Saved locally (no laneId). Select a lane from Supabase to save server-side.");
      return;
    }

    try {
      // If your lanes table uses different column names, adjust here.
      const res = await supabase
        .from(lanesTable)
        .upsert(
          {
            id: String(lane.id),
            from: lane.from,
            to: lane.to,
            miles: lane.miles,
            rate: lane.rate,
            net_rpm: netRpm,
            label: `${lane.from} → ${lane.to}`,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("*")
        .maybeSingle();

      if (res.error) throw res.error;

      toastNow("Lane saved to Supabase.");
      // refresh list to pick up any DB-side changes
      fetchLanes();
    } catch (e) {
      toastNow("Saved locally (Supabase save failed).");
    }
  };

  const openAddNote = () => setModal({ type: "note" });

  const addNote = async (text) => {
    const note = (text || "").trim();
    if (!note) {
      toastNow("Note is empty.");
      return;
    }

    // Supabase lane_notes insert
    if (supabase && lane.id) {
      try {
        setNotesBusy(true);
        const res = await supabase.from("lane_notes").insert({
          lane_id: String(lane.id),
          note,
        });
        if (res.error) throw res.error;

        await fetchNotes(lane.id);
        closeModal();
        toastNow("Note added (Supabase).");
        return;
      } catch {
        // fallback to local
      } finally {
        setNotesBusy(false);
      }
    }

    const raw = localStorage.getItem(storageKeyNotes(lane.id));
    const arr = safeJsonParse(raw, []);
    const next = Array.isArray(arr) ? arr : [];
    next.unshift(note);
    localStorage.setItem(storageKeyNotes(lane.id), JSON.stringify(next));
    setLaneNotes(next);
    closeModal();
    toastNow("Note added (local).");
  };

  const openRateBump = () => {
    const bump = 150;
    const desiredRate = lane.rate + bump;
    const script = `Hey — to make ${lane.from} → ${lane.to} work with the appointment/fuel, we’d need ${money(
      desiredRate
    )}. If you can get close, we can move fast and cover it clean.`;
    setModal({ type: "rateBump", bump, desiredRate, script });
  };

  const setTarget = async (value) => {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) {
      toastNow("Invalid target RPM.");
      return;
    }

    // Supabase lane_targets upsert
    if (supabase && lane.id) {
      try {
        const res = await supabase
          .from("lane_targets")
          .upsert({ lane_id: String(lane.id), target_rpm: v }, { onConflict: "lane_id" });
        if (res.error) throw res.error;

        await fetchTargets();
        closeModal();
        toastNow(`Target RPM set to $${v.toFixed(2)} (Supabase).`);
        return;
      } catch {
        // fallback local
      }
    }

    const raw = localStorage.getItem(storageKeyTargets());
    const obj = safeJsonParse(raw, {});
    const next = obj && typeof obj === "object" ? { ...obj } : {};
    next[lane.id || "demo"] = v;
    localStorage.setItem(storageKeyTargets(), JSON.stringify(next));
    setTargetRpmMap(next);
    closeModal();
    toastNow(`Target RPM set to $${v.toFixed(2)} (local).`);
  };

  // Rate needed for target (simple calc)
  const rateNeeded = useMemo(() => Math.round(lane.miles * targetRpm), [lane.miles, targetRpm]);

  const openBrokerScript = () => {
    const txt = `For ${lane.from} → ${lane.to} (${lane.miles} mi), we’re targeting $${targetRpm.toFixed(
      2
    )} net RPM. That puts us at ${money(rateNeeded)}. If you can get close, we’ll take it and move immediately.`;
    setModal({ type: "script", title: "Broker Script", text: txt });
  };

  const openLoadCommand = () => {
    // ✅ now functional: navigate to Load Command with lane context
    const p = new URLSearchParams();
    if (lane.id) p.set("laneId", String(lane.id));
    p.set("from", lane.from);
    p.set("to", lane.to);
    p.set("miles", String(lane.miles));
    p.set("rate", String(lane.rate));
    p.set("net", String(netRpm));
    navigate(`/load-command?${p.toString()}`);
  };

  // ---------- History tools ----------
  const exportCsv = () => {
    const rows = (historyRows || []).length ? historyRows : demoHistory;
    const header = ["Date", "Broker", "Miles", "Rate", "NetRPM"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.date, `"${String(r.broker || "").replaceAll('"', '""')}"`, r.miles, r.rate, r.rpm.toFixed(2)].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lane_history_${(lane.id || "demo").toString().replaceAll(":", "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toastNow("CSV exported.");
  };

  const openCompare = () => {
    const options = laneOptions.map((l) => ({ id: String(l.id), label: l.label }));
    setModal({
      type: "compare",
      options,
      aId: String(lane.id || ""),
      bId: options[0]?.id || "",
    });
  };

  const saveAlertRule = () => {
    const raw = localStorage.getItem(storageKeyAlerts());
    const arr = safeJsonParse(raw, []);
    const next = Array.isArray(arr) ? arr : [];
    next.unshift({
      laneId: lane.id || "demo",
      createdAt: new Date().toISOString(),
      rule: { type: "net_rpm_below", value: 2.1 },
    });
    localStorage.setItem(storageKeyAlerts(), JSON.stringify(next));
    toastNow("Alert saved (local).");
  };

  // ---------- Render helpers ----------
  const Modal = ({ children }) => {
    return (
      <div
        onMouseDown={closeModal}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          zIndex: 50,
        }}
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: "min(720px, 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(12,16,24,0.86)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 26px 70px rgba(0,0,0,0.55)",
            padding: 14,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const ModalHeader = ({ title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontWeight: 950, letterSpacing: "0.02em" }}>{title}</div>
      <div style={{ marginLeft: "auto" }}>
        <button className="lc-mini-btn" onClick={closeModal} type="button">
          Close
        </button>
      </div>
    </div>
  );

  const CompareBody = ({ options, aId, bId }) => {
    const a = laneOptions.find((x) => String(x.id) === String(aId)) || null;
    const b = laneOptions.find((x) => String(x.id) === String(bId)) || null;

    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>Lane A</div>
            <select
              value={aId}
              onChange={(e) => setModal((m) => ({ ...m, aId: e.target.value }))}
              style={{
                width: "100%",
                height: 38,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.92)",
                padding: "0 10px",
                fontWeight: 850,
                outline: "none",
              }}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id} style={{ color: "#0b1220" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>Lane B</div>
            <select
              value={bId}
              onChange={(e) => setModal((m) => ({ ...m, bId: e.target.value }))}
              style={{
                width: "100%",
                height: 38,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.92)",
                padding: "0 10px",
                fontWeight: 850,
                outline: "none",
              }}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id} style={{ color: "#0b1220" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 12 }}>
          {!a || !b ? (
            <div style={{ opacity: 0.8, fontSize: 12, fontWeight: 800 }}>Select 2 lanes to compare.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <CompareCard title={a.label} miles={a.miles} rate={a.rate} net={a.netRpm} />
              <CompareCard title={b.label} miles={b.miles} rate={b.rate} net={b.netRpm} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const CompareCard = ({ title, miles, rate, net }) => {
    const st = statusFromNetRpm(num(net, 0));
    return (
      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          padding: 12,
        }}
      >
        <div style={{ fontWeight: 950, marginBottom: 6 }}>{title}</div>
        <div style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 850, opacity: 0.92 }}>
          <div>Miles: {miles}</div>
          <div>Rate: {money(rate)}</div>
          <div>
            Net RPM: ${num(net, 0).toFixed(2)}{" "}
            <span style={{ opacity: 0.75 }}>({st.label})</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lc-page">
      <div className="lc-canvas">
        <div className="lc-panel">
          {/* Top strip */}
          <div className="lc-topstrip">
            <div className="lc-pill">Lane Command</div>

            {/* Select Lane dropdown */}
            <div className="lc-pill" style={{ padding: 0, overflow: "hidden" }}>
              <select
                value={selectedLaneId}
                onChange={onSelectLane}
                aria-label="Select lane"
                style={{
                  height: 30,
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 900,
                  padding: "0 10px",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="">
                  {lanesLoading ? "Loading lanes…" : "Select lane…"}
                </option>
                {laneOptions.map((l) => (
                  <option key={String(l.id)} value={String(l.id)} style={{ color: "#0b1220" }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lc-pill">
              {lane.from} → {lane.to}
            </div>
            <div className="lc-pill">Miles: {lane.miles}</div>
            <div className="lc-pill">Rate: ${lane.rate.toLocaleString()}</div>

            <div className="lc-actions">
              <button className="lc-btn" onClick={fetchLanes} type="button">
                Refresh
              </button>
              <button className="lc-btn" onClick={popOut} type="button">
                Pop Out ↗
              </button>
            </div>
          </div>

          {(lanesErr || notesErr || targetsErr || historyErr) && (
            <div style={{ padding: "0 18px 10px", opacity: 0.9, fontSize: 12, fontWeight: 800, color: "#ffb86b" }}>
              {lanesErr || notesErr || targetsErr || historyErr}
            </div>
          )}

          {!hasSelectedLane && (
            <div style={{ padding: "0 18px 10px", opacity: 0.8, fontSize: 12, fontWeight: 750 }}>
              No lane selected yet — showing demo lane. Use the <b>Select lane…</b> dropdown above.
            </div>
          )}

          {/* Header */}
          <div className="lc-header">
            <div className="lc-brand">
              <div className="lc-brand-big">LANESYNC</div>
              <div className="lc-brand-small">Lane Command</div>
            </div>

            <div className="lc-title">
              {lane.from} → {lane.to}
            </div>

            <div className="lc-badges">
              <div className={`lc-badge ${status.tone}`}>
                {status.label} • Net ${netRpm.toFixed(2)} RPM
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="lc-tabs">
            <button className={`lc-tab ${activeTab === "intel" ? "on" : ""}`} onClick={() => setActiveTab("intel")} type="button">
              Intel
            </button>
            <button className={`lc-tab ${activeTab === "dtl" ? "on" : ""}`} onClick={() => setActiveTab("dtl")} type="button">
              DTL Logic
            </button>
            <button className={`lc-tab ${activeTab === "history" ? "on" : ""}`} onClick={() => setActiveTab("history")} type="button">
              History
            </button>
            <button className={`lc-tab ${activeTab === "profit" ? "on" : ""}`} onClick={() => setActiveTab("profit")} type="button">
              Profitability
            </button>
          </div>

          {/* Body */}
          <div className="lc-body">
            {activeTab === "intel" && (
              <div className="lc-grid">
                <div className="lc-card">
                  <div className="lc-card-title">Lane Intel</div>

                  <div className="lc-kv">
                    <div className="k">From:</div>
                    <div className="v">{lane.from}</div>
                    <div className="k">To:</div>
                    <div className="v">{lane.to}</div>
                    <div className="k">Miles:</div>
                    <div className="v">{lane.miles}</div>
                    <div className="k">Fuel:</div>
                    <div className="v">{lane.fuel}</div>
                    <div className="k">Detention:</div>
                    <div className="v">{lane.detention}</div>
                    <div className="k">Appt:</div>
                    <div className="v">{lane.appointment}</div>
                  </div>

                  <div className="lc-card-subtitle">Notes</div>
                  <ul className="lc-notes">
                    {mergedNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>

                  {notesBusy && (
                    <div className="lc-hint" style={{ marginTop: 8 }}>
                      Saving/Loading…
                    </div>
                  )}
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Market Signals</div>

                  <div className="lc-signal-list">
                    {lane.markets.map((m) => (
                      <div key={m.label} className={`lc-signal ${m.tone}`}>
                        <div className="lc-signal-label">{m.label}</div>
                        <div className="lc-signal-value">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Quick Actions</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={saveLane}>
                      Save lane
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openAddNote}>
                      Add note
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openRateBump}>
                      Request rate bump
                    </button>
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Snapshot</div>
                  <div className="lc-big">
                    <div className="lc-big-label">Net RPM</div>
                    <div className="lc-big-value">${netRpm.toFixed(2)}</div>
                    <div className={`lc-tag ${status.tone}`}>{status.label}</div>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Last 3 Rates</div>
                  <div className="lc-rate-chips">
                    {(historyRows.length ? historyRows : demoHistory).slice(0, 3).map((h, idx) => (
                      <div key={`${h.date}-${idx}`} className="lc-rate-chip">
                        <div className="lc-rate-date">{h.date}</div>
                        <div className="lc-rate-val">${Number(h.rpm || 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dtl" && (
              <div className="lc-grid dtl">
                <div className="lc-card">
                  <div className="lc-card-title">DTL Score</div>
                  <div className="lc-score">
                    <div className="lc-score-num">{dtl.score}</div>
                    <div className="lc-score-sub">/ 100</div>
                  </div>
                  <div className="lc-score-hint">Higher score = better fit for DTL / reload flow.</div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Checks</div>
                  <div className="lc-checks">
                    {dtl.checks.map((c) => (
                      <div key={c.label} className={`lc-check ${c.ok ? "ok" : "risk"}`}>
                        <span className="dot" />
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Recommendations</div>
                  <ol className="lc-recs">
                    {dtl.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Next step</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={openBrokerScript}>
                      Open Broker Script
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openLoadCommand}>
                      Open Load Command
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={() => setModal({ type: "targetRpm" })}>
                      Set Target RPM
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="lc-grid history">
                <div className="lc-card">
                  <div className="lc-card-title">Lane History</div>

                  {historyBusy && <div className="lc-hint">Loading history…</div>}

                  <div className="lc-table-wrap">
                    <table className="lc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Broker</th>
                          <th>Miles</th>
                          <th>Rate</th>
                          <th>Net RPM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(historyRows.length ? historyRows : demoHistory).map((h, idx) => (
                          <tr key={`${h.date}-${idx}`}>
                            <td>{h.date}</td>
                            <td>{h.broker}</td>
                            <td>{h.miles}</td>
                            <td>${Number(h.rate || 0).toLocaleString()}</td>
                            <td>${Number(h.rpm || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lc-hint">(Next) This pulls from Supabase loads when lane_id is present.</div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Tools</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={exportCsv}>
                      Export CSV
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openCompare}>
                      Compare 2 lanes
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={saveAlertRule}>
                      Set alert
                    </button>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">Alert Rules (preview)</div>
                  <div className="lc-rule">
                    Notify if Net RPM drops below <b>$2.10</b> for this lane.
                  </div>
                  <div className="lc-rule">
                    Notify if rate is under <b>{money(Math.round(lane.miles * 2.45))}</b> for {lane.miles} miles.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profit" && (
              <div className="lc-grid profit">
                <div className="lc-card">
                  <div className="lc-card-title">Profitability</div>

                  <div className="lc-profit-row">
                    <div className="lc-profit-box">
                      <div className="lbl">Current Net RPM</div>
                      <div className="val">${netRpm.toFixed(2)}</div>
                      <div className={`lc-tag ${status.tone}`}>{status.label}</div>
                    </div>

                    <div className="lc-profit-box">
                      <div className="lbl">Target Net RPM</div>
                      <div className="val">${targetRpm.toFixed(2)}</div>
                      <div className="sub">Saved per lane</div>
                    </div>

                    <div className="lc-profit-box">
                      <div className="lbl">Rate Needed</div>
                      <div className="val">{money(rateNeeded)}</div>
                      <div className="sub">For {lane.miles} miles</div>
                    </div>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-mini-title">What to say (quick)</div>
                  <div className="lc-script">
                    “To make this lane work with the appointment and fuel, we’d need<b> {money(rateNeeded)}</b>. If you
                    can get close, we can move fast.”
                  </div>
                </div>

                <div className="lc-card">
                  <div className="lc-card-title">Decision</div>
                  <div className="lc-actions-row">
                    <button className="lc-mini-btn" type="button" onClick={openLoadCommand}>
                      Approve lane
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={openRateBump}>
                      Counter offer
                    </button>
                    <button className="lc-mini-btn" type="button" onClick={() => toastNow("Rejected (tracked locally).")}>
                      Reject lane
                    </button>
                  </div>

                  <div className="lc-divider" />

                  <div className="lc-hint">Approve navigates to Load Command with lane pre-filled.</div>
                </div>
              </div>
            )}
          </div>

          <div className="lc-footer">Tip: Press <b>Shift + N</b> to toggle Day/Night.</div>

          {/* Toast */}
          {toast && (
            <div
              style={{
                position: "absolute",
                left: 18,
                bottom: 14,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(12,16,24,0.75)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                fontSize: 12,
                fontWeight: 850,
                color: "rgba(255,255,255,0.92)",
                zIndex: 40,
                maxWidth: 360,
              }}
            >
              {toast.msg}
            </div>
          )}

          {/* Modal: Add note */}
          {modal?.type === "note" && (
            <Modal>
              <ModalHeader title="Add note" />
              <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12, fontWeight: 750 }}>
                This note will be saved for this lane {supabase && lane.id ? "(Supabase)" : "(local)"}.
              </div>
              <NoteForm onSubmit={addNote} onCancel={closeModal} busy={notesBusy} />
            </Modal>
          )}

          {/* Modal: rate bump */}
          {modal?.type === "rateBump" && (
            <Modal>
              <ModalHeader title="Request rate bump" />
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, opacity: 0.85 }}>
                Current rate: <b>{money(lane.rate)}</b> • Suggested bump: <b>{money(modal.bump)}</b> • New ask:{" "}
                <b>{money(modal.desiredRate)}</b>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85, marginBottom: 8 }}>Message to broker</div>
                <textarea
                  readOnly
                  value={modal.script}
                  style={{
                    width: "100%",
                    minHeight: 110,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.92)",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 750,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button className="lc-mini-btn" onClick={() => copyText(modal.script)} type="button">
                  Copy
                </button>
                <button className="lc-mini-btn" onClick={closeModal} type="button">
                  Done
                </button>
              </div>
            </Modal>
          )}

          {/* Modal: target rpm */}
          {modal?.type === "targetRpm" && (
            <Modal>
              <ModalHeader title="Set Target RPM" />
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, opacity: 0.85 }}>
                Current target for this lane: <b>${targetRpm.toFixed(2)}</b>
              </div>
              <TargetForm defaultValue={targetRpm} onSubmit={setTarget} onCancel={closeModal} />
            </Modal>
          )}

          {/* Modal: script */}
          {modal?.type === "script" && (
            <Modal>
              <ModalHeader title={modal.title || "Script"} />
              <div style={{ marginTop: 10 }}>
                <textarea
                  readOnly
                  value={modal.text || ""}
                  style={{
                    width: "100%",
                    minHeight: 120,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.92)",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 750,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button className="lc-mini-btn" onClick={() => copyText(modal.text || "")} type="button">
                  Copy
                </button>
                <button className="lc-mini-btn" onClick={closeModal} type="button">
                  Done
                </button>
              </div>
            </Modal>
          )}

          {/* Modal: Compare */}
          {modal?.type === "compare" && (
            <Modal>
              <ModalHeader title="Compare 2 lanes" />
              <CompareBody options={modal.options || []} aId={modal.aId} bId={modal.bId} />
              <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
                <button className="lc-mini-btn" onClick={closeModal} type="button">
                  Done
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Small subcomponents (in same file, no new deps) ----------
function NoteForm({ onSubmit, onCancel, busy }) {
  const [text, setText] = useState("");
  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note…"
        style={{
          width: "100%",
          minHeight: 100,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.92)",
          padding: 10,
          fontSize: 12,
          fontWeight: 750,
          outline: "none",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
        <button className="lc-mini-btn" onClick={onCancel} type="button" disabled={busy}>
          Cancel
        </button>
        <button className="lc-mini-btn" onClick={() => onSubmit(text)} type="button" disabled={busy}>
          {busy ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}

function TargetForm({ defaultValue, onSubmit, onCancel }) {
  const [val, setVal] = useState(String(defaultValue ?? 2.3));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Target Net RPM</label>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="2.30"
          inputMode="decimal"
          style={{
            height: 38,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 900,
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
        <button className="lc-mini-btn" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="lc-mini-btn" onClick={() => onSubmit(val)} type="button">
          Save target
        </button>
      </div>
    </div>
  );
}