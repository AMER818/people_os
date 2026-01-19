
import sqlite3
import uuid

db_path = "backend/data/people_os.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Get or Create Organization
cursor.execute("SELECT id FROM core_organizations LIMIT 1")
row = cursor.fetchone()

if row:
    org_id = row[0]
    print(f"Found existing Org ID: {org_id}")
else:
    org_id = str(uuid.uuid4())
    print(f"Creating new Default Org: {org_id}")
    cursor.execute(
    cursor.execute(
        """
        INSERT INTO core_organizations (id, code, name, is_active, created_at, updated_at, created_by, updated_by)
        VALUES (?, 'ORG-DEF', 'Default Organization', 1, datetime('now'), datetime('now'), 'system', 'system')
        """,
        (org_id,)
    )
    conn.commit()

# 2. Update Users
print("Updating Users...")
cursor.execute("UPDATE core_users SET organization_id = ? WHERE organization_id IS NULL", (org_id,))
print(f"Updated {cursor.rowcount} users.")

# 3. Update Plants
print("Updating Plants...")
cursor.execute("UPDATE core_locations SET organization_id = ? WHERE organization_id IS NULL", (org_id,))
print(f"Updated {cursor.rowcount} plants.")

# 4. Update Departments
print("Updating Departments...")
# Check if table exists first to avoid crash if model diff
try:
    cursor.execute("UPDATE core_departments SET organization_id = ? WHERE organization_id IS NULL", (org_id,))
    print(f"Updated {cursor.rowcount} departments.")
except Exception as e:
    print(f"Error updating departments: {e}")

# 5. Verify
cursor.execute("SELECT id, name, organization_id FROM core_locations")
for r in cursor.fetchall():
    print(r)

conn.commit()
conn.close()
