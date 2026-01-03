-- Migration Template
-- Copy this file and rename to: YYYYMMDD_HHMMSS_description.sql
-- Example: 20260101_150000_add_employee_salary.sql

-- ============================================
-- Migration Metadata
-- ============================================
-- Description: [Describe what this migration does]
-- Date: YYYY-MM-DD
-- Author: [Your Name]
-- Environment: PROD
-- Breaking Changes: [Yes/No - describe if yes]

-- ============================================
-- Pre-Migration Checks
-- ============================================
-- Verify backup exists before running this migration
-- Backup file should be: backups/hunzal_hcm_prod.backup.YYYYMMDD_HHMMSS.db

BEGIN TRANSACTION;

-- ============================================
-- Migration SQL
-- ============================================

-- Example: Add new column
-- ALTER TABLE employees ADD COLUMN salary DECIMAL(10,2);

-- Example: Create new table
-- CREATE TABLE IF NOT EXISTS departments (
--     id VARCHAR(36) PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     code VARCHAR(20) UNIQUE NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- Example: Update existing data
-- UPDATE employees SET status = 'Active' WHERE status IS NULL;

-- ============================================
-- Verification
-- ============================================

-- Verify migration was successful
-- Example checks:
-- SELECT COUNT(*) as total_employees FROM employees;
-- SELECT COUNT(*) as employees_with_salary FROM employees WHERE salary IS NOT NULL;

-- ============================================
-- Rollback SQL (for reference)
-- ============================================
-- Keep this commented - for manual rollback if needed

-- Example rollback:
-- ALTER TABLE employees DROP COLUMN salary;
-- DROP TABLE IF EXISTS departments;

COMMIT;

-- ============================================
-- Post-Migration Notes
-- ============================================
-- [Add any notes about manual steps needed after migration]
-- [Document any dependencies or follow-up actions]
