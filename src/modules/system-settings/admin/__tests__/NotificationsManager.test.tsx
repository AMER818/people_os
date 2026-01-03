import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import NotificationsManager from '../NotificationsManager';
import React from 'react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        notificationSettings: {
            email: { smtpServer: '', port: 587, username: '', password: '' },
            sms: { provider: 'Twilio', apiKey: '', senderId: '' },
        },
        updateNotificationSettings: vi.fn(),
    }),
}));

vi.mock('@components/ui/toast', () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

test('renders NotificationsManager with core settings', () => {
    render(<NotificationsManager onSync={() => { }} />);

    // Check for core headers
    expect(screen.getByText(/Communications/i)).toBeInTheDocument();
    expect(screen.getByText(/Email Server Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/SMS Provider Settings/i)).toBeInTheDocument();
});

test('renders input fields for SMTP and SMS', () => {
    render(<NotificationsManager onSync={() => { }} />);

    expect(screen.getByLabelText(/Server Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sender ID/i)).toBeInTheDocument();
});

test('renders save button', () => {
    render(<NotificationsManager onSync={() => { }} />);
    // Match the aria-label used in the component
    expect(screen.getByRole('button', { name: /Save all communication node settings/i })).toBeInTheDocument();
});
