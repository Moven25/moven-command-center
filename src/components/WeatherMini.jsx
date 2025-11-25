import React from "react";
import "./WeatherMini.css";

function WeatherMini({ city, temperature }) {
  return (
    <div className="weather-card">
      <h3 className="panel-title">Weather</h3>
      <div className="weather-icon">☁️</div>
      <div className="weather-temp">{temperature}°</div>
      <div className="weather-city">{city}</div>
    </div>
  );
}

export default WeatherMini;
