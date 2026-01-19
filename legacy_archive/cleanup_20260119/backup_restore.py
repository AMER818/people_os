import logging
from datetime import datetime, date
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
import backend.domains.core.models as core_models
import backend.domains.hcm.models as hcm_models


logger = logging.getLogger(__name__)

# List of models to backup
# Order matters less if we disable FKs during restore, but good practice
# to keep top-level first
BACKUP_MODELS = [
    # Core Models
    core_models.DBOrganization,
    core_models.DBUser,
    core_models.DBDepartment,
    core_models.DBSubDepartment,
    core_models.DBHRPlant,
    core_models.DBPlantDivision,
    core_models.DBApiKey,
    core_models.DBWebhook,
    core_models.DBAuditLog,

    # HCM Models
    hcm_models.DBEmployee,
    hcm_models.DBDesignation,
    hcm_models.DBGrade,
    hcm_models.DBJobLevel,
    hcm_models.DBShift,
]


def serialize_value(val: Any) -> Any:
    """Helper to serialize datetime and other non-JSON types"""
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    return val


def model_to_dict(obj: Any) -> Dict[str, Any]:
    """Convert SQLAlchemy model instance to dictionary"""
    return {
        c.key: serialize_value(getattr(obj, c.key))
        for c in inspect(obj).mapper.column_attrs
    }


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
            backup_data["data"][table_name] = [
                model_to_dict(record) for record in records
            ]
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
        # Disable Foreign Key checks for out-of-order insertion/deletion
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
                    # Let SQLAlchemy handle str->datetime conversion
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
