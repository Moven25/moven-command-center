// MOVEN Logistics - Zoho Sheet Connections (CORS-safe)

const proxy = "https://api.allorigins.win/raw?url=";

const sheets = {
  finance: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Finance%20Dashboard",
  compliance: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Compliance%20Tracker",
  loads: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Loads",
  carriers: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Carriers",
  factoring: "https://sheet.zohopublic.com/sheet/published/5dec9292e1dadcd56d685a70993c709753a781b21e3c34997314aeb40e63115?download=csv&sheetname=Factoring"
};

// Example fetch test (Carriers)
fetch(`${proxy}${encodeURIComponent(sheets.carriers)}`)
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.text();
  })
  .then(data => {
    console.log("Carriers CSV loaded successfully!");
    console.log(data); // remove or replace with data parsing logic
  })
  .catch(error => console.error("Error loading carriers data:", error));
