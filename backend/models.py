from sqlalchemy import (Boolean, Column, DateTime, Float, ForeignKey, Integer,
                        String)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class AuditMixin:
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String)
    updated_by = Column(String)


class PrismaAuditMixin:
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(String)
    updated_by = Column(String)


class DBEmployee(Base, PrismaAuditMixin):  # Updated to use PrismaAuditMixin
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True)
    employee_code = Column(String)  # Standardized from employeeCode
    name = Column(String, index=True)

    # Legacy Booleans - Standardized
    eobi_status = Column(Boolean, default=False)
    social_security_status = Column(Boolean, default=False)
    medical_status = Column(Boolean, default=False)
    role = Column(
        String
    )  # DEPRECATED: Use designation_id for Job Title and DBUser.role for System Permissions
    department = Column(String)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )

    # Foreign Keys
    department_id = Column(String, ForeignKey("departments.id"))
    designation_id = Column(String, ForeignKey("designations.id"))
    grade_id = Column(String, ForeignKey("grades.id"))
    plant_id = Column(String, ForeignKey("hr_plants.id"))
    shift_id = Column(String, ForeignKey("shifts.id"))

    # Relationships (Optional for now, but good for lazy loading)
    # department = relationship("DBDepartment")
    # Not strictly needed unless we want Eager Loading in pure SQLA

    status = Column(String)
    join_date = Column(String)
    email = Column(String, unique=True, index=True)

    # We can add more detailed fields later as we migrate from mockData
    education = relationship(
        "DBEducation", backref="employee", cascade="all, delete-orphan"
    )
    experience = relationship(
        "DBExperience", backref="employee", cascade="all, delete-orphan"
    )
    family = relationship("DBFamily", backref="employee", cascade="all, delete-orphan")
    discipline = relationship(
        "DBDiscipline", backref="employee", cascade="all, delete-orphan"
    )
    increments = relationship(
        "DBIncrement", backref="employee", cascade="all, delete-orphan"
    )


class DBCandidate(Base, PrismaAuditMixin):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, index=True)
    employee_code = Column(String)
    name = Column(String, index=True)

    # Standardized Booleans
    eobi_status = Column(Boolean, default=False)
    social_security_status = Column(Boolean, default=False)
    medical_status = Column(Boolean, default=False)
    email = Column(String, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    phone = Column(String)
    position_applied = Column(String)
    current_stage = Column(String)
    score = Column(Integer)
    resume_url = Column(String)
    skills = Column(String)  # Stored as JSON string or comma-separated
    applied_date = Column(String)
    avatar = Column(String)


class DBRolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)
    permission = Column(String, index=True)

    @property
    def currentStage(self):
        return self.current_stage

    @property
    def resumeUrl(self):
        return self.resume_url

    @property
    def appliedDate(self):
        return self.applied_date

    # Standardized flags
    @property
    def eobiStatus(self):
        return self.eobi_status

    @property
    def socialSecurityStatus(self):
        return self.social_security_status

    @property
    def medicalStatus(self):
        return self.medical_status


class DBOrganization(Base, PrismaAuditMixin):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    is_active = Column(Boolean, default=True)

    @property
    def isActive(self):
        return self.is_active

    # Modern Fields
    tax_id = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    founded_date = Column(String, nullable=True)  # Storing as ISO String

    # Contact & Location
    email = Column(String)
    phone = Column(String)
    website = Column(String)

    # Address
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # Branding
    logo = Column(
        String, nullable=True
    )  # Existing legacy might be logoUrl? Keeping simple.
    cover_url = Column(String, nullable=True)

    # Metadata
    industry = Column(String, nullable=True)
    currency = Column(String, default="PKR")
    tax_year_end = Column(String, nullable=True)

    # Social Media
    social_links = Column(
        String, nullable=True
    )  # JSON String: {"linkedin": "...", "twitter": "..."}

    # Legacy Fields
    description = Column(String)
    
    # Phase 2 Features
    system_authority = Column(String, nullable=True) # JSON: {"authority_level": "...", "signatory": "..."}
    approval_workflows = Column(String, nullable=True) # JSON: {"leave": ["manager", "hr"], "expense": ["finance"]}

    # Organization -> Plants (One to Many)
    plants = relationship("DBHRPlant", back_populates="organization")


