import React, { useState, useEffect, useRef } from 'react';
import { secureStorage } from './utils/secureStorage';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  BarChart3,
  GraduationCap,
  Target,
  Cake,
  CalendarRange,
  Zap,
  Rocket,
  Plane,
  Package,
  LogOut,
  UserCircle,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  UserMinus,
  Palmtree,
  HeartPulse,
  Building2,
  Shield,
  Menu,
  Settings,
  Timer,
  Briefcase,
  Gift,
  UserCheck,
  Smartphone,
  LifeBuoy,
  AlertTriangle,
  ShieldOff,
} from 'lucide-react';
import { ModuleType } from './types';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useRBAC } from '@/contexts/RBACContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import Logger from '@/utils/logger';
import ModuleSkeleton from './components/ui/ModuleSkeleton';
import { useUIStore } from './store/uiStore';
import { useOrgStore } from './store/orgStore';
import { useTheme } from './contexts/ThemeContext';
import { useLayout } from './contexts/LayoutContext';

// Lazy Load Core Components
const AIInsightsPanel = React.lazy(() => import('./components/AIInsightsPanel'));

// Lazy Load Modules
const Dashboard = React.lazy(() => import('./modules/dashboard'));
const Employees = React.lazy(() => import('./modules/employee'));
const RecruitmentATS = React.lazy(() => import('./modules/recruitment'));
const JobPostings = React.lazy(() => import('./modules/job-postings'));
const Onboarding = React.lazy(() => import('./modules/onboarding'));
const Offboarding = React.lazy(() => import('./modules/offboarding'));
const Attendance = React.lazy(() => import('./modules/attendance'));
const Leaves = React.lazy(() => import('./modules/leaves'));
const Overtime = React.lazy(() => import('./modules/overtime'));
const PayrollEngine = React.lazy(() => import('./modules/payroll'));
const ExpensesTravel = React.lazy(() => import('./modules/expenses'));
const AssetManagement = React.lazy(() => import('./modules/assets'));
const AnalyticsInsights = React.lazy(() => import('./modules/analytics'));

const SystemSettings = React.lazy(() => import('./modules/system-settings'));
const OrganizationSetup = React.lazy(() => import('./modules/org-setup'));
const SelfService = React.lazy(() => import('./modules/self-service'));
const LearningModule = React.lazy(() => import('./modules/learning'));
const PerformanceModule = React.lazy(() => import('./modules/performance'));
const Benefits = React.lazy(() => import('./modules/benefits'));
const VisitorManagement = React.lazy(() => import('./modules/visitor-management'));
const AssistanceModule = React.lazy(() => import('./modules/assistance'));
const NeuralModule = React.lazy(() => import('./modules/neural'));
const SystemHealth = React.lazy(() => import('./modules/system-health'));

// Legacy Wrapper for modules that haven't been converted to the new Layout System
const LegacyModuleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full w-full overflow-y-auto overscroll-contain custom-scrollbar p-6 md:p-10">
    <div className="w-full pb-20">{children}</div>
  </div>
);

