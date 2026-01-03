# Testing Coverage Improvement Roadmap

## Current State Analysis
- **Current Coverage:** ~65% (estimated)
- **Frontend Tests:** 25 test files
- **Backend Tests:** 7 test files  
- **Target Coverage:** 85-90% (realistic goal)

## Why Not 100%?
100% coverage is often **counterproductive** because:
1. **Diminishing Returns** - Last 10-15% takes 80% of effort
2. **False Security** - Coverage ≠ Quality (can have 100% coverage with poor tests)
3. **Maintenance Burden** - Over-testing trivial code wastes time
4. **Industry Standard** - Most production apps target 80-85%

## Prioritized Testing Strategy

### Phase 1: Critical Path Coverage (Priority: 🔴 HIGH)
**Target: 75% coverage**

#### 1.1 Authentication & Security (Week 1)
```
✅ Files to Test:
- services/api.ts (login, logout, token management)
- utils/secureStorage.ts (CRITICAL - encryption issues)
- src/contexts/RBACContext.tsx
- components/auth/RoleGuard.tsx
- components/auth/PermissionGate.tsx

📝 Test Cases:
- Login with valid credentials
- Login with invalid credentials
- Token expiration handling
- 401 auto-logout
- RBAC permission checks
- Role hierarchy validation
```

#### 1.2 CRUD Operations (Week 1-2)
```
✅ Files to Test:
- backend/crud.py (all CRUD functions)
- backend/main.py (API endpoints)
- services/api.ts (API client methods)

📝 Test Cases:
- Create employee (success, validation errors)
- Update employee (with/without changes)
- Delete employee (cascade, constraints)
- List employees (pagination, filters)
- Error handling (404, 400, 500)
```

#### 1.3 State Management (Week 2)
```
✅ Files to Test:
- store/orgStore.ts (critical state logic)
- store/uiStore.ts
- store/settingsStore.ts

📝 Test Cases:
- Fetch master data
- Add/update/delete entities
- Loading states
- Error handling
- Optimistic updates
```

### Phase 2: Component Testing (Priority: 🟡 MEDIUM)
**Target: 80% coverage**

#### 2.1 Form Components (Week 3)
```
✅ Files to Test:
- components/ui/Input.tsx (expand existing)
- components/ui/Select.tsx
- components/ui/Checkbox.tsx
- components/ui/Modal.tsx
- components/ui/FormModal.tsx

📝 Test Cases:
- Render with props
- User interactions (type, click, change)
- Validation states
- Disabled states
- Accessibility (ARIA, keyboard nav)
```

#### 2.2 Business Logic Components (Week 3-4)
```
✅ Files to Test:
- modules/employee/EmployeeMaster.tsx (expand)
- modules/payroll/PayrollEngine.tsx
- modules/org-setup/OrgSetup.tsx

📝 Test Cases:
- Data loading
- Form submission
- Error display
- Success messages
```

### Phase 3: Integration Tests (Priority: 🟡 MEDIUM)
**Target: 85% coverage**

#### 3.1 End-to-End Flows (Week 4-5)
```
✅ Workflows to Test:
- Complete employee lifecycle
- Payroll calculation flow
- Organization setup flow
- Recruitment pipeline

📝 Test Cases:
- Login → Create Employee → Update → Delete
- Setup Organization → Add Departments → Add Employees
- Create Job → Add Candidates → Move through stages
```

### Phase 4: Edge Cases & Error Handling (Priority: 🟢 LOW)
**Target: 90% coverage**

#### 4.1 Error Scenarios (Week 5-6)
```
✅ Test Coverage:
- Network failures
- Timeout scenarios
- Concurrent updates
- Race conditions
- Invalid data formats
```

## Implementation Plan

### Week 1: Authentication & Security Tests
**Files to Create:**
1. `services/__tests__/api-auth.test.ts` (NEW)
2. `utils/__tests__/secureStorage.test.ts` (EXPAND)
3. `src/contexts/__tests__/RBACContext.test.tsx` (EXPAND)

### Week 2: Backend CRUD Tests
**Files to Create:**
1. `backend/tests/test_crud_employees.py` (NEW)
2. `backend/tests/test_crud_organizations.py` (NEW)
3. `backend/tests/test_api_auth.py` (NEW)

### Week 3: Component Tests
**Files to Create:**
1. `components/ui/__tests__/Select.test.tsx` (NEW)
2. `components/ui/__tests__/Modal.test.tsx` (NEW)
3. `modules/employee/__tests__/EmployeeMaster.test.tsx` (EXPAND)

### Week 4: Integration Tests
**Files to Create:**
1. `tests/integration/employee-lifecycle.test.tsx` (NEW)
2. `tests/integration/payroll-flow.test.tsx` (NEW)

