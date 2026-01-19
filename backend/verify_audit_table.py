import os
import sqlite3
from backend.config import settings

print(f"Configured DB Path: {settings.DB_PATH}")
print(f"DB exists: {os.path.exists(settings.DB_PATH)}")

try:
    conn = sqlite3.connect(settings.DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables found:", [t[0] for t in tables])
    
    if "audit_runs" in [t[0] for t in tables]:
        print("SUCCESS: audit_runs table exists.")
    else:
        print("FAILURE: audit_runs table MISSING.")
    conn.close()
except Exception as e:
    print(f"Error checking DB: {e}")
