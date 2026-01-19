
import sys
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import crud, models
import backend.domains.core.models as core_models

# Add project root to path
sys.path.append(os.getcwd())

def test_login_flow():
    db = SessionLocal()
    try:
        print("--- Diagnostic: Checking Models ---")
        if hasattr(core_models, 'DBSystemFlags'):
            print("✅ DBSystemFlags found in core_models")
        else:
            print("❌ DBSystemFlags NOT found in core_models")

        print("\n--- Diagnostic: Simulating Login ---")
        # 1. Fetch Admin User
        user = crud.get_user_by_email(db, email="amer@peopleos.com") # Assuming this user exists from context or admin
        if not user:
             user = crud.get_user_by_email(db, email="admin@peopleos.com")
        
        if not user:
            print("⚠️ Could not find 'amer@peopleos.com' or 'admin@peopleos.com'. Checking first available user...")
            user = db.query(core_models.DBUser).first()
            
        if not user:
            print("❌ No users found in database!")
            return

        print(f"✅ Found User: {user.email} (Org: {user.organization_id})")

        # 2. Fetch System Flags (The logic that failed)
        print(f"Attempting to fetch flags for Org ID: {user.organization_id}")
        try:
            # Direct query check first
            direct_check = db.query(core_models.DBSystemFlags).filter(core_models.DBSystemFlags.organization_id == user.organization_id).first()
            print(f"✅ Direct Query Result: {direct_check}")
            
            # CRUD function check
            flags = crud.get_system_flags(db, user.organization_id)
            print(f"✅ CRUD Function Result: {flags}")
            
            if flags:
                print("✅ Login Flow Verification PASSED")
            else:
                print("⚠️ Login Flow PASSED but no flags returned (might be None, which is handled?)")

        except Exception as e:
            print(f"❌ FAILED to fetch system flags:")
            print(e)
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"❌ General Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_login_flow()
