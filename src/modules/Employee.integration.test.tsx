import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import Employee from './employee/index';
import React from 'react';
import { api } from '../services/api';
import { getWorkforceOptimization } from '../services/geminiService';

// Mocks inlined for stability
const INITIAL_EMPLOYMENT_LEVELS = [{ id: 'ET-1', name: 'Permanent', code: 'PERM' }];
const INITIAL_SHIFTS = [{ id: 'SH-1', name: 'Morning', startTime: '09:00', endTime: '17:00' }];

// Mock the services
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  const mockApi = {
    getEmployees: vi.fn(),
    saveEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDesignations: vi.fn().mockResolvedValue([]),
    getGrades: vi.fn().mockResolvedValue([]),
    getDepartments: vi.fn().mockResolvedValue([]),
    getSubDepartments: vi.fn().mockResolvedValue([]),
    getHRPlants: vi.fn().mockResolvedValue([]),
    getShifts: vi.fn().mockResolvedValue([]),
    getDistricts: vi.fn().mockResolvedValue([]),
    getPayrollSettings: vi.fn().mockResolvedValue({}),
    getUsers: vi.fn().mockResolvedValue([]),
    getJobLevels: vi.fn().mockResolvedValue([]),
  };
  return {
    ...actual,
    api: mockApi,
    default: mockApi,
  };
});

vi.mock('../services/geminiService', () => {
  const Icon = (props: any) => <div data-testid="icon-award" {...props} />;
  return {
    getWorkforceOptimization: vi.fn().mockResolvedValue({
      suggestions: [{ icon: Icon, message: 'Test Suggestion', type: 'success' }],
    }),
    testGeminiConnection: vi.fn(),
    getFastInsight: vi.fn(),
    getDeepAudit: vi.fn(),
    parseResumeAI: vi.fn(),
    getChatResponse: vi.fn(),
    analyzeCandidateProfile: vi.fn(),
    predictTurnover: vi.fn(),
  };
});

// Mock useOrgStore
vi.mock('@store/orgStore', () => {
  const state = {
    currentUser: { role: 'SystemAdmin' },
    shifts: [],
    departments: [],
    designations: [],
    grades: [],
    subDepartments: [],
    hrPlantsList: [],
    plants: [],
    employmentLevels: [],
    profile: { name: 'Test Org' },
    aiSettings: { apiKeys: {} },
    payrollRecords: [],
    banks: [],
    addPayrollRecord: vi.fn(),
    fetchMasterData: vi.fn(),
    fetchProfile: vi.fn(),
    syncProfileStatus: vi.fn(),
  };

  const hook = Object.assign((selector?: any) => (selector ? selector(state) : state), {
    getState: () => state,
    setState: vi.fn(),
    subscribe: vi.fn(),
  });

  return { useOrgStore: hook };
});
vi.mock('../store/orgStore', () => {
  const state = {
    currentUser: { role: 'SystemAdmin' },
    shifts: [],
    departments: [],
    designations: [],
    grades: [],
    subDepartments: [],
    hrPlantsList: [],
    plants: [],
    employmentLevels: [],
    profile: { name: 'Test Org' },
    aiSettings: { apiKeys: {} },
    payrollRecords: [],
    banks: [],
    addPayrollRecord: vi.fn(),
    fetchMasterData: vi.fn(),
    fetchProfile: vi.fn(),
    syncProfileStatus: vi.fn(),
  };

  const hook = Object.assign((selector?: any) => (selector ? selector(state) : state), {
    getState: () => state,
    setState: vi.fn(),
    subscribe: vi.fn(),
  });

  return { useOrgStore: hook };
});

// Mock lucide-react explicitly with a massive list to avoid Proxy hangs
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
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <div data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
}));

const mockEmployees = [
  {
    id: 'ABC01-0001',
    employeeCode: 'ABC01-0001',
    name: 'John Doe',
    department: 'Engineering',
    designation: 'Software Engineer',
    grade: 'M6',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/1/200',
    dob: '1990-01-01',
    dateOfBirth: '1990-01-01',
    maritalStatus: 'Single',
    joiningDate: '2020-01-01',
    grossSalary: 150000,
    gender: 'Male',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Karachi',
    country: 'Pakistan',
    education: [],
    experience: [],
    family: [],
    increments: [{ id: '1', date: '2021-01-01', amount: 10000, reason: 'Annual' }],
    discipline: [],
  },
];

describe('Employee Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getEmployees as any).mockResolvedValue(mockEmployees);
  });

  it('renders the basic structure', () => {
    render(<Employee />);
    expect(screen.getByText('Employee Management')).toBeDefined();
  });

  it('renders the employee list and allows selecting an employee', async () => {
    render(<Employee />);

    // Wait specifically for John Doe to appear
    const johnDoeText = await screen.findByText(/John Doe/i);
    const row = johnDoeText.closest('tr');

    if (!row) {
      throw new Error('Row not found');
    }

    fireEvent.click(row);

    await screen.findByText('ACTIVE THREAD');
    expect(screen.getByDisplayValue('John Doe')).toBeDefined();
  });

  it('allows switching tabs in master view', async () => {
    render(<Employee />);

    // Wait specifically for John Doe to appear
    const johnDoeText = await screen.findByText(/John Doe/i);
    const row = johnDoeText.closest('tr');
    if (!row) {
      throw new Error('Row not found');
    }

    fireEvent.click(row);

    await screen.findByText('Employee Info');

    // Tab label for Financials is actually 'Benefits'
    fireEvent.click(screen.getByText('Benefits'));

    await screen.findByText('Estimated Total Monthly Compensation');
  });

  it('triggers AI analysis when entering master view', async () => {
    render(<Employee />);

    // Wait specifically for John Doe to appear
    const johnDoeText = await screen.findByText(/John Doe/i);
    const row = johnDoeText.closest('tr');
    if (!row) {
      throw new Error('Row not found');
    }

    fireEvent.click(row);

    // AI Suggestions might take a moment to appear
    await screen.findByText('Test Suggestion', {}, { timeout: 3000 });
    expect(getWorkforceOptimization).toHaveBeenCalled();
  });
});
