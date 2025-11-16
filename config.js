/* 
====================================================
 MOVEN COMMAND CONFIG.JS
 Centralized source mapping for Netlify CSV endpoints
====================================================
*/

export const API_BASE = "/.netlify/functions/fetch-sheets?sheet=";

export const SHEETS = {
  carriers: API_BASE + "carriers",
  brokers: API_BASE + "brokers",
  loads: API_BASE + "loads",
  compliance: API_BASE + "compliance",
  factoring: API_BASE + "factoring"
};

export const SETTINGS = {
  updateInterval: 60000 // refresh every 60 seconds
};
