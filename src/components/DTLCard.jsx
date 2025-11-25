import React from "react";
import "./DTLCard.css";

function DTLCard() {
  return (
    <div className="dtl-card">
      <h3 className="panel-title">DTL</h3>
      <div className="dtl-info">Double Triangle Routing Active</div>
      <div className="dtl-mini">Leg 1 → Leg 2 → Leg 3</div>
    </div>
  );
}

export default DTLCard;
