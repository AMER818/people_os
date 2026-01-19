
import sqlite3
import os

db_path = os.path.join("backend", "data", "people_os.db")
print(f"Inspecting: {os.path.abspath(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables_to_check = [
        "core_locations", 
        "core_departments", 
        "hcm_employees", 
        "hcm_designations",
        "core_users"
    ]
    
    print("\n--- Row Counts in people_os.db ---")
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT count(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table}: {count} rows")
        except Exception as e:
            print(f"{table}: Error - {e}")
            
    conn.close()
else:
    print("❌ DB File not found.")
