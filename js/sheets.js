// MOVEN Command Center - Google Sheets Live Data
// MOVEN Command Center — Live Carrier Data Feed
const MOVEN_CARRIERS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdKCxbvnD3G8qfZW3DdNS7xlrmmcGelkf9UEDEJ1O0F7By8Et0gyyX3O22xFpOcJ1k5Q0-7tV4E6YV/pub?gid=1944593323&single=true&output=csv";

async function loadCarrierData() {
  try {
    const response = await fetch(MOVEN_CARRIERS_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1); // Skip header row
    const carriers = rows.map(r => r.split(",")).filter(r => r[0].trim() !== "");

    const total = carriers.length;
    document.querySelector("#totalCarriers .summary-value").textContent = total;
    console.log("✅ Carrier data loaded successfully:", total, "records found.");
  } catch (err) {
    console.error("❌ Error loading carrier data:", err);
  }
}

window.addEventListener("load", loadCarrierData);  }
}

window.addEventListener("load", loadCarrierData);async function loadSheetData() {
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const response = await fetch(endpoint);
  const data = await response.json();

  if (!data.values) {
    console.error("No data found in sheet.");
    return;
  }

  // Example: Show number of carriers on Mission Control
  const carrierCount = data.values.length - 1; // exclude header row
  document.getElementById("missionControl").innerHTML = `
    <h2>Mission Control</h2>
    <p>Overview of carriers, loads, and alerts.</p>
    <p><strong>Total Carriers:</strong> ${carrierCount}</p>
  `;
  console.log("✅ Google Sheets data loaded successfully.");
}

window.addEventListener("load", loadSheetData);
