import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSystemStore } from '@/system/systemStore';
import Logger from '@/utils/logger';
import { formatTime } from '@/utils/formatting';
import {
  JobLevel,
  Shift,
  AuditLog,
  PayrollSettings,
  OrganizationProfile,
  Plant,
  Department,
  Grade,
  Designation,
  BusinessRule,
  PayrollRecord,
  Holiday,
  Bank,
  User,
  SystemFlags,
  NotificationSettings,
  AISettings,
  Employee,
  SubDepartment,
  Position,
  SystemRole,
  Permission,
  DepartmentStat,
  AttendanceStat,
} from '../types';
import { ROLE_PERMISSIONS as INITIAL_ROLE_PERMISSIONS } from '../types';
interface OrgState {
  // State and actions defined below

  // System Admin State
  rbacMatrix: { module: string; perms: boolean[] }[];
  complianceResults: {
    id: string;
    type: 'Success' | 'Warning' | 'Error';
    message: string;
    timestamp: string;
  }[];
  auditLogs: AuditLog[];
  complianceSettings: {
    taxYear: string;
    eobiRate: number;
    socialSecurityRate: number;
    minWage: number;
  };
  apiKeys: {
    id: string;
    name: string;
    key: string;
    scope: 'Read-only' | 'Read/Write' | 'Full Admin';
    created: string;
    lastUsed: string;
  }[];
  webhooks: {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'Active' | 'Inactive';
    logs: {
      id: string;
      timestamp: string;
      status: 'Success' | 'Failed';
      responseCode: number;
    }[];
  }[];
  businessRules: BusinessRule[];
  payrollRecords: PayrollRecord[];
  notificationSettings: NotificationSettings;
  infrastructureLogs: {
    id: string;
    event: string;
    timestamp: string;
    status: 'Success' | 'Warning' | 'Info';
  }[];

  // RBAC State
  rolePermissions: Record<SystemRole, Permission[]>;
  togglePermission: (role: SystemRole, permission: Permission) => void;

  // Loading state for lazy loading
  loadingEntities: Record<string, boolean>;
  errorEntities: Record<string, string | null>;
  lastFetched: Record<string, number>;

  // Entity state management
  clearEntityError: (entity: string) => void;

  fetchMasterData: () => Promise<void>;
  // Stats & UI State
  // Master Data
  profile: OrganizationProfile;
  grades: Grade[];
  designations: Designation[];
  jobLevels: JobLevel[];
  employees: Employee[];
  shifts: Shift[];
  departments: Department[];
  subDepartments: SubDepartment[];
  plants: Plant[];
  holidays: Holiday[];
  banks: Bank[];
  positions: Position[];
  users: User[];
  systemFlags: SystemFlags;
  aiSettings: AISettings;
  currentUser: User | null;
  payrollSettings: PayrollSettings;

  backups: { filename: string; size: number; created_at: string }[];

  isLoading?: boolean;
  departmentStats?: DepartmentStat[];
  attendanceStats?: AttendanceStat[];

  // Actions
  fetchProfile: () => Promise<void>;
  // Lazy Loading Actions
  fetchDepartments: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  fetchDesignations: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  fetchShifts: () => Promise<void>;
  fetchPlants: () => Promise<void>;
  fetchJobLevels: () => Promise<void>;
  fetchHolidays: () => Promise<void>;
  fetchBanks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchEmployees: (force?: boolean) => Promise<void>;

  // Actions
  updateProfile: (profile: Partial<OrganizationProfile>) => void;
  saveProfile: () => Promise<void>;
  resetOrganization: () => void;

