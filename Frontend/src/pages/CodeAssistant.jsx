import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage, fetchSessions, fetchSessionHistory } from "../services/api";

// Simple syntax highlighter function for code blocks
const highlightSyntax = (code, language) => {
  if (!code) return "";
  const lang = language ? language.toLowerCase() : "";
  
  // Safe HTML escape
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  if (lang === "python" || lang === "py") {
    const regex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(def|class|import|from|return|if|else|elif|for|while|in|try|except|with|as|and|or|not|is|None|True|False|print)\b|\b(\d+)\b/g;
    escaped = escaped.replace(regex, (match, comment, string, keyword, number) => {
      if (comment !== undefined) return `<span class="code-comment">${comment}</span>`;
      if (string !== undefined) return `<span class="code-string">${string}</span>`;
      if (keyword !== undefined) return `<span class="code-keyword">${keyword}</span>`;
      if (number !== undefined) return `<span class="code-number">${number}</span>`;
      return match;
    });
  } else if (lang === "javascript" || lang === "js" || lang === "html" || lang === "css") {
    const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|class|import|export|from|default|return|if|else|for|while|switch|case|break|continue|try|catch|finally|true|false|null|undefined|new|this|typeof|instanceof)\b|\b(\d+)\b/g;
    escaped = escaped.replace(regex, (match, comment, string, keyword, number) => {
      if (comment !== undefined) return `<span class="code-comment">${comment}</span>`;
      if (string !== undefined) return `<span class="code-string">${string}</span>`;
      if (keyword !== undefined) return `<span class="code-keyword">${keyword}</span>`;
      if (number !== undefined) return `<span class="code-number">${number}</span>`;
      return match;
    });
  } else if (lang === "java" || lang === "c" || lang === "cpp" || lang === "c++") {
    const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(public|private|protected|class|interface|extends|implements|import|package|void|int|double|float|long|short|byte|char|boolean|if|else|for|while|do|switch|case|break|continue|return|new|this|super|true|false|null|static|final|const|struct|include)\b|\b(\d+)\b/g;
    escaped = escaped.replace(regex, (match, comment, string, keyword, number) => {
      if (comment !== undefined) return `<span class="code-comment">${comment}</span>`;
      if (string !== undefined) return `<span class="code-string">${string}</span>`;
      if (keyword !== undefined) return `<span class="code-keyword">${keyword}</span>`;
      if (number !== undefined) return `<span class="code-number">${number}</span>`;
      return match;
    });
  }
  
  return escaped;
};

