import json
import sys
import time

import httpx

from .config import api_config

BASE_URL = f"http://127.0.0.1:{api_config.PORT}"
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"

def run_tests():
    print("=" * 60)
    print("HUNZAL HCM - FULL PERSISTENCE INTEGRATION TEST")
    print("=" * 60)

    try:
        with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
            # 1. Login
            print("\n[1] Logging in as admin...")
            login_res = client.post("/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
            if login_res.status_code != 200:
                print(f"FAILED: Login failed: {login_res.status_code} - {login_res.text}")
                return
            
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("SUCCESS: Login successful")

            # 2. Get Organizations
            print("\n[2] Fetching organizations...")
            orgs_res = client.get("/api/organizations", headers=headers)
            if orgs_res.status_code != 200:
                print(f"FAILED: Failed to fetch organizations: {orgs_res.status_code}")
                return
            
            orgs = orgs_res.json()
            if not orgs:
                print("FAILED: No organizations found.")
                return
            
            target_org = orgs[0]
            org_id = target_org["id"]
            print(f"SUCCESS: Using organization: {target_org['name']} (ID: {org_id})")

            # 3. Test Organization Profile Save
            print(f"\n[3] Testing Organization Profile Update...")
            new_industry = f"Finance {int(time.time())}"
            update_payload = {k: v for k, v in target_org.items() if k not in ["plants", "createdAt", "updatedAt", "created_by", "updated_by"]}
            update_payload["industry"] = new_industry
            
            update_res = client.put(f"/api/organizations/{org_id}", json=update_payload, headers=headers)
            if update_res.status_code != 200:
                print(f"FAILED: Organization update failed: {update_res.status_code}")
            else:
                if update_res.json().get("industry") == new_industry:
                    print("SUCCESS: Organization profile persisted correctly")

            # 4. Test Plant Addition
            print("\n[4] Testing Plant Addition...")
            plant_code = f"PLT-{int(time.time())}"
            plant_data = {
                "name": "Test Plant",
                "location": "Karachi",
                "code": plant_code,
                "isActive": True,
                "organizationId": org_id,
                "divisions": ["Production"]
            }
            plant_res = client.post("/api/plants", json=plant_data, headers=headers)
            if plant_res.status_code == 200:
                print(f"SUCCESS: Plant created: {plant_res.json()['id']}")
                fetch_plant_res = client.get(f"/api/organizations/{org_id}/plants", headers=headers)
                if any(p["code"] == plant_code for p in fetch_plant_res.json()):
                    print("SUCCESS: Plant persistence verified")

            # 5. Test Department Addition
            print("\n[5] Testing Department Addition...")
            dept_code = f"DPT-{int(time.time())}"
            dept_data = {
                "code": dept_code,
                "name": "Test Dept",
                "isActive": True,
                "organizationId": org_id
            }
            dept_res = client.post("/api/departments", json=dept_data, headers=headers)
            if dept_res.status_code == 200:
                created_dept_id = dept_res.json()["id"]
                print(f"SUCCESS: Department created: {created_dept_id}")
                
                # 6. Test Sub-Department Addition (within the newly created department)
                print("\n[6] Testing Sub-Department Addition...")
                sub_code = f"SUB-{int(time.time())}"
                sub_data = {
                    "code": sub_code,
                    "name": "Test SubDept",
                    "parentDepartmentId": created_dept_id,
                    "isActive": True,
                    "organizationId": org_id
                }
                sub_res = client.post("/api/sub-departments", json=sub_data, headers=headers)
                if sub_res.status_code == 200:
                    print(f"SUCCESS: Sub-Department created: {sub_res.json()['id']}")
                    fetch_sub_res = client.get("/api/sub-departments", headers=headers)
                    if any(s["code"] == sub_code for s in fetch_sub_res.json()):
                        print("SUCCESS: Sub-Department persistence verified")

    except Exception as e:
        print(f"ERROR: {str(e)}")

    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
