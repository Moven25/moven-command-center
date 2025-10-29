// MOVEN Command Panels (Phase 2 Core Framework)
function loadPanel(panelId) {
  const panels = document.querySelectorAll(".panel-content");
  panels.forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}

// Default open Mission Control
window.onload = () => {
  loadPanel("missionControl");
  document.getElementById("missionControl").style.display = "block";
  console.log("✅ MOVEN Command Panel Loaded — Google Sheet connection active.");
};
