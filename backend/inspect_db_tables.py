import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "people_os.db")
print(f"Inspecting DB at: {DB_PATH}")

if not os.path.exists(DB_PATH):
    print("DB FILE DOES NOT EXIST")
else:
    print(f"DB File Size: {os.path.getsize(DB_PATH)} bytes")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables found:", tables)
        
        if tables:
            first_table = tables[0][0]
            print(f"Columns for {first_table}:")
            cursor.execute(f"PRAGMA table_info({first_table})")
            print(cursor.fetchall())
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
