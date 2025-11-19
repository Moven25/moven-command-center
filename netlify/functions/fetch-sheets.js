// MOVEN Logistics — Zoho CSV Fetcher (Netlify Function)
// Fetches CSV data from Zoho and returns clean JSON.
// Usage example:
// /.netlify/functions/fetch-sheets?sheet=carriers

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

    // 🔗 MAP YOUR SHEET KEYS → ZOHO URL ENDPOINTS
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/publishedsheet/50190852366d11164d2d1427b7aff6e38b49e186b3ce82b0fa37b3a0c9a719c3?type=grid",

      loads:
        "https://sheet.zohopublic.com/sheet/publishedsheet/d1352aa05f091e9cd1ce26db78b927c251cfcbf0f7814e0b55307513f2d33a91?type=grid",

      brokers:
        "https://sheet.zohopublic.com/sheet/publishedsheet/1df1956eea01800e754b2752f509ad038197907c6d986280951ac79f7a330c3f?type=grid",

      ratecons:
        "https://sheet.zohopublic.com/sheet/publishedsheet/97eab4fbb153922c99df2fc5840abdbcecf9670547e2ff6d136899050334a247?type=grid",

      profit:
        "https://sheet.zohopublic.com/sheet/publishedsheet/66759c5bde38f4a712573f344c691825a60b16fa22857d8f08797591e1bb43d7?type=grid",

      dtl:
        "https://sheet.zohopublic.com/sheet/publishedsheet/820f9cfb8ac79a656c4337bf0a071081ec124cbab9678b4ea622f1b94084572d?type=grid",

      pipeline:
        "https://sheet.zohopublic.com/sheet/publishedsheet/c98da21325083a5e9cc8abf750e25c13fe645248d7bbf9e07b0836dce354f0d8?type=grid",
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

    // 🔄 FETCH FROM ZOHO
    const response = await fetch(url);
    const csvText = await response.text();

    // 🧮 PARSE CSV → JSON
    const rows = csvText
      .replace(/\r/g, "")
      .split("\n")
      .map((row) =>
        row
          .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
          .map((v) => v.replace(/^"|"$/g, ""))
      )
      .filter((row) => row.length > 1);

    const headers = rows.shift();
    const json = rows.map((row) =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] || ""]))
    );

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
