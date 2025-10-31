// MOVEN Command: Secure Google Sheet Proxy via Netlify Function
// Ensures Safari & Chrome compatibility for MOVEN Logistics
// MOVEN Command live sync test - rebuild trigger
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdcXbvm083qFfqzDN5f7LrmcEkfYhUBEDs11FFyVEtGnygX3X2nFqCd5HG6M-7JWEE/pub?gid=0&single=true&output=csv";

  try {
    const response = await fetch(SHEET_URL, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*", // ✅ allows MOVEN Command access
      },
      body: data,
    };
  } catch (err) {
    console.error("❌ Error fetching Google Sheet:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain",
      },
      body: `Error fetching sheet data: ${err.message}`,
    };
  }
}
