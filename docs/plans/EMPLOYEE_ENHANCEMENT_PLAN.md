# Employee Module Enhancement Plan

**Date:** 2025-12-29  
**Status:** Planning Phase  
**Scope:** Comprehensive employee data model expansion

---

## Overview

Expanding Employee entity from 7 fields to 50+ fields with:
- Auto-generated employee codes
- Personal & family information
- CNIC/passport/licenses
- Organizational hierarchy
- Settings-based master data
- Complex validation rules

---

## Phase 1: Database Schema Design

### New Entities Required

#### 1. Employee (Enhanced)
**Total Fields:** ~50

**Personal Information (15 fields):**
- `employeeCode` (Auto-generated: ABC01-0001)
- `name*` (Text only validation)
- `fatherName*` (Text only)
- `motherName` (Text only)
- `cnic*` (Format: 00000-0000000-0)
- `cnicIssueDate`
- `cnicExpiryDate*`
- `nationality` (Dropdown)
- `passportNumber`
- `drivingLicenseNumber`
- `dateOfBirth*`
- `religion` (Dropdown)
- `maritalStatus` (Single/Married)
- `weddingAnniversaryDate`
- `bloodGroup` (Dropdown)

**Contact Information (7 fields):**
- `reference`
- `personalCellNumber*` (Format: 0000-0000000)
- `officialCellNumber` (Format: 0000-0000000)
- `phoneNumber`
- `personalEmail`
- `officialEmail`
- `millsResidenceBlock`

**Address Information (4 fields):**
- `presentAddress`
- `presentDistrict` (Dropdown)
- `permanentAddress*`
- `permanentDistrict*` (Dropdown)

**Organizational Information (13 fields):**
- `organizationId*` (FK)
- `hrPlantId*` (FK)
- `division` (White/Black/Nil)
- `employmentType*` (Staff/Worker/Contract/Temporary)
- `designationId*` (FK - auto-selects grade)
- `gradeId*` (FK - auto-selected)
- `departmentId*` (FK)
- `subDepartmentId*` (FK)
- `lineManagerId` (FK to Employee)
- `shiftId*` (FK)
- `restDay*`
- `joiningDate*`
- `leavingDate`

**Employment Details (7 fields):**
- `leavingType` (Resignation/SOS/Termination)
- `probationPeriod*`
- `confirmationDate`
- `eobi Status` (Yes/No)
- `eobiNumber`
- `socialSecurityStatus` (Yes/No)
- `socialSecurityNumber`
- `medicalStatus` (Yes/No - conditional)

---

#### 2. Organization (Master)
```typescript
{
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}
```

#### 3. HRPlant (Master)
```typescript
{
  id: string;
  code: string; // e.g., "ABC01"
  name: string;
  organizationId: string;
  currentSequence: number; // For auto-increment
}
```

#### 4. Grade (Master)
```typescript
{
  id: string;
  code: string; // E1, E2, M1, M2, M3, M4, M5, M6, M7, M8, M9
  name: string; // Executive, Management, Staff
  level: number;
  isActive: boolean;
}
```

#### 5. Designation (Master)
```typescript
{
  id: string;
  code: string;
  name: string; // Director, GM, Manager, etc.
  gradeId: string; // FK to Grade
  isActive: boolean;
}
```

**Relationship:** Grade (Parent) → Designation (Child)
- One Grade has MANY Designations
- Each Designation belongs to ONE Grade

#### 6. Department (Master)
```typescript
{
  id: string;
  code: string;
  name: string;
  managerId?: string; // FK to Employee
  isActive: boolean;
}
```

#### 7. SubDepartment (Master)
```typescript
{
  id: string;
  code: string;
  name: string;
  parentDepartmentId: string; // FK to Department
  managerId?: string;
  isActive: boolean;
}
```

#### 8. Shift (Master)
```typescript
{
  id: string;
  code: string; // A, B, C, G, R, Z
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
```

