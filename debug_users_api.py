
import requests
import sys

try:
    print("Checking API Health...")
    r = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Health: {r.status_code} - {r.text}")
except Exception as e:
    print(f"Health Check Failed: {e}")

try:
    print("\nChecking /api/users...")
    # We might need authentication, but let's see if it connects first.
    # If auth is required, it returns 401 or 403, not ConnectionError.
    r = requests.get("http://localhost:8000/api/users", timeout=5)
    print(f"Users Endpoint: {r.status_code}")
    if r.status_code != 200:
        print(r.text)
except Exception as e:
    print(f"Users Endpoint Failed: {e}")
