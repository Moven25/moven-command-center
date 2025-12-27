import React, { useCallback, useEffect, useState } from "react";
import Dashboard from "../pages/Dashboard";
import "./AppShell.css";

/**
 * AppShell = global wrapper
 * - Owns activeCommand state
 * - Loads data (AUTO)
 * - Provides refreshAllSheets + addCarrierLocal
 */
async function fetchSheet(sheet) {
  const res = await fetch(`/.netlify/functions/fetch-sheets?sheet=${encodeURIComponent(sheet)}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetch-sheets failed for "${sheet}": ${res.status} ${text || ""}`.trim());
  }

  // handler should return CSV or JSON – we support both
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    // support { rows: [...] } or [...]
    return Array.isArray(json) ? json : Array.isArray(json.rows) ? json.rows : [];
  }

  // CSV fallback – minimal parser
  const csv = await res.text();
  return parseCSV(csv);
}

function parseCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? "").trim();
    });
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

export default function AppShell() {
  // command switching state (sidebar/top)
  const [activeCommand, setActiveCommand] = useState("mission");

  // data state (AUTO load)
  const [data, setData] = useState({
    carriers: [],
    loads: [],
    brokers: [],
    compliance: [],
    factoring: [],
  });

  const [syncState, setSyncState] = useState({
    loading: false,
    error: null,
    lastSyncAt: null,
  });

  // Option A: add carrier locally (no backend yet)
  const addCarrierLocal = (newCarrier) => {
    setData((prev) => ({
      ...prev,
      carriers: [newCarrier, ...(prev.carriers || [])],
    }));
  };

  const refreshAllSheets = useCallback(async () => {
    setSyncState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Load in parallel
      const [carriers, loads, brokers, compliance, factoring] = await Promise.all([
        fetchSheet("carriers"),
        fetchSheet("loads"),
        fetchSheet("brokers"),
        fetchSheet("compliance"),
        fetchSheet("factoring"),
      ]);

      setData({ carriers, loads, brokers, compliance, factoring });
      setSyncState({
        loading: false,
        error: null,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      setSyncState((s) => ({
        ...s,
        loading: false,
        error: err?.message || "Sync failed",
      }));
    }
  }, []);

  // AUTO load once
  useEffect(() => {
    refreshAllSheets();
  }, [refreshAllSheets]);

  return (
    <div className="appShell">
      <Dashboard
        activeCommand={activeCommand}
        onCommandChange={setActiveCommand}
        movenData={data}
        movenSync={syncState}
        refreshAllSheets={refreshAllSheets}
        addCarrierLocal={addCarrierLocal}
      />
    </div>
  );
}
