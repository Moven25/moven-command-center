import React from "react";
import "./Tile.css";

function Tile({ title, value, sub }) {
  return (
    <div className="tile">
      <h4 className="tile-title">{title}</h4>
      <p className="tile-value">{value}</p>
      <span className="tile-sub">{sub}</span>
    </div>
  );
}

export default Tile;
