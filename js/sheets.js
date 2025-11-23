/* ============================================================
   MOVEN COMMAND — SHEETS.JS (Clean Version)
   Frontend → Netlify Function → CSV → JSON loader
   ============================================================ */

(function() {

  function parseCsvToJson(csvText) {
    const lines = csvText
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .split("\n")
      .filter(ln => ln.trim().length > 0)
      .map(row =>
        row
          .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
          .map(v => v.replace(/^"|"$/g, ""))
      );

    if (lines.length === 0) return [];

    const headers = lines.shift();

    return lines.map(row =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] || ""]))
    );
  }

  // -----------------------------------------------------------
  //  Public loader attached to window
  // -----------------------------------------------------------
  window.getSheetData = async function(key) {
    try {
      const url = const url = /.netlify/functions/fetch-sheets?sheet=${key}

      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        console.error(`❌ HTTP error loading ${key}:`, res.status);
        return [];
      }

      // Catch backend error JSON
      if (text.trim().startsWith("{") && text.includes("error")) {
        console.error(`❌ Backend responded with error for ${key}:`, text);
        return [];
      }

      const json = parseCsvToJson(text);
      console.log(`✅ MOVEN ${key.toUpperCase()} → ${json.length} rows`);
      return json;

    } catch (err) {
      console.error(`❌ MOVEN load failed for ${key}:`, err);
      return [];
    }
  };

})();
