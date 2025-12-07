import React from "react";
import "./Tile.css";


const Tile = ({ title, value, color }) => (
  <div className="tile-b2" style={{ borderColor: color }}>
    <div className="tile-title-b2">{title}</div>
    <div className="tile-value-b2" style={{ color }}>{value}</div>
  </div>
);

export default Tile;
