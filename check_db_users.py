from backend.database import SessionLocal
from backend.models import DBUser
import logging

# Configure basic logging to stdout
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_users():
    db = SessionLocal()
    try:
        users = db.query(DBUser).all()
        logger.info(f"Total Users in DB: {len(users)}")
        for u in users:
            logger.info(f"User: {u.username}, Role: {u.role}, IsSystem: {u.is_system_user}, Org: {u.organization_id}")
    except Exception as e:
        logger.error(f"Error querying users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