  addPlant: (plant: Plant) => Promise<void>;
  updatePlant: (id: string, plant: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;

  addDepartment: (dept: Department) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  addSubDepartment: (subDept: any) => Promise<void>;
  updateSubDepartment: (id: string, subDept: Partial<any>) => Promise<void>;
  deleteSubDepartment: (id: string) => Promise<void>;

  addGrade: (grade: Grade) => Promise<void>;
  updateGrade: (gradeId: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (gradeId: string) => Promise<void>;

  addDesignation: (designation: Designation) => Promise<void>;
  updateDesignation: (id: string, designation: Partial<Designation>) => Promise<void>;
  deleteDesignation: (id: string) => Promise<void>;
  // Positions
  addPosition: (position: Position) => Promise<void>;
  updatePosition: (id: string, position: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;

  addJobLevel: (level: JobLevel) => Promise<void>;
  updateJobLevel: (id: string, level: Partial<JobLevel>) => Promise<void>;
  deleteJobLevel: (id: string) => Promise<void>;

  addHoliday: (holiday: Holiday) => Promise<void>;
  updateHoliday: (id: number, holiday: Partial<Holiday>) => Promise<void>;
  deleteHoliday: (id: number) => Promise<void>;

  addBank: (bank: Bank) => Promise<void>;
  updateBank: (id: string, bank: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;

  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;

  updatePayrollSettings: (settings: Partial<PayrollSettings>) => void;

  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  refreshCurrentUser: () => void;
  syncProfileStatus: (employeeId: string, status: 'Active' | 'Inactive') => void;
  updateSystemFlags: (flags: Partial<OrgState['systemFlags']>) => void;
  updateAiSettings: (settings: Partial<OrgState['aiSettings']>) => void;
  updateNotificationSettings: (settings: Partial<OrgState['notificationSettings']>) => void;
  addApiKey: (name: string, scope: 'Read-only' | 'Read/Write' | 'Full Admin') => Promise<string>;
  deleteApiKey: (id: string) => Promise<void>;
  addWebhook: (webhook: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
  }) => Promise<any>;
  simulateWebhookDelivery: (id: string) => Promise<any>;
  deleteWebhook: (id: string) => Promise<void>;

  // Infrastructure Actions
  optimizeDatabase: () => Promise<any>;
  flushCache: () => Promise<any>;
  rotateLogs: () => Promise<any>;
  fetchBackups: () => Promise<void>;
  restoreFromServer: (filename: string) => Promise<void>;

  // System Admin Actions
  updateRbac: (moduleIndex: number, roleIndex: number) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'time'>) => void;
  updateCompliance: (settings: Partial<OrgState['complianceSettings']>) => void;
  resetRbac: () => void;
  runComplianceCheck: () => void;
  addBusinessRule: (rule: BusinessRule) => void;
  updateBusinessRule: (id: string, rule: Partial<BusinessRule>) => void;
  deleteBusinessRule: (id: string) => void;
  addPayrollRecord: (record: PayrollRecord) => void;
  testEmailNotification: (recipient: string) => Promise<any>;
  getBackgroundJobs: (skip: number, limit: number, status?: string) => Promise<any>;
  cancelBackgroundJob: (jobId: string) => Promise<any>;
  fetchAuditLogs: (skip?: number, limit?: number) => Promise<void>;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      profile: {
        id: '',
        name: '',
        industry: '',
        currency: '',
        taxYearEnd: '',
        country: '',
      },
      plants: [],
      departments: [],
      grades: [],
      designations: [],
      positions: [],
      jobLevels: [],

      businessRules: [],
      payrollRecords: [],
      holidays: [],
      banks: [],
      shifts: [],
      payrollSettings: {
        overtimeEnabled: true,
        taxYearEnd: 'June',
        currency: 'PKR',
        calculationMethod: 'Per Month',
        customFormulas: { staff: '', worker: '' },
        overtime: { routine: { staff: '', worker: '' }, gazetteHoliday: { staff: '', worker: '' } },
      },
      users: [],
      currentUser: null,
      systemFlags: {
        mfa_enforced: false,
        biometrics_required: false,
        ip_whitelisting: false,
        session_timeout: '',
        password_complexity: '',
        session_isolation: false,
        neural_bypass: false,
        api_caching: false,
        debug_mode: false,
        immutable_logs: false,
      },
      notificationSettings: {
        email: { smtpServer: '', port: 0, username: '', password: '', fromAddress: '' },
        sms: { provider: 'Twilio' as 'Twilio', apiKey: '', senderId: '' },
      },
      aiSettings: {
        provider: 'gemini',
        status: 'offline',
        apiKeys: { gemini: '', openai: '', anthropic: '' },
        agents: { resume_screener: false, turnover_predictor: false, chat_assistant: false },
      },
      rbacMatrix: [],
      complianceResults: [],
      auditLogs: [],
      complianceSettings: {
        taxYear: '',
        minWage: 0,
        eobiRate: 0,
        socialSecurityRate: 0,
      },
      backups: [],
      apiKeys: [],
      webhooks: [],
      infrastructureLogs: [],

      // Initialize with default permissions from types
      rolePermissions: INITIAL_ROLE_PERMISSIONS,

      togglePermission: async (role, permission) => {
        const currentPerms = get().rolePermissions[role] || [];
        const hasPerm = currentPerms.includes(permission);

        const newPerms = hasPerm
          ? currentPerms.filter((p) => p !== permission)
          : [...currentPerms, permission];

        // Optimistic Update
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [role]: newPerms,
          },
        }));

        // Persist to Backend
        try {
          const { api } = await import('../services/api');
          await api.saveRolePermissions(role, newPerms);
        } catch (error) {
          console.error('Failed to save permission change:', error);
          // Revert on failure (Optional, keeping simple for now)
        }
      },

      // Master Data Init
      employees: [],
      subDepartments: [],
      loadingEntities: {},
      errorEntities: {},
      lastFetched: {},

      clearEntityError: (entity: string) => {
        set((s) => ({ errorEntities: { ...s.errorEntities, [entity]: null } }));
      },

      fetchMasterData: async () => {
        const { api } = await import('../services/api');

        // Helper to safely fetch data without crashing the whole chain
        const safeFetch = async <T>(promise: Promise<T>, name: string): Promise<T | null> => {
          try {
            return await promise;
          } catch (e) {
            console.warn(`[fetchMasterData] Partial failure loading ${name}`, e);
            return null;
          }
        };

        try {
          // Phase 1: Essentials (Config, Flags, Users - Required for UI shell)
          const [systemFlags, payrollSettings, users] = await Promise.all([
            safeFetch(api.getSystemFlags?.() ?? Promise.resolve(null), 'systemFlags'),
            safeFetch(api.getPayrollSettings(), 'payrollSettings'),
            safeFetch(api.getUsers(), 'users'),
          ]);

          set((state) => ({
            systemFlags: systemFlags ? { ...state.systemFlags, ...systemFlags } : state.systemFlags,
            payrollSettings: payrollSettings || state.payrollSettings,
            users: users || state.users,
          }));

          // Phases 2 & 3: Structural & Operational (Merged for performance)
          // Navigation, Structural and Operational data can all be loaded in parallel
          const [
            plants,
            depts,
            subDepts,
            desig,
            grades,
            shifts,
            empLevels,
            holidays,
            banks,
            positions,
          ] = await Promise.all([
            safeFetch(api.getPlants?.() ?? Promise.resolve([]), 'plants'),
            safeFetch(api.getDepartments(), 'departments'),
            safeFetch(api.getSubDepartments(), 'subDepartments'),
            safeFetch(api.getDesignations(), 'designations'),
            safeFetch(api.getGrades(), 'grades'),
            safeFetch(api.getShifts(), 'shifts'),
            safeFetch(api.getJobLevels(), 'jobLevels'),
            safeFetch(api.getHolidays(), 'holidays'),
            safeFetch(api.getBanks(), 'banks'),
            safeFetch(api.getPositions?.() ?? Promise.resolve(null), 'positions'),
          ]);

          const now = Date.now();
          set((state) => ({
            plants: plants || state.plants,
            departments: depts || state.departments,
            subDepartments: subDepts || state.subDepartments,
            designations: desig || state.designations,
            grades: grades || state.grades,
            shifts: shifts || state.shifts,
            jobLevels: empLevels || state.jobLevels,
            holidays: holidays || state.holidays,
            banks: banks || state.banks,
            positions: positions || state.positions,
            lastFetched: {
              ...state.lastFetched,
              designations: desig ? now : state.lastFetched.designations,
              grades: grades ? now : state.lastFetched.grades,
              shifts: shifts ? now : state.lastFetched.shifts,
              jobLevels: empLevels ? now : state.lastFetched.jobLevels,
              holidays: holidays ? now : state.lastFetched.holidays,
              banks: banks ? now : state.lastFetched.banks,
              positions: positions ? now : state.lastFetched.positions,
            },
          }));

          // Load Dynamic Permissions (Merged with defaults)
          try {
            const dynamicPerms = api.getAllRolePermissions ? await api.getAllRolePermissions() : {};
            if (dynamicPerms && Object.keys(dynamicPerms).length > 0) {
              set((state) => ({
                rolePermissions: { ...state.rolePermissions, ...dynamicPerms },
              }));
            }
          } catch (e) {
            console.warn('Failed to load dynamic permissions, using defaults', e);
          }

          // Constitution: Analyze System Pressure & Entropy
          useSystemStore.getState().runCycle();
        } catch (error) {
          console.error('Critical Failure in fetchMasterData', error);
        }
      },

      fetchProfile: async () => {
        const { api } = await import('../services/api');
        const startTime = performance.now();
        console.info('[fetchProfile] Starting profile fetch...');

        try {
          const org = await api.getOrganization();
          const duration = performance.now() - startTime;

          if (org) {
            console.info(
              `[fetchProfile] Received org '${org.name || org.id}' in ${duration.toFixed(0)}ms`,
              org
            );
            set({ profile: org });
          } else {
            console.warn(
              `[fetchProfile] api.getOrganization() returned null after ${duration.toFixed(0)}ms`
            );

            // Fallback: try localStorage
            const stored = localStorage.getItem('org_profile');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                console.info('[fetchProfile] Using cached localStorage org_profile:', parsed);
                set({ profile: parsed });
              } catch (e) {
                console.warn(
                  '[fetchProfile] Failed to parse cached org_profile from localStorage:',
                  e
                );
              }
            } else {
              console.warn(
                '[fetchProfile] No cached org_profile in localStorage and API returned null'
              );
            }
          }
        } catch (e) {
          const errName = e instanceof Error ? e.name : 'Unknown';
          const errMsg = e instanceof Error ? e.message : String(e);
          console.error(
            `[fetchProfile] Error calling api.getOrganization: ${errName} - ${errMsg}`,
            e
          );
        }
      },

      // --- Lazy Loading Actions ---
      fetchDepartments: async () => {
        if (get().loadingEntities['departments']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, departments: true },
          errorEntities: { ...s.errorEntities, departments: null },
        }));
        try {
          const { api } = await import('../services/api');
          const [depts, subDepts] = await Promise.all([
            api.getDepartments(),
            api.getSubDepartments(),
          ]);
          set({ departments: depts, subDepartments: subDepts });
        } catch (e: any) {
          console.error('fetchDepartments failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              departments: e?.message || 'Failed to load departments',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, departments: false } }));
        }
      },

      fetchGrades: async () => {
        if (get().loadingEntities['grades']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, grades: true },
          errorEntities: { ...s.errorEntities, grades: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getGrades();
          set({ grades: data });
        } catch (e: any) {
          console.error('fetchGrades failed', e);
          set((s) => ({
            errorEntities: { ...s.errorEntities, grades: e?.message || 'Failed to load grades' },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, grades: false } }));
        }
      },

      fetchDesignations: async () => {
        if (get().loadingEntities['designations']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, designations: true },
          errorEntities: { ...s.errorEntities, designations: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getDesignations();
          set({ designations: data });
        } catch (e: any) {
          console.error('fetchDesignations failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              designations: e?.message || 'Failed to load designations',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, designations: false } }));
        }
      },

      fetchPositions: async () => {
        if (get().loadingEntities['positions']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, positions: true },
          errorEntities: { ...s.errorEntities, positions: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getPositions();
          set({ positions: data });
        } catch (e: any) {
          console.error('fetchPositions failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              positions: e?.message || 'Failed to load positions',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, positions: false } }));
        }
      },

      fetchShifts: async () => {
        if (get().loadingEntities['shifts']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, shifts: true },
          errorEntities: { ...s.errorEntities, shifts: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getShifts();
          set({ shifts: data });
        } catch (e: any) {
          console.error('fetchShifts failed', e);
          set((s) => ({
            errorEntities: { ...s.errorEntities, shifts: e?.message || 'Failed to load shifts' },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, shifts: false } }));
        }
      },

      fetchPlants: async () => {
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, plants: true },
          errorEntities: { ...s.errorEntities, plants: null },
        }));
        try {
          const { api } = await import('../services/api');
          const plants = await api.getPlants();
          set({ plants: plants });
        } catch (e: any) {
          console.error('fetchPlants failed', e);
          set((s) => ({
            errorEntities: { ...s.errorEntities, plants: e?.message || 'Failed to load plants' },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, plants: false } }));
        }
      },

      fetchJobLevels: async () => {
        if (get().loadingEntities['jobLevels']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, jobLevels: true },
          errorEntities: { ...s.errorEntities, jobLevels: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getJobLevels();
          set({ jobLevels: data });
        } catch (e: any) {
          console.error('fetchJobLevels failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              jobLevels: e?.message || 'Failed to load job levels',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, jobLevels: false } }));
        }
      },

      fetchHolidays: async () => {
        if (get().loadingEntities['holidays']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, holidays: true },
          errorEntities: { ...s.errorEntities, holidays: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getHolidays();
          set({ holidays: data });
        } catch (e: any) {
          console.error('fetchHolidays failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              holidays: e?.message || 'Failed to load holidays',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, holidays: false } }));
        }
      },

      fetchBanks: async () => {
        if (get().loadingEntities['banks']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, banks: true },
          errorEntities: { ...s.errorEntities, banks: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getBanks();
          set({ banks: data });
        } catch (e: any) {
          console.error('fetchBanks failed', e);
          set((s) => ({
            errorEntities: { ...s.errorEntities, banks: e?.message || 'Failed to load banks' },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, banks: false } }));
        }
      },

      fetchUsers: async () => {
        if (get().loadingEntities['users']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, users: true },
          errorEntities: { ...s.errorEntities, users: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getUsers();
          // Map backend fields to frontend User type
          const mappedUsers = data.map((u: any) => ({
            ...u,
            name: u.name || u.username || 'Unknown', // Backend sends username, frontend expects name
            email: u.email || `${u.username}@system.local`,
            userType: u.isSystemUser ? 'SystemAdmin' : 'OrgUser',
            isSystemUser: u.isSystemUser || false,
          }));
          set({ users: mappedUsers });
        } catch (e: any) {
          console.error('fetchUsers failed', e);
          set((s) => ({
            errorEntities: { ...s.errorEntities, users: e?.message || 'Failed to load users' },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, users: false } }));
        }
      },

      fetchEmployees: async (force = false) => {
        const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
        const state = get();
        const lastFetch = state.lastFetched.employees || 0;
        const isStale = Date.now() - lastFetch > STALE_THRESHOLD;

        // Skip if already loading or data is fresh (unless forced)
        if (state.loadingEntities['employees']) {
          return;
        }
        if (!force && !isStale && state.employees.length > 0) {
          console.info('[fetchEmployees] Data is fresh, skipping refetch');
          return;
        }

        set((s) => ({
          loadingEntities: { ...s.loadingEntities, employees: true },
          errorEntities: { ...s.errorEntities, employees: null },
        }));

        try {
          const { api } = await import('../services/api');
          const data = await api.getEmployees();
          set((s) => ({
            employees: data,
            lastFetched: { ...s.lastFetched, employees: Date.now() },
          }));
        } catch (e: any) {
          console.error('fetchEmployees failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              employees: e?.message || 'Failed to load employees',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, employees: false } }));
        }
      },

      updateProfile: (profileUpdates) => {
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates },
        }));
      },

      saveProfile: async () => {
        const { api } = await import('../services/api');
        try {
          const currentProfile = get().profile;
          const savedProfile = await api.saveOrganization(currentProfile);
          if (savedProfile) {
            set({ profile: savedProfile });
            Logger.info('Profile saved successfully:', { name: savedProfile.name });
          }
        } catch (err) {
          console.error('Failed to save profile', err);
          throw err;
        }
      },

      initData: async () => {
        set({ isLoading: true });
        try {
          const { api } = await import('../services/api'); // Import API here

          // --- PHASE 1: Critical (Unblock App Shell) ---
          // Load settings and permissions required for the UI skeleton and access control
          const [
            systemFlags,
            rolePermissions,
            aiSettings,
            notificationSettings,
            complianceSettings,
          ] = await Promise.all([
            api.getSystemFlags().catch(() => null),
            api.getRolePermissions().catch(() => ({})),
            api.getAISettings().catch(() => null),
            api.getNotificationSettings().catch(() => null),
            api.getComplianceSettings().catch(() => null),
          ]);

          // Merge Remote Permissions with Defaults
          const mergedPerms = { ...INITIAL_ROLE_PERMISSIONS };
          if (rolePermissions) {
            Object.entries(rolePermissions).forEach(([role, perms]) => {
              if (perms && (perms as any).length > 0) {
                (mergedPerms as any)[role] = perms;
              }
            });
          }

          set({
            systemFlags: systemFlags || get().systemFlags,
            rolePermissions: mergedPerms,
            aiSettings: aiSettings || get().aiSettings,
            notificationSettings: notificationSettings || get().notificationSettings,
            complianceSettings: complianceSettings || get().complianceSettings,
            isLoading: false, // <--- CRITICAL: Unblock UI here
          });

          // --- PHASE 2: Structure (Navigation & Dropdowns) ---
          // Load organizational structure so users can navigate immediately
          Promise.all([
            api.getPlants ? api.getPlants() : Promise.resolve([]),
            api.getDepartments(),
            api.getSubDepartments(),
            api.getDesignations(),
            api.getGrades(),
            api.getBanks(),
          ])
            .then(([plants, depts, subs, desigs, grades, banks]) => {
              set({
                plants,
                departments: depts,
                subDepartments: subs,
                designations: desigs,
                grades,
                banks,
              });
            })
            .catch((err) => console.error('Phase 2 (Structure) load failed', err));

          // --- PHASE 3: Operational (Heavy Data) ---
          // Load lists and stats. These are heavy and can stream in.
          Promise.all([
            api.getEmployees(),
            api.getShifts(),
            api.getPayrollSettings(),
            api.getHolidays(),
            api.getDepartmentStats().catch(() => []),
            api.getAttendanceStats().catch(() => []),
          ])
            .then(([employees, shifts, payroll, holidays, deptStats, attStats]) => {
              set({
                employees,
                shifts,
                payrollSettings: payroll,
                holidays: holidays,
                departmentStats: deptStats,
                attendanceStats: attStats,
              });
            })
            .catch((err) => console.error('Phase 3 (Operational) load failed', err));
        } catch (error: any) {
          console.error('initData Critical Failure', error);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              initData: error?.message || 'Failed to initialize system',
            },
            isLoading: false, // Unblock even on error to show error state
          }));
        }
      },

      resetOrganization: () =>
        set({
          profile: {
            id: '',
            name: '',
            industry: '',
            currency: '',
            taxYearEnd: '',
            country: '',
          },
          plants: [],
          departments: [],
          grades: [],
          designations: [],
          positions: [],
          jobLevels: [],

          holidays: [],
          banks: [],
          shifts: [],
          payrollSettings: {
            overtimeEnabled: true,
            taxYearEnd: 'June',
            currency: 'PKR',
            calculationMethod: 'Per Month',
            customFormulas: { staff: '', worker: '' },
            overtime: {
              routine: { staff: '', worker: '' },
              gazetteHoliday: { staff: '', worker: '' },
            },
          },
          users: [],
          systemFlags: {
            mfa_enforced: false,
            biometrics_required: false,
            ip_whitelisting: false,
            session_timeout: '',
            password_complexity: '',
            session_isolation: false,
            neural_bypass: false,
            api_caching: false,
            debug_mode: false,
            immutable_logs: false,
          },
          notificationSettings: {
            email: { smtpServer: '', port: 587, username: '', password: '', fromAddress: '' },
            sms: { provider: 'Twilio', apiKey: '', senderId: '' },
          },
          aiSettings: {
            status: 'offline',
            provider: 'gemini',
            apiKeys: { gemini: '', openai: '', anthropic: '' },
            agents: { resume_screener: false, turnover_predictor: false, chat_assistant: false },
          },
          rbacMatrix: [],
          auditLogs: [],
          complianceSettings: {
            taxYear: '',
            minWage: 0,
            eobiRate: 0,
            socialSecurityRate: 0,
          },
          apiKeys: [],
          webhooks: [],
          complianceResults: [],
          infrastructureLogs: [],
        }),

      // System Admin Actions
      updateRbac: (moduleIndex, roleIndex) =>
        set((state) => {
          const newMatrix = [...state.rbacMatrix];
          newMatrix[moduleIndex].perms[roleIndex] = !newMatrix[moduleIndex].perms[roleIndex];
          return { rbacMatrix: newMatrix };
        }),

      addAuditLog: (log) => {
        // Optimistic Update
        const newLog: AuditLog = {
          id: crypto.randomUUID(),
          time: new Date().toISOString(),
          ...log,
        };
        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs],
        }));

        // System Constitution Ingest
        useSystemStore.getState().ingestSignal({
          source: log.user,
          message: log.action,
          risk: log.status === 'Flagged' ? 'high' : 'low',
          metadata: log,
        });

        // Backend Call (Fire & Forget)
        import('../services/api').then(({ api }) => {
          api.saveAuditLog({ ...log });
        });
      },
      updateCompliance: async (settings) => {
        try {
          // We need full object to save, or partial? API takes partial?
          // Frontend state is partial updates usually.
          // Let's get current state and merge
          const current = get().complianceSettings;
          const merged = { ...current, ...settings };
          const { api } = await import('../services/api');
          await api.saveComplianceSettings(merged);
          set({ complianceSettings: merged });
        } catch (e) {
          console.error('Failed to save compliance settings', e);
          // Optimistic update
          set((state) => ({ complianceSettings: { ...state.complianceSettings, ...settings } }));
        }
      },
      resetRbac: () => set({ rbacMatrix: [] }),
      runComplianceCheck: () => {
        // Trigger Governance Evaluation
        useSystemStore.getState().ingestSignal({
          source: 'ComplianceCheck',
          message: 'System-wide compliance audit initiated',
          risk: 'medium',
        });

        set({ complianceResults: [] });
      },

      addPlant: async (plant) => {
        const { api } = await import('../services/api');
        try {
          // Check for ID, if new generated by UI, we might need to handle it or let backend generate.
          // UI usually generates temp ID.
          const saved = await api.createPlant(plant);
          set((state) => ({ plants: [...state.plants, saved] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updatePlant: async (id, plant) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updatePlant(id, plant as Plant);
          set((state) => ({
            plants: state.plants.map((p) => (p.id === id ? { ...p, ...updated } : p)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deletePlant: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deletePlant(id);
          set((state) => ({ plants: state.plants.filter((p) => p.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addDepartment: async (dept) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveDepartment(dept);
          set((state) => ({
            departments: [...state.departments, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateDepartment: async (id, dept) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateDepartment(id, dept);
          set((state) => ({
            departments: state.departments.map((d) => (d.id === id ? { ...d, ...updated } : d)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteDepartment: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteDepartment(id);
          set((state) => ({
            departments: state.departments.filter((d) => d.id !== id),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addSubDepartment: async (subDept) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveSubDepartment(subDept);
          set((state) => ({ subDepartments: [...state.subDepartments, saved] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateSubDepartment: async (id, subDept) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateSubDepartment(id, subDept);
          set((state) => ({
            subDepartments: state.subDepartments.map((d) =>
              d.id === id ? { ...d, ...updated } : d
            ),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteSubDepartment: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteSubDepartment(id);
          set((state) => ({ subDepartments: state.subDepartments.filter((d) => d.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addGrade: async (grade) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveGrade(grade);
          set((state) => ({
            grades: [...state.grades, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateGrade: async (gradeId, grade) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateGrade(gradeId, grade);
          set((state) => ({
            grades: state.grades.map((g) => (g.id === gradeId ? { ...g, ...updated } : g)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteGrade: async (gradeId) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteGrade(gradeId);
          set((state) => ({
            grades: state.grades.filter((g) => g.id !== gradeId),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addDesignation: async (designation) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveDesignation(designation);
          set((state) => ({
            designations: [...state.designations, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateDesignation: async (id, designation) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateDesignation(id, designation);
          set((state) => ({
            designations: state.designations.map((d) => (d.id === id ? { ...d, ...updated } : d)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteDesignation: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteDesignation(id);
          set((state) => ({
            designations: state.designations.filter((d) => d.id !== id),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addPosition: async (position) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.savePosition(position);
          set((state) => ({ positions: [...state.positions, saved] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updatePosition: async (id, position) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updatePosition(id, position);
          set((state) => ({
            positions: state.positions.map((p) => (p.id === id ? { ...p, ...updated } : p)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deletePosition: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deletePosition(id);
          set((state) => ({ positions: state.positions.filter((p) => p.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addJobLevel: async (level) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.createJobLevel(level);
          set((state) => ({
            jobLevels: [...state.jobLevels, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateJobLevel: async (id, level) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateJobLevel(id, level);
          set((state) => ({
            jobLevels: state.jobLevels.map((l) => (l.id === id ? { ...l, ...updated } : l)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteJobLevel: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteJobLevel(id);
          set((state) => ({
            jobLevels: state.jobLevels.filter((l) => l.id !== id),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      // Holidays & Banks - Wired to API
      addHoliday: async (holiday) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveHoliday(holiday);
          set((state) => ({ holidays: [...state.holidays, saved] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateHoliday: async (id, holiday) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.saveHoliday({ ...holiday, id } as Holiday);
          set((state) => ({
            holidays: state.holidays.map((h) => (h.id === id ? { ...h, ...updated } : h)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteHoliday: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteHoliday(id);
          set((state) => ({ holidays: state.holidays.filter((h) => h.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addBank: async (bank) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveBank(bank);
          set((state) => ({ banks: [...state.banks, saved] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateBank: async (id, bank) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.saveBank({ ...bank, id } as Bank);
          set((state) => ({
            banks: state.banks.map((b) => (b.id === id ? { ...b, ...updated } : b)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteBank: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteBank(id);
          set((state) => ({ banks: state.banks.filter((b) => b.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      addShift: async (shift) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.saveShift(shift as Shift);
          set((state) => ({
            shifts: [...state.shifts, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateShift: async (id, shift) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateShift(id, shift);
          set((state) => ({
            shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updated } : s)),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteShift: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteShift(id);
          set((state) => ({
            shifts: state.shifts.filter((s) => s.id !== id),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      updatePayrollSettings: (settings) =>
        set((state) => ({ payrollSettings: { ...state.payrollSettings, ...settings } })),

      addUser: async (user) => {
        // Optimistic update
        set((state) => ({ users: [...state.users, user] }));
        // Persist to backend
        try {
          const { api } = await import('../services/api');
          await api.saveUser(user);
        } catch (e) {
          console.error('Failed to save user to backend', e);
          // Rollback on failure
          set((state) => ({ users: state.users.filter((u) => u.id !== user.id) }));
          throw e;
        }
      },
      updateUser: async (id, updates) => {
        const oldUser = get().users.find((u) => u.id === id);
        // Optimistic update
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
        // Persist to backend
        try {
          const { api } = await import('../services/api');
          await api.updateUser(id, { ...oldUser, ...updates });
        } catch (e) {
          console.error('Failed to update user in backend', e);
          // Rollback on failure
          if (oldUser) {
            set((state) => ({
              users: state.users.map((u) => (u.id === id ? oldUser : u)),
            }));
          }
          throw e;
        }
      },
      deleteUser: async (id) => {
        const oldUser = get().users.find((u) => u.id === id);
        // Optimistic update
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
        // Persist to backend
        try {
          const { api } = await import('../services/api');
          await api.deleteUser(id);
        } catch (e) {
          console.error('Failed to delete user from backend', e);
          // Rollback on failure
          if (oldUser) {
            set((state) => ({ users: [...state.users, oldUser] }));
          }
          throw e;
        }
      },
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      refreshCurrentUser: async () => {
        const { secureStorage } = await import('../utils/secureStorage');

        // Try to restore from 'current_user' (set by Login)
        const storedUser = secureStorage.getItem('current_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Ensure it matches User interface
            const user: User = {
              id: parsed.id || '',
              name: parsed.username || parsed.name || 'User',
              email: parsed.email || '',
              role: parsed.role || 'Employee',
              username: parsed.username || '',
              employeeId: parsed.employeeId || '',
              department: '',
              profileStatus: parsed.status === 'Active' ? 'Active' : 'Inactive',
              userType: 'SystemAdmin',
              status: parsed.status || 'Active',
              lastLogin: new Date().toISOString(),
            };
            set({ currentUser: user });
            // Don't return, allow email check to act as backup or sync
          } catch (e) {
            console.error('Failed to parse current_user', e);
          }
        }

        const email = secureStorage.getItem('user_email');
        const currentUser = get().currentUser;

        if (!currentUser && email) {
          try {
            const { api } = await import('../services/api');
            const users = await api.getUsers();
            const found = users.find((u: any) => u.email === email || u.username === email);

            if (found) {
              const mappedUser: User = {
                id: found.id || '',
                name: found.name || found.username || 'User',
                email: found.email || '',
                role: found.role || 'Employee',
                username: found.username || '',
                employeeId: found.employeeId || '',
                department: '',
                profileStatus: found.status === 'Active' ? 'Active' : 'Inactive',
                userType: 'SystemAdmin',
                status: found.status || 'Active',
                lastLogin: new Date().toISOString(),
              };
              set({ currentUser: mappedUser });
            }
          } catch (e) {
            console.error('Failed to restore user session', e);
          }
        }
      },
      syncProfileStatus: async (employeeId, status) => {
        // Update user profile status when linked employee status changes
        const affectedUser = get().users.find((u) => u.employeeId === employeeId);
        if (!affectedUser) {
          return;
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.employeeId === employeeId ? { ...u, profileStatus: status } : u
          ),
        }));
        // Persist to backend
        try {
          const { api } = await import('../services/api');
          await api.updateUser(affectedUser.id, { ...affectedUser, profileStatus: status });
        } catch (e) {
          console.error('Failed to sync profile status', e);
        }
      },
      updateSystemFlags: async (flags) => {
        try {
          // Call backend API to update flags
          const { api } = await import('../services/api');
          const response = await api.updateSystemFlags(flags);

          set((state) => ({ systemFlags: { ...state.systemFlags, ...response } }));
          return response;
        } catch (error) {
          console.error('Failed to update system flags:', error);
          throw error;
        }
      },
      flushCache: async () => {
        try {
          const { api } = await import('../services/api');
          const result = await api.flushCache();
          Logger.info('Cache flush initiated:', result);
          return result;
        } catch (error) {
          console.error('Failed to flush cache:', error);
          throw error;
        }
      },
      optimizeDatabase: async () => {
        try {
          const { api } = await import('../services/api');
          const result = await api.optimizeDatabase();
          Logger.info('Database optimization initiated:', result);
          return result;
        } catch (error) {
          console.error('Failed to optimize database:', error);
          throw error;
        }
      },
      rotateLogs: async () => {
        try {
          const { api } = await import('../services/api');
          const result = await api.rotateLogs();
          Logger.info('Log rotation initiated:', result);
          return result;
        } catch (error) {
          console.error('Failed to rotate logs:', error);
          throw error;
        }
      },
      fetchBackups: async () => {
        try {
          const { api } = await import('../services/api');
          const result = await api.getBackups();
          set({ backups: result });
        } catch (error) {
          console.error('Failed to fetch backups:', error);
        }
      },
      restoreFromServer: async (filename) => {
        try {
          const { api } = await import('../services/api');
          await api.restoreFromServer(filename);
        } catch (error) {
          console.error('Failed to restore from server:', error);
          throw error;
        }
      },
      updateAiSettings: async (settings) => {
        try {
          const { api } = await import('../services/api');
          await api.updateAiSettings(settings); // Now persistent
          set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } }));
        } catch (e) {
          console.error('Failed to update AI settings', e);
          // Fallback to optimistic local update
          set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } }));
        }
      },
      updateNotificationSettings: async (settings) => {
        try {
          // Call backend API to update notification settings
          const { api } = await import('../services/api');
          const response = await api.updateNotificationSettings(settings);

          set((state) => ({
            notificationSettings: { ...state.notificationSettings, ...response },
          }));
          return response;
        } catch (error) {
          console.error('Failed to update notification settings:', error);
          throw error;
        }
      },
      fetchSystemFlags: async () => {
        try {
          const { api } = await import('../services/api');
          const data = await api.getSystemFlags();
          set({ systemFlags: data });
        } catch (e) {
          console.error('fetchSystemFlags failed', e);
        }
      },
      testEmailNotification: async (recipient) => {
        try {
          const { api } = await import('../services/api');
          const result = await api.testEmailNotification(recipient);
          Logger.info('Test email sent:', result);
          return result;
        } catch (error) {
          console.error('Failed to send test email:', error);
          throw error;
        }
      },
      getBackgroundJobs: async (skip, limit, status) => {
        try {
          const { api } = await import('../services/api');
          const result = await api.getBackgroundJobs(skip, limit, status);
          return result;
        } catch (error) {
          console.error('Failed to retrieve background jobs:', error);
          throw error;
        }
      },
      cancelBackgroundJob: async (jobId) => {
        try {
          const { api } = await import('../services/api');
          const result = await api.cancelBackgroundJob(jobId);
          Logger.info('Background job cancelled:', result);
          return result;
        } catch (error) {
          console.error('Failed to cancel background job:', error);
          throw error;
        }
      },
      addApiKey: async (name, scope) => {
        try {
          // Call backend API to create the key
          const { api } = await import('../services/api');
          const response = await api.createApiKey(name);

          // Show the raw key once in a modal/notification
          // Store only the masked version in state
          set((state) => ({
            apiKeys: [
              ...state.apiKeys,
              {
                id: response.id,
                name: response.name,
                scope, // Keep scope for reference
                key: response.key_preview, // Masked key
                created: new Date(response.created_at).toISOString().split('T')[0],
                lastUsed: response.last_used
                  ? new Date(response.last_used).toISOString().split('T')[0]
                  : 'Never',
              },
            ],
          }));

          // Automated Logging
          get().addAuditLog({
            user: get().currentUser?.name || 'System',
            action: `Created API Key: ${name} (${scope})`,
            status: 'Hashed',
          });

          // Return the raw key so it can be displayed once
          return response.raw_key;
        } catch (error) {
          console.error('Failed to create API key:', error);
          throw error;
        }
      },
      deleteApiKey: async (id) => {
        try {
          const { api } = await import('../services/api');
          await api.deleteApiKey(id);
          set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) }));

          // Automated Logging
          get().addAuditLog({
            user: get().currentUser?.name || 'System',
            action: `Revoked API Key: ${id}`,
            status: 'Hashed',
          });
        } catch (error) {
          console.error('Failed to delete API key:', error);
          throw error;
        }
      },
      addWebhook: async (webhook) => {
        try {
          const { api } = await import('../services/api');
          // Call backend API to create webhook
          const response = await api.createWebhook(
            webhook.name,
            webhook.url,
            webhook.events || [],
            webhook.headers
          );

          set((state) => ({
            webhooks: [
              ...state.webhooks,
              {
                id: response.id,
                name: response.name,
                url: response.url,
                events: response.event_types, // Mapped from backend response
                status: response.is_active ? 'Active' : 'Inactive',
                logs: [],
              },
            ],
          }));

          return response;
        } catch (error) {
          console.error('Failed to create webhook:', error);
          throw error;
        }
      },
      simulateWebhookDelivery: async (id) => {
        try {
          // Call backend test endpoint
          const { api } = await import('../services/api');
          const result = await api.testWebhook(id);

          // Update webhook state with test result
          set((state) => ({
            webhooks: state.webhooks.map((w) =>
              w.id === id
                ? {
                    ...w,
                    logs: [
                      {
                        id: `log-${Date.now()}`,
                        timestamp: formatTime(new Date()),
                        status: (result.status_code < 400 ? 'Success' : 'Failed') as
                          | 'Success'
                          | 'Failed',
                        responseCode: result.status_code,
                      },
                      ...(w.logs || []),
                    ].slice(0, 5),
                  }
                : w
            ),
          }));

          return result;
        } catch (error) {
          console.error('Failed to test webhook:', error);
          throw error;
        }
      },
      deleteWebhook: async (id) => {
        try {
          const { api } = await import('../services/api');
          await api.deleteWebhook(id);
          set((state) => ({ webhooks: state.webhooks.filter((w) => w.id !== id) }));
        } catch (error) {
          console.error('Failed to delete webhook:', error);
          throw error;
        }
      },

      addBusinessRule: (rule) =>
        set((state) => ({ businessRules: [...state.businessRules, rule] })),
      updateBusinessRule: (id, rule) =>
        set((state) => ({
          businessRules: state.businessRules.map((r) => (r.id === id ? { ...r, ...rule } : r)),
        })),
      deleteBusinessRule: (id) =>
        set((state) => ({ businessRules: state.businessRules.filter((r) => r.id !== id) })),

      addPayrollRecord: (record) =>
        set((state) => ({ payrollRecords: [...state.payrollRecords, record] })),

      fetchAuditLogs: async (skip = 0, limit = 100) => {
        set({ loadingEntities: { ...get().loadingEntities, auditLogs: true } });
        try {
          const { api } = await import('../services/api');
          const logs = await api.getAuditLogs(skip, limit);
          set({ auditLogs: logs, loadingEntities: { ...get().loadingEntities, auditLogs: false } });
        } catch (error: any) {
          console.error('fetchAuditLogs failed', error);
          set({
            errorEntities: {
              ...get().errorEntities,
              auditLogs: error?.message || 'Failed to load audit logs',
            },
            loadingEntities: { ...get().loadingEntities, auditLogs: false },
          });
        }
      },
    }),
    {
      name: 'org-storage',
      storage: createJSONStorage(() => sessionStorage), // Keeping sessionStorage to match previous behavior but automated
      partialize: (state) => ({
        currentUser: state.currentUser,
        // We can persist other things too if needed, but starting with currentUser
      }),
    }
  )
);

export { ROLE_HIERARCHY, ROLE_PERMISSIONS, type Permission } from '../types';
