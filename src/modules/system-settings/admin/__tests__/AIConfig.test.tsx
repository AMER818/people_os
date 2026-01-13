import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AIConfig from '../AIConfig';
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
    'MessageSquare',
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
    aiSettings: {
      provider: 'gemini',
      apiKeys: { gemini: 'test-key-long-enough', openai: '', anthropic: '' },
      status: 'online',
      agents: { resume_screener: false, turnover_predictor: false, chat_assistant: false },
    },
    updateAiSettings: vi.fn(),
  }),
}));

vi.mock('@components/ui/Toast', () => ({
  useToast: () => ({ success: vi.fn(), toastError: vi.fn(), error: vi.fn() }),
}));

// Mock UI components to simplify DOM for JSDOM
vi.mock('@components/ui/Input', () => ({
  Input: (props: any) => (
    <div data-testid="mock-input">
      <label>{props.label}</label>
      <input {...props} />
    </div>
  ),
  default: (props: any) => (
    <div data-testid="mock-input">
      <label>{props.label}</label>
      <input {...props} />
    </div>
  ),
}));

vi.mock('@components/ui/Button', () => ({
  Button: (props: any) => <button {...props}>{props.children}</button>,
  default: (props: any) => <button {...props}>{props.children}</button>,
}));

test('renders AIConfig component and all its sections', async () => {
  render(<AIConfig />);

  // High-level sections - use findAllByText for elements that might appear multiple times
  expect((await screen.findAllByText(/AI & Intelligence/i)).length).toBeGreaterThan(0);
  expect((await screen.findAllByText(/AI Provider/i)).length).toBeGreaterThan(0);
  expect((await screen.findAllByText(/API Configuration/i)).length).toBeGreaterThan(0);
  expect((await screen.findAllByText(/Intelligence Agents/i)).length).toBeGreaterThan(0);

  // Provider buttons
  expect(await screen.findByRole('button', { name: /Google Gemini/i })).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /OpenAI GPT/i })).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /Anthropic Claude/i })).toBeInTheDocument();

  // Specific buttons/UI from middle of component
  expect(await screen.findByText(/Test Connection/i)).toBeInTheDocument();
  expect(await screen.findByText(/Disable/i)).toBeInTheDocument();

  // Agents at bottom
  expect(await screen.findByText(/Resume Screener/i)).toBeInTheDocument();
  expect(await screen.findByText(/Turnover Predictor/i)).toBeInTheDocument();
});
