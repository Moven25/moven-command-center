// src/utils/movenSheets.js
const BASE_URL = "https://command.movenlogistics.com/.netlify/functions/fetch-sheets";

function trimBOM(s) {
  return s && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

// Basic CSV parser supporting quoted fields (commas inside quotes) and trimming
function parseCSV(text) {
  if (!text || typeof text !== "string") return [];
  text = trimBOM(text).replace(/\r/g, "");

  const rows = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        // escaped quote
        cur += '"';
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cur += '\t'; // field separator placeholder
      continue;
    }
    if ((ch === '\n' || i === text.length - 1) && !inQuotes) {
      // add last char if last index
      if (i === text.length - 1 && ch !== '\n') cur += ch;
      // split by placeholder
      rows.push(cur.split('\t').map((c) => (c || '').trim()));
      cur = '';
      continue;
    }
    cur += ch;
  }

  // handle trailing newline absence
  if (cur.length) rows.push(cur.split('\t').map((c) => (c || '').trim()));

  return rows.filter((r) => r.length && !(r.length === 1 && r[0] === ""));
}

async function fetchSheet(sheetName) {
  try {
    const res = await fetch(`${BASE_URL}?sheet=${sheetName}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${sheetName}: ${res.status}`);
    }
    const text = await res.text();
    if (!text) return [];

    const rows = parseCSV(text);
    if (!rows || rows.length === 0) return [];

    const headers = rows[0].map((h) => (h || '').trim());
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] != null ? row[i] : "";
      });
      return obj;
    });
    return data;
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

export { parseCSV };
