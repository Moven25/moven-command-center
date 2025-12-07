import React from "react";
import "./WeatherMini.css";

export default function WeatherMini({ city = "—", temp = "—", icon = "☀️" }) {
  return (
    <div className="weather-card" role="group" aria-label={`Weather ${city}`}>
      <div className="weather-icon" aria-hidden>{icon}</div>
      <div className="weather-temp">{temp}</div>
      <div className="weather-city">{city}</div>
    </div>
  );
}
