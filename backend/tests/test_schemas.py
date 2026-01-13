from backend.schemas import (CandidateCreate, DepartmentCreate, EmployeeCreate,
                             GradeCreate, JobVacancyCreate, OrganizationCreate,
                             PlantCreate, ShiftCreate)


def test_employee_schema():
    emp = EmployeeCreate(
        id="E001", email="test@example.com", firstName="John", lastName="Doe",
        department_id="D1", designation_id="Des1"
    )
    assert emp.email == "test@example.com"
    # Test validator
    assert emp.name == "John Doe"

def test_organization_schema():
    org = OrganizationCreate(id="ORG1", name="Test Org", code="TO1")
    assert org.name == "Test Org"
    assert org.currency == "PKR" # Default

def test_candidate_schema():
    cand = CandidateCreate(
        id="C1", email="cand@example.com", positionApplied="Dev", appliedDate="2025-01-01"
    )
    assert cand.current_stage == "Applied"

def test_job_vacancy_schema():
    job = JobVacancyCreate(
        id="J1", title="Dev", department="IT", location="Remote",
        type="Full-time", postedDate="2025-01-01", status="Open"
    )
    assert job.applicants_count == 0

def test_plant_schema():
    plant = PlantCreate(id="P1", name="Plant 1", code="P01", organizationId="ORG1")
    assert plant.organization_id == "ORG1"

def test_department_schema():
    dept = DepartmentCreate(id="D1", name="HR", code="HR01", organizationId="ORG1")
    assert dept.is_active is True

def test_grade_schema():
    grade = GradeCreate(id="G1", name="G1", level=1, organizationId="ORG1")
    assert grade.level == 1

def test_shift_schema():
    shift = ShiftCreate(id="S1", name="Morning", code="M", organizationId="ORG1")
    assert shift.is_active is True
