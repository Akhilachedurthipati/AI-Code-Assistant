from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CodeAssistantRequest(BaseModel):
    language: str = Field(..., description="Programming language (e.g. Python, JavaScript, Java, etc.)")
    feature: str = Field(..., description="Selected feature: GENERATE, EXPLAIN, DEBUG, COMPLETE")
    code: Optional[str] = Field("", description="Input or partial code snippet")
    request: Optional[str] = Field("", description="User natural language instructions (required for GENERATE)")
    error: Optional[str] = Field("", description="Optional error message input (for DEBUG)")

class CodeHistoryResponse(BaseModel):
    id: int
    language: str
    feature: str
    input_code: Optional[str] = None
    user_request: Optional[str] = None
    error_message: Optional[str] = None
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author (user or assistant)")
    message: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session ID")
    message: str = Field(..., description="User message prompt")
    conversation_history: Optional[List[ChatMessage]] = Field(None, description="Optional conversation history list")

class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

