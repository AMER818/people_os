import shutil
import datetime
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))
from backend.config import settings

def backup_database():
    """Backup SQLite database with rotation."""
    db_path = settings.DB_PATH
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    backup_dir = os.path.join(os.path.dirname(db_path), "backups")
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"people_os_backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, backup_file)

    try:
        shutil.copy2(db_path, backup_path)
        print(f"✅ Backup successful: {backup_path}")
    except Exception as e:
        print(f"❌ Backup failed: {str(e)}")

    # Rotation: Keep last 7 backups
    backups = sorted(
        [
            os.path.join(backup_dir, f)
            for f in os.listdir(backup_dir)
            if f.startswith("people_os_backup_")
        ],
        key=os.path.getmtime
    )

    if len(backups) > 7:
        for old_backup in backups[:-7]:
            os.remove(old_backup)
            print(f"🗑️ Rotated old backup: {old_backup}")

if __name__ == "__main__":
    backup_database()
