import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load variables from .env
load_dotenv()

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("MYSQL_PUBLIC_URL")
    or os.getenv("MYSQL_URL")
    or os.getenv("MYSQLPRIVATE_URL")
)

if DATABASE_URL:
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
else:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "ai_code_assistant")
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print("=" * 60)
masked_url = DATABASE_URL
if "@" in DATABASE_URL:
    # Mask credentials for security
    prefix, suffix = DATABASE_URL.split("@", 1)
    parts = prefix.split("://", 1)
    if len(parts) == 2:
        masked_url = f"{parts[0]}://****:****@{suffix}"
print(f"Testing database connection using URL:\n{masked_url}")
print("=" * 60)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("\nSUCCESS: Database connection established successfully.")
except Exception as e:
    print(f"\nCONNECTION FAILED: {e}")
    print("\nPlease verify that:")
    print("1. Your MySQL server is running.")
    print("2. The database credentials in Backend/.env are correct.")
    print("3. If using Railway, make sure the Public Endpoint is deployed and active.")
print("=" * 60)
