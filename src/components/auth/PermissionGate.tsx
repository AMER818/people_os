import React, { ReactNode } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Permission, SystemRole } from '../../types';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  role?: SystemRole | SystemRole[];
  fallback?: ReactNode;
}

// Logic wrapper: Accessibility attributes (aria-label) should be provided by children components.
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = useRBAC();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
