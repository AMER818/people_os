"""
Test: Designation CRUD with nullable department_id

This test verifies that designations can be created, updated, and queried
with department_id set to None (Global designations).

Change Reference: Designation Department Field Removal
"""
import pytest
from backend.database import SessionLocal
from backend.domains.hcm.models import DBDesignation, DBGrade, DBJobLevel
from backend.domains.core.models import DBOrganization
from backend import crud, schemas


@pytest.fixture
def db():
    """Provide a database session for tests."""
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def test_org(db):
    """Get or create a test organization."""
    org = db.query(DBOrganization).first()
    if not org:
        pytest.skip("No organization found in database")
    return org


@pytest.fixture
def test_grade(db, test_org):
    """Get or create a test grade."""
    grade = db.query(DBGrade).first()
    if not grade:
        pytest.skip("No grade found in database")
    return grade


class TestDesignationNullableDepartment:
    """Tests for designation CRUD with nullable department_id."""

    def test_create_designation_without_department(self, db, test_org, test_grade):
        """
        GIVEN a valid organization and grade
        WHEN creating a designation without a department_id
        THEN the designation should be created successfully with department_id=None
        """
        desig_data = schemas.DesignationCreate(
            name="Test Global Designation",
            gradeId=test_grade.id,
            departmentId=None,  # Explicitly None - Global designation
            organizationId=test_org.id,
        )

        result = crud.create_designation(
            db, desig_data, user_id="test-user", org_id=test_org.id
        )

        assert result is not None
        assert result.name == "Test Global Designation"
        assert result.department_id is None  # Should be None, not empty string
        assert result.organization_id == test_org.id
        assert result.grade_id == test_grade.id

        # Cleanup
        db.delete(result)
        db.commit()

    def test_create_designation_with_department(self, db, test_org, test_grade):
        """
        GIVEN a valid organization, grade, and department
        WHEN creating a designation with a department_id
        THEN the designation should be created with the department association
        """
        from backend.domains.core.models import DBDepartment

        dept = db.query(DBDepartment).first()
        if not dept:
            pytest.skip("No department found in database")

        desig_data = schemas.DesignationCreate(
            name="Test Dept Designation",
            gradeId=test_grade.id,
            departmentId=dept.id,
            organizationId=test_org.id,
        )

        result = crud.create_designation(
            db, desig_data, user_id="test-user", org_id=test_org.id
        )

        assert result is not None
        assert result.department_id == dept.id

        # Cleanup
        db.delete(result)
        db.commit()

    def test_query_designations_with_null_department(self, db):
        """
        GIVEN designations exist with both null and non-null department_id
        WHEN querying all designations
        THEN both types should be returned correctly
        """
        designations = crud.get_designations(db)

        # Just verify the query works without error
        assert isinstance(designations, list)

        # Check if any have null department_id
        null_dept_count = sum(1 for d in designations if d.department_id is None)
        non_null_dept_count = sum(1 for d in designations if d.department_id is not None)

        print(f"Designations with null department: {null_dept_count}")
        print(f"Designations with department: {non_null_dept_count}")

    def test_schema_accepts_none_department(self):
        """
        GIVEN the DesignationCreate schema
        WHEN creating with departmentId=None
        THEN the schema should accept it without validation error
        """
        desig_data = schemas.DesignationCreate(
            name="Schema Test",
            gradeId="GRD-123",
            departmentId=None,
        )

        assert desig_data.department_id is None
        assert desig_data.name == "Schema Test"

    def test_schema_accepts_missing_department(self):
        """
        GIVEN the DesignationCreate schema
        WHEN creating without departmentId field at all
        THEN the schema should default to None
        """
        desig_data = schemas.DesignationCreate(
            name="Schema Test No Dept",
            gradeId="GRD-123",
            # departmentId intentionally omitted
        )

        assert desig_data.department_id is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
