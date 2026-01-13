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

// Mock lucide-react explicitly
vi.mock('lucide-react', () => {
  const icons = [
    'User',
    'Mail',
    'Phone',
    'CreditCard',
    'MapPin',
    'HeartPulse',
    'Clock',
    'Factory',
    'Sun',
    'UserPlus',
    'UserX',
    'Target',
    'Settings',
    'Eye',
    'Edit3',
    'AlertCircle',
    'Building2',
    'UserCircle',
    'CheckCircle2',
    'ShieldCheck',
    'Edit',
    'LogOut',
    'Trash2',
    'Plus',
    'Search',
    'SearchCode',
    'Filter',
    'Sparkles',
    'FileText',
    'FileSpreadsheet',
    'PartyPopper',
    'Cake',
    'Users',
    'UserCheck',
    'UserMinus',
    'Briefcase',
    'Calendar',
    'CalendarCheck',
    'Fingerprint',
    'CheckCircle',
    'Info',
    'AlertTriangle',
    'X',
    'Save',
    'UserRoundPen',
    'Wallet',
    'Heart',
    'GraduationCap',
    'History',
    'Gavel',
    'Zap',
    'Hash',
    'Printer',
    'Download',
    'Send',
    'Banknote',
    'TrendingUp',
    'ArrowUp',
    'Building',
    'ChevronRight',
    'BrainCircuit',
    'RefreshCw',
    'Award',
    'Star',
    'LayoutDashboard',
    'Bell',
    'Menu',
    'ChevronLeft',
    'Moon',
    'CalendarDays',
    'Clock3',
    'ClipboardCheck',
    'Coins',
    'Receipt',
    'Landmark',
    'PieChart',
    'Activity',
    'FileCheck',
    'ScanFace',
    'Globe',
    'Camera',
    'LayoutGrid',
    'Layout',
    'List',
    'CalendarRange',
    'Ban',
    'Gauge',
    'Loader2',
    'Coffee',
    'FileEdit',
    'Check',
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
    fireEvent.click(screen.getByRole('tab', { name: /Calendar Flux/i }));
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

    fireEvent.click(screen.getByRole('button', { name: /New Request/i }));
    expect(screen.getByRole('heading', { name: /New Request/i })).toBeDefined();

    fireEvent.click(screen.getByTestId('icon-x'));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /New Request/i })).toBeNull();
    });
  });

  it('submits a new leave request', async () => {
    const { container } = render(
      <ToastProvider>
        <Leaves />
      </ToastProvider>
    );

    const buttons = screen.getAllByText(/New Request/i);
    const mainButton = buttons.find((b) => b.tagName === 'BUTTON');
    if (mainButton) {
      fireEvent.click(mainButton);
    }

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
