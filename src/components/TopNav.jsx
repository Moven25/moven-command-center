// src/components/TopNav.jsx
import React from "react";

/**
 * TopNav is intentionally disabled.
 *
 * Reason:
 * - Legacy MOVEN branding
 * - Duplicate header behavior
 * - Caused empty tab squares
 *
 * We will re-enable this later when real
 * multi-tab workflows are implemented.
 */
export default function TopNav() {
  return null;
}
/* src/components/TopNav.css */

.mc-topnav {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
}

.mc-topnav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.mc-topnav-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  font-size: 13px;
  color: rgba(230,237,245,0.92);
  white-space: nowrap;
}

.mc-topnav-mark {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-subtle);
  background: radial-gradient(circle at 30% 30%, rgba(111,231,255,0.25), rgba(255,255,255,0.03));
  box-shadow: 0 0 0 1px rgba(111,231,255,0.10), 0 10px 25px rgba(0,0,0,0.35);
  color: var(--accent-ice);
  font-weight: 900;
}

/* Breadcrumb-ish line */
.mc-topnav-sub {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mc-topnav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Icon-style buttons */
.mc-topnav-btn {
  height: 34px;
  min-width: 34px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: rgba(255,255,255,0.03);
  color: rgba(230,237,245,0.90);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
}

.mc-topnav-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(111,231,255,0.22);
  background: rgba(111,231,255,0.08);
}

.mc-topnav-btn:active {
  transform: translateY(0px);
}

/* For a “primary” action like Popout */
.mc-topnav-btn.primary {
  border-color: rgba(111,231,255,0.35);
  background: rgba(111,231,255,0.10);
  box-shadow: 0 0 0 1px rgba(111,231,255,0.12);
}

/* small badge dot */
.mc-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--accent-ice);
  box-shadow: 0 0 0 3px rgba(111,231,255,0.12);
}
