// netlify/functions/fetch-sheets.js
// MOVEN Logistics — Zoho CSV Fetcher (Netlify Function, CommonJS)

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };
}

function parseCSV(csvText) {
  // Simple CSV parser that handles quoted values.
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((c) => String(c).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  // last cell
  row.push(cur);
  if (row.some((c) => String(c).trim() !== "")) rows.push(row);

  if (!rows.length) return [];

  const headers = rows[0].map((h) => String(h || "").trim());
  const dataRows = rows.slice(1);

  return dataRows.map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h || `col_${idx}`] = r[idx] ?? "";
    });
    return obj;
  });
}

// IMPORTANT:
// These KEYS must match what the frontend calls: carriers, loads, brokers, compliance, factoring
// And each URL must be the *Download as CSV* published link from Zoho.
const SHEETS = {
  // ✅ You showed this one in your screenshot (carriers)
  carriers:
    "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers",

  // ⚠️ Replace these 4 with YOUR CURRENT published CSV links (exactly)
  loads:
    "https://sheet.zoho.com/sheet/published/r5bi8958cb54439fb4fd48c17e9a2ff99795b?download=csv&sheetname=loads",
  brokers:
    "https://sheet.zohopublic.com/sheet/published/r5bi8514462e4b06047a389067c81fc922a9d?download=csv&sheetname=brokers",
  compliance:
    "https://sheet.zohopublic.com/sheet/published/r5bi8909cd72a89b04bfe862b1f7fb9d39893?download=csv&sheetname=compliance",
  factoring:
    "https://sheet.zohopublic.com/sheet/published/r5bi89708d8394fc448fb8a09f9e795af0666?download=csv&sheetname=factoring"
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  try {
    const sheet = event.queryStringParameters?.sheet;

    if (!sheet) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: 'Missing "sheet" parameter. Use ?sheet=carriers',
        }),
      };
    }

    const url = SHEETS[sheet];
    if (!url || String(url).includes("PASTE_YOUR_")) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: `Invalid sheet name: ${sheet}. Or URL not set in fetch-sheets.js`,
          validSheets: Object.keys(SHEETS),
        }),
      };
    }

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: `Zoho fetch failed for "${sheet}"`,
          status: res.status,
          hint:
            "Make sure the Zoho sheet is published and the URL is the downloadable CSV link.",
          zohoResponseSnippet: text.slice(0, 300),
        }),
      };
    }

    const csv = await res.text();
    const json = parseCSV(csv);

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ sheet, rows: json }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: "Server error in fetch-sheets",
        message: err?.message || String(err),
      }),
    };
  }
};
