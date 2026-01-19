import React, { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Mail,
  Sparkles,
  Plus,
  Laptop,
  Key,
  RefreshCw,
} from 'lucide-react';
import { NewHireNode } from '../../types';
import { api } from '../../services/api';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DateInput } from '../../components/ui/DateInput';
import RecruitmentFooter from '../recruitment/RecruitmentFooter';
import { useSaveEntity } from '../../hooks/useSaveEntity';

const Onboarding: React.FC = () => {
  const [hires, setHires] = useState<NewHireNode[]>([]);
  const enrollModal = useModal();

  const initialHireState = { name: '', role: '', mentor: '', date: '' };

  const {
    formData: newHire,
    updateField: updateHireField,
    isSaving: isSavingHire,
    handleSave: handleEnroll,
    setFormData: setHireData,
  } = useSaveEntity<NewHireNode, typeof initialHireState>({
    onSave: (data) => api.saveHire(data),
    onAfterSave: async () => {
      await loadHires();
      enrollModal.close();
    },
    successMessage: 'Personnel enrolled successfully.',
    initialState: initialHireState,
    validate: (data) => !!(data.name && data.role && data.date),
    transform: (data) => ({
      id: `NH${Date.now()}`,
      name: data.name,
      role: data.role,
      mentor: data.mentor || 'Sarah Jenkins',
      progress: 0,
      startDate: data.date,
      steps: [
        { id: 's1', label: 'ID Auth Created', done: false },
        { id: 's2', label: 'Hardware Dispatched', done: false },
        { id: 's3', label: 'Policy Review', done: false },
        { id: 's4', label: 'Neural Sync / Orientation', done: false },
      ],
    }),
  });

  useEffect(() => {
    loadHires();
  }, []);

  const loadHires = async () => {
    const data = await api.getHires();
    setHires(data);
  };

  const toggleStep = async (hireId: string, stepId: string) => {
    await api.updateHireStep(hireId, stepId);
    loadHires();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Node Activation
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Personnel Integration & Cultural Immersion Ledger
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <div className="flex items-center gap-6 px-4">
            <div className="flex -space-x-3">
              {hires.slice(0, 3).map((h, i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${h.id}/100`}
                  className="w-10 h-10 rounded-full border-4 border-card shadow-lg"
                  alt={h.name}
                />
              ))}
            </div>
            <p className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground">
              <span className="text-primary text-lg">{hires.length}</span> Active Hires
            </p>
          </div>
          <Button
            onClick={() => {
              setHireData(initialHireState);
              enrollModal.open();
            }}
            icon={Plus}
          >
            Enroll New Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {hires.map((hire) => (
          <div
            key={hire.id}
            className="bg-card rounded-[4rem] border border-border shadow-2xl p-14 space-y-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
              <Rocket size={180} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-8">
                <img
                  src={`https://picsum.photos/seed/${hire.id}/200`}
                  className="w-24 h-24 rounded-[2.25rem] border-4 border-secondary shadow-2xl"
                  alt={hire.name}
                />
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">
                    {hire.name}
                  </h3>
                  <p className="text-primary font-black text-[0.625rem] uppercase tracking-[0.3em] mt-3">
                    {hire.role}
                  </p>
                  <p className="text-muted-foreground text-[0.5625rem] font-black uppercase tracking-widest mt-1">
                    Start: {hire.startDate} • Mentor: {hire.mentor}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-4 py-1.5 rounded-xl text-[0.625rem] font-black uppercase tracking-widest ${hire.progress === 100 ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
                >
                  {hire.progress === 100 ? 'Fully Activated' : 'Immersion Phase'}
                </span>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground">
                  Node Activation Level
                </span>
                <span className="text-3xl font-black text-foreground">{hire.progress}%</span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden border border-border p-1">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_0.9375rem_rgba(37,99,235,0.4)]"
                  style={{ width: `${hire.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {hire.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => toggleStep(hire.id, step.id)}
                  className={`p-6 rounded-[2rem] border flex items-center justify-between gap-4 transition-all text-left ${step.done ? 'bg-success/5 dark:bg-emerald-900/10 border-success/20' : 'bg-secondary border-border hover:border-primary/30'}`}
                >
                  <div className="flex items-center gap-4">
                    {step.done ? (
                      <CheckCircle2 className="text-success w-5 h-5 shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground w-5 h-5 shrink-0" />
                    )}
                    <span
                      className={`text-[0.625rem] font-black uppercase tracking-widest ${step.done ? 'text-emerald-600' : 'text-muted-foreground'}`}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-border flex items-center justify-between relative z-10">
              <button className="text-muted-foreground hover:text-primary font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-2">
                <Mail size={16} /> Contact Mentor
              </button>
              <button className="bg-foreground text-background px-8 py-4 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-xl flex items-center justify-center gap-4 hover:scale-[1.05] transition-all">
                Launch Activation Hub <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-8 h-8 text-primary" />
              <h4 className="text-[0.625rem] font-black uppercase tracking-[0.5em] text-primary">
                Gemini Neural Mentor
              </h4>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none mb-8">
              Auto-Immersion Protocol
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed mb-12 antialiased">
              The PeopleOS immersion engine analyzes the hire's technical signature and
              automatically provisions tailored{' '}
              <span className="text-white underline decoration-primary/40 underline-offset-8">
                knowledge clusters
              </span>{' '}
              and Slack/Jira access nodes within 1.2ms of enrollment hashing.
            </p>
            <div className="flex gap-6">
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <Cpu className="text-primary" />
                <span className="text-[0.625rem] font-black uppercase tracking-widest">
                  Provisioning: 99.4% Automated
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Laptop, label: 'Asset Preparation' },
              { icon: Key, label: 'Identity Auth' },
              { icon: ShieldCheck, label: 'Security Audit' },
              { icon: RefreshCw, label: 'Neural Sync' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl text-center hover:bg-white/10 transition-all cursor-pointer"
              >
                <item.icon className="w-10 h-10 mx-auto mb-6 text-primary" />
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecruitmentFooter />

      <FormModal
        title="Enroll Personnel"
        isOpen={enrollModal.isOpen}
        onClose={enrollModal.close}
        onSave={handleEnroll}
        isLoading={isSavingHire}
        size="md"
      >
        <div className="space-y-8">
          <Input
            label="Full Legal Name"
            required
            value={newHire.name}
            onChange={(e) => updateHireField('name', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Assigned Role"
              required
              value={newHire.role}
              onChange={(e) => updateHireField('role', e.target.value)}
            />
            <DateInput
              label="Start Temporal Point"
              required
              value={newHire.date}
              onChange={(e) => updateHireField('date', e.target.value)}
            />
          </div>
          <Input
            label="Activation Mentor"
            placeholder="Search internal node..."
            value={newHire.mentor}
            onChange={(e) => updateHireField('mentor', e.target.value)}
          />
        </div>
      </FormModal>
    </div>
  );
};

export default Onboarding;
