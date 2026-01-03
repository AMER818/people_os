export interface OrganizationProfile {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  coverUrl?: string; // New
  currency: string;
  taxYearEnd: string;
  country: string;
  code?: string;
  email?: string;
  website?: string;
  phone?: string;
  description?: string;

  // New Legal & Address Fields
  taxId?: string;
  registrationNumber?: string;
  foundedDate?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  socialLinks?:
    | string
    | {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
      };

  // Phase 2: System Authority Fields (Settings)
  defaultLanguage?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface OrganizationAddress {
  id: string;
  organizationId: string;
  type: 'Billing' | 'Shipping' | 'HQ';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isPrimary: boolean;
}

export interface Position {
  id: string;
  organizationId: string;
  title: string;
  code: string;
  description?: string;
  departmentId: string; // Link to Department
  designationId?: string; // Link to Master Designation
  reportsToPositionId?: string; // Hierarchy
  jobFamily?: string;
  level?: string;
  isActive: boolean;
}

export interface RoleDefinition {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  permissions: string[]; // JSON or separate relation
  scope: 'Global' | 'Department' | 'Self';
  isSystem: boolean; // Prevent deletion of default roles
}

export interface OrgPolicy {
  id: string;
  organizationId: string;
  type: 'Leave' | 'Attendance' | 'Approval' | 'Payroll' | 'Recruitment';
  name: string;
  description?: string;
  config: Record<string, any>; // JSON configuration
  isActive: boolean;
  version: string;
}

export type ModuleType =
  | 'dashboard'
  | 'employees'
  | 'org-settings'
  | 'recruitment'
  | 'job-postings'
  | 'onboarding'
  | 'offboarding'
  | 'attendance'
  | 'leaves'
  | 'overtime'
  | 'payroll'
  | 'tax-compliance'
  | 'compensation'
  | 'benefits'
  | 'performance'
  | 'learning'
  | 'skills'
  | 'succession'
  | 'engagement'
  | 'rewards'
  | 'relations'
  | 'health-safety'
  | 'travel'
  | 'expenses'
  | 'assets'
  | 'alumni'
  | 'analytics'
  | 'workflow'
  | 'neural'
  | 'system-settings'
  | 'integration'
  | 'self-service'
  | 'admin'
  | 'visitors'
  | 'assistance'
  | 'system-health'
  | 'hunzal-chat';

export interface Plant {
  id: string;
  name: string;
  location: string;
  code: string;
  headOfPlant?: string;
  contactNumber?: string;
  capacity?: number;
  organizationId?: string;
  isActive?: boolean;
  currentSequence?: number;
  divisions?: PlantDivision[]; // Added for plant-specific divisions
}

export interface PlantDivision {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  plantId?: string;
}

export interface MasterDepartment {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  subDepartments: string[];
  headOfDept?: string;
  budgetCode?: string;
  code?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
  plantId?: string; // Link to Plant
  hodId?: string; // Link to Employee (HOD)
}

export interface SubDepartment {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string;
  isActive?: boolean;
  organizationId?: string;
}

export interface Grade {
  id: string;
  name: string;
  level: number;
  isActive?: boolean;
  employmentLevelId?: string; // Link to Employment Type/Level
}

export interface Designation {
  id: string;
  name: string;
  gradeId: string;
  isActive?: boolean;
}

export interface DesignationGrade {
  grade: string;
  designations: string[];
}

export interface EmploymentLevel {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'Public' | 'National' | 'Religious' | 'International';
}

export interface Bank {
  id: string;
  name: string;
  branchCode: string;
  accountNumber: string;
  iban: string;
  swiftCode?: string;
  address?: string;
  contactPerson?: string;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  type: 'Fixed' | 'Reliever' | 'Rotating' | 'Flexible';
  startTime: string;
  endTime: string;
  gracePeriod: number; // minutes
  breakDuration: number; // minutes
  workDays: string[]; // e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
}

export interface PayrollSettings {
  overtimeEnabled: boolean;
  taxYearEnd: string;
  currency: string;
  calculationMethod: 'Per Month' | 'Per Day' | 'User Defined' | '';
  customFormulas: {
    staff: string;
    worker: string;
  };
  overtime: {
    routine: {
      staff: string;
      worker: string;
    };
    gazetteHoliday: {
      staff: string;
      worker: string;
    };
  };
}

export type UserType = 'SystemAdmin' | 'OrgUser';

export interface User {
  id: string;
  username: string; // Added backend requirement
  password?: string; // Added for creation/update only
  name: string;
  email: string;
  userType: UserType;
  role: 'Root' | 'Super Admin' | 'SystemAdmin' | 'Business Admin'; // System roles only - Org roles TBD
  status: 'Active' | 'Inactive' | 'Locked';
  profileStatus?: 'Active' | 'Inactive'; // For OrgUser linked profiles
  avatar?: string;
  employeeId?: string; // Link to Employee profile
  lastLogin?: string;
  department?: string;
  phone?: string;
  isSystemUser?: boolean; // Backend flag for system administrators
}

export type AssetCategory =
  | 'Laptop'
  | 'Desktop PC'
  | 'Mobile'
  | 'Tablet'
  | 'IT Gadget'
  | 'Vehicle'
  | 'Software'
  | 'Furniture'
  | 'Network';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  custodianId: string;
  custodianName: string;
  assignedDate: string;
  status: 'Deployed' | 'Maintenance' | 'Storage' | 'Retired';
  specifications?: string;
}

