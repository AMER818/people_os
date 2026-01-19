import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Umbrella,
  PiggyBank,
  Heart,
  Filter,
  Activity,
  CheckCircle2,
  X,
  Sparkles,
  Star,
  Shield,
  Award,
  List,
  Layers,
  ShieldAlert,
  History as HistoryIcon,
} from 'lucide-react';
import { BenefitEnrollment, BenefitTier } from '../../types';
import { api } from '../../services/api';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from '../../components/ui/SearchInput';

type BenefitsTab = 'ledger' | 'tiers' | 'claims';

const iconMap: Record<string, React.ElementType> = {
  Shield: Shield,
  Award: Award,
  Star: Star,
};

const Benefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BenefitsTab>('ledger');
  const [isModOpen, setIsModOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<BenefitEnrollment | null>(null);
  const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredEnrollments,
  } = useSearch(enrollments, ['name']);
  const [tiers, setTiers] = useState<BenefitTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [enrollmentsData, tiersData] = await Promise.all([
      api.getBenefitEnrollments(),
      api.getBenefitTiers(),
    ]);
    setEnrollments(enrollmentsData);
    setTiers(tiersData);
    setIsLoading(false);
  };

  const handleUpdateTier = async (tier: BenefitEnrollment['tier']) => {
    if (selectedNode) {
      await api.updateBenefitEnrollmentTier(selectedNode.id, tier);
      await loadData();
      setIsModOpen(false);
      setSelectedNode(null);
    }
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Shield;
  };

  const stats = [
    {
      label: 'Insured Nodes',
      val: enrollments.length.toString(),
      icon: ShieldCheck,
      color: 'blue',
    },
    { label: 'Retirement Pool', val: '$4.2M', icon: PiggyBank, color: 'indigo' },
    { label: 'Medical Usage', val: '14.2%', icon: Activity, color: 'rose' },
    { label: 'Benefit Yield', val: '94/100', icon: Heart, color: 'emerald' },
  ];

  const renderLedger = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden min-h-[31.25rem] flex flex-col">
        <div className="p-8 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-muted/50 backdrop-blur-3xl">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              Enrollment Registry
            </h3>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
              <Shield size={12} className="text-primary-soft" /> Statutory Welfare Coverage Active
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query Node UID..."
                className="w-64 rounded-2xl"
              />
            </div>
            <button
              aria-label="Filter enrollments"
              className="p-4 bg-muted rounded-2xl text-slate-500 hover:text-primary-soft transition-all shadow-sm"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-muted text-[0.625rem] font-black uppercase text-slate-400 tracking-[0.3em] font-sans">
                <th className="px-12 py-8">Personnel Node</th>
                <th className="px-8 py-8">Coverage Matrix</th>
                <th className="px-8 py-8">Activation Mark</th>
                <th className="px-12 py-8 text-right">Governance Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-12 py-8 text-center text-slate-500">
                    Loading enrollments...
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((row, i) => (
                  <tr
                    key={i}
                    className="group hover:bg-primary-soft/5 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedNode(row);
                      setIsModOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View enrollment for ${row.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedNode(row)}
                  >
                    <td className="px-12 py-8">
                      <p className="text-xl font-black text-slate-900 dark:text-white leading-none antialiased">
                        {row.name}
                      </p>
                      <p className="text-[0.625rem] font-black text-primary-soft uppercase mt-3 tracking-widest">
                        {row.id}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.tier === 'Platinum' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : row.tier === 'Gold' ? 'bg-amber-500 text-white' : 'bg-muted text-slate-400'}`}
                        >
                          <Award size={14} />
                        </div>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                          {row.tier} Tier
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-sm font-black text-slate-500 uppercase">{row.date}</p>
                      <p className="text-[0.5625rem] font-black text-slate-400 uppercase mt-1 tracking-widest">
                        Enrollment Hashed
                      </p>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <span
                        className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                          row.status === 'Active'
                            ? 'bg-success/10 text-success border-success/20 shadow-lg shadow-success/10'
                            : 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTiers = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
      {tiers.map((tier, i) => {
        const IconComponent = getIcon(tier.icon);
        return (
          <div
            key={i}
            className={`bg-card p-8 rounded-[2rem] border-2 shadow-2xl flex flex-col relative overflow-hidden group ${tier.popular ? 'border-amber-500/30' : 'border-border'}`}
          >
            {tier.popular && (
              <div className="absolute top-8 -right-10 bg-amber-500 text-white px-14 py-2 font-black text-[0.5625rem] uppercase tracking-[0.3em] rotate-45 shadow-lg">
                Popular Tier
              </div>
            )}
            <div
              className={`w-20 h-20 bg-${tier.color}-50 dark:bg-${tier.color}-900/20 text-${tier.color}-600 dark:text-${tier.color}-400 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform`}
            >
              <IconComponent size={36} />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase antialiased">
              {tier.name}
            </h3>
            <p className="text-slate-400 text-xs font-black uppercase mt-2 tracking-widest">
              Enterprise Coverage Node
            </p>
            <div className="my-10 space-y-4 flex-1">
              {tier.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <CheckCircle2 size={16} className={`text-${tier.color}-500`} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-end justify-between">
              <div>
                <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest">
                  Premium/Mo
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {tier.price}
                </p>
              </div>
              <button
                className={`px-8 py-3 rounded-2xl font-black uppercase text-[0.625rem] tracking-widest transition-all ${tier.popular ? 'bg-amber-500 text-white shadow-xl' : 'bg-muted text-slate-500 hover:text-primary'}`}
              >
                Edit Policy
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase antialiased">
            Node Welfare
          </h1>
          <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary-soft"></span>
            Global Benefit Administration & Coverage Ecosystem
          </p>
        </div>
        <HorizontalTabs
          tabs={[
            { id: 'ledger', label: 'Registry', icon: List },
            { id: 'tiers', label: 'Tiers', icon: Layers },
            { id: 'claims', label: 'Audit', icon: HistoryIcon },
          ]}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as BenefitsTab)}
          disabled={isLoading}
          wrap={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-8 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 w-fit mb-8 shadow-inner group-hover:rotate-12 transition-transform`}
            >
              <s.icon size={28} />
            </div>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {s.val}
            </h4>
          </div>
        ))}
      </div>

      <main>
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'tiers' && renderTiers()}
        {activeTab === 'claims' && (
          <div className="py-40 text-center space-y-12 bg-card rounded-[2rem] border border-border shadow-2xl">
            <div className="w-24 h-24 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <ShieldAlert size={40} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Immutable Audit Feed
              </h3>
              <p className="text-slate-400 font-black uppercase text-[0.6875rem] tracking-[0.4em] max-w-md mx-auto leading-relaxed mt-6">
                Streaming historical claim flux and statutory contribution hashes directly from the
                fiscal terminal.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Coverage Modification Modal */}
      {isModOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl rounded-[2rem] shadow-[0_0_6.25rem_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary-soft text-white rounded-2xl shadow-xl">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    Modify Protocol
                  </h3>
                  <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-2">
                    Node Coverage Tier Calibration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModOpen(false)}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-danger transition-all"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-10">
              {selectedNode && (
                <div className="p-8 bg-muted rounded-[2rem] border border-border flex items-center gap-6">
                  <img
                    src={`https://picsum.photos/seed/${selectedNode.id}/200`}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-lg"
                  />
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                      {selectedNode.name}
                    </p>
                    <p className="text-[0.625rem] font-black text-primary-soft uppercase mt-2 tracking-widest">
                      Current: {selectedNode.tier} Tier
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-3">
                  Select Target Tier
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['Standard', 'Gold', 'Platinum'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleUpdateTier(t as any)}
                      className="p-6 bg-muted rounded-[1.5rem] border-2 border-transparent hover:border-indigo-500/30 transition-all text-center group"
                    >
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 group-hover:text-primary-soft">
                        {t}
                      </p>
                      <p className="text-[0.5625rem] font-black text-slate-400 uppercase">
                        Tier Vector
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-success/5 p-8 rounded-[2rem] border border-success/10 flex items-start gap-5">
                <Sparkles className="text-success w-8 h-8 shrink-0" />
                <div>
                  <h5 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    AI Fiscal Projection
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold mt-1">
                    Upgrading to Platinum will increase node retention probability by 18% based on
                    recent engagement flux in this cluster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-950 p-20 rounded-[2rem] text-white shadow-[0_3.75rem_7.5rem_-1.875rem_rgba(0,0,0,0.8)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
          <div className="w-32 h-32 bg-primary-soft text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_2.1875rem_5rem_-0.9375rem_rgba(79,70,229,0.6)] animate-pulse shrink-0">
            <Umbrella className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black tracking-tighter leading-none antialiased uppercase">
              Unified Welfare Kernel
            </h3>
            <p className="text-slate-400 mt-8 text-xl max-w-4xl leading-relaxed antialiased">
              The{' '}
              <span className="text-indigo-400 underline underline-offset-8 decoration-4">
                PeopleOS Welfare Engine
              </span>{' '}
              synchronizes medical and statutory insurance pools with real-time personnel flux. Our
              automated tier calibration ensures optimal coverage yield for every node in the global
              registry.
            </p>
          </div>
          <button className="px-16 py-6 bg-surface border border-border text-text-primary rounded-[2rem] font-black uppercase text-[0.75rem] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shrink-0">
            Audit Coverage Yield
          </button>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