class DBHRPlant(Base, PrismaAuditMixin):
    __tablename__ = "hr_plants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    location = Column(String)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)

    # Legacy Fields (Standardized)
    code = Column(String, unique=True)
    current_sequence = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    # divisions column removed in favor of DBPlantDivision relation

    organization = relationship("DBOrganization", back_populates="plants")
    plant_divisions = relationship(
        "DBPlantDivision", back_populates="plant", cascade="all, delete-orphan"
    )


class DBPlantDivision(Base, PrismaAuditMixin):
    __tablename__ = "plant_divisions"

    id = Column(String, primary_key=True, index=True)
    plant_id = Column(String, ForeignKey("hr_plants.id"), index=True)
    name = Column(String, unique=True)
    code = Column(String, unique=True)
    is_active = Column(Boolean, default=True)

    plant = relationship("DBHRPlant", back_populates="plant_divisions")

    @property
    def isActive(self):
        return self.is_active


class DBDepartment(Base, PrismaAuditMixin):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    isActive = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), nullable=True, index=True
    )
    plant_id = Column(String, ForeignKey("hr_plants.id"), nullable=True)
    hod_id = Column(String, ForeignKey("employees.id"), nullable=True)

    # Relationships
    hod = relationship("DBEmployee", foreign_keys=[hod_id])

    # Legacy Fields (Standardized)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)

    @property
    def is_active(self):
        return self.isActive

    @property
    def managerId(self):
        return self.manager_id


class DBSubDepartment(Base, PrismaAuditMixin):
    __tablename__ = "sub_departments"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), nullable=True, index=True
    )

    # Legacy Fields (Standardized)
    parent_department_id = Column(String, ForeignKey("departments.id"))
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)

    @property
    def isActive(self):
        return self.is_active

    @property
    def parentDepartmentId(self):
        return self.parent_department_id

    @property
    def managerId(self):
        return self.manager_id


class DBGrade(Base, PrismaAuditMixin):
    __tablename__ = "grades"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    level = Column(Integer)  # Keep for internal ordering
    employment_level_id = Column(
        String, ForeignKey("employment_levels.id"), nullable=True
    )  # Linked to Employment Level
    is_active = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), nullable=True, index=True
    )

    @property
    def isActive(self):
        return self.is_active

    # Legacy Fields
    code = Column(String, unique=True)


class DBDesignation(Base, PrismaAuditMixin):
    __tablename__ = "designations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    grade_id = Column(String, ForeignKey("grades.id"))
    is_active = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), nullable=True, index=True
    )

    # Legacy Fields
    code = Column(String, unique=True)

    @property
    def isActive(self):
        return self.is_active


class DBShift(Base, PrismaAuditMixin):
    __tablename__ = "shifts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    code = Column(String)
    type = Column(String)  # Fixed, Rotating, etc.
    start_time = Column(String)
    end_time = Column(String)
    grace_period = Column(Integer)
    break_duration = Column(Integer)
    work_days = Column(String)  # Stored as JSON string or comma-separated
    isActive = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), nullable=True, index=True
    )

    @property
    def is_active(self):
        return self.isActive

    @property
    def startTime(self):
        return self.start_time

    @property
    def endTime(self):
        return self.end_time

    @property
    def gracePeriod(self):
        return self.grace_period

    @property
    def breakDuration(self):
        return self.break_duration

    @property
    def workDays(self):
        return self.work_days


class DBEmploymentLevel(Base, PrismaAuditMixin):
    __tablename__ = "employment_levels"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)


class DBPosition(Base, PrismaAuditMixin):
    __tablename__ = "positions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    grade_id = Column(String, ForeignKey("grades.id"), nullable=True)
    designation_id = Column(String, ForeignKey("designations.id"), nullable=True)
    reports_to = Column(String, nullable=True)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)

    @property
    def reportsToPositionId(self):
        return self.reports_to


class DBHoliday(Base, PrismaAuditMixin):
    __tablename__ = "holidays"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    type = Column(String)  # Public, Optional, Regional
    is_recurring = Column(Boolean, default=False)
    description = Column(String)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)


class DBBank(Base, PrismaAuditMixin):
    __tablename__ = "bank_accounts"

    id = Column(String, primary_key=True, index=True)
    bank_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    account_title = Column(String)
    branch = Column(String)
    iban = Column(String)
    swift_code = Column(String)
    currency = Column(String, default="PKR")
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)


