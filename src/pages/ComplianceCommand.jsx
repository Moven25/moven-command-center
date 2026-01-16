// src/pages/ComplianceCommand.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CommandShell.css";
import "./ComplianceCommand.css";
import { useData } from "../state/DataContext";

/* -----------------------------
  Helpers
------------------------------ */
function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function daysUntilISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });
}

function docComplete(c) {
  return !!c?.insuranceOnFile && !!c?.w9OnFile && !!c?.authorityOnFile;
}

function riskLabel(score) {
  if (score <= 25) return "Low";
  if (score <= 55) return "Medium";
  return "High";
}

/* -----------------------------
  LocalStorage for Reminders
------------------------------ */
const LS_REMINDERS = "lanesync_compliance_reminders_v1";

function loadReminders() {
  try {
    const raw = localStorage.getItem(LS_REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReminders(items) {
  try {
    localStorage.setItem(LS_REMINDERS, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/* =============================
  Compliance Command (v1 + NAV)
============================= */
export default function ComplianceCommand() {
  const navigate = useNavigate();
  const { carriers, trainingMode } = useData();

  // audit window
  const [daysWindow, setDaysWindow] = useState(30);
  const [lastAuditAt, setLastAuditAt] = useState(() => new Date().toISOString());

  // reminders
  const [reminders, setReminders] = useState(() => loadReminders());
  const [reminderOpen, setReminderOpen] = useState(false);
  const [remCarrierId, setRemCarrierId] = useState("");
  const [remType, setRemType] = useState("Insurance");
  const [remDue, setRemDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [remNote, setRemNote] = useState("");

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  const audit = useMemo(() => {
    const list = carriers || [];

    const expiringSoon = list
      .map((c) => {
        const days = daysUntilISO(c.insuranceExp);
        return { c, days };
      })
      .filter(({ days }) => days !== null && days >= 0 && days <= daysWindow)
      .sort((a, b) => a.days - b.days);

    const missingDocs = list
      .filter((c) => !docComplete(c))
      .map((c) => ({
        c,
        missing: [
          !c.insuranceOnFile ? "COI" : null,
          !c.w9OnFile ? "W9" : null,
          !c.authorityOnFile ? "Authority" : null,
        ].filter(Boolean),
      }));

    const alerts = list
      .map((c) => {
        const r = riskLabel(safeNum(c.riskScore));
        const claims = safeNum(c.claims);
        const onboardingBlock = c.status === "Onboarding" && !docComplete(c);
        const highRisk = r === "High";
        const hasIssues = claims > 0 || onboardingBlock || highRisk;
        return {
          c,
          risk: r,
          claims,
          onboardingBlock,
          highRisk,
          hasIssues,
        };
      })
      .filter((x) => x.hasIssues)
      .sort((a, b) => {
        const aKey = (a.onboardingBlock ? 100 : 0) + (a.highRisk ? 50 : 0) + a.claims * 5;
        const bKey = (b.onboardingBlock ? 100 : 0) + (b.highRisk ? 50 : 0) + b.claims * 5;
        return bKey - aKey;
      });

    const insuranceOk = list.filter((c) => !!c.insuranceOnFile).length;
    const insuranceMissing = list.length - insuranceOk;

    return {
      total: list.length,
      expiringSoon,
      missingDocs,
      alerts,
      insuranceOk,
      insuranceMissing,
    };
  }, [carriers, daysWindow]);

  function runAudit() {
    setLastAuditAt(new Date().toISOString());
  }

  function addReminder() {
    const carrier = (carriers || []).find((c) => c.id === remCarrierId);
    if (!carrier) return;

    const item = {
      id: `REM-${Math.floor(100000 + Math.random() * 900000)}`,
      carrierId: carrier.id,
      carrierName: carrier.name,
      type: remType,
      due: remDue,
      note: remNote.trim(),
      createdAt: new Date().toISOString(),
      done: false,
    };

    setReminders((prev) => [item, ...prev]);
    setRemNote("");
    setReminderOpen(false);
  }

  function toggleReminderDone(id) {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }

  function removeReminder(id) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  const openReminders = reminders.filter((r) => !r.done);
  const doneReminders = reminders.filter((r) => r.done);

  /* =============================
     NAV HELPERS (CLICK → CARRIER)
     IMPORTANT:
     - filter names aligned with CarrierCommand.jsx:
       - missing_docs -> Carrier KPI filter "MISSINGDOCS"
       - insurance_expiring -> opens Compliance tab
       - insurance_on_file -> informational list; open Compliance
  ============================= */

  // ✅ CHANGE THIS if your actual CarrierCommand route is different.
  // If y
const CARRIER_ROUTE = "/carrier-command";

  const goCarrier = useCallback(
    (params) => {
      const sp = new URLSearchParams();
      Object.entries(params || {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        sp.set(k, String(v));
      });
      navigate(`${CARRIER_ROUTE}?${sp.toString()}`);
    },
    [navigate]
  );

  const clickableProps = (onClick, label) => ({
    role: "button",
    tabIndex: 0,
    title: label,
    onClick,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
  });

  // maps Compliance labels -> CarrierCommand doc param keys
  function docParamFromChip(chip) {
    const t = String(chip || "").toLowerCase();
    if (t === "coi" || t === "insurance") return "coi";
    if (t === "w9" || t === "w-9") return "w9";
    if (t === "authority") return "authority";
    return "";
  }

  return (
    <div className="command-shell compliancecmd">
      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Money & Risk</div>
          <h1 className="command-shell__title">Compliance Command</h1>
          <p className="command-shell__subtitle">
            Monitor expirations, documents, insurance, and risk signals — before they become shutdowns.
          </p>
          <div className="compliancecmd__meta">
            <span className="compliancecmd__pill">
              Env: <strong>{trainingMode ? "Training" : "Live"}</strong>
            </span>
            <span className="compliancecmd__pill">
              Last audit: <strong>{new Date(lastAuditAt).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={() => setReminderOpen(true)}>
            Add Reminder
          </button>
          <button
            className="command-shell__btn command-shell__btn--primary"
            type="button"
            onClick={runAudit}
          >
            Run Audit
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <section className="compliancecmd__toolbar">
        <div className="compliancecmd__toolbarRow">
          <div className="compliancecmd__label">Expiring window</div>
          <div className="compliancecmd__seg">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                type="button"
                className={`compliancecmd__segBtn ${daysWindow === d ? "is-active" : ""}`}
                onClick={() => setDaysWindow(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="compliancecmd__grid">
        {/* Expiring Soon */}
        <div className="compliancecmd__card">
          <div
            className="compliancecmd__cardHeader"
            {...clickableProps(
              () =>
                goCarrier({
                  filter: "insurance_expiring",
                  days: daysWindow,
                  focus: "insurance",
                }),
              "Open Carrier Command (Insurance Expiring)"
            )}
          >
            <div>
              <div className="compliancecmd__cardTitle">Expiring Soon</div>
              <div className="compliancecmd__cardSub">
                Insurance expirations in next <strong>{daysWindow}</strong> days.
              </div>
            </div>
            <div className="compliancecmd__count">{audit.expiringSoon.length}</div>
          </div>

          <div className="compliancecmd__list">
            {audit.expiringSoon.length === 0 ? (
              <div className="compliancecmd__empty">No expirations in window.</div>
            ) : (
              audit.expiringSoon.slice(0, 8).map(({ c, days }) => (
                <div
                  key={c.id}
                  className="compliancecmd__row"
                  {...clickableProps(
                    () =>
                      goCarrier({
                        carrierId: c.id,
                        filter: "insurance_expiring",
                        focus: "insurance",
                      }),
                    `Open ${c.name} in Carrier Command (Compliance)`
                  )}
                >
                  <div className="compliancecmd__rowMain">
                    <div className="compliancecmd__rowTitle">{c.name}</div>
                    <div className="compliancecmd__rowSub">
                      {c.id} · Expires {fmtDate(c.insuranceExp)}
                    </div>
                  </div>
                  <div className={`compliancecmd__badge ${days <= 7 ? "is-warn" : ""}`}>
                    {days}d
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Docs */}
        <div className="compliancecmd__card">
          <div
            className="compliancecmd__cardHeader"
            {...clickableProps(
              () => goCarrier({ filter: "missing_docs", focus: "docs" }),
              "Open Carrier Command (Docs Missing)"
            )}
          >
            <div>
              <div className="compliancecmd__cardTitle">Missing Docs</div>
              <div className="compliancecmd__cardSub">W9, COI, authority — shutdown blockers.</div>
            </div>
            <div className="compliancecmd__count">{audit.missingDocs.length}</div>
          </div>

          <div className="compliancecmd__list">
            {audit.missingDocs.length === 0 ? (
              <div className="compliancecmd__empty">All carriers have required docs.</div>
            ) : (
              audit.missingDocs.slice(0, 8).map(({ c, missing }) => (
                <div key={c.id} className="compliancecmd__row">
                  {/* Row click: open the carrier directly on Docs tab */}
                  <div
                    className="compliancecmd__rowMain"
                    {...clickableProps(
                      () =>
                        goCarrier({
                          carrierId: c.id,
                          filter: "missing_docs",
                          focus: "docs",
                        }),
                      `Open ${c.name} in Carrier Command (Docs)`
                    )}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="compliancecmd__rowTitle">{c.name}</div>
                    <div className="compliancecmd__rowSub">
                      {c.id} · Missing: {missing.join(", ")}
                    </div>
                  </div>

                  {/* Chip click: go to the exact missing doc (COI/W9/Authority) */}
                  <div className="compliancecmd__chips" style={{ display: "flex", gap: 8 }}>
                    {missing.map((m) => (
                      <span
                        key={m}
                        className="compliancecmd__chip"
                        {...clickableProps(
                          () =>
                            goCarrier({
                              carrierId: c.id,
                              filter: "missing_docs",
                              focus: "docs",
                              doc: docParamFromChip(m),
                            }),
                          `Open ${c.name} in Carrier Command (Docs: ${m})`
                        )}
                        style={{ cursor: "pointer" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Insurance Snapshot */}
        <div className="compliancecmd__card">
          <div
            className="compliancecmd__cardHeader"
            {...clickableProps(
              () => goCarrier({ focus: "insurance" }),
              "Open Carrier Command (Insurance)"
            )}
          >
            <div>
              <div className="compliancecmd__cardTitle">Insurance Snapshot</div>
              <div className="compliancecmd__cardSub">Coverage on file + expirations overview.</div>
            </div>
          </div>

          <div className="compliancecmd__stats">
            <div
              className="compliancecmd__stat"
              {...clickableProps(
                () => goCarrier({ filter: "insurance_on_file", focus: "insurance" }),
                "View carriers with insurance on file"
              )}
            >
              <div className="compliancecmd__statLabel">On File</div>
              <div className="compliancecmd__statValue">{audit.insuranceOk}</div>
            </div>

            <div
              className="compliancecmd__stat"
              {...clickableProps(
                () => goCarrier({ filter: "missing_docs", focus: "docs" }),
                "View carriers missing insurance/docs"
              )}
            >
              <div className="compliancecmd__statLabel">Missing</div>
              <div className="compliancecmd__statValue">{audit.insuranceMissing}</div>
            </div>

            <div
              className="compliancecmd__stat"
              {...clickableProps(
                () =>
                  goCarrier({
                    filter: "insurance_expiring",
                    days: daysWindow,
                    focus: "insurance",
                  }),
                `View carriers expiring within ${daysWindow} days`
              )}
            >
              <div className="compliancecmd__statLabel">Expiring ({daysWindow}d)</div>
              <div className="compliancecmd__statValue">{audit.expiringSoon.length}</div>
            </div>
          </div>

          <div className="compliancecmd__divider" />

          <div className="compliancecmd__smallList">
            {(carriers || []).slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="compliancecmd__smallRow"
                {...clickableProps(
                  () =>
                    goCarrier({
                      carrierId: c.id,
                      focus: c.insuranceOnFile ? "insurance" : "docs",
                      doc: c.insuranceOnFile ? "" : "coi",
                      filter: c.insuranceOnFile ? "insurance_on_file" : "missing_docs",
                    }),
                  `Open ${c.name} in Carrier Command`
                )}
              >
                <div>
                  <div className="compliancecmd__smallTitle">{c.name}</div>
                  <div className="compliancecmd__smallSub">
                    COI: {c.insuranceOnFile ? "On file" : "Missing"} · Exp: {fmtDate(c.insuranceExp)}
                  </div>
                </div>
                <div className={`compliancecmd__dot ${c.insuranceOnFile ? "is-ok" : "is-warn"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="compliancecmd__card">
          <div
            className="compliancecmd__cardHeader"
            {...clickableProps(
              () => goCarrier({ filter: "atrisk", focus: "risk" }),
              "Open Carrier Command (At Risk)"
            )}
          >
            <div>
              <div className="compliancecmd__cardTitle">Alerts</div>
              <div className="compliancecmd__cardSub">
                High-risk carriers, claims, onboarding blockers.
              </div>
            </div>
            <div className="compliancecmd__count">{audit.alerts.length}</div>
          </div>

          <div className="compliancecmd__list">
            {audit.alerts.length === 0 ? (
              <div className="compliancecmd__empty">No active alerts.</div>
            ) : (
              audit.alerts.slice(0, 8).map((a) => (
                <div
                  key={a.c.id}
                  className="compliancecmd__row"
                  {...clickableProps(
                    () =>
                      goCarrier({
                        carrierId: a.c.id,
                        focus: a.onboardingBlock ? "docs" : a.highRisk ? "risk" : "performance",
                        filter: a.onboardingBlock ? "missing_docs" : a.highRisk ? "atrisk" : "",
                      }),
                    `Open ${a.c.name} in Carrier Command`
                  )}
                >
                  <div className="compliancecmd__rowMain">
                    <div className="compliancecmd__rowTitle">{a.c.name}</div>
                    <div className="compliancecmd__rowSub">
                      {a.c.id} · Risk {a.risk} · Claims {a.claims}
                      {a.onboardingBlock ? " · Onboarding blocked (docs)" : ""}
                    </div>
                  </div>
                  <div
                    className={`compliancecmd__badge ${
                      a.onboardingBlock || a.risk === "High" ? "is-warn" : ""
                    }`}
                  >
                    {a.onboardingBlock ? "BLOCK" : a.risk}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reminders (wide) */}
        <div className="compliancecmd__card compliancecmd__card--wide">
          <div className="compliancecmd__cardHeader">
            <div>
              <div className="compliancecmd__cardTitle">Reminders</div>
              <div className="compliancecmd__cardSub">
                Stored locally for now (v1). Next step: tie into notifications.
              </div>
            </div>
            <button className="compliancecmd__miniBtn" type="button" onClick={() => setReminderOpen(true)}>
              + Add
            </button>
          </div>

          <div className="compliancecmd__remGrid">
            <div className="compliancecmd__remCol">
              <div className="compliancecmd__remColTitle">Open</div>
              {openReminders.length === 0 ? (
                <div className="compliancecmd__empty">No open reminders.</div>
              ) : (
                openReminders.slice(0, 6).map((r) => (
                  <div key={r.id} className="compliancecmd__remRow">
                    <button
                      type="button"
                      className="compliancecmd__remCheck"
                      onClick={() => toggleReminderDone(r.id)}
                      aria-label="Mark done"
                      title="Mark done"
                    >
                      ☐
                    </button>
                    <div className="compliancecmd__remMain">
                      <div className="compliancecmd__remTitle">
                        {r.type} — {r.carrierName}
                      </div>
                      <div className="compliancecmd__remSub">
                        Due {r.due} {r.note ? `· ${r.note}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="compliancecmd__remX"
                      onClick={() => removeReminder(r.id)}
                      aria-label="Remove"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="compliancecmd__remCol">
              <div className="compliancecmd__remColTitle">Done</div>
              {doneReminders.length === 0 ? (
                <div className="compliancecmd__empty">No completed reminders.</div>
              ) : (
                doneReminders.slice(0, 6).map((r) => (
                  <div key={r.id} className="compliancecmd__remRow is-done">
                    <button
                      type="button"
                      className="compliancecmd__remCheck"
                      onClick={() => toggleReminderDone(r.id)}
                      aria-label="Mark undone"
                      title="Mark undone"
                    >
                      ☑
                    </button>
                    <div className="compliancecmd__remMain">
                      <div className="compliancecmd__remTitle">
                        {r.type} — {r.carrierName}
                      </div>
                      <div className="compliancecmd__remSub">
                        Due {r.due} {r.note ? `· ${r.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ADD REMINDER MODAL */}
      {reminderOpen ? (
        <div
          className="compliancecmd__overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setReminderOpen(false)}
        >
          <div className="compliancecmd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="compliancecmd__modalHeader">
              <div>
                <div className="compliancecmd__modalTitle">Add Reminder</div>
                <div className="compliancecmd__modalSub">Create a compliance follow-up.</div>
              </div>
              <button className="compliancecmd__close" type="button" onClick={() => setReminderOpen(false)}>
                ✕
              </button>
            </div>

            <div className="compliancecmd__form">
              <label className="compliancecmd__field">
                <span>Carrier</span>
                <select value={remCarrierId} onChange={(e) => setRemCarrierId(e.target.value)}>
                  <option value="">Select…</option>
                  {(carriers || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </label>

              <label className="compliancecmd__field">
                <span>Type</span>
                <select value={remType} onChange={(e) => setRemType(e.target.value)}>
                  <option>Insurance</option>
                  <option>W9</option>
                  <option>Authority</option>
                  <option>Onboarding</option>
                  <option>Claims Review</option>
                  <option>General</option>
                </select>
              </label>

              <label className="compliancecmd__field">
                <span>Due Date</span>
                <input type="date" value={remDue} onChange={(e) => setRemDue(e.target.value)} />
              </label>

              <label className="compliancecmd__field compliancecmd__field--wide">
                <span>Notes (optional)</span>
                <input
                  value={remNote}
                  onChange={(e) => setRemNote(e.target.value)}
                  placeholder="e.g. Request updated COI, follow up by email…"
                />
              </label>
            </div>

            <div className="compliancecmd__modalActions">
              <button className="command-shell__btn" type="button" onClick={() => setReminderOpen(false)}>
                Cancel
              </button>
              <button
                className="command-shell__btn command-shell__btn--primary"
                type="button"
                onClick={addReminder}
                disabled={!remCarrierId}
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
