/* ============================================================
   MOVEN COMMAND — SHEETS.JS (FIXED by Codex)
   Fully working Zoho → Netlify → MOVEN flow
   ============================================================ */

import { SHEETS } from "./config.js";

/* Clean BOM + proper CSV parsing */
function parseCSV(csvText) {
  const cleaned = csvText.replace(/^\uFEFF/, ""); // remove BOM

  const rows = cleaned
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);

  const headers = rows[0].split(",").map(h => h.trim());

  return rows.slice(1).map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ? values[i].trim() : "";
    });
    return row;
  });
}

/* Fetch via Netlify and PASS THE URL */
export async function getSheetData(name, url) {
  try {
    const encoded = encodeURIComponent(url);

    const response = await fetch(
      `/.netlify/functions/fetch-sheets?url=${encoded}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);

    console.log(`✅ MOVEN ${name} — ${data.length} rows loaded`);
    return data;

  } catch (error) {
    console.error(`❌ MOVEN ${name} failed:`, error);
    return [];
  }
}
