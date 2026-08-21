import React from "react";

const FEATURES = [
  { id: "GENERATE", label: "Generate Code", icon: "💻" },
  { id: "EXPLAIN", label: "Explain Code", icon: "🔍" },
  { id: "DEBUG", label: "Debug Code", icon: "🛠️" },
  { id: "COMPLETE", label: "Complete Code", icon: "🧩" }
];

export default function FeatureSelector({ activeFeature, setActiveFeature, disabled }) {
  return (
    <div className="feature-selector-container">
      {FEATURES.map((feat) => {
        const isActive = activeFeature === feat.id;
        return (
          <button
            key={feat.id}
            type="button"
            className={`feature-tab ${isActive ? "active" : ""}`}
            onClick={() => !disabled && setActiveFeature(feat.id)}
            disabled={disabled}
          >
            <span className="feature-icon">{feat.icon}</span>
            <span className="feature-label">{feat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
