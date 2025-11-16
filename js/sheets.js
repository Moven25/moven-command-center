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

  // Make sure elements exist
  if (!carriersBox || !loadsBox || !systemStatusBox) {
    console.error("❌ MOVEN: One or more Mission Control elements not found in DOM.");
    return;
  }

  try {
    systemStatusBox.textContent = "Connecting…";

    // ====== CARRIERS ======
    const carriers = await getSheetData("carriers");
    const totalCarriers = carriers.length; // each row is a carrier
    carriersBox.textContent = totalCarriers;

    console.log(`🚚 MOVEN Mission Control — ${totalCarriers} carriers loaded.`);

    // ====== LOADS ======
    const loads = await getSheetData("loads");

    // For now: Active Loads = total rows (later we can filter by Status column)
    const activeLoads = loads.length;
    loadsBox.textContent = activeLoads;

    console.log(`📦 MOVEN Mission Control — ${activeLoads} loads loaded.`);

    // ====== STATUS ======
    systemStatusBox.textContent = "Live";
  } catch (error) {
    systemStatusBox.textContent = "Disconnected";
    console.error("❌ MOVEN Mission Control sync failed:", error);
  }
};
