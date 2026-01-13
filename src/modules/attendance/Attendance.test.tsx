import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Attendance from '.';
import { api } from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
  api: {
    getAttendanceRecords: vi.fn(),
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

describe('Attendance Module', () => {
  const mockRecords = [
    {
      id: 'ATT-1',
      name: 'John Doe',
      code: 'EMP001',
      shift: 'A',
      inTime: '09:00',
      outTime: '17:00',
      status: 'Present',
      verification: 'Facial',
      location: 'Office',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getAttendanceRecords as any).mockResolvedValue(mockRecords);
  });

  it('renders correctly and loads data', async () => {
    render(<Attendance />);
    expect(screen.getByText('Attendance')).toBeDefined();
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeDefined();
    });
  });

  it('switches tabs correctly', async () => {
    render(<Attendance />);

    // Default is Daily Log
    await waitFor(() => expect(screen.getByText('Daily Attendance Log')).toBeDefined());

    // Switch to Attendance Matrix
    fireEvent.click(screen.getByRole('tab', { name: /Attendance Matrix/i }));
    await waitFor(() =>
      expect(screen.getAllByText(/Attendance Matrix/i).length).toBeGreaterThan(1)
    );

    // Switch to Shift Roster
    fireEvent.click(screen.getByText('Shift Roster'));
    await waitFor(() => expect(screen.getByText('Shift Assignments')).toBeDefined());

    // Switch to Corrections
    fireEvent.click(screen.getByText('Corrections'));
    await waitFor(() => expect(screen.getByText('Manual Corrections')).toBeDefined());
  });
});
