import sys
import os
sys.path.append(os.getcwd())

try:
    from backend import main
    from backend import schemas
    from backend import crud
    from backend.domains.hcm import models
    
    # Verify Leave Models
    assert hasattr(models, "DBLeaveRequest"), "DBLeaveRequest missing"
    assert hasattr(models, "DBLeaveBalance"), "DBLeaveBalance missing"
    
    # Verify Leave Schemas
    assert hasattr(schemas, "LeaveRequest"), "LeaveRequest schema missing"
    assert hasattr(schemas, "LeaveBalance"), "LeaveBalance schema missing"
    
    # Verify CRUD
    assert hasattr(crud, "get_leave_requests"), "get_leave_requests missing"
    assert hasattr(crud, "create_leave_request"), "create_leave_request missing"
    assert hasattr(crud, "update_leave_status"), "update_leave_status missing"
    assert hasattr(crud, "get_leave_balances"), "get_leave_balances missing"

    # --- Functional Verification ---
    from backend.database import SessionLocal, engine
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Setup Test Data
        test_employee_id = "VERIFY_TEST_EMP"
        test_user_id = "SYSTEM_TEST"
        
        # Ensure Employee Exists (Mocking relation if needed, or creating one)
        # For simplicity, we assume foreign key constraints might fail if we don't handle them
        # But let's try to create a dummy employee if not exists
        emp = db.query(models.DBEmployee).filter(models.DBEmployee.id == test_employee_id).first()
        if not emp:
            emp = models.DBEmployee(id=test_employee_id, name="Test Employee", status="Active")
            db.add(emp)
            db.commit()

        # 2. Create Leave Request
        print("Test: Creating Leave Request...")
        leave_in = schemas.LeaveRequestCreate(
            employeeId=test_employee_id,
            type="Annual",
            startDate="2025-08-01",
            endDate="2025-08-02",
            days=2.0,
            reason="Verification Test"
        )
        created_leave = crud.create_leave_request(db, leave_in, test_user_id)
        assert created_leave.status == "Pending"
        assert created_leave.days == 2.0
        print(f"  OK: Created Leave ID {created_leave.id}")

        # 3. Approve Request
        print("Test: Approving Request...")
        crud.update_leave_status(db, created_leave.id, "Approved", test_user_id)
        
        # 4. Verify Balance Deduction
        print("Test: Verifying Balance Deduction...")
        # Re-fetch balance
        balance = db.query(models.DBLeaveBalance).filter(
            models.DBLeaveBalance.employee_id == test_employee_id,
            models.DBLeaveBalance.year == 2025
        ).first()
        
        assert balance is not None, "Balance record should have been created."
        assert balance.annual_used >= 2.0, f"Annual used should be >= 2.0, got {balance.annual_used}"
        print(f"  OK: Annual Used: {balance.annual_used}")
        
        print("\nSUCCESS: Leave Module End-to-End Verification Passed!")
        
    finally:
        db.close()
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
