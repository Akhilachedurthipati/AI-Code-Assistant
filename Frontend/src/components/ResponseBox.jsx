import React, { useState } from "react";

export default function ResponseBox({ feature, response, apiError }) {
  const [copied, setCopied] = useState(false);

  if (apiError) {
    return (
      <div className="error-box">
        <span className="error-icon">⚠️</span>
        <div className="error-content">
          <h4>Execution Error</h4>
          <p>{apiError}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="empty-response-box">
        <div className="empty-state-icon">🤖</div>
        <p>No response yet. Fill in the inputs on the left and click submit.</p>
      </div>
    );
  }

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCodeBlock = (codeString, title = "Source Code") => {
    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-block-title">{title}</span>
          <button
            type="button"
            className="btn-copy"
            onClick={() => handleCopy(codeString)}
          >
            {copied ? "Copied! ✓" : "Copy Code"}
          </button>
        </div>
        <pre className="code-block-pre">
          <code>{codeString}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="response-box-container">
      <h3 className="response-title">AI Assistant Response</h3>

      {feature === "GENERATE" && (
        <div className="response-layout">
          {response.code && renderCodeBlock(response.code, "Generated Code")}
          {response.explanation && (
            <div className="explanation-section">
              <h4>Explanation</h4>
              <p>{response.explanation}</p>
            </div>
          )}
        </div>
      )}

      {feature === "EXPLAIN" && (
        <div className="response-layout">
          {response.explanation && (
            <div className="explanation-section">
              <h4>Explanation & Logic</h4>
              <p className="whitespace-pre-wrap">{response.explanation}</p>
            </div>
          )}
        </div>
      )}

      {feature === "DEBUG" && (
        <div className="response-layout">
          {response.error && (
            <div className="debug-meta-item error-details">
              <h4>Identified Error</h4>
              <p>{response.error}</p>
            </div>
          )}
          {response.explanation && (
            <div className="debug-meta-item error-explanation">
              <h4>Why This Occurs</h4>
              <p>{response.explanation}</p>
            </div>
          )}
          {response.corrected_code && renderCodeBlock(response.corrected_code, "Corrected Code")}
          {response.suggestion && (
            <div className="debug-meta-item error-suggestion">
              <h4>💡 Suggestion</h4>
              <p>{response.suggestion}</p>
            </div>
          )}
        </div>
      )}

      {feature === "COMPLETE" && (
        <div className="response-layout">
          {response.completed_code && renderCodeBlock(response.completed_code, "Completed Code")}
          {response.explanation && (
            <div className="explanation-section">
              <h4>Completion Details</h4>
              <p>{response.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
