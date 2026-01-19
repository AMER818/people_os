from sqlalchemy import (Boolean, Column, DateTime, Float, ForeignKey, Integer, String)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
from backend.domains.core.models import PrismaAuditMixin

class AuditMixin:
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String)
    updated_by = Column(String)

class DBEmployee(Base, PrismaAuditMixin):
    __tablename__ = "hcm_employees"

    id = Column(String, primary_key=True, index=True)
    employee_code = Column(String)
    name = Column(String, index=True)
    eobi_status = Column(Boolean, default=False)
    social_security_status = Column(Boolean, default=False)
    medical_status = Column(Boolean, default=False)
    role = Column(String)
    department = Column(String)
    organization_id = Column(String, ForeignKey("core_organizations.id"), index=True, nullable=True)
    
    # Foreign Keys
    department_id = Column(String, ForeignKey("core_departments.id"))
    designation_id = Column(String, ForeignKey("hcm_designations.id"))
    grade_id = Column(String, ForeignKey("hcm_grades.id"))
    plant_id = Column(String, ForeignKey("core_locations.id"))
    shift_id = Column(String, ForeignKey("hcm_shifts.id"))

    status = Column(String)
    join_date = Column(String)
    email = Column(String, unique=True, index=True)

    # Relationships
    department_rel = relationship("DBDepartment", foreign_keys=[department_id])
    designation_rel = relationship("DBDesignation", foreign_keys=[designation_id])
    grade_rel = relationship("DBGrade", foreign_keys=[grade_id])
    plant_rel = relationship("DBHRPlant", foreign_keys=[plant_id])
    shift_rel = relationship("DBShift", foreign_keys=[shift_id])
    
    education = relationship("DBEducation", backref="employee", cascade="all, delete-orphan")
    experience = relationship("DBExperience", backref="employee", cascade="all, delete-orphan")
    family = relationship("DBFamily", backref="employee", cascade="all, delete-orphan")
    discipline = relationship("DBDiscipline", backref="employee", cascade="all, delete-orphan")
    increments = relationship("DBIncrement", backref="employee", cascade="all, delete-orphan")

class DBJobLevel(Base, PrismaAuditMixin):
    __tablename__ = "hcm_job_levels"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("core_organizations.id"), nullable=False, index=True)

    grades = relationship("DBGrade", backref="job_level", cascade="all, delete-orphan")

    @property
    def isActive(self):
        return self.is_active

