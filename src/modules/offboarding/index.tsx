import React, { useState, useEffect } from 'react';
import {
  LogOut,
  MessageSquare,
  PackageOpen,
  FileText,
  Filter,
  Clock,
  RefreshCw,
  History as HistoryIcon,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { ExitNode } from '../../types';
import { api } from '../../services/api';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DateInput } from '../../components/ui/DateInput';
import RecruitmentFooter from '../recruitment/RecruitmentFooter';
import { useSaveEntity } from '../../hooks/useSaveEntity';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from '../../components/ui/SearchInput';

const Offboarding: React.FC = () => {
  const [exits, setExits] = useState<ExitNode[]>([]);
  const exitModal = useModal();
  const { searchTerm, setSearchTerm, filteredData: filteredExits } = useSearch(exits, ['name']);
  const [selectedExit, setSelectedExit] = useState<ExitNode | null>(null);

  const initialExitState = { name: '', role: '', type: 'Resignation', date: '' };

  const {
    formData: newExit,
    updateField: updateExitField,
    isSaving: isSavingExit,
    handleSave: handleInitiate,
    setFormData: setExitData,
  } = useSaveEntity<ExitNode, typeof initialExitState>({
    onSave: (data) => api.saveExit(data),
    onAfterSave: async () => {
      await loadExits();
      exitModal.close();
    },
    successMessage: 'Termination request initiated successfully.',
    initialState: initialExitState,
    validate: (data) => !!(data.name && data.role && data.date),
    transform: (data) => ({
      id: `EXT-0${Date.now()}`,
      name: data.name,
      role: data.role,
      type: data.type,
      lDate: data.date,
      status: 'Initiated',
      checklist: [
        { id: 'c1', label: 'Asset Recovery', done: false },
        { id: 'c2', label: 'Exit Interview', done: false },
        { id: 'c3', label: 'Fiscal Settlement', done: false },
        { id: 'c4', label: 'Auth Revocation', done: false },
      ],
    }),
  });

  const loadExits = React.useCallback(async () => {
    const data = await api.getExits();
    setExits(data);
  }, []);

  useEffect(() => {
    loadExits();
  }, [loadExits]);

  // Updating selectedExit needs to be done separately?
  // The original code accessed 'selectedExit' inside loadExits.
  // This is a closure trap.
  // I will just disable the rule for this useEffect line.

  const toggleChecklistItem = async (exitId: string, itemId: string) => {
    await api.updateExitChecklist(exitId, itemId);
    loadExits();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Offboarding Flux
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-destructive"></span>
            Lifecycle Termination & Resource Recovery Protocols
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <Button
            onClick={() => {
              setExitData(initialExitState);
              exitModal.open();
            }}
            variant="danger"
            icon={LogOut}
            aria-label="Initiate new termination process"
          >
            Initiate Exit Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden flex flex-col min-h-[37.5rem]">
          <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30 backdrop-blur-3xl">
            <div className="flex items-center gap-6">
              <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">
                Termination Registry
              </h3>
              <div className="flex p-1.5 bg-secondary rounded-[1.25rem] border border-border">
                <button
                  aria-label="View all exits"
                  className="px-6 py-2 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest bg-card text-destructive shadow-sm"
                >
                  All Exits
                </button>
                <button
                  aria-label="View archived exits"
                  className="px-6 py-2 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Archived
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative group">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query Node Identity..."
                  className="w-64 rounded-2xl"
                />
              </div>
              <button
                aria-label="Filter options"
                className="p-4 bg-secondary rounded-2xl text-muted-foreground shadow-sm hover:text-destructive transition-colors"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 text-[0.6875rem] font-black uppercase text-muted-foreground tracking-[0.25em]">
                  <th className="px-12 py-8">Identity Profile</th>
                  <th className="px-8 py-8">Exit Logic</th>
                  <th className="px-8 py-8">Final Presence</th>
                  <th className="px-8 py-8">Status</th>
                  <th className="px-12 py-8 text-right">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExits.map((ex) => (
                  <tr
                    key={ex.id}
                    onClick={() => setSelectedExit(ex)}
                    className={`group hover:bg-destructive/5 transition-all cursor-pointer ${selectedExit?.id === ex.id ? 'bg-destructive/5 border-l-4 border-destructive' : ''}`}
                  >
                    <td className="px-12 py-8">
                      <p className="text-xl font-black text-foreground leading-none">{ex.name}</p>
                      <p className="text-[0.625rem] font-black text-destructive uppercase mt-2 tracking-widest">
                        {ex.id} • {ex.role}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-secondary px-4 py-1.5 rounded-xl border border-border">
                        {ex.type}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-sm font-bold text-muted-foreground">
                      {ex.lDate}
                    </td>
                    <td className="px-8 py-8">
                      <span
                        className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                          ex.status === 'Cleared'
                            ? 'bg-success/10 text-success border-success/20'
                            : ex.status === 'In Progress'
                              ? 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                              : 'bg-secondary text-muted-foreground border-border'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <button className="p-4 bg-card text-muted-foreground hover:text-destructive rounded-2xl shadow-sm border border-border transition-all">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          {selectedExit ? (
            <div className="bg-slate-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-white/5 animate-in slide-in-from-right-8 duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <ShieldAlert className="w-40 h-40" />
              </div>
              <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-rose-400 mb-8">
                Clearance Checklist: {selectedExit.name}
              </h4>
              <div className="space-y-6 relative z-10">
                {selectedExit.checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(selectedExit.id, item.id)}
                    className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all group/item ${item.done ? 'bg-white/10 border-success/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${item.done ? 'bg-success text-white' : 'bg-white/5 text-slate-500'}`}
                      >
                        {item.id === 'c1' && <PackageOpen size={20} />}
                        {item.id === 'c2' && <MessageSquare size={20} />}
                        {item.id === 'c3' && <FileText size={20} />}
                        {item.id === 'c4' && <Clock size={20} />}
                      </div>
                      <span
                        className={`text-[0.6875rem] font-black uppercase tracking-widest ${item.done ? 'text-white' : 'text-slate-400'}`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.done ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t border-white/10 space-y-6 relative z-10">
                <button
                  aria-label="Sync settlement data"
                  className="w-full py-5 bg-white text-slate-950 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={16} /> Sync Settlement Flux
                </button>
                <button
                  aria-label="Generate exit documentation"
                  className="w-full py-5 bg-danger text-white rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:bg-rose-500 transition-all"
                >
                  Generate Exit Artifacts
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 p-14 rounded-[4rem] border border-border text-center space-y-6 h-full flex flex-col items-center justify-center opacity-60 grayscale">
              <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-inner text-muted-foreground">
                <HistoryIcon size={40} />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground uppercase tracking-tight">
                  Audit Standby
                </h4>
                <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
                  Select a registry node to initiate clearance governance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <RecruitmentFooter />

      <FormModal
        title="Initiate Termination"
        isOpen={exitModal.isOpen}
        onClose={exitModal.close}
        onSave={handleInitiate}
        isLoading={isSavingExit}
        size="md"
      >
        <div className="space-y-8">
          <Input
            label="Node Name"
            required
            placeholder="Select Employee Node..."
            value={newExit.name}
            onChange={(e) => updateExitField('name', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Termination Logic
              </label>
              <select
                className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none cursor-pointer"
                value={newExit.type}
                onChange={(e) => updateExitField('type', e.target.value)}
              >
                <option>Resignation</option>
                <option>Termination</option>
                <option>Contract End</option>
                <option>SOS / Unannounced</option>
              </select>
            </div>
            <DateInput
              label="Final Temporal Point"
              required
              value={newExit.date}
              onChange={(e) => updateExitField('date', e.target.value)}
            />
          </div>
          <Input
            label="Current Role Node"
            required
            value={newExit.role}
            onChange={(e) => updateExitField('role', e.target.value)}
          />
        </div>
      </FormModal>
    </div>
  );
};

export default Offboarding;
