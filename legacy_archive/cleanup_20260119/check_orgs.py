
import sqlite3
import os

db_path = os.path.join("backend", "data", "people_os.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n--- User Orgs ---")
cursor.execute("SELECT id, username, organization_id FROM core_users")
users = cursor.fetchall()
user_orgs = set()
for u in users:
    print(f"User: {u[1]} | Org ID: {u[2]}")
    user_orgs.add(u[2])

print("\n--- Location Orgs ---")
cursor.execute("SELECT id, name, organization_id FROM core_locations")
locs = cursor.fetchall()
for l in locs:
    print(f"Location: {l[1]} | Org ID: {l[2]}")
    if l[2] not in user_orgs:
        print(f"  ⚠️ Mismatch! Location Org {l[2]} not linked to any user")

conn.close()