class DBGrade(Base, PrismaAuditMixin):
    __tablename__ = "hcm_grades"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    level = Column(Integer)
    job_level_id = Column(String, ForeignKey("hcm_job_levels.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("core_organizations.id"), nullable=False, index=True)
    code = Column(String, unique=True)

    @property
    def isActive(self):
        return self.is_active

class DBDesignation(Base, PrismaAuditMixin):
    __tablename__ = "hcm_designations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    grade_id = Column(String, ForeignKey("hcm_grades.id"), nullable=False)
    department_id = Column(String, ForeignKey("core_departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("core_organizations.id"), nullable=False, index=True)
    code = Column(String, unique=True)

    @property
    def isActive(self):
        return self.is_active

class DBShift(Base, PrismaAuditMixin):
    __tablename__ = "hcm_shifts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True, index=True)
    type = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    grace_period = Column(Integer)
    break_duration = Column(Integer)
    work_days = Column(String)
    color = Column(String, nullable=True)
    description = Column(String, nullable=True)
    isActive = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("core_organizations.id"), nullable=False, index=True)

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

class DBEducation(Base, AuditMixin):
    __tablename__ = "hcm_employee_education"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"))
    degree = Column(String)
    institute = Column(String)
    passing_year = Column(String)
    score = Column(String)
    marks_obtained = Column(Float)
    total_marks = Column(Float)

    @property
    def year(self): return self.passing_year
    @property
    def gradeGpa(self): return self.score
    @property
    def marksObtained(self): return self.marks_obtained
    @property
    def totalMarks(self): return self.total_marks

class DBExperience(Base, AuditMixin):
    __tablename__ = "hcm_employee_experience"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"))
    company_name = Column(String)
    designation = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    gross_salary = Column(Float)
    remarks = Column(String)

    @property
    def orgName(self): return self.company_name
    @property
    def to(self): return self.end_date
    @property
    def grossSalary(self): return self.gross_salary

class DBFamily(Base, AuditMixin):
    __tablename__ = "hcm_employee_family"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"))
    name = Column(String)
    relationship = Column(String)
    dob = Column(String)

class DBDiscipline(Base, AuditMixin):
    __tablename__ = "hcm_employee_discipline"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"))
    date = Column(String)
    description = Column(String)
    outcome = Column(String)

class DBIncrement(Base, AuditMixin):
    __tablename__ = "hcm_employee_increments"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"))
    effective_date = Column(String)
    amount = Column(Float)
    increment_type = Column(String)
    remarks = Column(String)
    previous_salary = Column(Float)
    new_gross = Column(Float)
    house_rent = Column(Float)
    utility = Column(Float)
    other_allowance = Column(Float)

    @property
    def effectiveDate(self): return self.effective_date
    @property
    def type(self): return self.increment_type
    @property
    def newGross(self): return self.new_gross
    @property
    def newHouseRent(self): return self.house_rent
    @property
    def newUtilityAllowance(self): return self.utility
    @property
    def newOtherAllowance(self): return self.other_allowance

# ... (Additional HCM models abbreviated for brevity, can be added if needed)

class DBAttendance(Base, AuditMixin):
    __tablename__ = "hcm_attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True) # YYYY-MM-DD
    clock_in = Column(String, nullable=True)
    clock_out = Column(String, nullable=True)
    status = Column(String, default="Absent") # Present, Absent, Leave, Late
    shift_id = Column(String, ForeignKey("hcm_shifts.id"), nullable=True)
    
    # Relationships
    employee = relationship("DBEmployee", backref="attendance_records")
    shift = relationship("DBShift")

class DBPayrollLedger(Base, AuditMixin):
    __tablename__ = "hcm_payroll_ledger"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"), nullable=False)
    period_month = Column(String, nullable=False) # e.g. "January"
    period_year = Column(String, nullable=False) # e.g. "2025"
    
    basic_salary = Column(Float, default=0.0)
    gross_salary = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)
    
    additions = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    
    status = Column(String, default="Draft") # Draft, Processed, Paid
    payment_date = Column(String, nullable=True)
    payment_mode = Column(String, nullable=True) # Cash, Bank Transfer
    
    # Relationships
    employee = relationship("DBEmployee", backref="payroll_records")

class DBLeaveBalance(Base, AuditMixin):
    __tablename__ = "hcm_leave_balances"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("hcm_employees.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False) # e.g. 2025
    
    # Entitlements
    annual_total = Column(Float, default=14.0)
    annual_used = Column(Float, default=0.0)
    
    sick_total = Column(Float, default=10.0)
    sick_used = Column(Float, default=0.0)
    
    casual_total = Column(Float, default=10.0)
    casual_used = Column(Float, default=0.0)
    
    unpaid_used = Column(Float, default=0.0)
    
    employee = relationship("DBEmployee", backref="leave_balances")

class DBLeaveRequest(Base, AuditMixin):
    __tablename__ = "hcm_leave_requests"
    
    id = Column(String, primary_key=True, index=True) # LR-123
    employee_id = Column(String, ForeignKey("hcm_employees.id"), nullable=False, index=True)
    type = Column(String, nullable=False) # Annual, Sick, Casual, Unpaid
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    days = Column(Float, default=1.0)
    reason = Column(String, nullable=True)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    
    # Relationships
    employee = relationship("DBEmployee", backref="leave_requests")
