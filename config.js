/* ==========================================================
   MOVEN COMMAND — CONFIG.JS
   Integrated with six live Zoho Sheet data feeds
   ========================================================== */

const SHEETS = {
  carriers: "https://sheet.zohopublic.com/sheet/publishedsheet/b60b377df24d88912965f213a1a968fc5c7d20076367611e1ddcc3bd2eaa9717?format=csv",
  brokers: "https://sheet.zohopublic.com/sheet/publishedsheet/40ea75fd22a57c01c387830b680d858b34d438876d1eec406351a9056b2eeddf?format=csv",
  factoring: "https://sheet.zohopublic.com/sheet/publishedsheet/7db4450b9864fc3b0669b8abb46ad715fdb66b49226e3001910f7b61fc2ce04b?format=csv",
  loads: "https://sheet.zohopublic.com/sheet/publishedsheet/72ccc5052eb831b3b15268edc8e4b7ccc465954e4ff146bb65d4439f5ae4019e?format=csv",
  compliance: "https://sheet.zohopublic.com/sheet/publishedsheet/515c28909397dc37bf6f4f2a9d328c02568d8306ce5fbc5187d8ed9f5a9fb830?format=csv",
  finance: "https://sheet.zohopublic.com/sheet/publishedsheet/5decf929e1dddcd56d8585a70993c709735a781b21ec3499f314aeb4e0e311f5?format=csv"
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

MOVEN_SyncAll();
