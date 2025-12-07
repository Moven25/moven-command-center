import React from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-move">MOVE</span>
          <span className="logo-n">N</span>
        </div>

        <div className="sidebar-section-label">MOVEN Mission</div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active">Mission Control</button>
          <button className="sidebar-link">Carrier Command</button>
          <button className="sidebar-link">Load Command</button>
          <button className="sidebar-link">Weather Command</button>
          <button className="sidebar-link">Learning Command</button>
          <button className="sidebar-link">DTL</button>
          <button className="sidebar-link">Settings</button>
          <button className="sidebar-link">Admin</button>
        </nav>
      </aside>

      <div className="main-shell">
        <header className="top-nav">
          <div className="top-tabs">
            <button className="top-tab active">Mission Control</button>
            <button className="top-tab">Carrier Command</button>
            <button className="top-tab">Load Command</button>
            <button className="top-tab">Weather Command</button>
            <button className="top-tab">Learning Command</button>
          </div>

          <div className="top-right">
            <button className="top-button">Sync</button>
            <button className="top-button primary">Owner Console</button>
          </div>
        </header>

        <main className="main-content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
