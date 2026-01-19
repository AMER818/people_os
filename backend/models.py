"""
PeopleOS Backend Models (Legacy/Deprecated)
===========================================
This file previously defined all models.
It is now DEPRECATED.
All models have been migrated to:
- backend.domains.core.models
- backend.domains.hcm.models

This file remains as an empty shell to prevent import errors in legacy code,
but defines NO models to avoid SQLAlchemy Table duplication errors.
"""
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# ALL MODELS MOVED TO DOMAINS
# DO NOT ADD NEW MODELS HERE
