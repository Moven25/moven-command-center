// MOVEN Logistics — Correct Zoho CSV Fetcher (Netlify Function)

import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const sheet = event.queryStringParameters.sheet;

    if (!sheet) {
      return {
        statusCode: 400,
        body: "Missing ?sheet= parameter",
      };
    }

    // ---- Correct Published Zoho CSV URLs (LIVE) ----
    const SHEETS = {
      carriers:
        "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers",

      brokers:
        "https://sheet.zohopublic.com/sheet/published/r5bi8514462e4b06047a389067c81fc922a9d?download=csv&sheetname=brokers",

      compliance:
        "https://sheet.zohopublic.com/sheet/published/r5bi8909cd72a89b04bfe862b1f7fb9d39893?download=csv&sheetname=compliance",

      factoring:
        "https://sheet.zohopublic.com/sheet/published/r5bi89708d8394fc448fb8a09f9e795af0666?download=csv&sheetname=factoring",

      // Keeping the correct LOADS link (unless you republished it)
      loads:
        "https://sheet.zohopublic.com/sheet/published/r5bi8958cb54439fb4fd48c17e9a2ff99795b?download=csv&sheetname=loads",
    };

    const url = SHEETS[sheet];

    if (!url) {
      return {
        statusCode: 400,
        body: `Invalid sheet name: ${sheet}`,
      };
    }

    // ---- Fetch the CSV from Zoho ----
    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Error fetching ${sheet} CSV: ${response.statusText}`,
      };
    }

    const csvData = await response.text();

    // ---- CORS Enabled for MOVEN Frontend ----
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: csvData,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Server error: ${error.message}`,
    };
  }
};
