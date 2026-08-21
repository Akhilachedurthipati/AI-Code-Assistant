import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ai_code_assistant")

# Check for direct database URLs (supporting standard env vars from providers like Railway)
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("MYSQL_PUBLIC_URL")
    or os.getenv("MYSQL_URL")
    or os.getenv("MYSQLPRIVATE_URL")
)
has_db_url = bool(DATABASE_URL)

if DATABASE_URL:
    # SQLAlchemy requires the dialect + driver (pymysql) for MySQL connections,
    # but cloud providers like Railway often provide URLs starting with mysql://
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Auto-create the database if it does not exist and running locally
# (Cloud-managed databases usually pre-provision the DB and lack root permissions to run CREATE DATABASE)
if not has_db_url and DB_HOST in ("localhost", "127.0.0.1"):
    try:
        import pymysql
        conn = pymysql.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
        cursor.close()
        conn.close()
        print(f"Database '{DB_NAME}' checked/created successfully.")
    except Exception as e:
        print(f"Warning: Could not automatically create database '{DB_NAME}': {e}")

# Setup SQLAlchemy engine and session factory
try:
    # Use pool_pre_ping to check connection health before using it
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Error creating database engine: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    """Dependency to inject database session into path operations."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
