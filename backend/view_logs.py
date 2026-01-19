import sys
import os
from datetime import datetime, date

# Add backend to path
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.domains.core import models
from sqlalchemy import desc

def view_logs():
    db = SessionLocal()
    try:
        # Fetch recent audit logs
        print(f"--- System Audit Logs for {date.today()} ---")
        logs = db.query(models.DBAuditLog).order_by(desc(models.DBAuditLog.time)).limit(20).all()
        
        if not logs:
            print("No audit logs found for today.")
        
        for log in logs:
            print(f"[{log.time}] [{log.status}] User: {log.user} | Action: {log.action}")
            
    except Exception as e:
        print(f"Error fetching logs: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_logs()
