import sqlite3
import os

DB_PATH = os.path.join("backend", "data", "people_os.db")

def check_schema():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- hcm_designations schema ---")
    cursor.execute("PRAGMA table_info(hcm_designations)")
    columns = cursor.fetchall()
    for col in columns:
        # cid, name, type, notnull, dflt_value, pk
        name = col[1]
        notnull = col[3]
        print(f"Column: {name}, NotNull: {notnull}")

    print("\n--- core_departments schema ---")
    cursor.execute("PRAGMA table_info(core_departments)")
    columns = cursor.fetchall()
    for col in columns:
        name = col[1]
        print(f"Column: {name}")

    conn.close()

if __name__ == "__main__":
    check_schema()
