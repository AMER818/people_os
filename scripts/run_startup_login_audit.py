
import requests
import sys
import time

BASE_URL = "http://localhost:8000"
RED = "\033[91m"
GREEN = "\033[92m"
RESET = "\033[0m"

def log_pass(msg):
    print(f"{GREEN}[PASS]{RESET} {msg}")

def log_fail(msg):
    print(f"{RED}[FAIL]{RESET} {msg}")
    sys.exit(1)

def run_audit():
    print(f"🚀 Starting Live Startup/Login Audit on {BASE_URL}...\n")

    # 1. Health Check
    try:
        print("Checking System Health (/api/v1/health)...")
        response = requests.get(f"{BASE_URL}/api/v1/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Expect "Optimal" or "Degraded"
            status = data.get("status")
            if status == "Optimal":
                log_pass(f"System Health is Optimal (Database: {data.get('database')})")
            else:
                log_fail(f"System Health returned status: {status}")
        else:
            log_fail(f"Health check failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        log_fail("Could not connect to server. Is it running?")

    # 2. Login
    token = None
    try:
        print("\nVerifying Login Flow (admin)...")
        payload = {"username": "admin", "password": "admin"}
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                token = data["access_token"]
                user_role = data.get("user", {}).get("role", "Unknown")
                log_pass(f"Login Successful. Token received. Role: {user_role}")
            else:
                log_fail("Login succeeded but no access_token in response.")
        else:
            log_fail(f"Login failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        log_fail(f"Login check failed: {str(e)}")

    # 3. Verify Token
    try:
        print("\nVerifying Protected Route (GET /api/v1/users)...")
        headers = {"Authorization": f"Bearer {token}"}
        # /api/v1/users requires SystemAdmin, which admin should be
        response = requests.get(f"{BASE_URL}/api/v1/users", headers=headers, params={"limit": 1}, timeout=5)
        
        if response.status_code == 200:
            users_list = response.json()
            count = len(users_list)
            log_pass(f"Protected route accessed successfully. Users found: {count}")
        else:
            log_fail(f"Protected route failed: {response.status_code} - {response.text}")

    except Exception as e:
        log_fail(f"Token verification failed: {str(e)}")

    print(f"\n{GREEN}✨ Audit Complete. All checks passed.{RESET}")

if __name__ == "__main__":
    run_audit()
