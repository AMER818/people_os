import React from 'react';
import { Activity, History, Zap, Database, RefreshCw } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import SystemHealth from '@modules/system-health';
import { SYSTEM_CONFIG } from './systemConfig';

interface DashboardOverviewProps {
  systemHealth: any[];
  storageUsage: number;
}

/**
 * DashboardOverview Component
 * @description Provides a high-level summary of system performance, user activity, and critical alerts.
 * Features:
 * - Real-time metric cards
 * - System stability indicators
 * - Quick action navigation
 */
const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(
  ({ systemHealth, storageUsage }) => {
    const { auditLogs, flushCache, rotateLogs, optimizeDatabase, systemFlags } = useOrgStore();
    const { success, error } = useToast();

    const handleAction = async (actionFn: () => Promise<any>, successMsg: string) => {
      try {
        const res = await actionFn();
        success(res.message || successMsg);
      } catch {
        error('Action failed. Core cluster may be unstable.');
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* System Health Component */}
        <SystemHealth />

        {/* System Health Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="System Health Metrics"
        >
          {systemHealth.map((item, i) => (
            <div
              key={i}
              className="bg-surface border border-border p-4 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all cursor-crosshair"
            >
              <div
                className="absolute top-0 right-0 p-3 opacity-5 text-text-primary group-hover:scale-110 group-hover:opacity-20 transition-all transition-duration-700"
                aria-hidden="true"
              >
                <item.icon size={48} />
              </div>
              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-${item.color}-soft text-${item.color} shadow-inner`}
                  aria-hidden="true"
                >
                  <item.icon size={16} />
                </div>
                <h3 className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest mb-1">
                  {item.label}
                </h3>
                <div className="flex items-end justify-between">
                  <span
                    className={`text-base font-black ${item.status === 'Online' ? 'text-success' : 'text-text-primary'}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[0.6rem] font-bold text-text-muted opacity-60 font-mono">
                    {item.latency}
                  </span>
                </div>
              </div>
              {/* Scanning effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div
              className="bg-surface/50 backdrop-blur-md border border-border rounded-2xl p-5 relative overflow-hidden"
              role="region"
              aria-label="Resource Utilization"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
              <h3 className="text-sm font-black text-text-primary uppercase tracking-tight mb-4 flex items-center gap-2">
                <Activity size={16} className="text-primary animate-pulse" /> System Load
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'CPU Utilization', value: 42, color: 'primary' },
                  { label: 'Memory Usage', value: 68, color: 'warning' },
                  {
                    label: `Storage (${SYSTEM_CONFIG.STORAGE_QUOTA_MB}MB quota)`,
                    value: Math.round(storageUsage),
                    color: storageUsage > 80 ? 'danger' : 'success',
                  },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[0.6rem] font-black uppercase tracking-widest text-text-muted">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div
                      className="h-1.5 bg-muted-bg rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={stat.value}
                      aria-label={stat.label}
                    >
                      <div
                        className={`h-full bg-${stat.color} transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]`}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bg-surface border border-border rounded-2xl p-5"
              role="region"
              aria-label="Recent System Activity"
            >
              <h3 className="text-sm font-black text-text-primary uppercase tracking-tight mb-4 flex items-center gap-2">
                <History size={16} className="text-primary" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {(auditLogs || []).slice(0, 5).map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted-bg/30 rounded-lg border border-border/50 hover:bg-muted-bg/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${log.status === 'Flagged' ? 'bg-danger' : 'bg-success'}`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">{log.action}</span>
                        <span className="text-[0.6rem] text-text-muted font-bold uppercase">
                          {log.user}
                        </span>
                      </div>
                    </div>
                    <span className="text-[0.6rem] font-black text-text-muted uppercase font-mono">
                      {log.time.split('T')[1]?.split('.')[0] || log.time}
                    </span>
                  </div>
                ))}
                {(auditLogs || []).length === 0 && (
                  <div className="p-8 text-center" role="status">
                    <div className="w-12 h-12 bg-muted-bg rounded-full flex items-center justify-center mx-auto mb-3 opacity-20">
                      <History size={24} />
                    </div>
                    <p className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">
                      No recent activity found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className={`p-6 rounded-2xl shadow-xl transition-all duration-1000 relative overflow-hidden flex flex-col justify-between h-48 group ${systemFlags.neural_bypass ? 'bg-danger/90 text-white shadow-danger/20' : 'bg-primary text-white shadow-primary/20'}`}
              role="complementary"
              aria-label="Security Status"
            >
              <Zap
                className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-0`}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black uppercase tracking-tighter">Security Status</h3>
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
                <p className="text-white/80 text-[0.7rem] font-bold leading-relaxed">
                  {systemFlags.neural_bypass
                    ? 'WARNING: Security bypass active. Manual overrides allowed.'
                    : 'Enhanced security monitoring is active.'}
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl w-fit border border-white/20">
                <div className="flex -space-x-1">
                  <div className="w-2 h-2 rounded-full bg-success border border-white/20" />
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse border border-white/20" />
                </div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">
                  {systemFlags.neural_bypass ? 'Restricted Mode' : 'Maximum Security'}
                </span>
              </div>
            </div>

            <div
              className="bg-surface border border-border rounded-2xl p-5 shadow-sm"
              role="region"
              aria-label="Quick Actions"
            >
              <h3 className="text-[0.65rem] font-black text-text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                Command center
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleAction(flushCache, 'System cache purged.')}
                  className="w-full p-3 bg-muted-bg hover:bg-primary hover:text-white rounded-xl text-left transition-all group flex items-center gap-4"
                  aria-label="Flush System Cache"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-white/20">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest">
                      Clear Cache
                    </p>
                    <p className="text-[0.6rem] opacity-60 font-bold">Clear temporary data</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAction(optimizeDatabase, 'Database optimized.')}
                  className="w-full p-3 bg-muted-bg hover:bg-primary hover:text-white rounded-xl text-left transition-all group flex items-center gap-4"
                  aria-label="Optimize DB"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-white/20">
                    <Database size={14} />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest">
                      Optimize DB
                    </p>
                    <p className="text-[0.6rem] opacity-60 font-bold">
                      Improve database performance
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleAction(rotateLogs, 'Logs archived.')}
                  className="w-full p-3 bg-muted-bg hover:bg-primary hover:text-white rounded-xl text-left transition-all group flex items-center gap-4"
                  aria-label="Restart Core Nodes"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-white/20">
                    <RefreshCw size={14} />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest">
                      Archive Logs
                    </p>
                    <p className="text-[0.6rem] opacity-60 font-bold">Move old logs to archive</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default DashboardOverview;
