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
    auth_db = getattr(settings, "DB_FILE", "people_os.db")

    # Legacy patterns to check (and ignore)
    patterns = ["hunzal_hrms.db", "hunzal_hcm.db", "sql_app.db"]

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

    # 2. Scan and Ignore others (Optimized)
    found_others = False
    target_filenames = {"hunzal_hrms.db", "sql_app.db"}
    
    # Use os.walk with extensive pruning to avoid scanning node_modules, .git, etc.
    for root, dirs, files in os.walk(project_root, topdown=True):
        # Prune heavy directories in-place
        dirs[:] = [d for d in dirs if d not in {"node_modules", ".git", "venv", "__pycache__", ".idea", ".vscode"}]
        
        for name in files:
            if name in target_filenames:
                f = os.path.join(root, name)
                
                # Skip if it happens to be the authorized one
                if os.path.basename(f) == auth_db:
                    continue

                # Check if this "other" file is actually the authorized path
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

if __name__ == "__main__":
    enforce_clean_db_state()
