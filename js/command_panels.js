/* ============================================================
   MOVEN COMMAND CENTER — Mission Control Panels JS
   Clean / No ES Modules / Works in all browsers
===============================================================*/

async function initMissionControl() {
    console.log("🚀 MOVEN: Initializing Mission Control...");

    const carriersBox = document.querySelector("#totalCarriers .summary-value");
    const loadsBox = document.querySelector("#activeLoads .summary-value");
    const systemStatusBox = document.querySelector("#systemStatus .summary-value");
    const activeLoadsPanel = document.getElementById("activeLoadsPanel");

    if (!carriersBox || !loadsBox || !systemStatusBox || !activeLoadsPanel) {
        console.error("❌ Missing Mission Control DOM Elements.");
        return;
    }

    systemStatusBox.textContent = "Connecting...";

    try {
        // ---------------- CARRIERS ----------------
        const carriers = await getSheetData("carriers");
        carriersBox.textContent = carriers.length;

        // ---------------- LOADS -------------------
        const loads = await getSheetData("loads");
        loadsBox.textContent = loads.length;

        // ----- RENDER ACTIVE LOADS -----
        activeLoadsPanel.innerHTML = "";
        if (loads.length === 0) {
            activeLoadsPanel.innerHTML = "<p>No active loads.</p>";
        } else {
            loads.forEach(load => {
                const div = document.createElement("div");
                div.className = "load-card";
                div.innerHTML = `
                    <strong>${load.Origin || "Origin"} → ${load.Destination || "Destination"}</strong><br>
                    RPM: ${load.RPM || "0"}<br>
                    Rate: $${load.Revenue || "0"}<br>
                    Date: ${load.Date || "N/A"}
                `;
                activeLoadsPanel.appendChild(div);
            });
        }

        systemStatusBox.textContent = "Live";
        console.log("🟢 MOVEN Mission Control: LIVE");

    } catch (err) {
        systemStatusBox.textContent = "Disconnected";
        console.error("❌ MOVEN Mission Control Sync Failed:", err);
    }
}

/* ============================================================
   PANEL LOADER
===============================================================*/

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

console.log("✨ MOVEN Command Panels JS Loaded");
