import React from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Scale,
  Cpu,
  Workflow,
  History,
} from 'lucide-react';
import { useSystemStore } from '@/system/systemStore';
import { formatTime } from '../../utils/formatting';
import API from '../../services/api';
import { EthicalKernel } from '@/system/EthicalKernel';

const SystemHealth: React.FC = () => {
  const {
    signals,
    decisions,
    proposals,
    pressure,
    runCycle,
    triggerSimulation,
    applyRemediation,
    dismissDecision,
    dismissProposal,
    clearHistory,
  } = useSystemStore();

  const pressureColor = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-error',
    critical: 'text-error animate-pulse',
  }[pressure];

  const pressureBg = {
    low: 'bg-success/10',
    medium: 'bg-warning/10',
    high: 'bg-error/10',
    critical: 'bg-error/20',
  }[pressure];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
              System Health
            </h1>
            <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
              <span className="w-8 h-[0.125rem] bg-primary"></span>
              Integrity & Governance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => runCycle()}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group backdrop-blur-xl"
              title="Run Evolution Cycle"
              aria-label="Run Evolution Cycle"
            >
              <RefreshCw
                size={18}
                className="text-primary group-hover:rotate-180 transition-transform duration-700"
              />
            </button>
            <div className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-lg border border-white/10 flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-3 h-3 ${pressure === 'low' ? 'bg-success' : 'bg-warning'} rounded-full animate-ping absolute opacity-75`}
                ></div>
                <div
                  className={`w-3 h-3 ${pressure === 'low' ? 'bg-success' : 'bg-warning'} rounded-full relative shadow-[0_0_0.9375rem_rgba(22,163,74,0.5)]`}
                ></div>
              </div>
              <span className="text-[0.625rem] font-black text-white uppercase tracking-widest">
                Pressure Level: {pressure.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Ethical Compliance
            </p>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-4">100%</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-success rounded-full"></div>
              <span className="text-[0.5625rem] font-black text-success uppercase tracking-widest">
                Enforced
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div
              className={`w-12 h-12 rounded-xl ${pressureBg} ${pressureColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <Activity size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Workforce Tension
            </p>
            <p className={`text-4xl font-black ${pressureColor} tracking-tighter mb-4`}>
              {pressure.toUpperCase()}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-1 ${pressureBg} rounded-full`}></div>
              <span
                className={`text-[0.5625rem] font-black ${pressureColor} uppercase tracking-widest`}
              >
                Organizational Load
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Proactive Interceptions
            </p>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-4">
              {decisions.filter((d) => d.intercepted).length}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-amber-500 rounded-full"></div>
              <span className="text-[0.5625rem] font-black text-amber-500 uppercase tracking-widest">
                Network Intercepted
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Agility Proposals
            </p>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-4">
              {proposals.length}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-purple-500 rounded-full"></div>
              <span className="text-[0.5625rem] font-black text-purple-500 uppercase tracking-widest">
                Growth Roadmap
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw size={24} className={pressure === 'critical' ? 'animate-spin' : ''} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Adaptive Throughput
            </p>
            <p className="text-2xl font-black text-foreground tracking-tighter mb-4">
              {API.getRateLimit()}{' '}
              <span className="text-[0.625rem] text-muted-foreground uppercase">req/min</span>
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-[0.5625rem] font-black text-blue-500 uppercase tracking-widest">
                Governor Throttling
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Remediation Center */}
      {(decisions.some((d) => d.remediation) || proposals.some((p) => p.remediation)) && (
        <div className="p-10 bg-primary/10 border border-primary/20 rounded-[3rem] backdrop-blur-3xl animate-in slide-in-from-top duration-500 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30">
              <Zap size={24} className="text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white tracking-tight">Remediation center</h3>
              <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                AI-Suggested Incident Resolutions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...decisions, ...proposals]
              .filter((x) => x.remediation)
              .map((incident) => (
                <div
                  key={incident.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    <h4 className="font-black text-sm text-white uppercase tracking-wider truncate">
                      {'action' in incident ? incident.action : incident.title}
                    </h4>
                  </div>
                  <p className="text-xs text-white/60 mb-6 flex-1 italic">
                    "{incident.remediation}"
                  </p>
                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <button
                      onClick={() => applyRemediation(incident.id)}
                      className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-xl font-black text-[0.625rem] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Apply Resolution
                    </button>
                    <button
                      onClick={() =>
                        'action' in incident
                          ? dismissDecision(incident.id)
                          : dismissProposal(incident.id)
                      }
                      className="py-3 px-6 bg-white/5 border border-white/10 rounded-xl font-black text-[0.625rem] uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Decision Stream */}
        <div className="xl:col-span-2 p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl flex flex-col min-h-[31.25rem] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 backdrop-blur-xl rounded-2xl border border-primary/20">
                <Scale size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white tracking-tight">Governance stream</h3>
                <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                  Ethical Evaluation History
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {decisions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <ShieldCheck size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  No decisions recorded yet
                </p>
                <p className="text-xs mt-2">Interact with the system to trigger signals</p>
              </div>
            ) : (
              decisions.map((d) => (
                <div
                  key={d.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all border-l-4 border-l-primary"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-sm text-white uppercase tracking-wider">
                        {d.action}
                      </h4>
                      {d.intercepted && (
                        <div
                          className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
                          title="Proactively blocked at API layer"
                        >
                          <ShieldCheck size={10} className="text-amber-500" />
                          <span className="text-[0.5rem] font-black text-amber-500 uppercase tracking-widest">
                            Intercepted
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[0.5625rem] font-black px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-widest">
                      {Math.round(d.confidence * 100)}% Match
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{d.reason}</p>

                  {/* Forensics Section */}
                  {d.forensics && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Workflow size={12} className="text-primary/60" />
                        <span className="text-[0.625rem] font-black text-white/40 uppercase tracking-widest">
                          Logic Forensics
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-[0.5rem] font-black text-white/20 uppercase tracking-widest mb-1">
                            Applied Principles
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {d.forensics.principles.map((p) => (
                              <span
                                key={p}
                                className="text-[0.5rem] font-bold text-primary/80 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-[0.5rem] font-black text-white/20 uppercase tracking-widest mb-1">
                            Execution Branch
                          </p>
                          <p className="text-[0.5625rem] font-black text-white/60 truncate">
                            {d.forensics.logicBranch}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[0.5625rem] font-bold text-white/40 uppercase tracking-widest">
                      Domain: {d.domain}
                    </span>
                    <span className="text-[0.5625rem] font-bold text-white/40">
                      {formatTime(d.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Proposals & Evolution */}
        <div className="p-10 bg-slate-900 border border-white/10 rounded-[3rem] backdrop-blur-xl flex flex-col min-h-[31.25rem] group relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20">
              <Workflow size={24} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white tracking-tight">Evolution</h3>
              <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                Suggested System Pivots
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {proposals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <Cpu size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No active proposals</p>
                <p className="text-xs mt-2">System stability is optimal</p>
              </div>
            ) : (
              proposals.map((p) => (
                <div
                  key={p.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/20 transition-all group/item"
                >
                  <h4 className="font-black text-xs text-purple-400 uppercase tracking-widest mb-2">
                    {p.title}
                  </h4>
                  <p className="text-[0.6875rem] text-white/70 mb-4">{p.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`text-[0.5625rem] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                        p.effort === 'small'
                          ? 'bg-success/20 text-success'
                          : p.effort === 'medium'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-error/20 text-error'
                      }`}
                    >
                      {p.effort} effort
                    </span>
                    <button className="text-[0.5625rem] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                      Approve Evolution →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Raw Signals Log */}
        <div className="xl:col-span-3 p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/20">
                <History size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white tracking-tight">Signal Ingest</h3>
                <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                  Real-time Telemetry
                </p>
              </div>
            </div>
            <button
              onClick={() => clearHistory()}
              className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-white/40 hover:text-error transition-colors"
            >
              Purge Telemetry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signals.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${
                    s.risk === 'critical'
                      ? 'bg-error animate-pulse'
                      : s.risk === 'high'
                        ? 'bg-error'
                        : s.risk === 'medium'
                          ? 'bg-warning'
                          : 'bg-success'
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.6875rem] font-black text-white/90 truncate uppercase tracking-wider">
                    {s.source}
                  </p>
                  <p className="text-[0.625rem] text-white/50 mt-1 line-clamp-1">{s.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical Guardrails */}
        <div className="xl:col-span-1 p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl flex flex-col min-h-[31.25rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-success/10 backdrop-blur-xl rounded-2xl border border-success/20">
              <ShieldCheck size={24} className="text-success" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white tracking-tight">Active guardrails</h3>
              <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                Ethical Enforcement Registry
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {EthicalKernel.registry.map((rule) => (
              <div
                key={rule.id}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <h4 className="font-black text-xs text-success uppercase tracking-widest mb-2">
                  {rule.name}
                </h4>
                <p className="text-[0.6875rem] text-white/70">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Lab */}
        <div className="xl:col-span-2 p-10 bg-slate-900 border border-white/10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-error/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-error/10 backdrop-blur-xl rounded-2xl border border-error/20">
                <Cpu size={24} className="text-error" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white tracking-tight">Simulation lab</h3>
                <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                  Stress Test System Governance
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              {
                id: 'MASS_TERMINATION',
                name: 'Mass Termination',
                icon: AlertTriangle,
                color: 'text-error',
                desc: 'Simulate bulk firing attempt',
              },
              {
                id: 'DATA_LEAK',
                name: 'Data Leakage',
                icon: ShieldCheck,
                color: 'text-warning',
                desc: 'Simulate SSN export pattern',
              },
              {
                id: 'SYSTEM_ENTROPY',
                name: 'System Entropy',
                icon: Activity,
                color: 'text-primary',
                desc: 'Inject 15+ module signals',
              },
            ].map((sim) => (
              <button
                key={sim.id}
                onClick={() => triggerSimulation(sim.id)}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
              >
                <sim.icon
                  size={24}
                  className={`${sim.color} mb-4 group-hover:scale-110 transition-transform`}
                />
                <h4 className="font-black text-sm text-white uppercase tracking-tight mb-2">
                  {sim.name}
                </h4>
                <p className="text-[0.625rem] text-white/50 leading-relaxed">{sim.desc}</p>
                <div className="mt-4 text-[0.5625rem] font-black text-white/20 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                  Execute Sim →
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
