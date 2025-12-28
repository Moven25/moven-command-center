import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CarrierCommand from "./CarrierCommand";
import MissionGrid from "../components/MissionGrid";
import PlaceholderCommand from "../components/PlaceholderCommand";

export default function Dashboard() {
  const [activeCommand, setCmd] = useState("mission");

  // 🔧 TEMP local handlers (prevents runtime crash)
  const addCarrierLocal = () => {
    console.log("Add Carrier clicked");
  };

  const addLoadLocal = () => {
    console.log("Add Load clicked");
  };

  const topItems = [
    { key: "mission", label: "Mission Control" },
    { key: "carrier", label: "Carrier Command" },
    { key: "load", label: "Load Command" },
    { key: "weather", label: "Weather" },
    { key: "learning", label: "Learning" },
    { key: "dtl", label: "DTL" },
  ];

  return (
    <div className="appShell">
      {/* Sidebar */}
      <aside>
        <Sidebar setCmd={setCmd} />
      </aside>

      {/* Main */}
      <main className="main">
        {/* Top Command Bar */}
        <header className="dashTopbar">
          <div className="brand">
            <div className="brandText">MOVEN COMMAND</div>
          </div>

          <div className="topCmds">
            {topItems.map((it) => (
              <button
                key={it.key}
                className={
                  activeCommand === it.key
                    ? "top-command-btn active"
                    : "top-command-btn"
                }
                onClick={() => setCmd(it.key)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </header>

        {/* 🔥 Tailwind Test Box (CONFIRMATION) */}
        <div className="p-6 bg-red-700 text-white rounded-xl m-4">
          Tailwind is working 🔥
        </div>

        {/* Command Renderer */}
        {activeCommand === "mission" && <MissionGrid />}

        {activeCommand === "carrier" && (
          <CarrierCommand
            onAddCarrier={addCarrierLocal}
            onAddLoad={addLoadLocal}
          />
        )}

        {activeCommand === "load" && (
          <PlaceholderCommand title="Load Command" />
        )}

        {activeCommand === "weather" && (
          <PlaceholderCommand title="Weather Command" />
        )}

        {activeCommand === "learning" && (
          <PlaceholderCommand title="Learning Command" />
        )}

        {activeCommand === "dtl" && (
          <PlaceholderCommand title="DTL Command" />
        )}
      </main>
    </div>
  );
}
