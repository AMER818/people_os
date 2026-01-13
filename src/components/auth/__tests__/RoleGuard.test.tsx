/**
 * RoleGuard Component Test Suite
 * Tests RBAC enforcement for role and permission-based access control
 * Priority: HIGH (Critical Security Component)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RoleGuard } from '../RoleGuard';

// Create mock functions at module level
const mockHasPermission = vi.fn();
const mockHasRole = vi.fn();
const mockSetActiveModule = vi.fn();

// Mock dependencies
vi.mock('../../../contexts/RBACContext', () => ({
  useRBAC: () => ({
    hasPermission: mockHasPermission,
    hasRole: mockHasRole,
    userRole: undefined,
  }),
}));

vi.mock('../../../store/uiStore', () => ({
  useUIStore: () => ({
    setActiveModule: mockSetActiveModule,
    activeModule: 'dashboard',
  }),
}));

describe('RoleGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(false);
    mockHasRole.mockReturnValue(false);
  });

  describe('Permission-based Access', () => {
    it('should render children when user has required permission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RoleGuard permission={'manage_employees' as any}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('manage_employees');
    });

    it('should NOT render children when user lacks required permission', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RoleGuard permission={'manage_employees' as any}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('manage_employees');
    });

    it('should redirect to default module when permission is denied', async () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RoleGuard permission={'system_config' as any}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      await waitFor(() => {
        expect(mockSetActiveModule).toHaveBeenCalledWith('dashboard');
      });
    });

    it('should redirect to custom module when specified', async () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RoleGuard permission={'system_config' as any} redirectTo="employee">
          <div>Protected Content</div>
        </RoleGuard>
      );

      await waitFor(() => {
        expect(mockSetActiveModule).toHaveBeenCalledWith('employee');
      });
    });
  });

  describe('Role-based Access', () => {
    it('should render children when user has required role', () => {
      mockHasRole.mockReturnValue(true);

      render(
        <RoleGuard role="SystemAdmin">
          <div>Admin Panel</div>
        </RoleGuard>
      );

      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(mockHasRole).toHaveBeenCalledWith('SystemAdmin');
    });

    it('should NOT render children when user lacks required role', () => {
      mockHasRole.mockReturnValue(false);

      render(
        <RoleGuard role="SystemAdmin">
          <div>Admin Panel</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render children when user has one of multiple allowed roles', () => {
      mockHasRole.mockReturnValue(true);

      render(
        <RoleGuard role={['SystemAdmin', 'HR Admin'] as any}>
          <div>HR Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('HR Content')).toBeInTheDocument();
    });

    it('should NOT render when user has none of the allowed roles', () => {
      mockHasRole.mockReturnValue(false);

      render(
        <RoleGuard role={['SystemAdmin', 'HR Admin'] as any}>
          <div>HR Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('HR Content')).not.toBeInTheDocument();
    });
  });

  describe('Combined Permission and Role Checks', () => {
    it('should render when both permission and role are satisfied', () => {
      mockHasPermission.mockReturnValue(true);
      mockHasRole.mockReturnValue(true);

      render(
        <RoleGuard permission={'manage_employees' as any} role="SystemAdmin">
          <div>Protected Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Admin Content')).toBeInTheDocument();
    });

    it('should NOT render when permission is satisfied but role is not', () => {
      mockHasPermission.mockReturnValue(true);
      mockHasRole.mockReturnValue(false);

      render(
        <RoleGuard permission={'manage_employees' as any} role="SystemAdmin">
          <div>Protected Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument();
    });

    it('should NOT render when role is satisfied but permission is not', () => {
      mockHasPermission.mockReturnValue(false);
      mockHasRole.mockReturnValue(true);

      render(
        <RoleGuard permission={'manage_employees' as any} role="SystemAdmin">
          <div>Protected Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument();
    });

    it('should NOT render when both permission and role are denied', () => {
      mockHasPermission.mockReturnValue(false);
      mockHasRole.mockReturnValue(false);

      render(
        <RoleGuard permission={'manage_employees' as any} role="SystemAdmin">
          <div>Protected Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('No Restrictions (Public Access)', () => {
    it('should render children when no permission or role is required', () => {
      render(
        <RoleGuard>
          <div>Public Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  describe('Real-world RBAC Scenarios', () => {
    it('should allow SystemAdmin to access system settings', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RoleGuard permission={'system_config' as any}>
          <div>System Settings</div>
        </RoleGuard>
      );

      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });

    it('should deny HRManager from accessing system settings', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RoleGuard permission={'system_config' as any}>
          <div>System Settings</div>
        </RoleGuard>
      );

      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });

    it('should allow HR Admin to access organization setup', () => {
      mockHasRole.mockReturnValue(true);

      render(
        <RoleGuard role={['SystemAdmin', 'HR Admin'] as any}>
          <div>Organization Setup</div>
        </RoleGuard>
      );

      expect(screen.getByText('Organization Setup')).toBeInTheDocument();
    });

    it('should deny regular users from accessing payroll engine', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RoleGuard permission={'manage_payroll' as any}>
          <div>Payroll Engine</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Payroll Engine')).not.toBeInTheDocument();
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle undefined permission gracefully', () => {
      render(
        <RoleGuard permission={undefined}>
          <div>Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle null role gracefully', () => {
      render(
        <RoleGuard role={undefined}>
          <div>Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should prevent rendering during authorization check', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <RoleGuard permission={'sensitive_data' as any}>
          <div>Sensitive Information</div>
        </RoleGuard>
      );

      expect(container.textContent).toBe('');
    });
  });
});
