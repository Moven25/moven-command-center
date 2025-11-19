// ---------------------------------------------------------
//  MOVEN COMMAND CENTER — Mission Control Sync Logic (Clean)
//  Uses fetch-sheets-v2 + new sheets.js loader
// ---------------------------------------------------------

import { getSheetData } from "/js/sheets.js";

// ---------------------------------------------------------
//  Mission Control initializer
// ---------------------------------------------------------
async function initMissionControl() {
  console.log("🚀 MOVEN: Mission Control Start");

  const carriersBox = document.querySelector("#totalCarriers .summary-value");
  const loadsBox = document.querySelector("#activeLoads .summary-value");
  const systemStatusBox = document.querySelector("#systemStatus .summary-value");

  if (!carriersBox || !loadsBox || !systemStatusBox) {
    console.error("❌ MOVEN: Mission Control DOM missing elements.");
    return;
  }

  systemStatusBox.textContent = "Connecting...";

  try {
    // CARRIERS
    const carriers = await getSheetData("carriers");
    carriersBox.textContent = carriers.length;

    // LOADS
    const loads = await getSheetData("loads");
    loadsBox.textContent = loads.length;

    systemStatusBox.textContent = "Live";
    console.log("🟢 MOVEN Mission Control: LIVE");
  } catch (err) {
    systemStatusBox.textContent = "Disconnected";
    console.error("❌ MOVEN MC Sync Failed:", err);
  }
}

// ---------------------------------------------------------
//  PANEL LOADER
// ---------------------------------------------------------
function loadPanel(panelId) {
  document.querySelectorAll(".panel-content").forEach((p) => {
    p.style.display = "none";
  });

  const panel = document.getElementById(panelId);
  if (panel) panel.style.display = "block";

  if (panelId === "missionControl") {
    initMissionControl();
  }
}

window.loadPanel = loadPanel;

console.log("⚡ MOVEN Command Panels JS Loaded");
