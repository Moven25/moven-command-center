// MOVEN Logistics — Unified Zoho CSV Fetcher (Backend)
// Netlify Serverless Function (fetch-sheets.js)

import fetch from "node-fetch";

const SHEET_URLS = {
  carriers: "https://sheet.zohopublic.com/sheet/published/r5bi868ad2b6435ff4c4ba0148b976aa3de9d?download=csv&sheetname=carriers",
  loads: "https://sheet.zoho.com/sheet/published/r5bi8958cb54439fb4fd48c17e9a2ff99795b?download=csv&sheetname=loads",
  brokers: "https://sheet.zohopublic.com/sheet/published/r5bi8514462e4b06047a389067c81fc922a9d?download=csv&sheetname=brokers",
  factoring: "https://sheet.zohopublic.com/sheet/published/r5bi89708d8394fc448fb8a09f9e795af0666?download=csv&sheetname=factoring",
  compliance: "https://sheet.zohopublic.com/sheet/published/r5bi8909cd72a89b04bfe862b1f7fb9d39893?download=csv&sheetname=compliance",
  insurance: "https://sheet.zohopublic.com/sheet/published/r5bi89eeec6a1278249a5966cd124d9202b99?download=csv&sheetname=insurance",
  driver_status: "https://sheet.zohopublic.com/sheet/published/r5bi821d4bacc172a48dfa8c2a635f7d83fc2?download=csv&sheetname=driver_status",
  equipment: "https://sheet.zohopublic.com/sheet/published/r5bi8b7473fae70084cb69fffbb7755606a12?download=csv&sheetname=equipment",
  authority: "https://sheet.zohopublic.com/sheet/published/r5bi88ab4cb25480a47139b0863daebabe1d5?download=csv&sheetname=authority"
};

export const handler = async (event) => {
  try {
    const sheet = event.queryStringParameters.sheet;

    if (!sheet || !SHEET_URLS[sheet]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid sheet key", sheet })
      };
    }

    const url = SHEET_URLS[sheet];
    console.log("Fetching CSV:", url);

    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Fetch failed", status: response.status })
      };
    }

    const csv = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: csv
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
