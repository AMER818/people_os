import React, { useState } from 'react';
import { TrendingUp, Network, Zap, RefreshCw } from 'lucide-react';
import { getDeepAudit } from '../../services/geminiService';

const NeuralModeling: React.FC = () => {
  const [modelingScope, setModelingScope] = useState<'6M' | '1Y' | '3Y'>('6M');
  const [isPredicting, setIsPredicting] = useState(false);
  const [forecast, setForecast] = useState<string | null>(null);

  const triggerNeuralSimulation = async () => {
    setIsPredicting(true);
    try {
      const response = await getDeepAudit(`Workforce growth forecast for ${modelingScope} scope`, {
        scope: modelingScope,
      });
      setForecast(response);
    } catch (error) {
      console.error('Forecast Error:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="bg-slate-950 p-20 rounded-[5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>
      <Network className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 w-80 h-80" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
        <div className="w-48 h-48 bg-primary rounded-[4rem] flex items-center justify-center shadow-[0_2.1875rem_5rem_-0.9375rem_rgba(37,99,235,0.6)] shrink-0 animate-in zoom-in duration-700">
          <TrendingUp className="w-24 h-24 text-white" />
        </div>
        <div className="flex-1 space-y-10">
          <div>
            <h3 className="text-4xl font-black tracking-tighter leading-none uppercase antialiased">
              AI Modeling
            </h3>
            <p className="text-info font-black uppercase text-[0.6875rem] tracking-[0.4em] mt-4">
              Predictive Simulation Workspace
            </p>
          </div>
          <div className="flex gap-4 p-1.5 bg-white/5 rounded-[1.375rem] border border-white/10 w-fit">
            {['6M', '1Y', '3Y'].map((s) => (
              <button
                key={s}
                onClick={() => setModelingScope(s as any)}
                aria-label={`Select ${s} forecast scope`}
                className={`px-8 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest transition-all ${modelingScope === s ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                {s} Forecast
              </button>
            ))}
          </div>
          <div className="space-y-6">
            <p className="text-slate-400 text-lg leading-relaxed antialiased max-w-xl">
              Simulate headcount growth vs fiscal liability. The{' '}
              <span className="text-white underline decoration-blue-500/40 underline-offset-8">
                AI Predictor
              </span>{' '}
              accounts for inflation, churn, and regional hiring velocity.
            </p>
            {forecast && (
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-sm font-bold text-blue-200 leading-relaxed italic">
                  "{forecast}"
                </p>
              </div>
            )}
          </div>
          <button
            onClick={triggerNeuralSimulation}
            disabled={isPredicting}
            className="px-12 py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase text-[0.6875rem] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
            aria-label="Execute simulation pulse"
          >
            {isPredicting ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
            {isPredicting ? 'Synthesizing Model...' : 'Execute Simulation Pulse'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralModeling;
