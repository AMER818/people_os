import sys
import sqlite3
import os
from pathlib import Path

# Setup paths
project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)
from backend.config import settings

def test_fk_enforcement():
    print("🧪 Testing Foreign Key Enforcement...")
    
    db_path = settings.DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # CRITICAL: We must enable FKs to test them (SQLite defaults to OFF unless PRAGMA used)
    # The application does this in database.py, so we must do it here too to simulate app behavior.
    cursor.execute("PRAGMA foreign_keys=ON")
    
    try:
        # Try to insert a department with a non-existent organization_id
        fake_org_id = "non_existent_org_9999"
        print(f"  -> Attempting to insert Department with Invalid Org ID: {fake_org_id}")
        
        cursor.execute("""
            INSERT INTO core_departments (id, code, name, organization_id)
            VALUES ('test_dept_fk', 'T-FK', 'Test FK Dept', ?)
        """, (fake_org_id,))
        
        print("  ❌ FAILURE: Insertion SUCCEEDED! Foreign Keys are NOT working.")
        
        # Cleanup if it worked (which it shouldn't)
        cursor.execute("DELETE FROM core_departments WHERE id='test_dept_fk'")
        conn.commit()
        
    except sqlite3.IntegrityError as e:
        print(f"  ✅ SUCCESS: Insertion FAILED as expected.")
        print(f"     Error: {e}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    test_fk_enforcement()
