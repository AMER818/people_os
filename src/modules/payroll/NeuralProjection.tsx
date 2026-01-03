import React from 'react';
import { BrainCircuit } from 'lucide-react';

const NeuralProjection: React.FC = () => {
  return (
    <div className="bg-primary p-8 rounded-md text-surface shadow-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-start gap-12">
        <div className="w-24 h-24 bg-primary text-white rounded-md flex items-center justify-center shadow-md animate-pulse">
          <BrainCircuit className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-4xl font-black tracking-tighter leading-none antialiased uppercase">
            AI Projection
          </h3>
          <p className="text-surface/70 mt-6 text-lg leading-relaxed antialiased">
            The{' '}
            <span className="text-primary underline underline-offset-8 decoration-4">System</span>{' '}
            predicts a 14% increase in operational liability for Q4 due to scheduled increment
            cycles.
          </p>
        </div>
        <button aria-label="Audit Forecast Data" className="px-12 py-5 bg-surface text-text-primary rounded-md font-black uppercase text-[0.625rem] tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all">
          Audit Forecast Data
        </button>
      </div>
    </div>
  );
};

export default NeuralProjection;
