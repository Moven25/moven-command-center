// MOVEN Command Center — Live Carrier Data Feed with Auto-Fallback (Safari + Chrome Compatible)

const MOVEN_CARRIERS_URL = "/.netlify/functions/fetch-sheet";
// Fallback CSV (hosted on Netlify in /data folder)
const MOVEN_FALLBACK_URL = "/data/backup_carriers.csv";

async function loadCarrierData() {
  try {
    console.log("🚚 MOVEN Command initializing data sync...");

    // Attempt live Google Sheet fetch
    const response = await fetch(MOVEN_CARRIERS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Google Sheet HTTP ${response.status}`);

    const csv = await response.text();
    processCarrierData(csv, "✅ Live Google Sheet connected.");

  } catch (err) {
    console.warn("⚠️ Google Sheet load failed. Switching to fallback CSV.", err);

    try {
      // Try loading fallback CSV
      const backup = await fetch(MOVEN_FALLBACK_URL, { cache: "no-store" });
      if (!backup.ok) throw new Error(`Fallback HTTP ${backup.status}`);

      const csv = await backup.text();
      processCarrierData(csv, "🗂️ Fallback data loaded successfully.");

    } catch (fallbackErr) {
      console.error("❌ Error loading fallback data:", fallbackErr);
      showError("Data unavailable — please check connection or Sheet access.");
    }
  }
}

function processCarrierData(csv, msg) {
  const rows = csv.split("\n").slice(1); // Skip header row
  const carriers = rows.map(r => r.split(",")).filter(r => r[0].trim() !== "");
  const total = carriers.length;

  const totalEl = document.querySelector("#totalCarriers .summary-value");
  if (totalEl) {
    totalEl.textContent = total;
    console.log(`${msg} ${total} records found.`);
  } else {
    console.warn("⚠️ Carrier counter element not found in DOM.");
  }
}

function showError(message) {
  const panel = document.querySelector("#totalCarriers .summary-value");
  if (panel) {
    panel.textContent = "—";
    panel.style.color = "#D2222A";
  }
  alert(`MOVEN Command Notice: ${message}`);
}

window.addEventListener("load", loadCarrierData);
