import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

def test_create_dept():
    # 1. Get Organization
    print("1. Fetching Organizations...")
    resp = requests.get(f"{BASE_URL}/organizations")
    if resp.status_code != 200:
        print(f"❌ Failed to fetch orgs: {resp.text}")
        return
    
    orgs = resp.json()
    if not orgs:
        print("❌ No organizations found.")
        return
    
    org_id = orgs[0]['id']
    print(f"   Using Org ID: {org_id}")
    
    # 2. Create Global Department (No Plant)
    dept_code = f"TEST-{str(uuid.uuid4())[:4]}"
    payload = {
        "name": f"Test Global Dept {dept_code}",
        "code": dept_code,
        "organizationId": org_id,
        "plantId": None, # Explicitly null
        "isActive": True
    }
    
    print(f"2. Creating Department with payload: {json.dumps(payload, indent=2)}")
    resp = requests.post(f"{BASE_URL}/departments", json=payload)
    
    if resp.status_code == 200:
        print("✅ SUCCESS: Department created.")
        print(f"   Response: {json.dumps(resp.json(), indent=2)}")
    else:
        print(f"❌ FAILED: {resp.status_code}")
        print(f"   Response: {resp.text}")

if __name__ == "__main__":
    test_create_dept()
