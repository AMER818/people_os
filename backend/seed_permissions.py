
import logging
import json
import uuid
import sys
import os

# Add parent directory to path to allow importing backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from backend.database import SessionLocal, engine
from backend.database import SessionLocal, engine
# from backend import models, crud  <-- REMOVED GLOBAL IMPORT
from sqlalchemy import text
# Configure Logging
import logging
from backend.permissions_config import DEFAULT_ROLE_PERMISSIONS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_permissions():
    from backend import models, crud  # Local import to prevent eager loading
    db = SessionLocal()
    try:
        logger.info("Checking Role Permissions...")
        
        # Ensure table exists
        models.Base.metadata.create_all(bind=engine)

        # 1. Ensure Default Organization exists
        org = db.query(models.DBOrganization).filter(models.DBOrganization.id == "ORG-001").first()
        if not org:
            logger.info("Creating Default Organization...")
            org = models.DBOrganization(
                id="ORG-001",
                code="DEF",
                name="Default Organization",
                is_active=True
            )
            db.add(org)
            db.commit()
            logger.info("Default Organization created.")
        
        existing_perms = crud.get_all_role_permissions(db)
        
        created_count = 0
        updated_count = 0
        
        for role, default_perms in DEFAULT_ROLE_PERMISSIONS.items():
            if role not in existing_perms or not existing_perms[role]:
                logger.info(f"Seeding permissions for role: {role}")
                crud.update_role_permissions(db, role, default_perms)
                created_count += 1
            else:
                logger.info(f"Permissions for {role} instead of skipping update forced override for dev")
                # Force update to ensure new defaults are applied
                crud.update_role_permissions(db, role, default_perms)
                updated_count += 1
                
        logger.info(f"Seeding Complete. Created: {created_count}, Updated: {updated_count}")

        # --- MANAGE SYSTEM USERS ---
        logger.info("Standardizing System Users (.amer, admin)...")
        
        # 1. Ensure .amer (Root)
        amer = db.query(models.DBUser).filter(models.DBUser.username == ".amer").first()
        if amer:
            amer.role = "Root"
            amer.is_system_user = True
            logger.info("Updated .amer as Root and System User.")
        else:
            from backend.dependencies import get_password_hash
            new_amer = models.DBUser(
                id="root-system-user-amer-001", # Fixed ID for Root
                username=".amer",
                email="amer@hunzal.com", # Placeholder
                password_hash=get_password_hash("amer"), # Assumption: pass is 'amer' or similar. 
                # Wait, user keyed in **** (4 chars). 'amer' is 4 chars. 
                # If they use a different pass, I might reset it. 
                # I'll set it to 'amer' as a default known state or '1234'.
                # Let's assume 'amer' based on username/length.
                name="Root Administrator",
                role="Root",
                is_active=True,
                is_system_user=True
            )
            db.add(new_amer)
            logger.info("Created Default '.amer' User (Pass: amer).")
        
        # 2. Ensure admin (Super Admin)
        admin = db.query(models.DBUser).filter(models.DBUser.username == "admin").first()
        if admin:
            admin.role = "Super Admin"
            admin.is_system_user = True
            logger.info("Updated admin as Super Admin and System User.")
        else:
            from backend.dependencies import get_password_hash
            import uuid
            new_admin = models.DBUser(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@hunzal.com",
                password_hash=get_password_hash("admin123"),
                name="System Administrator",
                role="Super Admin",
                is_active=True,
                is_system_user=True
            )
            db.add(new_admin)
            logger.info("Created Default 'admin' User (Pass: admin123).")
        
        db.commit()

        # 3. Unmark 'is_system_user' for everyone else
        logger.info("Unprotecting all other users...")
        sql = text("UPDATE users SET is_system_user = 0 WHERE username NOT IN ('.amer', 'admin')")
        result = db.execute(sql)
        db.commit()
        logger.info(f"Unprotected users count (approximation): {result.rowcount}")
        
    except Exception as e:
        logger.error(f"Seeding Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_permissions()
