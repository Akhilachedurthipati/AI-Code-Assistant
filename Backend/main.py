import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import code_assistant, history, chat

app = FastAPI(title="AI Code Assistant API")

# Configure CORS to allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup database initialization
@app.on_event("startup")
def startup_db_event():
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables initialized successfully.")
        except Exception as e:
            print(f"Warning: Failed to create database tables during startup: {e}")

# Include API routes
app.include_router(code_assistant.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is connected and running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