#### 9. District (Master - Pakistan)
```typescript
{
  id: string;
  name: string;
  province: string;
  isActive: boolean;
}
```

---

## Phase 2: Business Logic Implementation

### Auto-Generation Logic

**Employee Code Generation:**
```typescript
async generateEmployeeCode(hrPlantId: string): Promise<string> {
  // 1. Get HR Plant
  const hrPlant = await this.hrPlantRepository.findOne(hrPlantId);
  
  // 2. Increment sequence
  hrPlant.currentSequence += 1;
  await this.hrPlantRepository.save(hrPlant);
  
  // 3. Format code
  const sequence = hrPlant.currentSequence.toString().padStart(4, '0');
  return `${hrPlant.code}-${sequence}`; // e.g., ABC01-0001
}
```

**Trigger:** When "Add Employee" button is pressed

---

### Validation Rules

**1. CNIC Format Validation:**
```typescript
@Matches(/^\d{5}-\d{7}-\d$/, {
  message: 'CNIC must be in format: 00000-0000000-0'
})
cnic: string;
```

**2. Cell Number Format:**
```typescript
@Matches(/^\d{4}-\d{7}$/, {
  message: 'Cell number must be in format: 0000-0000000'
})
personalCellNumber: string;
```

**3. Text-Only Fields:**
```typescript
@Matches(/^[a-zA-Z\s]+$/, {
  message: 'Only text characters allowed'
})
name: string;
```

**4. Social Security vs Medical Status:**
```typescript
@ValidateIf(o => o.socialSecurityStatus === false)
@IsBoolean()
medicalStatus: boolean;

// Business rule in service:
if (socialSecurityStatus === true && medicalStatus === true) {
  throw new BadRequestException(
    'Medical status must be "No" if Social Security is "Yes"'
  );
}
```

**5. Grade-Designation Relationship:**
```typescript
async validateDesignation(designationId: string, gradeId: string) {
  const designation = await this.designationRepository.findOne(designationId);
  if (designation.gradeId !== gradeId) {
    throw new BadRequestException(
      'Invalid grade-designation combination'
    );
  }
}

// Auto-select grade when designation is chosen:
async getGradeForDesignation(designationId: string): Promise<string> {
  const designation = await this.designationRepository.findOne(designationId);
  return designation.gradeId;
}
```

---

## Phase 3: API Endpoints

### Settings Endpoints (Master Data)

```typescript
// Organizations
GET    /api/settings/organizations
POST   /api/settings/organizations
PUT    /api/settings/organizations/:id
DELETE /api/settings/organizations/:id

// HR Plants
GET    /api/settings/hr-plants
POST   /api/settings/hr-plants
PUT    /api/settings/hr-plants/:id

// Grades
GET    /api/settings/grades
POST   /api/settings/grades
PUT    /api/settings/grades/:id

// Designations
GET    /api/settings/designations
GET    /api/settings/designations/by-grade/:gradeId
POST   /api/settings/designations
PUT    /api/settings/designations/:id

// Departments
GET    /api/settings/departments
POST   /api/settings/departments
PUT    /api/settings/departments/:id

// Sub-Departments
GET    /api/settings/sub-departments
GET    /api/settings/sub-departments/by-department/:deptId
POST   /api/settings/sub-departments
PUT    /api/settings/sub-departments/:id

// Shifts
GET    /api/settings/shifts
POST   /api/settings/shifts
PUT    /api/settings/shifts/:id

// Districts
GET    /api/settings/districts
GET    /api/settings/districts/by-province/:province
```

### Employee Endpoints (Enhanced)

```typescript
// Generate new employee code
POST /api/employees/generate-code
Body: { hrPlantId: string }
Response: { employeeCode: string }

// CRUD with enhanced fields
POST /api/employees
GET  /api/employees
GET  /api/employees/:id
PUT  /api/employees/:id
DELETE /api/employees/:id

// Get designations for selected grade
GET /api/employees/designations/:gradeId
```

---

## Phase 4: Frontend Implementation

### Form Enhancements Required

