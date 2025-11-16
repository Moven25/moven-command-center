// ========================================
// MOVEN Command Panels (Mission Control)
// ========================================

import { getSheetData } from "./sheets.js";

function loadPanel(panelId) {
  const panels = document.querySelectorAll(".panel-content");
  panels.forEach((p) => (p.style.display = "none"));
  document.getElementById(panelId).style.display = "block";
}

// Default open Mission Control
window.onload = async () => {
  loadPanel("missionControl");
  document.getElementById("missionControl").style.display = "block";

  console.log("✅ MOVEN Mission Control Loaded - initializing live data sync...");

  const carriersBox = document.querySelector("#totalCarriers .summary-value");
  const loadsBox = document.querySelector("#activeLoads .summary-value");
  const systemStatusBox = document.querySelector("#systemStatus .summary-value");

  if (!carriersBox || !loadsBox || !systemStatusBox) {
    console.error("❌ MOVEN: Missing DOM elements for Mission Control.");
    return;
  }

  try {
    systemStatusBox.textContent = "Connecting…";

    // -----------------------------
    // CARRIERS
    // -----------------------------
    const carriers = await getSheetData("carriers");
    carriersBox.textContent = carriers.length;
    console.log(`🚚 MOVEN: ${carriers.length} carriers loaded`);

    // -----------------------------
    // LOADS
    // -----------------------------
    const loads = await getSheetData("loads");

    // Until we build smart logic:
    // Active Loads = total rows in the LOADS sheet
    loadsBox.textContent = loads.length;
    console.log(`📦 MOVEN: ${loads.length} loads loaded`);

    // -----------------------------
    // STATUS
    // -----------------------------
    systemStatusBox.textContent = "Live";
  } catch (error) {
    systemStatusBox.textContent = "Disconnected";
    console.error("❌ MOVEN Mission Control failed to sync:", error);
  }
};
