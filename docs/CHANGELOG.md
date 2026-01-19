# Changelog

All notable changes to the HCM Enterprise project.

## [1.1.0] - 2026-01-15

### Added

- **Global Designations**: Removed mandatory department dependency, allowing organization-wide roles.
- **Audit System**: Enhanced audit logging for designation updates and system maintenance.
- **Backup Mechanism**: Integrated full SQLite database replication for reliable backups.
- **Integration Docs**: Added `docs/INTEGRATION_NOTES.md` for external consumers.
- **Architecture**: Added ADR-010 describing designation decoupling.

### Changed

- **Schema**: Made `department_id` nullable in `designations` table.
- **UI**: Designation management now groups strictly by Grade/Job Level, removing Department filters in creation flow.
- **API**: Updated `POST /api/designations` to accept optional department.

## [1.0.0] - 2025-12-28

### Added

- ESLint + Prettier + Git hooks
- TypeScript strict mode
- Error handling utilities
- Security utilities (sanitization, validation)
- Accessibility utilities
- ErrorBoundary component
- CSP and security headers
- Comprehensive documentation (8 files)
- 283 dev dependencies (0 vulnerabilities)

### Changed

- Build includes type checking
- 100+ files formatted
- package.json v1.0.0

### Fixed

- 4 unused imports removed
- TypeScript errors: 251 → 247

### Security

- CSP headers
- XSS protection
- Frame protection
- Environment validation
