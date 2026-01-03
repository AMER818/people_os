from sqlalchemy.orm import Session

from backend.models import (DBDepartment, DBDesignation, DBEmployee, DBGrade,
                            DBHRPlant, DBOrganization, DBPayrollSettings,
                            DBShift, DBUser)


def test_organization_model(db: Session):
    org = DBOrganization(id="ORG_TEST_M", name="Test Org", code="TO1")
    db.add(org)
    db.commit()
    db.refresh(org)
    assert org.name == "Test Org"
    assert org.currency == "PKR" # Default applied on flush

def test_employee_model(db: Session):
    # Org is needed for foreign key if enforced, but let's try assuming lenient or use fixture logic if constraints matter.
    # We already have org created in previous tests or we create new one. Fixture clears DB each function? 
    # The fixture uses `TestingSessionLocal` and drops all tables after module finish? 
    # Yield fixture logic: create_all -> yield -> drop_all. It's module scoped.
    # So valid approach is to create unique dependencies.
    
    org = DBOrganization(id="ORG_EMP_M", name="Org Emp")
    db.add(org)
    db.commit()

    emp = DBEmployee(id="E001_M", email="test@example.com", name="John Doe", organization_id="ORG_EMP_M", status="Active")
    db.add(emp)
    db.commit()
    db.refresh(emp)
    assert emp.email == "test@example.com"
    assert emp.status == "Active" # Default

def test_plant_model(db: Session):
    org = DBOrganization(id="ORG_PLANT_M", name="Org Plant")
    db.add(org)
    db.commit()
    
    plant = DBHRPlant(id="P1_M", name="Plant 1", code="P01", organization_id="ORG_PLANT_M")
    db.add(plant)
    db.commit()
    db.refresh(plant)
    assert plant.name == "Plant 1"

def test_department_model(db: Session):
    org = DBOrganization(id="ORG_DEPT_M", name="Org Dept")
    db.add(org)
    db.commit()
    
    dept = DBDepartment(id="D1_M", name="HR", code="HR01", organization_id="ORG_DEPT_M")
    db.add(dept)
    db.commit()
    db.refresh(dept)
    assert dept.isActive is True

def test_grade_model(db: Session):
    org = DBOrganization(id="ORG_GRADE_M", name="Org Grade")
    db.add(org)
    db.commit()
    
    grade = DBGrade(id="G1_M", name="G1", level=1, organization_id="ORG_GRADE_M")
    db.add(grade)
    db.commit()
    db.refresh(grade)
    assert grade.level == 1

def test_designation_model(db: Session):
    org = DBOrganization(id="ORG_DES_M", name="Org Des")
    db.add(org)
    db.commit()
    
    # Needs grade
    grade = DBGrade(id="G_DES_M", name="G_DES", level=1, organization_id="ORG_DES_M")
    db.add(grade)
    db.commit()

    desig = DBDesignation(id="Des1_M", name="Manager", gradeId="G_DES_M", organization_id="ORG_DES_M")
    db.add(desig)
    db.commit()
    db.refresh(desig)
    assert desig.name == "Manager"

def test_shift_model(db: Session):
    org = DBOrganization(id="ORG_SHIFT_M", name="Org Shift")
    db.add(org)
    db.commit()

    shift = DBShift(id="S1_M", name="Morning", code="M", organization_id="ORG_SHIFT_M")
    db.add(shift)
    db.commit()
    db.refresh(shift)
    assert shift.isActive is True

def test_user_model(db: Session):
    user = DBUser(id="U1_M", username="admin_users", role="admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.username == "admin_users"
    assert user.is_active is True

def test_payroll_settings_model(db: Session):
    org = DBOrganization(id="ORG_PAY_M", name="Org Pay")
    db.add(org)
    db.commit()
    
    payroll = DBPayrollSettings(id="Pay1_M", organization_id="ORG_PAY_M")
    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    assert payroll.currency == "PKR"
