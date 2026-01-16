// src/pages/LearningCommand.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommandShell.css";
import "./LearningCommand.css";

/**
 * Learning Command (Dispatcher Academy)
 * - A guided training program that takes a dispatcher from 0 -> operating in the UI
 * - Progress persists in localStorage
 * - Includes lessons + checklists + quick quizzes + practice scenarios that route to real commands
 */

const LS_KEY = "lanesync_learning_progress_v1";

function safeJsonParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function nowIso() {
  return new Date().toISOString();
}

function shortWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/* -----------------------------
   Curriculum
------------------------------ */
function buildCurriculum() {
  // Each lesson has:
  // - objectives
  // - checklist tasks
  // - optional quiz
  // - practice CTA routes to parts of the app
  return [
    {
      id: "welcome",
      level: "Beginner",
      title: "Welcome + How Dispatch Works",
      time: "7 min",
      summary: "Understand what dispatchers actually do and how LaneSync maps to the job.",
      objectives: [
        "Know the dispatcher’s daily responsibilities",
        "Understand the difference between Carrier, Load, and Mission Control",
        "Know what success looks like each day",
      ],
      checklist: [
        { id: "w1", text: "I can explain what a dispatcher's job is in 1 sentence." },
        { id: "w2", text: "I know what Mission Control is used for." },
        { id: "w3", text: "I know what Load Command is used for." },
        { id: "w4", text: "I know what Carrier Command is used for." },
      ],
      quiz: {
        prompt: "Which command is best for managing check calls and load status from pickup to delivery?",
        options: ["Carrier Command", "Load Command", "Learning Command", "Lane Command"],
        answerIndex: 1,
      },
      practice: [
        { label: "Open Mission Control", route: "/mission-control" },
        { label: "Open Load Command", route: "/load-command" },
        { label: "Open Carrier Command", route: "/carrier-command" },
      ],
    },

    {
      id: "ui-tour",
      level: "Beginner",
      title: "UI Tour: What to Click (No Guessing)",
      time: "10 min",
      summary: "Learn where things live and how to move through the UI quickly.",
      objectives: [
        "Navigate between commands using sidebar / routing",
        "Understand list → detail pattern (tables on left, detail on right)",
        "Learn how to update records and save changes",
      ],
      checklist: [
        { id: "u1", text: "I can open Mission Control and identify the KPI row." },
        { id: "u2", text: "I can open Load Command and click a load to see its detail panel." },
        { id: "u3", text: "I can open Carrier Command and open Full Profile for a carrier." },
      ],
      quiz: {
        prompt: "In most commands, what happens when you click a row in the list/table?",
        options: ["It deletes the record", "It selects it and shows details", "It exports a CSV", "It signs you out"],
        answerIndex: 1,
      },
      practice: [{ label: "Open Load Command (select a load)", route: "/load-command" }],
    },

    {
      id: "carrier-basics",
      level: "Beginner",
      title: "Carrier Setup + Onboarding",
      time: "12 min",
      summary: "Add a carrier, verify docs, and understand risk signals.",
      objectives: [
        "Create a carrier profile correctly",
        "Know minimum compliance docs (insurance, W-9, authority)",
        "Know how LaneSync flags risk",
      ],
      checklist: [
        { id: "c1", text: "I can add a new carrier in Carrier Command." },
        { id: "c2", text: "I know how to mark Insurance/W-9/Authority on file." },
        { id: "c3", text: "I can find the carrier’s load history in the Profile drawer." },
      ],
      practice: [
        { label: "Open Carrier Command (add a carrier)", route: "/carrier-command" },
        { label: "Open Carrier Command (view load history)", route: "/carrier-command?tab=Loads" },
      ],
    },

    {
      id: "load-lifecycle",
      level: "Core Ops",
      title: "Load Lifecycle: Booked → En Route → Delivered",
      time: "15 min",
      summary: "Everything you do on a load: status changes, dates, and the detail panel.",
      objectives: [
        "Create or edit a load record",
        "Assign a carrier to a load",
        "Advance status correctly at each milestone",
      ],
      checklist: [
        { id: "l1", text: "I can select a load and open Edit Load." },
        { id: "l2", text: "I can change Status and save changes." },
        { id: "l3", text: "I can assign a Carrier to a Load using the dropdown." },
        { id: "l4", text: "I can explain what ‘Detention Risk’ means and when to flag it." },
      ],
      quiz: {
        prompt: "What is the best time to mark a load as 'At Pickup'?",
        options: [
          "As soon as the load is booked",
          "When the driver checks in at the shipper",
          "When the truck leaves the yard in the morning",
          "After delivery is complete",
        ],
        answerIndex: 1,
      },
      practice: [{ label: "Open Load Command (edit a load)", route: "/load-command" }],
    },

    {
      id: "check-calls",
      level: "Core Ops",
      title: "Check Calls + Exception Handling",
      time: "12 min",
      summary: "How to stay ahead of late loads: check calls, notes, and alerts.",
      objectives: [
        "Mark check calls",
        "Update load notes for visibility",
        "Handle common exceptions (dock delay, lumper, appt changes)",
      ],
      checklist: [
        { id: "cc1", text: "I can click ‘Mark Check Call’ and understand what it does." },
        { id: "cc2", text: "I can add a note that a manager could understand instantly." },
        { id: "cc3", text: "I can set a load to Issue when something is wrong." },
      ],
      practice: [{ label: "Open Load Command (mark check calls)", route: "/load-command" }],
    },

    {
      id: "detention",
      level: "Core Ops",
      title: "Detention + Money Protection",
      time: "10 min",
      summary: "How to reduce detention losses and document what matters.",
      objectives: [
        "Identify detention risk early",
        "Know what timestamps matter",
        "Know what to communicate to brokers",
      ],
      checklist: [
        { id: "d1", text: "I can identify a detention risk load in the list." },
        { id: "d2", text: "I know what times to record (arrival, check-in, dock, release)." },
        { id: "d3", text: "I can write a broker message requesting detention." },
      ],
      practice: [{ label: "Open Load Command (detention risk)", route: "/load-command?filter=detention" }],
    },

    {
      id: "daily-routine",
      level: "Live Ops Ready",
      title: "Daily Dispatch Routine (Start → End)",
      time: "18 min",
      summary: "A full operating day: monitor, update, prevent issues, close out.",
      objectives: [
        "Run the day from Mission Control",
        "Check top risks and act fast",
        "Close out loads cleanly with notes",
      ],
      checklist: [
        { id: "dr1", text: "I can explain my first 5 actions when I start the day." },
        { id: "dr2", text: "I can find loads that are at risk and take action." },
        { id: "dr3", text: "I can close out a delivered load and capture next steps." },
      ],
      practice: [
        { label: "Open Mission Control (run the day)", route: "/mission-control" },
        { label: "Open Load Command (work the board)", route: "/load-command" },
      ],
    },
  ];
}

