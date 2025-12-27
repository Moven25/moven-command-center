import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./AppShell.css";

export default function AppShell({ children }) {
  // Command state lives at the shell level so TOP + SIDE stay synced
  const [activeCommand, setActiveCommand] = useState("mission");

  return (
    <div className="app-shell">
      <Sidebar activeCommand={activeCommand} onCommandChange={setActiveCommand} />
      <main className="app-main">
        {/* Pass command state into the child page */}
        {React.isValidElement(children)
          ? React.cloneElement(children, { activeCommand, onCommandChange: setActiveCommand })
          : children}
      </main>
    </div>
  );
}
