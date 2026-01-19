import sys
import os
from sqlalchemy import text

# Add path to import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal
except ImportError:
    sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    from backend.database import SessionLocal

def verify_ownership():
    db = SessionLocal()
    print("="*60)
    print("🏢 CONCRETE ORGANIZATION OWNERSHIP VERIFICATION")
    print("="*60)
    
    entities = [
        ("hr_plants", "Plants"),
        ("departments", "Departments"),
        ("employment_levels", "Employment Levels"),
        ("grades", "Grades")
    ]
    
    total_orphans = 0
    
    for table, name in entities:
        print(f"\nVerifying {name} ({table})...")
        
        # Check total count
        result = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
        print(f"   - Total Records: {result}")
        
        # Check for Null Organization ID
        orphans = db.execute(text(f"SELECT COUNT(*) FROM {table} WHERE organization_id IS NULL")).scalar()
        
        if orphans == 0:
             print(f"   ✅ OK: All records have organization_id.")
        else:
             print(f"   ❌ FAIL: Found {orphans} orphaned records (organization_id is NULL)!")
             total_orphans += 1
             
        # Check if organization_id actually exists in organizations table
        # (This catches broken links even if ID is not null)
        invalid_links = db.execute(text(f"""
            SELECT COUNT(*) 
            FROM {table} t 
            LEFT JOIN organizations o ON t.organization_id = o.id 
            WHERE o.id IS NULL AND t.organization_id IS NOT NULL
        """)).scalar()
        
        if invalid_links == 0:
            print(f"   ✅ OK: All organization_ids exist in 'organizations' table.")
        else:
            print(f"   ❌ FAIL: Found {invalid_links} records linked to non-existent Organizations!")
            total_orphans += 1

    print("\n" + "="*60)
    if total_orphans == 0:
        print("🎉 SUCCESS: All entities are concretely owned by valid Organizations.")
    else:
        print("⚠️  WARNING: Ownership integrity issues detected.")
    print("="*60)
    
    db.close()

if __name__ == "__main__":
    verify_ownership()
