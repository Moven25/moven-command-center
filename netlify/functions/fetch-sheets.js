// MOVEN Command: Secure Zoho Sheet Proxy via Netlify Function
// Updated for Netlify ESM compatibility (2025)

export default async (req, context) => {
  const ZOHO_SHEET_URL = "https://sheet.zohopublic.com/sheet/published/11wj393dbcd8644A4719b79c89353de104977d/download=.csv";
  
  try {
    const response = await fetch(ZOHO_SHEET_URL, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) throw new Error(`Fetch failed ${response.status}`);

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching Zoho Sheet:", err);
    return new Response(`Error fetching Zoho Sheet data: ${err.message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain",
      },
    });
  }
};
