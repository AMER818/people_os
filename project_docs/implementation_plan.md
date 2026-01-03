# Audit Fix Implementation Plan

This plan addresses the critical findings from the system audit, focusing on Database Integrity (Missing Foreign Keys) and Drift Detection.

## Goal Description
Fix structural database issues by enforcing Foreign Key constraints on core relationships and establish a drift detection baseline to prevent future regression.

## User Review Required
> [!IMPORTANT]
> Adding Foreign Key constraints to existing tables requires valid data. If there are orphaned records (e.g., an employee pointing to a non-existent department), the migration might fail or require data cleanup.

## Proposed Changes

### 1. Database Schema Fixes (Backend)
The following relationships were identified as missing explicit Foreign Key constraints in `backend/models.py`:

#### [MODIFY] [models.py](file:///d:/Python/HCM_WEB/backend/models.py)
- `Employee.department_id`: Add `ForeignKey("departments.id")`
- `Employee.designation_id`: Add `ForeignKey("designations.id")`
- `Employee.grade_id`: Add `ForeignKey("grades.id")`
- `Employee.plant_id`: Add `ForeignKey("hr_plants.id")`
- `Employee.shift_id`: Add `ForeignKey("shifts.id")`
- `Organization.tax_id`: Add `ForeignKey("tax_configs.id")` (Verify target table)
- `HRPlant.organization_id`: Add `ForeignKey("organizations.id")`
- `Grade.organization_id`: Add `ForeignKey("organizations.id")`
- `SubDepartment.organization_id`: Add `ForeignKey("organizations.id")`
- `Shift.organization_id`: Add `ForeignKey("organizations.id")`
- `Designation.organization_id`: Add `ForeignKey("organizations.id")`
- `Department.organization_id`: Add `ForeignKey("organizations.id")`
- `PerformanceReview.employee_id`: Add `ForeignKey("employees.id")`
- `PerformanceReview.reviewer_id`: Add `ForeignKey("employees.id")`
- `User.organization_id`: Add `ForeignKey("organizations.id")`

### 2. Drift Detection (Backend)
#### [NEW] [backend/audit/drift/baseline.json](file:///d:/Python/HCM_WEB/backend/audit/drift/baseline.json)
- Create an initial baseline capturing the current schema state, file checksums for critical paths, and configuration snapshots.

#### [MODIFY] [backend/audit/cli.py](file:///d:/Python/HCM_WEB/backend/audit/cli.py)
- Ensure drift detection is active and compares against the new baseline.

## Verification Plan

### Automated Tests
- Run `npm run audit` to verify the Database score improves (aiming for > 4.5/5.0).
- Run `npm run audit` to verify Drift Detection score improves (aiming for > 4.0/5.0).

### Manual Verification
- Inspect the generated audit report to confirm zero "Missing Foreign Key" findings.
