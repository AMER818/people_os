from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class PrismaAuditMixin:
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(String)
    updated_by = Column(String)


class DBOrganization(Base, PrismaAuditMixin):
    __tablename__ = "core_organizations"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    enabled_modules = Column(String, default='["hcm"]')  # JSON List
    head_id = Column(String, nullable=True)  # Soft Link to Employee ID

    # Modern Fields
    tax_id = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    founded_date = Column(String, nullable=True)
    email = Column(String)
    phone = Column(String)
    website = Column(String)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    currency = Column(String, default="PKR")
    tax_year_end = Column(String, nullable=True)
    social_links = Column(String, nullable=True)
    description = Column(String)
    system_authority = Column(String, nullable=True)
    approval_workflows = Column(String, nullable=True)

    # Relationships
    plants = relationship("DBHRPlant", back_populates="organization")

    @property
    def isActive(self):
        return self.is_active


class DBUser(Base, PrismaAuditMixin):
    __tablename__ = "core_users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, nullable=True
    )
    employee_id = Column(String, nullable=True)  # Soft Link
    is_active = Column(Boolean, default=True)
    is_system_user = Column(Boolean, default=False)


class DBHRPlant(Base, PrismaAuditMixin):
    __tablename__ = "core_locations"  # Renamed from hr_plants

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    location = Column(String)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), nullable=False, index=True
    )
    code = Column(String, unique=True)
    current_sequence = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    head_of_plant = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    organization = relationship("DBOrganization", back_populates="plants")
    plant_divisions = relationship(
        "DBPlantDivision", back_populates="plant", cascade="all, delete-orphan"
    )

    @property
    def divisions(self):
        return self.plant_divisions


class DBPlantDivision(Base, PrismaAuditMixin):
    __tablename__ = "core_divisions"

    id = Column(String, primary_key=True, index=True)
    plant_id = Column(String, ForeignKey("core_locations.id"), index=True)
    name = Column(String, unique=True)
    code = Column(String, unique=True)
    is_active = Column(Boolean, default=True)

    plant = relationship("DBHRPlant", back_populates="plant_divisions")

    @property
    def isActive(self):
        return self.is_active


class DBDepartment(Base, PrismaAuditMixin):
    __tablename__ = "core_departments"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    isActive = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), nullable=False, index=True
    )
    # plant_id removed as Departments are now Organization-wide
    hod_id = Column(String, nullable=True)  # Soft Link
    manager_id = Column(String, nullable=True)  # Soft Link

    @property
    def is_active(self):
        return self.isActive

    @property
    def managerId(self):
        return self.manager_id


class DBSubDepartment(Base, PrismaAuditMixin):
    __tablename__ = "core_sub_departments"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), nullable=False, index=True
    )
    parent_department_id = Column(
        String, ForeignKey("core_departments.id"), nullable=False
    )
    manager_id = Column(String, nullable=True)

    @property
    def isActive(self):
        return self.is_active

    @property
    def parentDepartmentId(self):
        return self.parent_department_id

    @property
    def managerId(self):
        return self.manager_id


class DBAuditLog(Base):
    __tablename__ = "core_audit_logs"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, nullable=True
    )
    user = Column(String)
    action = Column(String)
    status = Column(String)
    time = Column(String)


class DBApiKey(Base, PrismaAuditMixin):
    """API key for external integrations."""
    __tablename__ = "core_api_keys"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True
    )
    name = Column(String, index=True)
    key_hash = Column(String)
    last_used = Column(DateTime, nullable=True)
    revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=True)


class DBWebhook(Base, PrismaAuditMixin):
    """Outbound webhook configuration."""
    __tablename__ = "webhooks"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True
    )
    name = Column(String, index=True)
    url = Column(String)
    event_types = Column(String)  # JSON
    headers = Column(String, nullable=True)  # JSON
    is_active = Column(Boolean, default=True)
    test_payload_sent = Column(Boolean, default=False)
    last_triggered = Column(DateTime, nullable=True)
    failure_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)


class DBWebhookLog(Base, PrismaAuditMixin):
    """Webhook delivery log."""
    __tablename__ = "webhook_logs"

    id = Column(String, primary_key=True, index=True)
    webhook_id = Column(String, ForeignKey("webhooks.id"), index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True
    )
    event_type = Column(String)
    payload = Column(String)  # JSON
    response_status = Column(Integer, nullable=True)
    response_body = Column(String, nullable=True)
    delivery_status = Column(String)
    retry_count = Column(Integer, default=0)
    next_retry_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)


