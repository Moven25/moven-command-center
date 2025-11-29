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

    // --- Published Zoho CSV URLs (Correct + Updated) ---
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers",

      loads:
        "https://sheet.zoho.com/sheet/published/r5bi8958cb54439fb4fd48c17e9a2ff99795b?download=csv&sheetname=loads",

      brokers:
        "https://sheet.zohopublic.com/sheet/published/r5bi8514462e4b06047a389067c81fc922a9d?download=csv&sheetname=brokers",

      factoring:
        "https://sheet.zohopublic.com/sheet/published/r5bi89708d8394fc448fb8a09f9e795af0666?download=csv&sheetname=factoring",

      compliance:
        "https://sheet.zohopublic.com/sheet/published/r5bi8909cd72a89b04bfe862b1f7fb9d39893?download=csv&sheetname=compliance",
    };

    // If sheet key doesn't exist
    if (!SHEETS[sheet]) {
      return {
        statusCode: 404,
        body: `Unknown sheet: ${sheet}`,
      };
    }

    // Fetch CSV file
    const response = await fetch(SHEETS[sheet]);
    const csvData = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
      },
      body: csvData,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error fetching sheet: ${error.message}`,
    };
  }
};
