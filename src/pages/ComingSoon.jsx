// src/pages/ComingSoon.jsx
import React from "react";
import "./ComingSoon.css";

export default function ComingSoon({
  title = "Coming Soon",
  subtitle = "This module is being built next.",
  bullets = [],
}) {
  return (
    <div className="comingSoon">
      <div className="comingSoon__panel">
        <div className="comingSoon__top">
          <div className="comingSoon__title">{title}</div>
          <div className="comingSoon__badge">Module</div>
        </div>

        <div className="comingSoon__sub">{subtitle}</div>

        {bullets?.length > 0 ? (
          <ul className="comingSoon__list">
            {bullets.map((b, i) => (
              <li key={i} className="comingSoon__item">
                <span className="comingSoon__dot" />
                <span className="comingSoon__text">{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="comingSoon__hint">
            Tip: Keep building Mission Control + Lane Command first, then we’ll
            wire real data into this module.
          </div>
        )}
      </div>
    </div>
  );
}
