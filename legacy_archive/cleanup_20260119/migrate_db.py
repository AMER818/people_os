"""
Database Migration Script
Adds missing columns to existing tables without data loss.
Run this script once to update the database schema.
"""
import sqlite3
import os

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "people_os.db")

# Define migrations: table -> list of (column_name, column_definition)
MIGRATIONS = {
    "core_organizations": [
        ("is_active", "INTEGER DEFAULT 1"),
        ("head_id", "TEXT"),
    ],
    "grades": [
        ("is_active", "INTEGER DEFAULT 1"),
        ("code", "TEXT"),
        ("employment_level_id", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "designations": [
        ("grade_id", "TEXT"),
        ("department_id", "TEXT"),
        ("is_active", "INTEGER DEFAULT 1"),
        ("code", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "departments": [
        ("hod_id", "TEXT"),
        ("manager_id", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "sub_departments": [
        ("parent_department_id", "TEXT"),
        ("manager_id", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "hr_plants": [
        ("current_sequence", "INTEGER DEFAULT 0"),
        ("is_active", "INTEGER DEFAULT 1"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "shifts": [
        ("start_time", "TEXT"),
        ("end_time", "TEXT"),
        ("grace_period", "INTEGER DEFAULT 15"),
        ("break_duration", "INTEGER DEFAULT 60"),
        ("work_days", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "holidays": [
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "hcm_employees": [
        ("employee_code", "TEXT"),
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "employment_levels": [
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "positions": [
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "bank_accounts": [
        ("created_at", "TEXT"),
        ("updated_at", "TEXT"),
        ("created_by", "TEXT"),
        ("updated_by", "TEXT"),
    ],
    "system_flags": [
        ("session_isolation", "BOOLEAN DEFAULT 0"),
    ],
    "users": [
        ("is_system_user", "BOOLEAN DEFAULT 0"),
    ],
}


def get_existing_columns(cursor, table_name):
    """Get list of existing column names for a table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    return [row[1] for row in cursor.fetchall()]


def migrate():
    """Run all migrations."""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # DEBUG: List all tables available
    print("🔎 DEBUG: Tables in DB:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print([r[0] for r in cursor.fetchall()])

    print("=" * 50)
    print("🔄 Starting Database Migration")
    print("=" * 50)
    print(f"Targeting: {DB_PATH}")

    total_added = 0

    for table, columns in MIGRATIONS.items():
        try:
            existing = get_existing_columns(cursor, table)
            if not existing:
                print(f"⚠️  Table '{table}' does not exist, skipping...")
                continue

            for col_name, col_def in columns:
                if col_name not in existing:
                    try:
                        sql = f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}"
                        cursor.execute(sql)
                        print(f"✅ Added column: {table}.{col_name}")
                        total_added += 1
                    except sqlite3.OperationalError as e:
                        print(f"⚠️  Skipped {table}.{col_name}: {e}")
                else:
                    print(f"   ⏭️  Column exists: {table}.{col_name}")

        except Exception as e:
            print(f"❌ Error processing table '{table}': {e}")

    conn.commit()
    conn.close()

    print("=" * 50)
    print(f"✅ Migration Complete! Added {total_added} columns.")
    print("=" * 50)


if __name__ == "__main__":
    migrate()
