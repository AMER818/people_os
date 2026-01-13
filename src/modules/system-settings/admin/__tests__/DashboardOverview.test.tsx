import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DashboardOverview from '../DashboardOverview';
import React from 'react';
import { Activity, Shield } from 'lucide-react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        auditLogs: [],
        flushCache: vi.fn(),
        rotateLogs: vi.fn(),
    }),
}));

vi.mock('@components/ui/Toast', () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

// Mock SystemHealth to avoid complex rendering
vi.mock('../../SystemHealth', () => ({
    default: () => <div data-testid="mock-system-health">System Health Dashboard</div>
}));

// Mock props
const mockSystemHealthData = [
    { label: 'Database Heartbeat', status: 'Healthy', latency: '12ms', color: 'success', icon: Activity },
    { label: 'Security Firewall', status: 'Active', latency: '0ms', color: 'success', icon: Shield },
];

test('renders DashboardOverview with core sections', () => {
    render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

    expect(screen.getByTestId('mock-system-health')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /System Load Monitor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Recent Activity/i })).toBeInTheDocument();
    expect(screen.getByText(/Neural Guard/i)).toBeInTheDocument();
});

test('renders health metrics from props', () => {
    render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

    expect(screen.getByText(/Database Heartbeat/i)).toBeInTheDocument();
    expect(screen.getByText(/12ms/i)).toBeInTheDocument();
});

test('renders quick action buttons', () => {
    render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

    // These match the aria-labels
    expect(screen.getByRole('button', { name: /Flush System Cache/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart Core Nodes/i })).toBeInTheDocument();
});
