import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import InfrastructureMonitor from '../InfrastructureMonitor';
import React from 'react';
import { Database, Shield, HardDrive } from 'lucide-react';

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

vi.mock('@store/orgStore', () => ({
  useOrgStore: () => ({
    auditLogs: [],
    flushCache: vi.fn(),
    rotateLogs: vi.fn(),
    systemFlags: { neural_bypass: false },
    updateSystemFlags: vi.fn(),
  }),
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

// Mock props
const mockSystemHealth = [
  {
    label: 'Database Heartbeat',
    status: 'Healthy',
    latency: '12ms',
    color: 'text-success',
    icon: Database,
  },
  {
    label: 'Security Firewall',
    status: 'Active',
    latency: '0ms',
    color: 'text-success',
    icon: Shield,
  },
  {
    label: 'Storage Quota',
    status: 'Normal',
    latency: '42ms',
    color: 'text-success',
    icon: HardDrive,
  },
];

test('renders InfrastructureMonitor component with active nodes', async () => {
  render(
    <InfrastructureMonitor onSync={() => {}} systemHealth={mockSystemHealth} storageUsage={45} />
  );

  expect(screen.getByText(/Node Infrastructure/i)).toBeDefined();
  expect(screen.getByText(/Resource Allocation/i)).toBeDefined();
  expect(screen.getByText(/Runtime Console/i)).toBeDefined();
});

test('renders infrastructure control buttons', () => {
  render(<InfrastructureMonitor systemHealth={mockSystemHealth} storageUsage={45} />);

  expect(screen.getByRole('button', { name: /Flush Cache/i })).toBeDefined();
  expect(screen.getByRole('button', { name: /Rotate Logs/i })).toBeDefined();
});
