from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class CodeHistory(Base):
    __tablename__ = "code_history"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String(50), nullable=False)
    feature = Column(String(50), nullable=False)
    input_code = Column(Text, nullable=True)
    user_request = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=False)  # Stored as a JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

