#!/usr/bin/env python3
"""
Quick test to simulate frontend login + profile fetch flow
This shows what the frontend will do when you log in
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://127.0.0.1:3001/api"
ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6bnVsbCwiZXhwIjoxNzY4MjMwNzE2fQ.YQO3YgWBJOnfSS7ec6h98rOQA8rh26HiBo4ZV9sN9Ac"

def log(msg, level="INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {level:8} {msg}")

def test_profile_fetch():
    """Simulate what the frontend does after login"""
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"  # Browser would include this
    }
    
    log("=== SIMULATING FRONTEND PROFILE FETCH ===")
    log(f"Target: {API_URL}/organizations")
    log(f"Token: {ADMIN_TOKEN[:20]}...")
    log(f"Origin: http://localhost:5173")
    
    start = time.time()
    
    try:
        log("Making request...", "DEBUG")
        response = requests.get(
            f"{API_URL}/organizations",
            headers=headers,
            timeout=5
        )
        duration = (time.time() - start) * 1000
        
        log(f"Response received in {duration:.0f}ms", "DEBUG")
        log(f"Status: {response.status_code}")
        
        # Check CORS headers
        cors_origin = response.headers.get('access-control-allow-origin')
        log(f"CORS Origin: {cors_origin}", "DEBUG")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                org = data[0]
                log(f"✓ Success! Got {len(data)} organization(s)", "INFO")
                log(f"  Name: {org.get('name', 'N/A')}")
                log(f"  ID: {org.get('id', 'N/A')}")
                log(f"  Email: {org.get('email', 'N/A')}")
                log(f"  Industry: {org.get('industry', 'N/A')}")
                
                # Show what would be stored
                log("", "INFO")
                log("This would be stored in localStorage as 'org_profile':")
                log(json.dumps(org, indent=2), "INFO")
            else:
                log("✗ Empty response array", "WARN")
        else:
            log(f"✗ Error response: {response.text[:200]}", "ERROR")
    
    except requests.exceptions.Timeout:
        log("✗ Request timed out", "ERROR")
    except requests.exceptions.ConnectionError:
        log("✗ Connection refused - backend not running?", "ERROR")
    except Exception as e:
        log(f"✗ Exception: {type(e).__name__}: {e}", "ERROR")

if __name__ == "__main__":
    test_profile_fetch()