class DBEducation(Base, AuditMixin):
    __tablename__ = "employee_education"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    degree = Column(String)
    institute = Column(String)
    passing_year = Column(String)
    score = Column(String)  # GPA or Grade
    marks_obtained = Column(Float)
    total_marks = Column(Float)

    @property
    def year(self):
        return self.passing_year

    @property
    def gradeGpa(self):
        return self.score

    @property
    def marksObtained(self):
        return self.marks_obtained

    @property
    def totalMarks(self):
        return self.total_marks


class DBExperience(Base, AuditMixin):
    __tablename__ = "employee_experience"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    company_name = Column(String)
    designation = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    gross_salary = Column(Float)
    remarks = Column(String)

    @property
    def orgName(self):
        return self.company_name

    @property
    def from_(self):
        return (
            self.start_date
        )  # Schema uses 'from_' alias? No, schema uses 'from_'. Wait.

    # Schema: `from_: str = Field(alias="from")`. Pydantic reads 'from_'.
    # Actually Pydantic reads field name 'from_'.
    # So I should expose `from_`.
    @property
    def to(self):
        return self.end_date

    @property
    def grossSalary(self):
        return self.gross_salary


class DBFamily(Base, AuditMixin):
    __tablename__ = "employee_family"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    name = Column(String)
    relationship = Column(String)
    dob = Column(String)
    # Names match schema


class DBDiscipline(Base, AuditMixin):
    __tablename__ = "employee_discipline"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    date = Column(String)
    description = Column(String)
    outcome = Column(String)
    # Names match schema


class DBIncrement(Base, AuditMixin):
    __tablename__ = "employee_increments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    effective_date = Column(String)
    amount = Column(Float)
    increment_type = Column(String)  # Increment, Promotion, Adjustment
    remarks = Column(String)
    previous_salary = Column(Float)
    new_gross = Column(Float)

    # Breakdown of new package
    house_rent = Column(Float)
    utility = Column(Float)
    other_allowance = Column(Float)

    @property
    def effectiveDate(self):
        return self.effective_date

    @property
    def type(self):
        return self.increment_type

    @property
    def newGross(self):
        return self.new_gross

    @property
    def newHouseRent(self):
        return self.house_rent

    @property
    def newUtilityAllowance(self):
        return self.utility

    @property
    def newOtherAllowance(self):
        return self.other_allowance


class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    user = Column(String)
    action = Column(String)
    status = Column(String)  # 'Hashed', 'Flagged'
    time = Column(String)  # Stored as string ISO or formatted
    # No AuditMixin needed as it is an audit log itself


class DBJobVacancy(Base, AuditMixin):
    __tablename__ = "job_vacancies"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    title = Column(String)
    department = Column(String)
    location = Column(String)
    type = Column(String)  # Full-time, etc.
    posted_date = Column(String)
    status = Column(String)  # Open, Closed
    applicants_count = Column(Integer, default=0)
    description = Column(String)
    requirements = Column(String)  # JSON or list
    salary_range = Column(String)

    @property
    def applicants(self):
        return self.applicants_count


class DBGoal(Base, AuditMixin):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    title = Column(String)
    category = Column(String)  # Operational, Strategic
    progress = Column(Integer, default=0)
    metric = Column(String)  # e.g. "Increase by 10%"
    status = Column(String)  # On Track, At Risk
    due_date = Column(String)
    weight = Column(Integer, default=1)
    description = Column(String)

    @property
    def dueDate(self):
        return self.due_date


class DBPerformanceReview(Base, AuditMixin):
    __tablename__ = "performance_reviews"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    employee_id = Column(String, ForeignKey("employees.id"))
    review_period = Column(String)  # e.g. "Q1 2024"
    status = Column(String)  # Scheduled, Completed
    score = Column(Integer)
    feedback = Column(String)
    reviewer_id = Column(String, ForeignKey("employees.id"))
    review_date = Column(String)

    @property
    def employeeId(self):
        return self.employee_id

    @property
    def reviewPeriod(self):
        return self.review_period

    @property
    def reviewerId(self):
        return self.reviewer_id

    @property
    def reviewDate(self):
        return self.review_date


