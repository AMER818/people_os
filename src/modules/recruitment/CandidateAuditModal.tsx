import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  CheckCircle,
  Sparkles,
  BrainCircuit,
  Network,
  History as HistoryIcon,
  Check,
  MessageSquare,
  Ban,
} from 'lucide-react';
import { VibrantBadge } from '../../components/ui/VibrantBadge';
import { Candidate } from '../../types';
import { formatTime } from '../../utils/formatting';

import { useOrgStore } from '../../store/orgStore';

interface CandidateAuditModalProps {
  candidate: Candidate;
  onClose: () => void;
}

const CandidateAuditModal: React.FC<CandidateAuditModalProps> = ({ candidate, onClose }) => {
  const { aiSettings } = useOrgStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      if (!aiSettings.agents.resume_screener) {
        throw new Error('Resume Screener Agent disabled.');
      }

      let analyzeCandidateProfile;
      if (aiSettings.provider === 'openai') {
        throw new Error('OpenAI provider is disabled.');
      } else {
        const service = await import('../../services/geminiService');
        analyzeCandidateProfile = service.analyzeCandidateProfile;
      }

      const result = await analyzeCandidateProfile(candidate);
      setAiAnalysis(result);
    } catch (error: any) {
      setAiAnalysis(`Analysis Failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 p-10 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
          <div className="flex items-center gap-8 relative z-10">
            <img
              src={candidate.avatar}
              className="w-32 h-32 rounded-[2rem] border-4 border-white/10 shadow-2xl object-cover"
            />
            <div>
              <h3 className="text-4xl font-black text-white tracking-tighter antialiased leading-none">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <VibrantBadge color="blue">{candidate.id}</VibrantBadge>
                <VibrantBadge color="green">
                  <CheckCircle size={14} className="mr-1" /> VETTING COMPLETE
                </VibrantBadge>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close audit"
            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all relative z-10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 custom-scrollbar">
          <div className="lg:col-span-2 space-y-10">
            {/* AI Analysis Section */}
            <div className="bg-muted rounded-[2rem] p-8 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                    <BrainCircuit size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                    AI Resume Audit
                  </h4>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[0.625rem] font-black uppercase tracking-widest hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  {isAnalyzing ? (
                    <Sparkles size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
              {aiAnalysis ? (
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-500 p-6 bg-card rounded-2xl border border-border shadow-sm">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs uppercase tracking-widest font-bold border-2 border-dashed border-border rounded-2xl">
                  No Analysis Generated
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Network className="text-primary-soft" size={24} />
                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Timeline & Activity
                </h4>
              </div>
              <div className="space-y-6 pl-8 border-l-2 border-slate-100 dark:border-slate-800">
                {[
                  { act: 'Application Indexed', time: 'Jul 20, 10:15 AM', status: 'Done' },
                  { act: 'Initial Screening', time: 'Jul 20, 10:16 AM', status: 'Done' },
                  aiAnalysis && {
                    act: 'AI Audit Completed',
                    time: formatTime(new Date()),
                    status: 'Done',
                  },
                  { act: 'Interview Scheduled', time: 'Jul 22, 02:00 PM', status: 'Pending' },
                ]
                  .filter(Boolean)
                  .map((step: any, i) => (
                    <div key={i} className="relative group">
                      <div className="absolute -left-[2.5625rem] top-1 w-4 h-4 rounded-full bg-card border-4 border-indigo-500 shadow-lg group-hover:scale-125 transition-transform"></div>
                      <div className="flex items-center gap-3">
                        <HistoryIcon size={16} className="text-indigo-400" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white">
                          {step.act}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
                        {step.time}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-muted p-8 rounded-[2rem] border border-border">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">
                Contact Info
              </h5>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[0.5625rem] font-black text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {candidate.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[0.5625rem] font-black text-slate-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {candidate.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full py-5 bg-foreground dark:bg-primary text-background dark:text-primary-foreground rounded-[1.5rem] font-black uppercase text-[0.625rem] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all">
                <Check size={16} /> Approve Candidate
              </button>
              <button className="w-full py-5 bg-card text-slate-500 rounded-[1.5rem] font-black uppercase text-[0.625rem] tracking-widest shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-all">
                <MessageSquare size={16} /> Send Message
              </button>
              <button className="w-full py-5 bg-rose-50 dark:bg-rose-900/10 text-danger rounded-[1.5rem] font-black uppercase text-[0.625rem] tracking-widest flex items-center justify-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all">
                <Ban size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAuditModal;
