# Comprehensive De-duplication Protocol

This protocol defines the Single Source of Truth (SSOT) architecture for PeopleOS. It serves as the authoritative guide for eliminating redundancy across UI, Schema, Database, Code, and File structures.

## 1. Core Philosophy: DRY & SSOT

**Principle**: Every piece of knowledge must have a single, unambiguous, authoritative representation within the system.

- **DRY (Don't Repeat Yourself)**: Logic, values, and definitions should happen once.
- **SSOT (Single Source of Truth)**: Data must ideally flow from the Database -> Backend Schema -> Frontend Type -> UI Component.

---

## 2. UI De-duplication Protocol

### A. Component Architecture

- **Atomic Components**: Primitive UI elements (Buttons, Inputs, Cards) MUST exist only in `src/components/ui`.
  - _Anti-Pattern_: hardcoding `<button className="bg-blue-500...">` in a feature view.
  - _Resolution_: Import `<Button variant="primary">`.
- **Feature Wrappers**: Common layout patterns (Page Headers, Tables, Tabs) MUST be standardized.
  - _Standard_: Use `src/components/ui/HorizontalTabs` for all tab navigation.
  - _Standard_: Use `src/components/layout/DashboardLayout` for all main app screens.

### B. View De-duplication

- **Unique Feature Ownership**: A feature code (e.g., `Employment Level`) must be managed in **ONE** dedicated module.
  - _Violation_: Managing "Employment Levels" in both `EmploymentLevelManagement.tsx` and `DesignationManagement.tsx`.
  - _Resolution_: Centralize management in the specific module; other modules should only _read/reference_ the data via Dropdowns or Read-Only views.
- **Modals & Forms**: Reusable forms (e.g., "Add User") should be extracted to `src/components/features/[Feature]Form.tsx` if used in multiple places, rather than duplicated inside Page components.

---

## 3. Schema & Type De-duplication

### A. Backend (Pydantic)

- **Inheritance Hierarchy**:
  1.  `BaseModelSchema`: Shared fields (name, code).
  2.  `CreateSchema(BaseModelSchema)`: Fields required for creation.
  3.  `ResponseSchema(CreateSchema, AuditBase)`: Adds ID, Audit timestamps.
- **Avoid Redefinition**: Do not manually type `id: str`, `created_at: datetime` in every schema. Inherit from `AuditBase`.

### B. Frontend (TypeScript)

- **Generated Types**: Ideally, Frontend types should be generated from Backend OpenAPI specs.
- **Shared Types Directory**: All entity interfaces (`Employee`, `Department`) MUST reside in `src/types/index.ts` or `src/types/[entity].ts`.
  - _Violation_: Defining `interface Employee { ... }` inside `EmployeeList.tsx`.

---

## 4. Database De-duplication (Normalization)

### A. schema Design

- **Foreign Keys**: Use Foreign Keys (`organization_id`, `department_id`) instead of duplicating text (`department_name`).
  - _Exception_: Denormalization is permitted ONLY for performance-critical read models or historical snapshots (e.g., preserving `salary_at_time_of_payment` in a Payroll Record).
- **Enums & Lookups**: Fixed values (Employment Types, Statuses) should be either:
  1.  Database Tables (if dynamic/user-editable).
  2.  Enum classes (if static system values).
  - _Rule_: Never use "Magic Strings" in code (e.g., `if status == "Active"`). Use `Status.ACTIVE`.

---

## 5. Code & Logic De-duplication

### A. Service Layer

- **Logic Extraction**: Business logic (calculating tax, validating hierarchy) MUST exist in `backend/services/` or `backend/crud.py`, NOT in `backend/main.py`.
  - `main.py` is for Routing and Request/Response mapping ONLY.
- **Frontend Services**: API calls must be centralized in `src/services/api.ts`.
  - _Violation_: using `fetch('/api/users')` inside a generic component.

### B. Utility Functions

- **Central Utils**: Generic logic (Date formatting, Currency parsing) goes to `src/lib/utils.ts`.
  - Check `src/utils` and `src/lib` for duplicates and merge them.

---

## 6. Implementation Strategy (The "Purge")

1.  **Audit**: Run `grep` searches for common entities ("Employee", "Department") to find dispersed definitions.
2.  **Centralize**: Move dispersed definitions to their canonical homes (`src/types`, `backend/schemas`).
3.  **Refactor**: Update references to point to the central definition.
4.  **Delete**: Remove the deprecated duplicate code.
5.  **Lock**: Use Lint rules (if possible) or Code Review to prevent regression.

---

## 7. Code Search & Discovery Protocol

**Objective**: "Search before you Write". Prevent redundancy by locating existing solutions first.

### A. Feature Search Standard

- **Unified Filter Logic**: Do NOT implement `data.filter(x => x.name.includes(term))` in every component.
  - _Requirement_: Use a shared `useSearch<T>(data, keys, term)` hook for client-side filtering.
  - _Violation_: `leaves/index.tsx`, `job-postings/index.tsx` (Manual filter implementations).
- **Search Component**: Use the standard `src/components/ui/SearchInput` (composed of Icon + Input) instead of reconstructing `<div className="relative"><SearchIcon...><input...>`.

### B. Discovery Workflow (The "Grep First" Rule)

Before creating ANY new file or function, perform these 3 checks:

1.  **Filename Match**: `fd [keyword] src/` (e.g., "date", "currency", "user").
2.  **Implementation Match**: `rg "function.*[keyword]"` to find similar logic.
3.  **UI Visual Match**: Check Storybook (if available) or `src/components/ui` for existing visual patterns.

### C. Search Implementation

- **Backend Search**: Complex search queries MUST use `sqlalchemy` filters in `crud.py`, exposed via standard API parameters (`?q=term`), not post-processing in Python.
- **Frontend Search**:
  - Small Data (<1000 items): Use `useSearch` hook (Client-side).
  - Large Data (>1000 items): Use Server-side pagination + search (`useQuery(['users', search], ...)`).

---

**Version**: 1.1
**Date**: 2026-01-13
**Author**: Antigravity (Agentic AI)
