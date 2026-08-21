const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function requestAssistant({ language, feature, code = "", request = "", error = "" }) {
  const response = await fetch(`${API_BASE_URL}/code-assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ language, feature, code, request, error }),
  });

  if (!response.ok) {
    let errorMessage = "An error occurred on the server.";
    try {
      const errJson = await response.json();
      errorMessage = errJson.detail || errorMessage;
    } catch (e) {
      // Failed to parse JSON error message
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE_URL}/history`);
  if (!response.ok) {
    throw new Error("Failed to load previous assistant history.");
  }
  return await response.json();
}

export async function sendChatMessage({ session_id, message, conversation_history = [] }) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id, message, conversation_history }),
  });

  if (!response.ok) {
    let errorMessage = "An error occurred on the server.";
    try {
      const errJson = await response.json();
      errorMessage = errJson.detail || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchSessions() {
  const response = await fetch(`${API_BASE_URL}/chat/sessions`);
  if (!response.ok) {
    throw new Error("Failed to load chat sessions.");
  }
  return await response.json();
}

export async function fetchSessionHistory(session_id) {
  const response = await fetch(`${API_BASE_URL}/chat/history/${session_id}`);
  if (!response.ok) {
    throw new Error("Failed to load session history.");
  }
  return await response.json();
}

export async function deleteSessionHistory(session_id) {
  const response = await fetch(`${API_BASE_URL}/chat/history/${session_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete session history.");
  }
  return await response.json();
}

