# implementation_plan.md

## Goal Description
Perform a complete audit of the HCM Web Application (Frontend), execute existing tests, fix any issues found, and create a plan for further development.
**Note:** A Python backend was mentioned in previous context but is not present in the current workspace. This audit focuses on the React/Vite frontend.

## User Review Required
> [!IMPORTANT]
> **Missing Backend**: No Python backend files were found in `d:/Python/HCM_WEB`. The `server.js` is a static file server. Verification of backend integration is not possible without the backend code.

## Proposed Changes

### Audit & Fixes
- [ ] **Critical**: Address missing backend (consult user).
- [ ] Fix 400+ Lint errors (214 errors, 186 warnings).
    - Focus on `no-undef` and potential logic errors first.
    - Automate `no-unused-vars` cleanup where possible.
- [ ] Analyze Test Failures (waiting for completion).
- [ ] Review component structure in `modules/`.

### Phase 2: Codebase Standardization (Completed)
**Status:** ✅ Complete
**Accomplishments:**
- **Code Quality:** Zero ESLint errors, Prettier formatting applied globally.
- **Type Safety:** `strict: true` enabled in `tsconfig.json`. Zero TypeScript errors.
- **Critical Fixes:**
    - Resolved "Blank Screen" issue by fixing CSS `@import` order in `index.css`.
    - Refactored `Benefits.tsx` to remove `any` types.
    - Updated `run_app.bat` for robust startup (Port 5000).
    - Configured Production/Preview server to run on Port 4000.

### Phase 3: Security & Error Handling (Completed)
**Status:** ✅ Complete
**Accomplishments:**
- **Error Protection:** Global Error Boundary implemented and verified.
- **Sanitization:** Input sanitization in Employee forms (`utils/security.ts`).
- **Rate Limiting:** API write operations limited to 100 req/min.
- **Security Headers:** CSP, Referrer, and Permissions policies enforced.
**Goal:** Harden the application against common vulnerabilities and improve stability.

### Phase 6: Standardization & Unification (Completed)
**Status:** ✅ Complete
**Accomplishments:**
- **One-Click Launcher:** `Hunzal_Launcher.bat` created for easy startup.
- **Port Standardization:** `5000` (Live), `4000` (Test), `3000` (Prod), `2000` (API).
- **Configuration:** Centralized `.env` file and `vite.config.ts`.
- **Scripts:** `run_app.bat`, `run_tests.bat`, `run_production.bat` standardized.


### Upcoming Tasks
1.  **Final Verification:**
    - [ ] Run full regression tests on all environments.
    - [ ] Handoff documentation.

### Testing
- [ ] Ensure all critical modules have at least basic component rendering tests.
- [ ] Add missing tests for key components (identified during audit).

### Phase 7: Core Backend (Legacy/AI Only)
> [!WARNING]
> **Architectural Pivot (User Requested)**
> The Python Backend (`backend/`) is now restricted to **AI & Analytics Only**.
> **Core HCM logic** (Employees, Recruitment, Payroll) will move to **NestJS**.

### Phase 9: Core HCM Backend (NestJS) - [NEW]
> [!IMPORTANT]
> **Modern Split Architecture**
> 1.  **Frontend**: React + Vite (Port 5000).
> 2.  **Core Backend**: NestJS (Node.js) for generic CRUD and Business Logic.
> 3.  **AI Engine**: Python (FastAPI) for "Heavy Lifting" (Resume Parsing, Prediction).
> 4.  **Database**: Postgres (recommended) or SQLite (dev).

**Goal:** Initialize NestJS application for Core HR.
1.  **Database Design:**
    - [ ] Create `schema.sql` (SQLite).
    - [ ] Define SQLAlchemy Models (`models.py`) for Employee, Attendance, Payroll.
2.  **API Development:**
    - [ ] Create `routes/employees.py` (CRUD).
    - [ ] Create `routes/attendance.py`.
    - [ ] Create `routes/auth.py` (JWT).
3.  **Frontend Integration:**
    - [x] Update `services/api.ts` to fully consume new Endpoints.
    - [x] Remove `mockData.ts` dependency.

### Phase 10: Advanced Core HCM (NestJS) - ✅ COMPLETE
> [!IMPORTANT]
> **Complex Logic Migration**
> Moved "Payroll" and "Attendance" to NestJS with strongly typed business logic.
> **AI Engine** (Python) ready to be called by NestJS (Microservices style) for predictive features.

**Status:** ✅ Complete (2025-12-29)
**Accomplishments:**
1.  **Attendance Module:**
    *   [x] Created `Attendance` Entity & CRUD.
    *   [x] API Endpoints: `/api/attendance` (GET, POST, PUT, DELETE).
2.  **Payroll Module:**
    *   [x] Created `Payroll` Entity (basic_salary, deductions, net_pay).
    *   [x] API Endpoints: `/api/payroll` (GET, POST, PUT, DELETE).
3.  **Verification:**
    *   [x] Both modules tested via `curl`.
    *   [x] NestJS server running on Port 3001.

---

### Phase 11: Frontend Integration (Attendance & Payroll) - [IN PROGRESS]
**Goal:** Connect React Frontend to new NestJS modules for seamless data flow.

**Progress:**
1.  **API Service Updates:**
    *   [x] Added `getAttendanceRecords()` → `GET /api/attendance`
    *   [x] Added `saveAttendanceRecord()` → `POST/PUT /api/attendance`
    *   [x] Added `getPayrollRecords()` → `GET /api/payroll`
    *   [x] Added `savePayrollRecord()` → `POST/PUT /api/payroll`
    *   [x] Added `deletePayrollRecord()` → `DELETE /api/payroll/:id`
2.  **Remaining Work:**
    *   [ ] Test Attendance CRUD in UI (Manual Testing).
    *   [ ] Test Payroll CRUD in UI (Manual Testing).
    *   [ ] Update components to use new API methods.

---

### Phase 12: Production Readiness & Advanced Features - [NEXT]
**Goal:** Prepare system for production deployment and add advanced business logic.

**Proposed Tasks:**
1.  **Database Migration:**
    *   [ ] Migrate from SQLite to PostgreSQL/MySQL.
    *   [ ] Update `TypeOrmModule` configuration for production DB.
2.  **Advanced Payroll Logic:**
    *   [ ] Implement salary calculation algorithms (tax, deductions, bonuses).
    *   [ ] Add payroll approval workflow.
3.  **AI Integration:**
    *   [ ] Connect NestJS → Python AI Engine for resume parsing.
    *   [ ] Implement predictive analytics for payroll forecasting.
4.  **Security Hardening:**
    *   [ ] Implement JWT authentication in NestJS.
    *   [ ] Add role-based access control (RBAC).
5.  **Performance Optimization:**
    *   [ ] Add database indexing for frequently queried fields.
    *   [ ] Implement caching strategy (Redis).

### Phase 8: Feature Expansion (Proposed)
1.  **Recruitment Module:**
    - [ ] Create Candidate Backend (CRUD).
    - [ ] Connect `RecruitmentATS.tsx`.
2.  **Payroll Engine:**
    - [ ] Implement Salary Calculation Logic (Python).
    - [ ] Connect `PayrollEngine.tsx`.

## Verification Log
**Date:** 2025-12-29
- **Automated Tests:** `npm test` passed (21 files, 131 tests).
- **Manual Verification:** Dashboard "Crash Test" passed.
- **Security Check:** CSP headers verified in `index.html`.
