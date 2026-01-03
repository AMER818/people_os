import React from 'react';
import { ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { Candidate } from '../../types';

interface RecruitmentLedgerProps {
  candidates: Candidate[];
  stages: readonly string[];
  onUpdateStage: (id: string, stage: Candidate['currentStage']) => void;
  onAuditCandidate: (candidate: Candidate) => void;
}

const RecruitmentLedger: React.FC<RecruitmentLedgerProps> = ({
  candidates,
  stages,
  onUpdateStage,
  onAuditCandidate,
}) => {
  return (
    <div className="overflow-x-auto bg-surface rounded-[3rem] border border-border shadow-2xl">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-muted-bg text-[0.6875rem] font-black uppercase text-text-muted tracking-[0.25em]">
            <th className="px-14 py-8">Candidate Profile</th>
            <th className="px-8 py-8 text-center">Match Score</th>
            <th className="px-8 py-8">Current Phase</th>
            <th className="px-8 py-8">Timeline</th>
            <th className="px-14 py-8 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className="group hover:bg-primary/5 transition-all cursor-pointer"
              onClick={() => onAuditCandidate(candidate)}
            >
              <td className="px-14 py-8">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <img
                      src={candidate.avatar}
                      className="w-16 h-16 rounded-[1.5rem] border-2 border-surface shadow-2xl object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-lg border-2 border-surface shadow-xl flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-black text-text-primary tracking-tighter leading-none">
                      {candidate.firstName} {candidate.lastName}
                    </p>
                    <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-2">
                      {candidate.positionApplied}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-8 text-center">
                <div className="inline-flex items-center gap-3 bg-muted-bg px-6 py-3 rounded-2xl shadow-inner">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-xl font-black text-text-primary">
                    {candidate.score}%
                  </span>
                </div>
              </td>
              <td className="px-8 py-8">
                <select
                  value={candidate.currentStage}
                  onChange={(e) => onUpdateStage(candidate.id, e.target.value as any)}
                  onClick={(e) => e.stopPropagation()}
                  className={`px-6 py-2.5 rounded-[1.125rem] text-[0.625rem] font-black uppercase tracking-widest border transition-all outline-none appearance-none cursor-pointer ${candidate.currentStage === 'Offer'
                    ? 'bg-success text-white border-success shadow-lg'
                    : candidate.currentStage === 'Interview'
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-muted-bg text-text-muted border-border'
                    }`}
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
              <td className="px-8 py-8">
                <p className="text-sm font-black text-text-secondary uppercase">
                  {candidate.appliedDate}
                </p>
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest mt-1">
                  Logged Entry
                </p>
              </td>
              <td className="px-14 py-8 text-right">
                <button aria-label="View candidate details" className="p-4 bg-muted-bg text-text-muted group-hover:bg-primary group-hover:text-white rounded-2xl shadow-sm border border-border transition-all">
                  <ArrowUpRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecruitmentLedger;
