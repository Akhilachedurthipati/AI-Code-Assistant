import React from "react";

const LANGUAGES = [
  { id: "Python", name: "Python" },
  { id: "Java", name: "Java" },
  { id: "C", name: "C" },
  { id: "C++", name: "C++" },
  { id: "JavaScript", name: "JavaScript" },
  { id: "HTML", name: "HTML" },
  { id: "CSS", name: "CSS" },
  { id: "SQL", name: "SQL" }
];

export default function CodeInput({
  language,
  setLanguage,
  feature,
  code,
  setCode,
  request,
  setRequest,
  error,
  setError,
  onSubmit,
  onClear,
  loading
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="code-input-form">
      <div className="input-group">
        <label htmlFor="language-select">Programming Language</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading}
          className="select-input"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {feature === "GENERATE" && (
        <div className="input-group">
          <label htmlFor="request-textarea">Coding Request</label>
          <textarea
            id="request-textarea"
            rows={4}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="e.g. Write a program to check whether a number is prime."
            disabled={loading}
            className="textarea-input"
            required
          />
        </div>
      )}

      {feature !== "GENERATE" && (
        <div className="input-group">
          <label htmlFor="code-textarea">
            {feature === "COMPLETE" ? "Incomplete Code" : "Source Code"}
          </label>
          <textarea
            id="code-textarea"
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              feature === "COMPLETE"
                ? "Paste incomplete or partial code here..."
                : "Paste your code here..."
            }
            disabled={loading}
            className="textarea-input code-font"
            required
          />
        </div>
      )}

      {feature === "DEBUG" && (
        <div className="input-group">
          <label htmlFor="error-input">Error Message (Optional)</label>
          <input
            id="error-input"
            type="text"
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="e.g. IndexError: list index out of range"
            disabled={loading}
            className="text-input"
          />
        </div>
      )}

      <div className="action-buttons">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-container">
              <span className="spinner"></span> Working...
            </span>
          ) : (
            "Submit"
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClear}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
