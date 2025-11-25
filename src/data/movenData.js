// src/data/movenData.js

const movenData = {
  // ===============================
  // LIVE SYSTEM METRICS
  // ===============================
  weeklyRevenue: 0,
  weeklyAvgRPM: 0,
  loadsDispatchedToday: 0,

  // ===============================
  // ACTIVITY LOG (FULL OBJECTS)
  // ===============================
  activity: [],

  // ===============================
  // UPDATE FUNCTIONS
  // ===============================
  updateWeeklyRevenue(amount) {
    this.weeklyRevenue += amount;
  },

  updateWeeklyAvgRPM(rpm) {
    this.weeklyAvgRPM = rpm;
  },

  updateLoadsDispatched() {
    this.loadsDispatchedToday += 1;
  },

  // Accepts full objects
  addActivity(entry) {
    this.activity.unshift(entry);
    if (this.activity.length > 50) {
      this.activity.pop();
    }
  }
};

export default movenData;

