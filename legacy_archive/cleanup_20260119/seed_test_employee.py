"""
Test Employee Seeder
Creates a test employee for verification.
Run with: python scripts/seed_test_employee.py
"""

import sqlite3
import uuid
from datetime import datetime
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings

DB_PATH = settings.DB_PATH


def generate_id(prefix: str = "EMP") -> str:
    return f"{prefix}-{str(uuid.uuid4())[:8]}"


def seed_test_employee():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("🧪 Seeding Test Employee...")

    # Get master data
    cursor.execute("SELECT id FROM core_organizations LIMIT 1")
    org = cursor.fetchone()
    org_id = org[0] if org else None

    cursor.execute("SELECT id FROM core_departments LIMIT 1")
    dept = cursor.fetchone()
    dept_id = dept[0] if dept else None

    cursor.execute("SELECT id FROM hcm_designations LIMIT 1")
    desig = cursor.fetchone()
    desig_id = desig[0] if desig else None

    cursor.execute("SELECT id FROM hcm_grades LIMIT 1")
    grade = cursor.fetchone()
    grade_id = grade[0] if grade else None

    cursor.execute("SELECT id FROM core_locations LIMIT 1")
    plant = cursor.fetchone()
    plant_id = plant[0] if plant else None

    cursor.execute("SELECT id FROM hcm_shifts LIMIT 1")
    shift = cursor.fetchone()
    shift_id = shift[0] if shift else None

    emp_id = generate_id("EMP")
    emp_code = f"TEST-{datetime.now().strftime('%H%M%S')}"

    cursor.execute(
        """
        INSERT INTO hcm_employees (
            id, employee_code, name, department, 
            organization_id, department_id, designation_id, 
            grade_id, plant_id, shift_id, status, 
            join_date, email, role,
            created_at, updated_at, created_by, updated_by
        ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'seed', 'seed'
        )
        """,
        (
            emp_id,
            emp_code,
            "TEST EMPLOYEE VERIFICATION",
            "Engineering",
            org_id,
            dept_id,
            desig_id,
            grade_id,
            plant_id,
            shift_id,
            "Active",
            "2025-01-01",
            "test@example.com",
            "Employee",
        ),
    )

    conn.commit()
    conn.close()

    print("✅ Test Employee Created!")
    print(f"   ID: {emp_id}")
    print(f"   Code: {emp_code}")
    print("   Name: TEST EMPLOYEE VERIFICATION")


if __name__ == "__main__":
    seed_test_employee()
