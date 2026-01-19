import sqlite3
import os

DB_PATH = "backend/data/people_os.db"

# Mapping: Old Table Name -> New Table Name
TABLE_MAPPINGS = {
    # Core Domain
    "organizations": "core_organizations",
    "users": "core_users",
    "departments": "core_departments",
    "sub_departments": "core_sub_departments",
    "hr_plants": "core_locations", # Renamed
    "plant_divisions": "core_divisions", # Renamed
    "audit_logs": "core_audit_logs",
    "api_keys": "core_api_keys",
    "webhooks": "core_webhooks",

    # HCM Domain
    "employees": "hcm_employees",
    "job_levels": "hcm_job_levels",
    "grades": "hcm_grades",
    "designations": "hcm_designations",
    "shifts": "hcm_shifts",
    "attendance": "hcm_attendance", # If exists
    "employee_education": "hcm_employee_education",
    "employee_experience": "hcm_employee_experience",
    "employee_family": "hcm_employee_family",
    "employee_discipline": "hcm_employee_discipline",
    "employee_increments": "hcm_employee_increments",
}

def migrate_tables():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    print(f"Migrating database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Disable foreign keys temporarily
    cursor.execute("PRAGMA foreign_keys = OFF;")
    
    try:
        # Get existing tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        existing_tables = set(row[0] for row in cursor.fetchall())

        for old_name, new_name in TABLE_MAPPINGS.items():
            if old_name in existing_tables:
                if new_name in existing_tables:
                     print(f"Skipping {old_name} -> {new_name} (Target exists)")
                else:
                    print(f"Renaming {old_name} -> {new_name}...")
                    cursor.execute(f"ALTER TABLE {old_name} RENAME TO {new_name};")
            else:
                 print(f"Skipping {old_name} (Not found)")

        conn.commit()
        print("Migration successful!")

    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        cursor.execute("PRAGMA foreign_keys = ON;")
        conn.close()

if __name__ == "__main__":
    migrate_tables()
