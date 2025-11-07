// MOVEN Logistics - Serverless Sheet Fetcher (Netlify Function)
import fetch from "node-fetch";

export const handler = async (event, context) => {
  const proxy = "https://api.allorigins.win/raw?url=";

  const sheets = {
    finance: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Finance%20Dashboard",
    compliance: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Compliance%20Tracker",
    loads: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Loads",
    carriers: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Carriers",
    factoring: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Factoring",
  };

  try {
    // Fetch the Carriers sheet as the current data source
    const response = await fetch(`${proxy}${encodeURIComponent(sheets.carriers)}`);
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

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
    console.error("Error fetching Zoho sheet:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
