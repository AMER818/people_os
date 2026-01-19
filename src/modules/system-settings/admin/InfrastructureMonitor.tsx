import React from 'react';
import { Server, Activity, RefreshCw, History, Zap } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import { Button } from '@components/ui/Button';
import { Checkbox } from '@components/ui/Checkbox';

interface InfrastructureMonitorProps {
  systemHealth: any[];
  storageUsage: number;
}

/**
 * InfrastructureMonitor Component
 * @description Provides a real-time dashboard for system health, resource allocation, and log monitoring.
 * Features:
 * - System health visualization (Integrated with SystemHealth module)
 * - CPU, Memory, and Storage usage metrics
 * - System maintenance controls (Cache purge, Log rotation)
 * - Live audit log console
 *
 * @param {Object} props - Component props
 * @param {Array} props.systemHealth - Data points for health status
 * @param {number} props.storageUsage - Current storage utilization percentage
 */
const InfrastructureMonitor: React.FC<InfrastructureMonitorProps> = React.memo(
  ({ systemHealth, storageUsage }) => {
    const { auditLogs, flushCache, rotateLogs, systemFlags, updateSystemFlags } = useOrgStore();
    const { success } = useToast();

    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-muted-bg/30 flex items-center gap-3">
            <Server size={18} className="text-primary" />
            <div>
              <h3 className="font-bold text-base text-text-primary tracking-tight">
                System Infrastructure
              </h3>
              <p className="text-xs text-text-muted mt-1 font-medium">
                Current system status and metrics
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {systemHealth.map((item, i) => (
                <div key={i} className="p-4 bg-muted-bg/20 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[0.65rem] font-black uppercase text-text-muted tracking-widest">
                      {item.label}
                    </span>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-black text-text-primary">{item.status}</span>
                    <span className="text-[0.6rem] font-bold text-text-muted">{item.latency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={12} className="text-primary" /> System Resources
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: 'CPU Usage', value: 42, color: 'primary' },
                      { label: 'Memory Usage', value: 68, color: 'warning' },
                      {
                        label: 'Storage Usage',
                        value: Math.round(storageUsage),
                        color: storageUsage > 80 ? 'danger' : 'success',
                      },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[0.65rem] font-bold text-text-muted">
                          <span className="uppercase tracking-widest">{stat.label}</span>
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
                            className={`h-full bg-${stat.color} transition-all duration-1000`}
                            style={{ width: `${stat.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-[0.65rem] font-black uppercase tracking-widest"
                    onClick={() => {
                      flushCache();
                      success('System cache purged');
                    }}
                  >
                    <RefreshCw size={14} className="mr-2" /> Clear Cache
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-[0.65rem] font-black uppercase tracking-widest"
                    onClick={() => {
                      rotateLogs();
                      success('Log nodes rotated');
                    }}
                  >
                    <History size={14} className="mr-2" /> Archive Logs
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 font-mono text-[0.65rem] relative overflow-hidden ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <span className="text-primary font-bold uppercase tracking-widest">
                    Activity Log
                  </span>
                  <span className="text-text-muted opacity-50">v4.2.0</span>
                </div>
                <div
                  className="space-y-1.5 max-h-[10rem] overflow-y-auto no-scrollbar"
                  role="log"
                  aria-live="polite"
                >
                  {(auditLogs || []).slice(0, 8).map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-secondary shrink-0">[HIT]</span>
                      <span className="text-slate-300 break-all">{log.action}</span>
                      <span className="text-slate-500 ml-auto uppercase">{log.time}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[0.55rem] text-success font-black tracking-widest uppercase">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Kernel Configurations */}
            <div className="mt-8 border-t border-border pt-6">
              <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap size={12} className="text-warning" /> Advanced Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted-bg/20 rounded-lg border border-border/50">
                  <span className="text-xs font-bold text-text-primary">Security Bypass</span>
                  <Checkbox
                    checked={systemFlags.neural_bypass}
                    onCheckedChange={(v) => updateSystemFlags({ neural_bypass: v === true })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted-bg/20 rounded-lg border border-border/50">
                  <span className="text-xs font-bold text-text-primary">API Caching</span>
                  <Checkbox
                    checked={systemFlags.api_caching}
                    onCheckedChange={(v) => updateSystemFlags({ api_caching: v === true })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted-bg/20 rounded-lg border border-border/50">
                  <span className="text-xs font-bold text-text-primary">Debug Mode</span>
                  <Checkbox
                    checked={systemFlags.debug_mode}
                    onCheckedChange={(v) => updateSystemFlags({ debug_mode: v === true })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default InfrastructureMonitor;