export interface Expense {
  id: string;
  employeeName: string;
  category: 'Travel' | 'Meals' | 'Equipment' | 'Utility' | 'Accommodation' | 'Transport' | 'Other';
  amount: number;
  currency: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Flagged' | 'Paid' | 'Rejected';
  receiptUrl?: string;
}

export interface OnboardingNode {
  id: string;
  name: string;
  position: string;
  progress: number;
  startDate: string;
  steps: { label: string; done: boolean }[];
}

export interface FamilyMember {
  name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Brother' | 'Sister' | 'Other';
  dob: string;
}

export interface Education {
  degree: string;
  institute: string;
  year: string;
  gradeGpa: string;
  marksObtained: number;
  totalMarks: number;
}

export interface Experience {
  orgName: string;
  from: string;
  to: string;
  designation: string;
  grossSalary: number;
  remarks: string;
}

export interface Increment {
  effectiveDate: string;
  newGross: number;
  newHouseRent?: number;
  newUtilityAllowance?: number;
  newOtherAllowance?: number;
  type: 'Hiring' | 'Increment' | 'Promotion' | 'Adjustment' | 'Correction';
  remarks: string;
  createdAt: string;
  createdBy: string;
}

export interface DisciplinaryAction {
  id: string;
  date: string;
  description: string;
  outcome: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

export interface OTRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  rate: number;
  status: 'Pending' | 'Approved' | 'Processed';
  reason: string;
}