class DBSystemFlags(Base, PrismaAuditMixin):
    """Feature flags and system configuration."""
    __tablename__ = "system_flags"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, unique=True
    )

    # Feature Flags
    ai_enabled = Column(Boolean, default=True)
    advanced_analytics_enabled = Column(Boolean, default=True)
    employee_self_service_enabled = Column(Boolean, default=True)

    # Maintenance
    maintenance_mode = Column(Boolean, default=False)
    read_only_mode = Column(Boolean, default=False)

    # Cache & Performance
    cache_enabled = Column(Boolean, default=True)
    cache_ttl = Column(Integer, default=3600)

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

    # Security
    mfa_enforced = Column(Boolean, default=False)
    biometrics_required = Column(Boolean, default=False)
    ip_whitelisting = Column(Boolean, default=False)
    session_timeout = Column(String, default="30")
    password_complexity = Column(String, default="Standard")
    session_isolation = Column(Boolean, default=False)

    # Neural/Audit
    neural_bypass = Column(Boolean, default=False)
    api_caching = Column(Boolean, default=False)
    immutable_logs = Column(Boolean, default=False)

    # Custom
    custom_flags = Column(String, nullable=True)


class DBComplianceSettings(Base, PrismaAuditMixin):
    """Tax and compliance configuration."""
    __tablename__ = "compliance_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, unique=True
    )
    tax_year_end = Column(String)
    min_wage = Column(Float, default=0.0)
    eobi_rate = Column(Float, default=0.0)
    social_security_rate = Column(Float, default=0.0)

    @property
    def taxYear(self):
        return self.tax_year_end


class DBPayrollSettings(Base, PrismaAuditMixin):
    """Payroll processing configuration."""
    __tablename__ = "payroll_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True
    )

    # Financial
    currency = Column(String, default="PKR")
    tax_year_start = Column(String)
    allow_negative_salary = Column(Boolean, default=False)

    # Schedule
    pay_frequency = Column(String, default="Monthly")
    pay_day = Column(Integer, default=1)
    last_processed = Column(String, nullable=True)

    # Tax & Compliance
    tax_calculation_method = Column(String, default="Annualized")
    eobi_enabled = Column(Boolean, default=True)
    social_security_enabled = Column(Boolean, default=True)

    # Defaults
    default_house_rent = Column(Float, default=0.0)
    default_medical = Column(Float, default=0.0)

    # Overtime
    overtime_enabled = Column(Boolean, default=True)
    overtime_rate = Column(Float, default=1.5)

    # Frontend Alignment
    calculation_method = Column(String, default="Per Month")
    custom_formulas = Column(String, nullable=True)
    overtime_rules = Column(String, nullable=True)

    @property
    def calculationMethod(self):
        return self.calculation_method

    @property
    def customFormulas(self):
        return self.custom_formulas

    @property
    def overtime(self):
        return self.overtime_rules


class DBAIConfiguration(Base, PrismaAuditMixin):
    """AI provider and agent configuration."""
    __tablename__ = "ai_configurations"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, unique=True
    )
    provider = Column(String, default="gemini")
    status = Column(String, default="offline")
    api_keys = Column(String, nullable=True)  # JSON
    agents = Column(String, nullable=True)  # JSON


class DBNotificationSettings(Base, PrismaAuditMixin):
    """Notification channel configuration."""
    __tablename__ = "notification_settings"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True, unique=True
    )

    # Email
    email_enabled = Column(Boolean, default=True)
    email_provider = Column(String, default="smtp")
    email_from_address = Column(String)
    email_from_name = Column(String)
    email_on_employee_created = Column(Boolean, default=True)
    email_on_leave_request = Column(Boolean, default=True)
    email_on_payroll_processed = Column(Boolean, default=True)
    email_on_system_alert = Column(Boolean, default=True)

    # SMS
    sms_enabled = Column(Boolean, default=False)
    sms_provider = Column(String, nullable=True)
    sms_from_number = Column(String, nullable=True)
    sms_on_leave_approval = Column(Boolean, default=False)
    sms_on_payroll_processed = Column(Boolean, default=False)
    sms_on_system_alert = Column(Boolean, default=False)

    # Slack
    slack_enabled = Column(Boolean, default=False)
    slack_webhook_url = Column(String, nullable=True)
    slack_channel = Column(String, nullable=True)
    slack_on_critical_alerts = Column(Boolean, default=True)

    # Digest
    digest_enabled = Column(Boolean, default=True)
    digest_frequency = Column(String, default="daily")
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String, nullable=True)
    quiet_hours_end = Column(String, nullable=True)

    # DND
    dnd_enabled = Column(Boolean, default=False)
    dnd_start_date = Column(DateTime, nullable=True)
    dnd_end_date = Column(DateTime, nullable=True)

    # Custom
    custom_settings = Column(String, nullable=True)


class DBBackgroundJob(Base, PrismaAuditMixin):
    """Background job queue."""
    __tablename__ = "background_jobs"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(
        String, ForeignKey("core_organizations.id"), index=True
    )
    job_type = Column(String, index=True)
    status = Column(String, default="queued")
    priority = Column(Integer, default=0)
    payload = Column(String, nullable=True)  # JSON
    result = Column(String, nullable=True)  # JSON
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    next_retry_at = Column(DateTime, nullable=True)