**1. Employee Form Sections:**
```
├── Personal Information
│   ├── Auto-generated Employee Code (read-only)
│   ├── Name* (text validation)
│   ├── Father Name* (text validation)
│   ├── Mother Name (text validation)
│   ├── CNIC* (formatted input)
│   ├── CNIC Dates (date pickers + manual)
│   └── ... (other personal fields)
│
├── Contact Information
│   ├── Cell Numbers (formatted inputs)
│   ├── Emails
│   └── Addresses with District dropdowns
│
├── Organizational Information
│   ├── Organization (dropdown from settings)
│   ├── HR Plant* (dropdown from settings)
│   ├── Designation* (dropdown - triggers grade)
│   ├── Grade* (auto-filled, read-only)
│   ├── Department* (dropdown from settings)
│   └── ... (other org fields)
│
└── Employment Details
    ├── Probation & Confirmation
    ├── EOBI & Social Security
    └── Medical Status (conditional)
```

**2. Custom Input Components:**

```typescript
// CNIC Input with formatting
<FormattedInput
  mask="99999-9999999-9"
  placeholder="00000-0000000-0"
  value={cnic}
  onChange={handleCnicChange}
/>

// Cell Number Input
<FormattedInput
  mask="9999-9999999"
  placeholder="0000-0000000"
  value={cellNumber}
  onChange={handleCellChange}
/>

// Date Picker with Manual Entry
<DateInputDual
  value={dateOfBirth}
  onChange={handleDateChange}
  allowManualEntry
/>

// Conditional Medical Status
<ConditionalField
  condition={socialSecurityStatus === false}
  field={
    <Select label="Medical Status">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </Select>
  }
/>
```

**3. Auto-Generation Flow:**

```typescript
const handleAddEmployee = async () => {
  // 1. Check if HR Plant is selected
  if (!selectedHrPlant) {
    alert('Please select HR Plant first');
    return;
  }
  
  // 2. Generate employee code
  const { employeeCode } = await api.generateEmployeeCode(selectedHrPlant);
  
  // 3. Pre-fill form
  setFormData({
    ...formData,
    employeeCode: employeeCode,
    id: employeeCode // Database ID = Employee Code
  });
  
  // 4. Show form
  setShowForm(true);
};
```

**4. Grade-Designation Cascade:**

```typescript
const handleDesignationChange = async (designationId: string) => {
  // Auto-fetch and set grade
  const designation = await api.getDesignation(designationId);
  setFormData({
    ...formData,
    designationId: designationId,
    gradeId: designation.gradeId // Auto-filled
  });
};
```

---

## Phase 5: Migration Strategy

### Database Migration Steps

**1. Backup Current Data:**
```sql
-- Export existing 7 employees
SELECT * FROM employees;
```

**2. Create New Tables:**
```sql
-- Organizations
CREATE TABLE organizations (...);

-- HR Plants
CREATE TABLE hr_plants (...);

-- Grades
CREATE TABLE grades (...);

-- Designations
CREATE TABLE designations (...);

-- Departments
CREATE TABLE departments (...);

-- ... (other master tables)
```

**3. Seed Master Data:**
```typescript
// Seed Grades
await gradeRepository.save([
  { code: 'E1', name: 'Executive Level 1', level: 1 },
  { code: 'E2', name: 'Executive Level 2', level: 2 },
  { code: 'M1', name: 'Management Level 1', level: 3 },
  // ... M2-M9
]);

// Seed Designations
await designationRepository.save([
  { code: 'CEO', name: 'Chief Executive Officer', gradeId: 'E1' },
  { code: 'GM', name: 'General Manager', gradeId: 'M1' },
  // ... (mapping each designation to grade)
]);

// Seed Districts (Pakistan)
await districtRepository.save([
  { name: 'Karachi', province: 'Sindh' },
  { name: 'Lahore', province: 'Punjab' },
  // ... (all Pakistan districts)
]);
```

