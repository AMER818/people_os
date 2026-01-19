# Project Schema Audit Report
**Date:** 2026-01-19T10:37:22.179142
**Overall Schema Score:** 5.0 / 5.0

## Metrics
- **foreign_keys_enforced:** 1
- **indexes_count:** 92
- **tables_without_indexes:** 0
- **migration_files:** 8
- **orphaned_records_risk:** 0

## Findings
### 🔵 Potential Denormalization: 'system_flags'
- **Severity:** Minor
- **Description:** Table has 32 columns (threshold: 20)
- **Recommendation:** Consider standardizing schema or splitting tables.

### 🔵 Potential Denormalization: 'payroll_settings'
- **Severity:** Minor
- **Description:** Table has 22 columns (threshold: 20)
- **Recommendation:** Consider standardizing schema or splitting tables.

### 🔵 Potential Denormalization: 'notification_settings'
- **Severity:** Minor
- **Description:** Table has 33 columns (threshold: 20)
- **Recommendation:** Consider standardizing schema or splitting tables.

### 🔵 Potential Denormalization: 'hcm_employees'
- **Severity:** Minor
- **Description:** Table has 21 columns (threshold: 20)
- **Recommendation:** Consider standardizing schema or splitting tables.

### 🔵 Potential Denormalization: 'core_organizations'
- **Severity:** Minor
- **Description:** Table has 31 columns (threshold: 20)
- **Recommendation:** Consider standardizing schema or splitting tables.

### 🟡 Unenforced Foreign Key: 'core_organizations.tax_id'
- **Severity:** Major
- **Description:** Column 'tax_id' suggests a relation but has no FK constraint.
- **Recommendation:** Add FOREIGN KEY constraint for tax_id
