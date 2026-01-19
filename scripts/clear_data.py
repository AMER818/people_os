import sqlite3
import uuid

DB_PATH = "backend/data/people_os.db"


def clear_and_reset():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Disable FKs to allow mass deletion
    cursor.execute("PRAGMA foreign_keys = OFF;")

    tables = [
        "employee_education",
        "employee_experience",
        "employee_family",
        "employee_discipline",
        "employee_increments",
        "performance_reviews",
        "job_vacancies",
        "goals",
        "candidates",
        "employees",
        "users",
        "designations",
        "sub_departments",
        "departments",
        "grades",
        "shifts",
        "hr_plants",
        "audit_logs",
        "organizations",
    ]

    print("WARNING: Wiping all Organization Setup Data...")

    try:
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
            print(f"Cleared {table}")

        cursor.execute("DELETE FROM sqlite_sequence")
        print("Reset sequences.")

        # 2. Restore Admin Users (Crucial for Login)
        print("Restoring Admin Access...")

        admin_id = str(uuid.uuid4())
        amer_id = str(uuid.uuid4())

        # Insert Admin
        cursor.execute(
            """
            INSERT INTO users (id, username, password_hash, role, is_active, employee_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (admin_id, "admin", "admin", "SystemAdmin", 1, None),
        )

        # Insert .amer
        cursor.execute(
            """
            INSERT INTO users (id, username, password_hash, role, is_active, employee_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (amer_id, ".amer", "amer", "ProjectCreator", 1, None),
        )

        print("Admin users restored (employee_id=NULL).")

        conn.commit()
    except Exception as e:
        print(f"Error during reset: {e}")
        conn.rollback()
    finally:
        # Re-enable FKs? Connection closes anyway.
        conn.close()
        print("Database Reset Complete.")


if __name__ == "__main__":
    clear_and_reset()
