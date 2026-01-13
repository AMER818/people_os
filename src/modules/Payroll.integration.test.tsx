import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PayrollEngine from './PayrollEngine';
import React from 'react';
import { api } from '../services/api';
import { getWorkforceOptimization } from '../services/geminiService';
import { ToastProvider } from '../components/ui/Toast';
// Mocks inlined for stability
const INITIAL_EMPLOYMENT_TYPES = [{ id: 'ET-1', name: 'Permanent', code: 'PERM' }];
const INITIAL_SHIFTS = [{ id: 'SH-1', name: 'Morning', startTime: '09:00', endTime: '17:00' }];

// Mock the services
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  const mockApi = {
    getEmployees: vi.fn(),
    saveEmployee: vi.fn(),
    getExpenses: vi.fn(),
    saveExpense: vi.fn(),
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
}));

describe('Payroll Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the payroll dashboard structure', () => {
    render(
      <ToastProvider>
        <PayrollEngine />
      </ToastProvider>
    );
    expect(screen.getByText('Fiscal Terminal')).toBeDefined();
    expect(screen.getByText('Execute P-Cycle')).toBeDefined();
  });

  it('filters the payroll ledger based on search input', async () => {
    render(
      <ToastProvider>
        <PayrollEngine />
      </ToastProvider>
    );
    const searchInput = screen.getByPlaceholderText('Search Employees...');

    fireEvent.change(searchInput, { target: { value: 'Sarah' } });

    // Assuming Sarah Jenkins is in the initial ledger
    expect(screen.getByText('Sarah Jenkins')).toBeDefined();

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.queryByText('Sarah Jenkins')).toBeNull();
  });

  it('executes the payroll cycle and updates status', async () => {
    render(
      <ToastProvider>
        <PayrollEngine />
      </ToastProvider>
    );
    const executeButton = screen.getByText('Execute P-Cycle');

    fireEvent.click(executeButton);

    expect(screen.getByText('Processing: 0%')).toBeDefined();

    // Wait for processing to complete (simulated by progress bar reaching 100%)
    await waitFor(
      () => {
        expect(screen.queryByText(/Processing:/)).toBeNull();
      },
      { timeout: 5000 }
    );

    // After processing, it should show 'Execute P-Cycle' again or some finished state
    expect(screen.getByText('Execute P-Cycle')).toBeDefined();
  });

  it('opens and closes the bonus allocation modal', () => {
    render(
      <ToastProvider>
        <PayrollEngine />
      </ToastProvider>
    );
    const bonusButton = screen.getByText('Variable Pay');

    fireEvent.click(bonusButton);
    expect(screen.getByText('Log Variable Pay')).toBeDefined();

    const closeButton = screen.getByTestId('icon-x');
    fireEvent.click(closeButton);
    expect(screen.queryByText('Log Variable Pay')).toBeNull();
  });
});
