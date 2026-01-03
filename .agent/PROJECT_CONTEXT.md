# HCM_WEB Project Rules & Context

This file contains persistent project rules and context that should be referenced at the start of each session.

---

## Role-Based Access Control (RBAC)

### System Role Hierarchy

```
ProjectCreator (Level 3 - God Mode, Hidden)
    └── Super Admin (Level 2 - Full System Access)
        ├── SystemAdmin (Level 1 - System Configuration)
        └── HR Admin (Level 0 - HR Operations)
```

### Permission Matrix

| Permission | ProjectCreator | Super Admin | SystemAdmin | HR Admin |
|------------|----------------|-------------|-------------|----------|
| View Users | ✅ | ✅ | ✅ | ✅ |
| Create Users | ✅ | ✅ | ✅ | ❌ |
| Edit Users | ✅ | ✅ | ✅ | ❌ |
| Delete Users | ✅ | ✅ | ❌ | ❌ |
| Manage Master Data | ✅ | ✅ | ✅ | ✅ |
| System Config | ✅ | ✅ | ✅ | ❌ |
| View Audit Logs | ✅ | ✅ | ✅ | ❌ |
| Employee Management | ✅ | ✅ | ❌ | ✅ |
| Payroll Access | ✅ | ✅ | ❌ | ✅ |

### TypeScript Usage

```typescript
import { hasPermission, hasAuthorityOver, Permission } from './types';

// Check permission
if (hasPermission(currentUser?.role, 'delete_users')) {
  // Can delete users
}

// Check authority over another user
if (hasAuthorityOver(currentUser?.role, targetUser.role)) {
  // Can manage the target user
}
```

---

## User Management Flow

```
Login → api.login() → stores token + user in sessionStorage
     → refreshCurrentUser() loads into orgStore
     → Components access currentUser from useOrgStore()
```

### Session Storage Keys

| Key | Purpose |
|-----|---------|
| `hunzal_token` | JWT access token |
| `hunzal_current_user` | Current user object (JSON) |
| `hunzal_data_version` | Schema version for cache |

---

## Backend API

### GET /api/users Response

```json
{
  "id": "uuid",
  "username": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "status": "Active|Inactive",
  "isSystemUser": true|false
}
```

### Field Mapping (Backend → Frontend)

| Backend | Frontend | Notes |
|---------|----------|-------|
| `username` | `name` | Fallback if name not present |
| `isSystemUser: true` | `userType: 'SystemAdmin'` | System admin flag |

---

## File Quick Reference

| Purpose | File |
|---------|------|
| RBAC Types & Functions | `types.ts` |
| Login | `modules/Login.tsx` |
| API Service | `services/api.ts` |
| State Store | `store/orgStore.ts` |
| System Settings | `modules/SystemSettings.tsx` |
| Backend Entry | `backend/main.py` |
| DB Models | `backend/models.py` |
| Schemas | `backend/schemas.py` |

---

## Last Updated
- **Date**: 2026-01-09
- **Changes**: Implemented complete RBAC system with permission matrix and helper functions
