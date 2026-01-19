from fastapi.testclient import TestClient
from backend.main import app, requires_role, get_current_user
import os

def check_endpoint(client, method, url, data=None, files=None):
    print(f"Testing {method} {url}...")
    if method == "POST":
        res = client.post(url, json=data, files=files)
    elif method == "GET":
        res = client.get(url)
    
    if res.status_code == 200:
        print(f"SUCCESS: {res.json()}")
        return res.json()
    else:
        print(f"FAILED ({res.status_code}): {res.text}")
        return None

def verify_maintenance():
    client = TestClient(app)
    
    # Mock Auth
    mock_user = {"id": "admin", "role": "SystemAdmin", "username": "admin", "organizationId": "org-1"}
    app.dependency_overrides[requires_role("SystemAdmin")] = lambda: mock_user
    app.dependency_overrides[get_current_user] = lambda: mock_user

    try:
        # 1. Flush Cache
        check_endpoint(client, "POST", "/api/system/maintenance/flush-cache")

        # 2. Rotate Logs
        check_endpoint(client, "POST", "/api/system/maintenance/rotate-logs")

        # 3. Optimize DB
        check_endpoint(client, "POST", "/api/system/maintenance/optimize-db")

        # 4. Backup
        backup_res = check_endpoint(client, "POST", "/api/system/maintenance/backup")
        
        if backup_res and "path" in backup_res:
            backup_path = backup_res["path"]
            print(f"Backup created at: {backup_path}")
            
            # 5. Restore (Test with the backup we just created)
            # Note: We must open file in binary mode
            if os.path.exists(backup_path):
                # We need to re-open to send as file
                with open(backup_path, "rb") as f:
                    # 'file' matches the UploadFile parameter name in the endpoint
                    files = {"file": (os.path.basename(backup_path), f, "application/octet-stream")}
                    print("Testing Restore...")
                    # We need to be careful not to lock the file we are reading if backend tries to move it
                    # But backend copies from upload, so it should be fine.
                    res = client.post("/api/system/maintenance/restore", files=files)
                    if res.status_code == 200:
                        print(f"Restore SUCCESS: {res.json()}")
                    else:
                        print(f"Restore FAILED: {res.text}")
            else:
                print("Backup file not found on disk!")

    finally:
        app.dependency_overrides.clear()

if __name__ == "__main__":
    verify_maintenance()
