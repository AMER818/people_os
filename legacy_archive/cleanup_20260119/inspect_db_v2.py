
import sqlite3
import os

db_path = os.path.join("backend", "data", "people_os.db")
print(f"Inspecting: {os.path.abspath(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print("Found Tables:")
    for t in tables:
        print(f"- {t}")
    
    if "core_users" in tables:
        print("\n✅ core_users table FOUND.")
        cursor.execute("SELECT count(*) FROM core_users")
        count = cursor.fetchone()[0]
        print(f"Table row count: {count}")
    else:
        print("\n❌ core_users table NOT FOUND.")
    
    conn.close()
else:
    print("❌ DB File not found at expected path.")
