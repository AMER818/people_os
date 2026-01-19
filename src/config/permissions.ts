/**
 * RBAC PERMISSION SYSTEM - SINGLE SOURCE OF TRUTH (FRONTEND)
 * ===========================================================
 * Root and Super Admin are SYSTEM DEFAULTS with FULL ACCESS.
 * All other roles are configurable via System Settings UI.
 *
 * THIS MIRRORS backend/permissions_config.py - DO NOT DUPLICATE.
 */

import { Permission, SystemRole } from '../types';

// ============================================================
// SYSTEM DEFAULT ROLES (Hardcoded - Cannot be modified)
// ============================================================
export const SYSTEM_ROLES: Set<SystemRole> = new Set(['Root', 'Super Admin']);

// ============================================================
// SUPER_ROLES - Roles with automatic full access bypass
// ============================================================
export const SUPER_ROLES: Set<SystemRole> = new Set(['Root', 'Super Admin']);

// ============================================================
// DEFAULT_ROLE_PERMISSIONS - Hardcoded System Defaults
// ============================================================
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  // SYSTEM DEFAULTS (Hardcoded - Full Access)
  Root: ['*'],
  'Super Admin': ['*'],

  // CONFIGURABLE ROLES (Defaults - Can be modified via UI)
  SystemAdmin: [], // To be configured via System Settings
  'Business Admin': [], // To be configured via System Settings
  Manager: [], // To be configured via System Settings
  User: [], // To be configured via System Settings
};

// ============================================================
// ROLE_HIERARCHY - Authority Levels (Higher index = more power)
// ============================================================
export const ROLE_HIERARCHY: SystemRole[] = [
  'User', // Level 0
  'Manager', // Level 1
  'Business Admin', // Level 2
  'SystemAdmin', // Level 3
  'Super Admin', // Level 4
  'Root', // Level 5
];

// ============================================================
// Permission Check Utilities
// ============================================================

/**
 * Check if a role has a specific permission.
 * Root and Super Admin always return true (wildcard bypass).
 */
export const hasPermission = (
  userRole: SystemRole | undefined,
  permission: Permission
): boolean => {
  if (!userRole) {
    return false;
  }

  // Super roles bypass all checks
  if (SUPER_ROLES.has(userRole)) {
    return true;
  }

  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];

  // Handle wildcard permission
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
};

/**
 * Get the hierarchy level of a role (0-5).
 */
export const getRoleLevel = (role: SystemRole): number => {
  return ROLE_HIERARCHY.indexOf(role);
};

/**
 * Check if role_a has higher authority than role_b.
 */
export const isHigherRole = (roleA: SystemRole, roleB: SystemRole): boolean => {
  return getRoleLevel(roleA) > getRoleLevel(roleB);
};

/**
 * Check if a role is a system default (cannot be modified).
 */
export const isSystemRole = (role: SystemRole): boolean => {
  return SYSTEM_ROLES.has(role);
};

/**
 * Check if roleA has equal or higher authority than roleB.
 */
export const hasAuthorityOver = (
  roleA: SystemRole | undefined,
  roleB: SystemRole | undefined
): boolean => {
  if (!roleA) {
    return false;
  }

  // Root supersedes all
  if (roleA === 'Root') {
    return true;
  }

  if (!roleB) {
    return true;
  }

  return getRoleLevel(roleA) >= getRoleLevel(roleB);
};
