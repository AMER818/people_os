import {
  Employee as EmployeeType,
  OrganizationProfile,
  Expense,
  VisitorNode,
  Candidate,
  Goal,
  NewHireNode,
  ExitNode,
  LeaveRequest,
  LeaveBalance,
  AttendanceRecord,
  Asset,
  JobVacancy,
  Course,
  BenefitEnrollment,
  BenefitTier,
  GrowthTrend,
  Milestone,
  AuditLog,
  BusinessRule,
  Shift,
  PayrollSettings,
  Grade,
  Designation,
  EmploymentLevel,
  DepartmentStat,
  AttendanceStat,
  Holiday,
  Bank,
  SystemFlags,
  AISettings,
} from '../types';
// Mock data imports removed to enforce strict backend dependency
import { RateLimiter } from '../utils/security';
import { GovernanceEngine } from '@/system/GovernanceEngine';
import { useSystemStore } from '@/system/systemStore';
import { secureStorage } from '@/utils/secureStorage';

const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  overtimeEnabled: true,
  taxYearEnd: 'June',
  currency: 'PKR',
  calculationMethod: 'Per Month',
  customFormulas: {
    staff: 'Gross salary / month days * working days + allowances - deductions = net payment',
    worker: 'Gross salary / 26 days * working days + allowances - deductions = net payment',
  },
  overtime: {
    routine: {
      staff: 'Gross salary / month days / 8 * working hours',
      worker: 'Gross salary / 26 / 8 * working hours',
    },
    gazetteHoliday: {
      staff: 'Gross salary / month days / 8 * working hours * 2',
      worker: 'Gross salary / 26 / 8 * working hours * 2',
    },
  },
};
// Mock data imports removed for production integration

import Logger from '../utils/logger';

// const DATA_VERSION = '1.7'; // Synced with App.tsx to prevent reload loop

class ApiService {
  private async governanceIntercept(action: string, domain: string): Promise<void> {
    const decision = GovernanceEngine.evaluate({
      source: domain,
      message: action,
      risk: 'high',
    } as any);

    if (decision.reason.includes('Blocked')) {
      decision.intercepted = true;
      // Ingest into system store for visibility
      useSystemStore.getState().ingestSignal({
        source: domain,
        message: action,
        risk: 'critical',
        metadata: { intercepted: true },
      });
      throw new Error(`GOVERNANCE BLOCK: ${decision.reason}. ${decision.remediation}`);
    }
  }

  private employees: EmployeeType[] = [];
  private expenses: Expense[] = [];
  private visitors: VisitorNode[] = [];
  private candidates: Candidate[] = [];
  private goals: Goal[] = [];
  private hires: NewHireNode[] = [];
  private exits: ExitNode[] = [];
  private leaves: LeaveRequest[] = [];
  private leaveBalances: LeaveBalance[] = [];
  private attendance: AttendanceRecord[] = [];
  private assets: Asset[] = [];
  private jobs: JobVacancy[] = [];
  private courses: Course[] = [];
  private benefitEnrollments: BenefitEnrollment[] = [];
  private benefitTiers: BenefitTier[] = [];
  private growthTrends: GrowthTrend[] = [];
  private milestones: Milestone[] = [];
  private logs: AuditLog[] = [];
  private rules: BusinessRule[] = [];
  private grades: Grade[] = [];
  private designations: Designation[] = [];
  private rateLimiter: RateLimiter;
  private apiUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.authToken = secureStorage.getItem('token');

    // One-time cache clear to ensure migration to DB-only source.
    if (!secureStorage.getItem('clean_slate_verified')) {
      Logger.info('Enforcing clean slate. Clearing local cache...');
      const token = this.authToken;
      const dataVersion = secureStorage.getItem('data_version');
      secureStorage.clear();
      if (token) {
        secureStorage.setItem('token', token);
      }
      if (dataVersion) {
        secureStorage.setItem('data_version', dataVersion);
      }
      secureStorage.setItem('clean_slate_verified', 'true');
    }

    // Version check removed to prevent conflict.
    // System now strictly relies on Backend.

    // Try to load from sessionStorage, fallback to mock data
    // Data strict initialization
    this.employees = [];

    this.expenses = [];

    this.visitors = [];

    // Mock data initialization removed.
    // All data must come from Backend API.

