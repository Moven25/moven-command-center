// src/pages/LearningCommand.jsx
import React from "react";
import "./LearningCommand.css";

function LearningCommand() {
  return (
    <div className="learning-page">
      {/* HEADER */}
      <header className="learning-header">
        <div>
          <h1>Learning Command</h1>
          <p>
            Train new dispatchers, level up your own skills, and keep the MOVEN
            playbook in one place.
          </p>
        </div>

        <div className="learning-header-meta">
          <div className="pill">MOVEN Academy</div>
          <div className="pill pill-outline">Owner View</div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="learning-grid">
        {/* LEFT: TRACKS */}
        <section className="card track-card">
          <h2 className="section-title">MOVEN Playbook Tracks</h2>
          <p className="section-subtitle">
            Work through tracks in order, or jump to what you need right now.
          </p>

          <div className="track-list">
            <div className="track-item">
              <div>
                <h3>Dispatch Foundations</h3>
                <p>Mindset, workflow, language, and core dispatcher habits.</p>
              </div>
              <div className="track-meta">
                <span className="tag tag-green">Start Here</span>
                <span className="track-progress">0 / 8 lessons</span>
              </div>
            </div>

            <div className="track-item">
              <div>
                <h3>RPM, Lanes & Markets</h3>
                <p>
                  Headhaul vs backhaul, lane research, RPM targets, and fuel-aware
                  planning.
                </p>
              </div>
              <div className="track-meta">
                <span className="tag">Freight Strategy</span>
                <span className="track-progress">0 / 6 lessons</span>
              </div>
            </div>

            <div className="track-item">
              <div>
                <h3>Broker Command</h3>
                <p>
                  Negotiation flows, objection handling, and real-world call
                  scripts.
                </p>
              </div>
              <div className="track-meta">
                <span className="tag">Money Conversations</span>
                <span className="track-progress">0 / 7 lessons</span>
              </div>
            </div>

            <div className="track-item">
              <div>
                <h3>DTL & Route Strategy</h3>
                <p>
                  Double Triangle Lanes, headhaul priority, and risk-aware routing.
                </p>
              </div>
              <div className="track-meta">
                <span className="tag">Advanced</span>
                <span className="track-progress">0 / 5 lessons</span>
              </div>
            </div>

            <div className="track-item">
              <div>
                <h3>Mindset & Performance</h3>
                <p>
                  Stress control, focus, and routines to run a real dispatch
                  empire.
                </p>
              </div>
              <div className="track-meta">
                <span className="tag">Empire Mode</span>
                <span className="track-progress">0 / 4 sessions</span>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE: CURRENT LESSON */}
        <section className="card current-lesson-card">
          <div className="card-header-row">
            <div>
              <h2 className="section-title">Current Lesson</h2>
              <p className="section-subtitle">
                Use this as your daily focus. One lesson at a time, no overwhelm.
              </p>
            </div>
            <span className="pill pill-soft">Not Started</span>
          </div>

          <div className="lesson-meta">
            <div>
              <span className="label">Track</span>
              <p>Dispatch Foundations</p>
            </div>
            <div>
              <span className="label">Lesson</span>
              <p>01 — How MOVEN Command should feel when you’re dispatching</p>
            </div>
            <div>
              <span className="label">Estimated Time</span>
              <p>10–15 minutes</p>
            </div>
          </div>

          <div className="lesson-body">
            <h3>Lesson Summary</h3>
            <ul>
              <li>Understand what “commanding lanes” actually means day to day.</li>
              <li>
                See how Dashboard, Load Command, Carrier Command, and DTL fit
                together.
              </li>
              <li>
                Learn the default daily flow: morning scan → lane plan → match
                loads → protect RPM.
              </li>
              <li>
                Set expectations for how many trucks one dispatcher can manage with
                MOVEN.
              </li>
            </ul>
          </div>

          <div className="lesson-actions">
            <button className="btn-primary">Mark Lesson Complete</button>
            <button className="btn-ghost">Add Notes for Team</button>
          </div>

          <div className="lesson-notes">
            <span className="label">Dispatcher Notes</span>
            <p className="placeholder">
              Use this area to capture your own wording, phrases, and personal
              tweaks to the playbook.
            </p>
          </div>
        </section>

        {/* RIGHT: PROGRESS + QUICK LINKS */}
        <section className="card progress-card">
          <h2 className="section-title">Progress & Quick Actions</h2>

          <div className="progress-block">
            <div className="progress-row">
              <span>Overall MOVEN Training</span>
              <span className="progress-value">0%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-row">
              <span>Dispatch Ops</span>
              <span className="progress-value">0 / 8</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-row">
              <span>Broker & Money</span>
              <span className="progress-value">0 / 7</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-row">
              <span>DTL Strategy</span>
              <span className="progress-value">0 / 5</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>

          <div className="quick-links">
            <h3>Quick Actions</h3>
            <button className="btn-secondary">Start at Lesson 1</button>
            <button className="btn-secondary">View Full Lesson Library</button>
            <button className="btn-secondary">Download MOVEN Playbook PDF</button>
          </div>

          <div className="small-note">
            Later, this panel can sync to real completion data and show which
            dispatchers have finished which tracks.
          </div>
        </section>
      </div>

      {/* LESSON LIBRARY (BOTTOM) */}
      <section className="card library-card">
        <h2 className="section-title">Lesson Library</h2>
        <p className="section-subtitle">
          Fast access to all topics. Use this as your “table of contents” for the
          MOVEN system.
        </p>

        <div className="library-grid">
          <div className="library-column">
            <h3>Getting Started</h3>
            <ul>
              <li>01 — MOVEN System Overview</li>
              <li>02 — Daily Dispatch Flow</li>
              <li>03 — Tools, screens, and setups</li>
            </ul>
          </div>

          <div className="library-column">
            <h3>Dispatch Operations</h3>
            <ul>
              <li>Finding and filtering loads</li>
              <li>Rate calls and scripts</li>
              <li>Capturing rate cons and notes</li>
            </ul>
          </div>

          <div className="library-column">
            <h3>Broker & Money</h3>
            <ul>
              <li>Broker Command negotiation flow</li>
              <li>TONU, layovers, and accessorials</li>
              <li>Factoring and cash-flow basics</li>
            </ul>
          </div>

          <div className="library-column">
            <h3>Strategy Lab</h3>
            <ul>
              <li>Headhaul vs backhaul decision making</li>
              <li>DTL cycle examples</li>
              <li>Protecting home time and RPM</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearningCommand;
