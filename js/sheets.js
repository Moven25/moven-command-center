// MOVEN Command Center - Google Sheets Live Data
const SHEET_ID = "1NCXtVxmWZd6-ySN3cVAJSMxnZKEQWNbXGcREn-lIyzw";  // Your sheet
const SHEET_NAME = "MOVEN_Carriers";    // Starting tab (Adjust if needed)
const API_KEY = "YOUR_API_KEY_HERE";    // Replace with your actual API Key

async function loadSheetData() {
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
