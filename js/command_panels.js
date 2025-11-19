/* ============================================================
   MOVEN COMMAND CENTER — Mission Control Panels JS
   Clean / No ES Modules / Works in all browsers
   ============================================================ */

async function initMissionControl() {
  console.log("🚀 MOVEN: Initializing Mission Control...");

  const carriersBox = document.querySelector("#totalCarriers");
  const loadsBox = document.querySelector("#activeLoads");
  const systemStatusBox = document.querySelector("#systemStatus");

  if (!carriersBox || !loadsBox || !systemStatusBox) {
    console.error("❌ Missing Mission Control DOM Elements.");
    return;
  }

  systemStatusBox.textContent = "Connecting...";

  try {
    // --- CARRIERS ---
    const carriers = await getSheetData("carriers");
    carriersBox.textContent = carriers.length;

    // --- LOADS ---
    const loads = await getSheetData("loads");
    loadsBox.textContent = loads.length;

    systemStatusBox.textContent = "Live";
    console.log("🟢 MOVEN Mission Control: LIVE");

  } catch (err) {
    systemStatusBox.textContent = "Disconnected";
    console.error("❌ MOVEN Mission Control Sync Failed:", err);
  }
}

/* -----------------------------------------------------------
   PANEL LOADER
----------------------------------------------------------- */
function loadPanel(panelId) {
  document.querySelectorAll(".panel-content").forEach(p => {
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
