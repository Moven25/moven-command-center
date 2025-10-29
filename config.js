window.MOVEN_CONFIG = {
  ACCESS_CODE: "Moven2026",
  SHEET_PUBLISH_ID: "2PACX-1vS7NEayV6hx1p...etc",
  TABS: {
    market_power: "0",
    seasonal_flow: "14134614949",
    lane_command: "18126850609",
    fleet_checkin: "1361074404",
    fuel_zones: "339724569"
  },
  ALERT_THRESHOLDS: {
    market_delta_pts: 10,
    fuel_delta_usd: 0.15,
    idle_hours: 24,
    nws_levels: ["Advisory", "Watch", "Warning"]
  }
};

// --- Dummy Data Mode for MOVEN Command ---
window.MOVEN_DUMMY = {
  carriers: [
    { name: "Titan Freight LLC", trucks: 5, status: "Active", mc: "123456", dot: "789012" },
    { name: "Empire Hauling", trucks: 3, status: "Pending", mc: "654321", dot: "210987" },
    { name: "Alpha Logistics", trucks: 7, status: "Active", mc: "987654", dot: "345678" }
  ],
  loads: [
    { origin: "Dallas, TX", destination: "Chicago, IL", rate: "$2,450", status: "In Transit" },
    { origin: "Atlanta, GA", destination: "Houston, TX", rate: "$1,850", status: "Delivered" },
    { origin: "Los Angeles, CA", destination: "Phoenix, AZ", rate: "$1,200", status: "Assigned" }
  ],
  alerts: [
    { type: "Insurance Expiring", carrier: "Empire Hauling", days_left: 7 },
    { type: "Inactive MC", carrier: "Alpha Logistics", days_left: 3 }
  ]
};

console.log("MOVEN Command config loaded successfully");
