import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DataManagement from '../DataManagement';
import React from 'react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        users: [],
        apiKeys: [],
        webhooks: [],
    }),
}));

vi.mock('@components/ui/Toast', () => ({
    useToast: () => ({ success: vi.fn(), toastError: vi.fn(), error: vi.fn() }),
}));

vi.mock('@services/api', () => ({
    api: {
        restoreSystem: vi.fn(),
    },
}));

// Mock URL methods for JSDOM
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

test('renders DataManagement with backup and restore cards', () => {
    render(<DataManagement />);

    expect(screen.getByText(/System Backup/i)).toBeInTheDocument();
    expect(screen.getByText(/System Restore/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Security Note/i)).toBeInTheDocument();
});

test('renders backup and restore buttons', () => {
    render(<DataManagement />);

    // Name matches the aria-label
    expect(screen.getByRole('button', { name: /Create System Backup/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Backup File/i)).toBeInTheDocument();
});