// Shift interface moved to top

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  salaryRange: string; // Changed from salary
  status: 'Active' | 'Paused' | 'Closed';
  applicants: number; // Changed from applicantsCount
  description: string;
  postedDate: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  positionApplied: string;
  currentStage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  score: number; // AI Fit Score
  resumeUrl: string;
  skills: string[];
  appliedDate: string;
  avatar: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  designation_id?: string;
  grade_id?: string;
  department_id?: string;
  sub_department_id?: string;
  plant_id?: string;
  organization_id?: string;
  shift_id?: string;
  division?: 'White' | 'Black' | 'Nil';
  present_district_id?: string;
  permanent_district_id?: string;
  line_manager_id?: string;

  // Legacy/Display fields (kept for compatibility)
  designation: string;
  grade: string;
  department: string;
  subDepartment?: string;
  hrPlant: string;
  orgName: string;
  shift: string;
  restDay: string;

  // Personal
  maritalStatus: 'Single' | 'Married' | 'Divorced';
  weddingAnniversaryDate?: string;
  bloodGroup: string;
  religion: string;
  nationality: string;
  passportNumber?: string;
  drivingLicense?: string;
  cnic: string;
  cnicIssueDate?: string;
  cnicExpiryDate: string;
  dateOfBirth: string;
  gender?: string;
  fatherName: string;
  motherName?: string;

  // Contact
  reference?: string;
  personalCellNumber: string;
  officialCellNumber?: string;
  phoneNumber?: string;
  personalEmail?: string;
  officialEmail?: string;
  email?: string; // Legacy
  presentAddress: string;
  permanentAddress: string;
  presentDistrict: string;
  permanentDistrict: string;
  millsResidenceBlock?: string;
  millsRoom?: string;

  // Employment
  employmentLevel: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated' | 'Retired';
  joiningDate: string;
  confirmationDate?: string;
  probationPeriod?: string;

  leavingDate?: string;
  leavingType?: 'Resignation' | 'SOS' | 'Termination' | 'Retirement' | 'Death' | 'Dismissal';

  // Benefits / Financials
  grossSalary: number;
  paymentMode: 'Cash' | 'Cheque' | 'Bank Transfer';
  bankId?: string; // For bank transfer
  bankAccount?: string;

  // Allowances
  houseRent?: number;
  utilityAllowance?: number;
  otherAllowance?: number;

  // Benefits
  socialSecurityStatus: boolean;
  socialSecurityNumber?: string;
  medicalStatus: boolean;
  eobiStatus: boolean;
  eobiNumber?: string;

  avatar?: string;

  // Computed / System
  burnoutRisk?: 'Low' | 'Medium' | 'High' | 'Critical';
  performanceScore?: number;
  sentimentScore?: number;

  // Other
  education: Education[];
  experience: Experience[];
  increments: Increment[];
  discipline: DisciplinaryAction[];
  family: FamilyMember[];
}

export interface VisitorNode {
  id: string;
  name: string;
  company: string;
  cnic: string;
  host: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  status: 'On-Site' | 'Checked-Out' | 'Pending Approval' | 'Authorized';
  requestDate: string;
  avatar?: string;
}

export interface Goal {
  id: string; // Changed from number
  title: string;
  category: 'Operational' | 'Strategic' | 'Culture' | 'Development';
  progress: number;
  metric: string; // Added
  status: string;
  dueDate: string; // Added
  weight: number;
  description: string; // Added
  trend?: 'up' | 'down' | 'neutral'; // Optional now as backend doesn't have it yet? Or computed?
}

export interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

export interface NewHireNode {
  id: string;
  name: string;
  role: string;
  progress: number;
  mentor: string;
  startDate: string;
  steps: OnboardingStep[];
}

export interface ExitNode {
  id: string;
  name: string;
  role: string;
  type: string;
  lDate: string;
  status: 'Initiated' | 'In Progress' | 'Cleared' | 'Terminated';
  checklist: { id: string; label: string; done: boolean }[];
}

export interface LeaveBalance {
  employeeId: string;
  name: string;
  annual: number;
  sick: number;
  casual: number;
  total: number;
  used: number;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  code: string;
  shift: string;
  inTime: string;
  outTime: string;
  duration: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
  verification: 'Facial' | 'GPS' | 'Manual';
  location: string;
}

export interface Course {
  id: number;
  title: string;
  provider: string;
  duration: string;
  level: string;
  score: number;
  status: 'Completed' | 'In Progress' | 'Enrolled' | 'Recommended';
  progress?: number;
  icon?: any; // Keeping as any for now as it stores Lucide icon components in mock data, but in real app this might be a string identifier
  color: string;
}

export interface BenefitEnrollment {
  id: string;
  name: string;
  tier: 'Standard' | 'Gold' | 'Platinum';
  date: string;
  status: 'Active' | 'Pending';
}

export interface BenefitTier {
  name: string;
  color: string;
  price: string;
  items: string[];
  icon: string;
  popular?: boolean;
}

