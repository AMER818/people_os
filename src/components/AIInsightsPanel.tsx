import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Bolt,
  Network,
  CheckCircle2,
} from 'lucide-react';
import { getFastInsight, getDeepAudit } from '../services/geminiService';

interface AIInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ isOpen, onClose, context }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');

  const generateInsights = async (forcedMode?: 'fast' | 'deep') => {
    setLoading(true);
    const targetMode = forcedMode || mode;

    // Abstracting mock data for context
    // Abstracting mock data for context
    const mockData = {
      dashboard: { headcount: 0, attrition: 0, engagement: 0, budgetUtilization: 0 },
      employees: { nodes: 0, missing_biometrics: 0, performance_avg: 0 },
      payroll: { variance: 0, tax_compliance: 0, pending_approvals: 0 },
      recruitment: { funnel_volume: 0, avg_hire_time: 0, cost_per_hire: 0 },
      attendance: { clocked_in: 0, anomalies: 0, shift_coverage: 0 },
    }[context as string] || { general_status: 'No Data' };

    let result = '';
    if (targetMode === 'fast') {
      result = await getFastInsight(`Briefly analyze metrics for ${context}`, mockData);
    } else {
      result = await getDeepAudit(
        `Perform a strategic workforce audit for ${context} module`,
        mockData
      );
    }

    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateInsights();
    }
  }, [isOpen, context]);

  const switchMode = (newMode: 'fast' | 'deep') => {
    setMode(newMode);
    generateInsights(newMode);
  };

  if (!isOpen) { return null; }

  return (
    <div className="fixed inset-y-0 right-0 w-[28.125rem] bg-white dark:bg-slate-900 shadow-[0_0_5rem_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-slate-200 dark:border-white/5 animate-in slide-in-from-right duration-500">
      <div className="p-8 bg-slate-950 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-info/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none uppercase">
              Neural Analyst
            </h2>
            <p className="text-[0.5625rem] font-black text-info uppercase tracking-[0.3em] mt-2">
              v3.1 Core Intelligence
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI Insights"
          className="p-3 hover:bg-white/10 rounded-2xl transition-all relative z-10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Intelligence Mode Toggle */}
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-3xl flex gap-2">
          <button
            onClick={() => switchMode('fast')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[0.625rem] uppercase tracking-widest transition-all ${mode === 'fast' ? 'bg-white dark:bg-slate-700 text-primary shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Bolt className="w-4 h-4" /> Fast Insight
          </button>
          <button
            onClick={() => switchMode('deep')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[0.625rem] uppercase tracking-widest transition-all ${mode === 'deep' ? 'bg-white dark:bg-slate-700 text-primary-soft shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Network className="w-4 h-4" /> Deep Audit
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-3xl flex gap-4">
          <BrainCircuit className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-bold uppercase tracking-widest">
              Context:{' '}
              <span className="underline decoration-blue-300 dark:decoration-blue-700 underline-offset-4">
                {context}
              </span>
            </p>
            <p className="text-[0.625rem] text-slate-500 mt-2 font-medium">
              Mode:{' '}
              {mode === 'fast'
                ? 'Gemini 2.5 Flash Lite (0.4s lat)'
                : 'Gemini 3 Pro (High Reasoning)'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw className="w-12 h-12 animate-spin-slow mb-6 text-info" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">
              {mode === 'deep' ? 'Synthesizing Neural Threads...' : 'Streaming Metrics...'}
            </p>
            {mode === 'deep' && (
              <p className="text-[0.5625rem] mt-4 opacity-50 max-w-[12.5rem] text-center">
                Allocating 32k thinking budget for deep logic sequence.
              </p>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:font-medium prose-strong:font-black prose-strong:text-primary">
              <div
                dangerouslySetInnerHTML={{
                  __html: insight
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\s*-\s+(.*)/gm, '<li>$1</li>')
                    .replace(/<li>/g, '<ul class="list-disc pl-4 space-y-2 mt-2"><li>')
                    .replace(/<\/li>\s*(?!<li>)/g, '</li></ul>'),
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[0.625rem] font-black text-slate-400 uppercase tracking-[0.25em]">
            Strategic Actions
          </h3>
          <div className="space-y-3">
            {[
              { text: 'Launch Automated Pulse Survey', icon: AlertTriangle, color: 'orange' },
              { text: 'Recalibrate Retention Parameters', icon: Lightbulb, color: 'blue' },
              { text: 'Initiate Deep Dive Forecast', icon: Network, color: 'indigo' },
            ].map((action, i) => (
              <button
                key={i}
                className={`w-full text-left p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 flex items-center gap-4 hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all group`}
              >
                <div
                  className={`p-3 rounded-xl bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[0.6875rem] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                  {action.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-white dark:bg-slate-800 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4" /> Acknowledge
        </button>
        <button
          onClick={() => generateInsights()}
          className="flex-1 py-4 bg-slate-900 dark:bg-primary rounded-2xl text-[0.625rem] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} /> Re-Analyze Flux
        </button>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
