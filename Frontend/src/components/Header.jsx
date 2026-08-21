import React from "react";

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-logo">
        <span className="logo-sparkle">✨</span>
        <h1 className="header-title">AI Code Assistant</h1>
      </div>
      <p className="header-subtitle">
        Your smart pairing partner for code generation, explanation, debugging, and completion.
      </p>
    </header>
  );
}
