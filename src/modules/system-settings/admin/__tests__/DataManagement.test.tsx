import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DataManagement from '../DataManagement';
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
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
  useOrgStore: () => ({
    users: [],
    apiKeys: [],
    webhooks: [],
  }),
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), toastError: vi.fn(), error: vi.fn() }),
}));

vi.mock('@services/api', () => ({
  api: {
    restoreSystem: vi.fn(),
  },
}));

// Mock URL methods for JSDOM
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

test('renders DataManagement with backup and restore cards', () => {
  render(<DataManagement />);

  expect(screen.getByText(/System Backup/i)).toBeDefined();
  expect(screen.getByText(/System Restore/i)).toBeDefined();
  expect(screen.getByText(/Data Security Note/i)).toBeDefined();
});

test('renders backup and restore buttons', () => {
  render(<DataManagement />);

  // Name matches the aria-label
  expect(screen.getByRole('button', { name: /Create System Backup/i })).toBeDefined();
  expect(screen.getByLabelText(/Upload Backup File/i)).toBeDefined();
});
