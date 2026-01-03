import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSystemStore } from '@/system/systemStore';
import {
  EmploymentLevel,
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
  MasterDepartment,
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

  // Entity state management
  clearEntityError: (entity: string) => void;

  fetchMasterData: () => Promise<void>;
  // Stats & UI State
  // Master Data
  profile: OrganizationProfile;
  grades: Grade[];
  designations: Designation[];
  employmentLevels: EmploymentLevel[];
  employees: Employee[];
  shifts: Shift[];
  departments: Department[];
  subDepartments: SubDepartment[];
  masterDepartments: MasterDepartment[];
  plants: Plant[];
  holidays: Holiday[];
  banks: Bank[];
  positions: Position[];
  users: User[];
  systemFlags: SystemFlags;
  aiSettings: AISettings;
  currentUser: User | null;
  payrollSettings: PayrollSettings;

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
  fetchEmploymentLevels: () => Promise<void>;
  fetchHolidays: () => Promise<void>;
  fetchBanks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchMasterDepartments: () => Promise<void>;

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

  addMasterDepartment: (dept: MasterDepartment) => void;
  updateMasterDepartment: (id: string, dept: Partial<MasterDepartment>) => void;
  deleteMasterDepartment: (id: string) => void;

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

  addEmploymentLevel: (level: EmploymentLevel) => Promise<void>;
  updateEmploymentLevel: (id: string, level: Partial<EmploymentLevel>) => Promise<void>;
  deleteEmploymentLevel: (id: string) => Promise<void>;

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
      masterDepartments: [],
      departments: [],
      grades: [],
      designations: [],
      positions: [],
      jobLevels: [],
      employmentLevels: [],
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

      clearEntityError: (entity: string) => {
        set((s) => ({ errorEntities: { ...s.errorEntities, [entity]: null } }));
      },

      fetchMasterData: async () => {
        try {
          const { api } = await import('../services/api');

          // Define fallback for robust handling
          // If API fails, we return NULL, so we can detect failure and preserve existing state.
          const [
            desig,
            grades,
            depts,
            subDepts,
            plants,
            shifts,
            payrollSettings,
            users,
            empTypes,
            employees,
            holidays,
            banks,
            positions,
            systemFlags,
          ] = await Promise.all([
            api.getDesignations().catch((e) => {
              console.error('Failed to load designations', e);
              return null;
            }),
            api.getGrades().catch((e) => {
              console.error('Failed to load grades', e);
              return null;
            }),
            api.getDepartments().catch((e) => {
              console.error('Failed to load departments', e);
              return null;
            }),
            api.getSubDepartments().catch((e) => {
              console.error('Failed to load sub-departments', e);
              return null;
            }),
            (api.getPlants ? api.getPlants() : Promise.resolve([])).catch((e) => {
              console.error('Failed to load plants', e);
              return null;
            }),
            api.getShifts().catch((e) => {
              console.error('Failed to load shifts', e);
              return null;
            }),
            api.getPayrollSettings().catch((e) => {
              console.error('Failed to load payroll settings', e);
              return null;
            }),
            api.getUsers().catch((e) => {
              console.error('Failed to load users', e);
              return null;
            }),
            api.getEmploymentLevels().catch((e) => {
              console.error('Failed to load employment levels', e);
              return null;
            }),
            api.getEmployees().catch((e) => {
              console.error('Failed to load employees', e);
              return null;
            }),
            api.getHolidays().catch((e) => {
              console.error('Failed to load holidays', e);
              return null;
            }),
            api.getBanks().catch((e) => {
              console.error('Failed to load banks', e);
              return null;
            }),
            (api.getPositions ? api.getPositions() : Promise.resolve(null)).catch((e) => {
              console.error('Failed to load positions', e);
              return null;
            }),
            (api.getSystemFlags ? api.getSystemFlags() : Promise.resolve(null)).catch((e) => {
              console.error('Failed to load system flags', e);
              return null;
            }),
          ]);

          // Defensive Update: Only overwrite if we got valid data AND current state is empty.
          // This prevents fetchMasterData from overwriting data loaded by granular lazy-loading actions.

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

          set((state) => ({
            designations:
              desig !== null && state.designations.length === 0 ? desig : state.designations,
            grades: grades !== null && state.grades.length === 0 ? grades : state.grades,
            departments:
              depts !== null && state.departments.length === 0 ? depts : state.departments,
            subDepartments:
              subDepts !== null && state.subDepartments.length === 0
                ? subDepts
                : state.subDepartments,
            plants: plants !== null && state.plants.length === 0 ? plants : state.plants,
            shifts: shifts !== null && state.shifts.length === 0 ? shifts : state.shifts,
            payrollSettings: payrollSettings !== null ? payrollSettings : state.payrollSettings,
            users: users !== null && state.users.length === 0 ? users : state.users,
            employmentLevels:
              empTypes !== null && state.employmentLevels.length === 0
                ? empTypes
                : state.employmentLevels,
            employees:
              employees !== null && state.employees.length === 0 ? employees : state.employees,
            holidays: holidays !== null && state.holidays.length === 0 ? holidays : state.holidays,
            banks: banks !== null && state.banks.length === 0 ? banks : state.banks,
            positions:
              positions !== null && state.positions.length === 0 ? positions : state.positions,
            systemFlags:
              systemFlags !== null ? { ...state.systemFlags, ...systemFlags } : state.systemFlags,
          }));

          // Constitution: Analyze System Pressure & Entropy
          useSystemStore.getState().runCycle();
        } catch (error) {
          console.error('Critical Failure in fetchMasterData', error);
          // Do not re-throw to prevent crash loop, but maybe set error state?
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

      fetchEmploymentLevels: async () => {
        if (get().loadingEntities['employmentLevels']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, employmentLevels: true },
          errorEntities: { ...s.errorEntities, employmentLevels: null },
        }));
        try {
          const { api } = await import('../services/api');
          const data = await api.getEmploymentLevels();
          set({ employmentLevels: data });
        } catch (e: any) {
          console.error('fetchEmploymentLevels failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              employmentLevels: e?.message || 'Failed to load job levels',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, employmentLevels: false } }));
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

      fetchMasterDepartments: async () => {
        if (get().loadingEntities['masterDepartments']) {
          return;
        }
        set((s) => ({
          loadingEntities: { ...s.loadingEntities, masterDepartments: true },
          errorEntities: { ...s.errorEntities, masterDepartments: null },
        }));
        try {
          const { api } = await import('../services/api');
          const allDepts = await api.getDepartments();
          // Filter for global departments (no plantId)
          const masterDepts = allDepts.filter((d: any) => !d.plantId);
          set({ masterDepartments: masterDepts as unknown as MasterDepartment[] });
        } catch (e: any) {
          console.error('fetchMasterDepartments failed', e);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              masterDepartments: e?.message || 'Failed to load global departments',
            },
          }));
        } finally {
          set((s) => ({ loadingEntities: { ...s.loadingEntities, masterDepartments: false } }));
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
            console.log('Profile saved successfully:', savedProfile.name);
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
          const [
            employees,
            depts,
            subs,
            grades,
            desigs,
            plants,
            shifts,
            payroll,
            // jobVacancies,
            holidays,
            banks,
            remotePerms,
            aiSettings,
            notificationSettings,
            complianceSettings,
            systemFlags,
          ] = await Promise.all([
            api.getEmployees(),
            api.getDepartments(),
            api.getSubDepartments(),
            api.getGrades(),
            api.getDesignations(),
            api.getPlants ? api.getPlants() : Promise.resolve([]),
            api.getShifts(),
            api.getPayrollSettings(),
            // api.getJobVacancies(),
            api.getHolidays(),
            api.getBanks(),
            api.getRolePermissions(),
            api.getAISettings(),
            api.getNotificationSettings(),
            api.getComplianceSettings(),
            api.getSystemFlags(),
            // Background fetch for heavy stats
            api.getDepartmentStats().then((stats) => set({ departmentStats: stats })),
            api.getAttendanceStats().then((stats) => set({ attendanceStats: stats })),
          ]);

          // Merge Remote Permissions with Defaults (Prioritize Remote)
          // Assuming INITIAL_ROLE_PERMISSIONS, SystemRole, and Permission are defined elsewhere

          const mergedPerms = { ...INITIAL_ROLE_PERMISSIONS };
          Object.entries(remotePerms).forEach(([role, perms]) => {
            if (perms && perms.length > 0) {
              // Ensure we typed cast properly or validate
              (mergedPerms as any)[role] = perms;
            }
          });

          set({
            employees,
            departments: depts,
            subDepartments: subs,
            grades,
            designations: desigs,
            plants,
            shifts,
            payrollSettings: payroll,
            // jobVacancies removed (schema update)
            holidays: holidays,
            banks: banks,
            rolePermissions: mergedPerms,
            aiSettings: aiSettings || get().aiSettings,
            notificationSettings: notificationSettings || get().notificationSettings,
            complianceSettings: complianceSettings || get().complianceSettings,
            systemFlags: systemFlags || get().systemFlags,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('initData failed', error);
          set((s) => ({
            errorEntities: {
              ...s.errorEntities,
              initData: error?.message || 'Failed to initialize data',
            },
            isLoading: false,
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
          employmentLevels: [],

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
      addMasterDepartment: async (dept) => {
        const { api } = await import('../services/api');
        try {
          // Master Dept = Dept with NO plantId
          const saved = await api.saveDepartment({ ...dept, plantId: null } as any);
          set((state) => ({
            masterDepartments: [...state.masterDepartments, saved as unknown as MasterDepartment],
          }));

          // Automated Logging
          const user = get().currentUser?.name || 'System';
          get().addAuditLog({
            user,
            action: `Created Master Department: ${dept.name}`,
            status: 'Hashed',
          });
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateMasterDepartment: async (id, updates) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateDepartment(id, updates as any);
          set((state) => ({
            masterDepartments: state.masterDepartments.map((d) =>
              d.id === id ? { ...d, ...updated } : d
            ),
          }));

          // Automated Logging
          const user = get().currentUser?.name || 'System';
          get().addAuditLog({
            user,
            action: `Updated Master Department: ${id}`,
            status: 'Hashed',
          });
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteMasterDepartment: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteDepartment(id);
          set((state) => ({
            masterDepartments: state.masterDepartments.filter((d) => d.id !== id),
          }));

          // Automated Logging
          const user = get().currentUser?.name || 'System';
          get().addAuditLog({
            user,
            action: `Deleted Master Department: ${id}`,
            status: 'Hashed',
          });
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
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
          const saved = await api.savePlant(plant);
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

      addEmploymentLevel: async (level) => {
        const { api } = await import('../services/api');
        try {
          const saved = await api.addEmploymentLevel(level);
          set((state) => ({
            employmentLevels: [...state.employmentLevels, saved],
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateEmploymentLevel: async (id, level) => {
        const { api } = await import('../services/api');
        try {
          const updated = await api.updateEmploymentLevel(id, level as EmploymentLevel);
          set((state) => ({
            employmentLevels: state.employmentLevels.map((l) =>
              l.id === id ? { ...l, ...updated } : l
            ),
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteEmploymentLevel: async (id) => {
        const { api } = await import('../services/api');
        try {
          await api.deleteEmploymentLevel(id);
          set((state) => ({
            employmentLevels: state.employmentLevels.filter((l) => l.id !== id),
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
          console.log('Cache flush initiated:', result);
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
          console.log('Database optimization initiated:', result);
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
          console.log('Log rotation initiated:', result);
          return result;
        } catch (error) {
          console.error('Failed to rotate logs:', error);
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
          console.log('Test email sent:', result);
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
          console.log('Background job cancelled:', result);
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
                        timestamp: new Date().toLocaleTimeString(),
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
