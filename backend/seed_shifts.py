#!/usr/bin/env python3
"""
Seed Standard Shifts

This script creates the 6 standard shifts if they don't already exist.
"""

import sqlite3
import uuid
from datetime import datetime, timezone

DATABASE_PATH = "data/people_os.db"
TABLE_NAME = "hcm_shifts"

STANDARD_SHIFTS = [
    {
        "name": "General",
        "code": "G",
        "type": "Fixed",
        "start_time": "09:00",
        "end_time": "17:00",
        "grace_period": 15,
        "break_duration": 60,
        "work_days": "Mon,Tue,Wed,Thu,Fri",
        "color": "#3b82f6",
        "description": "Standard fixed shift.",
    },
    {
        "name": "Reliever",
        "code": "R",
        "type": "Reliever",
        "start_time": "09:00",
        "end_time": "17:00",
        "grace_period": 15,
        "break_duration": 60,
        "work_days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
        "color": "#22c55e",
        "description": "Works on others rest days or flexibly.",
    },
    {
        "name": "Shift A",
        "code": "A",
        "type": "Rotating",
        "start_time": "06:00",
        "end_time": "14:00",
        "grace_period": 10,
        "break_duration": 30,
        "work_days": "Mon,Tue,Wed,Thu,Fri,Sat",
        "color": "#f59e0b",
        "description": "Morning Shift (Rotating).",
    },
    {
        "name": "Shift B",
        "code": "B",
        "type": "Rotating",
        "start_time": "14:00",
        "end_time": "22:00",
        "grace_period": 10,
        "break_duration": 30,
        "work_days": "Mon,Tue,Wed,Thu,Fri,Sat",
        "color": "#a855f7",
        "description": "Evening Shift (Rotating).",
    },
    {
        "name": "Shift C",
        "code": "C",
        "type": "Rotating",
        "start_time": "22:00",
        "end_time": "06:00",
        "grace_period": 10,
        "break_duration": 30,
        "work_days": "Mon,Tue,Wed,Thu,Fri,Sat",
        "color": "#ef4444",
        "description": "Night Shift (Rotating).",
    },
    {
        "name": "Flexible",
        "code": "F",
        "type": "Flexible",
        "start_time": "00:00",
        "end_time": "23:59",
        "grace_period": 0,
        "break_duration": 60,
        "work_days": "Mon,Tue,Wed,Thu,Fri",
        "color": "#06b6d4",
        "description": "Work any time flexibly.",
    },
]


def migrate_schema(conn: sqlite3.Connection):
    """Add color and description columns to hcm_shifts if they don't exist."""
    cursor = conn.cursor()

    cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{TABLE_NAME}'")
    if not cursor.fetchone():
        print(f"ERROR: Table '{TABLE_NAME}' does not exist!")
        return False

    cursor.execute(f"PRAGMA table_info({TABLE_NAME})")
    columns = [col[1] for col in cursor.fetchall()]

    if "color" not in columns:
        print("Adding 'color' column...")
        cursor.execute(f"ALTER TABLE {TABLE_NAME} ADD COLUMN color TEXT")

    if "description" not in columns:
        print("Adding 'description' column...")
        cursor.execute(f"ALTER TABLE {TABLE_NAME} ADD COLUMN description TEXT")

    conn.commit()
    print("Schema migration complete.")
    return True


def seed_shifts(conn: sqlite3.Connection, organization_id: str):
    """Insert standard shifts if they don't already exist."""
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()

    for shift in STANDARD_SHIFTS:
        cursor.execute(
            f"SELECT id FROM {TABLE_NAME} WHERE code = ? AND organization_id = ?",
            (shift["code"], organization_id)
        )
        existing = cursor.fetchone()

        if existing:
            print(f"Updating '{shift['name']}' ({shift['code']})...")
            cursor.execute(f"""
                UPDATE {TABLE_NAME} SET
                    name = ?, type = ?, start_time = ?, end_time = ?,
                    grace_period = ?, break_duration = ?, work_days = ?,
                    color = ?, description = ?, updated_at = ?
                WHERE code = ? AND organization_id = ?
            """, (
                shift["name"], shift["type"], shift["start_time"], shift["end_time"],
                shift["grace_period"], shift["break_duration"], shift["work_days"],
                shift["color"], shift["description"], now,
                shift["code"], organization_id
            ))
        else:
            print(f"Creating '{shift['name']}' ({shift['code']})...")
            shift_id = f"SHF-{shift['code']}-{str(uuid.uuid4())[:8]}"
            cursor.execute(f"""
                INSERT INTO {TABLE_NAME} (
                    id, name, code, type, start_time, end_time,
                    grace_period, break_duration, work_days, isActive,
                    organization_id, color, description, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
            """, (
                shift_id, shift["name"], shift["code"], shift["type"],
                shift["start_time"], shift["end_time"], shift["grace_period"],
                shift["break_duration"], shift["work_days"], organization_id,
                shift["color"], shift["description"], now, now
            ))

    conn.commit()
    print(f"Seeded {len(STANDARD_SHIFTS)} standard shifts.")


def main():
    print("=" * 50)
    print("Shift Seeding Script")
    print("=" * 50)

    conn = sqlite3.connect(DATABASE_PATH)

    try:
        if not migrate_schema(conn):
            return

        cursor = conn.cursor()
        cursor.execute("SELECT id FROM core_organizations LIMIT 1")
        org = cursor.fetchone()

        if not org:
            print("ERROR: No organization found.")
            return

        organization_id = org[0]
        print(f"Using organization: {organization_id}")

        seed_shifts(conn, organization_id)

        print("\nDone! Standard shifts are now available.")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
