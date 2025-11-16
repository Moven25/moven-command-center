// MOVEN Logistics — Correct Zoho CSV Fetcher (Netlify Function)

export const handler = async (event) => {
  try {
    const sheet = event.queryStringParameters.sheet;

    if (!sheet) {
      return {
        statusCode: 400,
        body: "Missing ?sheet= parameter",
      };
    }

    // --- Correct Published Zoho CSV URLs ---
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Carriers",
      brokers:
        "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Brokers",
      loads:
        "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Loads",
      compliance:
        "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Compliance%20Tracker",
      factoring:
        "https://sheet.zohopublic.com/sheet/published/11wip393dbcdd86444719b79c893530e1d9f7?download=csv&sheetname=Factoring",
    };

    const url = SHEETS[sheet];

    if (!url) {
      return {
        statusCode: 400,
        body: `Invalid sheet name: ${sheet}`,
      };
    }

    // Fetch Zoho CSV directly (Netlify handles CORS)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Zoho fetch failed (${response.status})`);
    }

    const csv = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/csv",
      },
      body: csv,
    };
  } catch (error) {
    console.error("ERROR in fetch-sheets.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
