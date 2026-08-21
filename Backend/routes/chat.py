from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas
from services import openai_service
from datetime import datetime

router = APIRouter()

@router.post("/chat")
def chat_endpoint(req: schemas.ChatRequest, db: Session = Depends(get_db)):
    """Handles chatbot conversations, retrieves history, calls OpenAI and persists to DB."""
    messages_payload = []
    
    # 1. Fetch history from MySQL DB
    if db is not None:
        try:
            db_messages = db.query(models.ChatHistory).filter(
                models.ChatHistory.session_id == req.session_id
            ).order_by(models.ChatHistory.created_at.asc()).all()
            for msg in db_messages:
                messages_payload.append({"role": msg.role, "content": msg.message})
        except Exception as e:
            print(f"Warning: Database history query failed: {e}")

    # 2. If DB history is empty, fall back to request's conversation_history (if provided)
    if not messages_payload and req.conversation_history:
        for msg in req.conversation_history:
            messages_payload.append({"role": msg.role, "content": msg.message})

    # 3. Request completion from OpenAI or Mock Service
    try:
        ai_response_text = openai_service.get_chat_response(messages_payload, req.message)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

    # 4. Save both the user message and AI response to the MySQL database
    if db is not None:
        try:
            user_msg = models.ChatHistory(
                session_id=req.session_id,
                role="user",
                message=req.message
            )
            assistant_msg = models.ChatHistory(
                session_id=req.session_id,
                role="assistant",
                message=ai_response_text
            )
            db.add(user_msg)
            db.add(assistant_msg)
            db.commit()
        except Exception as e:
            print(f"Warning: Failed to save messages to MySQL. DB connection may not be setup yet. Error: {e}")

    return {
        "session_id": req.session_id,
        "role": "assistant",
        "message": ai_response_text,
        "created_at": datetime.utcnow().isoformat()
    }

@router.get("/chat/sessions")
def get_sessions(db: Session = Depends(get_db)):
    """Retrieves list of all unique chat sessions sorted by last active timestamp."""
    if db is None:
        print("Warning: Database connection not configured. Returning empty sessions.")
        return []
    try:
        # Subquery to group and identify the first and last timestamps of sessions
        subquery_min = db.query(
            models.ChatHistory.session_id,
            func.min(models.ChatHistory.id).label("first_msg_id"),
            func.max(models.ChatHistory.created_at).label("last_active")
        ).group_by(models.ChatHistory.session_id).subquery()
        
        results = db.query(
            subquery_min.c.session_id,
            subquery_min.c.last_active,
            models.ChatHistory.message
        ).join(
            models.ChatHistory,
            models.ChatHistory.id == subquery_min.c.first_msg_id
        ).order_by(subquery_min.c.last_active.desc()).all()
        
        sessions = []
        for row in results:
            sessions.append({
                "session_id": row.session_id,
                "last_active": row.last_active.isoformat() if row.last_active else None,
                "first_message": row.message[:60] + "..." if len(row.message) > 60 else row.message
            })
        return sessions
    except Exception as e:
        print(f"Warning: Database query failed. DB connection may not be setup yet. Error: {e}")
        return []

@router.get("/chat/history/{session_id}")
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """Fetches all messages for a specific session_id in chronological order."""
    if db is None:
        print("Warning: Database connection not configured. Returning empty history.")
        return []
    try:
        items = db.query(models.ChatHistory).filter(
            models.ChatHistory.session_id == session_id
        ).order_by(models.ChatHistory.created_at.asc()).all()
        
        history_list = []
        for item in items:
            history_list.append({
                "id": item.id,
                "session_id": item.session_id,
                "role": item.role,
                "message": item.message,
                "created_at": item.created_at.isoformat() if item.created_at else None
            })
        return history_list
    except Exception as e:
        print(f"Warning: Database query failed. Returning empty history. Error: {e}")
        return []

@router.delete("/chat/history/{session_id}")
def delete_session_history(session_id: str, db: Session = Depends(get_db)):
    """Clears history for a specific session_id."""
    if db is None:
        return {"status": "error", "message": "Database not connected."}
    try:
        db.query(models.ChatHistory).filter(
            models.ChatHistory.session_id == session_id
        ).delete()
        db.commit()
        return {"status": "ok", "message": f"History for session {session_id} deleted."}
    except Exception as e:
        print(f"Warning: Database delete failed: {e}")
        return {"status": "error", "message": str(e)}

