---
description: RBAC permission check patterns
---

## Adding Permission Checks

When adding a new feature that requires permission checking, follow this pattern:

### For Master Data Management (Departments, Grades, etc.)

```tsx
const canManageMasterData = ['Super Admin', 'HR Admin', 'Creator'].includes(currentUser?.role || '');
```

### For Position Management

```tsx
{['Super Admin', 'HR Admin', 'Creator'].includes(currentUser?.role || '') && (
  <Button>Create Position</Button>
)}
```

### CRITICAL: Always include 'Creator' role

The 'Creator' role MUST have the same permissions as 'Super Admin' and 'HR Admin'.

### Files to update when adding new permission checks:

1. The component where the check is added
2. Document the permission in `.agent/PROJECT_CONTEXT.md`