class DBUser(Base, AuditMixin):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)  # Prepare for hashed passwords
    role = Column(String)
    name = Column(String, nullable=True)  # Full name for display
    email = Column(String, nullable=True)  # Email for account recovery
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, nullable=True
    )
    employee_id = Column(String, ForeignKey("employees.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    # System user flag: True for .amer, admin - never expire, never delete
    is_system_user = Column(Boolean, default=False)

        # Optional: Link to employee details
    employee = relationship("DBEmployee", backref="user_account")




class DBComplianceSettings(Base, AuditMixin):
    __tablename__ = "compliance_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, unique=True
    )
    tax_year_end = Column(String)  # stored as date string YYYY-MM-DD
    min_wage = Column(Float, default=0.0)
    eobi_rate = Column(Float, default=0.0)
    social_security_rate = Column(Float, default=0.0)

    # Allow mapping properties if needed for camelCase translation at model level
    @property
    def taxYear(self):
        return self.tax_year_end


# DBNotificationSettings is already defined in the file! (Lines 780-800+)
# I don't need to add it again.



class DBPayrollSettings(Base, AuditMixin):
    __tablename__ = "payroll_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)

    # Financial Configuration
    currency = Column(String, default="PKR")
    tax_year_start = Column(String)  # "July"
    allow_negative_salary = Column(Boolean, default=False)

    # Payroll Schedule
    pay_frequency = Column(String, default="Monthly")  # Monthly, Weekly
    pay_day = Column(Integer, default=1)  # Day of month
    last_processed = Column(String, nullable=True)  # Date of last run

    # Tax & Compliance
    tax_calculation_method = Column(String, default="Annualized")
    eobi_enabled = Column(Boolean, default=True)
    social_security_enabled = Column(Boolean, default=True)

    # Allowances & Deductions Defaults
    default_house_rent = Column(Float, default=0.0)  # Percentage or fixed
    default_medical = Column(Float, default=0.0)

    # Overtime Rules
    overtime_enabled = Column(Boolean, default=True)
    overtime_rate = Column(Float, default=1.5)  # Multiplier

    # Frontend Alignment
    calculation_method = Column(String, default="Per Month")
    custom_formulas = Column(
        String, nullable=True
    )  # JSON String for Staff/Worker formulas
    overtime_rules = Column(
        String, nullable=True
    )  # JSON String for detailed overtime rules

    @property
    def calculationMethod(self):
        return self.calculation_method

    @property
    def customFormulas(self):
        return self.custom_formulas

    @property
    def overtime(self):
        return self.overtime_rules


class DBApiKey(Base, AuditMixin):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)
    name = Column(String, index=True)
    key_hash = Column(String)  # SHA256 hash of the actual key
    last_used = Column(DateTime, nullable=True)
    revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=True)


class DBWebhook(Base, AuditMixin):
    __tablename__ = "webhooks"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)
    name = Column(String, index=True)
    url = Column(String)  # HTTPS endpoint to call
    event_types = Column(
        String
    )  # JSON list of events: ["employee.created", "employee.updated", ...]
    headers = Column(String, nullable=True)  # JSON custom headers
    is_active = Column(Boolean, default=True)
    test_payload_sent = Column(Boolean, default=False)
    last_triggered = Column(DateTime, nullable=True)
    failure_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)


class DBWebhookLog(Base, AuditMixin):
    __tablename__ = "webhook_logs"

    id = Column(String, primary_key=True, index=True)
    webhook_id = Column(String, ForeignKey("webhooks.id"), index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)
    event_type = Column(String)
    payload = Column(String)  # JSON payload sent
    response_status = Column(Integer, nullable=True)
    response_body = Column(String, nullable=True)
    delivery_status = Column(String)  # "success", "failed", "retrying"
    retry_count = Column(Integer, default=0)
    next_retry_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)


