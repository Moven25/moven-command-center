export const handler = async (event) => {
  try {
    const sheet = event.queryStringParameters?.sheet;

    if (!sheet) {
      return { statusCode: 400, body: "Missing 'sheet' parameter" };
    }

    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers"
    };

    const url = SHEETS[sheet];

    if (!url) {
      return { statusCode: 400, body: `Invalid sheet name: ${sheet}` };
    }

    const response = await fetch(url);

    if (!response.ok) {
      return { statusCode: response.status, body: `Zoho fetch failed for ${sheet}` };
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
    return { statusCode: 500, body: "Internal server error" };
  }
};

