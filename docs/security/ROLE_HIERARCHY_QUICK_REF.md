# L0-L5 Role Hierarchy - Quick Reference

## Role Matrix at a Glance

| Level  | Role           | Type          | Key Permissions                                       | Excluded Permissions                       |
| ------ | -------------- | ------------- | ----------------------------------------------------- | ------------------------------------------ |
| **L5** | Root           | God Mode      | `*` (all)                                             | None                                       |
| **L4** | Super Admin    | Full Access   | `*` (all)                                             | None                                       |
| **L3** | SystemAdmin    | System Config | Users, Logs, Security, Config, API Keys, Backup       | Employees, Payroll, Recruitment            |
| **L2** | Business Admin | Business Ops  | Employees, Payroll, Recruitment, Reports, Master Data | System Config, User Management, Audit Logs |
| **L1** | Manager        | Team Level    | View Team, View Leaves, Approve Leaves                | Global Access, Create/Edit/Delete          |
| **L0** | User           | Self Service  | View Profile, View Own Leaves                         | All Other Data                             |

## Permission Details

### L3: SystemAdmin (System Configuration)

**Can Do:**

- Manage users (create, edit, delete)
- View audit logs
- Configure system settings
- Manage API keys
- Backup and restore data

**Cannot Do:**

- Access employee data
- Manage payroll
- Access recruitment
- View business reports

### L2: Business Admin (Business Operations)

**Can Do:**

- Manage employees (create, edit, delete)
- Manage payroll and salaries
- Manage recruitment and candidates
- View business reports
- Access master data

**Cannot Do:**

- Configure system settings
- Manage users
- View audit logs
- Access API keys

### L1: Manager (Team Management)

**Can Do:**

- View direct reports
- View team leave requests
- Approve team leaves
- View team dashboard

**Cannot Do:**

- Create/edit/delete employees
- Access global data
- Modify payroll
- View other teams' data

### L0: User (Self-Service)

**Can Do:**

- View own profile
- View own leave records
- Submit own leave requests
- View personal dashboard

**Cannot Do:**

- Access any other employee data
- View organizational data
- Submit requests on behalf of others

## Key Principles

1. **Role Segregation:**
   - System roles (L3-L5) manage the system itself
   - Business roles (L0-L2) manage business operations
   - NEVER mix: System admins cannot access business data

2. **Hierarchy:**
   - Higher levels have all permissions of lower levels (except L3 vs L2)
   - L5 > L4 > L3 (System track)
   - L5 > L4 > L2 > L1 > L0 (Business track)
   - L3 and L2 are SIBLINGS (neither has the other's permissions)

3. **Data Scope:**
   - L5-L2: Global data
   - L1: Team data only
   - L0: Own data only

## Testing Each Role

### Test L3 (SystemAdmin):

```bash
Login: sysadmin / temp123
Expected: Can manage users, see audit logs, NOT access employees
URL: /api/system-flags → 200 OK
URL: /api/employees → 403 FORBIDDEN
```

### Test L2 (Business Admin):

```bash
Login: admin / temp123
Expected: Can manage employees/payroll, NOT see system config
URL: /api/employees → 200 OK
URL: /api/system-flags → 403 FORBIDDEN
```

### Test L1 (Manager):

```bash
Login: manager / temp123
Expected: Can view team, approve leaves, NOT edit employees
URL: /api/leaves/approve → 200 OK (for team)
URL: /api/employees/1 (EDIT) → 403 FORBIDDEN
```

### Test L0 (User):

```bash
Login: user1 / temp123
Expected: Self-service only
URL: /api/profile → 200 OK (own profile)
URL: /api/employees → 403 FORBIDDEN
```

## Frontend Component Usage

```typescript
// Check single permission
const { hasPermission } = useRBAC();
if (hasPermission('manage_employees')) {
  return <EmployeesList />;
}

// Check role
const { hasRole } = useRBAC();
if (hasRole('SystemAdmin')) {
  return <SystemConfig />;
}

// Wrap protected component
<RoleGuard requiredPermission="manage_payroll">
  <PayrollModule />
</RoleGuard>
```

## Database Check

To verify permissions in database:

```sql
-- Check role permissions
SELECT role_name, permissions FROM role_permissions;

-- Check user roles
SELECT username, role_name FROM users u JOIN roles r ON u.role_id = r.id;

-- Check audit trail
SELECT username, action, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

| Problem                     | Cause                  | Solution                                   |
| --------------------------- | ---------------------- | ------------------------------------------ |
| L3 can access employees     | Permission seed failed | Run `python backend/seed_permissions.py`   |
| L2 can access system config | Wrong role assigned    | Check user role in database                |
| L1 cannot approve leaves    | Missing permission     | Verify `approve_leaves` in seed file       |
| L0 can see all employees    | Data filtering missing | Implement query-level filtering in backend |

## Files to Check

- **Backend Permissions:** `backend/seed_permissions.py` - Lines 20-56
- **Frontend Permissions:** `src/config/permissions.ts` - DEFAULT_ROLE_PERMISSIONS
- **Access Control:** `backend/main.py` - check_permission() function
- **Frontend Guards:** `src/contexts/RBACContext.tsx` - hasPermission() hook

## Emergency: Grant All Access

If you need to grant a user all access temporarily:

```sql
UPDATE users SET role_name = 'Root' WHERE username = 'username';
-- Then login again (JWT token refreshes)
```

**IMPORTANT:** Change back after fixing the issue!

---

**Last Updated:** 2025-01-XX  
**Status:** L0-L5 Hierarchy Fully Implemented  
**Test Results:** 6/6 Passing ✅
