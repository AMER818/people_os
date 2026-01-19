import sqlite3
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings

# Use database path from config
db_path = settings.DB_PATH
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Tables in database:")
for t in tables:
    print(f"  - {t}")

# Check employees table schema
if 'hcm_employees' in tables:
    cursor.execute("PRAGMA table_info(hcm_employees)")
    print("\nEmployees table columns:")
    for col in cursor.fetchall():
        print(f"  {col[1]} ({col[2]})")

conn.close()
