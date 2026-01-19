import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  Play,
  Filter,
  Activity,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  X,
  Send,
  Check,
  Ban,
  Settings2,
  History,
  Calendar,
  ArrowRightLeft,
  Gauge,
  Sparkles,
  Sliders,
} from 'lucide-react';
import OvertimeConfiguration from './OvertimeConfiguration';
import { OTRequest } from '../../types';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from '../../components/ui/SearchInput';

type OvertimeTab = 'ledger' | 'rebalance' | 'policies' | 'config';

const INITIAL_OT: OTRequest[] = [];

const Overtime: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OvertimeTab>('ledger');
  const [requests, setRequests] = useState<OTRequest[]>(INITIAL_OT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredRequests,
  } = useSearch(requests, ['employeeName']);

  // Initiation State
  const [newOT, setNewOT] = useState({
    name: '',
    hours: 0,
    multiplier: 1.5,
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  const stats = [
    {
      label: 'Active Extensions',
      value: requests.filter((r) => r.status === 'Pending').length,
      change: '+12%',
      color: 'rose',
      icon: Zap,
    },
    { label: 'Cumulative Flux', value: '450h', change: '+45h', color: 'orange', icon: Clock },
    {
      label: 'Fiscal Velocity',
      value: '$12.4k',
      change: 'Stable',
      color: 'emerald',
      icon: TrendingUp,
    },
    {
      label: 'Burnout Risk',
      value: 'Medium',
      change: 'Eng Unit',
      color: 'indigo',
      icon: AlertTriangle,
    },
  ];

  const handleAction = (id: string, status: 'Approved' | 'Processed' | 'Pending') => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    const request: OTRequest = {
      id: `OT-${Math.floor(Math.random() * 9000) + 1000}`,
      employeeId: 'ABC01-TEMP',
      employeeName: newOT.name,
      date: newOT.date,
      hours: Number(newOT.hours),
      rate: Number(newOT.multiplier),
      status: 'Pending',
      reason: newOT.reason,
    };
    setRequests([request, ...requests]);
    setIsModalOpen(false);
    setNewOT({
      name: '',
      hours: 0,
      multiplier: 1.5,
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const renderLedger = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[37.5rem] flex flex-col">
        <div className="p-12 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-secondary/30 backdrop-blur-3xl">
          <div>
            <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">
              Extension Ledger
            </h3>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-3 flex items-center gap-2">
              <Activity size={12} className="text-destructive" /> High-Density Temporal Flux
              Monitoring
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query Node..."
                className="w-64 rounded-2xl"
              />
            </div>
            <button
              aria-label="Filter overtime records"
              className="p-4 bg-secondary rounded-2xl text-muted-foreground hover:text-destructive transition-colors shadow-sm"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-secondary/50 text-[0.6875rem] font-black uppercase text-muted-foreground tracking-[0.25em] font-sans">
                <th className="px-14 py-8">Personnel Node</th>
                <th className="px-8 py-8">Extension Delta</th>
                <th className="px-8 py-8">Multiplier</th>
                <th className="px-8 py-8">Phase</th>
                <th className="px-14 py-8 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="group hover:bg-destructive/5 transition-all cursor-pointer"
                >
                  <td className="px-14 py-8">
                    <p className="text-lg font-black text-foreground leading-none">
                      {req.employeeName}
                    </p>
                    <p className="text-[0.625rem] font-black text-destructive uppercase tracking-widest mt-2">
                      {req.employeeId}
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-foreground">{req.hours}h</span>
                      <span className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                        {req.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-secondary px-4 py-1.5 rounded-xl border border-border">
                      x{req.rate} Factor
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <span
                      className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                        req.status === 'Approved'
                          ? 'bg-success/10 text-success border-success/20'
                          : req.status === 'Pending'
                            ? 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                            : 'bg-info/10 text-info border-info/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-14 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleAction(req.id, 'Approved')}
                            aria-label={`Approve overtime for ${req.employeeName}`}
                            className="p-3 bg-success text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'Processed')}
                            aria-label={`Reject overtime for ${req.employeeName}`}
                            className="p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
                          >
                            <Ban size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          aria-label="View history"
                          className="p-3 bg-secondary text-muted-foreground rounded-xl hover:text-destructive transition-all"
                        >
                          <History size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-muted-foreground font-black uppercase text-xs tracking-widest"
                  >
                    No temporal extensions logged in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRebalance = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="lg:col-span-8 bg-card rounded-[4rem] border border-border shadow-2xl p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-3xl font-black text-foreground tracking-tight">
              Shift Equilibrium Matrix
            </h3>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
              AI-Driven Overload Rebalancing
            </p>
          </div>
          <button
            aria-label="Execute global swap"
            className="px-8 py-3 bg-destructive text-destructive-foreground rounded-2xl font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-3 shadow-xl"
          >
            <ArrowRightLeft size={16} /> Execute Global Swap
          </button>
        </div>
        <div className="space-y-6">
          {[
            { cluster: 'Engineering Unit 1', load: 94, risk: 'Critical', color: 'rose', count: 12 },
            { cluster: 'Ops & Logistics', load: 62, risk: 'Optimal', color: 'emerald', count: 4 },
            { cluster: 'Design HQ', load: 88, risk: 'High', color: 'orange', count: 8 },
            { cluster: 'Procurement Cell', load: 35, risk: 'Underload', color: 'blue', count: 2 },
          ].map((c, i) => (
            <div
              key={i}
              className="p-8 bg-secondary/50 rounded-[2.5rem] border border-border flex items-center justify-between group hover:border-destructive/30 transition-all"
            >
              <div className="flex items-center gap-8 flex-1">
                <div
                  className={`w-16 h-16 bg-${c.color}-50 dark:bg-${c.color}-900/20 text-${c.color}-600 dark:text-${c.color}-400 rounded-3xl flex items-center justify-center shadow-inner font-black text-2xl`}
                >
                  {c.count}
                </div>
                <div className="flex-1 max-w-md space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xl font-black text-foreground">{c.cluster}</h4>
                    <span className={`text-[0.625rem] font-black uppercase text-${c.color}-500`}>
                      {c.risk} Pulse
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${c.color}-500 rounded-full shadow-[0_0_0.625rem_rgba(244,63,94,0.3)] transition-all duration-1000`}
                      style={{ width: `${c.load}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-right ml-10">
                <p className="text-2xl font-black text-foreground leading-none">{c.load}%</p>
                <p className="text-[0.5625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
                  Temporal Load
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-10">
        <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <RefreshCw size={140} />
          </div>
          <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-rose-400 mb-8">
            AI Predictor Flux
          </h4>
          <p className="text-xl font-black leading-tight mb-10">
            Neural analysis of current{' '}
            <span className="text-rose-400 underline decoration-rose-500/30 underline-offset-8">
              extension cadence
            </span>{' '}
            suggests a 42% burnout probability in Engineering within 72h.
          </p>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500">
                  Suggested Action
                </p>
                <p className="font-black text-sm text-info mt-1 uppercase">Cycle Rotation P-4</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl text-white">
                <Play size={16} />
              </div>
            </div>
          </div>
          <button className="w-full mt-10 py-5 bg-surface border border-border text-text-primary rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
            <Gauge size={16} /> Deploy Rebalancer
          </button>
        </div>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-card p-14 rounded-[4rem] border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
            <ShieldCheck size={280} />
          </div>
          <h3 className="text-3xl font-black text-foreground tracking-tight mb-12 uppercase">
            Compliance Matrix
          </h3>
          <div className="space-y-8 relative z-10">
            {[
              { label: 'Standard Multiplier', val: '1.5x', icon: Zap, color: 'blue' },
              { label: 'Public Holiday Factor', val: '2.0x', icon: Calendar, color: 'emerald' },
              { label: 'Night Shift Bonus', val: '+25%', icon: Clock, color: 'indigo' },
              { label: 'Weekly Hour Ceiling', val: '16h Max', icon: Ban, color: 'rose' },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between pb-6 border-b border-border last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 bg-${p.color}-50 dark:bg-${p.color}-900/20 text-${p.color}-600 dark:text-${p.color}-400 rounded-2xl flex items-center justify-center shadow-inner`}
                  >
                    <p.icon size={20} />
                  </div>
                  <span className="text-[0.6875rem] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {p.label}
                  </span>
                </div>
                <span className="text-xl font-black text-foreground">{p.val}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-14 py-6 bg-secondary text-muted-foreground hover:text-primary rounded-[1.75rem] font-black uppercase text-[0.6875rem] tracking-widest border border-border transition-all">
            Audit Legal Handbook
          </button>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-900 p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-[1.75rem] flex items-center justify-center shadow-2xl">
              <Settings2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-black tracking-tight">Policy Versioning</h4>
              <p className="text-blue-100/60 font-black uppercase text-[0.625rem] tracking-[0.4em]">
                Governance Locked Protocol
              </p>
            </div>
          </div>
          <p className="text-blue-100 text-lg leading-relaxed mb-12 antialiased opacity-80 relative z-10">
            Update the{' '}
            <span className="text-white font-black underline decoration-white/30 underline-offset-8">
              Global OT Weightings
            </span>{' '}
            for the upcoming peak-flux period (Q4). Any modifications require dual-signature
            authorization from Fiscal and Ops leads.
          </p>
          <div className="space-y-6 relative z-10">
            <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-blue-200 mb-6">
                Simulation Engine: Potential Impact
              </p>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-black tracking-tighter">+$142k</span>
                <span className="text-[0.625rem] text-success font-black uppercase bg-success/10 px-3 py-1 rounded-lg">
                  Budget Flux
                </span>
              </div>
              <p className="text-xs text-blue-100/50">
                Simulated across 1,200 nodes based on historical Q4 temporal extension logs.
              </p>
            </div>
            <button className="w-full py-5 bg-surface border border-border text-text-primary rounded-[1.375rem] font-black uppercase text-[0.6875rem] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Sparkles size={18} /> Launch Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Overtime Pulse
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-0.5 bg-destructive"></span>
            Temporal Extension Governance & Fiscal Rebalancing Node
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <button
            aria-label="Refresh data"
            className="bg-secondary p-4 rounded-2xl text-muted-foreground hover:text-destructive transition-all shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Initiate new extension"
            className="bg-destructive text-destructive-foreground px-10 py-4 rounded-[1.375rem] font-black uppercase text-[0.6875rem] tracking-widest flex items-center gap-4 shadow-2xl shadow-destructive/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Zap size={18} /> Initiate Extension
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div className="flex items-center justify-between mb-8">
              <div
                className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 shadow-inner`}
              >
                <s.icon size={24} />
              </div>
              <span
                className={`text-[0.625rem] font-black px-3 py-1.5 rounded-xl border ${s.change.startsWith('+') ? 'text-success bg-emerald-50 dark:bg-success/10 border-success/10' : 'text-muted-foreground bg-secondary border-border'}`}
              >
                {s.change}
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter">{s.value}</h4>
          </div>
        ))}
      </div>

      <HorizontalTabs
        tabs={[
          { id: 'ledger', label: 'Extension Ledger', icon: BarChart3 },
          { id: 'rebalance', label: 'Rebalance Logic', icon: RefreshCw },
          { id: 'policies', label: 'Policy Matrix', icon: Settings2 },
          { id: 'config', label: 'Configuration', icon: Sliders },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as OvertimeTab)}
        wrap={true}
      />

      <main>
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'rebalance' && renderRebalance()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'config' && <OvertimeConfiguration />}
      </main>

      {/* Initiation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-background/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-xl rounded-[4rem] shadow-[0_0_6.25rem_rgba(0,0,0,0.5)] border border-border overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-12 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-destructive text-destructive-foreground rounded-2xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">
                    Log Extension
                  </h3>
                  <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
                    Personnel Temporal Delta Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="p-3 bg-secondary rounded-xl text-muted-foreground hover:text-destructive transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInitiate} className="p-12 space-y-8">
              <div className="space-y-2">
                <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                  Node Name
                </label>
                <input
                  required
                  className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none focus:ring-2 focus:ring-destructive/20 shadow-inner"
                  placeholder="Select Employee Node..."
                  value={newOT.name}
                  onChange={(e) => setNewOT({ ...newOT, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                    Delta Hours
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none shadow-inner"
                    value={newOT.hours}
                    onChange={(e) => setNewOT({ ...newOT, hours: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                    Multiplier Factor
                  </label>
                  <select
                    className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none cursor-pointer shadow-inner"
                    value={newOT.multiplier}
                    onChange={(e) => setNewOT({ ...newOT, multiplier: Number(e.target.value) })}
                  >
                    <option value={1.5}>1.5x (Weekday)</option>
                    <option value={2.0}>2.0x (Holiday)</option>
                    <option value={1.75}>1.75x (Night)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                  Rationale
                </label>
                <textarea
                  required
                  className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-bold text-muted-foreground outline-none resize-none h-32 shadow-inner"
                  placeholder="Describe the purpose of this extension pulse..."
                  value={newOT.reason}
                  onChange={(e) => setNewOT({ ...newOT, reason: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full py-6 bg-destructive text-destructive-foreground rounded-3xl font-black uppercase text-[0.75rem] tracking-widest shadow-2xl shadow-destructive/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <Send size={18} /> Commit Extension Node
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card dark:bg-gradient-to-br dark:from-destructive/10 dark:via-card dark:to-card p-20 rounded-[5rem] text-foreground shadow-2xl relative overflow-hidden group border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
          <div className="w-32 h-32 bg-destructive text-destructive-foreground rounded-[2.5rem] flex items-center justify-center shadow-[0_2.1875rem_5rem_-0.9375rem] shadow-destructive/30 animate-pulse shrink-0">
            <Zap className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black tracking-tighter leading-none antialiased uppercase">
              Immutable Temporal Extension Ledger
            </h3>
            <p className="text-muted-foreground mt-8 text-xl max-w-4xl leading-relaxed antialiased">
              The{' '}
              <span className="text-destructive underline underline-offset-8 decoration-4 decoration-destructive/30">
                PeopleOS Extension Kernel
              </span>{' '}
              ensures that every minute of temporal extendability is logged with cryptographic
              precision. AI-driven rebalancing automatically detects clusters exceeding burnout
              thresholds to protect workforce wellness.
            </p>
          </div>
          <button className="px-16 py-6 bg-background text-foreground border border-border hover:bg-destructive hover:text-destructive-foreground rounded-[2rem] font-black uppercase text-[0.75rem] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shrink-0">
            Audit Extension Weights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overtime;
