import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import APIManager from '../APIManager';
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
    apiKeys: [],
    addApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
    webhooks: [],
    addWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
    simulateWebhookDelivery: vi.fn(),
    addAuditLog: vi.fn(),
  }),
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@hooks/useModal', () => ({
  useModal: () => ({ isOpen: false, open: vi.fn(), close: vi.fn() }),
}));

vi.mock('@hooks/useSaveEntity', () => ({
  useSaveEntity: vi.fn().mockImplementation(({ initialState }) => ({
    formData: initialState,
    updateField: vi.fn(),
    isSaving: false,
    handleSave: vi.fn(),
    setFormData: vi.fn(),
  })),
}));

test('renders APIManager component with core headers', () => {
  render(<APIManager />);

  // Use getByRole for headings which is much more reliable
  expect(screen.getByRole('heading', { name: /Developer/i })).toBeDefined();
  expect(screen.getByRole('heading', { name: /Tokens/i })).toBeDefined();
  expect(screen.getByRole('heading', { name: /Webhooks/i })).toBeDefined();
});

test('shows empty states for tokens and webhooks', () => {
  render(<APIManager />);
  expect(screen.getByText(/No active access tokens/i)).toBeDefined();
  expect(screen.getByText(/No webhooks configured/i)).toBeDefined();
});
