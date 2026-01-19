import sqlite3
import os

db_path = r"d:\Project\PEOPLE_OS\backend\data\people_os.db"

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Departments ---")
cursor.execute("SELECT id, code, name FROM core_departments")
depts = cursor.fetchall()
for id, code, name in depts:
    if code and code != code.upper():
        print(f"Updating Dept: {name} ({code} -> {code.upper()})")
        cursor.execute("UPDATE core_departments SET code = ? WHERE id = ?", (code.upper(), id))
    else:
        print(f"Dept OK: {name} ({code})")

print("\n--- Sub-Departments ---")
cursor.execute("SELECT id, code, name FROM core_sub_departments")
subs = cursor.fetchall()
for id, code, name in subs:
    if code and code != code.upper():
        cursor.execute(
            "UPDATE core_sub_departments SET code = ? WHERE id = ?",
            (code.upper(), id)
        )
    else:
        print(f"Sub-Dept OK: {name} ({code})")

conn.commit()
conn.close()
print("\nVerification and update complete.")
