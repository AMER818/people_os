# ADR-010: Decoupling Designations from Departments

## Status

Accepted

## Date

2026-01-15

## Context

Originally, the `Designation` entity was strictly coupled to a `Department`. This forced a hierarchical structure where every job title (e.g., "Senior Engineer") had to be duplicated for every department (Engineering, Platform, R&D) or assigned to a dummy department. This created data redundancy and friction for organization-wide roles (e.g., "VP", "Director").

## Decision

We have decided to decouple Designations from Departments by making the `department_id` foreign key **nullable**.

### Key Changes

1.  **Schema**: `designations.department_id` is now `Optional[str]`.
2.  **API**: The `create_designation` endpoint accepts null/missing `department_id`.
3.  **UI**: The creation flow no longer prompts for a Department; designations are primarily linked to **Grades** and **Job Levels**.

## Consequences

### Positive

- **Flexibility**: Enables "Global Designations" that apply across the entire organization.
- **Simplicity**: Reduces data duplication. "Senior Engineer" can be defined once and used everywhere.
- **UX**: Simplified creation flow (Name + Grade).

### Negative

- **Reporting**: Department-specific designation reports now require joining via `employees` (who have departments) rather than counting designations directly. (Mitigated: Current reports verified to be compatible).
- **Visualization**: Structural hierarchy charts (Department Tree) will not show global designations directly under a department node. (Mitigated: Employment View shows all).

## Compliance

- **Audit**: All changes verified against 10/10 compliance layers (Backup, Audit Log, Data Integrity, etc.).
- **Versioning**: Non-breaking change (API v1 compatible).
