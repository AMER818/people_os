import requests
import sys
import os
import uuid
import datetime

# Add project root to path
sys.path.append(os.getcwd())

try:
    from backend.database import SessionLocal
    from backend import crud, schemas
    from backend.domains.core import models as core_models
    import backend.dependencies as deps
except ImportError as e:
    print(f"❌ Failed to import backend modules: {e}")
    sys.exit(1)

BASE_URL = "http://localhost:8000/api"

def run_verify():
    print("🚀 Starting Designation API Smoke Test...")
    
    # 0. Setup: Create Temp User
    db = SessionLocal()
    temp_email = f"smoke_{uuid.uuid4().hex[:8]}@test.com"
    temp_pass = "smoke123"
    temp_user_data = schemas.UserCreate(
        username=temp_email.split('@')[0],
        email=temp_email,
        password=temp_pass,
        role="SystemAdmin", # Needs permission
        organization_id="org-1" # Assuming exists or null
    )
    
    # Check/Create Org if needed
    org = db.query(core_models.DBOrganization).first()
    if not org:
        # Create dummy org
        org = core_models.DBOrganization(id=str(uuid.uuid4()), name="Smoke Org", created_at=datetime.datetime.now())
        db.add(org)
        db.commit()
    
    temp_user_data.organization_id = org.id
    
    print(f"ℹ️  Creating Temp User: {temp_email}")
    try:
        hashed = deps.get_password_hash(temp_pass)
        db_user = core_models.DBUser(
            id=str(uuid.uuid4()),
            email=temp_user_data.email,
            username=temp_user_data.username,
            password_hash=hashed,
            role=temp_user_data.role,
            organization_id=temp_user_data.organization_id,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print("✅ Temp User Created DB")
        
    except Exception as e:
        print(f"❌ Failed to create temp user: {e}")
        db.close()
        sys.exit(1)
    finally:
        db.close()

    # 1. Generate Token Directly (Bypass generic Login issues for now to test Designation logic)
    print("ℹ️  Generating Token directly...")
    access_token_expires = datetime.timedelta(minutes=60)
    token = deps.create_access_token(
        data={"sub": temp_user_data.username, "org_id": temp_user_data.organization_id},
        expires_delta=access_token_expires
    )
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Token Generated")


    # 2. Create Global Designation
    test_name = f"Smoke Global {uuid.uuid4().hex[:4]}"
    payload = {
        "name": test_name,
        # grade_id: None. Let's see if allowed. 
        # Pydantic schema might require it. Check schemas.DesignationCreate? 
        # If required, we fetch one.
    }
    
    # Get Grades
    grades_resp = requests.get(f"{BASE_URL}/grades", headers=headers)
    if grades_resp.status_code == 200 and len(grades_resp.json()) > 0:
         grade_id = grades_resp.json()[0]["id"]
         payload["grade_id"] = grade_id
    elif grades_resp.status_code == 200:
         # Create a grade?
         pass
    
    # Attempt Create
    create_resp = requests.post(f"{BASE_URL}/designations", json=payload, headers=headers)
    
    if create_resp.status_code == 200:
        data = create_resp.json()
        if data.get("department_id") is None:
            print("✅ Global Designation Created Successfully")
        else:
            print(f"⚠️  Designation Created, department_id: {data.get('department_id')}")
            
        # Cleanup Designation
        requests.delete(f"{BASE_URL}/designations/{data['id']}", headers=headers)
    else:
        print(f"❌ Create Designation Failed: {create_resp.status_code} {create_resp.text}")

    # Cleanup User
    db = SessionLocal()
    u = db.query(core_models.DBUser).filter(core_models.DBUser.email == temp_email).first()
    if u:
        db.delete(u)
        db.commit()
        print("✅ Temp User Cleanup")
    db.close()

if __name__ == "__main__":
    run_verify()
