import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import APIManager from '../APIManager';
import React from 'react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        apiKeys: [],
        addApiKey: vi.fn(),
        deleteApiKey: vi.fn(),
        webhooks: [],
        addWebhook: vi.fn(),
        deleteWebhook: vi.fn(),
        simulateWebhookDelivery: vi.fn(),
        addAuditLog: vi.fn(),
    }),
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

test('renders APIManager component with core headers', () => {
    render(<APIManager />);

    // Use getByRole for headings which is much more reliable
    expect(screen.getByRole('heading', { name: /Developer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tokens/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Webhooks/i })).toBeInTheDocument();
});

test('shows empty states for tokens and webhooks', () => {
    render(<APIManager />);
    expect(screen.getByText(/No active access tokens/i)).toBeInTheDocument();
    expect(screen.getByText(/No webhooks configured/i)).toBeInTheDocument();
});
