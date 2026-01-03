import os
import sys
import glob

# Ensure backend module is found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings


def clean_legacy_databases():
    project_root = os.path.dirname(os.path.abspath(__file__))

    # Authorized database
    auth_db = settings.DB_FILE
    print(f"Authoritative Database: {auth_db}")
    print(f"Located at: {settings.DATABASE_URL.replace('sqlite:///', '')}")

    # TARGETS FOR DESTRUCTION: Legacy filenames to hunt down and delete
    patterns = [
        "hunzal_hrms.db",
        "sql_app.db",
        "**/hunzal_hrms.db",
        "**/sql_app.db",
    ]

    found_any = False

    for pattern in patterns:
        path_pattern = os.path.join(project_root, pattern)
        # Recursive glob requires root dir and pattern join for python < 3.10 mostly but glob can handle it
        # strict globbing
        files = glob.glob(path_pattern, recursive=True)
        for f in files:
            # Skip if it happens to be the authorized one (unlikely given names, but safety first)
            if os.path.basename(f) == auth_db:
                continue

            print(f"FOUND UNAUTHORIZED DB: {f}")
            try:
                os.remove(f)
                print(f"  [DELETED] {f}")
                found_any = True
            except Exception as e:
                print(f"  [ERROR] Could not delete {f}: {e}")

    if not found_any:
        print("No unauthorized databases found. System is clean.")


if __name__ == "__main__":
    clean_legacy_databases()
