import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Leaves from '.';
import { api } from '../../services/api';
import { ToastProvider } from '../../components/ui/Toast';

// Mock API
vi.mock('../../services/api', () => ({
  api: {
    getLeaveRequests: vi.fn(),
    getLeaveBalances: vi.fn(),
    saveLeaveRequest: vi.fn(),
    updateLeaveRequestStatus: vi.fn(),
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => {
  const icons = [
    'Plus',
    'Coffee',
    'FileText',
    'Search',
    'Filter',
    'Send',
    'X',
    'AlertTriangle',
    'Download',
    'CalendarRange',
    'Users',
    'LayoutGrid',
    'List',
    'Sparkles',
    'RefreshCw',
    'History',
    'ShieldCheck',
    'Check',
    'Ban',
    'Gauge',
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

describe('Leaves Module', () => {
  const mockRequests = [
    {
      id: 'LR-101',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      type: 'Annual',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      status: 'Pending',
      reason: 'Vacation',
    },
  ];

  const mockBalances = [
    {
      name: 'John Doe',
      total: 20,
      annual: 10,
      sick: 5,
      used: 5,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getLeaveRequests as any).mockResolvedValue(mockRequests);
    (api.getLeaveBalances as any).mockResolvedValue(mockBalances);
  });

  it('renders correctly and loads data', async () => {
    render(
      <ToastProvider>
        <Leaves />
      </ToastProvider>
    );
    expect(screen.getByText('Leave Management')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeDefined();
    });
  });

  it('switches tabs correctly', async () => {
    render(
      <ToastProvider>
        <Leaves />
      </ToastProvider>
    );

    // Default is Ledger (Requests)
    await waitFor(() => expect(screen.getByText('Leave Requests')).toBeDefined());

    // Switch to Matrix (Balances)
    fireEvent.click(screen.getByText('Balances'));
    await waitFor(() => {
      expect(screen.getByText('Leave Balances')).toBeDefined();
    });

    // Switch to Forecast
    fireEvent.click(screen.getByText('AI Forecast'));
    await waitFor(() => {
      expect(screen.getByText('AI Forecasting Active')).toBeDefined();
    });
  });

  it('opens and closes new request modal', async () => {
    render(
      <ToastProvider>
        <Leaves />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('New Request'));
    expect(screen.getByText(/New Request/i)).toBeDefined();

    fireEvent.click(screen.getByTestId('icon-x'));
    await waitFor(() => {
      expect(screen.queryByText(/New Request/i)).toBeNull();
    });
  });

  it('submits a new leave request', async () => {
    const { container } = render(
      <ToastProvider>
        <Leaves />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('New Request'));

    fireEvent.change(screen.getByPlaceholderText('Select Employee...'), {
      target: { value: 'Jane Doe' },
    });

    // Find date input by type using container querySelector
    const dateInput = container.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });
    }

    fireEvent.change(screen.getByPlaceholderText('Describe the reason...'), {
      target: { value: 'Sick leave' },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.saveLeaveRequest).toHaveBeenCalled();
    });
  });
});
