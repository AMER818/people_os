import sqlite3
import uuid
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'people_os.db')

LEVELS = [
    {"name": "Leadership level", "code": "LEAD", "description": "Top-level executive and leadership roles"},
    {"name": "Management level", "code": "MGMT", "description": "Middle and upper management positions"},
    {"name": "Professional level", "code": "PROF", "description": "Individual contributor professional roles"},
    {"name": "Supervisory level", "code": "SUPV", "description": "First-line supervisory and team lead roles"},
    {"name": "Non-Management", "code": "NMGMT", "description": "Operational and individual contributor roles without management duties"}
]

def seed_levels():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print(f"Seeding levels into {DB_PATH}...")

    for level in LEVELS:
        # Check if level already exists
        cursor.execute("SELECT id FROM employment_levels WHERE name = ? OR code = ?", (level["name"], level["code"]))
        existing = cursor.fetchone()
        
        if not existing:
            level_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO employment_levels (id, name, code, description, is_active) VALUES (?, ?, ?, ?, ?)",
                (level_id, level["name"], level["code"], level["description"], 1)
            )
            print(f"Added level: {level['name']} ({level['code']})")
        else:
            print(f"Level already exists: {level['name']} ({level['code']})")

    conn.commit()
    conn.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_levels()
