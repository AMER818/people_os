import { Permission, SystemRole } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  // L5: Root - God Mode
  Root: ['*'],

  // L4: Super Admin - Full Application Access
  'Super Admin': ['*'],

  // L3: System Admin - Technical Configuration ONLY (No Business Logic)
  SystemAdmin: [
    'view_dashboard',
    'create_users',
    'edit_users',
    'delete_users',
    'view_audit_logs',
    'system_config',
    'manage_api_keys',
    'backup_restore',
    // EXCLUDED: manage_employees, manage_payroll, manage_recruitment, etc.
  ],

  // L2: Business Admin - Business Operations ONLY (No System Config)
  'Business Admin': [
    'view_dashboard',
    'manage_employees',
    'create_employee',
    'edit_employee',
    'delete_employee',
    'manage_payroll',
    'run_payroll',
    'view_salary',
    'manage_recruitment',
    'view_candidates',
    'edit_candidate',
    'view_departments',
    'manage_master_data',
    'view_reports',
    // EXCLUDED: system_config, create_users, delete_users, view_audit_logs
  ],

  // L1: Manager - Team-Level Access (View/Approve for direct reports only)
  Manager: [
    'view_dashboard',
    'view_employees', // Can view employees (filtered to team)
    'view_team', // View direct reports
    'view_leaves', // View team leaves
    'approve_leaves', // Approve leaves for team
    // EXCLUDED: Create/Edit/Delete, Global visibility
  ],

  // L0: User - Self-Service Only (Own Data)
  User: [
    'view_dashboard',
    'view_profile', // Own profile only
    'view_own_leaves', // Own leaves only
    // EXCLUDED: Any other data
  ],
};

export const hasPermission = (
  userRole: SystemRole | undefined,
  permission: Permission
): boolean => {
  if (!userRole) {
    return false;
  }

  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];

  // Handle wildcard permission (Admin bypass)
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
};
