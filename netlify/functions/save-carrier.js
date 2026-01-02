import fetch from "node-fetch";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders };
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

    const {
      name,
      mc,
      dot,
      phone,
      email,
    } = payload;

    if (!name) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: "Carrier name is required",
      };
    }

    const row = [
      name,
      mc || "",
      dot || "",
      phone || "",
      email || "",
      new Date().toISOString(),
    ];

    const zohoRes = await fetch(
      `https://sheet.zoho.com/api/v2/${process.env.ZOHO_SHEET_ID}/worksheets/${process.env.ZOHO_WORKSHEET_NAME}/rows`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: [{ cells: row.map(v => ({ value: v })) }],
        }),
      }
    );

    const text = await zohoRes.text();

    if (!zohoRes.ok) {
      console.error("Zoho error:", text);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: "Zoho write failed",
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true }),
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }
};
