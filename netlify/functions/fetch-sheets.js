// MOVEN Logistics — Zoho CSV Fetcher (Netlify Function)
// Forces Zoho CSV output and falls back safely if HTML is returned.

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

    // 🔗 BASE ZOHO URLS (your published links, as-is)
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

    const baseUrl = SHEETS[sheetKey];

    if (!baseUrl) {
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

    // 🧠 FORCE CSV VERSION OF THE URL
    const buildCsvUrl = (url) => {
      try {
        const u = new URL(url);
        if (u.searchParams.has("type")) u.searchParams.set("type", "csv");
        if (u.searchParams.has("format")) u.searchParams.set("format", "csv");
        if (!u.searchParams.has("type") && !u.searchParams.has("format")) {
          u.searchParams.set("format", "csv");
        }
        return u.toString();
      } catch {
        // Fallback if URL() fails for any reason
        if (url.includes("type=grid")) return url.replace("type=grid", "type=csv");
        if (url.includes("?")) return url + "&format=csv";
        return url + "?format=csv";
      }
    };

    const csvUrl = buildCsvUrl(baseUrl);

    // 🔄 FUNCTION TO FETCH & PARSE CSV
    const fetchAndParse = async (urlToUse) => {
      const response = await fetch(urlToUse);
      const text = await response.text();

      // If Zoho still gave us HTML, signal that so we can try fallback
      const trimmed = text.trim().toLowerCase();
      if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) {
        return { isHtml: true, data: text };
      }

      // 🧮 PARSE CSV → JSON
      const rows = text
        .replace(/\r/g, "")
        .split("\n")
        .map((row) =>
          row
            .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map((v) => v.replace(/^"|"$/g, ""))
        )
        .filter((row) => row.length > 1);

      if (!rows.length) return { isHtml: false, json: [] };

      const headers = rows.shift();
      const json = rows.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] || ""]))
      );

      return { isHtml: false, json };
    };

    // 1️⃣ Try forced-CSV URL first
    let result = await fetchAndParse(csvUrl);

    // 2️⃣ Fallback: if Zoho still gave HTML, try the base URL as-is
    if (result.isHtml) {
      result = await fetchAndParse(baseUrl);
    }

    if (result.isHtml) {
      // Still HTML after both attempts — bail with clear error
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
            "Check Zoho publishing settings and ensure CSV export is enabled.",
        }),
      };
    }

    // ✅ SUCCESS — RETURN JSON
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        },
      body: JSON.stringify(result.json),
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
