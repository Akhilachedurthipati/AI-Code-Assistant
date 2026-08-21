from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import json

router = APIRouter()

@router.get("/history")
def get_history_endpoint(db: Session = Depends(get_db)):
    """Retrieves all previous code-assistant transactions."""
    if db is None:
        print("Warning: Database connection not configured. Returning empty history.")
        return []

    try:
        items = db.query(models.CodeHistory).order_by(models.CodeHistory.created_at.desc()).all()
        history_list = []
        for item in items:
            try:
                parsed_response = json.loads(item.ai_response)
            except Exception:
                parsed_response = item.ai_response

            history_list.append({
                "id": item.id,
                "language": item.language,
                "feature": item.feature,
                "input_code": item.input_code,
                "user_request": item.user_request,
                "error_message": item.error_message,
                "ai_response": parsed_response,
                "created_at": item.created_at.isoformat() if item.created_at else None
            })
        return history_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
