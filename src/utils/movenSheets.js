// /src/utils/movenSheets.js
// MOVEN Logistics — React Fetch Helpers

const API_BASE = "/.netlify/functions";

export async function fetchSheet(sheetName) {
  try {
    const url = `${API_BASE}/fetch-sheets?sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ Failed fetching ${sheetName}`, res.status);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data;
  } catch (err) {
    console.error(`❌ MOVEN Fetch Failed (${sheetName})`, err);
    return [];
  }
}

export const movenSheets = {
  carriers: () => fetchSheet("carriers"),
  loads: () => fetchSheet("loads"),
  brokers: () => fetchSheet("brokers"),
  factoring: () => fetchSheet("factoring"),
  compliance: () => fetchSheet("compliance"),
  drivers: () => fetchSheet("drivers")
};
