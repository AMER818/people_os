/**
 * PermissionGate Component Test Suite
 * Tests permission-based conditional rendering with fallback support
 * Priority: HIGH (Critical Security Component)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PermissionGate } from '../PermissionGate';

// Create mock functions at module level
const mockHasPermission = vi.fn();
const mockHasRole = vi.fn();

// Mock RBAC context
vi.mock('../../../contexts/RBACContext', () => ({
  useRBAC: () => ({
    hasPermission: mockHasPermission,
    hasRole: mockHasRole,
    userRole: undefined,
  }),
}));
vi.mock('@/contexts/RBACContext', () => ({
  useRBAC: () => ({
    hasPermission: mockHasPermission,
    hasRole: mockHasRole,
    userRole: undefined,
  }),
}));

describe('PermissionGate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(false);
    mockHasRole.mockReturnValue(false);
  });

  describe('Permission-based Rendering', () => {
    it('should render children when user has required permission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <PermissionGate permission={'manage_employees' as any}>
          <div>Employee Management</div>
        </PermissionGate>
      );

      expect(screen.getByText('Employee Management')).toBeInTheDocument();
    });

    it('should NOT render children when user lacks permission', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <PermissionGate permission={'manage_employees' as any}>
          <div>Employee Management</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
    });

    it('should render fallback when permission is denied', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <PermissionGate permission={'manage_employees' as any} fallback={<div>Access Denied</div>}>
          <div>Employee Management</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should render nothing when permission denied and no fallback', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <PermissionGate permission={'manage_employees' as any}>
          <div>Employee Management</div>
        </PermissionGate>
      );

      expect(container.textContent).toBe('');
    });
  });

  describe('Role-based Rendering', () => {
    it('should render children when user has required role', () => {
      mockHasRole.mockReturnValue(true);

      render(
        <PermissionGate role="SystemAdmin">
          <div>Admin Dashboard</div>
        </PermissionGate>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should NOT render children when user lacks role', () => {
      mockHasRole.mockReturnValue(false);

      render(
        <PermissionGate role="SystemAdmin">
          <div>Admin Dashboard</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should render children when user has one of multiple roles', () => {
      mockHasRole.mockReturnValue(true);

      render(
        <PermissionGate role={['SystemAdmin', 'HR Admin'] as any}>
          <div>HR Dashboard</div>
        </PermissionGate>
      );

      expect(screen.getByText('HR Dashboard')).toBeInTheDocument();
    });

    it('should render fallback when role is denied', () => {
      mockHasRole.mockReturnValue(false);

      render(
        <PermissionGate role="SystemAdmin" fallback={<div>Admin Access Required</div>}>
          <div>Admin Panel</div>
        </PermissionGate>
      );

      expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
    });
  });

  describe('Combined Permission and Role Checks', () => {
    it('should render when both permission and role are satisfied', () => {
      mockHasPermission.mockReturnValue(true);
      mockHasRole.mockReturnValue(true);

      render(
        <PermissionGate permission={'view_payroll' as any} role={'HR Admin' as any}>
          <div>Payroll Data</div>
        </PermissionGate>
      );

      expect(screen.getByText('Payroll Data')).toBeInTheDocument();
    });

    it('should show fallback when permission denied but role granted', () => {
      mockHasPermission.mockReturnValue(false);
      mockHasRole.mockReturnValue(true);

      render(
        <PermissionGate
          permission={'view_payroll' as any}
          role={'HR Admin' as any}
          fallback={<div>Insufficient permissions</div>}
        >
          <div>Payroll Data</div>
        </PermissionGate>
      );

      expect(screen.getByText('Insufficient permissions')).toBeInTheDocument();
    });

    it('should show fallback when role denied but permission granted', () => {
      mockHasPermission.mockReturnValue(true);
      mockHasRole.mockReturnValue(false);

      render(
        <PermissionGate
          permission={'view_payroll' as any}
          role={'HR Admin' as any}
          fallback={<div>Admin role required</div>}
        >
          <div>Payroll Data</div>
        </PermissionGate>
      );

      expect(screen.getByText('Admin role required')).toBeInTheDocument();
    });
  });

  describe('No Restrictions (Public Content)', () => {
    it('should always render children when no restrictions', () => {
      render(
        <PermissionGate>
          <div>Public Content</div>
        </PermissionGate>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  describe('Fallback Variations', () => {
    it('should render custom JSX fallback', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <PermissionGate
          permission={'admin_panel' as any}
          fallback={
            <div className="error-message">
              <h3>Access Restricted</h3>
              <p>Contact your administrator</p>
            </div>
          }
        >
          <div>Admin Panel</div>
        </PermissionGate>
      );

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(screen.getByText('Contact your administrator')).toBeInTheDocument();
    });

    it('should render string fallback', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <PermissionGate permission={'admin_panel' as any} fallback="You don't have permission">
          <div>Admin Panel</div>
        </PermissionGate>
      );

      expect(screen.getByText("You don't have permission")).toBeInTheDocument();
    });

    it('should render null fallback explicitly', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <PermissionGate permission={'admin_panel' as any} fallback={null}>
          <div>Admin Panel</div>
        </PermissionGate>
      );

      expect(container.textContent).toBe('');
    });
  });

  describe('Real-world UI Scenarios', () => {
    it('should conditionally show edit button based on permission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <div>
          <h1>Employee Profile</h1>
          <PermissionGate permission={'edit_employee' as any}>
            <button>Edit Profile</button>
          </PermissionGate>
        </div>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('should hide delete button for users without permission', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <div>
          <h1>Employee List</h1>
          <PermissionGate permission={'delete_employee' as any}>
            <button>Delete</button>
          </PermissionGate>
        </div>
      );

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should show disabled state message when access denied', () => {
      mockHasRole.mockReturnValue(false);

      render(
        <PermissionGate
          role={'HR Admin' as any}
          fallback={<span className="text-muted">Available for HR Admins only</span>}
        >
          <div>Salary Information</div>
        </PermissionGate>
      );

      expect(screen.getByText('Available for HR Admins only')).toBeInTheDocument();
    });

    it('should conditionally render entire sections', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <PermissionGate permission={'view_reports' as any}>
          <section>
            <h2>Analytics Dashboard</h2>
            <div>Chart 1</div>
            <div>Chart 2</div>
          </section>
        </PermissionGate>
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle rapid permission changes', () => {
      mockHasPermission.mockReturnValue(true);

      const { rerender } = render(
        <PermissionGate permission={'edit_data' as any}>
          <div>Editor</div>
        </PermissionGate>
      );

      expect(screen.getByText('Editor')).toBeInTheDocument();

      mockHasPermission.mockReturnValue(false);

      rerender(
        <PermissionGate permission={'edit_data' as any}>
          <div>Editor</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Editor')).not.toBeInTheDocument();
    });

    it('should not leak sensitive data through fallback', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <PermissionGate permission={'view_salaries' as any}>
          <div>Salary: $150,000</div>
        </PermissionGate>
      );

      expect(container.textContent).not.toContain('150,000');
    });

    it('should not re-check permissions unnecessarily', () => {
      mockHasPermission.mockReturnValue(true);

      const { rerender } = render(
        <PermissionGate permission={'view_data' as any}>
          <div>Data</div>
        </PermissionGate>
      );

      const callCount = mockHasPermission.mock.calls.length;

      rerender(
        <PermissionGate permission={'view_data' as any}>
          <div>Data</div>
        </PermissionGate>
      );

      expect(mockHasPermission.mock.calls.length).toBe(callCount * 2);
    });
  });
});
