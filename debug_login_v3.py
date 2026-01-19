
import sys
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
import backend.domains.core.models as core_models

# Add project root to path
sys.path.append(os.getcwd())

def test_login_flow():
    print(f"DEBUG: Engine URL is: {engine.url}")
    
    db = SessionLocal()
    try:
        print("--- Diagnostic: Reading Users ---")
        user = db.query(core_models.DBUser).filter(core_models.DBUser.email == "amer@peopleos.com").first()
        if not user:
            print("User 'amer' not found, trying generic query...")
            user = db.query(core_models.DBUser).first()
        
        if not user:
            print("❌ No users in DB.")
            return

        print(f"✅ Found User: {user.email} (Org: {user.organization_id})")

        print("--- Diagnostic: System Flags ---")
        flags = db.query(core_models.DBSystemFlags).filter(core_models.DBSystemFlags.organization_id == user.organization_id).first()
        if flags:
            print(f"✅ Found System Flags: {flags.id} (Maintenance Mode: {flags.maintenance_mode})")
        else:
            print("⚠️ User found, but no System Flags for this Org.")

    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_login_flow()
