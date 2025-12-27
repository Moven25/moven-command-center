import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import "./AppShell.css";
import Dashboard from "../pages/Dashboard";

async function fetchSheet(sheet) {
  const res = await fetch(`/.netlify/functions/fetch-sheets?sheet=${encodeURIComponent(sheet)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetch-sheets failed for "${sheet}": ${res.status} ${text}`);
  }
  const csv = await res.text();

  // very lightweight CSV parse (good enough for now)
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((row) => {
    const cols = row.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}

export default function AppShell() {
  // Command switching state (matches your UI)
  const [activeCommand, setActiveCommand] = useState("mission");

  // Data state (AUTO load)
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
      const [carriers, loads, brokers, compliance, factoring] = await Promise.all([
        fetchSheet("carriers"),
        fetchSheet("loads"),
        fetchSheet("brokers"),
        fetchSheet("compliance"),
        fetchSheet("factoring"),
      ]);

      setData({ carriers, loads, brokers, compliance, factoring });
      setSyncState({ loading: false, error: null, lastSyncAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      setSyncState((s) => ({
        ...s,
        loading: false,
        error: err.message || "Sync failed",
      }));
    }
  }, []);

  // AUTO load once at startup
  useEffect(() => {
    refreshAllSheets();
  }, [refreshAllSheets]);

  const onCommandChange = useCallback((key) => {
    setActiveCommand(key);
  }, []);

  const shellProps = useMemo(
    () => ({
      activeCommand,
      onCommandChange,
      movenData: data,
      movenSync: syncState,
      refreshAllSheets,
    }),
    [activeCommand, onCommandChange, data, syncState, refreshAllSheets]
  );

  return (
    <div className="shell">
      <Sidebar activeCommand={activeCommand} onCommandChange={onCommandChange} />

      <main className="shellMain">
        <Dashboard {...shellProps} />
      </main>
    </div>
  );
}

