import json
from datetime import datetime
from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class AuditBase(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# --- Secondary Tab Schemas ---


class EducationCreate(BaseModel):
    degree: str
    institute: str
    year: str
    grade_gpa: str = Field(..., alias="gradeGpa")
    marks_obtained: float = Field(..., alias="marksObtained")
    total_marks: float = Field(..., alias="totalMarks")

    class Config:
        populate_by_name = True


class Education(EducationCreate, AuditBase):
    id: int

    class Config:
        from_attributes = True


class ExperienceCreate(BaseModel):
    org_name: str = Field(..., alias="orgName")
    designation: str
    from_: str = Field(..., alias="from")
    to: str
    gross_salary: float = Field(..., alias="grossSalary")
    remarks: str

    class Config:
        populate_by_name = True


class Experience(ExperienceCreate, AuditBase):
    id: int

    class Config:
        from_attributes = True


class FamilyCreate(BaseModel):
    name: str
    relationship: str
    dob: str


class Family(FamilyCreate, AuditBase):
    id: int

    class Config:
        from_attributes = True


class DisciplineCreate(BaseModel):
    date: str
    description: str
    outcome: str


class Discipline(DisciplineCreate, AuditBase):
    id: int

    class Config:
        from_attributes = True


class IncrementCreate(BaseModel):
    effective_date: str = Field(..., alias="effectiveDate")
    new_gross: float = Field(..., alias="newGross")
    type: str  # increment_type
    remarks: str

    # Optional fields from frontend state (PayrollTab.tsx)
    new_house_rent: float | None = Field(0, alias="newHouseRent")
    new_utility_allowance: float | None = Field(0, alias="newUtilityAllowance")
    new_other_allowance: float | None = Field(0, alias="newOtherAllowance")

    class Config:
        populate_by_name = True


class Increment(IncrementCreate, AuditBase):
    id: int

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    role: Optional[str] = None
    department: Optional[str] = None
    status: str = "Active"
    join_date: Optional[str] = None
    date_of_birth: Optional[str] = Field(None, alias="dateOfBirth")
    hire_date: Optional[str] = Field(None, alias="hireDate")
    employment_type: Optional[str] = Field(None, alias="employmentType")
    email: str
    phone: Optional[str] = None
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class EmployeeCreate(EmployeeBase):
    id: Optional[str] = None
    department_id: str | None = None
    designation_id: str | None = None
    grade_id: str | None = None
    plant_id: str | None = None
    shift_id: str | None = None

    education: list["EducationCreate"] = []
    experience: list["ExperienceCreate"] = []
    family: list["FamilyCreate"] = []
    discipline: list["DisciplineCreate"] = []
    increments: list["IncrementCreate"] = []

    @model_validator(mode="before")
    @classmethod
    def populate_missing_fields(cls, data):
        # Auto-populate name from firstName/lastName if missing
        if isinstance(data, dict):
            first = data.get("firstName") or data.get("first_name")
            last = data.get("lastName") or data.get("last_name")
            if not data.get("name") and (first or last):
                data["name"] = (f"{first or ''} {last or ''}".strip() or "Unknown")
            
            # Auto-populate join_date from hireDate if missing
            hire = data.get("hireDate") or data.get("hire_date")
            if not data.get("join_date") and hire:
                data["join_date"] = hire
        return data


class Employee(EmployeeBase, AuditBase):
    id: str
    department_id: str | None = None
    designation_id: str | None = None
    grade_id: str | None = None
    plant_id: str | None = None
    shift_id: str | None = None

    education: list["Education"] = []
    experience: list["Experience"] = []
    family: list["Family"] = []
    discipline: list["Discipline"] = []
    increments: list["Increment"] = []

    class Config:
        from_attributes = True


class CandidateBase(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    email: str
    phone: Optional[str] = None
    position_applied: str = Field(..., alias="positionApplied")
    current_stage: str = Field("Applied", alias="currentStage")
    score: int = 0
    resume_url: Optional[str] = Field(None, alias="resumeUrl")
    skills: Union[list[str], str] = []
    applied_date: str = Field(..., alias="appliedDate")
    avatar: Optional[str] = None
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class CandidateCreate(CandidateBase):
    id: str


class Candidate(
    CandidateBase, AuditBase
):  # Changed AuditMixin to AuditBase to match existing class name
    id: str

    @field_validator("skills", mode="before")
    def parse_skills(cls, v):
        if isinstance(v, str):
            return v.split(",") if v else []
        return v

    class Config:
        from_attributes = True


class PlantDivisionBase(BaseModel):
    name: str
    code: str
    is_active: bool = Field(True, alias="isActive")

    class Config:
        populate_by_name = True


class PlantDivisionCreate(PlantDivisionBase):
    id: Optional[str] = None
    plant_id: Optional[str] = Field(None, alias="plantId")


class PlantDivision(PlantDivisionBase, AuditBase):
    id: str
    plant_id: Optional[str] = Field(None, alias="plantId")

    class Config:
        from_attributes = True


class PlantBase(BaseModel):
    name: str
    location: Optional[str] = None
    code: str
    head_of_plant: Optional[str] = Field(None, alias="headOfPlant")
    contact_number: Optional[str] = Field(None, alias="contactNumber")
    is_active: bool = Field(True, alias="isActive")
    current_sequence: int = Field(0, alias="currentSequence")

    class Config:
        populate_by_name = True


class PlantCreate(PlantBase):
    id: Optional[str] = None
    organization_id: Optional[str] = Field(None, alias="organizationId")
    divisions: list[PlantDivisionCreate] = []


class Plant(PlantBase, AuditBase):
    id: str
    organization_id: str = Field(..., alias="organizationId")
    divisions: list[PlantDivision] = Field(default=[])
    plant_id: Optional[str] = Field(None, alias="plantId")  # Fix for validation error

    class Config:
        from_attributes = True
        populate_by_name = True



class JobLevelBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class JobLevelCreate(JobLevelBase):
    id: Optional[str] = None


class JobLevel(JobLevelBase, AuditBase):
    id: str

    class Config:
        from_attributes = True
        populate_by_name = True


class OrganizationBase(BaseModel):
    id: Optional[str] = None
    code: Optional[str] = "ORG001"
    name: str = "My Organization"
    is_active: bool = Field(True, alias="isActive")
    head_id: Optional[str] = Field(None, alias="headId")

    # Modern fields (matching OrganizationProfile interface in frontend)
    industry: Optional[str] = None
    currency: Optional[str] = "PKR"
    tax_year_end: Optional[str] = Field(None, alias="taxYearEnd")

    # Contact & Location
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address_line1: Optional[str] = Field(None, alias="addressLine1")
    address_line2: Optional[str] = Field(None, alias="addressLine2")
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = Field(None, alias="zipCode")
    country: Optional[str] = None

    # Legal
    tax_id: Optional[str] = Field(None, alias="taxId")
    registration_number: Optional[str] = Field(None, alias="registrationNumber")
    founded_date: Optional[str] = Field(None, alias="foundedDate")
    logo: Optional[str] = None
    cover_url: Optional[str] = Field(None, alias="coverUrl")
    description: Optional[str] = None
    social_links: Optional[Any] = Field(None, alias="socialLinks")

    class Config:
        populate_by_name = True


class OrganizationCreate(OrganizationBase):
    pass


class Organization(OrganizationBase, AuditBase):
    id: str
    plants: list[Plant] = []

    @field_validator("social_links", mode="before")
    def parse_social_links(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return v
        return v

    class Config:
        from_attributes = True


class OrganizationList(OrganizationBase, AuditBase):
    """Schema for organization list without nested plants to avoid lazy loading."""
    id: str

    @field_validator("social_links", mode="before")
    def parse_social_links(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return v
        return v

    class Config:
        from_attributes = True


# --- Org Settings Schemas ---


class DepartmentCreate(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")
    # plant_id removed
    hod_id: Optional[str] = Field(None, alias="hodId")

    @field_validator("code")
    @classmethod
    def capitalize_code(cls, v: str) -> str:
        return v.upper() if v else v

    class Config:
        populate_by_name = True


class Department(DepartmentCreate, AuditBase):
    hod_id: Optional[str] = Field(None, alias="hodId")
    pass

    class Config:
        from_attributes = True


class SubDepartmentCreate(BaseModel):
    id: Optional[str] = None
    code: Optional[str] = None # Optional now, will be auto-generated in CRUD if missing
    name: str
    parent_department_id: str = Field(..., alias="parentDepartmentId")
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")

    @field_validator("code")
    @classmethod
    def capitalize_code(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v

    class Config:
        populate_by_name = True


class SubDepartment(SubDepartmentCreate, AuditBase):
    pass

    class Config:
        from_attributes = True


class GradeCreate(BaseModel):
    id: Optional[str] = None
    name: str
    level: int = 0
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")
    job_level_id: str = Field(..., alias="jobLevelId")

    class Config:
        populate_by_name = True


class Grade(AuditBase):
    id: str
    name: str
    level: int
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")
    jobLevelId: str = Field(..., validation_alias="job_level_id")

    class Config:
        from_attributes = True
        populate_by_name = True


class DesignationCreate(BaseModel):
    id: Optional[str] = None
    name: str
    grade_id: str = Field(..., alias="gradeId")
    department_id: Optional[str] = Field(None, alias="departmentId")
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class Designation(DesignationCreate, AuditBase):
    id: str

    class Config:
        from_attributes = True


class ShiftCreate(BaseModel):
    id: Optional[str] = None
    name: str
    code: str
    type: Optional[str] = None
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    grace_period: Optional[int] = Field(0, alias="gracePeriod")
    break_duration: Optional[int] = Field(0, alias="breakDuration")
    work_days: Optional[list[str]] = Field([], alias="workDays")
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")
    color: Optional[str] = None
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class Shift(AuditBase):
    id: str
    name: str
    code: Optional[str] = None
    type: Optional[str] = None
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    grace_period: Optional[int] = Field(0, alias="gracePeriod")
    break_duration: Optional[int] = Field(0, alias="breakDuration")
    work_days: Optional[str] = Field(None, alias="workDays")
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True


# --- Employment Level Schemas ---
class EmploymentLevelCreate(BaseModel):
    id: Optional[str] = None
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = Field(True, alias="isActive")
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class EmploymentLevel(AuditBase):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    organization_id: Optional[str] = None

    class Config:
        from_attributes = True


# --- Position Schemas ---
class PositionCreate(BaseModel):
    id: Optional[str] = None
    title: str
    department_id: Optional[str] = Field(None, alias="departmentId")
    grade_id: Optional[str] = Field(None, alias="gradeId")
    reports_to: Optional[str] = Field(None, alias="reportsTo")
    description: Optional[str] = None
    is_active: bool = True
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class Position(AuditBase):
    id: str
    title: str
    department_id: Optional[str] = None
    grade_id: Optional[str] = None
    designation_id: Optional[str] = None
    reports_to: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    organization_id: Optional[str] = None

    class Config:
        from_attributes = True


# --- Holiday Schemas ---
class HolidayCreate(BaseModel):
    id: Optional[str] = None
    name: str
    date: str
    type: Optional[str] = None
    is_recurring: bool = False
    description: Optional[str] = None
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class Holiday(AuditBase):
    id: str
    name: str
    date: str
    type: Optional[str] = None
    is_recurring: bool = False
    description: Optional[str] = None
    organization_id: Optional[str] = None

    class Config:
        from_attributes = True


# --- Bank Schemas ---
class BankCreate(BaseModel):
    id: Optional[str] = None
    bank_name: str = Field(..., alias="bankName")
    account_number: str = Field(..., alias="accountNumber")
    account_title: Optional[str] = Field(None, alias="accountTitle")
    branch: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = Field(None, alias="swiftCode")
    currency: str = "PKR"
    is_active: bool = True
    organization_id: Optional[str] = Field(None, alias="organizationId")

    class Config:
        populate_by_name = True


class Bank(AuditBase):
    id: str
    bank_name: str
    account_number: str
    account_title: Optional[str] = None
    branch: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    currency: str = "PKR"
    is_active: bool = True
    organization_id: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogBase(BaseModel):
    user: str
    action: str
    status: str
    time: str
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class AuditLogCreate(AuditLogBase):
    pass


class AuditLog(AuditLogBase):
    id: str

    class Config:
        from_attributes = True


class JobVacancyBase(BaseModel):
    title: str
    department: str
    location: str
    type: str
    posted_date: str = Field(..., alias="postedDate")
    status: str
    applicants_count: int = Field(0, alias="applicants")
    description: str = ""
    requirements: list[str] = []
    salary_range: str = Field("", alias="salaryRange")
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class JobVacancyCreate(JobVacancyBase):
    id: str


class JobVacancy(JobVacancyBase, AuditBase):
    id: str

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    title: str
    category: str
    progress: int = 0
    metric: str
    status: str
    due_date: str = Field(..., alias="dueDate")
    weight: int = 1
    description: str
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class GoalCreate(GoalBase):
    id: str


class Goal(GoalBase, AuditBase):
    id: str

    class Config:
        from_attributes = True


class PerformanceReviewBase(BaseModel):
    employee_id: str = Field(..., alias="employeeId")
    review_period: str = Field(..., alias="reviewPeriod")
    status: str
    score: int
    feedback: str
    reviewer_id: str = Field(..., alias="reviewerId")
    review_date: str = Field(..., alias="reviewDate")
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class PerformanceReviewCreate(PerformanceReviewBase):
    id: str


class PerformanceReview(PerformanceReviewBase, AuditBase):
    id: str

    class Config:
        from_attributes = True


# --- User Schemas ---


class UserBase(BaseModel):
    username: str
    role: str
    name: Optional[str] = None  # Full name for display
    email: Optional[str] = None  # Email for account recovery
    organization_id: Optional[str] = Field(None, alias="organizationId")
    employee_id: Optional[str] = Field(None, alias="employeeId")
    status: Optional[str] = "Active"  # string status
    is_system_user: Optional[bool] = Field(
        None, alias="isSystemUser"
    )  # System admin flag

    class Config:
        populate_by_name = True


class UserCreate(UserBase):
    id: Optional[str] = None
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    organization_id: str = Field(..., alias="organizationId")
    employeeId: Optional[str] = None
    status: Optional[str] = None
    profileStatus: Optional[str] = None  # Support frontend sending profileStatus
    name: Optional[str] = None
    email: Optional[str] = None
    is_system_user: Optional[bool] = Field(None, alias="isSystemUser")

    class Config:
        populate_by_name = True


class User(UserBase, AuditBase):
    id: str
    is_active: bool = True

    class Config:
        from_attributes = True
        populate_by_name = True


# --- Payroll Settings ---


class PayrollSettingsBase(BaseModel):
    currency: str = "PKR"
    tax_year_start: str = Field("July", alias="taxYearStart")
    allow_negative_salary: bool = Field(False, alias="allowNegativeSalary")
    pay_frequency: str = Field("Monthly", alias="payFrequency")
    pay_day: int = Field(1, alias="payDay")
    tax_calculation_method: str = Field("Annualized", alias="taxCalculationMethod")
    eobi_enabled: bool = Field(True, alias="eobiEnabled")
    social_security_enabled: bool = Field(True, alias="socialSecurityEnabled")
    overtime_enabled: bool = Field(True, alias="overtimeEnabled")
    overtime_rate: float = Field(1.5, alias="overtimeRate")

    # Frontend Alignment
    calculation_method: str = Field("Per Month", alias="calculationMethod")
    custom_formulas: dict = Field({}, alias="customFormulas")
    overtime_rules: dict = Field({}, alias="overtime")

    organization_id: str = Field(..., alias="organizationId")

    @model_validator(mode="before")
    @classmethod
    def map_frontend_fields(cls, data):
        if isinstance(data, dict):
            # Map calculationMethod to calculation_method for DB (handled in CRUD, but here for completeness if needed)
            pass
        else:
            # From DB Object to Pydantic
            # Map calculation_method -> calculationMethod
            if hasattr(data, "calculation_method") and data.calculation_method:
                # We can't easily set attributes on the object if it is an ORM model?
                # Pydantic v2 calls attributes.
                pass
        return data

    class Config:
        populate_by_name = True


class PayrollSettingsCreate(PayrollSettingsBase):
    id: Optional[str] = None


class PayrollSettings(PayrollSettingsBase, AuditBase):
    id: str

    class Config:
        from_attributes = True


# ===== API Key Schemas =====
class ApiKeyBase(BaseModel):
    name: str
    expires_at: Optional[datetime] = None


class ApiKeyCreate(ApiKeyBase):
    pass


class ApiKeyResponse(ApiKeyBase, AuditBase):
    id: str
    organization_id: str
    key_preview: str  # First 8 + last 4 chars of the key
    last_used: Optional[datetime] = None
    revoked: bool = False

    class Config:
        from_attributes = True


class ApiKeyCreateResponse(ApiKeyResponse):
    """Returned only at creation time with the full key"""

    raw_key: str


class ApiKeyList(BaseModel):
    """List of API keys (masked)"""

    keys: list[ApiKeyResponse]
    total: int


# ===== Webhook Schemas =====
class WebhookBase(BaseModel):
    name: str
    url: str
    event_types: list[str]  # ["employee.created", "employee.updated", ...]
    headers: Optional[dict] = None
    max_retries: int = 3


class WebhookCreate(WebhookBase):
    pass


class WebhookResponse(WebhookBase, AuditBase):
    id: str
    organization_id: str
    is_active: bool = True

# --- System Settings Schemas ---

class AIConfigurationBase(BaseModel):
    provider: str = "openai"
    api_key: Optional[str] = Field(None, alias="apiKey")
    status: str = "offline"
    agents_config: Union[str, dict] = Field("{}", alias="agentsConfig")
    organization_id: str = Field(..., alias="organizationId")

    @field_validator("agents_config", mode="before")
    def parse_agents(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v

    class Config:
        populate_by_name = True


class AIConfigurationCreate(AIConfigurationBase):
    pass


class AIConfiguration(AIConfigurationBase, AuditBase):
    id: str
    
    class Config:
        from_attributes = True


class NotificationSettingsBase(BaseModel):
    email_enabled: bool = Field(True, alias="emailEnabled")
    email_provider: str = Field("smtp", alias="emailProvider")
    email_from_address: Optional[str] = Field(None, alias="emailFromAddress")
    email_from_name: Optional[str] = Field(None, alias="emailFromName")
    
    email_on_employee_created: bool = Field(True, alias="emailOnEmployeeCreated")
    email_on_leave_request: bool = Field(True, alias="emailOnLeaveRequest")
    email_on_payroll_processed: bool = Field(True, alias="emailOnPayrollProcessed")
    email_on_system_alert: bool = Field(True, alias="emailOnSystemAlert")
    
    sms_enabled: bool = Field(False, alias="smsEnabled")
    sms_provider: Optional[str] = Field(None, alias="smsProvider")
    sms_from_number: Optional[str] = Field(None, alias="smsFromNumber")
    
    organization_id: str = Field(..., alias="organizationId")
    
    class Config:
        populate_by_name = True


class NotificationSettingsCreate(NotificationSettingsBase):
    pass


class NotificationSettings(NotificationSettingsBase, AuditBase):
    id: str

    class Config:
        from_attributes = True


class ComplianceSettingsBase(BaseModel):
    tax_year_end: Optional[str] = Field(None, alias="taxYear")
    min_wage: float = Field(0.0, alias="minWage")
    eobi_rate: float = Field(0.0, alias="eobiRate")
    social_security_rate: float = Field(0.0, alias="socialSecurityRate")
    organization_id: str = Field(..., alias="organizationId")

    class Config:
        populate_by_name = True


class ComplianceSettingsCreate(ComplianceSettingsBase):
    pass


class ComplianceSettings(ComplianceSettingsBase, AuditBase):
    id: str

    class Config:
        from_attributes = True

    failure_count: int = 0

    class Config:
        from_attributes = True


class WebhookUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    event_types: Optional[list[str]] = None
    headers: Optional[dict] = None
    is_active: Optional[bool] = None
    max_retries: Optional[int] = None


# ===== Webhook Log Schemas =====
class WebhookLogResponse(BaseModel):
    id: str
    webhook_id: str
    event_type: str
    delivery_status: str  # "success", "failed", "retrying"
    response_status: Optional[int] = None
    retry_count: int = 0
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WebhookLogList(BaseModel):
    logs: list[WebhookLogResponse]
    total: int


# ===== System Flags Schemas =====
class SystemFlagsBase(BaseModel):
    ai_enabled: bool = True
    advanced_analytics_enabled: bool = True
    employee_self_service_enabled: bool = True
    maintenance_mode: bool = False
    read_only_mode: bool = False
    cache_enabled: bool = True
    cache_ttl: int = 3600
    db_optimization_enabled: bool = True
    debug_logging_enabled: bool = False
    log_retention_days: int = 30
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 60
    webhooks_max_retries: int = 3
    
    # Restored Security Flags
    mfa_enforced: bool = False
    biometrics_required: bool = False
    ip_whitelisting: bool = False
    session_timeout: str = "30"
    password_complexity: str = "Standard"
    session_isolation: bool = False
    
    # Restored Neural/Audit Flags
    neural_bypass: bool = False
    api_caching: bool = False
    immutable_logs: bool = False
    
    custom_flags: Optional[dict] = None


class SystemFlagsCreate(SystemFlagsBase):
    pass


class SystemFlagsUpdate(BaseModel):
    ai_enabled: Optional[bool] = None
    advanced_analytics_enabled: Optional[bool] = None
    employee_self_service_enabled: Optional[bool] = None
    maintenance_mode: Optional[bool] = None
    read_only_mode: Optional[bool] = None
    cache_enabled: Optional[bool] = None
    cache_ttl: Optional[int] = None
    db_optimization_enabled: Optional[bool] = None
    debug_logging_enabled: Optional[bool] = None
    log_retention_days: Optional[int] = None
    rate_limit_enabled: Optional[bool] = None
    rate_limit_requests_per_minute: Optional[int] = None
    webhooks_max_retries: Optional[int] = None
    
    # Restored Security Flags
    mfa_enforced: Optional[bool] = None
    biometrics_required: Optional[bool] = None
    ip_whitelisting: Optional[bool] = None
    session_timeout: Optional[str] = None
    password_complexity: Optional[str] = None
    session_isolation: Optional[bool] = None
    
    # Restored Neural/Audit Flags
    neural_bypass: Optional[bool] = None
    api_caching: Optional[bool] = None
    immutable_logs: Optional[bool] = None
    
    custom_flags: Optional[dict] = None


class SystemFlags(SystemFlagsBase, AuditBase):
    id: str
    organization_id: str
    db_optimization_last_run: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== AI Configuration Schemas =====
class AIConfigurationBase(BaseModel):
    provider: str = "gemini"
    status: str = "offline"
    api_keys: Optional[dict] = Field(default_factory=dict, alias="apiKeys")
    agents: Optional[dict] = Field(default_factory=dict)

    class Config:
        populate_by_name = True


class AIConfigurationCreate(AIConfigurationBase):
    pass


class AIConfigurationUpdate(BaseModel):
    provider: Optional[str] = None
    status: Optional[str] = None
    api_keys: Optional[dict] = Field(None, alias="apiKeys")
    agents: Optional[dict] = None

    class Config:
        populate_by_name = True


class AIConfigurationResponse(AIConfigurationBase, AuditBase):
    id: str
    organization_id: str

    class Config:
        from_attributes = True


# ===== Notification Settings Schemas =====
class NotificationSettingsBase(BaseModel):
    email_enabled: bool = True
    email_provider: str = "smtp"
    email_from_address: str = ""
    email_from_name: str = ""
    email_on_employee_created: bool = True
    email_on_leave_request: bool = True
    email_on_payroll_processed: bool = True
    email_on_system_alert: bool = True

    sms_enabled: bool = False
    sms_provider: Optional[str] = None
    sms_from_number: Optional[str] = None
    sms_on_leave_approval: bool = False
    sms_on_payroll_processed: bool = False
    sms_on_system_alert: bool = False

    slack_enabled: bool = False
    slack_webhook_url: Optional[str] = None
    slack_channel: Optional[str] = None
    slack_on_critical_alerts: bool = True

    digest_enabled: bool = True
    digest_frequency: str = "daily"
    quiet_hours_enabled: bool = False
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

    dnd_enabled: bool = False
    dnd_start_date: Optional[datetime] = None
    dnd_end_date: Optional[datetime] = None
    custom_settings: Optional[dict] = None


class NotificationSettingsCreate(NotificationSettingsBase):
    pass


class NotificationSettingsUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    email_provider: Optional[str] = None
    email_from_address: Optional[str] = None
    email_from_name: Optional[str] = None
    email_on_employee_created: Optional[bool] = None
    email_on_leave_request: Optional[bool] = None
    email_on_payroll_processed: Optional[bool] = None
    email_on_system_alert: Optional[bool] = None

    sms_enabled: Optional[bool] = None
    sms_provider: Optional[str] = None
    sms_from_number: Optional[str] = None
    sms_on_leave_approval: Optional[bool] = None
    sms_on_payroll_processed: Optional[bool] = None
    sms_on_system_alert: Optional[bool] = None

    slack_enabled: Optional[bool] = None
    slack_webhook_url: Optional[str] = None
    slack_channel: Optional[str] = None
    slack_on_critical_alerts: Optional[bool] = None

    digest_enabled: Optional[bool] = None
    digest_frequency: Optional[str] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

    dnd_enabled: Optional[bool] = None
    dnd_start_date: Optional[datetime] = None
    dnd_end_date: Optional[datetime] = None
    custom_settings: Optional[dict] = None


class NotificationSettingsResponse(NotificationSettingsBase, AuditBase):
    id: str
    organization_id: str

    class Config:
        from_attributes = True


class RolePermission(BaseModel):
    role: str
    permissions: List[str]

    class Config:
        from_attributes = True


class RolePermissionCreate(BaseModel):
    role: str
    permissions: List[str]


# ===== Background Job Schemas =====
class BackgroundJobBase(BaseModel):
    job_type: str
    priority: int = 0
    payload: Optional[dict] = None


class BackgroundJobCreate(BackgroundJobBase):
    pass


class BackgroundJobResponse(BaseModel):
    id: str
    organization_id: str
    job_type: str
    status: str
    priority: int
    payload: Optional[dict] = None
    result: Optional[dict] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    retry_count: int
    max_retries: int
    created_at: datetime

    class Config:
        from_attributes = True


class BackgroundJobList(BaseModel):
    jobs: list[BackgroundJobResponse]
    total: int


class AttritionPredictionRequest(BaseModel):
    employee_id: str


# --- Attendance Schemas ---
class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., alias="employeeId")
    date: str
    clock_in: Optional[str] = Field(None, alias="clockIn")
    clock_out: Optional[str] = Field(None, alias="clockOut")
    status: Optional[str] = "Absent"
    shift_id: Optional[str] = Field(None, alias="shiftId")

    class Config:
        populate_by_name = True

class Attendance(AttendanceCreate, AuditBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Payroll Schemas ---
class PayrollLedgerCreate(BaseModel):
    employee_id: str = Field(..., alias="employeeId")
    period_month: str = Field(..., alias="periodMonth")
    period_year: str = Field(..., alias="periodYear")
    basic_salary: float = Field(0.0, alias="basicSalary")
    gross_salary: float = Field(0.0, alias="grossSalary")
    net_salary: float = Field(0.0, alias="netSalary")
    additions: float = 0.0
    deductions: float = 0.0
    status: str = "Draft"
    payment_mode: Optional[str] = Field(None, alias="paymentMode")

    class Config:
        populate_by_name = True

class PayrollLedger(PayrollLedgerCreate, AuditBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Leave Schemas ---
class LeaveRequestCreate(BaseModel):
    employee_id: str = Field(..., alias="employeeId")
    type: str = "Annual" # Annual, Sick, Casual, Unpaid
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    days: float = 1.0
    reason: str
    status: str = "Pending"

    class Config:
        populate_by_name = True

class LeaveRequest(LeaveRequestCreate, AuditBase):
    id: str
    employee_name: Optional[str] = Field(None, alias="employeeName")

    class Config:
        from_attributes = True

class LeaveBalanceCreate(BaseModel):
    employee_id: str = Field(..., alias="employeeId")
    year: int
    annual_total: float = 14.0
    annual_used: float = 0.0
    sick_total: float = 10.0
    sick_used: float = 0.0
    casual_total: float = 10.0
    casual_used: float = 0.0
    unpaid_used: float = 0.0

    class Config:
        populate_by_name = True

class LeaveBalance(LeaveBalanceCreate, AuditBase):
    id: int
    name: Optional[str] = None # Employee Name for UI
    total: Optional[float] = None
    used: Optional[float] = None
    
    annual: Optional[str] = None # "Used/Total" string for UI? Or just let frontend calculate?
    # Frontend expects: anual="0/14", sick="0/10" etc based on `renderMatrix`? 
    # Let's check api.ts again. types.ts says annual: number. 
    # But src/modules/leaves/index.tsx line 284 `{node.annual}` renders it directly.
    # We should return what frontend expects. 
    # However, types.ts says `annual: number`. Line 284 in index.tsx treats it as renderable child.
    # If the frontend renders "2/14", then `annual` in types should be string?
    # types.ts:582 `annual: number`.
    # Wait, looking at index.tsx line 299: `style={{ width: ${(node.used / node.total) * 100}% }}`.
    # This implies `node.used` and `node.total` are numbers.
    # BUT line 284 `{node.annual}` displays it. If it's a number, it displays "2".
    # I'll stick to returning numbers in the base schema, but maybe add computed fields if needed.
    # For now, simplistic approach: Return numbers.

    class Config:
        from_attributes = True
