import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AppShell.css";

function commandClassFromPath(pathname = "/") {
  const p = pathname.toLowerCase();
  if (p === "/" || p.includes("mission")) return "command-mission";
  if (p.includes("lane")) return "command-lane";
  if (p.includes("load")) return "command-load";
  if (p.includes("carrier")) return "command-carrier";
  if (p.includes("broker")) return "command-broker";
  if (p.includes("finance")) return "command-finance";
  return "command-mission";
}

/** Night Ops auto window: 6:30pm → 6:30am (local) */
function isAfterSunsetLocal() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= 1110 || mins < 390;
}

const LS_THEME = "lanesync_theme";
const LS_MANUAL_UNTIL = "lanesync_theme_manual_until";
const LS_SIDEBAR_PREF = "lanesync_sidebar_open"; // "1" | "0"

export default function AppShell({ children }) {
  const location = useLocation();

  const commandClass = useMemo(
    () => commandClassFromPath(location.pathname),
    [location.pathname]
  );

  const isMission = useMemo(() => {
    const p = (location.pathname || "/").toLowerCase();
    return p === "/" || p.includes("mission");
  }, [location.pathname]);

  /* ===============================
     SIDEBAR: default CLOSED on Mission Control
     =============================== */
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(LS_SIDEBAR_PREF);
    if (saved === "1") return true;
    if (saved === "0") return false;
    return isMission ? false : true;
  });

  // If there is NO saved preference yet, apply mission default on route changes
  useEffect(() => {
    const saved = localStorage.getItem(LS_SIDEBAR_PREF);
    if (saved == null) setSidebarOpen(isMission ? false : true);
  }, [isMission]);

  // Persist user choice
  useEffect(() => {
    localStorage.setItem(LS_SIDEBAR_PREF, sidebarOpen ? "1" : "0");
  }, [sidebarOpen]);

  /* ===============================
     THEME STATE (DAY / NIGHT OPS)
     =============================== */
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(LS_THEME);
    if (stored === "day" || stored === "night") return stored;
    return isAfterSunsetLocal() ? "night" : "day";
  });

  const isManualOverrideActive = () => {
    const raw = localStorage.getItem(LS_MANUAL_UNTIL);
    const until = raw ? Number(raw) : 0;
    return Number.isFinite(until) && Date.now() < until;
  };

  // Auto switch
  useEffect(() => {
    const tick = () => {
      if (isManualOverrideActive()) return;
      setTheme(isAfterSunsetLocal() ? "night" : "day");
    };
    tick();
    const id = setInterval(tick, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  // Manual toggle (button or hotkey)
  const manualToggleTheme = () => {
    const next = theme === "night" ? "day" : "night";
    setTheme(next);
    localStorage.setItem(
      LS_MANUAL_UNTIL,
      String(Date.now() + 12 * 60 * 60 * 1000)
    );
  };

  // Shift+N shortcut + ESC close sidebar
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        manualToggleTheme();
      }
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theme]);

  return (
    <div
      className={`app-shell ${commandClass} ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {/* Sidebar (overlay) */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar theme={theme} onToggleTheme={manualToggleTheme} />
      </aside>

      {/* Scrim (mobile) */}
      <button
        className={`sidebar-scrim ${sidebarOpen ? "on" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
        tabIndex={-1}
        type="button"
      />

      {/* Toggle button (ALWAYS top-left, never shifts) */}
      <button
        className="sidebar-fab"
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        type="button"
      >
        ☰
      </button>

      <main className="app-main">{children}</main>
    </div>
  );
}
