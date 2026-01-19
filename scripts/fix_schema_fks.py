import sys
import os
import shutil
import sqlite3
import datetime
from pathlib import Path
from sqlalchemy import create_engine, MetaData, text

# Setup paths
project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)

from backend.config import settings
from backend.database import engine as db_engine
from backend.domains.core.models import Base as CoreBase
from backend.domains.hcm.models import Base as HCMBase

# Tables to migrate (Critical ones identified in audit)
TARGET_TABLES = [
    "core_organizations",
    "core_users",
    "core_departments",
    "core_sub_departments"
]

def migrate_schema():
    print("🛡️ Starting Schema Migration: Enforcing Foreign Keys")
    
    db_path = settings.DB_PATH
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    # 1. Backup
    backup_path = f"{db_path}.pre_fk_fix_{int(datetime.datetime.now().timestamp())}.bak"
    shutil.copy2(db_path, backup_path)
    print(f"✅ Backup created: {backup_path}")

    # Helper to get db connection
    def get_conn():
        return sqlite3.connect(db_path)

    conn = get_conn()
    cursor = conn.cursor()
    
    # Enable FKs for the session to verify later, but we need them OFF to drop/create
    cursor.execute("PRAGMA foreign_keys=OFF")

    try:
        cursor.execute("BEGIN TRANSACTION")

        for table in TARGET_TABLES:
            print(f"\nProcessing table: {table}")
            
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not cursor.fetchone():
                # Check if maybe it was already renamed (partial run)
                old_table_check = f"{table}_old_schema"
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{old_table_check}'")
                if cursor.fetchone():
                    print(f"⚠️ Target {table} missing but {old_table_check} exists. Assuming partial migration. Continuing...")
                else:
                    print(f"⚠️ Table {table} does not exist, skipping.")
                continue

            # Rename old table
            old_table = f"{table}_old_schema"
            cursor.execute(f"ALTER TABLE {table} RENAME TO {old_table}")
            print(f"  -> Renamed to {old_table}")
            
            # CRITICAL: Drop indexes on old table to free up names for new table
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='{old_table}'")
            indexes = cursor.fetchall()
            for idx in indexes:
                idx_name = idx[0]
                if not idx_name.startswith("sqlite_"): # Don't drop internal indexes
                    print(f"  -> Dropping old index: {idx_name}")
                    cursor.execute(f"DROP INDEX {idx_name}")

        conn.commit()
        conn.close()

        # 2. Recreate Tables using SQLAlchemy
        print("\n🏗️ Recreating tables from SQLAlchemy Models...")
        # Force checking of metadata
        CoreBase.metadata.create_all(bind=db_engine)
        
        # 3. Copy Data
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys=OFF")
        cursor.execute("BEGIN TRANSACTION")

        for table in TARGET_TABLES:
            old_table = f"{table}_old_schema"
            
            # Check if old table exists (might not if skipped above)
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{old_table}'")
            if not cursor.fetchone():
                continue

            print(f"\n🔄 Migrating data for {table}...")
            
            # Get common columns
            cursor.execute(f"PRAGMA table_info({table})")
            new_cols = set([row[1] for row in cursor.fetchall()])
            
            cursor.execute(f"PRAGMA table_info({old_table})")
            old_cols = set([row[1] for row in cursor.fetchall()])
            
            common_cols = list(new_cols.intersection(old_cols))
            cols_str = ", ".join(common_cols)
            
            if not common_cols:
                print(f"⚠️ No common columns for {table}, skipping data copy.")
                continue

            # Copy data
            insert_sql = f"INSERT INTO {table} ({cols_str}) SELECT {cols_str} FROM {old_table}"
            try:
                cursor.execute(insert_sql)
                print(f"  -> Data copied ({cursor.rowcount} rows)")
            except sqlite3.IntegrityError as e:
                print(f"❌ Integrity Error copying data for {table}: {e}")
                pass

            # Drop old table
            cursor.execute(f"DROP TABLE {old_table}")
            print(f"  -> Dropped {old_table}")

        conn.commit()
        print("\n✅ Migration Commit Successful.")
        
        # 4. Verify FKs
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA foreign_key_check")
        errors = cursor.fetchall()
        if errors:
            print(f"⚠️ Found {len(errors)} Foreign Key violations in data after migration:")
            for err in errors:
                print(f"  - Table: {err[0]}, RowId: {err[1]}, Target: {err[2]}, FK index: {err[3]}")
        else:
            print("✅ Data Integrity Verified (No FK violations).")

    except Exception as e:
        print(f"❌ Migration Failed: {e}")
        # Try to rollback whatever connection is open
        try:
            conn.rollback()
        except:
            pass
            
        print("Restoring from backup...")
        # Ensure db is closed before overwrite
        try:
            conn.close()
        except:
            pass
            
        if os.path.exists(backup_path):
             # Small delay to ensure handle release
            import time
            time.sleep(1)
            shutil.copy2(backup_path, db_path)
            print("Restored.")
        else:
            print("Backup not found!")
            
    finally:
        try:
            conn.close()
        except:
            pass

if __name__ == "__main__":
    migrate_schema()
