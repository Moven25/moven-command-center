/* ============================================================
   MOVEN COMMAND — SHEETS.JS
   Zoho → Netlify → MOVEN data loader
   ============================================================ */

import { SHEETS } from "../config.js";

/* Clean BOM + proper CSV parsing */
function parseCSV(csvText) {
  const cleaned = csvText.replace(/^\uFEFF/, ""); // remove BOM if present

  const rows = cleaned
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);

  if (rows.length === 0) return [];

  const headers = rows[0].split(",").map(h => h.trim());

  return rows.slice(1).map(row => {
    const cols = row.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] || "").trim();
    });
    return obj;
  });
}

/**
 * Generic sheet loader
 * @param {string} key - one of: "carriers", "brokers", "loads", "compliance", "factoring"
 */
export async function getSheetData(key) {
  try {
    const url = SHEETS[key];
    if (!url) {
      throw new Error(`Unknown sheet key: ${key}`);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);

    console.log(`✅ MOVEN ${key} — ${data.length} rows loaded`);
    return data;
  } catch (error) {
    console.error(`❌ MOVEN ${key} failed:`, error);
    return [];
  }
}
