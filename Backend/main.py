import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import code_assistant, history, chat

app = FastAPI(title="AI Code Assistant API")

# Configure CORS to allow the React frontend dynamically in production
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    allow_all_origins = False
else:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    allow_all_origins = True  # Permissive local development fallback

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else origins,
    allow_credentials=(not allow_all_origins),  # Wildcards ('*') are not compatible with credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup database initialization
@app.on_event("startup")
def startup_db_event():
    # Print environment variable keys (keys only, no values) to help debug config issues
    env_keys = [k for k in os.environ.keys() if "KEY" in k or "API" in k or "DB" in k or "HOST" in k or "URL" in k]
    print(f"Loaded config keys on startup: {env_keys}")
    
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
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8002))
    uvicorn.run("main:app", host=host, port=port, reload=True)