/* -----------------------------
   Practice Scenarios
------------------------------ */
const SCENARIOS = [
  {
    id: "s1",
    title: "Scenario: Late Pickup Risk",
    difficulty: "Beginner",
    story:
      "Driver says the shipper dock is backed up and they have been waiting 90 minutes. Broker expects on-time pickup.",
    steps: [
      "Open Load Command.",
      "Select the load that looks most at risk (status Issue/At Pickup or detention risk).",
      "Add a note with: arrival time, check-in time, and current wait time.",
      "Toggle Detention Risk if appropriate.",
      "Mark a check call once you confirm with the driver.",
      "Advance status only if the driver is actually loaded and rolling.",
    ],
    ctas: [{ label: "Go to Load Command", route: "/load-command" }],
    templateMessage:
      "Update: Driver checked in at {time}. Dock delay ongoing. Current wait: {minutes} min. Requesting detention if delay exceeds {policy} hrs. Next update in 30 min.",
  },
  {
    id: "s2",
    title: "Scenario: New Carrier Onboarding",
    difficulty: "Core Ops",
    story: "A new carrier wants to run loads with you, but they haven't sent all documents yet.",
    steps: [
      "Open Carrier Command.",
      "Add the carrier (or select them if they exist).",
      "Mark Insurance/W-9/Authority appropriately.",
      "Add a note describing missing docs and follow-up date.",
      "Open Full Profile and review compliance.",
    ],
    ctas: [{ label: "Go to Carrier Command", route: "/carrier-command" }],
    templateMessage:
      "Welcome aboard. We still need: {missingDocs}. Please send by {date}. Once received we can assign loads immediately.",
  },
  {
    id: "s3",
    title: "Scenario: Load Assignment + Status Flow",
    difficulty: "Live Ops Ready",
    story:
      "You booked a load. Now you must assign a carrier, confirm pickup/delivery times, and keep it updated until delivery.",
    steps: [
      "Open Load Command.",
      "Select a load in Booked status.",
      "Assign a carrier from the dropdown.",
      "Verify pickup and delivery times are correct.",
      "Advance status to At Pickup only when checked in.",
      "Advance status to En Route when rolling.",
      "At delivery, update notes and mark delivered/completed.",
    ],
    ctas: [{ label: "Go to Load Command", route: "/load-command" }],
    templateMessage:
      "Carrier assigned: {carrier}. PU: {pickup}. DEL: {delivery}. Will send updates at: check-in, loaded, en route, delivered.",
  },
];

