# RBAC Permission System

## Overview

The Role-Based Access Control (RBAC) system uses a unified permission configuration across frontend and backend.

## Architecture

### Single Source of Truth

| Layer    | File                            | Purpose                    |
| -------- | ------------------------------- | -------------------------- |
| Backend  | `backend/permissions_config.py` | API endpoint authorization |
| Frontend | `src/config/permissions.ts`     | UI visibility and actions  |

> **Note**: `src/types.ts` re-exports from `config/permissions.ts` for backward compatibility.

## System Default Roles (Hardcoded)

These roles have **full access** and **cannot be modified**:

| Role            | Access Level       | Permissions               |
| --------------- | ------------------ | ------------------------- |
| **Root**        | God Mode (Level 5) | `["*"]` - All permissions |
| **Super Admin** | Full App (Level 4) | `["*"]` - All permissions |

## Configurable Roles

These roles have minimal default permissions and can be configured via System Settings:

| Role           | Default Level | Initial Permissions     |
| -------------- | ------------- | ----------------------- |
| SystemAdmin    | Level 3       | `[]` - Configure via UI |
| Business Admin | Level 2       | `[]` - Configure via UI |
| Manager        | Level 1       | `[]` - Configure via UI |
| User           | Level 0       | `[]` - Configure via UI |

## Role Hierarchy

```
Root (5) > Super Admin (4) > SystemAdmin (3) > Business Admin (2) > Manager (1) > User (0)
```

## Permission Check Functions

### Backend (`backend/permissions_config.py`)

```python
has_permission(role, permission) -> bool
get_role_level(role) -> int
is_higher_role(role_a, role_b) -> bool
```

### Frontend (`src/config/permissions.ts`)

```typescript
hasPermission(role, permission): boolean
getRoleLevel(role): number
isHigherRole(roleA, roleB): boolean
hasAuthorityOver(roleA, roleB): boolean
isSystemRole(role): boolean
```

## Usage Examples

### Backend Route Protection

```python
from backend.permissions_config import has_permission

@app.get("/api/admin/data")
def admin_data(current_user = Depends(get_current_user)):
    if not has_permission(current_user["role"], "system_config"):
        raise HTTPException(403, "Access denied")
    return {...}
```

### Frontend UI Visibility

```typescript
import { hasPermission } from '@/config/permissions';

const canEdit = hasPermission(user.role, 'edit_employee');
```

### PermissionGate Component

```tsx
<PermissionGate permission="manage_master_data">
  <AdminPanel />
</PermissionGate>
```
