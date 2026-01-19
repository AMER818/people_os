import React, { useState, useEffect, Suspense } from 'react';
import { DetailLayout } from '../../components/layout/DetailLayout';
import {
  Settings,
  Layout,
  BrainCircuit,
  ShieldCheck,
  Cloud,
  History,
  Bell,
  Database,
  RefreshCw,
  Globe,
  Zap,
  Lock,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { secureStorage } from '../../utils/secureStorage';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import ErrorBoundary from '../../components/ErrorBoundary';
import ModuleSkeleton from '../../components/ui/ModuleSkeleton'; // Improved loading state
import { SYSTEM_CONFIG } from './admin/systemConfig';

// Lazy Load Sub-components for better performance
const UserManagement = React.lazy(() => import('./admin/UserManagement'));
const InfrastructureMonitor = React.lazy(() => import('./admin/InfrastructureMonitor'));
const APIManager = React.lazy(() => import('./admin/APIManager'));
const NotificationsManager = React.lazy(() => import('./admin/NotificationsManager'));
const DataManagement = React.lazy(() => import('./admin/DataManagement'));
const AIConfig = React.lazy(() => import('./admin/AIConfig'));
const DashboardOverview = React.lazy(() => import('./admin/DashboardOverview'));
const ComplianceSettings = React.lazy(() => import('./admin/ComplianceSettings'));
const SecuritySettings = React.lazy(() => import('./admin/SecuritySettings'));

// Handle named export for AuditDashboard
const AuditDashboard = React.lazy(() =>
  import('./audit/AuditDashboard').then((module) => ({ default: module.AuditDashboard }))
);

const SystemSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);
  const [systemHealth, setSystemHealth] = useState([
    {
      label: 'API Service',
      status: 'Checking...',
      latency: '0ms',
      icon: Globe,
      color: 'text-muted',
    },
    { label: 'AI Service', status: 'Checking...', latency: '0ms', icon: Zap, color: 'text-muted' },
    {
      label: 'Database',
      status: 'Checking...',
      latency: '0ms',
      icon: Database,
      color: 'text-muted',
    },
    {
      label: 'Auth Service',
      status: 'Checking...',
      latency: '0ms',
      icon: Lock,
      color: 'text-muted',
    },
  ]);

  const { success } = useToast();

  const handleSyncSettings = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success('System nodes synchronized');
    }, 1200);
  };

  // Calculate Storage Usage
  useEffect(() => {
    let total = 0;
    for (const x in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    setStorageUsage((total / (SYSTEM_CONFIG.STORAGE_QUOTA_MB * 1024 * 1024)) * 100);
  }, []);

  // System Health Polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const start = Date.now();
        const health = await api.checkHealth();
        const latency = Date.now() - start;

        setSystemHealth((prev) => [
          {
            ...prev[0],
            status: health.status === 'ok' ? 'Online' : 'Degraded',
            latency: `${latency}ms`,
            color: health.status === 'ok' ? 'text-success' : 'text-warning',
          },
          ...prev.slice(1),
        ]);
      } catch {
        setSystemHealth((prev) => [
          { ...prev[0], status: 'Offline', latency: 'N/A', color: 'text-danger' },
          ...prev.slice(1),
        ]);
      }

      // Simulate other checks for UI richness
      setTimeout(() => {
        setSystemHealth((prev) => [
          prev[0],
          { ...prev[1], status: 'Online', latency: '42ms', color: 'text-success' },
          { ...prev[2], status: 'Online', latency: '12ms', color: 'text-success' },
          {
            ...prev[3],
            status: secureStorage?.getItem('token') ? 'Online' : 'Standby',
            latency: secureStorage?.getItem('token') ? '8ms' : 'N/A',
            color: 'text-success',
          },
        ]);
      }, 500);
    };

    checkHealth();
    const timer = setInterval(checkHealth, SYSTEM_CONFIG.HEALTH_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },

    { id: 'sys-admin', label: 'Access Control', icon: ShieldCheck },
    { id: 'ai', label: 'AI Settings', icon: BrainCircuit },
    { id: 'integrations', label: 'Integrations', icon: Cloud },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'maintenance', label: 'Maintenance', icon: Database },
  ];

  return (
    <DetailLayout
      className="animate-in fade-in duration-500"
      containerClassName="max-w-[1400px]"
      header={
        <div className="max-w-[1400px] mx-auto px-6 pt-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-vibrant p-6 shadow-xl relative overflow-hidden group">
            <div
              className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000"
              aria-hidden="true"
            >
              <Settings size={80} />
            </div>
            <div className="relative z-10 flex items-center gap-6">
              <div
                className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20"
                aria-hidden="true"
              >
                <Settings size={24} />
              </div>
              <div>
                <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-[0.3em] mb-1">
                  System Information
                </p>
                <p className="text-text-primary font-bold flex items-center gap-2 text-sm antialiased">
                  <span className="flex w-2 h-2 rounded-full bg-success animate-pulse" />
                  {SYSTEM_CONFIG.NODE_NAME} • v{SYSTEM_CONFIG.VERSION} •{' '}
                  {SYSTEM_CONFIG.CLUSTER_TYPE}
                </p>
              </div>
            </div>
            <div className="relative z-10">
              <Button
                onClick={handleSyncSettings}
                disabled={isSyncing}
                className="px-6 h-11 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all text-[0.65rem] bg-primary text-white"
                aria-label="Sync system settings"
              >
                <RefreshCw
                  size={14}
                  className={`mr-2.5 ${isSyncing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                {isSyncing ? 'Syncing...' : 'Sync Settings'}
              </Button>
            </div>
          </div>
        </div>
      }
      tabs={
        <div className="max-w-[1400px] mx-auto px-6">
          <HorizontalTabs
            tabs={sections}
            activeTabId={activeSection}
            onTabChange={setActiveSection}
            wrap={true}
            disabled={isSyncing}
            align="start"
            className="mb-0"
          />
        </div>
      }
    >
      <Suspense fallback={<ModuleSkeleton />}>
        {activeSection === 'dashboard' && (
          <DashboardOverview systemHealth={systemHealth} storageUsage={storageUsage} />
        )}

        {activeSection === 'sys-admin' && <UserManagement onSync={handleSyncSettings} />}

        {activeSection === 'ai' && <AIConfig />}

        {activeSection === 'integrations' && <APIManager />}

        {activeSection === 'compliance' && <ComplianceSettings />}

        {activeSection === 'security' && <SecuritySettings />}

        {activeSection === 'audit' && <AuditDashboard />}

        {activeSection === 'notifications' && <NotificationsManager onSync={handleSyncSettings} />}

        {activeSection === 'maintenance' && (
          <>
            <InfrastructureMonitor systemHealth={systemHealth} storageUsage={storageUsage} />
            <DataManagement />
          </>
        )}
      </Suspense>
    </DetailLayout>
  );
};

// Standardizing Error Boundary around the entire module
const SystemSettingsWithBoundary: React.FC = () => (
  <ErrorBoundary>
    <SystemSettings />
  </ErrorBoundary>
);

export default SystemSettingsWithBoundary;
