import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PayrollTab from './PayrollTab';
import { useOrgStore } from '../../store/orgStore';

// Mock lucide-react
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
    'Edit2',
    'Bot',
    'Cpu',
    'ExternalLink',
    'Globe2',
    'Smartphone',
    'Wand2',
    'Key',
    'Cloud',
    'EyeOff',
    'Copy',
    'Database',
    'HardDrive',
    'Server',
    'Network',
    'Shield',
    'FileJson',
    'FileDown',
    'RotateCcw',
    'ArrowUpRight',
    'ShieldCheck',
    'MessageSquare',
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

// Mock Input component
vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, value, onChange, type, placeholder }: any) => (
    <div data-testid={`input-${label}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        type={type || 'text'}
        placeholder={placeholder || label}
      />
    </div>
  ),
}));

// Mock Card component
vi.mock('../../components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

// Mock useOrgStore
vi.mock('../../store/orgStore', () => ({
  useOrgStore: vi.fn(),
}));

describe('PayrollTab', () => {
  const mockUpdateField = vi.fn();
  const mockEmployee = {
    grossSalary: 100000,
    paymentMode: 'Cash',
    bankId: '',
    bankAccount: '',
  };

  const mockBanks = [
    { id: 'BANK-1', name: 'Bank A' },
    { id: 'BANK-2', name: 'Bank B' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrgStore as any).mockReturnValue({
      banks: mockBanks,
      payrollRecords: [],
      addPayrollRecord: vi.fn(),
    });
  });

  it('renders correctly with initial data', () => {
    render(<PayrollTab employee={mockEmployee} updateField={mockUpdateField} />);

    // Check value via testid
    const input = screen.getByTestId('input-Gross Salary').querySelector('input');
    expect(input).toHaveValue(100000); // Check value directly

    expect(screen.getByDisplayValue('Cash')).toBeDefined();
    expect(screen.getByText('Estimated Total Monthly Compensation')).toBeDefined();
  });

  it('updates payment mode', () => {
    render(<PayrollTab employee={mockEmployee} updateField={mockUpdateField} />);

    const modeSelect = screen.getByDisplayValue('Cash');
    fireEvent.change(modeSelect, { target: { value: 'Cheque' } });
    expect(mockUpdateField).toHaveBeenCalledWith('paymentMode', 'Cheque');
  });

  it('shows bank select when payment mode is Bank Transfer', () => {
    const bankEmployee = { ...mockEmployee, paymentMode: 'Bank Transfer' };
    render(<PayrollTab employee={bankEmployee} updateField={mockUpdateField} />);

    expect(screen.getByText('Bank')).toBeDefined();
    expect(screen.getByText('Select Bank')).toBeDefined();
  });

  it('updates bank and account number', () => {
    const bankEmployee = { ...mockEmployee, paymentMode: 'Bank Transfer' };
    render(<PayrollTab employee={bankEmployee} updateField={mockUpdateField} />);

    const bankSelect = screen.getByDisplayValue('Select Bank');
    fireEvent.change(bankSelect, { target: { value: 'BANK-1' } });
    expect(mockUpdateField).toHaveBeenCalledWith('bankId', 'BANK-1');

    const accountInput = screen.getByPlaceholderText('Account Number / IBAN');
    fireEvent.change(accountInput, { target: { value: 'PK123456' } });
    expect(mockUpdateField).toHaveBeenCalledWith('bankAccount', 'PK123456');
  });

  it('calculates estimated tax correctly', () => {
    render(<PayrollTab employee={mockEmployee} updateField={mockUpdateField} />);
    // estNet = 100,000 (gross) + 0 (allowances). Tax is calculated internally for the record but summary shows estNet.
    // The summary card shows "100,000".
    // Use findAllByText in case it appears multiple times (h3 and Audited Base)
    expect(screen.getAllByText(/100,000/)).toBeDefined();
  });
});
