// MOVEN Command: Secure Google Sheet Proxy via Netlify Function
// Ensures Safari & Chrome compatibility for MOVEN Logistics
// MOVEN Command live sync test - rebuild trigger
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdKCxbvnD3G8qfZW3DdNS7xlrmmcGelkf9UEDEJ1O0F7By8Et0gyyX3O22xFp0cJ1k5Q0-7tV4E6YV/pub?output=csv"}

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
