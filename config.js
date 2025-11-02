/* ==========================================================
   MOVEN COMMAND — CONFIG.JS
   Six Zoho Sheet Tabs Integrated (Live CSV Feeds)
   ========================================================== */

const SHEETS = {
  carriers: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Carriers",
  brokers: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Brokers",
  factoring: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Factoring",
  loads: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Loads",
  compliance: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Compliance Tracker",
  finance: "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Finance Dashboard"
};

/* ==========================================================
   FETCH AND SYNC FUNCTION
   ========================================================== */

async function fetchSheetData(name, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const csvData = await response.text();
    const rows = csvData
      .split(/\r?\n/)
      .map(r => r.split(","))
      .filter(r => r.length > 1);

    console.log(`✅ MOVEN ${name.toUpperCase()} Data Loaded (${rows.length} rows)`);
    return rows;
  } catch (err) {
    console.error(`❌ MOVEN ${name.toUpperCase()} Data Fetch Error:`, err);
    return [];
  }
}

/* ==========================================================
   MASTER SYNC — Load All Data
   ========================================================== */

async function MOVEN_SyncAll() {
  console.log("🔄 Starting MOVEN Command Data Sync...");

  const data = {};
  for (const [key, url] of Object.entries(SHEETS)) {
    data[key] = await fetchSheetData(key, url);
  }

  console.log("✅ MOVEN Data Sync Completed Successfully", data);
  // Optional: trigger UI updates here, e.g. updateDashboard(data);
}

// Initialize sync
MOVEN_SyncAll();
