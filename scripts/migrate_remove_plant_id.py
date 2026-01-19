import sqlite3
import os
import shutil

DB_PATH = os.path.join("backend", "data", "people_os.db")
BACKUP_PATH = os.path.join("backend", "data", "people_os.backup.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    # Backup
    shutil.copy(DB_PATH, BACKUP_PATH)
    print(f"✅ Backup created at {BACKUP_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("--- Migrating core_departments ---")
        
        # 1. Check existing columns
        cursor.execute("PRAGMA table_info(core_departments)")
        columns = cursor.fetchall()
        col_names = [col[1] for col in columns]
        
        if "plant_id" not in col_names:
            print("INFO: plant_id already removed or not present.")
            return

        print(f"Current columns: {col_names}")
        
        # 2. Define new columns (exclude plant_id)
        new_cols = [c for c in col_names if c != "plant_id"]
        new_cols_str = ", ".join(new_cols)
        print(f"New columns: {new_cols}")

        # 3. Create new table
        # We need to recreate the Create Table SQL but without plant_id.
        # Ideally, we can just CREATE TABLE new (...) but getting types is annoying.
        # Simplified approach:
        # Create table with explicit schema matching our known model
        
        cursor.execute("DROP TABLE IF EXISTS core_departments_new")
        cursor.execute("""
            CREATE TABLE core_departments_new (
                id VARCHAR PRIMARY KEY,
                code VARCHAR UNIQUE,
                name VARCHAR UNIQUE,
                isActive BOOLEAN,
                organization_id VARCHAR NOT NULL,
                hod_id VARCHAR,
                manager_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR,
                updated_by VARCHAR,
                FOREIGN KEY (organization_id) REFERENCES core_organizations(id)
            )
        """)
        
        # 4. Copy Data
        # Select matching columns from old
        select_cols = ", ".join(new_cols)
        insert_sql = f"INSERT INTO core_departments_new ({new_cols_str}) SELECT {select_cols} FROM core_departments"
        cursor.execute(insert_sql)
        print(f"✅ Data copied ({cursor.rowcount} rows)")

        # 5. Drop old and Rename
        cursor.execute("DROP TABLE core_departments")
        cursor.execute("ALTER TABLE core_departments_new RENAME TO core_departments")

        # 6. Recreate Index?
        # create_all usually creates indexes. 
        # Let's recreate basic indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_core_departments_id ON core_departments (id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_core_departments_code ON core_departments (code)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_core_departments_organization_id ON core_departments (organization_id)")

        conn.commit()
        print("✅ Migration successful: plant_id removed from core_departments")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
