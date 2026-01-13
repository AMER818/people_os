import datetime as dt
import json
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas
from .utils import format_to_db


def get_employee(db: Session, employee_id: str):
    return (
        db.query(models.DBEmployee).filter(models.DBEmployee.id == employee_id).first()
    )


def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBEmployee).offset(skip).limit(limit).all()


    return db.query(models.DBEmployee).offset(skip).limit(limit).all()


# --- RBAC Persistence CRUD ---
# (Legacy JSON-based functions removed. See correct implementations at bottom of file)



def create_employee(db: Session, employee: schemas.EmployeeCreate, user_id: str):
    # Construct name if missing
    full_name = employee.name
    if not full_name:
        full_name = (
            f"{employee.firstName or ''} {employee.lastName or ''}".strip() or "Unknown"
        )

    # Use hireDate if join_date not provided
    join_date_value = employee.join_date or employee.hireDate

    # Generate ID if missing
    import time

    generated_id = employee.id
    if not generated_id:
        generated_id = f"EMP-{int(time.time())}"

    db_employee = models.DBEmployee(
        id=generated_id,
        name=full_name,
        role=employee.role or "",
        department=employee.department or "",
        # New Fields
        department_id=employee.department_id,
        designation_id=employee.designation_id,
        grade_id=employee.grade_id,
        plant_id=employee.plant_id,
        shift_id=employee.shift_id,
        status=employee.status,
        join_date=format_to_db(join_date_value) if join_date_value else None,
        email=employee.email,
        created_by=user_id,
        updated_by=user_id,
        organization_id=employee.organization_id,
        # Legacy Fields (Start)
        employee_code=generated_id,  # Fallback
        eobi_status=False,
        social_security_status=False,
        medical_status=False,
        # Legacy Fields (End)
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    # --- Save Secondary Tabs ---
    # 1. Education
    for edu in employee.education:
        db_edu = models.DBEducation(
            employee_id=db_employee.id,
            degree=edu.degree,
            institute=edu.institute,
            passing_year=edu.year,
            score=edu.gradeGpa,
            marks_obtained=edu.marksObtained,
            total_marks=edu.totalMarks,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_edu)

    # 2. Experience
    for exp in employee.experience:
        db_exp = models.DBExperience(
            employee_id=db_employee.id,
            company_name=exp.orgName,
            designation=exp.designation,
            start_date=exp.from_,
            end_date=exp.to,
            gross_salary=exp.grossSalary,
            remarks=exp.remarks,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_exp)

    # 3. Family
    for fam in employee.family:
        db_fam = models.DBFamily(
            employee_id=db_employee.id,
            name=fam.name,
            relationship=fam.relationship,
            dob=fam.dob,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_fam)

    # 4. Discipline
    for disc in employee.discipline:
        db_disc = models.DBDiscipline(
            employee_id=db_employee.id,
            date=disc.date,
            description=disc.description,
            outcome=disc.outcome,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_disc)

    # 5. Increments
    for inc in employee.increments:
        db_inc = models.DBIncrement(
            employee_id=db_employee.id,
            effective_date=inc.effectiveDate,
            amount=inc.newGross,
            increment_type=inc.type,
            remarks=inc.remarks,
            new_gross=inc.newGross,
            house_rent=inc.newHouseRent,
            utility=inc.newUtilityAllowance,
            other_allowance=inc.newOtherAllowance,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_inc)

    db.commit()
    return db_employee


def update_employee(
    db: Session, employee_id: str, employee: schemas.EmployeeCreate, user_id: str
):
    db_employee = get_employee(db, employee_id)
    if db_employee:
        # Update Main Fields
        db_employee.name = employee.name
        db_employee.role = employee.role
        db_employee.department = employee.department

        db_employee.department_id = employee.department_id
        db_employee.designation_id = employee.designation_id
        db_employee.grade_id = employee.grade_id
        db_employee.plant_id = employee.plant_id
        db_employee.shift_id = employee.shift_id

        db_employee.status = employee.status
        db_employee.join_date = format_to_db(employee.join_date)
        db_employee.email = employee.email
        db_employee.updated_by = user_id

        # --- Auto-Sync Linked User Status ---
        linked_user = (
            db.query(models.DBUser)
            .filter(models.DBUser.employee_id == employee_id)
            .first()
        )
        if linked_user:
            # If employee is not Active, deactivate user
            if db_employee.status != "Active":
                linked_user.is_active = False
            # Optional: Reactivate if Employee becomes Active?
            # Policy: If employee is re-hired/active, maybe user should be active?
            # Let's support bi-directional sync for Active status too.
            elif db_employee.status == "Active":
                linked_user.is_active = True

        # --- Update Secondary Tabs (Full Replace Strategy) ---

        # Education
        db.query(models.DBEducation).filter(
            models.DBEducation.employee_id == employee_id
        ).delete()
        for edu in employee.education:
            db.add(
                models.DBEducation(
                    employee_id=employee_id,
                    degree=edu.degree,
                    institute=edu.institute,
                    passing_year=edu.year,
                    score=edu.gradeGpa,
                    marks_obtained=edu.marksObtained,
                    total_marks=edu.totalMarks,
                    created_by=user_id,
                    updated_by=user_id,
                )
            )

        # Experience
        db.query(models.DBExperience).filter(
            models.DBExperience.employee_id == employee_id
        ).delete()
        for exp in employee.experience:
            db.add(
                models.DBExperience(
                    employee_id=employee_id,
                    company_name=exp.orgName,
                    designation=exp.designation,
                    start_date=exp.from_,
                    end_date=exp.to,
                    gross_salary=exp.grossSalary,
                    remarks=exp.remarks,
                    created_by=user_id,
                    updated_by=user_id,
                )
            )

        # Family
        db.query(models.DBFamily).filter(
            models.DBFamily.employee_id == employee_id
        ).delete()
        for fam in employee.family:
            db.add(
                models.DBFamily(
                    employee_id=employee_id,
                    name=fam.name,
                    relationship=fam.relationship,
                    dob=fam.dob,
                    created_by=user_id,
                    updated_by=user_id,
                )
            )

        # Discipline
        db.query(models.DBDiscipline).filter(
            models.DBDiscipline.employee_id == employee_id
        ).delete()
        for disc in employee.discipline:
            db.add(
                models.DBDiscipline(
                    employee_id=employee_id,
                    date=disc.date,
                    description=disc.description,
                    outcome=disc.outcome,
                    created_by=user_id,
                    updated_by=user_id,
                )
            )

        # Increments
        db.query(models.DBIncrement).filter(
            models.DBIncrement.employee_id == employee_id
        ).delete()
        for inc in employee.increments:
            db.add(
                models.DBIncrement(
                    employee_id=employee_id,
                    effective_date=inc.effectiveDate,
                    amount=inc.newGross,
                    increment_type=inc.type,
                    remarks=inc.remarks,
                    new_gross=inc.newGross,
                    house_rent=inc.newHouseRent,
                    utility=inc.newUtilityAllowance,
                    other_allowance=inc.newOtherAllowance,
                    created_by=user_id,
                    updated_by=user_id,
                )
            )

        db.commit()
        db.refresh(db_employee)
    return db_employee


def delete_employee(db: Session, employee_id: str):
    """Delete employee and all related records"""
    # Security: Prevent deletion of System Accounts
    if employee_id in ["0", "1"]:
        print(
            f"SECURITY ALERT: Attempt to delete System Account {employee_id} blocked."
        )
        return None

    db_employee = (
        db.query(models.DBEmployee).filter(models.DBEmployee.id == employee_id).first()
    )
    if db_employee:
        # Delete all related records
        db.query(models.DBEducation).filter(
            models.DBEducation.employee_id == employee_id
        ).delete()
        db.query(models.DBExperience).filter(
            models.DBExperience.employee_id == employee_id
        ).delete()
        db.query(models.DBFamily).filter(
            models.DBFamily.employee_id == employee_id
        ).delete()
        db.query(models.DBDiscipline).filter(
            models.DBDiscipline.employee_id == employee_id
        ).delete()
        db.query(models.DBIncrement).filter(
            models.DBIncrement.employee_id == employee_id
        ).delete()

        # Delete the employee
        db.delete(db_employee)
        db.commit()
    return db_employee


# ... delete doesn't change audit unless soft delete. We'll skip delete audit for now as per minimal req.


# --- Candidates ---
def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBCandidate).offset(skip).limit(limit).all()


