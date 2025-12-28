import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CarrierCommand from "./CarrierCommand";
import PlaceholderCommand from "../components/PlaceholderCommand";

export default function Dashboard() {
  const [activeCommand, setCmd] = useState("mission");

  // ✅ TEMP local handlers (prevents runtime crash)
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
        {/* Header (keep your existing classes if you already have CSS for them) */}
        <header className="dashTopbar">
          <div className="brand">
            <div className="brandText">MOVEN COMMAND</div>
          </div>

          {/* ✅ Mission Control (Dashboard) is officially NO command bar
              so we only show the top buttons when NOT on mission. */}
          {activeCommand !== "mission" && (
            <div className="topCmds">
              {topItems.map((it) => (
                <button
                  key={it.key}
                  className={activeCommand === it.key ? "top-command-btn active" : "top-command-btn"}
                  onClick={() => setCmd(it.key)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ✅ Tailwind Test Box (CONFIRMATION) */}
        <div className="p-6 bg-red-700 text-white rounded-xl m-4">
          Tailwind is working 🔥
        </div>

        {/* ✅ Mission Control section (THIS is what you were missing) */}
        {activeCommand === "mission" && (
          <section className="px-4 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4">
                <div className="text-sm text-zinc-300">Active Loads</div>
                <div className="text-3xl font-bold text-white mt-2">14</div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4">
                <div className="text-sm text-zinc-300">Active Carriers</div>
                <div className="text-3xl font-bold text-white mt-2">28</div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4">
                <div className="text-sm text-zinc-300">At Risk</div>
                <div className="text-3xl font-bold text-white mt-2">3</div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4">
                <div className="text-sm text-zinc-300">Revenue</div>
                <div className="text-3xl font-bold text-green-400 mt-2">$32,540</div>
                <div className="text-xs text-zinc-400 mt-1">$3.02 RPM</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4">
                <div className="text-white font-semibold mb-2">Quick Actions</div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-lg bg-red-700 text-white"
                    onClick={addLoadLocal}
                  >
                    + Add Load
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
                    onClick={addCarrierLocal}
                  >
                    + Add Carrier
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-700 p-4 lg:col-span-2">
                <div className="text-white font-semibold mb-2">System Status</div>
                <ul className="text-sm text-zinc-300 space-y-2">
                  <li>✅ Live Data Connected</li>
                  <li>✅ Carriers Synced</li>
                  <li>✅ Loads Synced</li>
                  <li>✅ Brokers Synced</li>
                  <li>✅ Factoring Updated</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Other commands */}
        {activeCommand === "carrier" && (
          <CarrierCommand onAddCarrier={addCarrierLocal} onAddLoad={addLoadLocal} />
        )}

        {activeCommand === "load" && <PlaceholderCommand title="Load Command" />}
        {activeCommand === "weather" && <PlaceholderCommand title="Weather Command" />}
        {activeCommand === "learning" && <PlaceholderCommand title="Learning Command" />}
        {activeCommand === "dtl" && <PlaceholderCommand title="DTL Command" />}
      </main>
    </div>
  );
}
