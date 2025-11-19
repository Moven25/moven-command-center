/* ============================================================
   MOVEN COMMAND — SHEETS.JS (Frontend Loader)
   Frontend → Netlify → JSON loader
   ============================================================ */

(function () {
  /**
   * Generic sheet data loader (from v2 Netlify Function)
   * @param {string} key
   * @returns {Promise<Array<Object>>}
   */
  window.getSheetData = async function (key) {
    try {
      const url = `/.netlify/functions/fetch-sheets-v2?sheet=${key}`;

      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        console.error(`❌ ${key.toUpperCase()} HTTP Error:`, res.status);
        return [];
      }

      // If backend returned an error JSON
      if (text.trim().startsWith("{") && text.includes('"error"')) {
        console.error(`❌ ${key.toUpperCase()} Backend Error:`, text);
        return [];
      }

      // Normal case: JSON array from Netlify function
      const data = JSON.parse(text);
      console.log(`✅ MOVEN ${key}: ${data.length} rows loaded`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`❌ MOVEN ${key} load failed:`, err);
      return [];
    }
  };
})();