export interface GrowthTrend {
  name: string;
  headcount: number;
  turnover: number;
}

export interface Milestone {
  id: number;
  name: string;
  type: 'Birthday' | 'Anniversary' | 'Wedding';
  date: string;
  avatar: string;
  detail: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  level: 'Info' | 'Warning' | 'Error';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'Hashed' | 'Flagged' | 'Success' | 'Warning' | 'Error' | 'Info';
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  isActive: boolean;
}
export interface DepartmentStat {
  name: string;
  value: number;
}

export interface AttendanceStat {
  name: string;
  value: number;
}

export interface PayrollRecord {
  id: string;
  name: string;
  employeeId: string;
  dept: string;
  basicSalary: number;
  allowances: number;
  gross: number;
  tax: number;
  deductions: number;
  net: number;
  status: 'Pending' | 'Processed' | 'Paid' | 'Flagged';
  paymentDate?: string;
  paymentMode?: string;
  bankName?: string;
  accountNumber?: string;
  month: string;
}

// ============================================================================
// TYPE SAFETY IMPROVEMENTS (Added 2025-12-30)
// ============================================================================

/**
 * AI Suggestion interface for employee data recommendations
 */
export interface AISuggestion {
  id: string;
  type: 'designation' | 'grade' | 'department' | 'salary' | 'general';
  field: string;
  suggestedValue: string;
  currentValue?: string;
  confidence: number; // 0-100
  reasoning?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Timeline event types for employee history
 */
export type TimelineEventType =
  | 'hire'
  | 'promotion'
  | 'transfer'
  | 'increment'
  | 'discipline'
  | 'leave'
  | 'training'
  | 'achievement';

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Icon-related types for better type safety with Lucide icons
 */
export type IconName =
  | 'BookOpen'
  | 'Trophy'
  | 'Target'
  | 'GraduationCap'
  | 'Award'
  | 'Lightbulb'
  | 'Users'
  | 'TrendingUp'
  | 'FileCheck'
  | 'Zap'
  | 'Briefcase'
  | 'Calendar'
  | 'Clock'
  | 'MapPin'
  | 'Heart'
  | 'Star';

/**
 * Common event handler types
 */
export type SelectChangeHandler = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type TextAreaChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
export type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

/**
 * Generic update field function type
 */
export type UpdateFieldFn<T> = <K extends keyof T>(field: K, value: T[K]) => void;

/**
 * Common status and category types for various modules
 */
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'Active' | 'Draft' | 'Closed' | 'On Hold';
export type ExpenseCategory =
  | 'Travel'
  | 'Meals'
  | 'Equipment'
  | 'Utility'
  | 'Accommodation'
  | 'Transport'
  | 'Other';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Flagged' | 'Paid' | 'Rejected';
// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
// ============================================================================

/**
 * System Roles - Managed in System Settings → User Control
 * Hierarchy: Root > Super Admin > System Admin/Business Admin
 */
export type SystemRole =
  | 'Root'
  | 'Super Admin'
  | 'SystemAdmin'
  | 'Business Admin'
  | 'Manager'
  | 'User';

/**
 * Organization Roles - Managed in Org Setup (TBD)
 */
export type OrgRole = string; // Placeholder - org roles to be defined later

/**
 * Combined user role type
 */
export type UserRole = SystemRole | OrgRole;

/**
 * Permission types for RBAC checks
 */
export type Permission =
  | '*'
  | 'view_dashboard'
  | 'manage_employees'
  | 'view_employees'
  | 'create_employee'
  | 'edit_employee'
  | 'delete_employee'
  | 'manage_payroll'
  | 'view_payroll'
  | 'run_payroll'
  | 'view_salary'
  | 'manage_recruitment'
  | 'view_recruitment'
  | 'view_candidates'
  | 'edit_candidate'
  | 'view_departments'
  | 'view_reports'
  | 'view_audit_logs'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users' // Keeping legacy for safety until full migration
  | 'view_profile'
  | 'view_team'
  | 'view_leaves'
  | 'payroll_access'
  | 'manage_master_data'
  | 'system_config'
  | 'employee_management'
  | 'view_audit_logs'
  | 'manage_api_keys'
  | 'backup_restore'
  | 'approve_leaves' // Added
  | 'view_own_leaves'; // Added

/**
 * Role permission matrix - defines what each role can do
 * Order matters: Root > Super Admin > System Admin > Business Admin
 */
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  Root: [
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_master_data',
    'system_config',
    'view_audit_logs',
    'employee_management',
    'payroll_access',
  ],
  'Super Admin': [
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_master_data',
    'system_config',
    'view_audit_logs',
    'employee_management',
    'payroll_access',
  ],
  SystemAdmin: [
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_master_data',
    'system_config',
    'view_audit_logs',
    // Removed: employee_management, payroll_access (Strict SoD)
  ],
  'Business Admin': [
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_master_data',
    'system_config',
    'view_audit_logs',
    'employee_management',
    'payroll_access',
  ],
  Manager: ['view_users', 'employee_management'],
  User: [],
};

