// MOVEN Logistics — Zoho CSV Fetcher v2 (Netlify Function)
// Uses Zoho "Download as CSV" links and returns clean JSON.
// Usage example:
//   /.netlify/functions/fetch-sheets-v2?sheet=carriers

export const handler = async (event) => {
  try {
    const sheetKey = event.queryStringParameters?.sheet;

    if (!sheetKey) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Missing ?sheet= parameter" }),
      };
    }

    // 🔗 DIRECT CSV DOWNLOAD LINKS FROM ZOHO
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=CARRIERS_MASTER",
      loads:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=LOADS_ACTIVE",
      brokers:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=BROKERS_MASTER",
      ratecons:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=RATECON_ARCHIVE",
      profit:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=PROFIT_CALCULATOR",
      dtl:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=DTL_ENGINE",
      pipeline:
        "https://sheet.zohopublic.com/sheet/published/grvkfc10caaf7dd82421fb161edc79bb57ac2?download=csv&sheetname=NEW_CARRIER_PIPELINE",
    };

    const url = SHEETS[sheetKey];

    if (!url) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: `Unknown sheet '${sheetKey}'. Valid options: ${Object.keys(
            SHEETS
          ).join(", ")}`,
        }),
      };
    }

    // Small helper to parse CSV into JSON
    const parseCsvToJson = (csvText) => {
      const rows = csvText
        .replace(/\r/g, "")
        .split("\n")
        .map((row) =>
          row
            .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map((v) => v.replace(/^"|"$/g, ""))
        )
        .filter((row) => row.length > 1);

      if (!rows.length) return [];

      const headers = rows.shift();
      return rows.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] || ""]))
      );
    };

    // 🔄 FETCH CSV FROM ZOHO
    const response = await fetch(url);
    const text = await response.text();

    const trimmed = text.trim().toLowerCase();
    if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) {
      // Failsafe: Zoho sent HTML again
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Zoho returned HTML instead of CSV for this sheet.",
          sheet: sheetKey,
          hint:
            "Double-check the Download as .csv setting in Zoho's Publish window.",
        }),
      };
    }

    const json = parseCsvToJson(text);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(json),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Server error",
        details: err.message,
      }),
    };
  }
};