export default function LearningCommand() {
  const navigate = useNavigate();
  const curriculum = useMemo(() => buildCurriculum(), []);

  // Progress shape:
  // {
  //   startedAt, lastSeenAt,
  //   activeLessonId,
  //   checks: { [lessonId]: { [checkId]: true } },
  //   quiz: { [lessonId]: { passed: bool, selectedIndex: n, at: iso } },
  //   completedLessons: { [lessonId]: true }
  // }
  const [progress, setProgress] = useState(() =>
    safeJsonParse(localStorage.getItem(LS_KEY), {
      startedAt: null,
      lastSeenAt: null,
      activeLessonId: curriculum[0]?.id || "welcome",
      checks: {},
      quiz: {},
      completedLessons: {},
    })
  );

  const [tab, setTab] = useState("Training"); // Training | Practice | Resources

  useEffect(() => {
    setProgress((p) => ({
      ...p,
      startedAt: p.startedAt || nowIso(),
      lastSeenAt: nowIso(),
      activeLessonId: p.activeLessonId || curriculum[0]?.id,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  }, [progress]);

  const activeLesson = useMemo(() => {
    return curriculum.find((l) => l.id === progress.activeLessonId) || curriculum[0];
  }, [curriculum, progress.activeLessonId]);

  const totalChecks = useMemo(() => {
    let total = 0;
    curriculum.forEach((l) => (total += l.checklist?.length || 0));
    return total;
  }, [curriculum]);

  const doneChecks = useMemo(() => {
    let done = 0;
    curriculum.forEach((l) => {
      const map = progress.checks?.[l.id] || {};
      (l.checklist || []).forEach((t) => {
        if (map[t.id]) done += 1;
      });
    });
    return done;
  }, [curriculum, progress.checks]);

  const completedLessonsCount = useMemo(() => {
    return Object.values(progress.completedLessons || {}).filter(Boolean).length;
  }, [progress.completedLessons]);

  const overallPct = pct(doneChecks, totalChecks);

  function setActiveLesson(id) {
    setProgress((p) => ({ ...p, activeLessonId: id }));
  }

  function toggleCheck(lessonId, checkId) {
    setProgress((p) => {
      const prevLesson = p.checks?.[lessonId] || {};
      const nextLesson = { ...prevLesson, [checkId]: !prevLesson[checkId] };
      const nextChecks = { ...(p.checks || {}), [lessonId]: nextLesson };

      // If all checks done, mark lesson complete
      const lesson = curriculum.find((l) => l.id === lessonId);
      const allDone =
        lesson?.checklist?.length
          ? lesson.checklist.every((t) => nextLesson[t.id])
          : false;

      const nextCompleted = { ...(p.completedLessons || {}) };
      if (allDone) nextCompleted[lessonId] = true;

      return { ...p, checks: nextChecks, completedLessons: nextCompleted };
    });
  }

  function resetTraining() {
    localStorage.removeItem(LS_KEY);
    setProgress({
      startedAt: nowIso(),
      lastSeenAt: nowIso(),
      activeLessonId: curriculum[0]?.id || "welcome",
      checks: {},
      quiz: {},
      completedLessons: {},
    });
  }

  function submitQuiz(lessonId, selectedIndex) {
    const lesson = curriculum.find((l) => l.id === lessonId);
    if (!lesson?.quiz) return;

    const passed = selectedIndex === lesson.quiz.answerIndex;

    setProgress((p) => ({
      ...p,
      quiz: {
        ...(p.quiz || {}),
        [lessonId]: { passed, selectedIndex, at: nowIso() },
      },
    }));
  }

  function go(route) {
    navigate(route);
  }

  const nextLesson = useMemo(() => {
    const idx = curriculum.findIndex((l) => l.id === activeLesson?.id);
    if (idx < 0) return null;
    return curriculum[idx + 1] || null;
  }, [curriculum, activeLesson]);

  const prevLesson = useMemo(() => {
    const idx = curriculum.findIndex((l) => l.id === activeLesson?.id);
    if (idx <= 0) return null;
    return curriculum[idx - 1] || null;
  }, [curriculum, activeLesson]);

  return (
    <div className="command-shell learningcmd">
      {/* HEADER */}
      <header className="command-shell__header">
        <div>
          <div className="command-shell__kicker">Training</div>
          <h1 className="command-shell__title">Learning Command</h1>
          <p className="command-shell__subtitle">
            Dispatcher Academy — step-by-step training from <strong>zero</strong> to running loads inside LaneSync.
          </p>
        </div>

        <div className="command-shell__actions">
          <button className="command-shell__btn" type="button" onClick={() => go("/mission-control")}>
            Open Mission Control
          </button>
          <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={resetTraining}>
            Reset Training
          </button>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <section className="learningcmd__progress">
        <div className="learningcmd__progressTop">
          <div className="learningcmd__progressTitle">Overall Progress</div>
          <div className="learningcmd__progressMeta">
            {overallPct}% • {doneChecks}/{totalChecks} tasks • Lessons Complete {completedLessonsCount}/{curriculum.length}
          </div>
        </div>
        <div className="learningcmd__bar">
          <div className="learningcmd__barFill" style={{ width: `${clamp(overallPct, 0, 100)}%` }} />
        </div>
        <div className="learningcmd__progressFoot">
          Last activity: {shortWhen(progress.lastSeenAt)}
        </div>
      </section>

      {/* TABS */}
      <div className="learningcmd__tabs" role="tablist" aria-label="Learning tabs">
        {["Training", "Practice", "Resources"].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`learningcmd__tab ${tab === t ? "is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <section className="learningcmd__grid">
        {/* LEFT NAV */}
        <aside className="learningcmd__nav">
          <div className="learningcmd__navTitle">Curriculum</div>
          <div className="learningcmd__navList">
            {curriculum.map((l) => {
              const checksMap = progress.checks?.[l.id] || {};
              const done = (l.checklist || []).filter((t) => checksMap[t.id]).length;
              const total = l.checklist?.length || 0;
              const isDone = !!progress.completedLessons?.[l.id];
              const isActive = activeLesson?.id === l.id;

              return (
                <button
                  key={l.id}
                  type="button"
                  className={`learningcmd__navItem ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveLesson(l.id)}
                >
                  <div className="learningcmd__navTop">
                    <div className="learningcmd__navLevel">{l.level}</div>
                    <div className={`learningcmd__badge ${isDone ? "is-done" : ""}`}>
                      {isDone ? "Done" : `${done}/${total}`}
                    </div>
                  </div>
                  <div className="learningcmd__navName">{l.title}</div>
                  <div className="learningcmd__navSub">{l.time} • {l.summary}</div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="learningcmd__panel">
          {tab === "Training" ? (
            <div className="learningcmd__lesson">
              <div className="learningcmd__lessonHeader">
                <div>
                  <div className="learningcmd__lessonLevel">{activeLesson.level}</div>
                  <div className="learningcmd__lessonTitle">{activeLesson.title}</div>
                  <div className="learningcmd__lessonMeta">{activeLesson.time} • {activeLesson.summary}</div>
                </div>

                <div className="learningcmd__lessonNavBtns">
                  <button
                    className="command-shell__btn"
                    type="button"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLesson(prevLesson.id)}
                  >
                    ← Prev
                  </button>
                  <button
                    className="command-shell__btn command-shell__btn--primary"
                    type="button"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setActiveLesson(nextLesson.id)}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Objectives */}
              <div className="learningcmd__card">
                <div className="learningcmd__cardTitle">Objectives</div>
                <ul className="learningcmd__bullets">
                  {(activeLesson.objectives || []).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>

              {/* Checklist */}
              <div className="learningcmd__card">
                <div className="learningcmd__cardTitle">Checklist (do these inside the UI)</div>
                <div className="learningcmd__checks">
                  {(activeLesson.checklist || []).map((t) => {
                    const checked = !!progress.checks?.[activeLesson.id]?.[t.id];
                    return (
                      <label key={t.id} className={`learningcmd__check ${checked ? "is-on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(activeLesson.id, t.id)}
                        />
                        <span>{t.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quiz */}
              {activeLesson.quiz ? (
                <div className="learningcmd__card">
                  <div className="learningcmd__cardTitle">Quick Check</div>
                  <div className="learningcmd__quizPrompt">{activeLesson.quiz.prompt}</div>

                  <div className="learningcmd__quizOptions">
                    {activeLesson.quiz.options.map((opt, idx) => {
                      const result = progress.quiz?.[activeLesson.id];
                      const selected = result?.selectedIndex === idx;
                      const showResult = !!result;
                      const isCorrect = idx === activeLesson.quiz.answerIndex;

                      let cls = "learningcmd__quizOption";
                      if (showResult && selected && result.passed) cls += " is-correct";
                      if (showResult && selected && !result.passed) cls += " is-wrong";
                      if (showResult && !selected && isCorrect) cls += " is-correctHint";

                      return (
                        <button
                          key={opt}
                          type="button"
                          className={cls}
                          onClick={() => submitQuiz(activeLesson.id, idx)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {progress.quiz?.[activeLesson.id] ? (
                    <div className={`learningcmd__quizResult ${progress.quiz[activeLesson.id].passed ? "ok" : "bad"}`}>
                      {progress.quiz[activeLesson.id].passed
                        ? "✅ Correct — keep going."
                        : "❌ Not quite — review the lesson and try again."}
                    </div>
                  ) : (
                    <div className="learningcmd__hint">Pick an answer to record your result.</div>
                  )}
                </div>
              ) : null}

              {/* Practice Buttons */}
              <div className="learningcmd__card">
                <div className="learningcmd__cardTitle">Practice Now</div>
                <div className="learningcmd__ctaRow">
                  {(activeLesson.practice || []).map((p) => (
                    <button
                      key={p.label}
                      className="command-shell__btn command-shell__btn--primary"
                      type="button"
                      onClick={() => go(p.route)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="learningcmd__hint">
                  Tip: Keep Learning Command open in one tab, and the command UI in another.
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Practice" ? (
            <div className="learningcmd__practice">
              <div className="learningcmd__practiceHeader">
                <div className="learningcmd__practiceTitle">Practice Scenarios</div>
                <div className="learningcmd__practiceSub">
                  These are “real day” simulations. Follow the steps, then use the message templates.
                </div>
              </div>

              <div className="learningcmd__scenarioGrid">
                {SCENARIOS.map((s) => (
                  <div key={s.id} className="learningcmd__scenarioCard">
                    <div className="learningcmd__scenarioTop">
                      <div>
                        <div className="learningcmd__scenarioTitle">{s.title}</div>
                        <div className="learningcmd__scenarioMeta">{s.difficulty}</div>
                      </div>
                      <button
                        className="command-shell__btn command-shell__btn--primary"
                        type="button"
                        onClick={() => go(s.ctas[0].route)}
                      >
                        Open UI →
                      </button>
                    </div>

                    <div className="learningcmd__scenarioStory">{s.story}</div>

                    <div className="learningcmd__scenarioStepsTitle">Steps</div>
                    <ol className="learningcmd__scenarioSteps">
                      {s.steps.map((st) => (
                        <li key={st}>{st}</li>
                      ))}
                    </ol>

                    <div className="learningcmd__scenarioStepsTitle">Message Template</div>
                    <div className="learningcmd__template">
                      {s.templateMessage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "Resources" ? (
            <div className="learningcmd__resources">
              <div className="learningcmd__card">
                <div className="learningcmd__cardTitle">Dispatcher Cheat Sheets</div>

                <div className="learningcmd__resourceGrid">
                  <div className="learningcmd__resourceCard">
                    <div className="learningcmd__resourceTitle">Status Definitions</div>
                    <ul className="learningcmd__bullets">
                      <li><strong>Booked:</strong> Load is confirmed, truck assigned or pending.</li>
                      <li><strong>At Pickup:</strong> Driver checked in / waiting / loading.</li>
                      <li><strong>En Route:</strong> Loaded and moving.</li>
                      <li><strong>At Delivery:</strong> Arrived / unloading.</li>
                      <li><strong>Completed:</strong> Delivered and closed out (POD captured later).</li>
                      <li><strong>Issue:</strong> Any exception requiring attention.</li>
                    </ul>
                  </div>

                  <div className="learningcmd__resourceCard">
                    <div className="learningcmd__resourceTitle">Best Practice Notes Format</div>
                    <div className="learningcmd__template">
                      {`Update:
- Location: {city}
- Time: {time}
- Status: {waiting/loading/rolling}
- Risk: {detention/late appt/traffic}
- Next step: {call broker / update ETA / request detention}
- Next update: {time}`}
                    </div>
                  </div>

                  <div className="learningcmd__resourceCard">
                    <div className="learningcmd__resourceTitle">Broker Message Starters</div>
                    <ul className="learningcmd__bullets">
                      <li>“Quick update: driver checked in at {time}. Dock delay ongoing.”</li>
                      <li>“Confirming appointment window — are we good for {time}?”</li>
                      <li>“Requesting detention per policy — can you confirm terms?”</li>
                      <li>“ETA updated due to {reason}. New ETA {time}. OK?”</li>
                    </ul>
                  </div>

                  <div className="learningcmd__resourceCard">
                    <div className="learningcmd__resourceTitle">Daily Routine (5 Moves)</div>
                    <ol className="learningcmd__scenarioSteps">
                      <li>Open Mission Control: scan KPIs + risk areas.</li>
                      <li>Open Load Command: sort by Issue / At Pickup / Detention Risk.</li>
                      <li>Run check calls: update notes + ETAs.</li>
                      <li>Prevent loss: detention requests + late appt notices.</li>
                      <li>Close out: delivered loads + next-day prep.</li>
                    </ol>
                  </div>
                </div>

                <div className="learningcmd__hint" style={{ marginTop: 10 }}>
                  Later we can connect this to real data + “Training Mode” sample loads so new dispatchers can train safely.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
