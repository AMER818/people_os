"""
Migration script to add missing foreign key constraints
Run this to enforce referential integrity
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import text
from backend.database import engine
from backend.models import Base


def add_missing_constraints():
    """Add missing FK constraints"""
    with engine.begin() as conn:
        # Check database type
        db_url = str(engine.url)
        
        if "postgresql" in db_url or "postgres" in db_url:
            print("🔧 Running PostgreSQL migrations...")
            
            # Add FK for departments.manager_id -> employees.id
            try:
                conn.execute(text("""
                    ALTER TABLE departments
                    ADD CONSTRAINT fk_departments_manager_id
                    FOREIGN KEY (manager_id) REFERENCES employees(id)
                    ON DELETE SET NULL;
                """))
                print("✅ Added FK constraint: departments.manager_id -> employees.id")
            except Exception as e:
                print(f"⚠️  departments.manager_id constraint: {e}")
            
            # Add FK for sub_departments.manager_id -> employees.id
            try:
                conn.execute(text("""
                    ALTER TABLE sub_departments
                    ADD CONSTRAINT fk_sub_departments_manager_id
                    FOREIGN KEY (manager_id) REFERENCES employees(id)
                    ON DELETE SET NULL;
                """))
                print("✅ Added FK constraint: sub_departments.manager_id -> employees.id")
            except Exception as e:
                print(f"⚠️  sub_departments.manager_id constraint: {e}")
        
        elif "sqlite" in db_url:
            print("📝 SQLite detected - creating migration for manual execution")
            print("⚠️  SQLite doesn't support ALTER TABLE for FK constraints")
            print("Run: PRAGMA foreign_keys=ON;")
        
        else:
            print("ℹ️  MySQL/MariaDB detected")
            
            # Add FK for departments.manager_id -> employees.id
            try:
                conn.execute(text("""
                    ALTER TABLE departments
                    ADD CONSTRAINT fk_departments_manager_id
                    FOREIGN KEY (manager_id) REFERENCES employees(id)
                    ON DELETE SET NULL;
                """))
                print("✅ Added FK constraint: departments.manager_id -> employees.id")
            except Exception as e:
                print(f"⚠️  departments.manager_id constraint: {e}")
            
            # Add FK for sub_departments.manager_id -> employees.id
            try:
                conn.execute(text("""
                    ALTER TABLE sub_departments
                    ADD CONSTRAINT fk_sub_departments_manager_id
                    FOREIGN KEY (manager_id) REFERENCES employees(id)
                    ON DELETE SET NULL;
                """))
                print("✅ Added FK constraint: sub_departments.manager_id -> employees.id")
            except Exception as e:
                print(f"⚠️  sub_departments.manager_id constraint: {e}")


if __name__ == "__main__":
    print("🚀 Adding missing foreign key constraints...")
    add_missing_constraints()
    print("\n✅ Migration complete!")
