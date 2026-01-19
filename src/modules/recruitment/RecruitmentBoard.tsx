import React from 'react';
import { Plus, MoreVertical, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { Candidate } from '../../types';

interface RecruitmentBoardProps {
  stages: readonly string[];
  candidates: Candidate[];
  onAuditCandidate: (candidate: Candidate) => void;
}

const RecruitmentBoard: React.FC<RecruitmentBoardProps> = ({
  stages,
  candidates,
  onAuditCandidate,
}) => {
  return (
    <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar">
      {stages.map((stage) => (
        <div
          key={stage}
          className="min-w-[21.25rem] flex-1 flex flex-col gap-8 bg-muted/50 dark:bg-card/30 p-8 rounded-[2rem] border border-border"
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                {stage}
              </h4>
              <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[0.625rem] font-black text-info shadow-sm">
                {candidates.filter((c) => c.currentStage === stage).length}
              </span>
            </div>
            <button
              aria-label={`Add candidate to ${stage}`}
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar min-h-[25rem]">
            {candidates
              .filter((c) => c.currentStage === stage)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group cursor-grab active:cursor-grabbing border-b-4 border-b-transparent hover:border-b-blue-600"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <img
                        src={candidate.avatar}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 dark:border-slate-700 shadow-lg group-hover:rotate-3 transition-transform"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white dark:border-card flex items-center justify-center text-white text-[0.5rem] font-black shadow-lg ${candidate.score > 90 ? 'bg-success' : candidate.score > 80 ? 'bg-primary' : 'bg-warning'}`}
                      >
                        {candidate.score}
                      </div>
                    </div>
                    <button
                      onClick={() => onAuditCandidate(candidate)}
                      className="p-2 text-slate-200 group-hover:text-info transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
                    {candidate.firstName} {candidate.lastName}
                  </h5>
                  <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                    <Briefcase size={12} className="text-info" /> {candidate.positionApplied}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {candidate.skills.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-muted dark:bg-card rounded-lg text-[0.5rem] font-black text-muted-foreground uppercase border border-border"
                      >
                        {s}
                      </span>
                    ))}
                    {candidate.skills.length > 2 && (
                      <span className="px-2.5 py-1 text-[0.5rem] font-black text-info uppercase">
                        +{candidate.skills.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={10} /> Applied {candidate.appliedDate}
                    </p>
                    <button
                      onClick={() => onAuditCandidate(candidate)}
                      className="text-primary font-black text-[0.625rem] uppercase tracking-widest flex items-center gap-1 group-hover:gap-3 transition-all"
                    >
                      Audit <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecruitmentBoard;
