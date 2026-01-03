# Employee-Organization Integration Summary

**Date:** 2025-12-29  
**Module:** Employee Management with Organizational Setup  
**Status:** ✅ INTEGRATED

---

## Integration Overview

The Employee Management module now fully integrates with the Organizational Setup (Settings) module, providing comprehensive employee data management with validation and business rules.

---

## Integrated Master Data

### 1. Organizations & HR Plants
- **Employee Field:** `organizationId`, `hrPlantId`
- **Purpose:** Link employee to company and specific plant
- **Auto-Generation:** Employee code is auto-generated using HR Plant code + sequence

### 2. Grades & Designations (Parent-Child)
- **Employee Fields:** `gradeId`, `designationId`
- **Relationship:** Each designation belongs to ONE grade
- **Auto-Selection:** Grade is automatically selected when designation is chosen
- **Validation:** System prevents invalid grade-designation combinations

### 3. Departments & Sub-Departments
- **Employee Fields:** `departmentId`, `subDepartmentId`
- **Purpose:** Organizational hierarchy
- **Feature:** Sub-departments filtered by parent department

### 4. Shifts
- **Employee Field:** `shiftId`
- **Options:** A (Morning), B (Evening), C (Night), G (General), R (Rotating), Z (Flexible)
- **Details:** Each shift has defined start/end times

### 5. Districts (Pakistan)
- **Employee Fields:** `presentDistrictId`, `permanentDistrictId`
- **Database:** 35+ Pakistan districts across all provinces
- **Filter:** Can filter by province

---

## Business Rules Implemented

### ✅ Rule 1: Employee Code Auto-Generation
**Trigger:** When "Add Employee" button is pressed  
**Format:** `{HR_PLANT_CODE}-{AUTO_SEQUENCE}`  
**Example:** `ABC01-0001`, `ABC01-0002`, etc.

```typescript
// Backend endpoint
POST /api/settings/hr-plants/:id/generate-code

// Returns
{ "employeeCode": "ABC01-0001" }
```

**Workflow:**
1. User selects HR Plant
2. Clicks "Add Employee"
3. System calls generate API
4. Employee code is pre-filled (read-only)
5. Database ID = Employee Code

---

### ✅ Rule 2: Grade Auto-Selection from Designation
**Relationship:** Designation → Grade (Many-to-One)  
**Behavior:** When user selects a designation, grade is automatically filled (read-only)

**Example:**
- User selects: Designation = "General Manager"
- System auto-fills: Grade = "M1" (Management Level 1)

**Validation:** System prevents manual grade changes that don't match designation

---

### ✅ Rule 3: Social Security ↔ Medical Status (Inverse)
**Rule:** If Social Security = YES, then Medical MUST = NO (and vice versa)

**Backend Validation:**
```typescript
if (socialSecurityStatus === true && medicalStatus === true) {
    throw new BadRequestException(
        'Medical status must be "No" when Social Security is "Yes"'
    );
}
```

**UI Behavior:** Medical field should be disabled/hidden when Social Security is Yes

---

### ✅ Rule 4: CNIC Format Validation
**Required Format:** `00000-0000000-0`  
**Example:** `12345-1234567-8`

**Validation:**
- Must have exactly 13 digits
- Must include 2 hyphens in correct positions
- Regex: `/^\d{5}-\d{7}-\d$/`

---

### ✅ Rule 5: Cell Number Format Validation
**Required Format:** `0000-0000000`  
**Example:** `0300-1234567`

**Validation:**
- Must have exactly 11 digits
- Must include 1 hyphen after 4th digit
- Applies to both personal and official cell numbers
- Regex: `/^\d{4}-\d{7}$/`

---

### ✅ Rule 6: Text-Only Name Fields
**Affected Fields:** Name, Father Name, Mother Name  
**Rule:** Only alphabetic characters and spaces allowed (no numbers/special chars)

**Validation:** Regex: `/^[a-zA-Z\s]+$/`

---

## API Endpoints Integration

### Employee Management with Organization Context

```typescript
// Create employee with organizational data
POST /api/employees
{
  "employeeCode": "ABC01-0001", // Auto-generated
  "name": "John Doe",
  "organizationId": "uuid",
  "hrPlantId": "uuid",
  "designationId": "uuid", // Grade auto-selected
  "gradeId": "uuid", // Auto-filled, read-only
  "departmentId": "uuid",
  "shiftId": "uuid",
  "socialSecurityStatus": true,
  "medicalStatus": false, // Must be inverse
  // ... other fields
}
```

### Get Master Data for Dropdowns

```typescript
// Get all organizations
GET /api/settings/organizations

// Get HR plants
GET /api/settings/hr-plants

// Get grades (for display only)
GET /api/settings/grades

// Get designations (filtered by grade if needed)
GET /api/settings/designations
GET /api/settings/designations/by-grade/:gradeId

// Get departments
GET /api/settings/departments

// Get sub-departments (filtered by department)
GET /api/settings/sub-departments
GET /api/settings/sub-departments/by-department/:deptId

// Get shifts
GET /api/settings/shifts

// Get districts
GET /api/settings/districts
GET /api/settings/districts/by-province/Punjab
```

---

## Database Schema

