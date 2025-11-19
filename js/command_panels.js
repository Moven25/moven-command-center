// ---------------------------------------------------------
//  MOVEN COMMAND CENTER — Mission Control Sync Logic (Clean)
//  Uses fetch-sheets-v2 + new sheets.js loader
// ---------------------------------------------------------

// ⛔ NO imports here – we use the global getSheetData from sheets.js

async function initMissionControl() {
    console.log("🚀 MOVEN: Initializing Mission Control...");

    const carriersBox = document.querySelector("#totalCarriers");
    const loadsBox = document.querySelector("#activeLoads");
    const systemStatusBox = document.querySelector("#systemStatus");

    if (!carriersBox || !loadsBox || !systemStatusBox) {
        console.error("❌ MOVEN ERROR: Mission Control DOM elements missing.");
        return;
    }

    try {
        systemStatusBox.textContent = "Connecting...";

        const carriers = await getSheetData("carriers");
        carriersBox.textContent = carriers.length;

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
