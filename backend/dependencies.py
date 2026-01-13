
import os
import datetime
from typing import Optional, List, Union
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt  # Assumes PyJWT is installed as per main.py checks

from backend.database import SessionLocal
from backend import schemas
from backend.config import settings, auth_config
from backend.permissions_config import DEFAULT_ROLE_PERMISSIONS

# Logger
import logging
logger = logging.getLogger(__name__)

# Constants
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_in_production_9s8d7f98s7d9f8s7")
ALGORITHM = "HS256"

# Role Hierarchy
SUPER_ROLES = {"SystemAdmin", "Root", "Super Admin"}
ORG_SETUP_ROLES = {"SystemAdmin", "Root", "Super Admin", "Business Admin"}

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password Utils
def verify_password(plain_password, hashed_password):
    try:
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode("utf-8")
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password)
    except ValueError:
        return False

def get_password_hash(password):
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

# Token Utils
def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(
            minutes=auth_config.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Current User Dependency
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    from backend import models
    user = db.query(models.DBUser).filter(models.DBUser.username == username).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    # Construct dict for legacy compat (logic preserved from main.py)
    user_dict = {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "organization_id": user.organization_id,
        "status": "Active" if user.is_active else "Inactive",
        "avatar": f"https://ui-avatars.com/api/?name={user.username}&background=random",
        "employeeId": user.employee_id,
    }
    return user_dict

def get_user_org(user: dict) -> str:
    """Helper to get organization ID from current user"""
    if "organization_id" in user:
        return user["organization_id"]
    return None

def log_audit_event(db: Session, user: dict, action: str, status: str = "Hashed"):
    """Record an audit log for the current user action"""
    try:
        log_data = schemas.AuditLogCreate(
            organization_id=user.get("organization_id"),
            user=user.get("username", "Unknown"),
            action=action,
            status=status,
            time=datetime.datetime.now().isoformat()
        )
        from backend import crud
        crud.create_audit_log(db, log_data)
    except Exception as e:
        logger.error(f"Failed to log audit event: {e}")

# RBAC Dependencies
def requires_role(*allowed_roles):
    """RBAC Dependency: Ensures user has one of the allowed roles."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "")
        
        # Super roles bypass all checks
        if user_role in SUPER_ROLES:
            return current_user
            
        if user_role in allowed_roles:
            return current_user
            
        raise HTTPException(
            status_code=403,
            detail=f"Access Forbidden: Role '{user_role}' not in allowed roles {allowed_roles}",
        )
    return role_checker

def check_permission(permission: str):
    def permission_checker(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "")
        
        # 1. Super Admin / Root Bypass - Always has all permissions
        if user_role in SUPER_ROLES:
            return current_user
            
        # 2. Check DB Permissions
        from backend import crud
        role_perms = crud.get_role_permissions(db, user_role)
        
        # 3. Fallback to Default Permissions if DB is empty
        if not role_perms:
            role_perms = DEFAULT_ROLE_PERMISSIONS.get(user_role, [])
        
        # 4. Check if permission exists in role permissions
        # Wildcard permission grants all access
        if '*' in role_perms or permission in role_perms:
            return current_user
            
        raise HTTPException(
            status_code=403,
            detail=f"Access Forbidden: Role '{user_role}' lacks permission '{permission}'",
        )
    return permission_checker