**4. Alter Employee Table:**
```sql
-- Add new columns with defaults
ALTER TABLE employees ADD COLUMN father_name VARCHAR(255);
ALTER TABLE employees ADD COLUMN cnic VARCHAR(20);
-- ... (all new fields)

-- Make certain fields required after data entry
-- ALTER TABLE employees ALTER COLUMN father_name SET NOT NULL;
```

---

## Phase 6: Validation Matrix

| Field | Required | Format | Validation | Dependencies |
|-------|----------|--------|------------|--------------|
| Employee Code | Yes | ABC01-0001 | Auto-generated | HR Plant |
| Name | Yes | Text only | Regex: `^[a-zA-Z\s]+$` | None |
| Father Name | Yes | Text only | Regex: `^[a-zA-Z\s]+$` | None |
| CNIC | Yes | 00000-0000000-0 | Regex + Length | None |
| CNIC Expiry | Yes | Date | Must be future | CNIC Issue Date |
| Personal Cell | Yes | 0000-0000000 | Regex | None |
| Designation | Yes | Dropdown | FK exists | Grade (auto) |
| Grade | Yes | Auto-filled | Read-only | Designation |
| Social Security | No | Yes/No | Boolean | Medical (inverse) |
| Medical | No | Yes/No | Boolean | Social Security (inverse) |

---

## Phase 7: Settings Module Implementation

### Settings Module Structure

```
hcm_api/src/settings/
├── settings.module.ts
├── settings.controller.ts
├── settings.service.ts
├── entities/
│   ├── organization.entity.ts
│   ├── hr-plant.entity.ts
│   ├── grade.entity.ts
│   ├── designation.entity.ts
│   ├── department.entity.ts
│   ├── sub-department.entity.ts
│   ├── shift.entity.ts
│   └── district.entity.ts
└── dto/
    ├── create-organization.dto.ts
    ├── create-grade.dto.ts
    └── ... (DTOs for each entity)
```

---

## Phase 8: Testing Plan

### Unit Tests
- Employee code generation
- CNIC format validation
- Grade-designation relationship
- Social Security vs Medical validation

### Integration Tests
- Employee CRUD with new fields
- Settings master data CRUD
- Cascade dropdown behavior

### E2E Tests
- Add employee flow (code generation → form fill → save)
- Edit employee with grade change
- Validation error scenarios

---

## Implementation Timeline

**Week 1: Backend Foundation**
- Day 1-2: Create master data entities
- Day 3-4: Implement Settings module
- Day 5: Seed Pakistan districts data

**Week 2: Employee Enhancement**
- Day 1-2: Update Employee entity & DTOs
- Day 3: Implement auto-code generation
- Day 4-5: Add validation logic

**Week 3: Frontend**
- Day 1-2: Create formatted input components
- Day 3-4: Update employee form
- Day 5: Implement dropdown cascades

**Week 4: Testing & Polish**
- Day 1-2: Unit & integration tests
- Day 3: E2E testing
- Day 4-5: Bug fixes & refinement

---

## Estimated LOC (Lines of Code)

- Backend Entities: ~800 lines
- Backend DTOs: ~400 lines
- Backend Services: ~1200 lines
- Frontend Components: ~1500 lines
- Frontend Forms: ~800 lines

**Total:** ~4700 lines of code

---

## Database Impact

**New Tables:** 9 (Organizations, HR Plants, Grades, Designations, Departments, Sub-Departments, Shifts, Districts, + enhanced Employees)

**New Fields in Employee:** ~43 additional fields

**Master Data Records:**
- Grades: ~9
- Designations: ~30-50
- Departments: ~7
- Shifts: ~6
- Districts: ~150 (Pakistan)

---

## Next Steps

1. **Review & Approve** this plan
2. **Phase 1:** Create Settings module & master data entities
3. **Phase 2:** Update Employee entity with new fields
4. **Phase 3:** Implement auto-code generation
5. **Phase 4:** Build enhanced employee form
6. **Phase 5:** Testing & validation

---

**Status:** Ready for approval and implementation
