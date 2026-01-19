import sys
import os
import uuid

# Add current dir to path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__)))

from database import SessionLocal
import crud
import schemas

def verify_fix():
    db = SessionLocal()
    try:
        # Mock Data
        orgs = crud.get_organizations(db)
        if not orgs:
            print("No Orgs found")
            return

        org_id = orgs[0].id
        test_code = f"TEST-{str(uuid.uuid4())[:4]}"
        
        dept_data = schemas.DepartmentCreate(
            name=f"Direct Test {test_code}",
            code=test_code,
            organizationId=org_id,
            plantId=None, # Explicit Check
            isActive=True
        )

        print(f"Attempting to create dept with code {test_code} and plantId=None...")
        
        # Call CRUD directly
        new_dept = crud.create_department(db, dept_data, user_id="system_test")
        
        print(f"✅ Created Dept ID: {new_dept.id}")
        print(f"   Name: {new_dept.name}")
        print(f"   Plant ID: {new_dept.plant_id}")
        
        if new_dept.plant_id is None:
             print("✅ VERIFIED: plant_id is successfully None/Null.")
        else:
             print(f"❌ FAILED: plant_id is {new_dept.plant_id}")

        # Clean up
        # db.delete(new_dept)
        # db.commit()

    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    verify_fix()
