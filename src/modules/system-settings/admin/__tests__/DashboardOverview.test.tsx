import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DashboardOverview from '../DashboardOverview';
import React from 'react';
import { Activity, Shield } from 'lucide-react';

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
    auditLogs: [],
    flushCache: vi.fn(),
    rotateLogs: vi.fn(),
    optimizeDatabase: vi.fn(), // Added missing function
    systemFlags: { neural_bypass: false },
  }),
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

// Mock SystemHealth using the correct alias
vi.mock('@modules/system-health', () => ({
  default: () => <div data-testid="mock-system-health">System Health Dashboard</div>,
}));

// Mock props
const mockSystemHealthData = [
  {
    label: 'Database Heartbeat',
    status: 'Healthy',
    latency: '12ms',
    color: 'success',
    icon: Activity,
  },
  { label: 'Security Firewall', status: 'Active', latency: '0ms', color: 'success', icon: Shield },
];

test('renders DashboardOverview component with core insights', () => {
  render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

  // Use getByText for unique insight headers
  expect(screen.getByText(/System Load Monitor/i)).toBeDefined();
  expect(screen.getByText(/Neural Signal Stream/i)).toBeDefined();
  expect(screen.getByText(/Neural Guard/i)).toBeDefined();
});

test('renders health metrics from props', () => {
  render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

  expect(screen.getByText(/Database Heartbeat/i)).toBeDefined();
  expect(screen.getByText(/12ms/i)).toBeDefined();
});

test('renders quick action buttons', () => {
  render(<DashboardOverview systemHealth={mockSystemHealthData} storageUsage={45} />);

  // These match the aria-labels
  expect(screen.getByRole('button', { name: /Flush System Cache/i })).toBeDefined();
  expect(screen.getByRole('button', { name: /Restart Core Nodes/i })).toBeDefined();
});
