import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Candidate } from '../../types';
import { STAGES } from './constants';
import { api } from '../../services/api';

// Sub-components
import RecruitmentStats from './RecruitmentStats';
import RecruitmentBoard from './RecruitmentBoard';
import RecruitmentLedger from './RecruitmentLedger';
import CandidateAuditModal from './CandidateAuditModal';
import RecruitmentFooter from './RecruitmentFooter';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSaveEntity } from '../../hooks/useSaveEntity';

const RecruitmentATS: React.FC = () => {
  const [view, setView] = useState<'board' | 'ledger'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const candidateModal = useModal();
  const { success } = useToast();

  const {
    formData: newCandidate,
    updateField: updateCandidateField,
    isSaving,
    handleSave: handleSaveCandidate,
  } = useSaveEntity<Candidate, Partial<Candidate>>({
    onSave: (candidate) => api.saveCandidate(candidate),
    onAfterSave: async () => {
      await loadCandidates();
      candidateModal.close();
    },
    successMessage: 'Candidate profile created successfully.',
    initialState: {
      firstName: '',
      lastName: '',
      positionApplied: '',
      email: '',
      phone: '',
    },
    validate: (data) => !!(data.firstName && data.lastName && data.positionApplied),
    transform: (data) => ({
      id: `C-${Date.now()}`,
      firstName: data.firstName || 'Unknown',
      lastName: data.lastName || '',
      email: data.email || 'unknown@example.com',
      phone: data.phone || 'N/A',
      positionApplied: data.positionApplied || 'General',
      currentStage: 'Applied',
      score: Math.floor(Math.random() * 40) + 60,
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: `https://picsum.photos/seed/${Date.now()}/200`,
      skills: ['Pending Evaluation'],
      resumeUrl: '#',
    }),
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    const data = await api.getCandidates();
    setCandidates(data);
  };

  const stats = [
    {
      label: 'Total Candidates',
      value: candidates.length.toLocaleString(),
      change: '+12%',
      color: 'primary',
      icon: TrendingUp,
    },
    {
      label: 'Active Candidates',
      value: candidates.filter((c) => c.currentStage !== 'Hired' && c.currentStage !== 'Rejected')
        .length,
      change: '+5',
      color: 'primary',
      icon: Sparkles,
    },
    { label: 'Time to Hire', value: '18d', change: '-2d', color: 'success', icon: Clock },
    { label: 'Acceptance Rate', value: '92%', change: '+3%', color: 'warning', icon: UserCheck },
  ];

  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.positionApplied.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const updateStage = async (id: string, stage: Candidate['currentStage']) => {
    await api.updateCandidateStage(id, stage);
    await loadCandidates();
    success(`Candidate stage updated to ${stage}.`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
            Recruitment
          </h1>
          <p className="text-text-muted mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Candidate Pipeline & Acquisition
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-surface rounded-[2rem] shadow-2xl border border-border">
          <div className="flex p-1.5 bg-muted-bg rounded-[1.375rem] border border-border">
            <button
              onClick={() => setView('board')}
              aria-label="Switch to board view"
              className={`px-8 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'board' ? 'bg-surface text-primary shadow-xl' : 'text-text-muted'}`}
            >
              <LayoutGrid size={16} /> Board
            </button>
            <button
              onClick={() => setView('ledger')}
              aria-label="Switch to ledger view"
              className={`px-8 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'ledger' ? 'bg-surface text-primary shadow-xl' : 'text-text-muted'}`}
            >
              <List size={16} /> Ledger
            </button>
          </div>
          <Button
            onClick={() => {
              candidateModal.open();
            }}
            icon={UserPlus}
          >
            Add Candidate
          </Button>
        </div>
      </div>

      <RecruitmentStats stats={stats} />

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search candidates by name, position, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border-2 border-transparent focus:border-primary/20 rounded-[2rem] pl-16 pr-8 py-6 font-black text-xl text-text-primary outline-none placeholder:text-text-muted shadow-inner transition-all"
          />
        </div>
        <button className="px-12 py-6 bg-muted-bg rounded-[2rem] font-black uppercase text-[0.6875rem] tracking-[0.3em] text-text-muted hover:bg-surface hover:text-text-primary transition-all flex items-center gap-4 border border-transparent hover:border-border shadow-sm">
          <Filter size={20} /> Filter
        </button>
      </div>

      <main>
        {view === 'board' ? (
          <RecruitmentBoard
            stages={STAGES}
            candidates={filteredCandidates}
            onAuditCandidate={setSelectedCandidate}
          />
        ) : (
          <RecruitmentLedger
            candidates={filteredCandidates}
            stages={STAGES}
            onUpdateStage={updateStage}
            onAuditCandidate={setSelectedCandidate}
          />
        )}
      </main>

      <RecruitmentFooter />

      {/* Add Candidate Modal */}
      <FormModal
        title="New Candidate"
        isOpen={candidateModal.isOpen}
        onClose={candidateModal.close}
        onSave={handleSaveCandidate}
        isLoading={isSaving}
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              required
              placeholder="Jane"
              value={newCandidate.firstName}
              onChange={(e) => updateCandidateField('firstName', e.target.value)}
            />
            <Input
              label="Last Name *"
              required
              placeholder="Doe"
              value={newCandidate.lastName}
              onChange={(e) => updateCandidateField('lastName', e.target.value)}
            />
          </div>
          <Input
            label="Position Applied *"
            required
            placeholder="e.g. Senior Backend Engineer"
            value={newCandidate.positionApplied}
            onChange={(e) => updateCandidateField('positionApplied', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={newCandidate.email}
              onChange={(e) => updateCandidateField('email', e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+92 300 1234567"
              value={newCandidate.phone}
              onChange={(e) => updateCandidateField('phone', e.target.value)}
            />
          </div>
        </div>
      </FormModal>

      {/* Candidate Audit Modal */}
      {selectedCandidate && (
        <CandidateAuditModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default RecruitmentATS;
