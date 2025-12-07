// src/utils/movenSheets.js

const BASE_URL = "https://command.movenlogistics.com/.netlify/functions/fetch-sheets";

// Unified fetcher
async function fetchSheet(sheetName) {
  try {
    const res = await fetch(`${BASE_URL}?sheet=${sheetName}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${sheetName}: ${res.status}`);
    }

    const text = await res.text();

    // Convert CSV to objects
    const rows = text
      .trim()
      .split("\n")
      .map((line) => line.split(","));

    const headers = rows.shift();

    return rows.map((row) =>
      Object.fromEntries(
        headers.map((h, i) => [h.trim(), row[i] ? row[i].trim() : ""])
      )
    );
  } catch (err) {
    console.error(`❌ MOVEN Sheets Error (${sheetName}):`, err);
    return [];
  }
}

// THIS is what Dashboard.jsx expects
const movenSheets = {
  carriers: () => fetchSheet("carriers"),
  loads: () => fetchSheet("loads"),
  brokers: () => fetchSheet("brokers"),
  factoring: () => fetchSheet("factoring"),
  compliance: () => fetchSheet("compliance"),
  driver_status: () => fetchSheet("driver_status"),
};

export default movenSheets;

export const getSheet = async (sheetId) => {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sheet:', error);
    return null;
  }
};

// Ensure that the CSV parsing function is correctly defined and used
export const parseCSV = (data) => {
  if (typeof data !== 'string') {
    throw new TypeError('Expected a string for CSV data');
  }
  const rows = data.split('\n');
  return rows.map(row => row.split(','));
};
