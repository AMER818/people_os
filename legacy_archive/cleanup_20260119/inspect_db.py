
import sqlite3
import os

db_path = "people_os.db" # Default attempt
if not os.path.exists(db_path):
    print(f"❌ {db_path} does not exist!")
    # Try legacy
    db_path = "hunzal_hcm.db"

if os.path.exists(db_path):
    print(f"✅ Inspecting {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Found Tables:")
    for t in tables:
        print(f"- {t[0]}")
    conn.close()
else:
    print("❌ No database file found in root!")
