/* ============================================================
   MOVEN COMMAND — SHEETS.JS (Clean Version)
   Frontend → Netlify → CSV → JSON loader
   ============================================================ */

function parseCsvToJson(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .split("\n")
    .filter((ln) => ln.trim().length > 0)
    .map((row) =>
      row
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((v) => v.replace(/^"|"$/g, ""))
    );

  if (lines.length === 0) return [];

  const headers = lines.shift();

  return lines.map((line) =>
    Object.fromEntries(headers.map((h, i) => [h.trim(), line[i] || ""]))
  );
}

/**
 * Generic sheet data loader (from v2 Netlify Function)
 * @param {string} key
 */
export async function getSheetData(key) {
  try {
    const url = `/.netlify/functions/fetch-sheets-v2?sheet=${key}`;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      console.error(`❌ ${key.toUpperCase()} HTTP Error:`, res.status);
      return [];
    }

    if (text.trim().startsWith("{") && text.includes("error")) {
      console.error(`❌ ${key.toUpperCase()} Backend Error:`, text);
      return [];
    }

    const json = parseCsvToJson(text);
    console.log(`✅ MOVEN ${key}: ${json.length} rows loaded`);
    return json;
  } catch (err) {
    console.error(`❌ MOVEN ${key} load failed:`, err);
    return [];
  }
}
