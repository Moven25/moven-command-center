import React, { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MissionControl from "../pages/MissionControl";
import PlaceholderPage from "../pages/PlaceholderPage";

const SECTIONS = [
  { key: "mission", label: "Mission Control" },
  { key: "dispatch", label: "Dispatch Command" },
  { key: "logistics", label: "Logistics Command" },
  { key: "carrier", label: "Carrier Command" },
  { key: "broker", label: "Broker Command" },
  { key: "finance", label: "Finance Command" },
  { key: "compliance", label: "Compliance Command" },
  { key: "learning", label: "Learning Command" },
  { key: "settings", label: "Settings / Utilities" },
];

export default function AppShell() {
  const [active, setActive] = useState("mission");

  // Mission Control interactive UI state
  const [boardOpen, setBoardOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const activeLabel = useMemo(
    () => SECTIONS.find((s) => s.key === active)?.label ?? "Mission Control",
    [active]
  );

  const content = useMemo(() => {
    if (active === "mission") {
      return (
        <MissionControl
          boardOpen={boardOpen}
          onToggleBoard={() => setBoardOpen((v) => !v)}
          assignOpen={assignOpen}
          onOpenAssign={() => setAssignOpen(true)}
          onCloseAssign={() => setAssignOpen(false)}
        />
      );
    }
    return <PlaceholderPage title={activeLabel} />;
  }, [active, activeLabel, boardOpen, assignOpen]);

  return (
    <div className="osRoot">
      <aside className="osSidebar">
        <Sidebar sections={SECTIONS} active={active} onChange={setActive} />
      </aside>

      <main className="osMain">
        <TopBar section={activeLabel} />
        <div className="osContent">{content}</div>
      </main>
    </div>
  );
}
