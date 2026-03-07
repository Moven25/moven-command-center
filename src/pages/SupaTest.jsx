import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupaTest() {
  const [status, setStatus] = useState("Testing connection...");
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
            : "No session yet (not logged in)"
        );
      } catch (e) {
        setStatus("❌ Supabase connection failed");
        setDetails(e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, background: "#fff", color: "#111" }}>
      <h2>Supabase Test</h2>
      <p>{status}</p>
      <p>{details}</p>
    </div>
  );
}