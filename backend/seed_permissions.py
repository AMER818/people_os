
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
from backend import models, crud
from sqlalchemy import text

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Standard Permissions Defaults (Mirroring frontend config/permissions.ts)
# L5, L4, L3 (System roles) vs L2, L1, L0 (Business roles)
DEFAULT_ROLE_PERMISSIONS = {
    # L5: Root - God Mode
    "Root": ["*"],
    
    # L4: Super Admin - Full Application Access
    "Super Admin": ["*"],
    
    # L3: System Admin - Technical Configuration ONLY (No Business Logic)
    "SystemAdmin": [
        "view_dashboard",
        "create_users", "edit_users", "delete_users",
        "view_audit_logs",
        "system_config",
        "manage_api_keys",
        "backup_restore",
        # EXCLUDED: manage_employees, manage_payroll, manage_recruitment, etc.
    ],
    
    # L2: Business Admin - Business Operations ONLY (No System Config)
    "Business Admin": [
        "view_dashboard",
        "manage_employees", "create_employee", "edit_employee", "delete_employee",
        "manage_payroll", "run_payroll", "view_salary",
        "manage_recruitment", "view_candidates", "edit_candidate",
        "view_departments", "manage_master_data",
        "view_reports",
        # EXCLUDED: system_config, create_users, delete_users, view_audit_logs
    ],
    
    # L1: Manager - Team-Level Access (View/Approve for direct reports only)
    "Manager": [
        "view_dashboard",
        "view_employees",  # Can view employees (filtered to team)
        "view_team",       # View direct reports
        "view_leaves",     # View team leaves
        "approve_leaves",  # Approve leaves for team
        # EXCLUDED: Create/Edit/Delete, Global visibility
    ],
    
    # L0: User - Self-Service Only (Own Data)
    "User": [
        "view_dashboard",
        "view_profile",    # Own profile only
        "view_own_leaves", # Own leaves only
        # EXCLUDED: Any other data
    ]
}

def seed_permissions():
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
        
        # 2. Ensure admin (Super Admin)
        admin = db.query(models.DBUser).filter(models.DBUser.username == "admin").first()
        if admin:
            admin.role = "Super Admin"
            admin.is_system_user = True
            logger.info("Updated admin as Super Admin and System User.")
        
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