    // Manual initialization for payrollSettings since initData expects an array
  }

  public setRateLimit(max: number): void {
    Logger.info(`Adjusting network throughput: ${max} req/min`);
    this.rateLimiter.setMaxRequests(max);
  }

  public getRateLimit(): number {
    return this.rateLimiter.getMaxRequests();
  }

  /**
   * Enforce rate limiting for API calls
   * Throws an error if rate limit is exceeded
   */
  private enforceRateLimit(): void {
    if (!this.rateLimiter.canMakeRequest()) {
      const remainingTime = this.rateLimiter.getRemainingTime();
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(remainingTime / 1000)} seconds before making another request.`
      );
    }
  }

  // Helper for testing to reset state
  public resetForTesting() {
    Logger.info('Resetting API state to empty.');
    this.employees = [];
    this.expenses = [];
    this.visitors = [];
    this.candidates = [];
    this.goals = [];
    this.hires = [];
    this.exits = [];
    this.leaves = [];
    this.leaveBalances = [];
    this.attendance = [];
    this.assets = [];
    this.jobs = [];
    this.courses = [];
    this.benefitEnrollments = [];
    this.benefitTiers = [];
    this.growthTrends = [];
    this.milestones = [];
    this.logs = [];
    this.milestones = [];
    this.logs = [];
    this.rules = [];
    sessionStorage.clear();
    secureStorage.clear();
  }

  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(this.rateLimiter.getRemainingTime() / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...options.headers,
    };

    const startTime = performance.now();
    const method = options.method || 'GET';
    Logger.debug(`[request] Starting ${method} ${url}`);

    try {
      const response = await fetch(url, { ...options, headers });
      const duration = performance.now() - startTime;
      Logger.debug(
        `[request] Completed ${method} ${url} in ${duration.toFixed(0)}ms, status: ${response.status}`
      );

      if (response.status === 401) {
        Logger.warn('Unauthorized access detected. Session invalid. Logging out...');
        this.logout();
        // Dispatch simplified event for App.tsx to handle redirect without reload loop
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired');
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(
        `[request] Failed ${method} ${url} after ${duration.toFixed(0)}ms: ${errorName} - ${errorMsg}`
      );

      // Log stack trace for AbortError for debugging
      if (error instanceof Error && error.name === 'AbortError') {
        Logger.error(`[request] AbortError stack: ${error.stack}`);
      }

      throw error;
    }
  }

  public async post(endpoint: string, data?: any): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData, status: response.status } };
    }
    return response.json();
  }

  public async get(endpoint: string): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    const response = await this.request(url, { method: 'GET' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData, status: response.status } };
    }
    return response.json();
  }

  async checkHealth(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      return await this.get('/health');
    } catch (error) {
      console.error('Health check failed', error);
      return { status: 'Offline', database: 'Disconnected', timestamp: new Date().toISOString() };
    }
  }

  async login(username: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Backend login failed');
      }

      const data = await response.json();
      if (data.access_token) {
        this.authToken = data.access_token;
        const storageType = rememberMe ? 'local' : 'session';
        secureStorage.setItem('token', data.access_token, storageType);

        // Store the full user object returned from backend
        if (data.user) {
          secureStorage.setItem('current_user', JSON.stringify(data.user), storageType);
        }
        return true;
      }
      return false;
    } catch (e) {
      Logger.error('Login failed or backend unavailable (Strict Mode)', String(e));
      throw e;
    }
  }

  logout() {
    this.authToken = null;
    secureStorage.removeItem('token');
    secureStorage.removeItem('current_user');
  }

  // --- Users & RBAC ---
  async getUsers(): Promise<any[]> {
    const response = await this.request(`${this.apiUrl}/users`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveUser(user: any): Promise<any> {
    const response = await this.request(`${this.apiUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to save user');
    }
    return await response.json();
  }

  async updateUser(id: string, user: any): Promise<any> {
    const response = await this.request(`${this.apiUrl}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return await response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.request(`${this.apiUrl}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to delete user';
      throw new Error(errorMessage);
    }
  }

  // --- Employees ---
  async getEmployees(): Promise<EmployeeType[]> {
    try {
      const response = await this.request(`${this.apiUrl}/employees`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      this.employees = data;
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty array for employees', error);
      this.employees = [];
      return [];
    }
  }

  async getDepartmentStats(): Promise<DepartmentStat[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return empty stats if backend not implemented
        resolve([]);
      }, 600);
    });
  }

  async getAttendanceStats(): Promise<AttendanceStat[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return empty stats if backend not implemented
        resolve([]);
      }, 600);
    });
  }

  // --- Master Data (Mock) ---
  // --- Organization & Master Data ---

  // --- Holidays ---
  async getHolidays(): Promise<Holiday[]> {
    const response = await this.request(`${this.apiUrl}/holidays`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveHoliday(holiday: Holiday): Promise<Holiday> {
    this.enforceRateLimit();
    const method = holiday.id ? 'PUT' : 'POST';
    const url = holiday.id ? `${this.apiUrl}/holidays/${holiday.id}` : `${this.apiUrl}/holidays`;

    // Convert id if it's currently a number (time.now) to undefined for creation if needed,
    // but backend expects string ID for updates.
    // If it's a number from Date.now(), it's a client ID, so we should probably treat it as new for backend if it doesn't exist?
    // Actually, OrgSetup.tsx creates with Date.now() ID.
    // I will fix OrgSetup to NOT send ID for new items.

    const response = await this.request(url, {
      method,
      body: JSON.stringify(holiday),
    });

    if (!response.ok) {
      throw new Error('Failed to save holiday');
    }
    return await response.json();
  }

  async deleteHoliday(id: string | number): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/holidays/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete holiday');
    }
  }

  // --- Banks ---
  async getBanks(): Promise<Bank[]> {
    const response = await this.request(`${this.apiUrl}/banks`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveBank(bank: Bank): Promise<Bank> {
    this.enforceRateLimit();
    const method = bank.id ? 'PUT' : 'POST';
    const url = bank.id ? `${this.apiUrl}/banks/${bank.id}` : `${this.apiUrl}/banks`;

    const response = await this.request(url, {
      method,
      body: JSON.stringify(bank),
    });

    if (!response.ok) {
      throw new Error('Failed to save bank');
    }
    return await response.json();
  }

  async deleteBank(id: string): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/banks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete bank');
    }
  }

  async getDistricts(): Promise<any[]> {
    return [];
  }

  async getSystemFlags(): Promise<SystemFlags> {
    const response = await this.request(`${this.apiUrl}/system/flags`);
    if (!response.ok) {
      throw new Error('Failed to fetch system flags');
    }
    return await response.json();
  }

  async updateSystemFlags(flags: Partial<SystemFlags>): Promise<SystemFlags> {
    try {
      const response = await this.request(`${this.apiUrl}/system/flags`, {
        method: 'POST',
        body: JSON.stringify(flags),
      });
      if (!response.ok) {
        throw new Error('Failed to update system flags');
      }
      return await response.json();
    } catch (e) {
      console.warn('Backend unavailable, saving system flags to LocalStorage');
      localStorage.setItem('system_flags', JSON.stringify(flags));
      // Return merged flags (mock)
      return { neural_bypass: false, ...flags } as SystemFlags;
    }
  }

  async getRolePermissions(): Promise<Record<string, string[]>> {
    const response = await this.request(`${this.apiUrl}/rbac/permissions`);
    if (!response.ok) {
      return {};
    }
    return await response.json();
  }

  async updateRolePermissions(role: string, permissions: string[]): Promise<string[]> {
    const response = await this.request(`${this.apiUrl}/rbac/permissions`, {
      method: 'POST',
      body: JSON.stringify({ role, permissions }),
    });
    if (!response.ok) {
      throw new Error('Failed to update role permissions');
    }
    return await response.json();
  }

  async getShifts(): Promise<Shift[]> {
    const response = await this.request(`${this.apiUrl}/shifts`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveShift(shift: Shift): Promise<Shift> {
    this.enforceRateLimit();
    const method = shift.id ? 'PUT' : 'POST';
    const url = shift.id ? `${this.apiUrl}/shifts/${shift.id}` : `${this.apiUrl}/shifts`;

    const response = await this.request(url, {
      method,
      body: JSON.stringify(shift),
    });

    if (!response.ok) {
      throw new Error('Failed to save shift');
    }
    return await response.json();
  }

  async updateShift(id: string, shift: Partial<Shift>): Promise<Shift> {
    return this.saveShift({ ...shift, id } as Shift);
  }

  async deleteShift(id: string): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/shifts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete shift');
    }
  }

  async getPayrollSettings(): Promise<PayrollSettings> {
    const response = await this.request(`${this.apiUrl}/payroll-settings`);
    if (!response.ok) {
      return DEFAULT_PAYROLL_SETTINGS;
    }
    return await response.json();
  }

  async savePayrollSettings(settings: PayrollSettings): Promise<void> {
    const response = await this.request(`${this.apiUrl}/payroll-settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to save payroll settings');
    }
  }

  async saveEmployee(employee: EmployeeType): Promise<EmployeeType> {
    this.enforceRateLimit();
    await this.governanceIntercept(`Save Employee: ${employee.name}`, 'HCM_API');
    try {
      const exists = this.employees.some((e) => e.id === employee.id);
      const method = exists ? 'PUT' : 'POST';
      const url = exists ? `${this.apiUrl}/employees/${employee.id}` : `${this.apiUrl}/employees`;

      const response = await this.request(url, {
        method: method,
        body: JSON.stringify(employee),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const savedEmployee = await response.json();
      // Update local memory only
      const index = this.employees.findIndex((e) => e.id === savedEmployee.id);
      if (index !== -1) {
        this.employees[index] = savedEmployee;
      } else {
        this.employees.push(savedEmployee);
      }
      return savedEmployee;
    } catch (error) {
      Logger.error('Failed to save employee to backend', error);
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    this.enforceRateLimit();
    await this.governanceIntercept(`Delete Employee: ${id}`, 'HCM_API');
    try {
      const response = await this.request(`${this.apiUrl}/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      // Update local state
      this.employees = this.employees.filter((e) => e.id !== id);
    } catch (error) {
      Logger.error('Failed to delete from backend', error);
      throw error;
    }
  }

  // --- Expenses ---
  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await this.request(`${this.apiUrl}/expenses`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      this.expenses = data;
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty array for expenses', error);
      this.expenses = [];
      return [];
    }
  }

  async saveExpense(expense: Expense): Promise<void> {
    return new Promise((resolve) => {
      const index = this.expenses.findIndex((e) => e.id === expense.id);
      if (index !== -1) {
        this.expenses[index] = expense;
      } else {
        this.expenses.push(expense);
      }
      secureStorage.setItem('expenses', JSON.stringify(this.expenses));
      setTimeout(resolve, 500);
    });
  }

  async deleteExpense(id: string): Promise<void> {
    const response = await this.request(`${this.apiUrl}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }

  async updateExpenseStatus(id: string, status: Expense['status']): Promise<void> {
    const response = await this.request(`${this.apiUrl}/expenses/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update expense status');
    }

    const expense = this.expenses.find((e) => e.id === id);
    if (expense) {
      expense.status = status;
    }
  }

  // --- Visitors ---
  async getVisitors(): Promise<VisitorNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.visitors), 500);
    });
  }

  async saveVisitor(visitor: VisitorNode): Promise<void> {
    return new Promise((resolve) => {
      const index = this.visitors.findIndex((v) => v.id === visitor.id);
      if (index !== -1) {
        this.visitors[index] = visitor;
      } else {
        this.visitors.unshift(visitor); // Add to top
      }
      setTimeout(resolve, 500);
    });
  }

  async updateVisitorStatus(
    id: string,
    status: VisitorNode['status'],
    checkOutTime?: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const index = this.visitors.findIndex((v) => v.id === id);
      if (index !== -1) {
        this.visitors[index].status = status;
        if (checkOutTime) {
          this.visitors[index].checkOut = checkOutTime;
        }
      }
      setTimeout(resolve, 500);
    });
  }

  async deleteVisitor(id: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // If backend call was successful, update local state
      this.visitors = this.visitors.filter((v) => v.id !== id);
    } catch (error) {
      Logger.warn('Backend unavailable, deleting visitor failed', error);
      const filtered = this.visitors.filter((v) => v.id !== id);
      this.visitors = filtered;
    }
  }

  // --- Candidates ---
  async getCandidates(): Promise<Candidate[]> {
    try {
      const response = await this.request(`${this.apiUrl}/candidates`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning local/empty data', error);
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.candidates), 500);
      });
    }
  }

  async saveCandidate(candidate: Candidate): Promise<void> {
    this.enforceRateLimit();
    try {
      // Check if exists
      const exists = this.candidates.some((c) => c.id === candidate.id);

      const method = exists ? 'PUT' : 'POST';
      const url = exists
        ? `${this.apiUrl}/candidates/${candidate.id}`
        : `${this.apiUrl}/candidates`;

      // Handling skills array to string conversion if needed by Backend?
      // Our backend now handles commas, but Pydantic expects list[str].
      // The frontend sends JSON, Pydantic parses.
      // The backend CRUD manually joins it. Ideally, we send list, backend receives Pydantic list.
      // It should work direct.

      const response = await this.request(url, {
        method: method,
        body: JSON.stringify(candidate),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const savedCandidate = await response.json();

      // Update local state
      const index = this.candidates.findIndex((c) => c.id === savedCandidate.id);
      if (index !== -1) {
        this.candidates[index] = savedCandidate;
      } else {
        this.candidates.unshift(savedCandidate);
      }
    } catch (error) {
      Logger.error('Failed to save candidate to backend', error);
    }
  }

  async updateCandidateStage(id: string, stage: Candidate['currentStage']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.candidates.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.candidates[index].currentStage = stage;
      }
      setTimeout(resolve, 500);
    });
  }

  async deleteCandidate(id: string): Promise<void> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      this.candidates = this.candidates.filter((c) => c.id !== id);
    } catch (error) {
      Logger.error('Failed to delete candidate from backend', error);
    }
  }

  // --- Goals ---
  async getGoals(): Promise<Goal[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.goals), 500);
    });
  }

  async saveGoal(goal: Goal): Promise<void> {
    return new Promise((resolve) => {
      const index = this.goals.findIndex((g) => g.id === goal.id);
      if (index !== -1) {
        this.goals[index] = goal;
      } else {
        this.goals.push(goal);
      }
      setTimeout(resolve, 500);
    });
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // If backend call was successful, update local state
      this.goals = this.goals.filter((g) => g.id !== id);
    } catch (error) {
      Logger.warn('Backend unavailable, deletion failed', error);
    }
  }

  // --- Hires ---
  async getHires(): Promise<NewHireNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.hires), 500);
    });
  }

  async saveHire(hire: NewHireNode): Promise<void> {
    return new Promise((resolve) => {
      const index = this.hires.findIndex((h) => h.id === hire.id);
      if (index !== -1) {
        this.hires[index] = hire;
      } else {
        this.hires.unshift(hire);
      }
      setTimeout(resolve, 500);
    });
  }

  async updateHireStep(hireId: string, stepId: string): Promise<void> {
    return new Promise((resolve) => {
      const index = this.hires.findIndex((h) => h.id === hireId);
      if (index !== -1) {
        const hire = this.hires[index];
        const newSteps = hire.steps.map((step) =>
          step.id === stepId ? { ...step, done: !step.done } : step
        );
        const doneCount = newSteps.filter((s) => s.done).length;
        const newProgress = Math.round((doneCount / newSteps.length) * 100);

        this.hires[index] = { ...hire, steps: newSteps, progress: newProgress };
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Exits ---
  async getExits(): Promise<ExitNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.exits), 500);
    });
  }

  async saveExit(exit: ExitNode): Promise<void> {
    return new Promise((resolve) => {
      const index = this.exits.findIndex((e) => e.id === exit.id);
      if (index !== -1) {
        this.exits[index] = exit;
      } else {
        this.exits.unshift(exit);
      }
      setTimeout(resolve, 500);
    });
  }

  async updateExitChecklist(exitId: string, itemId: string): Promise<void> {
    return new Promise((resolve) => {
      const index = this.exits.findIndex((e) => e.id === exitId);
      if (index !== -1) {
        const exit = this.exits[index];
        const newChecklist = exit.checklist.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        );
        const doneCount = newChecklist.filter((i) => i.done).length;
        const newStatus = doneCount === newChecklist.length ? 'Cleared' : 'In Progress';

        this.exits[index] = { ...exit, checklist: newChecklist, status: newStatus as any };
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Leaves ---
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.leaves), 500);
    });
  }

  async saveLeaveRequest(request: LeaveRequest): Promise<void> {
    return new Promise((resolve) => {
      const index = this.leaves.findIndex((r) => r.id === request.id);
      if (index !== -1) {
        this.leaves[index] = request;
      } else {
        this.leaves.unshift(request);
      }
      setTimeout(resolve, 500);
    });
  }

  async updateLeaveRequestStatus(id: string, status: LeaveRequest['status']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.leaves.findIndex((r) => r.id === id);
      if (index !== -1) {
        this.leaves[index].status = status;
      }
      setTimeout(resolve, 500);
    });
  }

  async getLeaveBalances(): Promise<LeaveBalance[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.leaveBalances), 500);
    });
  }

  // --- Attendance ---
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const response = await this.request(`${this.apiUrl}/attendance`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty data', error);
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.attendance), 500);
      });
    }
  }

  async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    this.enforceRateLimit();
    try {
      const exists = this.attendance.some((r) => r.id === record.id);
      const method = exists ? 'PUT' : 'POST';
      const url = exists ? `${this.apiUrl}/attendance/${record.id}` : `${this.apiUrl}/attendance`;

      const response = await this.request(url, {
        method: method,
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const savedRecord = await response.json();
      const index = this.attendance.findIndex((r) => r.id === savedRecord.id);
      if (index !== -1) {
        this.attendance[index] = savedRecord;
      } else {
        this.attendance.unshift(savedRecord);
      }
    } catch (error) {
      Logger.error('Failed to save attendance to backend', error);
    }
  }

  async updateAttendanceStatus(id: string, status: AttendanceRecord['status']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.attendance.findIndex((r) => r.id === id);
      if (index !== -1) {
        this.attendance[index].status = status;
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Assets ---
  async getAssets(): Promise<Asset[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.assets), 500);
    });
  }

  async saveAsset(asset: Asset): Promise<void> {
    return new Promise((resolve) => {
      const index = this.assets.findIndex((a) => a.id === asset.id);
      if (index !== -1) {
        this.assets[index] = asset;
      } else {
        this.assets.unshift(asset);
      }
      setTimeout(resolve, 500);
    });
  }
  async updateAssetStatus(id: string, status: Asset['status']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.assets.findIndex((a) => a.id === id);
      if (index !== -1) {
        this.assets[index].status = status;
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Organization Profile ---
  async getOrganization(): Promise<OrganizationProfile | null> {
    try {
      const startTime = performance.now();
      Logger.info('[getOrganization] Starting fetch...');

      let response;
      try {
        response = await this.request(`${this.apiUrl}/organizations`);
      } catch (err) {
        // Check if it's an AbortError (network abort, navigation, etc.)
        const errName = err instanceof Error ? err.name : 'Unknown';
        const errMsg = err instanceof Error ? err.message : String(err);

        Logger.warn(
          `[getOrganization] Initial request failed: ${errName} - ${errMsg}. Retrying...`
        );

        // For AbortError, don't retry (page navigating or user cancelled)
        if (errName === 'AbortError') {
          Logger.warn(
            '[getOrganization] AbortError detected - not retrying (navigation/user cancel)'
          );
          const stored = localStorage.getItem('org_profile');
          return stored ? JSON.parse(stored) : null;
        }

        // For other transient errors, retry once after short delay
        await new Promise((r) => setTimeout(r, 250));
        response = await this.request(`${this.apiUrl}/organizations`);
      }

      Logger.info(`[getOrganization] Response status: ${response.status}`);

      if (!response.ok) {
        Logger.warn(
          `[getOrganization] Response not OK (${response.status}), using localStorage fallback`
        );
        const stored = localStorage.getItem('org_profile');
        return stored ? JSON.parse(stored) : null;
      }

      const orgs = await response.json();
      Logger.info(
        `[getOrganization] Received payload: ${Array.isArray(orgs) ? orgs.length + ' org(s)' : 'single org'}`
      );

      // Backend returns array, we want the first org
      if (orgs && orgs.length > 0) {
        localStorage.setItem('org_profile', JSON.stringify(orgs[0]));
        const duration = performance.now() - startTime;
        Logger.info(
          `[getOrganization] Successfully fetched '${orgs[0].name || orgs[0].id}' in ${duration.toFixed(0)}ms`
        );
        return orgs[0];
      }

      Logger.warn('[getOrganization] Empty response array');
      return null;
    } catch (error) {
      const errName = error instanceof Error ? error.name : 'Unknown';
      const errMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`[getOrganization] Caught error: ${errName} - ${errMsg}`);

      // Log stack for critical errors
      if (error instanceof Error && error.stack) {
        Logger.debug(`[getOrganization] Stack: ${error.stack}`);
      }

      const stored = localStorage.getItem('org_profile');
      return stored ? JSON.parse(stored) : null;
    }
  }

  async saveOrganization(profile: OrganizationProfile): Promise<OrganizationProfile> {
    try {
      // 1. Optimistic local save
      localStorage.setItem('org_profile', JSON.stringify(profile));

      // 2. Try PUT (Update)
      let response = await this.request(`${this.apiUrl}/organizations/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });

      // 3. Fallback to POST if not found
      if (response.status === 404) {
        Logger.info('Organization not found in DB, creating new via POST');
        response = await this.request(`${this.apiUrl}/organizations`, {
          method: 'POST',
          body: JSON.stringify(profile),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        localStorage.setItem('org_profile', JSON.stringify(saved));
        return saved;
      } else {
        const errorText = await response.text();
        Logger.error('Backend save failed', errorText);
        return profile;
      }
    } catch (error) {
      Logger.error('Failed to save organization', String(error));
      return profile;
    }
  }

  // --- Job Postings ---
  async getJobs(): Promise<JobVacancy[]> {
    const response = await this.request(`${this.apiUrl}/jobs`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveJob(job: JobVacancy): Promise<void> {
    return new Promise((resolve) => {
      const index = this.jobs.findIndex((j) => j.id === job.id);
      if (index !== -1) {
        this.jobs[index] = job;
      } else {
        this.jobs.unshift(job);
      }
      setTimeout(resolve, 500);
    });
  }

  async deleteJob(id: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // If backend call was successful, update local state
      this.jobs = this.jobs.filter((j) => j.id !== id);
    } catch (error) {
      Logger.warn('Backend unavailable, deletion failed', error);
    }
  }

  async updateJobStatus(id: string, status: JobVacancy['status']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.jobs.findIndex((j) => j.id === id);
      if (index !== -1) {
        this.jobs[index].status = status;
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Learning ---
  async getCourses(): Promise<Course[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.courses), 500);
    });
  }

  async saveCourse(course: Course): Promise<void> {
    return new Promise((resolve) => {
      const index = this.courses.findIndex((c) => c.id === course.id);
      if (index !== -1) {
        this.courses[index] = course;
      } else {
        this.courses.unshift(course);
      }
      setTimeout(resolve, 500);
    });
  }

  async updateCourseProgress(
    id: number,
    progress: number,
    status: Course['status'],
    score: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const index = this.courses.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.courses[index] = { ...this.courses[index], progress, status, score };
      }
      setTimeout(resolve, 500);
    });
  }

  // --- Benefits ---
  async getBenefitEnrollments(): Promise<BenefitEnrollment[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.benefitEnrollments), 500);
    });
  }

  async getBenefitTiers(): Promise<BenefitTier[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.benefitTiers), 500);
    });
  }

  async saveBenefitEnrollment(enrollment: BenefitEnrollment): Promise<void> {
    return new Promise((resolve) => {
      const index = this.benefitEnrollments.findIndex((e) => e.id === enrollment.id);
      if (index !== -1) {
        this.benefitEnrollments[index] = enrollment;
      } else {
        this.benefitEnrollments.unshift(enrollment);
      }
      setTimeout(resolve, 500);
    });
  }

  async updateBenefitEnrollmentTier(id: string, tier: BenefitEnrollment['tier']): Promise<void> {
    return new Promise((resolve) => {
      const index = this.benefitEnrollments.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.benefitEnrollments[index].tier = tier;
      }
      setTimeout(resolve, 500);
    });
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  // --- Dashboard ---
  async getGrowthTrends(): Promise<GrowthTrend[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.growthTrends), 500);
    });
  }

  async getMilestones(): Promise<Milestone[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.milestones), 500);
    });
  }

  // --- System Management ---
  async exportData(): Promise<string> {
    Logger.info('Exporting data. Employees length:', this.employees?.length);
    const data = {
      employees: this.employees,
      candidates: this.candidates,
      goals: this.goals,
      hires: this.hires,
      exits: this.exits,
      leaves: this.leaves,
      leaveBalances: this.leaveBalances,
      attendance: this.attendance,
      assets: this.assets,
      jobs: this.jobs,
      courses: this.courses,
      benefitEnrollments: this.benefitEnrollments,
      benefitTiers: this.benefitTiers,
      logs: this.logs,
      rules: this.rules,
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(json: string): Promise<boolean> {
    try {
      const data = JSON.parse(json);
      if (data.employees) {
        this.employees = data.employees;
      }
      if (data.candidates) {
        this.candidates = data.candidates;
      }
      if (data.goals) {
        this.goals = data.goals;
      }
      if (data.hires) {
        this.hires = data.hires;
      }
      if (data.exits) {
        this.exits = data.exits;
      }
      if (data.leaves) {
        this.leaves = data.leaves;
      }
      if (data.leaveBalances) {
        this.leaveBalances = data.leaveBalances;
      }
      if (data.attendance) {
        this.attendance = data.attendance;
      }
      if (data.assets) {
        this.assets = data.assets;
      }
      if (data.jobs) {
        this.jobs = data.jobs;
      }
      if (data.courses) {
        this.courses = data.courses;
      }
      if (data.benefitEnrollments) {
        this.benefitEnrollments = data.benefitEnrollments;
      }
      if (data.benefitTiers) {
        this.benefitTiers = data.benefitTiers;
      }
      if (data.logs) {
        this.logs = data.logs;
      }
      if (data.rules) {
        this.rules = data.rules;
      }
      if (data.rates) {
        // Implementation for rates import if needed
      }

      this.logAction('System', 'Data Import', 'Full system restore initiated.', 'Warning');
      return true;
    } catch (e) {
      Logger.error('Import failed', e);
      return false;
    }
  }

  // --- Data Management (Backup/Restore) ---
  async downloadBackup(): Promise<Blob> {
    const response = await this.request(`${this.apiUrl}/system/backup`);
    if (!response.ok) {
      throw new Error('Failed to generate backup');
    }
    return await response.blob();
  }

  async restoreSystem(file: File): Promise<void> {
    this.enforceRateLimit();
    const formData = new FormData();
    formData.append('file', file);

    // Custom request to handle FormData (Content-Type must be unset)
    const headers = { ...this.getHeaders() } as any;
    delete headers['Content-Type'];

    const response = await fetch(`${this.apiUrl}/system/restore`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to restore system');
    }
  }

  async getLogs(): Promise<AuditLog[]> {
    return this.getAuditLogs();
  }

  async logAction(
    user: string,
    action: string,
    details: string, // Kept for compat, but mapped to status/action if needed?
    level: 'Info' | 'Warning' | 'Error' = 'Info'
  ): Promise<void> {
    const log: AuditLog = {
      id: `LOG-${Date.now()}`,
      time: new Date().toISOString(),
      user,
      action: `${action} - ${details}`,
      status: level === 'Error' ? 'Flagged' : 'Hashed',
    };
    this.logs.push(log);
    sessionStorage.setItem('hunzal_logs', JSON.stringify(this.logs));
  }

  async getRules(): Promise<BusinessRule[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.rules), 500);
    });
  }

  async saveRule(rule: BusinessRule): Promise<void> {
    return new Promise((resolve) => {
      const index = this.rules.findIndex((r) => r.id === rule.id);
      if (index !== -1) {
        this.rules[index] = rule;
      } else {
        this.rules.push(rule);
      }
      this.logAction('Admin', 'Save Rule', `Rule ${rule.name} saved.`);
      setTimeout(resolve, 500);
    });
  }

  async deleteRule(id: string): Promise<void> {
    return new Promise((resolve) => {
      this.rules = this.rules.filter((r) => r.id !== id);
      this.logAction('Admin', 'Delete Rule', `Rule ${id} deleted.`, 'Warning');
      setTimeout(resolve, 500);
    });
  }

  // --- Payroll ---
  async getPayrollRecords(): Promise<any[]> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/payroll`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Payroll backend unavailable, returning empty array', error);
      return [];
    }
  }

  async savePayrollRecord(record: any): Promise<void> {
    this.enforceRateLimit();
    try {
      // Assuming record has an 'id' field
      const method = record.id ? 'PUT' : 'POST';
      const url = record.id ? `${this.apiUrl}/payroll/${record.id}` : `${this.apiUrl}/payroll`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      await response.json();
    } catch (error) {
      Logger.error('Failed to save payroll to backend', error);
      throw error;
    }
  }

  async deletePayrollRecord(id: string): Promise<void> {
    this.enforceRateLimit();
    try {
      const response = await fetch(`${this.apiUrl}/payroll/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }
    } catch (error) {
      Logger.error('Failed to delete payroll from backend', error);
      throw error;
    }
  }
  // --- Departments ---
  async getDepartments(): Promise<any[]> {
    try {
      const response = await this.request(`${this.apiUrl}/departments`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty departments', error);
      return [];
    }
  }

  async saveDepartment(department: any): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/departments`, {
        method: 'POST',
        body: JSON.stringify(department),
      });
      if (!response.ok) {
        throw new Error('Failed to save department');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Backend unavailable, save department failed', error);
      throw error;
    }
  }

  // --- Sub-Departments ---
  async getSubDepartments(): Promise<any[]> {
    try {
      const response = await this.request(`${this.apiUrl}/sub-departments`);
      if (!response.ok) {
        throw new Error('Failed to fetch sub-departments');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty sub-departments', error);
      return [];
    }
  }

  async saveSubDepartment(subDepartment: any): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/sub-departments`, {
        method: 'POST',
        body: JSON.stringify(subDepartment),
      });
      if (!response.ok) {
        throw new Error('Failed to save sub-department');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Backend unavailable, save sub-department failed', error);
      throw error;
    }
  }

  // --- Plants (Locations) ---
  async getPlants(): Promise<any[]> {
    try {
      const response = await this.request(`${this.apiUrl}/plants`);
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty plants', error);
      return [];
    }
  }

  async savePlant(plant: any): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/plants`, {
        method: 'POST',
        body: JSON.stringify(plant),
      });
      if (!response.ok) {
        throw new Error('Failed to save plant');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Backend unavailable, save plant failed', error);
      throw error;
    }
  }

  async updatePlant(id: string, plant: Partial<any>): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/plants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(plant),
      });
      if (!response.ok) {
        throw new Error('Failed to update plant');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Backend unavailable, update plant failed', error);
      throw error;
    }
  }

  async deletePlant(id: string): Promise<void> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/plants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete plant');
      }
    } catch (error) {
      Logger.error('Backend unavailable, delete plant failed', error);
      throw error;
    }
  }

  // --- RBAC ---
  async getAllRolePermissions(): Promise<Record<string, string[]>> {
    const response = await this.request(`${this.apiUrl}/rbac/permissions`);
    if (!response.ok) {
      return {};
    }
    return await response.json();
  }

  async saveRolePermissions(role: string, permissions: string[]): Promise<void> {
    const response = await this.request(`${this.apiUrl}/rbac/permissions`, {
      method: 'POST',
      body: JSON.stringify({ role, permissions }),
    });
    if (!response.ok) {
      throw new Error('Failed to save permissions');
    }
  }

  // --- Positions ---
  async getPositions(): Promise<any[]> {
    try {
      const response = await this.request(`${this.apiUrl}/positions`);
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      return await response.json();
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty positions', error);
      return [];
    }
  }

  async savePosition(position: any): Promise<any> {
    try {
      const method = position.id ? 'PUT' : 'POST';
      const url = position.id
        ? `${this.apiUrl}/positions/${position.id}`
        : `${this.apiUrl}/positions`;
      const response = await this.request(url, {
        method,
        body: JSON.stringify(position),
      });
      if (!response.ok) {
        throw new Error('Failed to save position');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Save position failed', error);
      throw error;
    }
  }

  async updatePosition(id: string, position: any): Promise<any> {
    try {
      const response = await this.request(`${this.apiUrl}/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(position),
      });
      if (!response.ok) {
        throw new Error('Failed to update position');
      }
      return await response.json();
    } catch (error) {
      Logger.error('Update position failed', error);
      throw error;
    }
  }

  async deletePosition(id: string): Promise<void> {
    try {
      const response = await this.request(`${this.apiUrl}/positions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete position');
      }
    } catch (error) {
      Logger.error('Delete position failed', error);
      throw error;
    }
  }

  // --- Grades ---
  async getGrades(): Promise<Grade[]> {
    try {
      const response = await this.request(`${this.apiUrl}/grades`);
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      this.grades = data;
      return data;
    } catch (error) {
      Logger.warn('Backend unavailable, returning empty grades', error);
      return [];
    }
  }

  async saveGrade(grade: Grade): Promise<Grade> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/grades`, {
      method: 'POST',
      body: JSON.stringify(grade),
    });
    if (!response.ok) {
      throw new Error('Failed to save grade');
    }
    return await response.json();
  }

  async deleteGrade(id: string): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/grades/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete grade');
    }
    this.grades = this.grades.filter((g) => g.id !== id);
  }

  // --- Designations ---
  async getDesignations(): Promise<Designation[]> {
    const response = await this.request(`${this.apiUrl}/designations`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveDesignation(designation: Designation): Promise<Designation> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/designations`, {
      method: 'POST',
      body: JSON.stringify(designation),
    });
    if (!response.ok) {
      throw new Error('Failed to save designation');
    }
    return await response.json();
  }

  async updateDesignation(id: string, designation: Partial<Designation>): Promise<Designation> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/designations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(designation),
      });
      if (!response.ok) {
        throw new Error('Failed to update designation');
      }
      const updated = await response.json();

      // Update local cache
      const index = this.designations.findIndex((d) => d.id === id);
      if (index !== -1) {
        this.designations[index] = updated;
      }

      return updated;
    } catch (error) {
      Logger.error('Backend unavailable, update designation failed', error);
      throw error;
    }
  }

  async deleteDesignation(id: string): Promise<void> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/designations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete designation');
      }

      this.designations = this.designations.filter((d) => d.id !== id);
    } catch (error) {
      Logger.error('Backend unavailable, delete designation failed', error);
      throw error;
    }
  }

  // --- Delete & Update Methods for Other Entities ---

  // Departments
  async updateDepartment(id: string, department: Partial<any>): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department),
    });
    if (!response.ok) {
      throw new Error('Failed to update department');
    }
    return await response.json();
  }

  async deleteDepartment(id: string): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/departments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete department');
    }
  }

  // Sub-Departments
  async updateSubDepartment(id: string, subDepartment: Partial<any>): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/sub-departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subDepartment),
    });
    if (!response.ok) {
      throw new Error('Failed to update sub-department');
    }
    return await response.json();
  }

  async deleteSubDepartment(id: string): Promise<void> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/sub-departments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete sub-department');
    }
  }

  // Plants

  // Grades
  async updateGrade(id: string, grade: any): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grade),
    });
    if (!response.ok) {
      throw new Error('Failed to update grade');
    }
    return await response.json();
  }

  // --- Shifts ---

  // --- Audit Logs ---
  async getAuditLogs(skip: number = 0, limit: number = 100): Promise<AuditLog[]> {
    const response = await this.request(`${this.apiUrl}/audit-logs?skip=${skip}&limit=${limit}`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveAuditLog(log: Omit<AuditLog, 'id' | 'time'>): Promise<AuditLog> {
    const response = await this.request(`${this.apiUrl}/audit-logs`, {
      method: 'POST',
      body: JSON.stringify(log),
    });
    if (!response.ok) {
      throw new Error('Failed to save audit log');
    }
    return await response.json();
  }

  // --- Recruitment ---
  async getJobVacancies(): Promise<any[]> {
    const response = await this.request(`${this.apiUrl}/job-vacancies`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async saveJobVacancy(job: any): Promise<any> {
    // Assuming create only for now, or unified save
    const method = 'POST'; // Simplified
    const response = await this.request(`${this.apiUrl}/job-vacancies`, {
      method,
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error('Failed to save job');
    }
    return await response.json();
  }

  // --- Performance (Goals) ---

  async updateGoal(goal: any): Promise<any> {
    const response = await this.request(`${this.apiUrl}/goals/${goal.id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
    if (!response.ok) {
      throw new Error('Failed to update goal');
    }
    return await response.json();
  }

  async getPerformanceReviews(): Promise<any[]> {
    const response = await this.request(`${this.apiUrl}/performance-reviews`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  // --- API Keys Management ---

  async createApiKey(name: string, expiresAt?: string): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/system/api-keys`, {
        method: 'POST',
        body: JSON.stringify({ name, expires_at: expiresAt }),
      });
      if (!response.ok) {
        throw new Error('Failed to create API key');
      }
      return await response.json();
    } catch (e) {
      console.warn('Backend unavailable, using LocalStorage for API Key');
      const newKey = {
        id: crypto.randomUUID(),
        name,
        key_preview: 'sk-live-' + Math.random().toString(36).substring(7) + '...',
        raw_key:
          'sk-live-' +
          Math.random().toString(36).substring(2) +
          Math.random().toString(36).substring(2),
        created_at: new Date().toISOString(),
        last_used: null,
      };
      const keys = JSON.parse(localStorage.getItem('system_api_keys') || '[]');
      keys.push(newKey);
      localStorage.setItem('system_api_keys', JSON.stringify(keys));
      return newKey;
    }
  }

  async listApiKeys(skip: number = 0, limit: number = 50): Promise<any> {
    const response = await this.request(
      `${this.apiUrl}/system/api-keys?skip=${skip}&limit=${limit}`
    );
    if (!response.ok) {
      return { keys: [], total: 0 };
    }
    return await response.json();
  }

  async revokeApiKey(keyId: string): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/api-keys/${keyId}/revoke`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to revoke API key');
    }
    return await response.json();
  }

  async deleteApiKey(keyId: string): Promise<any> {
    this.enforceRateLimit();
    try {
      await this.request(`${this.apiUrl}/system/api-keys/${keyId}`, { method: 'DELETE' });
    } catch (e) {
      const keys = JSON.parse(localStorage.getItem('system_api_keys') || '[]');
      const filtered = keys.filter((k: any) => k.id !== keyId);
      localStorage.setItem('system_api_keys', JSON.stringify(filtered));
    }
    return { success: true };
  }

  // --- Webhooks Management ---

  async createWebhook(
    name: string,
    url: string,
    eventTypes: string[],
    headers?: any
  ): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/system/webhooks`, {
        method: 'POST',
        body: JSON.stringify({ name, url, event_types: eventTypes, headers }),
      });
      if (!response.ok) {
        throw new Error('Failed to create webhook');
      }
      return await response.json();
    } catch (e) {
      console.warn('Backend unavailable, using LocalStorage for Webhook');
      const newHook = {
        id: crypto.randomUUID(),
        name,
        url,
        event_types: eventTypes,
        is_active: true,
        headers,
      };
      const hooks = JSON.parse(localStorage.getItem('system_webhooks') || '[]');
      hooks.push(newHook);
      localStorage.setItem('system_webhooks', JSON.stringify(hooks));
      return newHook;
    }
  }

  async listWebhooks(skip: number = 0, limit: number = 50): Promise<any> {
    const response = await this.request(
      `${this.apiUrl}/system/webhooks?skip=${skip}&limit=${limit}`
    );
    if (!response.ok) {
      return { webhooks: [], total: 0 };
    }
    return await response.json();
  }

  async getWebhook(webhookId: string): Promise<any> {
    const response = await this.request(`${this.apiUrl}/system/webhooks/${webhookId}`);
    if (!response.ok) {
      throw new Error('Failed to retrieve webhook');
    }
    return await response.json();
  }

  async updateWebhook(webhookId: string, updates: any): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/webhooks/${webhookId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update webhook');
    }
    return await response.json();
  }

  async deleteWebhook(webhookId: string): Promise<any> {
    this.enforceRateLimit();
    try {
      await this.request(`${this.apiUrl}/system/webhooks/${webhookId}`, { method: 'DELETE' });
    } catch (e) {
      const hooks = JSON.parse(localStorage.getItem('system_webhooks') || '[]');
      const filtered = hooks.filter((h: any) => h.id !== webhookId);
      localStorage.setItem('system_webhooks', JSON.stringify(filtered));
    }
    return { success: true };
  }

  async getWebhookLogs(webhookId: string, skip: number = 0, limit: number = 100): Promise<any> {
    const response = await this.request(
      `${this.apiUrl}/system/webhooks/${webhookId}/logs?skip=${skip}&limit=${limit}`
    );
    if (!response.ok) {
      return { logs: [], total: 0 };
    }
    return await response.json();
  }

  async testWebhook(_webhookId: string): Promise<any> {
    this.enforceRateLimit();
    // Simulate test
    await new Promise((r) => setTimeout(r, 1000));
    return { status_code: 200, message: 'Test event delivered successfully via Local Simulation' };
  }

  async flushCache(): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/maintenance/flush-cache`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to flush cache');
    }
    return await response.json();
  }

  async optimizeDatabase(): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/maintenance/optimize-db`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to optimize database');
    }
    return await response.json();
  }

  async rotateLogs(): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/maintenance/rotate-logs`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to rotate logs');
    }
    return await response.json();
  }

  async getSystemHealth(): Promise<any> {
    const response = await this.request(`${this.apiUrl}/system/flags/health`);
    if (!response.ok) {
      return {};
    }
    return await response.json();
  }

  // --- Notification Settings ---
  async getNotificationSettings(): Promise<any> {
    const response = await this.request(`${this.apiUrl}/notifications/config`);
    if (!response.ok) {
      return {
        email: {
          smtpServer: '',
          port: 587,
          username: '',
          password: '',
          fromAddress: '',
          enabled: true,
        },
        sms: { provider: 'Twilio', apiKey: '', senderId: '', enabled: false },
      };
    }
    const data = await response.json();
    return data;
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    this.enforceRateLimit();
    try {
      const response = await this.request(`${this.apiUrl}/notifications/config`, {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
      return await response.json();
    } catch (e) {
      console.warn('Backend unavailable, saving notification settings to LocalStorage');
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      return settings;
    }
  }

  async testEmailNotification(recipient: string): Promise<any> {
    const response = await this.request(`${this.apiUrl}/notifications/test`, {
      method: 'POST',
      body: JSON.stringify({ recipient }),
    });
    if (!response.ok) {
      throw new Error('Failed to send test email');
    }
    return await response.json();
  }

  async saveNotificationSettings(settings: any): Promise<void> {
    this.enforceRateLimit();
    // Map frontend structure to backend
    const payload = {
      emailEnabled: settings.email?.enabled ?? true,
      emailProvider: 'smtp', // Default or derived
      emailFromAddress: settings.email?.fromAddress,
      emailFromName: 'System',

      smsEnabled: settings.sms?.enabled ?? false,
      smsProvider: settings.sms?.provider,
      smsFromNumber: settings.sms?.senderId,
    };

    const response = await this.request(`${this.apiUrl}/notifications/config`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to save notification settings');
    }
  }

  // --- AI Settings ---
  async getAISettings(): Promise<AISettings> {
    const response = await this.request(`${this.apiUrl}/system/ai`);
    if (!response.ok) {
      return {
        provider: 'gemini',
        status: 'offline',
        apiKeys: { openai: '', gemini: '', anthropic: '' },
        agents: { resume_screener: false, turnover_predictor: false, chat_assistant: false },
      };
    }
    const data = await response.json();
    return {
      provider: data.provider,
      status: data.status,
      apiKeys: data.apiKeys || { openai: '', gemini: '', anthropic: '' },
      agents: data.agents || {
        resume_screener: false,
        turnover_predictor: false,
        chat_assistant: false,
      },
    };
  }

  async updateAiSettings(settings: any): Promise<void> {
    this.enforceRateLimit();
    // Map frontend to backend
    const payload = {
      provider: settings.provider,
      apiKeys: settings.apiKeys,
      status: settings.status,
      agents: settings.agents,
    };

    try {
      const response = await this.request(`${this.apiUrl}/system/ai`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to save AI settings');
      }
    } catch (e) {
      console.warn('Backend unavailable, saving AI settings to LocalStorage');
      localStorage.setItem('ai_settings', JSON.stringify(settings));
    }
  }

  async testAIConnection(): Promise<any> {
    return await this.post('/ai/test-connection', {});
  }

  // --- Compliance Settings ---
  async getComplianceSettings(): Promise<any> {
    const response = await this.request(`${this.apiUrl}/compliance/settings`);
    if (!response.ok) {
      return {};
    }
    return await response.json();
  }

  async saveComplianceSettings(settings: any): Promise<void> {
    const payload = {
      taxYear: settings.taxYear,
      minWage: settings.minWage,
      eobiRate: settings.eobiRate,
      socialSecurityRate: settings.socialSecurityRate,
    };
    const response = await this.request(`${this.apiUrl}/compliance/settings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to save compliance settings');
    }
  }

  // --- Background Jobs Management ---

  async getBackgroundJobs(skip: number = 0, limit: number = 50, status?: string): Promise<any> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (status) {
      params.append('status', status);
    }

    const response = await this.request(
      `${this.apiUrl}/system/background-jobs?${params.toString()}`
    );
    if (!response.ok) {
      return { jobs: [], total: 0 };
    }
    return await response.json();
  }

  async getBackgroundJob(jobId: string): Promise<any> {
    const response = await this.request(`${this.apiUrl}/system/background-jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to retrieve background job');
    }
    return await response.json();
  }

  async cancelBackgroundJob(jobId: string): Promise<any> {
    this.enforceRateLimit();
    const response = await this.request(`${this.apiUrl}/system/background-jobs/${jobId}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to cancel background job');
    }
    return await response.json();
  }

  // --- Employment Levels ---
  async getEmploymentLevels(orgId?: string): Promise<EmploymentLevel[]> {
    const url = orgId
      ? `${this.apiUrl}/employment-levels?org_id=${orgId}`
      : `${this.apiUrl}/employment-levels`;
    const response = await this.request(url);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  async createEmploymentLevel(data: Partial<EmploymentLevel>): Promise<EmploymentLevel> {
    const response = await this.request(`${this.apiUrl}/employment-levels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create employment level');
    }
    return await response.json();
  }

  async updateEmploymentLevel(
    id: string,
    data: Partial<EmploymentLevel>
  ): Promise<EmploymentLevel> {
    const response = await this.request(`${this.apiUrl}/employment-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update employment level');
    }
    return await response.json();
  }

  async deleteEmploymentLevel(id: string): Promise<void> {
    const response = await this.request(`${this.apiUrl}/employment-levels/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete employment level');
    }
  }
}

export const api = new ApiService();
export default api;
