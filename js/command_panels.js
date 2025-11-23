/* ================================================================
   MOVEN COMMAND CENTER — Mission Control Panels JS
   Clean / Works with dashboard.html
================================================================== */

async function initMissionControl() {
  console.log("🟡 MOVEN: Initializing Mission Control...");

  const carriersBox = document.querySelector("#totalCarriers");
  const loadsBox = document.querySelector("#activeLoads");
  const systemStatusBox = document.querySelector("#systemStatus");
  const loadPanel = document.querySelector("#activeLoadsPanel");

  // ---------- FIXED LINE ----------
  const missing = [];
  if (!carriersBox) missing.push("#totalCarriers");
  if (!loadsBox) missing.push("#activeLoads");
  if (!systemStatusBox) missing.push("#systemStatus");
  if (!loadPanel) missing.push("#activeLoadsPanel");

  if (missing.length > 0) {
    console.error("❌ Missing Mission Control DOM Elements:", missing.join(", "));
    return;
  }
  // ---------------------------------

  systemStatusBox.textContent = "Connecting...";

  try {
    // ---- Carriers ----
    const carriers = await getSheetData("carriers");
    carriersBox.textContent = carriers.length;

    // ---- Loads ----
    const loads = await getSheetData("loads");
    loadsBox.textContent = loads.length;

    // Render load list inside panel
    loadPanel.innerHTML = loads
      .map(load => `
        <div class="load-row">
          <strong>${load.Carrier || "Unknown Carrier"}</strong><br>
          ${load.Shipper || ""} → ${load.Receiver || ""}<br>
          RPM: ${load.RPM || "0"} | Revenue: $${load.Revenue || "0"}
        </div>
      `)
      .join("");

    systemStatusBox.textContent = "Live";
    console.log("🟢 MOVEN Mission Control: LIVE");

  } catch (err) {
    systemStatusBox.textContent = "Disconnected";
    console.error("❌ MOVEN Mission Control Sync Failed:", err);
  }
}

/* ================================================================
   PANEL LOADER
================================================================== */
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

console.log("✔ MOVEN Command Panels JS Loaded");
