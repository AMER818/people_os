import sqlite3
import uuid
import random
from datetime import datetime

import os
import sys

# Add project root to path to import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings

# Parse DB path from URL
DB_PATH = settings.DATABASE_URL.replace("sqlite:///", "")


def generate_id(prefix):
    return f"{prefix}-{str(uuid.uuid4())[:8]}"


def seed_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Seeding Large Organization Data...")

    org_id = "ORG-LOAD-TEST"

    # Create Org
    cursor.execute(
        "INSERT OR IGNORE INTO organizations (id, code, name, isActive) VALUES (?, ?, ?, ?)",
        (org_id, "LOADTEST", "Load Test Corp", 1),
    )

    # config
    DEPT_COUNT = 50
    SUBDEPT_PER_DEPT = 20

    departments = []

    # 1. Departments
    print(f"Creating {DEPT_COUNT} Departments...")
    for i in range(DEPT_COUNT):
        dept_id = generate_id("DEPT")
        name = f"Department {i}"
        code = f"D-{i}"
        departments.append(dept_id)

        cursor.execute(
            """
            INSERT INTO departments (id, code, name, isActive, organization_id, createdAt, updatedAt, created_by, updated_by)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin')
        """,
            (dept_id, code, name, 1, org_id),
        )

    conn.commit()

    # 2. Sub-Departments
    print(f"Creating {DEPT_COUNT * SUBDEPT_PER_DEPT} Sub-Departments...")
    count = 0
    for dept_id in departments:
        for j in range(SUBDEPT_PER_DEPT):
            sub_id = generate_id("SUB")
            name = f"Sub Unit {j} of {dept_id}"
            code = f"S-{count}"

            cursor.execute(
                """
                INSERT INTO sub_departments (id, code, name, parentDepartmentId, isActive, organization_id, createdAt, updatedAt, created_by, updated_by)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin')
            """,
                (sub_id, code, name, dept_id, 1, org_id),
            )
            count += 1

    conn.commit()
    conn.close()
    print("Seeding Complete.")


if __name__ == "__main__":
    seed_data()
