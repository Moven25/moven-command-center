/* ============================================================
   MOVEN COMMAND CONFIG.JS
   Centralized source mapping for Zoho CSV endpoints
   ============================================================ */

const ZOHO_BASE =
  "https://sheet.zohopublic.com/sheet/published/11wip393dbcbd8644A4719b79c89353de10497?download=.csv&sheetname=";

export const SHEETS = {
  carriers: ZOHO_BASE + "Carriers",
  brokers: ZOHO_BASE + "Brokers",
  factoring: ZOHO_BASE + "Factoring",
  loads: ZOHO_BASE + "Loads",
  compliance: ZOHO_BASE + "Compliance%20Tracker",
  finance: ZOHO_BASE + "Finance%20Dashboard"
};

export const SETTINGS = {
  proxy: "https://api.allorigins.win/raw?url=", // safely bypasses CORS
  updateInterval: 60000 // refresh every 60 seconds
};
