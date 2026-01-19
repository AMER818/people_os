import sys
import sqlite3
import os
from pathlib import Path
from sqlalchemy import create_engine

project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)
from backend.config import settings
from backend.database import engine as db_engine
from backend.domains.core.models import Base as CoreBase

TARGET_TABLES = [
    "core_organizations",
    "core_users",
    "core_departments",
    "core_sub_departments"
]

def cleanup():
    print("🧹 Starting Schema Cleanup & Rescue...")
    db_path = settings.DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys=OFF")

    try:
        cursor.execute("BEGIN TRANSACTION")
        
        for table in TARGET_TABLES:
            old_table = f"{table}_old_schema"
            
            # Check existence of Old
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{old_table}'")
            if not cursor.fetchone():
                print(f"  - {old_table} not found. Skipping.")
                continue
            
            # Check existence of New
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not cursor.fetchone():
                print(f"  ⚠️ New table {table} is MISSING! Attempting to recreate...")
                conn.commit() # Commit transaction to allow create_all to work on db_settings
                conn.close() 
                
                # Recreate using SQLAlchemy
                CoreBase.metadata.create_all(bind=db_engine)
                print(f"  -> Recreated tables.")
                
                # Reconnect
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("PRAGMA foreign_keys=OFF")
                cursor.execute("BEGIN TRANSACTION")
                
            # Verify it exists now
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not cursor.fetchone():
                print(f"  ❌ FAILED to recreate {table}. Skipping.")
                continue

            # Compare counts
            cursor.execute(f"SELECT COUNT(*) FROM {old_table}")
            old_count = cursor.fetchone()[0]
            
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            new_count = cursor.fetchone()[0]
            
            print(f"Table {table}: Old Rows={old_count}, New Rows={new_count}")
            
            if new_count >= old_count:
                # Safe to drop
                print(f"  -> Dropping {old_table}")
                cursor.execute(f"DROP TABLE {old_table}")
            else:
                 # If new table is empty but old has data, copy it!
                if new_count == 0 and old_count > 0:
                     print(f"  -> Rescuing data from {old_table} to {table}...")
                     # Get common columns
                     cursor.execute(f"PRAGMA table_info({table})")
                     new_cols = set([row[1] for row in cursor.fetchall()])
                     cursor.execute(f"PRAGMA table_info({old_table})")
                     old_cols = set([row[1] for row in cursor.fetchall()])
                     common_cols = list(new_cols.intersection(old_cols))
                     cols_str = ", ".join(common_cols)
                     
                     insert_sql = f"INSERT INTO {table} ({cols_str}) SELECT {cols_str} FROM {old_table}"
                     cursor.execute(insert_sql)
                     print(f"  -> Data copied. Now dropping {old_table}.")
                     cursor.execute(f"DROP TABLE {old_table}")
                else:
                    print(f"  ❌ WARNING: New table has fewer rows! Keeping {old_table} for safety.")

        conn.commit()
        print("✅ Cleanup Complete.")

    except Exception as e:
        print(f"❌ Cleanup Failed: {e}")
        try:
            conn.rollback()
        except:
            pass
    finally:
        try:
            conn.close()
        except:
            pass

if __name__ == "__main__":
    cleanup()
