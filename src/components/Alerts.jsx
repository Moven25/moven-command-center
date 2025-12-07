import React from "react";
import "./WeatherMini.css";

export default function Alerts({ items = [] }) {
  return (
    <div className="mc-alerts" role="feed" aria-live="polite">
      <ul className="mc-alerts-list">
        {items.length ? (
          items.map((a, i) => <li key={i}>{a}</li>)
        ) : (
          <li className="muted">No alerts</li>
        )}
      </ul>
    </div>
  );
}