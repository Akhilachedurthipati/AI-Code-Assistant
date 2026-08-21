from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import json
from schemas import CodeAssistantRequest
from database import get_db
import models
from services import openai_service

router = APIRouter()

@router.post("/code-assistant")
def code_assistant_endpoint(req: CodeAssistantRequest, db: Session = Depends(get_db)):
    """Handles requests for Generate, Explain, Debug, and Complete Code."""
    feature_upper = req.feature.upper()
    valid_features = ["GENERATE", "EXPLAIN", "DEBUG", "COMPLETE"]
    if feature_upper not in valid_features:
        raise HTTPException(status_code=400, detail=f"Invalid feature. Must be one of {valid_features}")

    # Invoke appropriate service
    try:
        if feature_upper == "GENERATE":
            if not req.request or not req.request.strip():
                raise HTTPException(status_code=400, detail="Request description is required for Generate Code.")
            ai_data = openai_service.generate_code(req.language, req.request)
        elif feature_upper == "EXPLAIN":
            if not req.code or not req.code.strip():
                raise HTTPException(status_code=400, detail="Code is required for Explain Code.")
            ai_data = openai_service.explain_code(req.language, req.code)
        elif feature_upper == "DEBUG":
            if not req.code or not req.code.strip():
                raise HTTPException(status_code=400, detail="Code is required for Debug Code.")
            ai_data = openai_service.debug_code(req.language, req.code, req.error)
        elif feature_upper == "COMPLETE":
            if not req.code or not req.code.strip():
                raise HTTPException(status_code=400, detail="Code is required for Complete Code.")
            ai_data = openai_service.complete_code(req.language, req.code)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

    # Store transaction in MySQL if database is connected
    if db is not None:
        try:
            history_item = models.CodeHistory(
                language=req.language,
                feature=feature_upper,
                input_code=req.code if req.code else None,
                user_request=req.request if req.request else None,
                error_message=req.error if req.error else None,
                ai_response=json.dumps(ai_data)
            )
            db.add(history_item)
            db.commit()
            db.refresh(history_item)
        except Exception as db_err:
            print(f"Warning: Failed to save to database. DB connection may not be setup yet. Error: {db_err}")

    return ai_data
