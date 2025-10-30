// MOVEN Command Center — Live Carrier Data Feed
const MOVEN_CARRIERS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdKCxbvnD3G8qfZW3DdNS7xlrmmcGelkf9UEDEJ1O0F7By8Et0gyyX3O22xFpOcJ1k5Q0-7tV4E6Yv/pub?gid=1944593323&single=true&output=csv";

async function loadCarrierData() {
  try {
    const response = await fetch(MOVEN_CARRIERS_URL);
    const csv = await response.text();
    const rows = csv.split("\n").slice(1); // Skip header row
    const carriers = rows.map(r => r.split(",")).filter(r => r[0].trim() !== "");
    const total = carriers.length;

    document.querySelector("#totalCarriers .summary-value").textContent = total;
    console.log("✅ Carrier data loaded successfully:", total, "records found.");
  } catch (err) {
    console.error("❌ Error loading carrier data:", err);
  }
}

window.addEventListener("load", loadCarrierData);
