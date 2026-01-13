import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import InfrastructureMonitor from '../InfrastructureMonitor';
import React from 'react';
import { Database, Shield, HardDrive } from 'lucide-react';

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

// Mock props
const mockSystemHealth = [
    { label: 'Database Heartbeat', status: 'Healthy', latency: '12ms', color: 'text-success', icon: Database },
    { label: 'Security Firewall', status: 'Active', latency: '0ms', color: 'text-success', icon: Shield },
    { label: 'Storage Quota', status: 'Normal', latency: '42ms', color: 'text-success', icon: HardDrive },
];

test('renders InfrastructureMonitor with core metrics', () => {
    render(<InfrastructureMonitor systemHealth={mockSystemHealth} storageUsage={45} />);

    // Check for key infrastructure metrics/sections
    expect(screen.getByText(/Database Heartbeat/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage Quota/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Allocation/i)).toBeInTheDocument();
});

test('renders infrastructure control buttons', () => {
    render(<InfrastructureMonitor systemHealth={mockSystemHealth} storageUsage={45} />);

    expect(screen.getByRole('button', { name: /Flush Cache/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rotate Logs/i })).toBeInTheDocument();
});
