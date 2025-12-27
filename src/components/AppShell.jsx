import React, { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import "./AppShell.css";

// Small CSV parser (no libraries)
function parseCSV(csvText = "") {
  const text = (csvText || "").trim();
  if (!text) return [];

  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (c === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += c;
  }

  // last cell
  row.push(cell);
  rows.push(row);

  const headers = (rows.shift() || []).map((h) => (h || "").trim());
  return rows
    .filter((r) => r.some((v) => (v || "").trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h || `col_${idx}`] = (r[idx] ?? "").trim();
      });
      return obj;
    });
}

async function fetchSheet(sheetName) {
  const res = await fetch(`/.netlify/functions/fetch-sheets?sheet=${encodeURIComponent(sheetName)}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`fetch-sheets failed for "${sheetName}": ${res.status} ${msg}`);
  }
  const csv = await res.text();
  return parseCSV(csv);
}

export default function AppShell({ children }) {
  // command switching state (already working)
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

  const refreshAllSheets = useCallback(async () => {
    setSyncState((s) => ({ ...s, loading: true, error: null }));
    try {
     // TEMP: carriers only (until other sheets are wired)
const carriers = await fetchSheet("carriers");

setData({
  carriers,
  loads: [],
  brokers: [],
  compliance: [],
  factoring: [],
});

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

  // ✅ AUTO: load once on first mount
  useEffect(() => {
    refreshAllSheets();
  }, [refreshAllSheets]);

  const injectedProps = useMemo(
    () => ({
      activeCommand,
      onCommandChange: setActiveCommand,
      movenData: data,
      movenSync: syncState,
      refreshAllSheets,
    }),
    [activeCommand, data, syncState, refreshAllSheets]
  );

  return (
    <div className="app-shell">
      <Sidebar activeCommand={activeCommand} onCommandChange={setActiveCommand} />

      <main className="app-main">
        {React.isValidElement(children)
          ? React.cloneElement(children, injectedProps)
          : children}
      </main>
    </div>
  );
}
