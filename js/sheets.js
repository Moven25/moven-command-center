
/* ============================================================
   MOVEN COMMAND — SHEETS.JS
   Handles fetching, parsing, and rendering all data from config.js
   ============================================================ */

import { SHEETS, SETTINGS } from "./config.js";

/* Utility: Convert CSV text → Array of objects */
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

/* Fetch and Parse Sheet Data — CORS-safe */
export async function getSheetData(name, url) {
  try {
    const fullUrl = SETTINGS.proxy + encodeURIComponent(url);
    const response = await fetch(fullUrl);
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

/* Render Data into HTML Tables (if applicable) */
export function renderTable(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No data available.</p>`;
    return;
  }

  const headers = Object.keys(data[0]);
  const table = document.createElement("table");
  table.className = "w-full border-collapse border border-gray-400 text-sm text-left";

  // Header
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>${headers
    .map(h => `<th class="border border-gray-400 px-2 py-1 bg-gray-200">${h}</th>`)
    .join("")}</tr>`;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");
  tbody.innerHTML = data
    .map(
      row =>
        `<tr>${headers
          .map(h => `<td class="border border-gray-300 px-2 py-1">${row[h] || ""}</td>`)
          .join("")}</tr>`
    )
    .join("");
  table.appendChild(tbody);

  container.innerHTML = "";
  container.appendChild(table);
}
