
import sys
import os
from backend.database import SessionLocal, engine
from backend import crud
import backend.domains.core.models as core_models

# Add project root to path
sys.path.append(os.getcwd())

def test_fetch_plants():
    db = SessionLocal()
    try:
        print(f"DEBUG: Engine URL: {engine.url}")
        
        # 1. Verify Model Class
        print("Checking DBHRPlant class...")
        if hasattr(core_models, 'DBHRPlant'):
             print("✅ DBHRPlant found in core_models")
        else:
             print("❌ DBHRPlant NOT found in core_models")
             return

        # 2. CRUD fetch
        org_id = "ORG-001"
        print(f"Fetching plants for {org_id}...")
        try:
            plants = crud.get_plants(db, org_id)
            print(f"Result count: {len(plants)}")
            for p in plants:
                print(f"- {p.name} ({p.code})")
        except AttributeError as e:
            print(f"❌ CRUD Error (AttributeError): {e}")
            print("Did crud.py try to access models.DBHRPlant instead of core_models.DBHRPlant?")
        except Exception as e:
             print(f"❌ CRUD Error (General): {e}")
             import traceback
             traceback.print_exc()

    finally:
        db.close()

if __name__ == "__main__":
    test_fetch_plants()
