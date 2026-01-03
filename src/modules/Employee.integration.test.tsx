import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Employee from './Employee';
import React from 'react';
import { api } from '../services/api';
import { getWorkforceOptimization } from '../services/geminiService';
import { ToastProvider } from '../components/ui/toast';
// Mocks inlined for stability
const INITIAL_EMPLOYMENT_TYPES = [{ id: 'ET-1', name: 'Permanent', code: 'PERM' }];
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
    getEmploymentTypes: vi.fn().mockResolvedValue([]),
  };
  return {
    ...actual,
    api: mockApi,
    default: mockApi,
  };
});

vi.mock('../services/geminiService', () => ({
  getWorkforceOptimization: vi.fn(),
  testGeminiConnection: vi.fn(),
  getFastInsight: vi.fn(),
  getDeepAudit: vi.fn(),
  parseResumeAI: vi.fn(),
  getChatResponse: vi.fn(),
  analyzeCandidateProfile: vi.fn(),
  predictTurnover: vi.fn(),
}));

// Mock useOrgStore
vi.mock('../store/orgStore', () => {
  const updateAiSettings = vi.fn();
  const mockState = {
    shifts: [],
    profile: {},
    departments: [],
    grades: [],
    holidays: [],
    banks: [],
    users: [],
    systemFlags: {},
    aiSettings: { apiKeys: {} },
    rbacMatrix: [],
    auditLogs: [],
    complianceSettings: {},
    updateAiSettings,
    fetchMasterData: vi.fn(),
    designations: [],
    subDepartments: [],
    hrPlantsList: [],
    shiftsList: [],
    districtsList: [],
    employmentTypesList: [],
  };

  const mockOrgStore = () => mockState;
  mockOrgStore.getState = () => mockState;
  mockOrgStore.setState = vi.fn();
  mockOrgStore.subscribe = vi.fn();

  return {
    useOrgStore: mockOrgStore,
  };
});

// Mock lucide-react
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => (props: any) => <span data-testid={`icon-${String(prop).toLowerCase()}`} {...props} />
  });
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
    maritalStatus: 'Single',
    joiningDate: '2020-01-01',
    grossSalary: 150000,
    family: [],
    education: [],
    experience: [],
    increments: [],
    discipline: [],
  },
];

describe('Employee Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getEmployees as any).mockResolvedValue(mockEmployees);
    (getWorkforceOptimization as any).mockResolvedValue({
      suggestions: [{ id: 1, text: 'Test Suggestion', type: 'info', priority: 'Low' }],
    });
  });

  it('renders the basic structure', () => {
    render(
      <ToastProvider>
        <Employee />
      </ToastProvider>
    );
    expect(screen.getByText('Employee Management')).toBeDefined();
  });

  it('renders the employee list and allows selecting an employee', async () => {
    render(
      <ToastProvider>
        <Employee />
      </ToastProvider>
    );

    // Wait specifically for the table cell containing John Doe to appear
    const johnDoeCell = await screen.findByRole('cell', { name: /John Doe/i });
    const row = johnDoeCell.closest('tr');


    if (!row) { throw new Error('Row not found'); }

    fireEvent.click(row);

    await screen.findByText('NODE SYNCHRONIZED');
    expect(screen.getByDisplayValue('John Doe')).toBeDefined();
  });

  it('allows switching tabs in master view', async () => {
    render(
      <ToastProvider>
        <Employee />
      </ToastProvider>
    );

    // Wait specifically for the table cell containing John Doe to appear
    const johnDoeCell = await screen.findByRole('cell', { name: /John Doe/i });
    const row = johnDoeCell.closest('tr');
    if (!row) { throw new Error('Row not found'); }

    fireEvent.click(row);

    await screen.findByText('Employee Info');

    fireEvent.click(screen.getByText('Financials'));

    await screen.findByText('Estimated Net Disbursement');
  });

  it('triggers AI analysis when entering master view', async () => {
    render(
      <ToastProvider>
        <Employee />
      </ToastProvider>
    );

    // Wait specifically for the table cell containing John Doe to appear
    const johnDoeCell = await screen.findByRole('cell', { name: /John Doe/i });
    const row = johnDoeCell.closest('tr');
    if (!row) { throw new Error('Row not found'); }

    fireEvent.click(row);

    await screen.findByText('Test Suggestion');
    expect(getWorkforceOptimization).toHaveBeenCalled();
  });
});
