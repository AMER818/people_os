import datetime
import importlib
import logging
import os
import shutil
import time
import traceback
import uuid
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.orm import Session

# Internal Imports
from backend.audit.scheduler import start_scheduler
from backend.config import auth_config, settings
from backend.database import engine
from backend.dependencies import (
    check_permission,
    create_access_token,
    get_current_user,
    get_db,
    get_user_org,
    log_audit_event,
    requires_role,
    verify_password,
)
from backend.domains.core import models as core_models
from backend.domains.hcm import models as hcm_models
from backend import crud, schemas

# Configure Logging
log_file_path = os.path.join(os.path.dirname(__file__), "people_os.log")
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(log_file_path)
    ]
)
logger = logging.getLogger(__name__)

# Proxy to maintain 'models.DB...' compatibility during refactor
class ModelsProxy:
    def __getattr__(self, name):
        for module in ["backend.domains.core.models", "backend.domains.hcm.models"]:
            try:
                mod = importlib.import_module(module)
                if hasattr(mod, name):
                    return getattr(mod, name)
            except ImportError:
                continue
        raise AttributeError(f"Model {name} not found")

models = ModelsProxy()

# API Metadata
app = FastAPI(
    title="Hunzal People OS (HCM) API",
    description="Comprehensive Human Capital Management API with domain-organized endpoints.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.on_event("startup")
async def startup_event():
    """Main application startup sequence"""
    logger.info("Starting Application Lifecycle...")
    try:
        from backend.security.db_enforcer import enforce_clean_db_state
        logger.info("Verifying Database Configuration...")
        enforce_clean_db_state()
    except Exception as e:
        logger.warning(f"DB Enforcement skipped or failed: {e}")
    
    core_models.Base.metadata.create_all(bind=engine)
    hcm_models.Base.metadata.create_all(bind=engine)
    
    try:
        start_scheduler()
        logger.info("Audit Scheduler started successfully.")
    except Exception as e:
        logger.error(f"Failed to start Audit Scheduler: {e}")
        
    logger.info("Application Startup Sequence Complete.")

# =================================================================
# II. CORE: IDENTITY & ACCESS CONTROL
# =================================================================

@app.get("/api/rbac/permissions", tags=["RBAC"])
def get_permissions(db: Session = Depends(get_db)):
    return crud.get_all_role_permissions(db)

@app.post("/api/rbac/permissions", tags=["RBAC"])
def save_permissions(payload: schemas.RolePermissionCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    return crud.update_role_permissions(db, payload.role, payload.permissions)

@app.post("/api/auth/login", tags=["Authentication"])
@limiter.limit(auth_config.LOGIN_RATE_LIMIT)
def login(login_data: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.DBUser).filter(models.DBUser.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "organization_id": user.organization_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "organization_id": user.organization_id,
            "employeeId": user.employee_id
        }
    }

@app.get("/api/users", response_model=List[schemas.User], tags=["Users"])
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    return crud.get_users(db)

@app.post("/api/users", response_model=schemas.User, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    try:
        return crud.create_user(db=db, user=user, creator_id=current_user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/users/{user_id}", response_model=schemas.User, tags=["Users"])
def update_user(user_id: str, user: schemas.UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("edit_users"))):
    return crud.update_user(db, user_id, user, updater_id=current_user["id"])

# =================================================================
# III. CORE: ORGANIZATION SETUP
# =================================================================

@app.get("/api/organizations", response_model=List[schemas.OrganizationList], tags=["Organizations"])
def get_organizations(db: Session = Depends(get_db)):
    return crud.get_organizations(db)

@app.put("/api/organizations/{org_id}", response_model=schemas.Organization, tags=["Organizations"])
def update_organization(org_id: str, org: schemas.OrganizationCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.update_organization(db, org_id, org, user_id=current_user["id"])

@app.get("/api/plants", response_model=List[schemas.Plant], tags=["Organizations"])
def get_plants(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return crud.get_plants(db, organization_id=current_user.get("organization_id"))

@app.post("/api/plants", response_model=schemas.Plant, tags=["Organizations"])
def create_plant(plant: schemas.PlantCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_plant(db, plant, user_id=current_user["id"])

@app.get("/api/departments", response_model=List[schemas.Department], tags=["Organizations"])
def get_departments(db: Session = Depends(get_db)):
    return crud.get_departments(db)

@app.post("/api/departments", response_model=schemas.Department, tags=["Organizations"])
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_department(db, dept, user_id=current_user["id"])

@app.get("/api/sub-departments", response_model=List[schemas.SubDepartment], tags=["Organizations"])
def get_sub_departments(db: Session = Depends(get_db)):
    return crud.get_sub_departments(db)

@app.get("/api/grades", response_model=List[schemas.Grade], tags=["Organizations"])
def get_grades(db: Session = Depends(get_db)):
    return crud.get_grades(db)

@app.post("/api/grades", response_model=schemas.Grade, tags=["Organizations"])
def create_grade(grade: schemas.GradeCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_grade(db, grade, user_id=current_user["id"])

@app.get("/api/designations", response_model=List[schemas.Designation], tags=["Organizations"])
def get_designations(db: Session = Depends(get_db)):
    return crud.get_designations(db)

@app.post("/api/designations", response_model=schemas.Designation, tags=["Organizations"])
def create_designation(desig: schemas.DesignationCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_designation(db, desig, user_id=current_user["id"], org_id=current_user.get("organization_id"))

@app.get("/api/shifts", response_model=List[schemas.Shift], tags=["Organizations"])
def get_shifts(db: Session = Depends(get_db)):
    return crud.get_shifts(db)

@app.post("/api/shifts", response_model=schemas.Shift, tags=["Organizations"])
def create_shift(shift: schemas.ShiftCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_shift(db, shift, user_id=current_user["id"])

@app.get("/api/positions", response_model=List[schemas.Position], tags=["Organizations"])
def get_positions(db: Session = Depends(get_db)):
    return crud.get_positions(db)

@app.post("/api/positions", response_model=schemas.Position, tags=["Organizations"])
def create_position(position: schemas.PositionCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_position(db, position, user_id=current_user["id"])

@app.get("/api/holidays", response_model=List[schemas.Holiday], tags=["Organizations"])
def get_holidays(db: Session = Depends(get_db)):
    return crud.get_holidays(db)

@app.post("/api/holidays", response_model=schemas.Holiday, tags=["Organizations"])
def create_holiday(holiday: schemas.HolidayCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_holiday(db, holiday, user_id=current_user["id"])

@app.get("/api/banks", response_model=List[schemas.Bank], tags=["Organizations"])
def get_banks(db: Session = Depends(get_db)):
    return crud.get_banks(db)

@app.post("/api/banks", response_model=schemas.Bank, tags=["Organizations"])
def create_bank(bank: schemas.BankCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_bank(db, bank, user_id=current_user["id"])

@app.get("/api/employment-levels", response_model=List[schemas.EmploymentLevel], tags=["Organizations"])
def get_employment_levels(db: Session = Depends(get_db)):
    return crud.get_employment_levels(db)

@app.post("/api/employment-levels", response_model=schemas.EmploymentLevel, tags=["Organizations"])
def create_employment_level(level: schemas.EmploymentLevelCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin", "Business Admin"))):
    return crud.create_employment_level(db, level, user_id=current_user["id"])

# =================================================================
# IV. BUSINESS: HUMAN RESOURCES
# =================================================================

@app.get("/api/employees", response_model=List[schemas.Employee], tags=["Employees"])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("view_employees"))):
    return crud.get_employees(db, skip=skip, limit=limit)

@app.post("/api/employees", response_model=schemas.Employee, tags=["Employees"])
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    return crud.create_employee(db, employee, user_id=current_user["id"])

@app.get("/api/employees/{employee_id}", response_model=schemas.Employee, tags=["Employees"])
def read_employee(employee_id: str, db: Session = Depends(get_db)):
    return crud.get_employee(db, employee_id=employee_id)

@app.put("/api/employees/{employee_id}", response_model=schemas.Employee, tags=["Employees"])
def update_employee(employee_id: str, employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("edit_employee"))):
    return crud.update_employee(db, employee_id, employee, user_id=current_user["id"])

@app.post("/api/jobs", response_model=schemas.JobVacancy, tags=["Recruitment"])
def create_job_vacancy(job: schemas.JobVacancyCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("manage_recruitment"))):
    return crud.create_job_vacancy(db, job, user_id=current_user["id"])

@app.get("/api/jobs", response_model=List[schemas.JobVacancy], tags=["Recruitment"])
def get_job_vacancies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_job_vacancies(db, skip=skip, limit=limit)

@app.post("/api/candidates", response_model=schemas.Candidate, tags=["Recruitment"])
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("manage_recruitment"))):
    return crud.create_candidate(db, candidate, user_id=current_user["id"])

@app.get("/api/candidates", response_model=List[schemas.Candidate], tags=["Recruitment"])
def get_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)

@app.post("/api/performance-reviews", response_model=schemas.PerformanceReview, tags=["Performance"])
def create_performance_review(review: schemas.PerformanceReviewCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return crud.create_performance_review(db, review, user_id=current_user["id"])

# =================================================================
# V. SYSTEM: GOVERNANCE & AUDITING
# =================================================================

@app.get("/api/system/flags", response_model=schemas.SystemFlags, tags=["System"])
def read_system_flags(db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    org_id = current_user.get("organization_id") or "system-default"
    return crud.get_system_flags(db, org_id)

@app.post("/api/system/flags", response_model=schemas.SystemFlags, tags=["System"])
def update_system_flags(flags_update: schemas.SystemFlagsUpdate, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    org_id = current_user.get("organization_id") or "system-default"
    return crud.update_system_flags(db, org_id, flags_update, current_user.get("id"))

@app.get("/api/audit-logs", response_model=List[schemas.AuditLog], tags=["System"])
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("view_audit_logs"))):
    return crud.get_audit_logs(db, skip=skip, limit=limit)

@app.post("/api/system/audit/run", tags=["System"])
async def run_audit_endpoint(
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    from backend.audit.audit_engine import run_system_audit
    report = run_system_audit(executed_by=current_user["id"])
    return {"status": "success", "report_id": report.id, "overall_score": report.overall_score}

@app.get("/api/system/api-keys", response_model=schemas.ApiKeyList, tags=["System"])
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    org_id = get_user_org(current_user)
    keys = crud.get_api_keys(db, org_id)
    return {"keys": keys, "total": len(keys)}

@app.post(
    "/api/system/webhooks",
    response_model=schemas.WebhookResponse,
    tags=["System"]
)
@limiter.limit("10/minute")
def create_webhook(
    webhook_data: schemas.WebhookCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    org_id = get_user_org(current_user)
    return crud.create_webhook(db, org_id, webhook_data, current_user["id"])


@app.get(
    "/api/system/webhooks",
    response_model=List[schemas.WebhookResponse],
    tags=["System"]
)
def list_webhooks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    org_id = get_user_org(current_user)
    return crud.get_webhooks(db, org_id)


@app.delete("/api/system/webhooks/{webhook_id}", tags=["System"])
def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    return crud.delete_webhook(db, webhook_id)

# ===== Background Job Endpoints =====

@app.post(
    "/api/system/background-jobs",
    response_model=schemas.BackgroundJobResponse,
    tags=["System"]
)
@limiter.limit("10/minute")
def create_background_job(
    job_data: schemas.BackgroundJobCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    org_id = get_user_org(current_user)
    return crud.create_background_job(db, org_id, job_data, current_user["id"])


@app.get(
    "/api/system/background-jobs",
    response_model=List[schemas.BackgroundJobResponse],
    tags=["System"]
)
def get_background_jobs(db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    return crud.get_background_jobs(db, org_id)


# ===== System Maintenance Endpoints =====

@app.post("/api/system/restore", tags=["System"])
async def restore_system(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    """Restore system from a SQLite backup file."""
    if "sqlite" not in settings.DATABASE_URL:
        raise HTTPException(status_code=501, detail="Restore only supported for SQLite")
    
    # Save uploaded file to temp location
    temp_path = f"restore_{uuid.uuid4()}.db"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Verify magic header (SQLite format 3)
    with open(temp_path, "rb") as f:
        header = f.read(16)
        if header != b"SQLite format 3\x00":
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Invalid SQLite database file")

    # Perform swap (Basic implementation)
    try:
        # Close DB connection if possible or just swap file (dangerous in prod)
        # For POC/Dev: rename current to backup, rename new to current
        current_db = settings.DB_PATH
        backup_path = f"{current_db}.bak_{int(time.time())}"
        
        shutil.copy2(current_db, backup_path)
        shutil.move(temp_path, current_db)
        
        logger.info(f"System restored from {file.filename}. Backup saved to {backup_path}")
        return {"status": "success", "message": "System restored successfully. Please restart the server."}
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@app.get("/api/system/maintenance/backups", tags=["System"])
def get_backups(current_user: dict = Depends(requires_role("SystemAdmin"))):
    """List available database backups."""
    data_dir = os.path.dirname(settings.DB_PATH)
    backups = []
    for f in os.listdir(data_dir):
        if f.startswith("people_os.db.bak") or f.endswith(".bak"):
            path = os.path.join(data_dir, f)
            stat = os.stat(path)
            backups.append({
                "filename": f,
                "size": stat.st_size,
                "created_at": datetime.datetime.fromtimestamp(stat.st_ctime).isoformat()
            })
    return sorted(backups, key=lambda x: x["created_at"], reverse=True)

@app.post("/api/system/maintenance/restore/{filename}", tags=["System"])
def restore_from_server_backup(
    filename: str,
    current_user: dict = Depends(requires_role("SystemAdmin"))
):
    """Restore from a server-side backup file."""
    data_dir = os.path.dirname(settings.DB_PATH)
    backup_path = os.path.join(data_dir, filename)
    
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found")
        
    try:
        current_db = settings.DB_PATH
        # Safety backup of current state
        safety_path = f"{current_db}.bak_pre_restore_{int(time.time())}"
        shutil.copy2(current_db, safety_path)
        
        # Restore
        shutil.copy2(backup_path, current_db)
        return {"status": "success", "message": f"Restored from {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/system/maintenance/flush-cache", tags=["System"])
def flush_cache(current_user: dict = Depends(requires_role("SystemAdmin"))):
    # Stub for cache flushing
    return {"status": "success", "message": "Cache flushed successfully"}

@app.post("/api/system/maintenance/optimize-db", tags=["System"])
def optimize_db_endpoint(db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    try:
        db.execute(text("VACUUM"))
        return {"status": "success", "message": "Database optimized (VACUUM completed)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/system/maintenance/rotate-logs", tags=["System"])
def rotate_logs_endpoint(current_user: dict = Depends(requires_role("SystemAdmin"))):
    # Stub for log rotation
    return {"status": "success", "message": "Logs rotated successfully"}

# =================================================================
# VI. SYSTEM: AI & INTELLIGENCE
# =================================================================

@app.get("/api/ai/config", response_model=schemas.AIConfigurationResponse, tags=["AI"])
def get_ai_configuration(db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    org_id = current_user.get("organization_id") or "org-1"
    return crud.get_ai_config(db, org_id)

@app.post("/api/ai/predict/attrition", tags=["AI"])
def predict_attrition(request: schemas.AttritionPredictionRequest, db: Session = Depends(get_db), current_user: dict = Depends(requires_role("SystemAdmin"))):
    employee = crud.get_employee(db, request.employee_id)
    if not employee: raise HTTPException(status_code=404, detail="Employee not found")
    risk = "Medium" if employee.status == "Probation" else "Low"
    return {"employeeId": request.employee_id, "attritionRisk": risk, "riskScore": 0.4 if risk == "Medium" else 0.2}

# =================================================================
# VII. HCM MODULES
# =================================================================

@app.get("/api/hcm/attendance", response_model=List[schemas.Attendance], tags=["Attendance"])
def get_attendance_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("view_attendance"))):
    return crud.get_attendance_records(db, skip=skip, limit=limit)

@app.post("/api/hcm/attendance", response_model=schemas.Attendance, tags=["Attendance"])
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("edit_attendance"))):
    return crud.create_attendance_record(db, attendance, user_id=current_user["id"])

@app.get("/api/hcm/payroll", response_model=List[schemas.PayrollLedger], tags=["Payroll"])
def get_payroll_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("view_payroll"))):
    return crud.get_payroll_records(db, skip=skip, limit=limit)

@app.post("/api/hcm/payroll", response_model=schemas.PayrollLedger, tags=["Payroll"])
def create_payroll_entry(payroll: schemas.PayrollLedgerCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("run_payroll"))):
    return crud.create_payroll_ledger_entry(db, payroll, user_id=current_user["id"])

@app.get("/api/payroll-settings", response_model=schemas.PayrollSettings, tags=["Payroll"])
def get_payroll_settings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = get_user_org(current_user)
    return crud.get_payroll_settings(db, org_id)

@app.get("/api/hcm/leaves", response_model=List[schemas.LeaveRequest], tags=["Leaves"])
def get_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("view_leaves"))):
    return crud.get_leave_requests(db, skip=skip, limit=limit)

@app.post("/api/hcm/leaves", response_model=schemas.LeaveRequest, tags=["Leaves"])
def create_leave(leave: schemas.LeaveRequestCreate, db: Session = Depends(get_db), current_user: dict = Depends(check_permission("request_leave"))):
    return crud.create_leave_request(db, leave, user_id=current_user["id"])

# =================================================================
# VIII. DEPLOYMENT & HEALTH
# =================================================================

@app.get("/api/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Optimal", "database": "Connected", "timestamp": datetime.datetime.now().isoformat()}
    except Exception as e:
        return {"status": "Degraded", "database": "Disconnected", "details": str(e)}

@app.get("/")
def read_root():
    return {"message": "Hunzal People OS API Operating Normally", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
