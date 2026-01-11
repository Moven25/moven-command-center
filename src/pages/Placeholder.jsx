import React from "react";

export default function PlaceholderPage({ title }) {
  return (
    <div className="card">
      <div className="cardTitle">{title}</div>
      <div className="muted" style={{ marginTop: 8 }}>
        This section button works. Next we can build this module’s page.
      </div>
    </div>
  );
}
