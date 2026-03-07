// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Sidebar.css";

function commandKeyFromPath(pathname = "/") {
  const p = String(pathname || "/").toLowerCase();

  if (p === "/" || p.startsWith("/mission")) return "mission";
  if (p.startsWith("/lane")) return "lane";
  if (p.startsWith("/load")) return "load";
  if (p.startsWith("/carrier")) return "carrier";
  if (p.startsWith("/broker")) return "broker";
  if (p.startsWith("/finance")) return "finance";
  if (p.startsWith("/compliance")) return "compliance";
  if (p.startsWith("/intelligence")) return "intelligence";
  if (p.startsWith("/learning")) return "learning";

  // fallback (keeps styles stable)
  return "mission";
}

export default function Sidebar({ theme = "day", onToggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();

  const commandKey = useMemo(
    () => commandKeyFromPath(location.pathname),
    [location.pathname]
  );

  const [userEmail, setUserEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close user menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close user menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  // Load user email (safe if supabase missing)
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (!supabase?.auth?.getUser) return;
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error) {
          setUserEmail(null);
          return;
        }
        setUserEmail(data?.user?.email || null);
      } catch {
        if (mounted) setUserEmail(null);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const navClass = ({ isActive }) => `nav-item${isActive ? " active" : ""}`;

  const handleLogout = async () => {
    try {
      if (supabase?.auth?.signOut) await supabase.auth.signOut();
    } finally {
      setMenuOpen(false);
      navigate("/login", { replace: true });
    }
  };

  const safeToggleTheme = () => {
    if (typeof onToggleTheme === "function") onToggleTheme();
  };

  return (
    <aside className={`sidebar sidebar--${commandKey}`}>
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-row">
          <div className="brand-title">LANESYNC</div>

          <button
            className="theme-toggle no-nav-style"
            type="button"
            onClick={safeToggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "night" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="brand-sub">
          <span className="status-dot" />
          <span>Sync OS</span>
          <span className="mode-chip">
            {theme === "night" ? "Night" : "Day"}
          </span>
        </div>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">OPERATIONS</div>

          <NavLink to="/mission-control" className={navClass} end>
            Mission Control
          </NavLink>

          <NavLink to="/lane-command" className={navClass}>
            Lane Command
          </NavLink>

          <NavLink to="/load-command" className={navClass}>
            Load Command
          </NavLink>

          <NavLink to="/carrier-command" className={navClass}>
            Carrier Command
          </NavLink>

          <NavLink to="/broker-command" className={navClass}>
            Broker Command
          </NavLink>
        </div>

        <div className="divider" />

        <div className="nav-section">
          <div className="nav-section-title">MONEY &amp; RISK</div>

          <NavLink to="/finance-command" className={navClass}>
            Finance Command
          </NavLink>

          <NavLink to="/compliance-command" className={navClass}>
            Compliance Command
          </NavLink>
        </div>

        <div className="divider" />

        <div className="nav-section">
          <div className="nav-section-title">STRATEGY</div>

          <NavLink to="/intelligence-command" className={navClass}>
            Intelligence Command
          </NavLink>

          <NavLink to="/learning-command" className={navClass}>
            Learning Command
          </NavLink>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="status-pill">
          <span>Status</span>
          <span className="status-value">Healthy</span>
        </div>

        {/* USER PILL */}
        {userEmail ? (
          <div className="user-pill-container" ref={menuRef}>
            <button
              className="user-pill"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={userEmail}
            >
              <span className="user-dot" />
              <span className="user-email">
                {userEmail.length > 18 ? `${userEmail.substring(0, 18)}...` : userEmail}
              </span>
            </button>

            {menuOpen ? (
              <div className="user-dropdown" role="menu">
                <button type="button" onClick={handleLogout} role="menuitem">
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="user-pill-container" style={{ opacity: 0.7, fontSize: 12, fontWeight: 800 }}>
            Not signed in
          </div>
        )}

        <div className="hint">
          <span className="hint-kbd">Shift</span> + <span className="hint-kbd">N</span>
        </div>
      </div>
    </aside>
  );
}