class DBSystemFlags(Base, AuditMixin):
    __tablename__ = "system_flags"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, unique=True
    )
    # Feature Flags
    ai_enabled = Column(Boolean, default=True)
    advanced_analytics_enabled = Column(Boolean, default=True)
    employee_self_service_enabled = Column(Boolean, default=True)
    # Maintenance Flags
    maintenance_mode = Column(Boolean, default=False)
    read_only_mode = Column(Boolean, default=False)
    # Cache & Performance
    cache_enabled = Column(Boolean, default=True)
    cache_ttl = Column(Integer, default=3600)  # seconds
    # Database
    db_optimization_last_run = Column(DateTime, nullable=True)
    db_optimization_enabled = Column(Boolean, default=True)
    # Logging
    debug_logging_enabled = Column(Boolean, default=False)
    log_retention_days = Column(Integer, default=30)
    # API Rate Limiting
    rate_limit_enabled = Column(Boolean, default=True)
    rate_limit_requests_per_minute = Column(Integer, default=60)
    # Webhooks
    webhooks_enabled = Column(Boolean, default=True)
    webhooks_retry_enabled = Column(Boolean, default=True)
    webhooks_max_retries = Column(Integer, default=3)
    
    # Restored Security Flags
    mfa_enforced = Column(Boolean, default=False)
    biometrics_required = Column(Boolean, default=False)
    ip_whitelisting = Column(Boolean, default=False)
    session_timeout = Column(String, default="30") # in minutes
    password_complexity = Column(String, default="Standard")
    session_isolation = Column(Boolean, default=False)
    
    # Restored Neural/Audit Flags
    neural_bypass = Column(Boolean, default=False)
    api_caching = Column(Boolean, default=False)
    immutable_logs = Column(Boolean, default=False)
    
    # Custom JSON for additional flags
    custom_flags = Column(String, nullable=True)  # JSON map


class DBAIConfiguration(Base, AuditMixin):
    __tablename__ = "ai_configurations"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, unique=True
    )
    provider = Column(String, default="gemini")  # "gemini", "openai", "anthropic"
    status = Column(String, default="offline")   # "online", "offline"
    api_keys = Column(String, nullable=True)     # JSON string: {"gemini": "...", "openai": "..."}
    agents = Column(String, nullable=True)       # JSON string: {"resume_screener": true, ...}


class DBNotificationSettings(Base, AuditMixin):
    __tablename__ = "notification_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("organizations.id"), index=True, unique=True
    )
    # Email Settings
    email_enabled = Column(Boolean, default=True)
    email_provider = Column(String, default="smtp")  # "smtp", "sendgrid", "ses"
    email_from_address = Column(String)
    email_from_name = Column(String)
    # Email Categories
    email_on_employee_created = Column(Boolean, default=True)
    email_on_leave_request = Column(Boolean, default=True)
    email_on_payroll_processed = Column(Boolean, default=True)
    email_on_system_alert = Column(Boolean, default=True)
    # SMS Settings
    sms_enabled = Column(Boolean, default=False)
    sms_provider = Column(String, nullable=True)  # "twilio", "aws_sns"
    sms_from_number = Column(String, nullable=True)

    # SMS Categories
    sms_on_leave_approval = Column(Boolean, default=False)
    sms_on_payroll_processed = Column(Boolean, default=False)
    sms_on_system_alert = Column(Boolean, default=False)
    # Slack Integration
    slack_enabled = Column(Boolean, default=False)
    slack_webhook_url = Column(String, nullable=True)
    slack_channel = Column(String, nullable=True)
    slack_on_critical_alerts = Column(Boolean, default=True)
    # Frequency Settings
    digest_enabled = Column(Boolean, default=True)
    digest_frequency = Column(String, default="daily")  # "hourly", "daily", "weekly"
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String, nullable=True)  # "18:00"
    quiet_hours_end = Column(String, nullable=True)  # "09:00"
    # Do Not Disturb (DND)
    dnd_enabled = Column(Boolean, default=False)
    dnd_start_date = Column(DateTime, nullable=True)
    dnd_end_date = Column(DateTime, nullable=True)
    # Custom JSON for extension
    custom_settings = Column(String, nullable=True)


class DBBackgroundJob(Base, AuditMixin):
    __tablename__ = "background_jobs"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True)
    job_type = Column(
        String, index=True
    )  # "cache_flush", "db_optimize", "log_rotate", etc.
    status = Column(
        String, default="queued"
    )  # "queued", "processing", "completed", "failed"
    priority = Column(Integer, default=0)  # 0=low, 1=normal, 2=high, 3=critical
    payload = Column(String, nullable=True)  # JSON
    result = Column(String, nullable=True)  # JSON result
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    next_retry_at = Column(DateTime, nullable=True)
