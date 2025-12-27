// MOVEN Logistics - Zoho CSV Fetcher (Netlify Function)
// Uses native fetch (NO node-fetch)

export const handler = async (event) => {
  try {
    const sheet = event.queryStringParameters?.sheet;

    if (!sheet) {
      return {
        statusCode: 400,
        body: "Missing 'sheet' parameter",
      };
    }

    // ✅ LIVE Zoho published CSV URLs
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers",
      loads:
        "https://sheet.zohopublic.com/sheet/published/r5bi8958cb54439fb4fd48c17e9a2ff99795?download=csv&sheetname=loads",
      brokers:
        "https://sheet.zohopublic.com/sheet/published/r5bi8514462e4b06047a389067c81fc922a9d?download=csv&sheetname=brokers",
      compliance:
        "https://sheet.zohopublic.com/sheet/published/r5bi899cd72a89b04bfe862b1f7fb9d39893?download=csv&sheetname=compliance",
      factoring:
        "https://sheet.zohopublic.com/sheet/published/r5bi87908d8394fc448fb8a09f9e795af0666?download=csv&sheetname=factoring",
    };

    const url = SHEETS[sheet];

    if (!url) {
      return {
        statusCode: 400,
        body: `Invalid sheet name: ${sheet}`,
      };
    }

    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Zoho fetch failed for ${sheet}`,
      };
    }

    const csv = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
      },
      body: csv,
    };
  } catch (err) {
    console.error("fetch-sheets error:", err);
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
};