interface AuthenticatedAppProps {
  onLogout: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ onLogout }) => {
  const { theme } = useTheme();
  const { sidebar, metrics } = useLayout();
  const { hasPermission } = useRBAC();

  // Track if component has hydrated to prevent first-paint layout shift
  const [hasHydrated, setHasHydrated] = useState(false);

  // Ref + state to measure sidebar width so it can auto-fit content
  const asideRef = useRef<HTMLElement | null>(null);
  // Initialize with computed value based on sidebar state to avoid layout shift
  const [computedSidebarWidth, setComputedSidebarWidth] = useState<number>(
    sidebar.isOpen ? metrics.sidebarWidth || 320 : 0
  );
  const widthMeasuredRef = useRef(false);

  // Mark as hydrated after first render
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    let ro: ResizeObserver | null = null;
    const timeoutId: ReturnType<typeof setTimeout> | null = null;
    let frameId: number | null = null;

    function updateWidth() {
      if (asideRef.current && sidebar.isOpen) {
        const w = Math.ceil(asideRef.current.getBoundingClientRect().width);
        const newWidth = w || metrics.sidebarWidth || 320;
        setComputedSidebarWidth(newWidth);
        widthMeasuredRef.current = true;
      } else {
        setComputedSidebarWidth(0);
        widthMeasuredRef.current = true;
      }
    }

    // Use double requestAnimationFrame to ensure DOM is fully laid out before measuring
    // First frame: DOM painted, second frame: layout calculated
    frameId = requestAnimationFrame(() => {
      frameId = requestAnimationFrame(() => {
        updateWidth();

        try {
          ro = new ResizeObserver(updateWidth);
          if (asideRef.current) {
            ro.observe(asideRef.current);
          }
        } catch (_e) {
          // ResizeObserver not supported: fallback to window resize
          window.addEventListener('resize', updateWidth);
        }

        window.addEventListener('resize', updateWidth);
      });
    });

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (ro && asideRef.current) {
        ro.disconnect();
      }
      window.removeEventListener('resize', updateWidth);
    };
  }, [sidebar.isOpen, metrics.sidebarWidth]);
  const { activeModule, setActiveModule, setSidebarOpen, colorTheme } = useUIStore();

  const { currentUser, fetchMasterData, fetchProfile, refreshCurrentUser } = useOrgStore();
  const isProfileInactive =
    currentUser?.userType === 'OrgUser' && currentUser?.profileStatus === 'Inactive';

  // Global Org Data Initialization - Only fetch if authenticated
  const dataFetchedRef = useRef(false);
  useEffect(() => {
    // Check if we are mounted, implies auth
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      // Run all initialization calls in parallel for faster startup
      Promise.all([refreshCurrentUser(), fetchMasterData(), fetchProfile()]).catch(console.error);
    }
  }, [fetchMasterData, fetchProfile, refreshCurrentUser]);

  const [isAIPanelOpen, setAIPanelOpen] = useState(false);

  const [notifications] = useState([
    {
      id: 1,
      title: 'Birthday',
      desc: 'Sarah Jenkins: 32nd Birthday',
      type: 'celebration',
      icon: Cake,
      scope: 'Global',
    },
    {
      id: 2,
      title: 'Probation Confirmed',
      desc: 'Congratulations! Your probation period is complete. Status: Confirmed.',
      type: 'status',
      icon: ShieldCheck,
      scope: 'Personal',
    },
    {
      id: 3,
      title: 'Promotion',
      desc: 'Alex Rivera promoted to Lead Cloud Engineer (Grade M4).',
      type: 'promotion',
      icon: TrendingUp,
      scope: 'Global',
    },
    {
      id: 4,
      title: 'New Joiner',
      desc: 'Welcome Elena Fisher to the People Ops Department!',
      type: 'lifecycle',
      icon: Rocket,
      scope: 'Global',
    },
    {
      id: 5,
      title: 'Departure',
      desc: 'Farewell to Robert Vance. Today is his last day.',
      type: 'lifecycle',
      icon: UserMinus,
      scope: 'Global',
    },
    {
      id: 6,
      title: 'Holiday',
      desc: 'Public Holiday: Independence Day. Offices Closed.',
      type: 'event',
      icon: Palmtree,
      scope: 'Global',
    },
  ]);

  const broadcastCount = notifications.filter((n) => n.scope === 'Global').length;

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('PeopleOS_config');
    return saved
      ? JSON.parse(saved)
      : {
          brandingName: 'PeopleOS',
          enabledModules: {
            dashboard: true,
            employees: true,
            'org-settings': true,
            recruitment: true,
            'job-postings': true,
            onboarding: true,
            offboarding: true,
            attendance: true,
            leaves: true,
            overtime: true,
            payroll: true,
            'tax-compliance': true,
            compensation: true,
            benefits: true,
            performance: true,
            learning: true,
            skills: true,
            succession: true,
            engagement: true,
            rewards: true,
            relations: true,
            'health-safety': true,
            travel: true,
            expenses: true,
            assets: true,
            alumni: true,
            analytics: true,
            workflow: true,
            neural: true,
            'system-settings': true,
            integration: true,
            'self-service': true,
            visitors: true,
            assistance: true,
            'system-health': true,
          },
        };
  });

  const moduleLabelMap: Record<ModuleType, string> = {
    dashboard: 'Dashboard',
    employees: 'Employee',
    'org-settings': 'Org Setup',
    recruitment: 'Recruitment / ATS',
    'job-postings': 'Job Postings',
    onboarding: 'Onboarding',
    offboarding: 'Offboarding',
    attendance: 'Time & Attendance',
    leaves: 'Leave & Absence',
    overtime: 'Overtime',
    payroll: 'Payroll',
    'tax-compliance': 'Tax & Compliance',
    compensation: 'Compensation (C&B)',
    benefits: 'Benefits',
    performance: 'Performance Mgmt',
    learning: 'L&D (LMS)',
    skills: 'Skills & Competency',
    succession: 'Talent & Succession',
    engagement: 'Employee Engagement',
    rewards: 'Recognition & Rewards',
    relations: 'Employee Relations',
    'health-safety': 'Health & Safety (EHS)',
    travel: 'Travel Mgmt',
    expenses: 'Expense Mgmt',
    assets: 'Asset Mgmt',
    alumni: 'Alumni Mgmt',
    analytics: 'HR Analytics & BI',
    workflow: 'Workflow & Automation',
    neural: 'AI & Intelligence',
    'system-settings': 'System Settings',
    integration: 'Integration Services',
    'self-service': 'ESS / MSS',
    admin: 'Admin',
    visitors: 'Visitor Logs',
    assistance: 'Help Desk',
    'system-health': 'System Health',
    'people-os-chat': 'AI Chat',
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Color Theme
  useEffect(() => {
    document.body.classList.remove('theme-quartz', 'theme-cyber', 'theme-forest', 'theme-sunset');
    document.body.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  useEffect(() => {
    const handleConfigUpdate = () => {
      const saved = localStorage.getItem('PeopleOS_config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    };
    window.addEventListener('PeopleOS_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('PeopleOS_config_updated', handleConfigUpdate);
  }, []);

  const navGroups = [
    {
      title: '',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'org-settings', label: 'Organization Setup', icon: Building2 },
        { id: 'system-settings', label: 'System Settings', icon: Settings },
      ],
    },
    {
      title: 'II. HR Management',
      items: [
        { id: 'employees', label: 'Employee', icon: Users },
        { id: 'job-postings', label: 'Job Postings', icon: Briefcase },
        { id: 'recruitment', label: 'Recruitment / ATS', icon: UserPlus },
        { id: 'onboarding', label: 'Onboarding', icon: Rocket },
        { id: 'offboarding', label: 'Offboarding', icon: LogOut },
      ],
    },
    {
      title: 'III. Time & Attendance',
      items: [
        { id: 'attendance', label: 'Time & Attendance', icon: Clock },
        { id: 'leaves', label: 'Leave & Absence', icon: CalendarRange },
        { id: 'overtime', label: 'Overtime', icon: Timer },
      ],
    },
    {
      title: 'IV. Pay & Rewards',
      items: [
        { id: 'payroll', label: 'Payroll', icon: Wallet },
        { id: 'tax-compliance', label: 'Tax & Compliance', icon: ShieldCheck },
        { id: 'compensation', label: 'Compensation (C&B)', icon: TrendingUp },
        { id: 'benefits', label: 'Benefits', icon: Gift },
      ],
    },
    {
      title: 'V. Performance & Growth',
      items: [
        { id: 'performance', label: 'Performance Mgmt', icon: Target },
        { id: 'learning', label: 'L&D (LMS)', icon: GraduationCap },
        { id: 'skills', label: 'Skills & Competency', icon: BrainCircuit },
        { id: 'succession', label: 'Talent & Succession', icon: TrendingUp },
      ],
    },
    {
      title: 'VI. Employee Experience',
      items: [
        { id: 'self-service', label: 'ESS / MSS', icon: Smartphone },
        { id: 'engagement', label: 'Engagement', icon: HeartPulse },
        { id: 'rewards', label: 'Recognition', icon: Sparkles },
        { id: 'relations', label: 'Employee Relations', icon: UserCircle },
        { id: 'health-safety', label: 'Health & Safety', icon: Shield },
        { id: 'assistance', label: 'Help Desk', icon: LifeBuoy },
      ],
    },
    {
      title: 'VII. Money & Resources',
      items: [
        { id: 'travel', label: 'Travel Mgmt', icon: Plane },
        { id: 'expenses', label: 'Expense Mgmt', icon: Wallet },
        { id: 'assets', label: 'Asset Mgmt', icon: Package },
      ],
    },
    {
      title: 'VIII. Alumni Management',
      items: [{ id: 'alumni', label: 'Alumni Mgmt', icon: Users }],
    },
    {
      title: 'IX. Analytics & AI',
      items: [
        { id: 'analytics', label: 'HR Analytics & BI', icon: BarChart3 },
        { id: 'workflow', label: 'Workflow & Auto', icon: Zap },
      ],
    },
    {
      title: 'X. Security & Control',
      items: [{ id: 'visitors', label: 'Visitor Logs', icon: UserCheck }],
    },
  ];

  const filteredNavGroups = React.useMemo(() => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.id === 'system-settings') {
            return hasPermission('system_config');
          }
          if (item.id === 'org-settings') {
            return hasPermission('manage_master_data');
          }
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [navGroups, hasPermission]);

  const renderModule = () => {
    if (config.enabledModules[activeModule] === false) {
      return <Dashboard />;
    }

    switch (activeModule) {
      // Converted Modules (Self-Managed Layout)

      case 'system-settings':
        return (
          <RoleGuard permission="system_config">
            <div className="h-full p-6 md:p-8">
              <SystemSettings />
            </div>
          </RoleGuard>
        );

      case 'org-settings':
        return (
          <RoleGuard permission="manage_master_data">
            <div className="h-full">
              <OrganizationSetup />
            </div>
          </RoleGuard>
        );

      // Legacy Modules (Need Wrapper)
      case 'dashboard':
        return (
          <LegacyModuleWrapper>
            <Dashboard />
          </LegacyModuleWrapper>
        );
      case 'employees':
        return (
          <LegacyModuleWrapper>
            <Employees />
          </LegacyModuleWrapper>
        );
      case 'recruitment':
        return (
          <LegacyModuleWrapper>
            <RecruitmentATS />
          </LegacyModuleWrapper>
        );
      case 'job-postings':
        return (
          <LegacyModuleWrapper>
            <JobPostings />
          </LegacyModuleWrapper>
        );
      case 'onboarding':
        return (
          <LegacyModuleWrapper>
            <Onboarding />
          </LegacyModuleWrapper>
        );
      case 'offboarding':
        return (
          <LegacyModuleWrapper>
            <Offboarding />
          </LegacyModuleWrapper>
        );
      case 'attendance':
        return (
          <LegacyModuleWrapper>
            <Attendance />
          </LegacyModuleWrapper>
        );
      case 'leaves':
        return (
          <LegacyModuleWrapper>
            <Leaves />
          </LegacyModuleWrapper>
        );
      case 'overtime':
        return (
          <LegacyModuleWrapper>
            <Overtime />
          </LegacyModuleWrapper>
        );
      case 'payroll':
        return (
          <LegacyModuleWrapper>
            <PayrollEngine />
          </LegacyModuleWrapper>
        );
      case 'expenses':
        return (
          <LegacyModuleWrapper>
            <ExpensesTravel />
          </LegacyModuleWrapper>
        );
      case 'assets':
        return (
          <LegacyModuleWrapper>
            <AssetManagement />
          </LegacyModuleWrapper>
        );
      case 'analytics':
        return (
          <LegacyModuleWrapper>
            <AnalyticsInsights />
          </LegacyModuleWrapper>
        );
      case 'self-service':
        return (
          <LegacyModuleWrapper>
            <SelfService />
          </LegacyModuleWrapper>
        );
      case 'learning':
        return (
          <LegacyModuleWrapper>
            <LearningModule />
          </LegacyModuleWrapper>
        );
      case 'performance':
        return (
          <LegacyModuleWrapper>
            <PerformanceModule />
          </LegacyModuleWrapper>
        );
      case 'benefits':
        return (
          <LegacyModuleWrapper>
            <Benefits />
          </LegacyModuleWrapper>
        );
      case 'visitors':
        return (
          <LegacyModuleWrapper>
            <VisitorManagement />
          </LegacyModuleWrapper>
        );
      case 'assistance':
        return (
          <LegacyModuleWrapper>
            <AssistanceModule />
          </LegacyModuleWrapper>
        );
      case 'neural':
        return (
          <LegacyModuleWrapper>
            <NeuralModule />
          </LegacyModuleWrapper>
        );
      case 'system-health':
        return (
          <LegacyModuleWrapper>
            <SystemHealth />
          </LegacyModuleWrapper>
        );

      // Placeholders
      case 'tax-compliance':
      case 'compensation':
      case 'skills':
      case 'succession':
      case 'engagement':
      case 'rewards':
      case 'relations':
      case 'health-safety':
      case 'travel':
      case 'alumni':
      case 'workflow':
      case 'integration':
        return (
          <LegacyModuleWrapper>
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">
                {moduleLabelMap[activeModule]}
              </h2>
              <p className="text-text-muted mt-2 font-medium max-w-md">
                This module is currently under development. Check back soon for updates!
              </p>
            </div>
          </LegacyModuleWrapper>
        );
      default:
        return (
          <LegacyModuleWrapper>
            <Dashboard />
          </LegacyModuleWrapper>
        );
    }
  };

  if (isProfileInactive) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-2xl border border-danger/20 p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="text-danger w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight mb-4">
            Access Revoked
          </h1>
          <p className="text-text-muted font-medium mb-8">
            Your organizational profile has been marked as{' '}
            <span className="text-danger font-bold">Inactive</span>. Please contact your System
            Administrator or HR Department to restore access.
          </p>
          <div className="p-4 bg-muted-bg rounded-xl border border-border mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-warning shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-text-primary uppercase tracking-widest mb-1">
                  Security Notice
                </p>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  This account is currently restricted from accessing the hcm core. All active
                  sessions have been terminated.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-4 bg-muted-bg hover:bg-border text-text-primary rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Robust Sidebar Margin Calculation
  // Use safe fallback until ResizeObserver has measured the actual sidebar width
  const safeSidebarWidth = metrics?.sidebarWidth || 280;
  const currentSidebarMargin = sidebar.isOpen
    ? widthMeasuredRef.current
      ? Math.max(computedSidebarWidth, safeSidebarWidth)
      : safeSidebarWidth
    : 0;

  return (
    <ToastProvider>
      <div
        className={`flex h-screen w-full transition-colors duration-500 bg-app overflow-hidden overscroll-none`}
      >
        <aside
          ref={asideRef}
          className={
            `fixed h-screen left-0 top-0 transform transition-transform duration-300 bg-surface flex flex-col z-50 shadow-2xl border-r border-blue-500/20 overflow-y-auto overscroll-contain custom-scrollbar ` +
            (sidebar.isOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto'
              : '-translate-x-full opacity-0 pointer-events-none')
          }
          // allow content-driven width (auto) — measured via JS for layout offset
          style={{ width: 'auto', minWidth: `${safeSidebarWidth}px` }}
        >
          <div className="flex flex-col items-center justify-center mb-3 mt-5 px-6 shrink-0">
            <div className="flex items-center gap-6 mb-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 overflow-hidden shrink-0 border border-blue-500/30">
                <img src="/logo.png" alt="Hunzal Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-4xl tracking-tighter text-text-primary uppercase whitespace-nowrap leading-none">
                  {config.brandingName}
                </span>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.62em] leading-none mt-1.5 ml-1">
                  People OS
                </span>
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-500 text-center uppercase tracking-widest opacity-60 mb-4">
              Human Capital Management System
            </p>
          </div>

          <nav
            className="flex-1 px-4 mt-3 space-y-4 pb-10 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y"
            style={{ maxHeight: 'calc(100vh - 160px)', WebkitOverflowScrolling: 'touch' }}
          >
            {filteredNavGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {group.title && (
                  <p className="px-4 text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] mb-2 whitespace-nowrap">
                    {group.title}
                  </p>
                )}
                {group.items
                  .filter((item) => config.enabledModules[item.id] !== false)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id as ModuleType);
                        if (window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl transition-all duration-300 text-left group/navitem relative overflow-hidden ${
                        activeModule === item.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/50'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-blue-400 hover:border-blue-500/10 hover:translate-x-1 border border-transparent'
                      }`}
                      title={item.label}
                      aria-label={`Navigate to ${item.label}`}
                      aria-current={activeModule === item.id ? 'page' : undefined}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                          activeModule === item.id
                            ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                            : 'bg-slate-900 border-slate-800 group-hover/navitem:border-blue-500/20'
                        }`}
                      >
                        <item.icon
                          size={14}
                          className={
                            activeModule === item.id
                              ? 'text-blue-600'
                              : 'text-slate-500 group-hover/navitem:text-blue-400'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`font-black text-[0.75rem] uppercase tracking-wide antialiased truncate leading-tight ${
                            activeModule === item.id
                              ? 'text-slate-100'
                              : 'text-slate-400 group-hover/navitem:text-blue-200 transition-colors'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            ))}
          </nav>
        </aside>

        <main
          className={`app-main flex-1 flex flex-col bg-bg relative overflow-hidden ${
            hasHydrated ? 'transition-all duration-300' : ''
          } ${
            // Use CSS class fallback before hydration to prevent flash of wrong layout
            !hasHydrated && sidebar.isOpen ? 'ml-[280px]' : ''
          }`}
          style={
            hasHydrated
              ? {
                  marginLeft: currentSidebarMargin,
                  ['--sidebar-width' as any]: `${currentSidebarMargin}px`,
                }
              : sidebar.isOpen
                ? {
                    marginLeft: 280,
                    ['--sidebar-width' as any]: '280px',
                  }
                : undefined
          }
        >
          {/* Top Header - Calm Control Strip */}
          <header className="h-16 bg-surface border-b border-blue-500/20 sticky top-0 z-50 px-8 flex items-center justify-between transition-all duration-300 shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <button
                onClick={sidebar.toggle}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                <span className="text-text-primary font-black uppercase tracking-wider text-[0.8rem]">
                  {moduleLabelMap[activeModule]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Environment Badge - Standardized */}
              {import.meta.env.VITE_APP_ENV !== 'production' &&
                import.meta.env.MODE !== 'production' && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-inner ${
                      import.meta.env.VITE_APP_ENV === 'development' ||
                      import.meta.env.MODE === 'development'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        import.meta.env.VITE_APP_ENV === 'development' ||
                        import.meta.env.MODE === 'development'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    ></div>
                    <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">
                      {import.meta.env.VITE_APP_ENV === 'development' ||
                      import.meta.env.MODE === 'development'
                        ? 'LOCAL DEV'
                        : 'TEST ENV'}
                    </span>
                  </div>
                )}
            </div>
            {/* Current User Display */}
            {currentUser && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 shadow-inner">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs border border-blue-500/30">
                  {(currentUser.name || currentUser.username)?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-black text-slate-200 leading-tight uppercase tracking-wider">
                    {currentUser.name || currentUser.username}
                  </span>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar relative w-full">
            {activeModule === 'dashboard' && broadcastCount > 0 && null}
            <React.Suspense fallback={<ModuleSkeleton />}>{renderModule()}</React.Suspense>
          </div>

          <React.Suspense fallback={null}>
            <AIInsightsPanel
              isOpen={isAIPanelOpen}
              onClose={() => setAIPanelOpen(false)}
              context={activeModule}
            />
          </React.Suspense>
        </main>
      </div>
    </ToastProvider>
  );
};

export default AuthenticatedApp;
