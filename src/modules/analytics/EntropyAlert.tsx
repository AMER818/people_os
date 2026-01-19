import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { getDeepAudit } from '../../services/geminiService';

const EntropyAlert: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const handleAnalyzeCulprits = async () => {
    setIsAnalyzing(true);
    try {
      const response = await getDeepAudit(
        'Analyze Engineering Cluster for Q4 attrition risks and identify culprit nodes.',
        { cluster: 'Engineering', period: 'Q4' }
      );
      setInsights(response);
    } catch (error) {
      console.error('Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      role="alert"
      aria-label="Attrition Alert"
      className="bg-rose-50 dark:bg-rose-900/10 p-14 rounded-[4rem] border border-rose-100 dark:border-rose-900/20 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
        <ShieldAlert size={140} className="text-danger" />
      </div>
      <div className="flex items-center gap-6 mb-10 relative z-10">
        <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-500/30 group-hover:rotate-12 transition-transform">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-2xl font-black text-rose-900 dark:text-rose-400 tracking-tight leading-tight uppercase antialiased">
          Attrition Alert
        </h3>
      </div>
      <div className="p-10 bg-card rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 shadow-xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-danger animate-ping"></div>
          <p className="text-[0.625rem] font-black text-danger uppercase tracking-[0.3em]">
            Critical Attrition Spike
          </p>
        </div>
        <p className="text-xl font-black text-slate-800 dark:text-slate-200 leading-tight">
          AI detected{' '}
          <span className="text-danger underline underline-offset-4 decoration-rose-400/20">
            64% risk factor
          </span>{' '}
          within Engineering Cluster for Q4.
        </p>

        {insights && (
          <div className="mt-8 p-6 bg-muted rounded-3xl border border-border animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-4 h-4 text-info" />
              <p className="text-[0.625rem] font-black text-info uppercase tracking-widest">
                AI Insights
              </p>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
              {insights}
            </p>
          </div>
        )}

        <button
          onClick={handleAnalyzeCulprits}
          disabled={isAnalyzing}
          className="mt-10 text-[0.6875rem] font-black uppercase tracking-widest text-slate-400 hover:text-danger transition-all flex items-center gap-4 disabled:opacity-50"
          aria-label="Analyze risk factors"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight size={14} />}
          {isAnalyzing ? 'Analyzing Risk Factors...' : 'Analyze Risk Factors'}
        </button>
      </div>
    </div>
  );
};

export default EntropyAlert;
