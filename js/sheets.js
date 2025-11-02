/* ==========================================================
   MOVEN COMMAND — SHEETS.JS
   Handles fetching, parsing, and rendering all data from config.js
   ========================================================== */

// Import sheet URLs
import { SHEETS } from "./config.js";

/* ==========================================================
   Utility: Convert CSV text → Array of objects
   ========================================================== */
function parseCSV(csvText) {
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => (row[h] = values[i] ? values[i].trim() : ""));
    return row;
  });
}

/* ==========================================================
   Fetch and Parse Sheet Data
   ========================================================== */
async function getSheetData(name, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();
    const data = parseCSV(csvText);
    console.log(`✅ MOVEN ${name.toUpperCase()} — ${data.length} rows loaded`);
    return data;
  } catch (error) {
    console.error(`❌ MOVEN ${name.toUpperCase()} load failed:`, error);
    return [];
  }
}

/* ==========================================================
   Render Data into HTML Tables
   ========================================================== */
function renderTable(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No data available.</p>`;
    return;
  }

  const headers = Object.keys(data[0]);
  const table = document.createElement("table");
  table.className =
    "min-w-full border-collapse border border-gray-400 text-sm text-left";

  // Header
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>${headers
    .map(h => `<th class="border border-gray-300 p-2 bg-gray-100">${h}</th>`)
    .join("")}</tr>`;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = headers
      .map(
        h =>
          `<td class="border border-gray-200 p-2">${row[h] || "&nbsp;"}</td>`
      )
      .join("");
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.innerHTML = "";
  container.appendChild(table);
}

/* ==========================================================
   Main: Load and Render All Sheets
   ========================================================== */
async function MOVEN_LoadAllSheets() {
  console.log("🔄 MOVEN: Loading all sheets...");
  const results = {};

  for (const [name, url] of Object.entries(SHEETS)) {
    const data = await getSheetData(name, url);
    results[name] = data;
    renderTable(`table-${name}`, data);
  }

  console.log("✅ MOVEN: All sheets rendered successfully", results);
}

// Initialize
MOVEN_LoadAllSheets();