def create_candidate(db: Session, candidate: schemas.CandidateCreate, user_id: str):
    try:
        # Convert list of skills to string for storage
        skills_str = ",".join(candidate.skills)

        # Construct name if missing
        full_name = candidate.name
        if not full_name:
            full_name = (
                f"{candidate.firstName or ''} {candidate.lastName or ''}".strip()
                or "Unknown"
            )

        db_candidate = models.DBCandidate(
            id=candidate.id,
            name=full_name,
            email=candidate.email,
            phone=candidate.phone,
            position_applied=candidate.positionApplied,
            current_stage=candidate.currentStage,
            score=candidate.score,
            resume_url=candidate.resumeUrl,
            skills=skills_str,
            applied_date=format_to_db(candidate.appliedDate),
            avatar=candidate.avatar,
            created_by=user_id,
            updated_by=user_id,
            organization_id=candidate.organization_id,
        )
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
        return db_candidate
    except Exception as e:
        import traceback

        with open("d:/Python/HCM_WEB/debug_error.txt", "w") as f:
            f.write(str(e))
            f.write("\n")
            f.write(traceback.format_exc())
        raise e


def update_candidate(
    db: Session, candidate_id: str, candidate: schemas.CandidateCreate, user_id: str
):
    db_candidate = (
        db.query(models.DBCandidate)
        .filter(models.DBCandidate.id == candidate_id)
        .first()
    )
    if db_candidate:
        db_candidate.name = candidate.name
        db_candidate.email = candidate.email
        db_candidate.phone = candidate.phone
        db_candidate.position_applied = candidate.positionApplied
        db_candidate.current_stage = candidate.currentStage
        db_candidate.score = candidate.score
        db_candidate.resume_url = candidate.resumeUrl
        db_candidate.skills = ",".join(candidate.skills)
        db_candidate.applied_date = format_to_db(candidate.appliedDate)
        db_candidate.avatar = candidate.avatar
        db_candidate.updated_by = user_id
        db_candidate.avatar = candidate.avatar
        db_candidate.updated_by = user_id
        db.commit()
        db.refresh(db_candidate)
    return db_candidate

    if db_candidate:
        db.delete(db_candidate)
        db.commit()
    return db_candidate


# --- Job Vacancies ---
def get_job_vacancies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBJobVacancy).offset(skip).limit(limit).all()


def create_job_vacancy(db: Session, job: schemas.JobVacancyCreate, user_id: str):
    req_str = ",".join(job.requirements)

    db_job = models.DBJobVacancy(
        id=job.id,
        title=job.title,
        department=job.department,
        location=job.location,
        type=job.type,
        posted_date=format_to_db(job.posted_date),
        status=job.status,
        applicants_count=job.applicants_count,
        description=job.description,
        requirements=req_str,
        salary_range=job.salary_range,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


# ... (Skipping irrelevant functions if any)




def create_department(db: Session, dept: schemas.DepartmentCreate, user_id: str):
    if isinstance(user_id, dict):
        user_id = user_id.get("id", "UNKNOWN")
    db_dept = models.DBDepartment(
        id=dept.id or str(uuid.uuid4()),
        code=dept.code,
        name=dept.name,
        is_active=dept.is_active,
        organization_id=dept.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept


def update_job_vacancy(
    db: Session, job_id: str, job: schemas.JobVacancyCreate, user_id: str
):
    db_job = (
        db.query(models.DBJobVacancy).filter(models.DBJobVacancy.id == job_id).first()
    )
    if db_job:
        db_job.title = job.title
        db_job.department = job.department
        db_job.location = job.location
        db_job.type = job.type
        db_job.posted_date = format_to_db(job.postedDate)
        db_job.status = job.status
        db_job.applicants_count = job.applicants
        db_job.description = job.description
        db_job.requirements = ",".join(job.requirements)
        db_job.salary_range = job.salaryRange
        db_job.updated_by = user_id
        db.commit()
        db.refresh(db_job)
    return db_job


def delete_job_vacancy(db: Session, job_id: str):
    db_job = (
        db.query(models.DBJobVacancy).filter(models.DBJobVacancy.id == job_id).first()
    )
    if db_job:
        db.delete(db_job)
        db.commit()
    return db_job


# --- Organizations ---


def get_organizations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBOrganization).offset(skip).limit(limit).all()


def get_organization(db: Session, org_id: str):
    return (
        db.query(models.DBOrganization)
        .filter(models.DBOrganization.id == org_id)
        .first()
    )


def create_organization(db: Session, org: schemas.OrganizationCreate, user_id: str):
    if isinstance(user_id, dict):
        user_id = user_id.get("id", "UNKNOWN")
    try:
        org_id = org.id or str(uuid.uuid4())
        org_code = org.code or f"ORG-{org_id[:8].upper()}"

        db_org = models.DBOrganization(
            id=org_id,
            code=org_code,
            name=org.name or "My Organization",
            is_active=org.is_active,
            created_by=user_id,
            updated_by=user_id,
            # Contact & Location
            email=org.email,
            phone=org.phone,
            website=org.website,
            address_line1=org.address_line1,
            address_line2=org.address_line2,
            city=org.city,
            state=org.state,
            zip_code=org.zip_code,
            country=org.country,
            # Branding
            logo=org.logo,
            cover_url=org.cover_url,
            # Metadata
            industry=org.industry,
            currency=org.currency,
            tax_year_end=org.tax_year_end,
            description=org.description,
            # Legal
            tax_id=org.tax_id,
            registration_number=org.registration_number,
            founded_date=org.founded_date,
            social_links=(
                json.dumps(org.social_links)
                if isinstance(org.social_links, dict)
                else org.social_links
            ),
        )
        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        return db_org
    except Exception as e:
        import traceback

        with open("d:/Python/HCM_WEB/debug_error.txt", "w") as f:
            f.write(str(e))
            f.write("\n")
            f.write(traceback.format_exc())
        raise e


def update_organization(
    db: Session, org_id: str, org: schemas.OrganizationCreate, user_id: str
):
    if isinstance(user_id, dict):
        user_id = user_id.get("id", "UNKNOWN")
    db_org = (
        db.query(models.DBOrganization)
        .filter(models.DBOrganization.id == org_id)
        .first()
    )
    if db_org:
        db_org.code = org.code or db_org.code
        db_org.name = org.name or db_org.name
        db_org.is_active = org.is_active

        # Contact & Location
        db_org.email = org.email
        db_org.phone = org.phone
        db_org.website = org.website
        db_org.address_line1 = org.address_line1
        db_org.address_line2 = org.address_line2
        db_org.city = org.city
        db_org.state = org.state
        db_org.zip_code = org.zip_code
        db_org.country = org.country

        # Branding
        db_org.logo = org.logo
        db_org.cover_url = org.cover_url

        # Metadata
        db_org.industry = org.industry or db_org.industry
        db_org.currency = org.currency or db_org.currency
        db_org.tax_year_end = org.tax_year_end or db_org.tax_year_end
        db_org.description = org.description or db_org.description

        # Legal
        db_org.tax_id = org.tax_id
        db_org.registration_number = org.registration_number
        db_org.founded_date = org.founded_date
        if org.social_links is not None:
            if isinstance(org.social_links, (dict, list)):
                db_org.social_links = json.dumps(org.social_links)
            else:
                db_org.social_links = org.social_links

        db_org.updated_by = user_id
        db.commit()
        db.refresh(db_org)
    return db_org


# --- Plants ---


def get_plants(db: Session, org_id: str = None):
    query = db.query(models.DBHRPlant)
    if org_id:
        query = query.filter(models.DBHRPlant.organization_id == org_id)
    return query.all()


def create_plant(db: Session, plant: schemas.PlantCreate, user_id: str):
    plant_id = plant.id or str(uuid.uuid4())

    db_plant = models.DBHRPlant(
        id=plant_id,
        code=plant.code,
        name=plant.name,
        location=plant.location,
        organization_id=plant.organization_id,  # Using organization_id from schema
        current_sequence=plant.current_sequence,
        is_active=plant.is_active,
        head_of_plant=plant.head_of_plant,
        contact_number=plant.contact_number,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_plant)

    if plant.divisions:
        for div in plant.divisions:
            div_id = div.id or str(uuid.uuid4())
            db_div = models.DBPlantDivision(
                id=div_id,
                plant_id=plant_id,
                name=div.name,
                code=div.code,
                is_active=div.is_active,
                created_by=user_id,
                updated_by=user_id,
            )
            db.add(db_div)

    db.commit()
    db.refresh(db_plant)
    return db_plant


def get_plant(db: Session, plant_id: str):
    return db.query(models.DBHRPlant).filter(models.DBHRPlant.id == plant_id).first()


def update_plant(db: Session, plant_id: str, plant: schemas.PlantCreate, user_id: str):
    db_plant = (
        db.query(models.DBHRPlant).filter(models.DBHRPlant.id == plant_id).first()
    )
    if db_plant:
        db_plant.name = plant.name
        db_plant.location = plant.location
        db_plant.code = plant.code
        db_plant.organization_id = plant.organization_id
        db_plant.current_sequence = plant.current_sequence
        db_plant.is_active = plant.is_active
        db_plant.head_of_plant = plant.head_of_plant
        db_plant.contact_number = plant.contact_number

        # Update Divisions (Full Replace)
        db.query(models.DBPlantDivision).filter(
            models.DBPlantDivision.plant_id == plant_id
        ).delete()
        if plant.divisions:
            for div in plant.divisions:
                div_id = div.id or str(uuid.uuid4())
                db_div = models.DBPlantDivision(
                    id=div_id,
                    plant_id=plant_id,
                    name=div.name,
                    code=div.code,
                    is_active=div.is_active,
                    created_by=user_id,
                    updated_by=user_id,
                )
                db.add(db_div)

        db_plant.updated_by = user_id
        db.commit()
        db.refresh(db_plant)
    return db_plant


def delete_plant(db: Session, plant_id: str):
    db_plant = (
        db.query(models.DBHRPlant).filter(models.DBHRPlant.id == plant_id).first()
    )
    if db_plant:
        db.delete(db_plant)
        db.commit()
    return db_plant


# --- Employment Levels ---

def get_employment_levels(db: Session, org_id: str = None):
    query = db.query(models.DBEmploymentLevel)
    if org_id:
        query = query.filter(models.DBEmploymentLevel.organization_id == org_id)
    return query.all()


def create_employment_level(db: Session, employment_level: schemas.EmploymentLevelCreate, user_id: str):
    db_emp_level = models.DBEmploymentLevel(
        id=employment_level.id or str(uuid.uuid4()),
        name=employment_level.name,
        code=employment_level.code,
        description=employment_level.description,
        is_active=employment_level.is_active,
        organization_id=employment_level.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_emp_level)
    db.commit()
    db.refresh(db_emp_level)
    return db_emp_level


def update_employment_level(db: Session, level_id: str, employment_level: schemas.EmploymentLevelCreate, user_id: str):
    db_emp_level = db.query(models.DBEmploymentLevel).filter(models.DBEmploymentLevel.id == level_id).first()
    if db_emp_level:
        db_emp_level.name = employment_level.name
        db_emp_level.code = employment_level.code
        db_emp_level.description = employment_level.description
        db_emp_level.is_active = employment_level.is_active
        db_emp_level.updated_by = user_id
        db.commit()
        db.refresh(db_emp_level)
    return db_emp_level


def delete_employment_level(db: Session, level_id: str):
    db_emp_level = db.query(models.DBEmploymentLevel).filter(models.DBEmploymentLevel.id == level_id).first()
    if db_emp_level:
        db.delete(db_emp_level)
        db.commit()
    return db_emp_level


# --- RBAC Permissions CRUD ---

def get_all_role_permissions(db: Session):
    roles = db.query(models.DBRolePermission).all()
    result = {}
    for r in roles:
        if r.role not in result:
            result[r.role] = []
        result[r.role].append(r.permission)
    return result


def get_role_permissions(db: Session, role: str):
    perms = db.query(models.DBRolePermission).filter(models.DBRolePermission.role == role).all()
    return [p.permission for p in perms]


def update_role_permissions(db: Session, role: str, permissions: List[str]):
    # Delete existing
    db.query(models.DBRolePermission).filter(models.DBRolePermission.role == role).delete()
    
    # Add new
    for p in permissions:
        db_p = models.DBRolePermission(role=role, permission=p)
        db.add(db_p)
    
    db.commit()
    return get_role_permissions(db, role)


# --- Departments ---
def get_departments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBDepartment).offset(skip).limit(limit).all()


