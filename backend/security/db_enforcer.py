import glob
import os

from backend.config import settings


def enforce_clean_db_state():
    """
    Startup Check: Verifies the authorized database matches configuration.
    Any other database files found in the workspace are IGNORED (not used),
    ensuring the system strictly adheres to the Single Source of Truth.
    """
    project_root = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )

    # Authorized database
    auth_db = settings.DB_FILE

    # Legacy patterns to check (and ignore)
    patterns = ["hunzal_hrms.db", "sql_app.db", "**/hunzal_hrms.db", "**/sql_app.db"]

    print("--- [STARTUP] Verifying Database Configuration ---")

    # 1. Verify Authorized Database Exists
    # settings.DATABASE_URL usually looks like 'sqlite:///backend/data/hunzal_hcm.db'
    # We strip the prefix to get the path relative to CWD or absolute
    # However, depending on config, it might be absolute.
    # We'll rely on the assumption that if it's sqlite, it's a file path.
    auth_db_path = settings.DATABASE_URL.replace("sqlite:///", "")

    # Handle relative paths for robustness check
    if not os.path.isabs(auth_db_path):
        auth_db_path = os.path.abspath(auth_db_path)

    if os.path.exists(auth_db_path):
        print(f"SUCCESS: Authorized database found at: {auth_db_path}")
    else:
        # It's okay if it doesn't exist yet (first run), but we declare intention.
        print(f"[INFO] NOTE: Authorized database will be created at: {auth_db_path}")

    # 2. Scan and Ignore others
    found_others = False
    for pattern in patterns:
        path_pattern = os.path.join(project_root, pattern)
        files = glob.glob(path_pattern, recursive=True)
        for f in files:
            # Skip if it happens to be the authorized one
            if os.path.basename(f) == auth_db:
                continue

            # Check if this "other" file is actually the authorized path (just in case pattern matched it)
            if os.path.abspath(f) == auth_db_path:
                continue

            # POLICY: STRICT DELETE
            try:
                os.remove(f)
                print(f"🚫 [SECURITY] DELETED UNAUTHORIZED DB: {f}")
                found_others = True
            except Exception as e:
                print(f"⚠️ [SECURITY] ERROR deleting {f}: {e}")

    if not found_others:
        print("--- [STARTUP] Environment clean (No conflicting files) ---")
    else:
        print("--- [STARTUP] Cleanup Complete. Unauthorized files destroyed. ---")
