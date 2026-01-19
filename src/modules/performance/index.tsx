import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  Star,
  AlertCircle,
  MoreVertical,
  Plus,
  Zap,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  Gavel,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { Goal } from '../../types';
import { api } from '../../services/api';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DateInput } from '../../components/ui/DateInput';
import { useSaveEntity } from '../../hooks/useSaveEntity';
import RecruitmentFooter from '../recruitment/RecruitmentFooter';

const PerformanceModule: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const goalModal = useModal();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationResult, setCalibrationResult] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const data = await api.getGoals();
    setGoals(data);
  };

  const {
    formData: newGoal,
    updateField: updateGoalField,
    isSaving,
    handleSave: handleSaveGoal,
  } = useSaveEntity<Goal, Partial<Goal>>({
    onSave: (goal) => api.saveGoal(goal),
    onAfterSave: async () => {
      await loadGoals();
      goalModal.close();
    },
    successMessage: 'Objective authored successfully.',
    initialState: {
      title: '',
      category: 'Strategic',
      weight: 0,
      status: 'Initiated',
      metric: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
    },
    validate: (data) => !!(data.title && data.weight),
    transform: (data) => ({
      id: `G-${Date.now()}`,
      title: data.title || '',
      category: data.category as any,
      progress: 0,
      metric: data.metric || 'N/A',
      status: 'Initiated',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      weight: Number(data.weight),
      description: data.description || '',
      trend: 'neutral',
    }),
  });

  const stats = [
    { label: 'Avg Performance', val: '8.4/10', icon: Star, color: 'primary' },
    { label: 'OKR Completion', val: '72%', icon: Target, color: 'primary' },
    { label: 'Feedback Volume', val: '24 Reviews', icon: MessageSquare, color: 'success' },
    { label: 'Risk to Outcome', val: 'Low', icon: AlertCircle, color: 'warning' },
  ];

  const handleNeuralCalibration = () => {
    setIsCalibrating(true);
    setCalibrationResult(null);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrationResult(
        "AI analysis suggests a 'Top Talent' designation. High alignment with strategic Q3 OKRs and positive 360 sentiment detected."
      );
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase antialiased">
            Performance Management
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary"></span>
            Goals, OKRs & AI Reviews
          </p>
        </div>
        <div className="flex p-2 bg-card rounded-[2rem] shadow-2xl border border-border">
          <button
            aria-label="View my scorecard"
            className="px-10 py-4 bg-primary text-primary-foreground rounded-[1.5rem] text-[0.625rem] font-black uppercase tracking-widest shadow-xl transition-all"
          >
            My Scorecard
          </button>
          <button
            aria-label="View team hub"
            className="px-10 py-4 text-muted-foreground hover:text-foreground rounded-[1.5rem] text-[0.625rem] font-black uppercase tracking-widest transition-all"
          >
            Team Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 w-fit mb-8 shadow-inner group-hover:rotate-12 transition-transform`}
            >
              <s.icon size={28} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
              {s.val}
            </h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Goal Ledger */}
          <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[37.5rem] flex flex-col">
            <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30 backdrop-blur-3xl">
              <h3 className="text-3xl font-black text-foreground tracking-tight uppercase leading-none">
                Active Objectives
              </h3>
              <Button
                onClick={() => {
                  goalModal.open();
                }}
                icon={Plus}
              >
                Author Objective
              </Button>
            </div>
            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-8 bg-secondary/50 rounded-[3rem] border border-border group hover:shadow-xl hover:border-primary/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1.5 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest bg-card border border-border text-muted-foreground">
                        {goal.category}
                      </span>
                      <MoreVertical
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        size={18}
                        aria-label="More options"
                      />
                    </div>
                    <h4 className="text-2xl font-black text-foreground leading-tight mb-8 antialiased">
                      {goal.title}
                    </h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[0.625rem] font-black uppercase text-muted-foreground tracking-widest mb-1">
                          Impact Weight
                        </p>
                        <p className="text-lg font-black text-primary">{goal.weight}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.625rem] font-black uppercase text-muted-foreground tracking-widest mb-1">
                          State: {goal.status}
                        </p>
                        <p className="text-xl font-black text-foreground">{goal.progress}%</p>
                      </div>
                    </div>
                    <div className="h-3 bg-card rounded-full overflow-hidden shadow-inner p-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_0.9375rem_rgba(37,99,235,0.4)]"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Calibration Section */}
          <div className="bg-card dark:bg-gradient-to-br dark:from-primary/10 dark:via-card dark:to-card p-20 rounded-[5rem] text-foreground shadow-2xl relative overflow-hidden group border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
            <BrainCircuit className="absolute -right-8 -top-8 w-64 h-64 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-1000 text-muted-foreground" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="w-40 h-40 bg-primary text-primary-foreground rounded-[3rem] flex items-center justify-center shadow-[0_2.1875rem_5rem_-0.9375rem] shadow-primary/30 shrink-0 group-hover:rotate-6 transition-transform">
                <Sparkles className="w-20 h-20 animate-pulse" />
              </div>
              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="text-4xl font-black tracking-tighter leading-none uppercase antialiased">
                    AI Performance Review
                  </h3>
                  <p className="text-primary dark:text-primary/80 font-black uppercase text-[0.6875rem] tracking-[0.4em] mt-4">
                    AI-Augmented Performance Audit
                  </p>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed antialiased">
                  The{' '}
                  <span className="text-foreground underline decoration-primary/40 underline-offset-8">
                    AI Engine
                  </span>{' '}
                  parses 360 feedback, OKR progress, and peer interaction to eliminate human bias
                  during appraisal cycles.
                </p>
                {calibrationResult ? (
                  <div className="p-8 bg-secondary/50 dark:bg-background/50 rounded-[2rem] border border-border animate-in zoom-in duration-500">
                    <p className="text-sm font-bold text-foreground leading-relaxed italic">
                      "{calibrationResult}"
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleNeuralCalibration}
                    disabled={isCalibrating}
                    aria-label="Start AI performance review"
                    className="bg-primary text-primary-foreground px-12 py-5 rounded-[1.375rem] font-black uppercase text-[0.6875rem] tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                  >
                    {isCalibrating ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <Zap size={18} />
                    )}
                    {isCalibrating ? 'Analyzing Data...' : 'Start AI Review'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          {/* Summary Sidebar */}
          <div className="bg-card p-12 rounded-[4rem] border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp size={240} />
            </div>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tight mb-10 relative z-10">
              Performance History
            </h4>
            <div className="space-y-8 relative z-10">
              {[
                { label: 'Q1 Score', val: '8.2', trend: 'up' },
                { label: 'Q2 Score', val: '7.8', trend: 'down' },
                { label: 'Q3 Forecast', val: '8.4', trend: 'up' },
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 bg-secondary/50 rounded-[2rem] hover:scale-105 transition-all cursor-pointer border border-transparent hover:border-border shadow-inner"
                >
                  <div>
                    <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                      {h.label}
                    </p>
                    <p className="text-2xl font-black text-foreground">{h.val}</p>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${h.trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                  >
                    {h.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 360 Feedback Summary */}
          <div className="bg-primary p-12 rounded-[4rem] text-primary-foreground shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <MessageSquare size={320} />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-4 uppercase">Feedback Summary</h4>
            <p className="text-primary-foreground/80 text-[0.625rem] mb-10 opacity-80 uppercase font-black tracking-[0.2em]">
              Latest 360 Feedback Snippets
            </p>
            <div className="space-y-6 relative z-10">
              {[
                { user: 'Mark Sterling', comment: 'Exceptional architectural leadership.' },
                { user: 'Elena Fisher', comment: 'Proactive node rebalancing skills.' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-xl group/item hover:bg-white/20 transition-all"
                >
                  <p className="text-xs font-bold leading-relaxed italic">"{f.comment}"</p>
                  <p className="text-[0.5625rem] font-black uppercase text-primary-foreground/70 mt-4">
                    — {f.user}
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 bg-background text-foreground rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 transition-all">
              View Full Sentiment Report
            </button>
          </div>

          <div className="bg-card p-12 rounded-[4rem] border border-border shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-inner">
              <Gavel size={32} />
            </div>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Policy Lock
            </h4>
            <p className="text-muted-foreground text-xs mt-4 mb-8 font-bold leading-relaxed antialiased">
              Annual appraisal protocols are locked until the end of the current fiscal cycle (Q4).
            </p>
            <button className="px-10 py-3 bg-secondary text-muted-foreground rounded-xl text-[0.625rem] font-black uppercase tracking-widest">
              View Policy
            </button>
          </div>
        </div>
      </div>

      <RecruitmentFooter />

      {/* Goal Initiation Modal */}
      <FormModal
        title="Author Objective"
        isOpen={goalModal.isOpen}
        onClose={goalModal.close}
        onSave={handleSaveGoal}
        isLoading={isSaving}
        size="md"
      >
        <div className="space-y-8">
          <Input
            label="Objective Title"
            required
            placeholder="What is the mission target?"
            value={newGoal.title}
            onChange={(e) => updateGoalField('title', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-8">
            <DateInput
              label="Due Date"
              value={newGoal.dueDate || ''}
              onChange={(e) => updateGoalField('dueDate', e.target.value)}
            />
            <Input
              label="Metric / KPI"
              placeholder="e.g. Revenue > 1M"
              value={newGoal.metric}
              onChange={(e) => updateGoalField('metric', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Cluster Logic
              </label>
              <select
                className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none cursor-pointer shadow-inner appearance-none"
                value={newGoal.category}
                onChange={(e) => updateGoalField('category', e.target.value as any)}
              >
                <option>Strategic</option>
                <option>Operational</option>
                <option>Cultural</option>
                <option>Development</option>
              </select>
            </div>
            <Input
              label="Impact Weight (%)"
              type="number"
              required
              placeholder="1-100"
              value={newGoal.weight}
              onChange={(e) => updateGoalField('weight', Number(e.target.value))}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Success Criteria / Key Results
            </label>
            <textarea
              rows={3}
              className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-bold text-muted-foreground outline-none resize-none shadow-inner"
              placeholder="Define immutable proof of completion..."
              value={newGoal.description}
              onChange={(e) => updateGoalField('description', e.target.value)}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PerformanceModule;