def create_department(db: Session, dept: schemas.DepartmentCreate, user_id: str):
    if isinstance(user_id, dict):
        user_id = user_id.get("id", "UNKNOWN")
    db_dept = models.DBDepartment(
        id=dept.id or str(uuid.uuid4()),
        code=dept.code,
        name=dept.name,
        isActive=dept.is_active,
        organization_id=dept.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept


def update_department(
    db: Session, dept_id: str, dept: schemas.DepartmentCreate, user_id: str
):
    db_dept = (
        db.query(models.DBDepartment).filter(models.DBDepartment.id == dept_id).first()
    )
    if db_dept:
        db_dept.code = dept.code
        db_dept.name = dept.name
        db_dept.is_active = dept.is_active
        db_dept.organization_id = dept.organization_id
        db_dept.updated_by = user_id
        db.commit()
        db.refresh(db_dept)
    return db_dept


def delete_department(db: Session, dept_id: str):
    db_dept = (
        db.query(models.DBDepartment).filter(models.DBDepartment.id == dept_id).first()
    )
    if db_dept:
        db.delete(db_dept)
        db.commit()
    return db_dept


# Redoing with proper imports check.


# --- SubDepartments ---
def get_sub_departments(db: Session):
    return db.query(models.DBSubDepartment).all()


def create_sub_department(db: Session, sub: schemas.SubDepartmentCreate, user_id: str):
    if isinstance(user_id, dict):
        user_id = user_id.get("id", "UNKNOWN")
    db_sub = models.DBSubDepartment(
        id=sub.id or str(uuid.uuid4()),
        code=sub.code,
        name=sub.name,
        parent_department_id=sub.parent_department_id,
        is_active=sub.is_active,
        organization_id=sub.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub


def update_sub_department(
    db: Session, sub_id: str, sub: schemas.SubDepartmentCreate, user_id: str
):
    db_sub = (
        db.query(models.DBSubDepartment)
        .filter(models.DBSubDepartment.id == sub_id)
        .first()
    )
    if db_sub:
        db_sub.code = sub.code
        db_sub.name = sub.name
        db_sub.parent_department_id = sub.parent_department_id
        db_sub.is_active = sub.is_active
        db_sub.organization_id = sub.organization_id
        db_sub.updated_by = user_id
        db.commit()
        db.refresh(db_sub)
    return db_sub


def delete_sub_department(db: Session, sub_id: str):
    db_sub = (
        db.query(models.DBSubDepartment)
        .filter(models.DBSubDepartment.id == sub_id)
        .first()
    )
    if db_sub:
        db.delete(db_sub)
        db.commit()
    return db_sub


# --- Grades ---
def get_grades(db: Session):
    return db.query(models.DBGrade).all()


def create_grade(db: Session, grade: schemas.GradeCreate, user_id: str):
    import time

    print(f"DEBUG CREATE GRADE: {grade}")

    # Generate ID first
    generated_id = grade.id if grade.id else f"GRD-{int(time.time())}"

    # Auto-generate code if missing
    code = getattr(grade, "code", None) or f"G-{grade.level}-{generated_id[-4:]}"

    db_grade = models.DBGrade(
        id=generated_id,
        name=grade.name,
        level=grade.level,
        is_active=grade.is_active,
        organization_id=grade.organization_id,
        employment_level_id=grade.employment_level_id,  # Added for Hierarchy
        created_by=user_id,
        updated_by=user_id,
        # Legacy
        code=code,
    )
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade


def update_grade(db: Session, grade_id: str, grade: schemas.GradeCreate, user_id: str):
    db_grade = db.query(models.DBGrade).filter(models.DBGrade.id == grade_id).first()
    if db_grade:
        db_grade.name = grade.name
        db_grade.level = grade.level
        db_grade.is_active = grade.is_active
        db_grade.organization_id = grade.organization_id
        db_grade.employment_level_id = grade.employment_level_id  # Added for Hierarchy
        db_grade.updated_by = user_id
        db.commit()
        db.refresh(db_grade)
    return db_grade


def delete_grade(db: Session, grade_id: str):
    db_grade = db.query(models.DBGrade).filter(models.DBGrade.id == grade_id).first()
    if db_grade:
        db.delete(db_grade)
        db.commit()
    return db_grade


# --- Designations ---
def get_designations(db: Session):
    return db.query(models.DBDesignation).all()


def create_designation(db: Session, desig: schemas.DesignationCreate, user_id: str):
    import time

    # Generate ID first
    generated_id = desig.id if desig.id else f"DSG-{int(time.time())}"

    # Auto-generate code
    code = getattr(desig, "code", None) or f"DSG-{generated_id}"

    db_desig = models.DBDesignation(
        id=generated_id,
        name=desig.name,
        grade_id=desig.grade_id,
        department_id=desig.department_id,
        is_active=desig.is_active,
        organization_id=desig.organization_id,
        created_by=user_id,
        updated_by=user_id,
        # Legacy
        code=code,
    )
    db.add(db_desig)
    db.commit()
    db.refresh(db_desig)
    return db_desig


def update_designation(
    db: Session, desig_id: str, desig: schemas.DesignationCreate, user_id: str
):
    db_desig = (
        db.query(models.DBDesignation)
        .filter(models.DBDesignation.id == desig_id)
        .first()
    )
    if db_desig:
        db_desig.name = desig.name
        db_desig.grade_id = desig.grade_id
        db_desig.department_id = desig.department_id
        db_desig.is_active = desig.is_active
        db_desig.organization_id = desig.organization_id
        db_desig.updated_by = user_id
        db.commit()
        db.refresh(db_desig)
    return db_desig


def delete_designation(db: Session, desig_id: str):
    db_desig = (
        db.query(models.DBDesignation)
        .filter(models.DBDesignation.id == desig_id)
        .first()
    )
    if db_desig:
        db.delete(db_desig)
        db.commit()
    return db_desig


# --- Shifts ---
def get_shifts(db: Session):
    return db.query(models.DBShift).all()


def create_shift(db: Session, shift: schemas.ShiftCreate, user_id: str):
    import time

    db_shift = models.DBShift(
        id=shift.id if shift.id else f"SHF-{int(time.time())}",
        name=shift.name,
        code=shift.code,
        type=shift.type,
        startTime=shift.startTime,
        endTime=shift.endTime,
        gracePeriod=shift.gracePeriod,
        breakDuration=shift.breakDuration,
        workDays=",".join(shift.workDays) if shift.workDays else "",
        isActive=shift.is_active,
        organization_id=shift.organization_id,
        created_by=user_id,
        updated_by=user_id,
        # Legacy
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift


def update_shift(db: Session, shift_id: str, shift: schemas.ShiftCreate, user_id: str):
    db_shift = db.query(models.DBShift).filter(models.DBShift.id == shift_id).first()
    if db_shift:
        db_shift.name = shift.name
        db_shift.code = shift.code
        db_shift.type = shift.type
        db_shift.startTime = shift.startTime
        db_shift.endTime = shift.endTime
        db_shift.gracePeriod = shift.gracePeriod
        db_shift.breakDuration = shift.breakDuration
        db_shift.workDays = ",".join(shift.workDays) if shift.workDays else ""
        db_shift.isActive = shift.is_active
        db_shift.organization_id = shift.organization_id
        db_shift.updated_by = user_id
        db.commit()
        db.refresh(db_shift)
    return db_shift


def delete_shift(db: Session, shift_id: str):
    db_shift = db.query(models.DBShift).filter(models.DBShift.id == shift_id).first()
    if db_shift:
        db.delete(db_shift)
        db.commit()
    return db_shift


# --- Employment Levels ---
def get_employment_levels(db: Session):
    return db.query(models.DBEmploymentLevel).all()


def create_employment_level(
    db: Session, emp_level: schemas.EmploymentLevelCreate, user_id: str
):
    import time

    db_level = models.DBEmploymentLevel(
        id=emp_level.id if emp_level.id else f"EL-{int(time.time())}",
        name=emp_level.name,
        code=emp_level.code,
        description=emp_level.description,
        is_active=emp_level.is_active,
        organization_id=emp_level.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    return db_level


def update_employment_level(
    db: Session, level_id: str, emp_level: schemas.EmploymentLevelCreate, user_id: str
):
    db_level = (
        db.query(models.DBEmploymentLevel)
        .filter(models.DBEmploymentLevel.id == level_id)
        .first()
    )
    if db_level:
        db_level.name = emp_level.name
        db_level.code = emp_level.code
        db_level.description = emp_level.description
        db_level.is_active = emp_level.is_active
        db_level.updated_by = user_id
        db.commit()
        db.refresh(db_level)
    return db_level


# --- Positions ---
def get_positions(db: Session):
    return db.query(models.DBPosition).all()


def create_position(db: Session, position: schemas.PositionCreate, user_id: str):
    import time

    db_pos = models.DBPosition(
        id=position.id if position.id else f"POS-{int(time.time())}",
        title=position.title,
        department_id=position.department_id,
        grade_id=position.grade_id,
        designation_id=position.designation_id,
        reports_to=position.reports_to,
        description=position.description,
        is_active=position.is_active,
        organization_id=position.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_pos)
    db.commit()
    db.refresh(db_pos)
    return db_pos


def update_position(
    db: Session, position_id: str, position: schemas.PositionCreate, user_id: str
):
    db_pos = (
        db.query(models.DBPosition).filter(models.DBPosition.id == position_id).first()
    )
    if db_pos:
        db_pos.title = position.title
        db_pos.department_id = position.department_id
        db_pos.grade_id = position.grade_id
        db_pos.designation_id = position.designation_id
        db_pos.reports_to = position.reports_to
        db_pos.description = position.description
        db_pos.is_active = position.is_active
        db_pos.updated_by = user_id
        db.commit()
        db.refresh(db_pos)
    return db_pos


def delete_position(db: Session, position_id: str):
    db_pos = (
        db.query(models.DBPosition).filter(models.DBPosition.id == position_id).first()
    )
    if db_pos:
        db.delete(db_pos)
        db.commit()
    return db_pos


# --- Holidays ---
def get_holidays(db: Session):
    return db.query(models.DBHoliday).all()


def create_holiday(db: Session, holiday: schemas.HolidayCreate, user_id: str):
    import time

    db_holiday = models.DBHoliday(
        id=holiday.id if holiday.id else f"HOL-{int(time.time())}",
        name=holiday.name,
        date=holiday.date,
        type=holiday.type,
        is_recurring=holiday.is_recurring,
        description=holiday.description,
        organization_id=holiday.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_holiday)
    db.commit()
    db.refresh(db_holiday)
    return db_holiday


def update_holiday(
    db: Session, holiday_id: str, holiday: schemas.HolidayCreate, user_id: str
):
    db_holiday = (
        db.query(models.DBHoliday).filter(models.DBHoliday.id == holiday_id).first()
    )
    if db_holiday:
        db_holiday.name = holiday.name
        db_holiday.date = holiday.date
        db_holiday.type = holiday.type
        db_holiday.is_recurring = holiday.is_recurring
        db_holiday.description = holiday.description
        db_holiday.updated_by = user_id
        db.commit()
        db.refresh(db_holiday)
    return db_holiday


def delete_holiday(db: Session, holiday_id: str):
    db_holiday = (
        db.query(models.DBHoliday).filter(models.DBHoliday.id == holiday_id).first()
    )
    if db_holiday:
        db.delete(db_holiday)
        db.commit()
    return db_holiday


# --- Banks ---
def get_banks(db: Session):
    return db.query(models.DBBank).all()


def create_bank(db: Session, bank: schemas.BankCreate, user_id: str):
    import time

    db_bank = models.DBBank(
        id=bank.id if bank.id else f"BNK-{int(time.time())}",
        bank_name=bank.bank_name,
        account_number=bank.account_number,
        account_title=bank.account_title,
        branch=bank.branch,
        iban=bank.iban,
        swift_code=bank.swift_code,
        currency=bank.currency,
        is_active=bank.is_active,
        organization_id=bank.organization_id,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_bank)
    db.commit()
    db.refresh(db_bank)
    return db_bank


def update_bank(db: Session, bank_id: str, bank: schemas.BankCreate, user_id: str):
    db_bank = db.query(models.DBBank).filter(models.DBBank.id == bank_id).first()
    if db_bank:
        db_bank.bank_name = bank.bank_name
        db_bank.account_number = bank.account_number
        db_bank.account_title = bank.account_title
        db_bank.branch = bank.branch
        db_bank.iban = bank.iban
        db_bank.swift_code = bank.swift_code
        db_bank.currency = bank.currency
        db_bank.is_active = bank.is_active
        db_bank.updated_by = user_id
        db.commit()
        db.refresh(db_bank)
    return db_bank


def delete_bank(db: Session, bank_id: str):
    db_bank = db.query(models.DBBank).filter(models.DBBank.id == bank_id).first()
    if db_bank:
        db.delete(db_bank)
        db.commit()
    return db_bank


# --- Job Vacancies ---


def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBAuditLog).offset(skip).limit(limit).all()


def create_audit_log(db: Session, log: schemas.AuditLogCreate):
    import uuid

    db_log = models.DBAuditLog(
        id=f"LOG-{uuid.uuid4()}",
        user=log.user,
        action=log.action,
        status=log.status,
        time=log.time,
        organization_id=log.organization_id,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_payroll_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBPayroll).offset(skip).limit(limit).all()


# --- Organizations ---
# --- Goals ---
def get_goals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBGoal).offset(skip).limit(limit).all()


def create_goal(db: Session, goal: schemas.GoalCreate, user_id: str):
    db_goal = models.DBGoal(
        id=goal.id,
        title=goal.title,
        category=goal.category,
        progress=goal.progress,
        metric=goal.metric,
        status=goal.status,
        due_date=format_to_db(goal.dueDate),
        weight=goal.weight,
        description=goal.description,
        created_by=user_id,
        updated_by=user_id,
        organization_id=goal.organization_id,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def update_goal(db: Session, goal_id: str, goal: schemas.GoalCreate, user_id: str):
    db_goal = db.query(models.DBGoal).filter(models.DBGoal.id == goal_id).first()
    if db_goal:
        db_goal.title = goal.title
        db_goal.category = goal.category
        db_goal.progress = goal.progress
        db_goal.metric = goal.metric
        db_goal.status = goal.status
        db_goal.due_date = format_to_db(goal.dueDate)
        db_goal.weight = goal.weight
        db_goal.description = goal.description
        db_goal.updated_by = user_id
        db.commit()
        db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: str):
    db_goal = db.query(models.DBGoal).filter(models.DBGoal.id == goal_id).first()
    if db_goal:
        db.delete(db_goal)
        db.commit()
    return db_goal


# --- Performance Reviews ---
def get_performance_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DBPerformanceReview).offset(skip).limit(limit).all()


def create_performance_review(
    db: Session, review: schemas.PerformanceReviewCreate, user_id: str
):
    db_review = models.DBPerformanceReview(
        id=review.id,
        employee_id=review.employeeId,
        review_period=review.reviewPeriod,
        status=review.status,
        score=review.score,
        feedback=review.feedback,
        reviewer_id=review.reviewerId,
        review_date=format_to_db(review.reviewDate),
        created_by=user_id,
        updated_by=user_id,
        organization_id=review.organization_id,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


# --- Payroll Settings ---


def create_payroll_settings(
    db: Session, settings: schemas.PayrollSettingsCreate, user_id: str
):
    db_settings = models.DBPayrollSettings(
        id=settings.id,
        organization_id=settings.organization_id,
        currency=settings.currency,
        tax_year_start=settings.taxYearStart,
        allow_negative_salary=settings.allowNegativeSalary,
        pay_frequency=settings.payFrequency,
        pay_day=settings.payDay,
        tax_calculation_method=settings.taxCalculationMethod,
        eobi_enabled=settings.eobiEnabled,
        social_security_enabled=settings.socialSecurityEnabled,
        overtime_enabled=settings.overtimeEnabled,
        overtime_rate=settings.overtimeRate,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings


def update_payroll_settings(
    db: Session, settings_id: str, settings: schemas.PayrollSettingsCreate, user_id: str
):
    db_settings = (
        db.query(models.DBPayrollSettings)
        .filter(models.DBPayrollSettings.id == settings_id)
        .first()
    )
    if db_settings:
        db_settings.organization_id = settings.organization_id
        db_settings.currency = settings.currency
        db_settings.tax_year_start = settings.taxYearStart
        db_settings.allow_negative_salary = settings.allowNegativeSalary
        db_settings.pay_frequency = settings.payFrequency
        db_settings.pay_day = settings.payDay
        db_settings.tax_calculation_method = settings.taxCalculationMethod
        db_settings.eobi_enabled = settings.eobiEnabled
        db_settings.social_security_enabled = settings.socialSecurityEnabled
        db_settings.overtime_enabled = settings.overtimeEnabled
        db_settings.overtime_rate = settings.overtimeRate
        db_settings.updated_by = user_id

        db.commit()
        db.refresh(db_settings)
    return db_settings


import hashlib
# ===== API Key CRUD =====
import secrets


def _hash_key(key: str) -> str:
    """Hash an API key using SHA256"""
    return hashlib.sha256(key.encode()).hexdigest()


def _generate_key(prefix: str = "hcm") -> str:
    """Generate a secure API key"""
    random_part = secrets.token_urlsafe(32)
    return f"{prefix}_{random_part}"


def _get_key_preview(key: str) -> str:
    """Get preview of key: first 8 + last 4 chars"""
    if len(key) <= 12:
        return key
    return f"{key[:8]}...{key[-4:]}"


def create_api_key(
    db: Session, org_id: str, key_data: schemas.ApiKeyCreate, user_id: str
):
    """Create a new API key for organization"""
    raw_key = _generate_key()
    key_hash = _hash_key(raw_key)

    db_key = models.DBApiKey(
        id=str(uuid.uuid4()),
        organization_id=org_id,
        name=key_data.name,
        key_hash=key_hash,
        expires_at=key_data.expires_at,
        created_by=user_id,
        updated_by=user_id,
    )

    db.add(db_key)
    db.commit()
    db.refresh(db_key)

    # Return response with raw key (only shown once)
    return {
        "id": db_key.id,
        "organization_id": db_key.organization_id,
        "name": db_key.name,
        "key_preview": _get_key_preview(raw_key),
        "raw_key": raw_key,  # Only returned at creation
        "last_used": db_key.last_used,
        "revoked": db_key.revoked,
        "expires_at": db_key.expires_at,
        "created_at": db_key.created_at,
        "created_by": db_key.created_by,
    }


def get_api_keys(db: Session, org_id: str, skip: int = 0, limit: int = 50):
    """Get all API keys for an organization (masked)"""
    keys = (
        db.query(models.DBApiKey)
        .filter(
            models.DBApiKey.organization_id == org_id, models.DBApiKey.revoked == False
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": k.id,
            "organization_id": k.organization_id,
            "name": k.name,
            "key_preview": _get_key_preview(k.key_hash[:12]),  # Show prefix only
            "last_used": k.last_used,
            "revoked": k.revoked,
            "expires_at": k.expires_at,
            "created_at": k.created_at,
            "created_by": k.created_by,
        }
        for k in keys
    ]


def revoke_api_key(db: Session, key_id: str):
    """Revoke an API key"""
    db_key = db.query(models.DBApiKey).filter(models.DBApiKey.id == key_id).first()
    if db_key:
        db_key.revoked = True
        db.commit()
        db.refresh(db_key)
    return db_key


def delete_api_key(db: Session, key_id: str):
    """Delete an API key"""
    db_key = db.query(models.DBApiKey).filter(models.DBApiKey.id == key_id).first()
    if db_key:
        db.delete(db_key)
        db.commit()
    return db_key


# ===== Webhook CRUD =====
def create_webhook(
    db: Session, org_id: str, webhook_data: schemas.WebhookCreate, user_id: str
):
    """Create a new webhook for organization"""
    db_webhook = models.DBWebhook(
        id=str(uuid.uuid4()),
        organization_id=org_id,
        name=webhook_data.name,
        url=webhook_data.url,
        event_types=json.dumps(webhook_data.event_types),
        headers=json.dumps(webhook_data.headers) if webhook_data.headers else None,
        max_retries=webhook_data.max_retries,
        created_by=user_id,
        updated_by=user_id,
    )

    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)

    return {
        "id": db_webhook.id,
        "organization_id": db_webhook.organization_id,
        "name": db_webhook.name,
        "url": db_webhook.url,
        "event_types": json.loads(db_webhook.event_types),
        "headers": json.loads(db_webhook.headers) if db_webhook.headers else None,
        "is_active": db_webhook.is_active,
        "test_payload_sent": db_webhook.test_payload_sent,
        "last_triggered": db_webhook.last_triggered,
        "failure_count": db_webhook.failure_count,
        "max_retries": db_webhook.max_retries,
        "created_at": db_webhook.created_at,
        "created_by": db_webhook.created_by,
    }


def get_webhooks(db: Session, org_id: str, skip: int = 0, limit: int = 50):
    """Get all webhooks for an organization"""
    webhooks = (
        db.query(models.DBWebhook)
        .filter(models.DBWebhook.organization_id == org_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": w.id,
            "organization_id": w.organization_id,
            "name": w.name,
            "url": w.url,
            "event_types": json.loads(w.event_types),
            "headers": json.loads(w.headers) if w.headers else None,
            "is_active": w.is_active,
            "test_payload_sent": w.test_payload_sent,
            "last_triggered": w.last_triggered,
            "failure_count": w.failure_count,
            "max_retries": w.max_retries,
            "created_at": w.created_at,
            "created_by": w.created_by,
        }
        for w in webhooks
    ]


def get_webhook(db: Session, webhook_id: str):
    """Get a specific webhook"""
    webhook = (
        db.query(models.DBWebhook).filter(models.DBWebhook.id == webhook_id).first()
    )
    if webhook:
        return {
            "id": webhook.id,
            "organization_id": webhook.organization_id,
            "name": webhook.name,
            "url": webhook.url,
            "event_types": json.loads(webhook.event_types),
            "headers": json.loads(webhook.headers) if webhook.headers else None,
            "is_active": webhook.is_active,
            "test_payload_sent": webhook.test_payload_sent,
            "last_triggered": webhook.last_triggered,
            "failure_count": webhook.failure_count,
            "max_retries": webhook.max_retries,
            "created_at": webhook.created_at,
            "created_by": webhook.created_by,
        }
    return None


def update_webhook(
    db: Session, webhook_id: str, webhook_data: schemas.WebhookUpdate, user_id: str
):
    """Update a webhook"""
    db_webhook = (
        db.query(models.DBWebhook).filter(models.DBWebhook.id == webhook_id).first()
    )
    if not db_webhook:
        return None

    # Only update fields that are provided
    if webhook_data.name is not None:
        db_webhook.name = webhook_data.name
    if webhook_data.url is not None:
        db_webhook.url = webhook_data.url
    if webhook_data.event_types is not None:
        db_webhook.event_types = json.dumps(webhook_data.event_types)
    if webhook_data.headers is not None:
        db_webhook.headers = json.dumps(webhook_data.headers)
    if webhook_data.is_active is not None:
        db_webhook.is_active = webhook_data.is_active
    if webhook_data.max_retries is not None:
        db_webhook.max_retries = webhook_data.max_retries

    db_webhook.updated_by = user_id
    db.commit()
    db.refresh(db_webhook)

    return get_webhook(db, webhook_id)


def delete_webhook(db: Session, webhook_id: str):
    """Delete a webhook"""
    db_webhook = (
        db.query(models.DBWebhook).filter(models.DBWebhook.id == webhook_id).first()
    )
    if db_webhook:
        db.delete(db_webhook)
        db.commit()
    return db_webhook


def get_webhook_logs(db: Session, webhook_id: str, skip: int = 0, limit: int = 100):
    """Get delivery logs for a webhook"""
    logs = (
        db.query(models.DBWebhookLog)
        .filter(models.DBWebhookLog.webhook_id == webhook_id)
        .order_by(models.DBWebhookLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "webhook_id": log.webhook_id,
            "event_type": log.event_type,
            "delivery_status": log.delivery_status,
            "response_status": log.response_status,
            "retry_count": log.retry_count,
            "error_message": log.error_message,
            "created_at": log.created_at,
        }
        for log in logs
    ]


def create_webhook_log(
    db: Session,
    webhook_id: str,
    org_id: str,
    event_type: str,
    payload: dict,
    response_status: int = None,
    response_body: str = None,
    delivery_status: str = "success",
    error_message: str = None,
):
    """Create a webhook delivery log"""
    db_log = models.DBWebhookLog(
        id=str(uuid.uuid4()),
        webhook_id=webhook_id,
        organization_id=org_id,
        event_type=event_type,
        payload=json.dumps(payload),
        response_status=response_status,
        response_body=response_body,
        delivery_status=delivery_status,
        error_message=error_message,
        created_by="system",
        updated_by="system",
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


# ===== System Flags CRUD =====
def get_or_create_system_flags(db: Session, org_id: str, user_id: str):
    """Get or create system flags for organization"""
    flags = (
        db.query(models.DBSystemFlags)
        .filter(models.DBSystemFlags.organization_id == org_id)
        .first()
    )

    if not flags:
        flags = models.DBSystemFlags(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(flags)
        db.commit()
        db.refresh(flags)

    return _format_system_flags(flags)


def get_system_flags(db: Session, org_id: str):
    """Get system flags for organization"""
    flags = (
        db.query(models.DBSystemFlags)
        .filter(models.DBSystemFlags.organization_id == org_id)
        .first()
    )

    if not flags:
        return None

    return _format_system_flags(flags)


def update_system_flags(
    db: Session, org_id: str, flags_data: schemas.SystemFlagsUpdate, user_id: str
):
    """Update system flags for organization"""
    db_flags = (
        db.query(models.DBSystemFlags)
        .filter(models.DBSystemFlags.organization_id == org_id)
        .first()
    )

    if not db_flags:
        # Create if not exists
        db_flags = models.DBSystemFlags(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_flags)

    # Update only provided fields
    update_data = flags_data.dict(exclude_unset=True)

    # Handle custom_flags separately
    custom_flags = update_data.pop("custom_flags", None)

    for field, value in update_data.items():
        setattr(db_flags, field, value)

    if custom_flags is not None:
        db_flags.custom_flags = json.dumps(custom_flags)

    db_flags.updated_by = user_id
    db.commit()
    db.refresh(db_flags)

    return _format_system_flags(db_flags)


def _format_system_flags(db_flags) -> dict:
    """Format system flags response"""
    custom_flags = {}
    if db_flags.custom_flags:
        try:
            custom_flags = json.loads(db_flags.custom_flags)
        except:
            custom_flags = {}

    return {
        "id": db_flags.id,
        "organization_id": db_flags.organization_id,
        "ai_enabled": db_flags.ai_enabled,
        "advanced_analytics_enabled": db_flags.advanced_analytics_enabled,
        "employee_self_service_enabled": db_flags.employee_self_service_enabled,
        "maintenance_mode": db_flags.maintenance_mode,
        "read_only_mode": db_flags.read_only_mode,
        "cache_enabled": db_flags.cache_enabled,
        "cache_ttl": db_flags.cache_ttl,
        "db_optimization_enabled": db_flags.db_optimization_enabled,
        "db_optimization_last_run": db_flags.db_optimization_last_run,
        "debug_logging_enabled": db_flags.debug_logging_enabled,
        "log_retention_days": db_flags.log_retention_days,
        "rate_limit_enabled": db_flags.rate_limit_enabled,
        "rate_limit_requests_per_minute": db_flags.rate_limit_requests_per_minute,
        "webhooks_enabled": db_flags.webhooks_enabled,
        "webhooks_retry_enabled": db_flags.webhooks_retry_enabled,
        "webhooks_max_retries": db_flags.webhooks_max_retries,
        # Restored Security Flags
        "mfa_enforced": db_flags.mfa_enforced,
        "biometrics_required": db_flags.biometrics_required,
        "ip_whitelisting": db_flags.ip_whitelisting,
        "session_timeout": db_flags.session_timeout,
        "password_complexity": db_flags.password_complexity,
        "session_isolation": db_flags.session_isolation,
        # Restored Neural/Audit Flags
        "neural_bypass": db_flags.neural_bypass,
        "api_caching": db_flags.api_caching,
        "immutable_logs": db_flags.immutable_logs,
        "custom_flags": custom_flags,
        "created_at": db_flags.created_at,
        "updated_at": db_flags.updated_at,
        "created_by": db_flags.created_by,
        "updated_by": db_flags.updated_by,
    }


# ===== Notification Settings CRUD =====
def get_or_create_notification_settings(db: Session, org_id: str, user_id: str):
    """Get or create notification settings for organization"""
    settings = (
        db.query(models.DBNotificationSettings)
        .filter(models.DBNotificationSettings.organization_id == org_id)
        .first()
    )

    if not settings:
        settings = models.DBNotificationSettings(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            email_from_address=f"noreply@hcm-{org_id[:8]}.local",
            email_from_name="HCM System",
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return _format_notification_settings(settings)


def get_notification_settings(db: Session, org_id: str):
    """Get notification settings for organization"""
    settings = (
        db.query(models.DBNotificationSettings)
        .filter(models.DBNotificationSettings.organization_id == org_id)
        .first()
    )

    if not settings:
        return None

    return _format_notification_settings(settings)


def update_notification_settings(
    db: Session,
    org_id: str,
    settings_data: schemas.NotificationSettingsCreate,
    user_id: str,
):
    """Update notification settings for organization"""
    db_settings = (
        db.query(models.DBNotificationSettings)
        .filter(models.DBNotificationSettings.organization_id == org_id)
        .first()
    )

    if not db_settings:
        db_settings = models.DBNotificationSettings(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_settings)

    update_data = settings_data.dict(exclude_unset=True)
    custom_settings = update_data.pop("custom_settings", None)

    for field, value in update_data.items():
        setattr(db_settings, field, value)

    if custom_settings is not None:
        db_settings.custom_settings = json.dumps(custom_settings)

    db_settings.updated_by = user_id
    db.commit()
    db.refresh(db_settings)

    return _format_notification_settings(db_settings)


def _format_notification_settings(db_settings) -> dict:
    """Format notification settings response"""
    custom_settings = {}
    if db_settings.custom_settings:
        try:
            custom_settings = json.loads(db_settings.custom_settings)
        except:
            custom_settings = {}

    return {
        "id": db_settings.id,
        "organization_id": db_settings.organization_id,
        "email_enabled": db_settings.email_enabled,
        "email_provider": db_settings.email_provider,
        "email_from_address": db_settings.email_from_address,
        "email_from_name": db_settings.email_from_name,
        "email_on_employee_created": db_settings.email_on_employee_created,
        "email_on_leave_request": db_settings.email_on_leave_request,
        "email_on_payroll_processed": db_settings.email_on_payroll_processed,
        "email_on_system_alert": db_settings.email_on_system_alert,
        "sms_enabled": db_settings.sms_enabled,
        "sms_provider": db_settings.sms_provider,
        "sms_from_number": db_settings.sms_from_number,
        "sms_on_leave_approval": db_settings.sms_on_leave_approval,
        "sms_on_payroll_processed": db_settings.sms_on_payroll_processed,
        "sms_on_system_alert": db_settings.sms_on_system_alert,
        "slack_enabled": db_settings.slack_enabled,
        "slack_webhook_url": db_settings.slack_webhook_url,
        "slack_channel": db_settings.slack_channel,
        "slack_on_critical_alerts": db_settings.slack_on_critical_alerts,
        "digest_enabled": db_settings.digest_enabled,
        "digest_frequency": db_settings.digest_frequency,
        "quiet_hours_enabled": db_settings.quiet_hours_enabled,
        "quiet_hours_start": db_settings.quiet_hours_start,
        "quiet_hours_end": db_settings.quiet_hours_end,
        "dnd_enabled": db_settings.dnd_enabled,
        "dnd_start_date": db_settings.dnd_start_date,
        "dnd_end_date": db_settings.dnd_end_date,
        "custom_settings": custom_settings,
        "created_at": db_settings.created_at,
        "updated_at": db_settings.updated_at,
        "created_by": db_settings.created_by,
        "updated_by": db_settings.updated_by,
    }


# ===== Background Job CRUD =====
def create_background_job(
    db: Session,
    org_id: str,
    job_type: str,
    payload: dict = None,
    priority: int = 0,
    user_id: str = "system",
):
    """Create a background job"""
    db_job = models.DBBackgroundJob(
        id=str(uuid.uuid4()),
        organization_id=org_id,
        job_type=job_type,
        status="queued",
        priority=priority,
        payload=json.dumps(payload) if payload else None,
        created_by=user_id,
        updated_by=user_id,
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return _format_background_job(db_job)


def get_background_job(db: Session, job_id: str):
    """Get a background job"""
    job = (
        db.query(models.DBBackgroundJob)
        .filter(models.DBBackgroundJob.id == job_id)
        .first()
    )
    if job:
        return _format_background_job(job)
    return None


def get_background_jobs(
    db: Session, org_id: str, skip: int = 0, limit: int = 50, status: str = None
):
    """Get background jobs for organization"""
    query = db.query(models.DBBackgroundJob).filter(
        models.DBBackgroundJob.organization_id == org_id
    )

    if status:
        query = query.filter(models.DBBackgroundJob.status == status)

    jobs = (
        query.order_by(models.DBBackgroundJob.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_format_background_job(j) for j in jobs]


def update_background_job_status(
    db: Session,
    job_id: str,
    status: str,
    result: dict = None,
    error_message: str = None,
):
    """Update background job status"""
    job = (
        db.query(models.DBBackgroundJob)
        .filter(models.DBBackgroundJob.id == job_id)
        .first()
    )
    if not job:
        return None

    job.status = status
    if result:
        job.result = json.dumps(result)
    if error_message:
        job.error_message = error_message

    if status == "processing":
        job.started_at = dt.datetime.now()
    elif status in ["completed", "failed"]:
        job.completed_at = dt.datetime.now()

    job.updated_by = "system"
    db.commit()
    db.refresh(job)

    return _format_background_job(job)


def _format_background_job(db_job) -> dict:
    """Format background job response"""
    payload = {}
    result = {}

    if db_job.payload:
        try:
            payload = json.loads(db_job.payload)
        except:
            payload = {}

    if db_job.result:
        try:
            result = json.loads(db_job.result)
        except:
            result = {}

    return {
        "id": db_job.id,
        "organization_id": db_job.organization_id,
        "job_type": db_job.job_type,
        "status": db_job.status,
        "priority": db_job.priority,
        "payload": payload,
        "result": result,
        "error_message": db_job.error_message,
        "started_at": db_job.started_at,
        "completed_at": db_job.completed_at,
        "retry_count": db_job.retry_count,
        "max_retries": db_job.max_retries,
        "created_at": db_job.created_at,
    }


# --- Payroll Settings CRUD ---


def get_payroll_settings(db: Session, organization_id: str):
    db_settings = (
        db.query(models.DBPayrollSettings)
        .filter(models.DBPayrollSettings.organization_id == organization_id)
        .first()
    )
    if not db_settings:
        # Create default if missing
        db_settings = models.DBPayrollSettings(
            id=str(uuid.uuid4()),
            organization_id=organization_id,
            created_by="system",
            calculation_method="Per Month",
            custom_formulas='{"staff": "", "worker": ""}',
            overtime_rules="{}",
            currency="PKR",
            tax_year_start="July",
            allow_negative_salary=False,
            pay_frequency="Monthly",
            pay_day=1,
            tax_calculation_method="Annualized",
            eobi_enabled=True,
            social_security_enabled=True,
            overtime_enabled=True,
            overtime_rate=1.5,
        )
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)

    # Manual Mapping
    return schemas.PayrollSettings(
        id=db_settings.id,
        organizationId=db_settings.organization_id,
        calculationMethod=db_settings.calculation_method,
        customFormulas=(
            json.loads(db_settings.custom_formulas)
            if db_settings.custom_formulas
            else {}
        ),
        overtime=(
            json.loads(db_settings.overtime_rules) if db_settings.overtime_rules else {}
        ),
        # Base fields
        currency=db_settings.currency or "PKR",
        taxYearStart=db_settings.tax_year_start or "July",
        allowNegativeSalary=db_settings.allow_negative_salary,
        payFrequency=db_settings.pay_frequency or "Monthly",
        payDay=db_settings.pay_day,
        taxCalculationMethod=db_settings.tax_calculation_method or "Annualized",
        eobiEnabled=db_settings.eobi_enabled,
        socialSecurityEnabled=db_settings.social_security_enabled,
        overtimeEnabled=db_settings.overtime_enabled,
        overtimeRate=db_settings.overtime_rate,
        created_at=db_settings.created_at,
        updated_at=db_settings.updated_at,
        created_by=db_settings.created_by,
        updated_by=db_settings.updated_by,
    )


def save_payroll_settings(
    db: Session, settings: schemas.PayrollSettingsCreate, user_id: str
):
    db_settings = (
        db.query(models.DBPayrollSettings)
        .filter(models.DBPayrollSettings.organization_id == settings.organization_id)
        .first()
    )

    if not db_settings:
        db_settings = models.DBPayrollSettings(
            id=str(uuid.uuid4()),
            organization_id=settings.organization_id,
            created_by=user_id,
        )
        db.add(db_settings)

    # Update logic
    db_settings.calculation_method = settings.calculationMethod
    db_settings.custom_formulas = json.dumps(settings.customFormulas)
    db_settings.overtime_rules = json.dumps(settings.overtime)

    # Update Standard Fields
    db_settings.currency = settings.currency
    db_settings.tax_year_start = settings.taxYearStart
    db_settings.allow_negative_salary = settings.allowNegativeSalary
    db_settings.pay_frequency = settings.payFrequency
    db_settings.pay_day = settings.payDay
    db_settings.tax_calculation_method = settings.taxCalculationMethod
    db_settings.eobi_enabled = settings.eobiEnabled
    db_settings.social_security_enabled = settings.socialSecurityEnabled
    db_settings.overtime_enabled = settings.overtimeEnabled
    db_settings.overtime_rate = settings.overtimeRate

    db_settings.updated_by = user_id
    db.commit()
    db.refresh(db_settings)

    return get_payroll_settings(db, settings.organization_id)


# --- User Management CRUD ---


def get_user(db: Session, user_id: str):
    return db.query(models.DBUser).filter(models.DBUser.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.DBUser).filter(models.DBUser.username == username).first()


def create_user(db: Session, user: schemas.UserCreate, creator_id: str = None):
    try:
        # Check if username exists
        existing = get_user_by_username(db, user.username)
        if existing:
            raise ValueError(f"Username {user.username} already exists")

        # Generate ID
        user_id = user.id or str(uuid.uuid4())

        # Hash Password (using context from main.py implicitly or separate logic)
        # For now, we store hash directly if provided, or we might need a hasher helper.
        # Assuming `user.password` is raw, we need to hash it.
        # But `main.py` has the hashing logic.
        # Ideally CRUD shouldn't depend on View logic, but we need `get_password_hash`.
        # We will import bcrypt here directly to avoid circular imports if possible, or expect hashed password.
        # Let's assume the Service/Main layer handles hashing for now?
        # Standard pattern: CRUD receives Pydantic model.
        # Let's add hashing here using passlib or bcrypt if available, matching main.py

        # We will use a simple specialized function or import from utils if available.
        # Given `main.py` uses direct bcrypt, we'll replicate or better, move hashing to a util.
        # For this step, to avoid breaking, I'll assumme the schema might have `password` and we hash it.

        import bcrypt

        pwd_bytes = user.password.encode("utf-8")
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

        db_user = models.DBUser(
            id=user_id,
            username=user.username,
            password_hash=hashed_password,
            role=user.role,
            name=getattr(user, "name", None),  # Full name for display
            email=getattr(user, "email", None),  # Email for account recovery
            organization_id=user.organization_id,
            employee_id=user.employee_id,  # Map fields carefully
            is_active=True if user.status == "Active" else False,
            is_system_user=getattr(user, "is_system_user", False),  # System admin flag
            created_by=creator_id,
            updated_by=creator_id,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        print(f"Error creating user: {e}")
        raise e


def update_user(
    db: Session, user_id: str, updates: schemas.UserUpdate, updater_id: str
):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = updates.dict(exclude_unset=True)

    # Handle Password Update
    if "password" in update_data and update_data["password"]:
        import bcrypt

        pwd_bytes = update_data["password"].encode("utf-8")
        salt = bcrypt.gensalt()
        update_data["password_hash"] = bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")
        del update_data["password"]

    # Field Mapping
    if "employeeId" in update_data:
        db_user.employee_id = update_data["employeeId"]
        del update_data["employeeId"]

    if "status" in update_data:
        # Map 'Inactive'/'Active' string to boolean if needed, or if schema uses boolean
        # DB uses is_active boolean. Schema might use string status.
        # Let's handle both.
        status_val = update_data["status"]
        if isinstance(status_val, str):
            db_user.is_active = status_val == "Active"
        else:
            db_user.is_active = status_val
        del update_data["status"]

    if "profileStatus" in update_data:
        status_val = update_data["profileStatus"]
        if isinstance(status_val, str):
            db_user.is_active = status_val == "Active"
        del update_data["profileStatus"]

    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)

    db_user.updated_by = updater_id
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: str):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


# --- System Settings CRUD ---

# AI Configuration
def get_ai_config(db: Session, organization_id: str):
    return db.query(models.DBAIConfiguration).filter(models.DBAIConfiguration.organization_id == organization_id).first()

def update_ai_config(db: Session, organization_id: str, config: schemas.AIConfigurationCreate, user_id: str):
    db_config = get_ai_config(db, organization_id)
    if not db_config:
        db_config = models.DBAIConfiguration(
            id=str(uuid.uuid4()),
            organization_id=organization_id,
            provider=config.provider,
            api_keys=json.dumps(config.api_keys) if isinstance(config.api_keys, dict) else config.api_keys,
            status=config.status,
            agents=json.dumps(config.agents) if isinstance(config.agents, dict) else config.agents,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_config)
    else:
        db_config.provider = config.provider
        if config.api_keys: # Only update if provided
            db_config.api_keys = json.dumps(config.api_keys) if isinstance(config.api_keys, dict) else config.api_keys
        db_config.status = config.status
        db_config.agents = json.dumps(config.agents) if isinstance(config.agents, dict) else config.agents
        db_config.updated_by = user_id
    
    db.commit()
    db.refresh(db_config)
    return db_config

# System Flags
def get_system_flags(db: Session, organization_id: str):
    return db.query(models.DBSystemFlags).filter(models.DBSystemFlags.organization_id == organization_id).first()

def update_system_flags(db: Session, organization_id: str, flags: schemas.SystemFlagsUpdate, user_id: str):
    db_flags = get_system_flags(db, organization_id)
    if not db_flags:
        db_flags = models.DBSystemFlags(
            id=str(uuid.uuid4()),
            organization_id=organization_id,
            created_by=user_id,
        )
        db.add(db_flags)
    
    update_data = flags.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "custom_flags" and isinstance(value, dict):
             setattr(db_flags, field, json.dumps(value))
        elif hasattr(db_flags, field):
            setattr(db_flags, field, value)
    
    db_flags.updated_by = user_id
    db.commit()
    db.refresh(db_flags)
    return db_flags

# Notification Settings
def get_notification_settings(db: Session, organization_id: str):
    return db.query(models.DBNotificationSettings).filter(models.DBNotificationSettings.organization_id == organization_id).first()

def update_notification_settings(db: Session, organization_id: str, settings: schemas.NotificationSettingsCreate):
    db_settings = get_notification_settings(db, organization_id)
    if not db_settings:
        db_settings = models.DBNotificationSettings(
            id=str(uuid.uuid4()),
            organization_id=organization_id,
            # Email
            email_enabled=settings.email_enabled,
            email_provider=settings.email_provider,
            email_from_address=settings.email_from_address,
            email_from_name=settings.email_from_name,
            email_on_employee_created=settings.email_on_employee_created,
            email_on_leave_request=settings.email_on_leave_request,
            email_on_payroll_processed=settings.email_on_payroll_processed,
            email_on_system_alert=settings.email_on_system_alert,
            # SMS
            sms_enabled=settings.sms_enabled,
            sms_provider=settings.sms_provider,
            sms_from_number=settings.sms_from_number
        )
        db.add(db_settings)
    else:
        db_settings.email_enabled = settings.email_enabled
        db_settings.email_provider = settings.email_provider
        db_settings.email_from_address = settings.email_from_address
        db_settings.email_from_name = settings.email_from_name
        db_settings.email_on_employee_created = settings.email_on_employee_created
        db_settings.email_on_leave_request = settings.email_on_leave_request
        db_settings.email_on_payroll_processed = settings.email_on_payroll_processed
        db_settings.email_on_system_alert = settings.email_on_system_alert
        db_settings.sms_enabled = settings.sms_enabled
        db_settings.sms_provider = settings.sms_provider
        db_settings.sms_from_number = settings.sms_from_number
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

# Compliance Settings

# --- Employment Levels ---
def get_employment_levels(db: Session, organization_id: Optional[str] = None):
    query = db.query(models.DBEmploymentLevel)
    if organization_id:
        query = query.filter(models.DBEmploymentLevel.organization_id == organization_id)
    return query.all()


def create_employment_level(db: Session, level: schemas.EmploymentLevelCreate, user_id: str):
    db_level = models.DBEmploymentLevel(
        id=str(uuid.uuid4()),
        name=level.name,
        code=level.code,
        description=level.description,
        is_active=level.is_active,
        organization_id=level.organization_id,
        created_by=user_id,
        updated_by=user_id
    )
    db.add(db_level)
    try:
        db.commit()
        db.refresh(db_level)
        return db_level
    except Exception as e:
        db.rollback()
        raise e


def update_employment_level(db: Session, level_id: str, level: schemas.EmploymentLevelCreate, user_id: str):
    db_level = db.query(models.DBEmploymentLevel).filter(models.DBEmploymentLevel.id == level_id).first()
    if db_level:
        db_level.name = level.name
        db_level.code = level.code
        db_level.description = level.description
        db_level.is_active = level.is_active
        db_level.updated_by = user_id
        db.commit()
        db.refresh(db_level)
    return db_level


def delete_employment_level(db: Session, level_id: str):
    db_level = db.query(models.DBEmploymentLevel).filter(models.DBEmploymentLevel.id == level_id).first()
    if db_level:
        db.delete(db_level)
        db.commit()
    return db_level
