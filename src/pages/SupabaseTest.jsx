import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing...");
  const [details, setDetails] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setStatus("✅ Connected to Supabase");
        setDetails(
          data?.session
            ? "Session exists (logged in)"
            : "No session (not logged in yet)"
        );
      } catch (e) {
        setStatus("❌ Supabase connection failed");
        setDetails(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "#ffffff",
        color: "#111111",
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui, -apple-system",
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 12 }}>Supabase Test</h2>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
        {status}
      </div>
      {details ? (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{details}</pre>
      ) : null}
    </div>
  );
}