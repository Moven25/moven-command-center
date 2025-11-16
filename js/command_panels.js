// ---------------------------------------------------------
//  MOVEN COMMAND CENTER — Mission Control Sync Logic
// ---------------------------------------------------------

// Load CSV from Netlify function
async function getSheetData(sheetName) {
    const response = await fetch(`/.netlify/functions/fetch-sheets?sheet=${sheetName}`);
    const csv = await response.text();

    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',');

    return rows.slice(1).map(row => {
        const values = row.split(',');
        let obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : "";
        });
        return obj;
    });
}

// ---------------------------------------------------------
//  NEW: Mission Control initializer
// ---------------------------------------------------------
async function initMissionControl() {
    console.log("🚀 MOVEN: Initializing Mission Control...");

    const carriersBox = document.querySelector("#totalCarriers .summary-value");
    const loadsBox = document.querySelector("#activeLoads .summary-value");
    const systemStatusBox = document.querySelector("#systemStatus .summary-value");

    if (!carriersBox || !loadsBox || !systemStatusBox) {
        console.error("❌ MOVEN ERROR: Mission Control DOM elements missing.");
        return;
    }

    try {
        systemStatusBox.textContent = "Connecting...";

        // CARRIERS
        const carriers = await getSheetData("carriers");
        carriersBox.textContent = carriers.length;
        console.log(`📦 MOVEN: Loaded ${carriers.length} carriers.`);

        // LOADS
        const loads = await getSheetData("loads");
        loadsBox.textContent = loads.length;
        console.log(`🚚 MOVEN: Loaded ${loads.length} loads.`);

        // STATUS
        systemStatusBox.textContent = "Live";
        console.log("🟢 MOVEN Mission Control: LIVE");
    }
    catch (err) {
        systemStatusBox.textContent = "Disconnected";
        console.error("❌ MOVEN Sync Failed:", err);
    }
}

// ---------------------------------------------------------
//  EXISTING PANEL LOADER — MODIFIED
// ---------------------------------------------------------
function loadPanel(panelId) {
    let panels = document.querySelectorAll(".panel-content");
    panels.forEach(panel => panel.style.display = "none");

    let panel = document.getElementById(panelId);
    if (panel) panel.style.display = "block";

    // 🔥 NEW: Trigger MC load ONLY when Mission Control is displayed
    if (panelId === "missionControl") {
        initMissionControl();
    }
}

// ---------------------------------------------------------
// Remove the old window.onload block COMPLETELY.
// Mission Control now loads ONLY when selected.
// ---------------------------------------------------------

console.log("⚡ MOVEN Command Panel JS Loaded");
