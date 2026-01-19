
import sqlite3
import os

db_path = "backend/data/people_os.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Plants ---")
try:
    cursor.execute("SELECT id, name, organization_id FROM core_locations")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    if not rows:
        print("No plants found.")
except Exception as e:
    print(f"Error querying plants: {e}")

print("\n--- Users ---")
try:
    cursor.execute("SELECT username, role, organization_id FROM core_users")
    users = cursor.fetchall()
    for u in users:
        print(u)
except Exception as e:
    print(f"Error querying users: {e}")

conn.close()
