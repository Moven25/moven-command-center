import React from "react";
import "./WeatherMini.css";

export default function Alerts({ items = [] }) {
  return (
  <div className="alerts-b2">
    <div className="alerts-title-b2">Alerts Feed</div>
    <ul className="alerts-list-b2">
      {items.length ? (
        items.map((alert, i) => <li key={i} className="alerts-item-b2">{alert}</li>)
      ) : (
        <li className="alerts-item-b2 muted">No alerts</li>
      )}
    </ul>
  </div>
);

export default Alerts;
  ;
}