// src/pages/MissionControl.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MissionControl.css";
import { createClient } from "@supabase/supabase-js";

/**
 * Mission Control (v6 - Supabase FIRST, demo ONLY when Supabase missing/fails)
 *
 * ✅ Fixes “I only see mock info”
 * - UI starts EMPTY (not demo).
 * - Only shows demo when Supabase env missing OR queries fail.
 * - Tries multiple table name candidates + column fallbacks.
 *
 * ENV required (Vite):
 *   VITE_SUPABASE_URL=
 *   VITE_SUPABASE_ANON_KEY=
 *
 * Optional table overrides:
 *   VITE_LANES_TABLE=
 *   VITE_CARRIERS_TABLE=
 *   VITE_LOADS_TABLE=
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

// Optional table overrides
const LANES_TABLE = import.meta.env.VITE_LANES_TABLE || "lanes";
const CARRIERS_TABLE = import.meta.env.VITE_CARRIERS_TABLE || "carriers";
const LOADS_TABLE = import.meta.env.VITE_LOADS_TABLE || "loads";

// -------- utils --------
function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// Try selecting with an order; if order column doesn't exist, retry without order
async function safeSelect(table, { orderBy, ascending = false, limit, filters = [] } = {}) {
  let q = supabase.from(table).select("*");
  for (const f of filters) {
    if (!f?.op) continue;
    if (f.op === "eq") q = q.eq(f.col, f.val);
    if (f.op === "gte") q = q.gte(f.col, f.val);
    if (f.op === "lte") q = q.lte(f.col, f.val);
    if (f.op === "ilike") q = q.ilike(f.col, f.val);
  }
  if (orderBy) q = q.order(orderBy, { ascending });
  if (limit) q = q.limit(limit);

  let res = await q;

  // If order col missing, retry without order
  if (res.error && orderBy && String(res.error.message || "").toLowerCase().includes("column")) {
    let q2 = supabase.from(table).select("*");
    for (const f of filters) {
      if (!f?.op) continue;
      if (f.op === "eq") q2 = q2.eq(f.col, f.val);
      if (f.op === "gte") q2 = q2.gte(f.col, f.val);
      if (f.op === "lte") q2 = q2.lte(f.col, f.val);
      if (f.op === "ilike") q2 = q2.ilike(f.col, f.val);
    }
    if (limit) q2 = q2.limit(limit);
    res = await q2;
  }

  return res;
}

// If a table name isn’t correct, try a short candidate list
async function selectFromFirstWorkingTable(candidates, opts) {
  const tried = [];
  for (const t of candidates) {
    tried.push(t);
    const res = await safeSelect(t, opts);
    if (!res.error) return { table: t, data: res.data || [], error: null, tried };
  }
  const last = await safeSelect(tried[tried.length - 1], opts);
  return { table: tried[tried.length - 1], data: [], error: last.error || new Error("No working table"), tried };
}

function normalizeLane(row) {
  if (!row) return null;

  const from =
    row.from ??
    row.origin ??
    row.origin_city ??
    row.originCity ??
    row.pickup_city ??
    row.pickupCity ??
    "—";

  const to =
    row.to ??
    row.destination ??
    row.dest_city ??
    row.destCity ??
    row.delivery_city ??
    row.deliveryCity ??
    "—";

  const id = row.id ?? row.lane_id ?? row.laneId ?? row.uuid ?? row.code ?? row.name ?? "";
  const miles = num(row.miles ?? row.distance_miles ?? row.distanceMiles ?? row.distance, 0);
  const rate = num(row.rate ?? row.linehaul_rate ?? row.linehaulRate ?? row.total_rate ?? row.totalRate, 0);
  const netRpm = num(row.net_rpm ?? row.netRpm ?? row.net ?? row.net_rpm_calc, 0);

  return {
    id: String(id),
    label: row.label ?? row.lane_label ?? row.laneLabel ?? row.name ?? `${from} → ${to}`,
    from,
    to,
    miles,
    rate,
    netRpm,
  };
}

function normalizeCarrierRow(row) {
  if (!row) return null;

  const name =
    row.name ??
    row.carrier ??
    row.carrier_name ??
    row.company_name ??
    row.legal_name ??
    "—";

  const trucks = num(row.trucks ?? row.truck_count ?? row.units ?? row.num_trucks ?? row.fleet_size, 0);

  const avg = num(
    row.avg_net_rpm ??
      row.avgNetRpm ??
      row.net_rpm_avg ??
      row.netRpmAvg ??
      row.avg_rpm ??
      row.avgRpm ??
      row.net_rpm ??
      row.netRpm,
    0
  );

  const loadsPerWeek = num(row.loads_per_week ?? row.loadsPerWeek ?? row.loads_weekly ?? row.weekly_loads, 0);

  return {
    carrier: String(name),
    trucks: trucks ? String(trucks) : "—",
    rpm: avg ? `$${avg.toFixed(2)}` : "—",
    loads: loadsPerWeek ? String(loadsPerWeek) : "—",
    _avg: avg,
    _trucks: trucks,
  };
}

function normalizeLoadRow(row, lanesById) {
  if (!row) return null;

  const laneId = String(row.lane_id ?? row.laneId ?? row.lane ?? "");
  const laneObj = lanesById?.[laneId] || null;

  const from = row.from ?? row.origin ?? laneObj?.from ?? "";
  const to = row.to ?? row.destination ?? laneObj?.to ?? "";

  const laneLabel =
    row.lane_label ??
    row.laneLabel ??
    row.lane ??
    (from && to ? `${from} → ${to}` : laneObj?.label ?? "—");

  const miles = num(row.miles ?? row.distance_miles ?? row.distanceMiles, laneObj?.miles ?? 0);
  const net = num(row.net_rpm ?? row.netRpm ?? row.net ?? row.net_rpm_calc, laneObj?.netRpm ?? 0);

  const statusRaw = String(row.status ?? row.load_status ?? "").toLowerCase();
  const status = statusRaw.includes("cancel") ? "Risk" : net >= 2.1 ? "Ok" : "Risk";

  const when =
    row.pickup_at ??
    row.pickupAt ??
    row.pickup_date ??
    row.created_at ??
    row.createdAt ??
    row.inserted_at ??
    null;

  return {
    date: fmtDateShort(when),
    laneId: laneId || (laneObj?.id ?? ""),
    lane: laneLabel,
    miles: String(miles || "—"),
    rpm: net ? `$${net.toFixed(2)}` : "—",
    status,
    _when: when,
  };
}

export default function MissionControl() {
  const navigate = useNavigate();

  // Top-right menu
  const [menuOpen, setMenuOpen] = useState(false);
  // Lane History menu
  const [laneHistoryMenuOpen, setLaneHistoryMenuOpen] = useState(false);
  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings keys
  const LS_MC_COMPACT = "lanesync_mc_compact_ui_v1";
  const LS_MC_TIPS = "lanesync_mc_show_tips_v1";
  const LS_MC_MOBILE_COMPACT = "lanesync_mc_mobile_compact_v1";

  // Settings state
  const [showTips, setShowTips] = useState(() => {
    const v = localStorage.getItem(LS_MC_TIPS);
    if (v === null) return true;
    return v === "true";
  });

  const [compactUi, setCompactUi] = useState(() => {
    const v = localStorage.getItem(LS_MC_COMPACT);
    if (v === null) return false;
    return v === "true";
  });

  const [mobileCompact, setMobileCompact] = useState(() => {
    const v = localStorage.getItem(LS_MC_MOBILE_COMPACT);
    if (v === null) return true;
    return v === "true";
  });

  // Apply + persist compact UI
  useEffect(() => {
    document.body.classList.toggle("compact-ui", !!compactUi);
    try {
      localStorage.setItem(LS_MC_COMPACT, String(!!compactUi));
    } catch {}
  }, [compactUi]);

  // Persist tips
  useEffect(() => {
    try {
      localStorage.setItem(LS_MC_TIPS, String(!!showTips));
    } catch {}
  }, [showTips]);

  // Apply + persist mobile compact
  useEffect(() => {
    document.body.classList.toggle("mobile-compact", !!mobileCompact);
    try {
      localStorage.setItem(LS_MC_MOBILE_COMPACT, String(!!mobileCompact));
    } catch {}
  }, [mobileCompact]);

  // -----------------------------
  // Demo fallback data (ONLY if Supabase missing/fails)
  // -----------------------------
  const demoLanes = useMemo(
    () => [
      { id: "chi-dal", label: "Chicago, IL → Dallas, TX", from: "Chicago, IL", to: "Dallas, TX", miles: 920, rate: 2600, netRpm: 2.17 },
      { id: "dal-mem", label: "Dallas, TX → Memphis, TN", from: "Dallas, TX", to: "Memphis, TN", miles: 452, rate: 1050, netRpm: 1.88 },
      { id: "chi-atl", label: "Chicago, IL → Atlanta, GA", from: "Chicago, IL", to: "Atlanta, GA", miles: 720, rate: 1760, netRpm: 2.45 },
      { id: "atl-nsh", label: "Atlanta, GA → Nashville, TN", from: "Atlanta, GA", to: "Nashville, TN", miles: 250, rate: 700, netRpm: 2.55 },
    ],
    []
  );

  const demoCarrierRows = useMemo(
    () => [
      { carrier: "Swift Transport", trucks: "5", rpm: "$2.42", loads: "3.0", _avg: 2.42, _trucks: 5 },
      { carrier: "Reliable Freight", trucks: "7", rpm: "$1.95", loads: "2.1", _avg: 1.95, _trucks: 7 },
    ],
    []
  );

  // -----------------------------
  // Supabase-backed data (START EMPTY)
  // -----------------------------
  const [lanes, setLanes] = useState([]);
  const [lanesLoading, setLanesLoading] = useState(true);
  const [dataErr, setDataErr] = useState("");

  const [selectedLaneId, setSelectedLaneId] = useState("");

  const selectedLane = useMemo(
    () => lanes.find((l) => String(l.id) === String(selectedLaneId)) || lanes[0] || null,
    [lanes, selectedLaneId]
  );

  const lanesById = useMemo(() => {
    const m = {};
    for (const l of lanes) m[String(l.id)] = l;
    return m;
  }, [lanes]);

  // Broker panel (still demo)
  const broker = useMemo(
    () => ({
      broker: "ABC Logistics",
      mc: "567432",
      notesShort: "Needs quick confirmation.",
      notesList: ["Confirm delivery appointment window", "Verify fuel surcharge inclusion", "Check detention policy before tender"],
    }),
    []
  );

  const [carrierRows, setCarrierRows] = useState([]);
  const [recentLoads, setRecentLoads] = useState([]);
  const [weeklyGross, setWeeklyGross] = useState(0);
  const [avgNetRpmFromLoads, setAvgNetRpmFromLoads] = useState(0);

  const [laneHistoryRows, setLaneHistoryRows] = useState([]);
  const [laneHistoryLoading, setLaneHistoryLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    setDataErr("");
    setLanesLoading(true);

    // Supabase env missing -> demo mode is allowed
    if (!supabase) {
      setLanes(demoLanes);
      setSelectedLaneId(String(demoLanes[0]?.id || ""));
      setCarrierRows(demoCarrierRows);
      setRecentLoads([
        { date: "01/05", laneId: "chi-atl", lane: "Chicago, IL → Atlanta, GA", miles: "720", rpm: "$2.45", status: "Ok" },
        { date: "01/04", laneId: "dal-mem", lane: "Dallas, TX → Memphis, TN", miles: "452", rpm: "$1.88", status: "Risk" },
      ]);
      setWeeklyGross(8760);
      setAvgNetRpmFromLoads(2.17);
      setDataErr("Supabase env missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Showing demo data.");
      setLanesLoading(false);
      return;
    }

    try {
      // ---- lanes
      const lanesCandidates = [LANES_TABLE, "lane", "lane_intel", "lane_intelligence"];
      const lanesRes = await selectFromFirstWorkingTable(lanesCandidates, { orderBy: "created_at", ascending: false });
      if (lanesRes.error) throw lanesRes.error;

      const normalizedLanes = (lanesRes.data || []).map(normalizeLane).filter(Boolean);
      setLanes(normalizedLanes);
      setSelectedLaneId((prev) => {
        const next = prev || String(normalizedLanes[0]?.id || "");
        const ok = normalizedLanes.some((l) => String(l.id) === String(next));
        return ok ? next : String(normalizedLanes[0]?.id || "");
      });

      const lanesMap = normalizedLanes.reduce((acc, l) => {
        acc[String(l.id)] = l;
        return acc;
      }, {});

      // ---- carriers
      const carriersCandidates = [CARRIERS_TABLE, "carrier", "carrier_profiles", "dispatch_carriers"];
      const carriersRes = await selectFromFirstWorkingTable(carriersCandidates, {
        orderBy: "created_at",
        ascending: false,
        limit: 50,
      });
      if (carriersRes.error) throw carriersRes.error;

      const normalizedCarriers = (carriersRes.data || [])
        .map(normalizeCarrierRow)
        .filter(Boolean)
        .sort((a, b) => (b._avg || 0) - (a._avg || 0));
      setCarrierRows(normalizedCarriers);

      // ---- loads
      const loadsCandidates = [LOADS_TABLE, "load", "loads"];
      const loadsRes = await selectFromFirstWorkingTable(loadsCandidates, { orderBy: "created_at", ascending: false, limit: 30 });
      if (loadsRes.error) throw loadsRes.error;

      const rawLoads = loadsRes.data || [];
      const mappedLoads = rawLoads.map((r) => normalizeLoadRow(r, lanesMap)).filter(Boolean);
      setRecentLoads(mappedLoads.slice(0, 8));

      const gross = rawLoads.reduce((sum, r) => {
        const rate = r.rate ?? r.total_rate ?? r.totalRate ?? r.linehaul_rate ?? r.linehaulRate ?? 0;
        return sum + num(rate, 0);
      }, 0);
      setWeeklyGross(gross);

      const rpmValues = rawLoads
        .map((r) => num(r.net_rpm ?? r.netRpm ?? r.net ?? r.net_rpm_calc, 0))
        .filter((v) => v > 0);
      const avgRpm = rpmValues.length ? rpmValues.reduce((sum, v) => sum + v, 0) / rpmValues.length : 0;
      setAvgNetRpmFromLoads(avgRpm);
    } catch (e) {
      // Supabase is configured: do NOT show demo fallback on errors
      setDataErr(e?.message || "Could not load from Supabase. (No demo fallback while Supabase is configured.)");
      setLanes([]);
      setSelectedLaneId("");
      setCarrierRows([]);
      setRecentLoads([]);
      setWeeklyGross(0);
      setAvgNetRpmFromLoads(0);
    } finally {
      setLanesLoading(false);
    }
  }, [demoLanes, demoCarrierRows]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Lane history for selected lane (from loads)
  useEffect(() => {
    const run = async () => {
      setLaneHistoryLoading(true);
      setLaneHistoryRows([]);

      if (!supabase || !selectedLane?.id) {
        const l = selectedLane || demoLanes[0];
        if (!l) {
          setLaneHistoryLoading(false);
          return;
        }
        const net = num(l?.netRpm, 2.17);
        const miles = num(l?.miles, 0);
        const rate = num(l?.rate, 0);
        setLaneHistoryRows([
          { date: "01/06", netRpm: Math.max(1, net + 0.18), miles, rate, broker: "ABC Logistics" },
          { date: "12/28", netRpm: Math.max(1, net + 0.03), miles, rate: Math.round(rate * 0.95), broker: "RoadStar" },
          { date: "12/16", netRpm: Math.max(1, net - 0.07), miles, rate: Math.round(rate * 0.92), broker: "BlueHaul" },
        ]);
        setLaneHistoryLoading(false);
        return;
      }

      try {
        const loadsCandidates = [LOADS_TABLE, "load", "loads"];
        const laneIdStr = String(selectedLane.id);

        const laneCols = ["lane_id", "laneId", "lane"];
        let rows = [];

        for (const col of laneCols) {
          const res = await selectFromFirstWorkingTable(loadsCandidates, {
            orderBy: "created_at",
            ascending: false,
            limit: 30,
            filters: [{ op: "eq", col, val: laneIdStr }],
          });
          if (!res.error && (res.data || []).length) {
            rows = res.data || [];
            break;
          }
        }

        const out = (rows || [])
          .map((r) => ({
            date: fmtDateShort(r.pickup_at ?? r.pickupAt ?? r.pickup_date ?? r.created_at ?? r.createdAt ?? r.inserted_at ?? null),
            netRpm: num(r.net_rpm ?? r.netRpm ?? r.net, num(selectedLane.netRpm, 2.17)),
            miles: num(r.miles ?? r.distance_miles ?? r.distanceMiles, num(selectedLane.miles, 0)),
            rate: num(r.rate ?? r.linehaul_rate ?? r.total_rate ?? r.totalRate, num(selectedLane.rate, 0)),
            broker: r.broker_name ?? r.broker ?? r.brokerCompany ?? "—",
          }))
          .slice(0, 6);

        if (out.length) setLaneHistoryRows(out);
      } catch {
        // no hard fail
      } finally {
        setLaneHistoryLoading(false);
      }
    };

    run();
  }, [selectedLaneId, selectedLane, demoLanes]);

  // -----------------------------
  // KPI values
  // -----------------------------
  const avgNetRpm = useMemo(() => {
    if (num(avgNetRpmFromLoads, 0) > 0) return num(avgNetRpmFromLoads, 0);

    if (!supabase) {
      const carrierAvgs = carrierRows.map((c) => num(c._avg, 0)).filter((x) => x > 0);
      if (carrierAvgs.length) return carrierAvgs.reduce((a, b) => a + b, 0) / carrierAvgs.length;

      const laneAvgs = lanes.map((l) => num(l.netRpm, 0)).filter((x) => x > 0);
      if (laneAvgs.length) return laneAvgs.reduce((a, b) => a + b, 0) / laneAvgs.length;
    }

    return 0;
  }, [avgNetRpmFromLoads, carrierRows, lanes]);

  const activeTrucks = useMemo(() => {
    const total = carrierRows.reduce((sum, r) => sum + num(r._trucks, 0), 0);
    return total || 0;
  }, [carrierRows]);

  const loadsBookedThisWeek = useMemo(() => {
    const n = recentLoads?.length || 0;
    return String(n || 0);
  }, [recentLoads]);

  const trucksBelowTarget = useMemo(() => {
    const below = carrierRows
      .filter((r) => num(r._avg, 999) < 2.1)
      .reduce((sum, r) => sum + num(r._trucks, 0), 0);
    return String(below || 0);
  }, [carrierRows]);

  const kpis = useMemo(
    () => [
      { id: "lanes", label: "Active Lanes", value: String(lanes?.length || 0), sub: "", actionable: true },
      { id: "trucks", label: "Active Trucks", value: String(activeTrucks || 0), sub: "Healthy", actionable: true },
      { id: "booked", label: "Loads Booked", value: String(loadsBookedThisWeek || 0), sub: "This Week", actionable: true },
      { id: "below", label: "Trucks Below Target", value: trucksBelowTarget, sub: "", actionable: true },
      { id: "avg", label: "Avg Net RPM", value: `$${avgNetRpm.toFixed(2)}`, sub: "This Week", actionable: true },
    ],
    [lanes?.length, activeTrucks, loadsBookedThisWeek, trucksBelowTarget, avgNetRpm]
  );

  const buildLaneQuery = (laneObj, extra = {}) => {
    const params = new URLSearchParams({
      from: laneObj.from,
      to: laneObj.to,
      miles: String(laneObj.miles),
      rate: String(laneObj.rate),
      net: String(laneObj.netRpm),
      laneId: String(laneObj.id),
      ...extra,
    });
    return params.toString();
  };

  const rememberLane = (laneObj) => {
    try {
      sessionStorage.setItem("lanesync_selected_lane", JSON.stringify(laneObj));
    } catch {}
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setLaneHistoryMenuOpen(false);
  };

  const anyOverlayOpen = menuOpen || laneHistoryMenuOpen || settingsOpen;

  const stopMenuEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // KPI routing
  const handleKpiClick = (kpiId) => {
    if (anyOverlayOpen) return;

    if (kpiId === "lanes") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane)}`);
      } else {
        navigate("/lane-command");
      }
      return;
    }

    if (kpiId === "trucks") return navigate("/carrier-command");
    if (kpiId === "booked") return navigate("/load-command");
    if (kpiId === "below") return navigate("/carrier-command?filter=below-target");

    if (kpiId === "avg") {
      if (selectedLane) {
        rememberLane(selectedLane);
        navigate(`/lane-command?${buildLaneQuery(selectedLane, { focus: "net" })}`);
      } else {
        navigate("/lane-command");
      }
    }
  };

  const openCarrierFromPerformance = (carrierName) => {
    if (anyOverlayOpen) return;
    const params = new URLSearchParams({ carrier: carrierName, from: "mission-control" });
    navigate(`/carrier-command?${params.toString()}`);
  };

  // Close menus/modals on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeAllMenus();
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close top-right menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutside = (e) => {
      if (!e.target.closest(".top-actions")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [menuOpen]);

  // Close Lane History menu on outside click
  useEffect(() => {
    if (!laneHistoryMenuOpen) return;
    const closeOnOutside = (e) => {
      if (!e.target.closest(".lane-history-actions")) setLaneHistoryMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [laneHistoryMenuOpen]);

  const statusLabel =
    (selectedLane?.netRpm ?? 0) >= 2.35 ? "HEALTHY" : (selectedLane?.netRpm ?? 0) >= 2.1 ? "BORDERLINE" : "RISK";

  const openLaneCommandHere = () => {
    if (!selectedLane || anyOverlayOpen) return;
    rememberLane(selectedLane);
    navigate(`/lane-command?${buildLaneQuery(selectedLane)}`);
  };

  const popOutLaneCommand = (extra = {}) => {
    if (!selectedLane) return;
    rememberLane(selectedLane);
    window.open(`/lane-command?${buildLaneQuery(selectedLane, extra)}`, "_blank", "noopener,noreferrer");
  };

  const popOutMissionControl = () => {
    window.open(`/mission-control`, "_blank", "noopener,noreferrer");
  };

  const exportLaneHistoryCSV = () => {
    if (!selectedLane) return;

    const header = ["Lane", "Date", "Broker", "Miles", "Rate", "Net RPM"];
    const laneLabel = `${selectedLane.from} -> ${selectedLane.to}`;

    const csvLines = [
      header.join(","),
      ...(laneHistoryRows || []).map((r) =>
        [`"${laneLabel}"`, `"${r.date}"`, `"${r.broker}"`, r.miles, r.rate, Number(r.netRpm || 0).toFixed(2)].join(",")
      ),
    ];

    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `lane-history_${String(selectedLane.id)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openLaneCommandHistoryHere = () => {
    if (!selectedLane || anyOverlayOpen) return;
    rememberLane(selectedLane);
    navigate(`/lane-command?${buildLaneQuery(selectedLane, { tab: "history" })}`);
  };

  const openFromRecentLoad = (laneId) => {
    if (anyOverlayOpen) return;
    const laneObj = lanes.find((l) => String(l.id) === String(laneId));
    if (!laneObj) return;
    setSelectedLaneId(String(laneObj.id));
    rememberLane(laneObj);
    navigate(`/lane-command?${buildLaneQuery(laneObj)}`);
  };

  const resetMissionPrefs = () => {
    try {
      localStorage.removeItem(LS_MC_COMPACT);
      localStorage.removeItem(LS_MC_TIPS);
      localStorage.removeItem(LS_MC_MOBILE_COMPACT);
      localStorage.removeItem("lanesync_sidebar_open");
    } catch {}
    window.location.reload();
  };

  return (
    <div className="mission-page">
      <div className="mission-canvas">
        <div className="mission-panel">
          {/* TOP STRIP */}
          <div className="mission-topstrip">
            <div className="top-pill">Week of Jan 6</div>
            <div className="top-pill">Active Trucks: {activeTrucks || 0}</div>
            <div className="top-pill">Weekly Gross: ${Math.round(weeklyGross || 0).toLocaleString()}</div>

            <div className="top-actions">
              <button className="icon-btn" title="Refresh" type="button" onClick={refreshAll}>
                ↻
              </button>

              <button className="icon-btn" title="Pop Out" type="button" onClick={popOutMissionControl}>
                ↗
              </button>

              <button
                className="icon-btn"
                title="More"
                type="button"
                onMouseDown={stopMenuEvent}
                onClick={(e) => {
                  stopMenuEvent(e);
                  setLaneHistoryMenuOpen(false);
                  setMenuOpen((v) => !v);
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                ⋯
              </button>

              <div
                className={`popout-menu ${menuOpen ? "open" : ""}`}
                role="menu"
                onMouseDown={stopMenuEvent}
                onClick={stopMenuEvent}
              >
                <div className="popout-menu-title">Options</div>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    popOutMissionControl();
                    closeAllMenus();
                  }}
                >
                  🪟 Pop out Mission Control
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    closeAllMenus();
                    setSettingsOpen(true);
                  }}
                >
                  ⚙️ Settings
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    setCompactUi((v) => !v);
                    closeAllMenus();
                  }}
                >
                  📐 Toggle compact layout
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    popOutLaneCommand();
                    closeAllMenus();
                  }}
                >
                  🧭 Pop out Lane Command (selected lane)
                </button>

                <button
                  className="popout-menu-item"
                  role="menuitem"
                  type="button"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    closeAllMenus();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {dataErr ? (
            <div style={{ padding: "0 18px 10px", opacity: 0.9, fontSize: 12, fontWeight: 800, color: "#ffb86b" }}>
              {dataErr}
            </div>
          ) : null}

          {/* HEADER */}
          <div className="mission-header">
            <div className="brand-stack">
              <div className="brand-big">LANESYNC</div>
              <div className="brand-small">Sync OS</div>
            </div>

            <div className="mission-title">Mission Control</div>
            <div className="mission-header-right" />
          </div>

          {/* KPI ROW */}
          <div className="kpi-row">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className={["kpi-card", kpi.actionable ? "actionable" : ""].join(" ")}
                onClick={(e) => {
                  if (anyOverlayOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (kpi.actionable) handleKpiClick(kpi.id);
                }}
                role={kpi.actionable ? "button" : undefined}
                tabIndex={kpi.actionable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!kpi.actionable) return;
                  if (anyOverlayOpen) return;
                  if (e.key === "Enter" || e.key === " ") handleKpiClick(kpi.id);
                }}
                title={`Open ${kpi.label}`}
              >
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                {kpi.sub ? <div className="kpi-sub">{kpi.sub}</div> : <div className="kpi-sub kpi-sub-empty">.</div>}
              </div>
            ))}
          </div>

          <div className="soft-sep" />

          {/* LANE STRIP */}
          <div className="lane-strip">
            <div className="lane-strip-title">Lane Command</div>

            <div className="lane-chip wide">
              <div className="chip-label">Lane</div>

              <div className="chip-value" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  value={selectedLaneId}
                  onChange={(e) => setSelectedLaneId(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    outline: "none",
                  }}
                  aria-label="Select lane"
                  disabled={lanesLoading}
                >
                  {(lanes || []).map((l) => (
                    <option key={String(l.id)} value={String(l.id)} style={{ color: "#0b1020" }}>
                      {l.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={openLaneCommandHere}
                  style={{
                    height: 34,
                    padding: "0 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 850,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    opacity: anyOverlayOpen ? 0.6 : 1,
                  }}
                  title="Open Lane Command"
                  disabled={anyOverlayOpen || !selectedLane}
                >
                  Open
                </button>
              </div>
            </div>

            <div className="lane-chip">
              <div className="chip-label">Miles</div>
              <div className="chip-value">{selectedLane?.miles ?? "—"}</div>
            </div>

            <div className="lane-chip">
              <div className="chip-label">Rate</div>
              <div className="chip-value">${selectedLane?.rate?.toLocaleString?.() ?? selectedLane?.rate ?? "—"}</div>
            </div>

            <button className="popout-btn" type="button" onClick={() => popOutLaneCommand()} disabled={!selectedLane}>
              Pop Out
            </button>
          </div>

          <div className="soft-sep" />

          {/* MAIN GRID */}
          <div className="mission-grid">
            {/* Broker */}
            <div className="panel-card">
              <div className="panel-title">Broker</div>

              <div className="kv">
                <div className="k">Broker:</div>
                <div className="v">{broker.broker}</div>

                <div className="k">MC#:</div>
                <div className="v">{broker.mc}</div>

                <div className="k">Notes:</div>
                <div className="v">{broker.notesShort}</div>
              </div>

              <div className="panel-title sub">Notes</div>
              <ul className="notes-list">
                {broker.notesList.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>

            {/* NET RPM */}
            <div className="panel-card netrpm-card">
              <div className="netrpm-label">NET RPM</div>
              <div className="netrpm-value">${(selectedLane?.netRpm ?? 0).toFixed(2)}</div>

              <div className="netrpm-status">
                <div className="status-label">STATUS</div>
                <div className="status-pill">{statusLabel}</div>
              </div>
            </div>

            {/* Lane History */}
            <div className="panel-card">
              <div className="panel-title row lane-history-actions">
                <span>Lane History</span>

                <button
                  className="mini-icon"
                  type="button"
                  title="Lane history options"
                  onMouseDown={stopMenuEvent}
                  onClick={(e) => {
                    stopMenuEvent(e);
                    setMenuOpen(false);
                    setLaneHistoryMenuOpen((v) => !v);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={laneHistoryMenuOpen}
                >
                  ⋯
                </button>

                <div
                  className={`lh-menu ${laneHistoryMenuOpen ? "open" : ""}`}
                  role="menu"
                  onMouseDown={stopMenuEvent}
                  onClick={stopMenuEvent}
                >
                  <div className="lh-menu-title">Lane History</div>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      exportLaneHistoryCSV();
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    ⬇️ Export CSV
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      openLaneCommandHistoryHere();
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    📜 Open in Lane Command (History)
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      popOutLaneCommand({ tab: "history" });
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    🪟 Pop out Lane Command (History)
                  </button>

                  <button
                    className="lh-menu-item"
                    role="menuitem"
                    type="button"
                    onMouseDown={stopMenuEvent}
                    onClick={(e) => {
                      stopMenuEvent(e);
                      setLaneHistoryMenuOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="history-sub">
                Last Rates:{laneHistoryLoading ? <span style={{ marginLeft: 8, opacity: 0.7 }}>(Loading…)</span> : null}
              </div>

              <div className="history-list">
                {(laneHistoryRows || []).slice(0, 6).map((r) => (
                  <div key={r.date + String(r.netRpm)} className="history-item">
                    ${Number(r.netRpm || 0).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-sep" />

          {/* BOTTOM ROW */}
          <div className="bottom-row">
            {/* Carrier Performance */}
            <div className="panel-card table-card">
              <div className="panel-title">Carrier Performance</div>

              <div className="table-wrap">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>Trucks</th>
                      <th>Avg Net RPM</th>
                      <th>Loads / Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(carrierRows || []).map((r) => (
                      <tr
                        key={r.carrier}
                        onClick={(e) => {
                          if (anyOverlayOpen) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          openCarrierFromPerformance(r.carrier);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (anyOverlayOpen) return;
                          if (e.key === "Enter" || e.key === " ") openCarrierFromPerformance(r.carrier);
                        }}
                        style={{ cursor: "pointer" }}
                        title={`Open Carrier Command for ${r.carrier}`}
                      >
                        <td style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{r.carrier}</td>
                        <td>{r.trucks}</td>
                        <td>{r.rpm}</td>
                        <td>{r.loads}</td>
                      </tr>
                    ))}
                    {(!carrierRows || carrierRows.length === 0) ? (
                      <tr>
                        <td colSpan={4} style={{ opacity: 0.7, padding: 12 }}>
                          No carriers found yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {showTips ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Tip: Click a carrier row to open Carrier Command.</div> : null}
            </div>

            {/* Recent Loads */}
            <div className="panel-card table-card">
              <div className="panel-title">Recent Loads</div>

              <div className="table-wrap">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lane</th>
                      <th>Miles</th>
                      <th>Net RPM</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentLoads || []).map((r) => (
                      <tr
                        key={`${r.date}-${r.lane}-${r.laneId}`}
                        onClick={(e) => {
                          if (anyOverlayOpen) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (r.laneId) openFromRecentLoad(r.laneId);
                        }}
                        style={{ cursor: r.laneId ? "pointer" : "default" }}
                        title={r.laneId ? "Open Lane Command for this lane" : ""}
                      >
                        <td>{r.date}</td>
                        <td style={{ textDecoration: r.laneId ? "underline" : "none", textUnderlineOffset: "3px" }}>{r.lane}</td>
                        <td>{r.miles}</td>
                        <td>{r.rpm}</td>
                        <td>
                          <span className={`tag ${r.status === "Risk" ? "risk" : "ok"}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                    {(!recentLoads || recentLoads.length === 0) ? (
                      <tr>
                        <td colSpan={5} style={{ opacity: 0.7, padding: 12 }}>
                          No loads found yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {showTips ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Tip: Click a row to open Lane Command for that lane.</div> : null}
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {settingsOpen ? (
        <div className="mc-overlay" role="dialog" aria-modal="true" onClick={() => setSettingsOpen(false)}>
          <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modalHeader">
              <div>
                <div className="mc-modalTitle">Settings</div>
                <div className="mc-modalSub">Mission Control preferences</div>
              </div>
              <button className="mc-close" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close">
                ✕
              </button>
            </div>

            <div className="mc-modalBody">
              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Show tips</div>
                  <div className="mc-settingHelp">Shows the “Tip:” lines under tables and cards.</div>
                </div>
                <label className="mc-toggle" title="Toggle tips">
                  <input type="checkbox" checked={showTips} onChange={(e) => setShowTips(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Compact layout</div>
                  <div className="mc-settingHelp">Tightens spacing using the existing compact-ui class.</div>
                </div>
                <label className="mc-toggle" title="Toggle compact layout">
                  <input type="checkbox" checked={compactUi} onChange={(e) => setCompactUi(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Mobile compact mode</div>
                  <div className="mc-settingHelp">Tightens spacing on phones/tablets (used by CSS media queries).</div>
                </div>
                <label className="mc-toggle" title="Toggle mobile compact">
                  <input type="checkbox" checked={mobileCompact} onChange={(e) => setMobileCompact(e.target.checked)} />
                  <span />
                </label>
              </div>

              <div className="mc-settingRow">
                <div>
                  <div className="mc-settingLabel">Reset preferences</div>
                  <div className="mc-settingHelp">Clears saved UI settings (compact, tips, mobile compact, sidebar preference).</div>
                </div>
                <button className="mc-btn" type="button" onClick={resetMissionPrefs}>
                  Reset
                </button>
              </div>
            </div>

            <div className="mc-modalFooter">
              <button className="mc-btn" type="button" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
              <button className="mc-btn mc-btn--primary" type="button" onClick={() => setSettingsOpen(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}