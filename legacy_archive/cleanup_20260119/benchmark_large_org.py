import requests
import time
import statistics

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.config_constants import api_config

BASE_URL = f"http://localhost:{api_config.PORT}/api"
ITERS = 20


def benchmark():
    print(f"Benchmarking /api/departments with {ITERS} iterations...")
    times = []

    # Login (if needed, but structure might be public or we use admin)
    # Assuming public for this benchmark or we can add auth
    # For now, let's assume we need a token.
    session = requests.Session()
    try:
        login = session.post(
            f"{BASE_URL}/auth/login", json={"username": "admin", "password": "admin"}
        )
        if login.status_code == 200:
            token = login.json()["access_token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print("Login failed, proceeding without auth (might fail)")
    except Exception as e:
        print(f"Login error: {e}")

    for i in range(ITERS):
        start = time.time()
        try:
            resp = session.get(f"{BASE_URL}/departments")
            if resp.status_code != 200:
                print(f"Error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Request Error: {e}")

        end = time.time()
        duration_ms = (end - start) * 1000
        times.append(duration_ms)
        print(f"Iter {i+1}: {duration_ms:.2f}ms")

    avg_time = statistics.mean(times)
    max_time = max(times)
    min_time = min(times)

    print("\n--- Results ---")
    print(f"Average: {avg_time:.2f}ms")
    print(f"Min: {min_time:.2f}ms")
    print(f"Max: {max_time:.2f}ms")

    if avg_time < 500:
        print("PASS: Average response time < 500ms")
    else:
        print("FAIL: Average response time > 500ms")


if __name__ == "__main__":
    benchmark()
