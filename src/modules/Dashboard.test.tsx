import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import Dashboard from './Dashboard';
import { api } from '../services/api';
import { useOrgStore } from '../store/orgStore';

// Mock the store
vi.mock('../store/orgStore', () => ({
    useOrgStore: vi.fn(() => ({
        auditLogs: [
            { id: '1', action: 'NODE_AUTH', user: 'SYS_ADMIN', status: 'Optimal', time: '10:00' }
        ],
    })),
}));

// Mock the UI store
vi.mock('../store/uiStore', () => ({
    useUIStore: vi.fn(() => ({
        setActiveModule: vi.fn(),
    })),
}));

// Mock the API
vi.mock('../services/api', () => ({
    api: {
        getEmployees: vi.fn(),
        getGrowthTrends: vi.fn(),
        getMilestones: vi.fn(),
        getDepartmentStats: vi.fn(),
        getAttendanceStats: vi.fn(),
        getJobs: vi.fn(),
        checkHealth: vi.fn(),
    },
}));

// Mock lucide-react
vi.mock('lucide-react', () => {
    return new Proxy({}, {
        get: (target, prop) => (props: any) => <span data-testid={`icon-${String(prop).toLowerCase()}`} {...props} />
    });
});

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div>Pie</div>,
    Cell: () => <div>Cell</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div>Bar</div>,
}));

describe('Dashboard Component', () => {
    const mockEmployees = [
        { id: '1', name: 'Sarah Jenkins', status: 'Active' },
        { id: '2', name: 'John Doe', status: 'Active' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (api.getEmployees as any).mockResolvedValue(mockEmployees);
        (api.getGrowthTrends as any).mockResolvedValue([{ name: 'Jan', headcount: 10 }]);
        (api.getMilestones as any).mockResolvedValue([{ id: 1, name: 'Alice', type: 'Birthday', date: 'Oct 12', detail: '25th' }]);
        (api.getDepartmentStats as any).mockResolvedValue([{ name: 'IT', count: 5 }]);
        (api.getAttendanceStats as any).mockResolvedValue([{ name: 'Present', value: 80 }]);
        (api.getJobs as any).mockResolvedValue([]);
        (api.checkHealth as any).mockResolvedValue({ status: 'Optimal' });
    });

    it('renders the premium Command Center header', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText(/Command Center/i)).toBeDefined();
            // Workforce Intelligence appears multiple times, so we use getAllByText
            const elements = screen.getAllByText(/Workforce Intelligence/i);
            expect(elements.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('displays Personnel and Node metrics correctly', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            // Total Personnel and Active Identity should both show "2" based on mockEmployees
            const counts = screen.getAllByText('2');
            expect(counts.length).toBeGreaterThanOrEqual(2);
            expect(screen.getByText(/Total Employees/i)).toBeDefined();
            expect(screen.getByText(/Active Employees/i)).toBeDefined();
        });
    });

    it('renders the AI analysis hub', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText(/AI Workforce Intelligence/i)).toBeDefined();
            expect(screen.getByText(/Intelligent Workforce Analytics/i)).toBeDefined();
        });
    });

    it('shows system registry status', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText(/System Registry:/i)).toBeDefined();
            expect(screen.getByText('OPTIMAL')).toBeDefined();
        });
    });

    it('renders charts and activity feed', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText(/Growth Trends/i)).toBeDefined();
            expect(screen.getByText(/Activity Feed/i)).toBeDefined();
        });
    });
});
