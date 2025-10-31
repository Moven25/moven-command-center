// MOVEN Command: Secure Google Sheet Proxy via Netlify Function
// Created for MOVEN Logistics LLC to ensure Safari and CORS compatibility.

export async function handler() {
  // ✅ Your live Google Sheet CSV link
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdcXbvm083qFfqzDN5f7LrrmCoEkfYhUED6s11EFTyVEgEtgny3X02zFnFqc85H60b-7pWUEE/pub?gid=0&single=true&output=csv";

  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*", // ✅ allows MOVEN domain access
      },
      body: data,
    };
  } catch (err) {
    console.error("❌ Error fetching Google Sheet:", err);
    return {
      statusCode: 500,
      body: `Error fetching sheet data: ${err.message}`,
    };
  }
}
