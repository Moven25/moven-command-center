// MOVEN Command: Secure Google Sheet Proxy via Netlify Function
// Updated for Netlify ESM compatibility (2025)

export default async (req, context) => 
  const CARRIERS_CSV_PATH = './data/Carriers.csv';

  try {
    const response = await fetch(SHEET_URL, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    console.error("❌ Error fetching Google Sheet:", err);
    return new Response(`Error fetching sheet data: ${err.message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      }
    });
  }
};
