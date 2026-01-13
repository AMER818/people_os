import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import UserManagement from '../UserManagement';
import React from 'react';

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
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

// Mock dependencies
vi.mock('@store/orgStore', () => ({
  useOrgStore: () => ({
    users: [],
    addUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    addAuditLog: vi.fn(),
    rolePermissions: {},
    togglePermission: vi.fn(),
  }),
  ROLE_HIERARCHY: ['SystemAdmin', 'HRManager', 'Manager', 'Employee'],
  Permission: {},
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@hooks/useModal', () => ({
  useModal: () => ({ isOpen: false, open: vi.fn(), close: vi.fn() }),
}));

vi.mock('@hooks/useSaveEntity', () => ({
  useSaveEntity: () => ({
    formData: {
      username: '',
      name: '',
      email: '',
      role: 'SystemAdmin',
      status: 'Active',
      isSystemUser: false,
    },
    updateField: vi.fn(),
    handleSave: vi.fn(),
    isSaving: false,
    setFormData: vi.fn(),
  }),
}));

vi.mock('@components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@components/ui/Input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@components/ui/Modal', () => ({
  Modal: ({ children, isOpen, title }: any) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));

test('renders UserManagement with permission matrix', () => {
  render(<UserManagement onSync={() => {}} />);

  expect(screen.getByText(/PERMISSION MATRIX/i)).toBeDefined();
  expect(screen.getByText(/Access Control List/i)).toBeDefined();
});

test('renders add administrator button', () => {
  render(<UserManagement onSync={() => {}} />);

  expect(screen.getByRole('button', { name: /Add New Administrator/i })).toBeDefined();
});
