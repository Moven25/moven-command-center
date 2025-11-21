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

    // --- CLEAN, UPDATED, REAL-TIME ZOHO CSV LINKS ---
    const SHEETS = {
      carriers: "https://sheet.zohopublic.com/sheet/published/vq6yna2ad12fbe72946f18c0b08b7f35f4de5?download=csv&sheetname=Sheet1",
      brokers: "https://sheet.zohopublic.com/sheet/published/vq6yn39d82da95fdd4e39a15b015fcb531025?download=csv&sheetname=Sheet1",
      loads: "https://sheet.zohopublic.com/sheet/published/vq6ynb406f6561f444927bd7044d538588051?download=csv&sheetname=Sheet1",
      compliance: "https://sheet.zohopublic.com/sheet/published/vq6yn5eaae746fd134676a01453882325226c?download=csv&sheetname=Sheet1",
      factoring: "https://sheet.zohopublic.com/sheet/published/vq6yn1ff4dce85b0345da8ded5d0add258f74?download=csv&sheetname=Sheet1",
      driverstatus: "https://sheet.zohopublic.com/sheet/published/vq6yn32a55f4e9ef445cfb7d85faae9b27587?download=csv&sheetname=Sheet1",
    };

    const url = SHEETS[sheet];

    if (!url) {
      return {
        statusCode: 400,
        body: `Invalid sheet name: ${sheet}`,
      };
    }

    // Debug log (optional)
    console.log("Fetching Zoho CSV from:", url);

    // Fetch the CSV
    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: 500,
        body: `Error fetching CSV from Zoho: ${response.statusText}`,
      };
    }

    const csvText = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
      },
      body: csvText,
    };

  } catch (error) {
    console.error("Fetch error:", error);

    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
