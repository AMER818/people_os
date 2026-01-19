# 🔌 System Integration Notes

> **Target Audience:** External Integrators, ETL Developers, Script Maintainers.
> **Last Updated:** 2026-01-15

---

## 1. Organizations API

### **Designation Creation (`POST /api/designations`)**

**Change Notice (2026-01-15):**
The `department_id` field is now **OPTIONAL** to support Global Designations.

**Impact:**

- **Legacy Scripts:** Existing scripts sending `department_id` will continue to work (Backward Compatible).
- **New Capability:** You can now create designations without a department linkage by omitting the field or sending `null`.

**Payload Example:**

```json
{
  "name": "Senior Staff Engineer",
  "grade_id": "GRD-123",
  "organization_id": "ORG-001",
  "department_id": null // <--- Now accepted
}
```

---

## 2. API Versioning Policy

- We use **URI Versioning** (e.g., `/api/v1/...`) for breaking changes only.
- Non-breaking changes (like making a field optional) do **not** trigger a version bump.
- Current stable API version is **v1** (implicit default).

---

## 3. OpenAPI / Swagger

- The live API documentation is auto-generated and always up-to-date.
- **URL**: `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc`.
- Please check the schema definition for `DesignationCreate` to see the latest constraints.
