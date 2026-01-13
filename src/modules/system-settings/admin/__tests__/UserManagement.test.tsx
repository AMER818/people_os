import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import UserManagement from '../UserManagement';
import React from 'react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        users: [],
        addUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        systemFlags: { mfa_enforced: false, session_isolation: false, session_timeout: 30 },
        updateSystemFlags: vi.fn(),
        addAuditLog: vi.fn(),
    }),
    ROLE_HIERARCHY: ['SystemAdmin', 'Admin', 'Manager', 'User'],
    ROLE_PERMISSIONS: {
        SystemAdmin: ['create_users', 'edit_users', 'delete_users', 'employee_management', 'manage_master_data'],
        Admin: ['create_users', 'edit_users', 'employee_management'],
    },
}));

vi.mock('@components/ui/Toast', () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@hooks/useModal', () => ({
    useModal: () => ({ isOpen: false, open: vi.fn(), close: vi.fn() }),
}));

vi.mock('@hooks/useSaveEntity', () => ({
    useSaveEntity: vi.fn().mockImplementation(({ initialState }) => ({
        formData: initialState,
        updateField: vi.fn(),
        isSaving: false,
        handleSave: vi.fn(),
        setFormData: vi.fn(),
    })),
}));

test('renders UserManagement component with core sections', () => {
    render(<UserManagement onSync={() => { }} isSaving={false} />);

    // Use getByRole for headings to be more robust
    expect(screen.getByRole('heading', { name: /Permission Matrix/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Access Control List/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Security Directives/i })).toBeInTheDocument();
});

test('shows empty state when no users are present', () => {
    render(<UserManagement onSync={() => { }} isSaving={false} />);
    expect(screen.getByText(/No system administrators found/i)).toBeInTheDocument();
});

test('renders summary cards', () => {
    render(<UserManagement onSync={() => { }} isSaving={false} />);
    expect(screen.getByText(/Active Admins/i)).toBeInTheDocument();
    expect(screen.getByText(/MFA Adoption/i)).toBeInTheDocument();
});
