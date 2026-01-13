import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RBACProvider, useRBAC } from './RBACContext';
import { PermissionGate } from '../components/auth/PermissionGate';
import { useOrgStore } from '../store/orgStore';

// Mock the org store to simulate logged-in user
vi.mock('../store/orgStore', () => ({
  useOrgStore: vi.fn(),
}));

// Test Component to access hook
const TestComponent = () => {
  const { hasPermission, hasRole } = useRBAC();
  return (
    <div>
      <span data-testid="perm-check">{hasPermission('system_config') ? 'YES' : 'NO'}</span>
      <span data-testid="role-check">{hasRole('Root') ? 'YES' : 'NO'}</span>
    </div>
  );
};

describe('RBAC Context', () => {
  it('should allow Root to manage master data', () => {
    (useOrgStore as any).mockReturnValue({
      currentUser: { role: 'Root' },
    });

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>
    );

    expect(screen.getByTestId('perm-check').textContent).toBe('YES');
    expect(screen.getByTestId('role-check').textContent).toBe('YES');
  });

  it('should deny Business Admin from managing master data', () => {
    (useOrgStore as any).mockReturnValue({
      currentUser: { role: 'Business Admin' },
    });

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>
    );

    expect(screen.getByTestId('perm-check').textContent).toBe('NO');
  });

  it('PermissionGate should render children if authorized', () => {
    (useOrgStore as any).mockReturnValue({
      currentUser: { role: 'Root' },
    });

    render(
      <RBACProvider>
        <PermissionGate permission="manage_master_data">
          <div data-testid="protected-content">Secret</div>
        </PermissionGate>
      </RBACProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('PermissionGate should NOT render children if unauthorized', () => {
    (useOrgStore as any).mockReturnValue({
      currentUser: { role: 'Business Admin' },
    });

    render(
      <RBACProvider>
        <PermissionGate permission="create_users">
          <div data-testid="protected-content">Secret</div>
        </PermissionGate>
      </RBACProvider>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});
