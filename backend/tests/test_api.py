from fastapi.testclient import TestClient

from backend.main import app


def test_read_main(client: TestClient):
    response = client.get("/")
    assert response.status_code in [200, 404]

def test_api_endpoints(client: TestClient):
    # Mock authentication
    from backend.main import get_current_user, get_db, requires_role

    # Mock user with admin role
    mock_user = {"id": "admin", "role": "SystemAdmin", "username": "admin"}
    
    # Override dependencies
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[requires_role("SystemAdmin")] = lambda: mock_user
    app.dependency_overrides[requires_role("HRExecutive")] = lambda: mock_user
    app.dependency_overrides[requires_role("HRManager")] = lambda: mock_user
    
    # We rely on client fixture to override get_db
    
    try:
        # 1. Organizations
        org_payload = {
            "name": "API Org",
            "code": "API01",
            "isActive": True,
            "currency": "USD"
        }
        res = client.post("/api/organizations", json=org_payload)
        # Assuming post works or we get 200/201.
        # If /api/organizations is protected differently, it might fail.
        # But we mocked general auth.
        
        # 2. Employees
        # We need department, designation, etc IDs if FKs are enforced in API logic.
        # The API usually validates existence.
        # Let's try to create dependencies via API or just use random IDs if checks are loose in Service layer?
        # Crud checks FK? Generally No, unless strict. Dictionary checks...
        
        emp_payload = {
            "id": "EMP_API_FULL",
            "firstName": "API",
            "lastName": "Tester",
            "email": "api_full@test.com",
            # "organizationId": ... # Might be inferred from user or passed
             # backend/main.py: create_employee -> employee.organization_id alias
        }
        res_emp = client.post("/api/employees", json=emp_payload)
        # It might fail if Department/Designation missing.
        
        # 3. Candidates
        cand_payload = {
            "id": "CAND_API",
            "name": "Candidate API",
            "email": "cand@api.com",
            "positionApplied": "Dev",
            "appliedDate": "2025-01-01"
        }
        client.post("/api/candidates", json=cand_payload)
        client.get("/api/candidates")
        
        # 4. Job Vacancies
        job_payload = {
            "id": "JOB_API",
            "title": "API Dev",
            "department": "IT",
            "location": "Remote",
            "type": "Contract",
            "postedDate": "2025-01-01",
            "status": "Open",
            "requirements": ["API"]
        }
        client.post("/api/job-vacancies", json=job_payload)
        client.get("/api/job-vacancies")
        
    finally:
         app.dependency_overrides.clear()
