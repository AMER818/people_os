from datetime import date

from sqlalchemy.orm import Session

from backend import crud, models, schemas


def test_create_organization(db: Session):
    org_data = schemas.OrganizationCreate(
        id="ORG_TEST",
        name="Test Organization",
        code="ORG-TEST",
        isActive=True,
        currency="USD"
    )
    org = crud.create_organization(db, org_data, user_id="admin")
    assert org.id == "ORG_TEST"
    assert org.name == "Test Organization"
    assert org.currency == "USD"
    
    # Verify in DB
    db_org = crud.get_organization(db, "ORG_TEST")
    assert db_org is not None
    assert db_org.name == "Test Organization"

def test_create_employee(db: Session):
    # Setup Organization
    org = crud.create_organization(db, schemas.OrganizationCreate(id="ORG_EMP", name="Org for Emp"), "admin")
    
    emp_data = schemas.EmployeeCreate(
        id="EMP001",
        firstName="John",
        lastName="Doe",
        email="john@example.com",
        organizationId="ORG_EMP", # Alias handling in schema might need checking, crud uses organization_id
        department_id="DEP1",
        designation_id="DES1",
        join_date="2025-01-01"
    )
    # Patch schema alias if needed or pass directly in dict if schema handles it
    # Pydantic schema expects camelCase aliases from frontend but converts to snake_case?
    # EmployeeCreate has organization_id with alias organizationId.
    
    emp = crud.create_employee(db, emp_data, user_id="admin")
    assert emp.id == "EMP001"
    assert emp.name == "John Doe"
    assert emp.email == "john@example.com"
    
    db_emp = crud.get_employee(db, "EMP001")
    assert db_emp is not None
    assert db_emp.organization_id == "ORG_EMP"

def test_create_job_vacancy(db: Session):
    job_data = schemas.JobVacancyCreate(
        id="JOB001",
        title="Software Engineer",
        department="Engineering",
        location="Remote",
        type="Full-time",
        postedDate="2025-01-01",
        status="Open",
        requirements=["Python", "FastAPI"]
    )
    job = crud.create_job_vacancy(db, job_data, user_id="admin")
    assert job.title == "Software Engineer"
    assert "Python,FastAPI" in job.requirements 

def test_create_plant(db: Session):
    db.add(models.DBOrganization(id="ORG_PLANT", name="Org Plant"))
    db.commit()
    
    plant_data = schemas.PlantCreate(
        id="PLANT001",
        name="Main Plant",
        code="MP01",
        organizationId="ORG_PLANT"
    )
    plant = crud.create_plant(db, plant_data, user_id="admin")
    assert plant.name == "Main Plant"

def test_create_department(db: Session):
    db.add(models.DBOrganization(id="ORG_DEPT", name="Org Dept"))
    db.commit()
    
    dept_data = schemas.DepartmentCreate(
        id="DEPT001",
        name="HR",
        code="HR01",
        organizationId="ORG_DEPT"
    )
    dept = crud.create_department(db, dept_data, user_id="admin")
    assert dept.name == "HR"
