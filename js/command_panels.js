// ========================================
// MOVEN Command Panels (Phase 2 Core Framework)
// ========================================

import { getSheetData } from "./sheets.js";  // 👈 Add this import

function loadPanel(panelId) {
  const panels = document.querySelectorAll(".panel-content");
  panels.forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}

// Default open Mission Control
window.onload = async () => {
  loadPanel("missionControl");
  document.getElementById("missionControl").style.display = "block";
  console.log("✅ MOVEN Command Panel Loaded - initializing live data sync...");

  // ====== LIVE DATA SYNC FOR MISSION CONTROL ======
  const totalBox = document.querySelector("#totalCarriers");
  const statusBox = document.querySelector("#status");

  try {
    statusBox.textContent = "Connecting...";
    statusBox.style.color = "#ffcc00";

    const carriers = await getSheetData("Carriers");
    const totalCarriers = carriers.length > 0 ? carriers.length - 1 : 0;

    totalBox.textContent = totalCarriers;
    statusBox.textContent = "Connected";
    statusBox.style.color = "#00ff00";

    console.log(`🚚 MOVEN Mission Control synced — ${totalCarriers} carriers loaded.`);
  } catch (error) {
    statusBox.textContent = "Disconnected";
    statusBox.style.color = "red";
    console.error("❌ MOVEN Mission Control sync failed:", error);
  }
};
