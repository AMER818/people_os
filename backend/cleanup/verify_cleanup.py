import sys

import requests

from ..config import api_config

BASE_URL = f"http://localhost:{api_config.PORT}/api"


def verify():
    print("--- Verifying System Cleanup Engine ---")

    # 1. Login to get token
    print("1. Authenticating...")
    try:
        res = requests.post(
            f"{BASE_URL}/auth/login", json={"username": "admin", "password": "admin"}
        )
        if res.status_code != 200:
            print(f"FAILED to login: {res.text}")
            sys.exit(1)

        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   Logged in successfully.")
    except Exception as e:
        print(f"FAILED to connect: {e}")
        sys.exit(1)

    # 2. Run Cleanup (Dry Run)
    print("\n2. Running Cleanup (Dry Run)...")
    try:
        res = requests.post(
            f"{BASE_URL}/system/cleanup/run?dry_run=true", headers=headers
        )
        if res.status_code != 200:
            print(f"FAILED to run cleanup: {res.status_code} - {res.text}")
            sys.exit(1)

        report = res.json()
        print("   Cleanup Report Received.")
        print(f"   Report ID: {report['id']}")
        print(f"   Dry Run: {report['dry_run']}")
        print(f"   Total Reclaimable: {report['total_reclaimed_mb']:.4f} MB")

        print("\n   Results by Cleaner:")
        for result in report["cleaner_results"]:
            print(
                f"   - {result['cleaner_name']}: {len(result['actions'])} actions, {result['total_reclaimed_mb']:.4f} MB"
            )
            for action in result["actions"]:
                print(f"     * [{action['status']}] {action['description']}")

    except Exception as e:
        print(f"FAILED during execution: {e}")
        sys.exit(1)

    print("\nSUCCESS: System Cleanup Verified.")


if __name__ == "__main__":
    verify()
