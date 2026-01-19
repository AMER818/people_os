import React, { ReactNode, useEffect } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Permission, SystemRole } from '../../types';
import { useUIStore } from '../../store/uiStore';

interface RoleGuardProps {
  children: ReactNode;
  permission?: Permission;
  role?: SystemRole | SystemRole[];
  redirectTo?: string; // Module ID to redirect to
}

// Logic wrapper: Accessibility attributes (aria-label) should be provided by children components.
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permission,
  role,
  redirectTo = 'dashboard',
}) => {
  const { hasPermission, hasRole } = useRBAC();
  const { setActiveModule } = useUIStore();

  const isAuthorized = (): boolean => {
    if (permission && !hasPermission(permission)) {
      return false;
    }
    if (role && !hasRole(role)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!isAuthorized()) {
      // Redirect using the store action since we handle routing via activeModule
      setActiveModule(redirectTo as any);
    }
  }, [permission, role, redirectTo]);

  if (!isAuthorized()) {
    return null; // Don't render restricted content while redirecting
  }

  return <>{children}</>;
};
