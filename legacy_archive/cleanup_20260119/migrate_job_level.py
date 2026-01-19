import sqlite3
import os

DB_PATH = "backend/data/people_os.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("Starting migration: Employment Level -> Job Level")
        
        # 1. Rename employment_levels -> job_levels
        # Check if job_levels already exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='job_levels'")
        if cursor.fetchone():
            print("⚠️ 'job_levels' table already exists. Skipping table rename.")
        else:
            print("Running: ALTER TABLE employment_levels RENAME TO job_levels")
            cursor.execute("ALTER TABLE employment_levels RENAME TO job_levels")
            print("✅ Renamed table employment_levels -> job_levels")

        # 2. Update 'grades' table: rename column 'employment_level_id' -> 'job_level_id'
        # Check if column needs renaming
        cursor.execute("PRAGMA table_info(grades)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'job_level_id' in columns:
             print("⚠️ 'job_level_id' column already exists in 'grades'. Skipping column rename.")
        elif 'employment_level_id' in columns:
            print("recreating 'grades' table to update FK and column name...")
            
            # A. Fetch existing data
            cursor.execute("SELECT * FROM grades")
            rows = cursor.fetchall()
            
            # B. Get current schema to replicate (manually constructed to be safe)
            # Old Schema: id, name, level, employment_level_id, is_active, organization_id, created_at, updated_at, created_by, updated_by, code
            
            # C. Drop old table
            cursor.execute("DROP TABLE grades")
            
            # D. Create new table with new column name and FK
            create_query = """
            CREATE TABLE grades (
                id VARCHAR NOT NULL, 
                name VARCHAR, 
                level INTEGER, 
                job_level_id VARCHAR NOT NULL, 
                is_active BOOLEAN, 
                organization_id VARCHAR NOT NULL, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
                updated_at DATETIME, 
                created_by VARCHAR, 
                updated_by VARCHAR, 
                code VARCHAR, 
                PRIMARY KEY (id), 
                FOREIGN KEY(job_level_id) REFERENCES job_levels (id), 
                FOREIGN KEY(organization_id) REFERENCES organizations (id)
            )
            """
            cursor.execute(create_query)
            
            # E. Restore data
            # Map old columns to new. The position of employment_level_id needs to be handled if it changes, 
            # but usually SELECT * returns in definition order. 
            # In existing schema, employment_level_id is 4th (index 3).
            
            insert_sql = """
            INSERT INTO grades (id, name, level, job_level_id, is_active, organization_id, created_at, updated_at, created_by, updated_by, code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            cursor.executemany(insert_sql, rows)
            print(f"✅ Recreated 'grades' table and restored {len(rows)} rows.")
            
        conn.commit()
        print("🚀 Migration completed successfully.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
