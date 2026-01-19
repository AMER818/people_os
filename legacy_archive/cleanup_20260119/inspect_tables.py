
import sqlite3
import os

db_path = "backend/data/people_os.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Inspecting {db_path}...")
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables found:")
    for t in tables:
        print(f"- {t[0]}")
except Exception as e:
    print(f"Error: {e}")

conn.close()