/**
 * Role hierarchy for inheritance checks
 * Higher index = higher authority
 */
export const ROLE_HIERARCHY: SystemRole[] = [
  'User', // Level 0 (End User)
  'Manager', // Level 1 (Team Access)
  'Business Admin', // Level 2 (Specific Modules: Payroll/Employees) - formerly HR Admin
  'SystemAdmin', // Level 3 (Tech Config)
  'Super Admin', // Level 4 (Full App Access)
  'Root', // Level 5 (God Mode)
];

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role as SystemRole];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if roleA has equal or higher authority than roleB
 */
export function hasAuthorityOver(
  roleA: UserRole | undefined,
  roleB: UserRole | undefined
): boolean {
  if (!roleA) {
    return false;
  }

  // Root supersedes all
  if (roleA === 'Root') {
    return true;
  }

  if (!roleB) {
    return true;
  }
  const indexA = ROLE_HIERARCHY.indexOf(roleA as SystemRole);
  const indexB = ROLE_HIERARCHY.indexOf(roleB as SystemRole);
  return indexA >= indexB;
}

export type TabId = string; // Generic tab ID type

export interface SystemFlags {
  mfa_enforced: boolean;
  biometrics_required: boolean;
  ip_whitelisting: boolean;
  session_timeout: string;
  password_complexity: string;
  session_isolation: boolean;
  neural_bypass: boolean;
  api_caching: boolean;
  debug_mode: boolean;
  immutable_logs: boolean;
}

export interface NotificationSettings {
  email: {
    smtpServer: string;
    port: number;
    username: string;
    password: string;
    fromAddress: string;
  };
  sms: { provider: string; apiKey: string; senderId: string };
}

export interface AISettings {
  status: 'online' | 'offline';
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKeys: { gemini: string; openai: string; anthropic: string };
  agents: { resume_screener: boolean; turnover_predictor: boolean; chat_assistant: boolean };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scope: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'Active' | 'Inactive';
  lastTriggered: string;
  secret: string;
}

export interface ComplianceResult {
  id: string;
  type: 'Success' | 'Warning' | 'Error';
  message: string;
  timestamp: string;
}

export interface RbacRow {
  module: string;
  perms: boolean[];
}

export type SettingScope = 'SYSTEM' | 'ORGANIZATION' | 'MODULE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SettingType = 'toggle' | 'text' | 'select' | 'number' | 'json';

export interface SettingNode {
  id: string;
  key: string; // e.g., 'security.mfa_enforced'
  label: string;
  category: string; // e.g., 'security'
  value: any;
  defaultValue: any;
  type: SettingType;
  options?: string[];
  scope: SettingScope;
  isOverridden: boolean;
  inheritedFrom?: SettingScope;
  riskLevel: RiskLevel;
  description: string;
  lastUpdated: string; // ISO Date
  updatedBy: string; // User ID
  impact?: string; // AI Analysis
}

// --- System Settings Interfaces ---