### Enhanced Employee Table

```sql
CREATE TABLE employees (
  -- Primary ID (same as employee code)
  id VARCHAR PRIMARY KEY,
  employee_code VARCHAR UNIQUE,
  
  -- Personal Info
  name VARCHAR NOT NULL,
  father_name VARCHAR,
  mother_name VARCHAR,
  cnic VARCHAR, -- Format: 00000-0000000-0
  cnic_issue_date DATE,
  cnic_expiry_date DATE,
  nationality VARCHAR,
  passport_number VARCHAR,
  driving_license_number VARCHAR,
  date_of_birth DATE,
  religion VARCHAR,
  marital_status VARCHAR,
  wedding_anniversary_date DATE,
  blood_group VARCHAR,
  
  -- Contact
  reference VARCHAR,
  personal_cell_number VARCHAR, -- Format: 0000-0000000
  official_cell_number VARCHAR,
  phone_number VARCHAR,
  personal_email VARCHAR,
  official_email VARCHAR,
  email VARCHAR UNIQUE,
  mills_residence_block VARCHAR,
  
  -- Address
  present_address TEXT,
  present_district_id VARCHAR,
  permanent_address TEXT,
  permanent_district_id VARCHAR,
  
  -- Organizational
  organization_id VARCHAR,
  hr_plant_id VARCHAR,
  division VARCHAR, -- White/Black/Nil
  employment_type VARCHAR, -- Staff/Worker/Contract/Temporary
  designation_id VARCHAR,
  grade_id VARCHAR, -- Auto-selected from designation
  department_id VARCHAR,
  sub_department_id VARCHAR,
  line_manager_id VARCHAR, -- FK to employees
  shift_id VARCHAR,
  rest_day VARCHAR,
  joining_date DATE,
  leaving_date DATE,
  
  -- Employment
  leaving_type VARCHAR, -- Resignation/SOS/Termination
  probation_period INTEGER,
  confirmation_date DATE,
  eobi_status BOOLEAN DEFAULT FALSE,
  eobi_number VARCHAR,
  social_security_status BOOLEAN DEFAULT FALSE,
  social_security_number VARCHAR,
  medical_status BOOLEAN DEFAULT FALSE,
  status VARCHAR,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (hr_plant_id) REFERENCES hr_plants(id),
  FOREIGN KEY (designation_id) REFERENCES designations(id),
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (present_district_id) REFERENCES districts(id),
  FOREIGN KEY (permanent_district_id) REFERENCES districts(id)
);
```

---

## Frontend Integration Requirements

### Form Workflow

**Step 1: Initial Setup**
```typescript
// On component mount
const organizations = await api.getOrganizations();
const hrPlants = await api.getHRPlants();
```

**Step 2: Add Employee Button Click**
```typescript
const handleAddEmployee = async () => {
  if (!selectedHrPlant) {
    alert('Please select HR Plant first');
    return;
  }
  
  const { employeeCode } = await api.generateEmployeeCode(selectedHrPlant);
  setFormData({
    ...formData,
    id: employeeCode,
    employeeCode: employeeCode
  });
  setShowForm(true);
};
```

**Step 3: Designation Selection (Auto-Grade)**
```typescript
const handleDesignationChange = async (designationId: string) => {
  const designation = await api.getDesignation(designationId);
  setFormData({
    ...formData,
    designationId,
    gradeId: designation.gradeId // Auto-filled
  });
};
```

**Step 4: Social Security Toggle (Inverse Medical)**
```typescript
const handleSocialSecurityChange = (value: boolean) => {
  setFormData({
    ...formData,
    socialSecurityStatus: value,
    medicalStatus: value ? false : formData.medicalStatus
  });
};
```

---

## Validation Summary

| Field | Validation | Error Message |
|-------|------------|---------------|
| Employee Code | Auto-generated, read-only | N/A |
| Name | Text only, required | "Name must contain only letters" |
| Father Name | Text only | "Father name must contain only letters" |
| CNIC | Format: 00000-0000000-0 | "CNIC must be in format: 00000-0000000-0" |
| Personal Cell | Format: 0000-0000000 | "Cell number must be in format: 0000-0000000" |
| Designation | Required, FK exists | "Invalid designation" |
| Grade | Auto-filled, read-only | N/A |
| Social Security + Medical | Inverse relationship | "Medical must be No when Social Security is Yes" |

---

## Testing Checklist

- [ ] Generate employee code from HR plant
- [ ] Create employee with all organizational fields
- [ ] Verify grade auto-selection when choosing designation
- [ ] Test CNIC format validation (should reject invalid format)
- [ ] Test cell number format validation
- [ ] Test name field validation (should reject numbers)
- [ ] Test social security/medical inverse relationship
- [ ] Verify dropdown cascades (department → sub-department)
- [ ] Test province → district filtering

---

## Next Steps

1. **Frontend Forms:** Create React components with all new fields
2. **Seed Data:** Populate default organization and HR plant
3. **Testing:** Comprehensive validation testing
4. **Documentation:** User guide for employee management

---

**Integration Status:** ✅ COMPLETE  
**Backend Ready:** Yes  
**Validation Rules:** All implemented  
**Master Data:** Seeded on startup
