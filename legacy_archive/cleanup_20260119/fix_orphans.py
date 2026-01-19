import sys
import os
from sqlalchemy import text

# Add path to import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal
except ImportError:
    sys.path.append(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    )
    from backend.database import SessionLocal


def fix_orphans():
    db = SessionLocal()
    print("="*60)
    print("🔧 FIXING ORPHANED RECORDS")
    print("="*60)

    
    # 1. Get a valid Organization ID
    org_id = db.execute(
        text("SELECT id FROM core_organizations LIMIT 1")
    ).scalar()
    
    if not org_id:
        print("❌ CRITICAL: No Organization found in database! Can't assign orphans.")
        return

    print(f"✅ Target Organization found: {org_id}")
    
    entities = [
        ("employment_levels", "Employment Levels"),
        # Add other entities if needed later
    ]
    
    total_fixed = 0
    
    for table, name in entities:
        # Count Orphans
        orphans = db.execute(text(f"SELECT COUNT(*) FROM {table} WHERE organization_id IS NULL")).scalar()
        
        if orphans > 0:
            print(f"   ⚠️  Found {orphans} orphaned {name}. Fixing...")
            
            # Update Orphans
            result = db.execute(
                text(f"UPDATE {table} SET organization_id = :org_id WHERE organization_id IS NULL"),
                {"org_id": org_id}
            )
            db.commit()
            print(f"   ✅ Fixed {result.rowcount} records.")
            total_fixed += result.rowcount
            
        else:
            print(f"   ✅ No orphans found in {name}.")
            
    print("\n" + "="*60)
    if total_fixed > 0:
        print(f"🎉 FIXED: {total_fixed} records assigned to Organization {org_id}.")
    else:
        print("🎉 CLEAN: No repairs needed.")
    print("="*60)
    
    db.close()

if __name__ == "__main__":
    fix_orphans()