### Week 5: E2E Tests
**Files to Expand:**
1. `tests/e2e/02-employee-crud.spec.ts` (EXPAND)
2. `tests/e2e/03-org-structure.spec.ts` (EXPAND)

## Coverage Thresholds

### Updated vitest.config.ts Targets:
```typescript
coverage: {
    thresholds: {
        lines: 85,        // Up from 60%
        functions: 80,    // Up from 60%
        branches: 75,     // Up from 60%
        statements: 85,   // Up from 60%
    },
}
```

### Backend Coverage Targets (.coveragerc):
```ini
[coverage:run]
omit = 
    */tests/*
    */migrations/*
    */audit/*
    */__pycache__/*

[coverage:report]
fail_under = 80
precision = 2
```

## Testing Tools & Best Practices

### Frontend Testing Stack
- **Unit Tests:** Vitest + React Testing Library
- **Integration Tests:** Vitest + MSW (Mock Service Worker)
- **E2E Tests:** Playwright
- **Coverage:** V8

### Backend Testing Stack
- **Unit Tests:** pytest
- **Integration Tests:** pytest + TestClient
- **Coverage:** pytest-cov

### Best Practices
1. **AAA Pattern:** Arrange, Act, Assert
2. **DRY Tests:** Use factories and fixtures
3. **Test Isolation:** Each test independent
4. **Mock External Services:** Don't hit real APIs
5. **Fast Tests:** Unit tests < 100ms, Integration < 1s

## Example Test Templates

### Frontend Unit Test Template
```typescript
// services/__tests__/api-auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from '../api';

describe('ApiService Authentication', () => {
    let api: ApiService;

    beforeEach(() => {
        api = new ApiService();
        localStorage.clear();
    });

    it('should login successfully with valid credentials', async () => {
        // Arrange
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access_token: 'test-token', user: { id: '1' } }),
            } as Response)
        );

        // Act
        const result = await api.login('testuser', 'password', false);

        // Assert
        expect(result).toBe(true);
        expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should handle login failure', async () => {
        // Arrange
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
            } as Response)
        );

        // Act & Assert
        await expect(api.login('testuser', 'wrongpass', false)).rejects.toThrow();
    });
});
```

### Backend Unit Test Template
```python
# backend/tests/test_crud_employees.py
import pytest
from backend import crud, schemas, models
from backend.database import SessionLocal

@pytest.fixture
def db():
    db = SessionLocal()
    yield db
    db.close()

def test_create_employee_success(db):
    # Arrange
    employee_data = schemas.EmployeeCreate(
        name="John Doe",
        email="john@example.com",
        status="Active",
        education=[],
        experience=[],
        family=[],
        discipline=[],
        increments=[]
    )

    # Act
    employee = crud.create_employee(db, employee_data, user_id="test-user")

    # Assert
    assert employee.name == "John Doe"
    assert employee.email == "john@example.com"
    assert employee.created_by == "test-user"

def test_create_employee_duplicate_email(db):
    # Arrange
    employee_data = schemas.EmployeeCreate(
        name="John Doe",
        email="john@example.com",
        status="Active"
    )
    crud.create_employee(db, employee_data, user_id="test-user")

    # Act & Assert
    with pytest.raises(Exception):  # IntegrityError
        crud.create_employee(db, employee_data, user_id="test-user")
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        run: npm run test:coverage -- --reporter=json-summary
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

## Metrics & Monitoring

### Coverage Reports Location
- Frontend: `coverage/` (HTML report)
- Backend: `htmlcov/` (HTML report)

### CI/CD Gates
- **Block PR if coverage drops** below 75%
- **Require 80% coverage** for critical files
- **Generate coverage badge** for README

## Success Criteria

✅ **Week 1:** 70% coverage (authentication + critical paths)
✅ **Week 2:** 75% coverage (CRUD operations)
✅ **Week 3:** 80% coverage (components)
✅ **Week 4:** 85% coverage (integration)
✅ **Week 5:** 90% coverage (edge cases)

## Files Exempt from 100% Coverage

These files are **intentionally** excluded from strict coverage:
- Configuration files (*.config.ts, *.config.js)
- Type definitions (types.ts, *.d.ts)
- Test utilities (test/setup.ts)
- Legacy code scheduled for removal
- Auto-generated code
- Simple getters/setters
- Trivial rendering components

## Next Steps

1. ✅ Review and approve this roadmap
2. 🔄 Start with Week 1 authentication tests
3. 🔄 Set up coverage reporting in CI
4. 🔄 Incrementally improve coverage each week
5. 🔄 Refactor code for testability as needed

---

**Remember:** Quality > Quantity. 85% coverage with meaningful tests beats 100% coverage with shallow tests.
