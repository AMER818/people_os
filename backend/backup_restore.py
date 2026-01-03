import json
import logging
from datetime import datetime, date
from typing import List, Dict, Any, Type
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from . import models

logger = logging.getLogger(__name__)

# List of models to backup
# Order matters less if we disable FKs during restore, but good practice to keep top-level first
BACKUP_MODELS = [
    models.DBOrganization,
    models.DBUser,
    models.DBEmployee,
    models.DBDepartment,
    models.DBSubDepartment,
    models.DBDesignation,
    models.DBGrade,
    models.DBEmploymentLevel,
    models.DBHRPlant,
    models.DBPlantDivision,
    models.DBShift,
    models.DBHoliday,
    models.DBBank,
    models.DBJobVacancy,
    models.DBCandidate,
    models.DBSystemFlags,
    models.DBApiKey,
    models.DBWebhook,
    models.DBAuditLog,
    models.DBAIConfiguration,
    models.DBNotificationSettings,
    models.DBComplianceSettings,
    models.DBPayrollSettings,
    models.DBRolePermission,
    # Add other models as needed
]

def serialize_value(val: Any) -> Any:
    """Helper to serialize datetime and other non-JSON types"""
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    return val

def model_to_dict(obj: Any) -> Dict[str, Any]:
    """Convert SQLAlchemy model instance to dictionary"""
    return {c.key: serialize_value(getattr(obj, c.key)) for c in inspect(obj).mapper.column_attrs}

def create_backup(db: Session) -> Dict[str, Any]:
    """
    Generate a full system backup.
    Returns a dictionary containing all table data.
    """
    backup_data = {
        "meta": {
            "version": "1.0",
            "timestamp": datetime.now().isoformat(),
            "type": "full_backup"
        },
        "data": {}
    }

    try:
        for model in BACKUP_MODELS:
            table_name = model.__tablename__
            records = db.query(model).all()
            backup_data["data"][table_name] = [model_to_dict(record) for record in records]
            logger.info(f"Backed up {len(records)} records from {table_name}")
            
        return backup_data
    except Exception as e:
        logger.error(f"Backup generation failed: {e}")
        raise e

def restore_backup(db: Session, backup_data: Dict[str, Any]):
    """
    Restore system from backup data.
    WARNING: This wipes existing data.
    """
    if "data" not in backup_data or "meta" not in backup_data:
        raise ValueError("Invalid backup format")

    try:
        # Disable Foreign Key checks to allow out-of-order insertion/deletion
        db.execute(text("PRAGMA foreign_keys = OFF"))
        
        # 1. Clear existing data
        for model in reversed(BACKUP_MODELS):
            table_name = model.__tablename__
            db.query(model).delete()
            logger.info(f"Cleared table {table_name}")
        
        # 2. Insert new data
        data_map = backup_data["data"]
        
        for model in BACKUP_MODELS:
            table_name = model.__tablename__
            if table_name in data_map:
                records = data_map[table_name]
                for record_data in records:
                    # Parse datetimes if necessary, or let SQLAlchemy handle str->datetime if supported
                    # Usually SA is good with ISO strings for DateTime columns if driver supports it
                    # But sqlite might need help or just stores as string.
                    # For safety, let's try to pass as is.
                    obj = model(**record_data)
                    db.add(obj)
                logger.info(f"Restored {len(records)} records to {table_name}")
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        logger.error(f"Restore failed: {e}")
        raise e
    finally:
        # Re-enable Foreign Key checks
        db.execute(text("PRAGMA foreign_keys = ON"))
