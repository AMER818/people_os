import React from 'react';
import { Network } from 'lucide-react';

const RecruitmentFooter: React.FC = () => {
  return (
    <div className="bg-slate-950 p-20 rounded-[5rem] text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-[0_1.5625rem_3.75rem_-0.625rem_rgba(37,99,235,0.6)]">
              <Network size={40} />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter leading-none uppercase">
                Unified Acquisition Flux
              </h3>
              <p className="text-info font-black text-[0.625rem] uppercase tracking-[0.5em] mt-3">
                Strategic Talent Kernel
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-xl leading-relaxed mb-12 antialiased">
            The PeopleOS ATS integrates with global job clusters and internal referral nodes.
            AI-driven{' '}
            <span className="text-info underline decoration-blue-500/30 underline-offset-8">
              semantic matching
            </span>{' '}
            ensures every candidate profile is indexed based on its unique merit-signature.
          </p>
          <div className="flex gap-6">
            <button
              aria-label="Author Pipeline Logic"
              className="bg-primary text-white px-14 py-5 rounded-[1.5rem] font-black uppercase text-[0.6875rem] tracking-widest shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95"
            >
              Author Pipeline Logic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentFooter;