// Formatted Code Block component with Copy button
function CodeBlock({ content, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleanContent = content.replace(/^[\r\n]+|[\r\n]+$/g, "");
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlightSyntax(content, language);
  
  // Format language: capitalize first letter (e.g. python -> Python)
  const formattedLanguage = language
    ? language.charAt(0).toUpperCase() + language.slice(1).toLowerCase()
    : "Code";

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <div className="code-block-title-wrapper">
          <span className="code-block-tag-icon">&lt;/&gt;</span>
          <span className="code-block-title">{formattedLanguage}</span>
        </div>
        <div className="code-block-actions">
          <button
            type="button"
            className={`btn-icon-copy ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            title="Copy Code"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
          <button
            type="button"
            className="btn-run"
            onClick={() => alert("Code execution simulated successfully!")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="run-play-icon">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Run</span>
          </button>
        </div>
      </div>
      <pre className="code-block-pre">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export default function CodeAssistant() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [apiError, setApiError] = useState(null);

  const messagesEndRef = useRef(null);

  // Generate unique session ID
  const generateSessionId = () => {
    return "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  // Initialize session on mount
  useEffect(() => {
    const newSessId = generateSessionId();
    setSessionId(newSessId);
    loadSessionsData();
  }, []);

  // Scroll to bottom whenever messages or loading change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessionsData = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to load sessions list: ", err);
    }
  };

  // Handle message submission
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setApiError(null);

    // 1. Instantly append user message to local state
    const newUserMsg = { role: "user", message: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      // 2. Format history for payload
      const historyPayload = messages.map((m) => ({
        role: m.role,
        message: m.message
      }));

      // 3. Make POST request to fastapi backend
      const result = await sendChatMessage({
        session_id: sessionId,
        message: userText,
        conversation_history: historyPayload
      });

      // 4. Append assistant response
      const assistantMsg = { role: "assistant", message: result.message };
      setMessages((prev) => [...prev, assistantMsg]);
      
      // 5. Refresh sidebar sessions
      await loadSessionsData();
    } catch (err) {
      setApiError(err.message || "Failed to contact the server. Please verify backend state.");
      // Append a system-style error message bubble
      setMessages((prev) => [
        ...prev,
        { role: "system", message: `System Error: ${err.message || "Failed to contact backend."}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clear Chat: starts a new session ID and clears the messages view
  const handleClearChat = () => {
    const newSessId = generateSessionId();
    setSessionId(newSessId);
    setMessages([]);
    setInputMessage("");
    setApiError(null);
  };

  // Load chat messages from a previous session in the sidebar
  const handleSelectSession = async (sess) => {
    setLoading(true);
    setApiError(null);
    setSessionId(sess.session_id);
    try {
      const historyData = await fetchSessionHistory(sess.session_id);
      // Map database schema fields to UI chat properties
      const mappedMessages = historyData.map((item) => ({
        role: item.role,
        message: item.message
      }));
      setMessages(mappedMessages);
    } catch (err) {
      setApiError("Failed to load historical messages for this session.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Split text by markdown code blocks and return paragraphs/code components
  const renderMessageContent = (text) => {
    if (!text) return null;
    const codeBlockRegex = /```(\w*)\s*[\r\n]+([\s\S]*?)[\r\n]+\s*```/g;
    const components = [];
    let lastIndex = 0;
    let match;
    let idx = 0;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText.trim()) {
        components.push(
          <div key={`text-${idx++}`} className="markdown-paragraph">
            {formatParagraphText(precedingText)}
          </div>
        );
      }
      
      components.push(
        <CodeBlock
          key={`code-${idx++}`}
          language={match[1] || "plaintext"}
          content={match[2]}
        />
      );
      
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      components.push(
        <div key={`text-${idx++}`} className="markdown-paragraph">
          {formatParagraphText(remainingText)}
        </div>
      );
    }
    
    return components;
  };

  // Support inline bold **text** and inline code `code` backticks
  const formatParagraphText = (text) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Inline code: `code`
    html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
    
    return html.split("\n").map((line, i) => {
      if (!line.trim()) {
        return <span key={i} className="paragraph-line-br" style={{ display: "block", height: "0.8em" }} />;
      }
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: line }} className="paragraph-line" />
      );
    });
  };

  const formatSidebarTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString();
  };

  return (
    <div className="app-layout">
      <div className="main-content-area chatbot-theme">
        {/* Header Section */}
        <header className="header-container">
          <div className="header-logo">
            <span className="logo-sparkle">✨</span>
            <h1 className="header-title">AI Code Assistant</h1>
          </div>
          <p className="header-subtitle">Your AI programming partner</p>
        </header>

        {/* Scrollable Conversation History */}
        <div className="chat-conversation-container">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="empty-state-icon">🤖</div>
              <h2>How can I help you today?</h2>
              <p>Ask me to generate code, explain snippets, debug errors, or complete functions.</p>
              <div className="example-chips">
                <button onClick={() => setInputMessage("Write a Python program to reverse a string.")}>
                  ✍️ Reverse a string
                </button>
                <button onClick={() => setInputMessage("Find the error in this code:\nprint(numbers[5])")}>
                  🛠️ Debug list indexing
                </button>
                <button onClick={() => setInputMessage("Complete this:\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:")}>
                  🧩 Complete factorial
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-message-list">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const isSystem = msg.role === "system";
                let bubbleClass = "chat-bubble assistant-bubble";
                if (isUser) bubbleClass = "chat-bubble user-bubble";
                if (isSystem) bubbleClass = "chat-bubble system-bubble";

                return (
                  <div key={index} className={`chat-message-row ${isUser ? "user-row" : "assistant-row"}`}>
                    <div className="avatar-icon">{isUser ? "👤" : isSystem ? "⚠️" : "🤖"}</div>
                    <div className={bubbleClass}>
                      {isUser || isSystem ? (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      ) : (
                        renderMessageContent(msg.message)
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Thinking loading indicator bubble */}
              {loading && (
                <div className="chat-message-row assistant-row">
                  <div className="avatar-icon">🤖</div>
                  <div className="chat-bubble assistant-bubble loading-bubble">
                    <span className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                    <span className="loading-text">Assistant is coding...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* User prompt input bar */}
        <form onSubmit={handleSend} className="chat-input-bar-form">
          <div className="chat-input-row">
            <textarea
              className="chat-textarea-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about programming..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="chat-input-actions">
              <button type="button" className="btn btn-secondary btn-clear" onClick={handleClearChat}>
                Clear Chat
              </button>
              <button type="submit" className="btn btn-primary btn-send" disabled={loading || !inputMessage.trim()}>
                Send
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* History Sessions Sidebar */}
      <aside className="history-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">⏳</span>
          <h3>Assistant History</h3>
        </div>
        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-empty">
              <p>No previous runs found.</p>
            </div>
          ) : (
            sessions.map((item) => (
              <button
                key={item.session_id}
                type="button"
                className={`history-item-btn ${item.session_id === sessionId ? "active-session" : ""}`}
                onClick={() => handleSelectSession(item)}
              >
                <div className="history-item-top">
                  <span className="badge badge-lang">Chat Session</span>
                  <span className="history-item-time">{formatSidebarTime(item.last_active)}</span>
                </div>
                <p className="history-item-desc">
                  {item.first_message || "Empty conversation"}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
