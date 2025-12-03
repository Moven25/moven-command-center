// MOVEN Logistics — Save Carrier Profile (Full Sync Stub)
// This receives updated carrier data from the React app.
// Next step will be to write this into Zoho via their API.

import fetch from "node-fetch";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed",
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");

    console.log("🔴 MOVEN — incoming carrier save payload:");
    console.log(JSON.stringify(payload, null, 2));

    const { carrierId, carrier, status } = payload;

    if (!carrierId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: "Missing carrierId in payload",
      };
    }

    // TODO: this is where we will:
    // 1) Look up the row for carrierId in Zoho
    // 2) Update the row with carrier + status fields using Zoho Sheet API

    // For now, just echo back success so the UI knows it worked.
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        message: "Payload received, ready for Zoho write-back.",
      }),
    };
  } catch (err) {
    console.error("Save-carrier error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `Server error: ${err.message}`,
    };
  }
};
