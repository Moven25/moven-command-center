// ===========================================================
// MOVEN Command Center — Live Carrier Data Feed
// Safari + Chrome Compatible | Auto-Fallback | 2025 Edition
// ===========================================================

// ✅ 1. Live data feed (via Netlify proxy)
const MOVEN_CARRIERS_URL = "netlify/functions/fetch-sheets";

// ✅ 2. Local backup feed (only used if Google Sheet fails)
const MOVEN_FALLBACK_URL = "/data/backup_carriers.csv";

// ✅ 3. Load carrier data with fallback handling
async function loadCarrierData() {
  console.log("🚀 MOVEN Command initializing data sync...");

  try {
    // --- Attempt live Google Sheet fetch ---
    const response = await fetch(MOVEN_CARRIERS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Google Sheet HTTP ${response.status}`);

    const csv = await response.text();
    processCarrierData(csv, "🟢 Live Google Sheet connected.");
  } catch (err) {
    console.warn("⚠️ Google Sheet load failed. Switching to fallback CSV.", err);

    try {
      // --- Attempt local backup ---
      const backup = await fetch(MOVEN_FALLBACK_URL, { cache: "no-store" });
      if (!backup.ok) throw new Error(`Fallback HTTP ${backup.status}`);

      const csv = await backup.text();
      processCarrierData(csv, "🟡 Fallback data loaded successfully.");
    } catch (fallbackErr) {
      console.error("❌ Error loading fallback data:", fallbackErr);
      showError("Data unavailable — please check connection or Sheet access.");
    }
  }
}

// ✅ 4. Parse and process CSV data
function processCarrierData(csvText, successMessage) {
  const rows = csvText.split("\n").slice(1).filter(r => r.trim() !== "");
  const total = rows.length;

  // Update dashboard
  const totalDisplay = document.querySelector("#TotalCarriers .summary-value");
  if (totalDisplay) totalDisplay.textContent = total;

  console.log(successMessage);
  console.log(`📊 Total carriers loaded: ${total}`);
}

// ✅ 5. Show error messages cleanly
function showError(message) {
  const el = document.querySelector("#TotalCarriers .summary-value");
  if (el) el.textContent = "0";
  console.error(message);
}

// ✅ 6. Initialize data load when dashboard opens
window.addEventListener("load", loadCarrierData);
