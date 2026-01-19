#!/usr/bin/env python3
"""Test API endpoint with auth"""
import requests
import json

BASE = "http://localhost:8000"

# Try login with different users
users = [
    ("admin", "admin"),
    ("admin", "admin123"),
    (".amer", "amer123"),
    ("amer", "amer"),
]

token = None
for username, password in users:
    resp = requests.post(f"{BASE}/api/auth/login", json={"username": username, "password": password})
    print(f"Login {username}/{password}: {resp.status_code}")
    if resp.status_code == 200:
        token = resp.json().get("access_token")
        print(f"  SUCCESS - Got token")
        break

if token:
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test shifts endpoint
    shifts_resp = requests.get(f"{BASE}/api/shifts", headers=headers)
    print(f"\nShifts API Response:")
    print(f"  Status: {shifts_resp.status_code}")
    
    if shifts_resp.status_code == 200:
        data = shifts_resp.json()
        print(f"  Count: {len(data)}")
        if data:
            print(f"  First shift keys: {list(data[0].keys())}")
            print(f"  First shift: {json.dumps(data[0], indent=2)}")
    else:
        print(f"  Error: {shifts_resp.text}")
else:
    print("\nCould not login with any credentials!")
