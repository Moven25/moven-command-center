import React from "react";
import "../App.css";
import WeatherMini from "../components/WeatherMini";

const Weather = () => {
  return (
    <div className="page-root">
      <h1>Weather Command</h1>
      <p>Detailed weather views for routes and loads.</p>
      <div style={{ maxWidth: 420 }}>
        <WeatherMini />
      </div>
    </div>
  );
};

export default Weather;
