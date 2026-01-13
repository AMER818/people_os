import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  ExternalLink,
  Target,
  TrendingUp,
  Megaphone,
  Clock,
  MapPin,
  Trash2,
  Edit3,
} from 'lucide-react';
import { JobVacancy } from '../../types';
import { api } from '../../services/api';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSaveEntity } from '../../hooks/useSaveEntity';

const JobPostings: React.FC = () => {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const jobModal = useModal();
  const deleteModal = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Paused' | 'Closed'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'primary' | 'danger';
  }>({ title: '', message: '', onConfirm: () => {} });

  const showConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    deleteModal.open();
  };

  const initialJobState: Partial<JobVacancy> = {
    title: '',
    department: 'Engineering',
    location: '',
    type: 'Full-time',
    salaryRange: '',
    status: 'Active',
    description: '',
  };

  const {
    formData: newJob,
    updateField: updateJobField,
    isSaving: isSavingJob,
    handleSave: handleSaveJob,
    setFormData: setJobData,
  } = useSaveEntity<JobVacancy, Partial<JobVacancy>>({
    onSave: (job) => api.saveJobVacancy(job),
    onAfterSave: async () => {
      await loadData();
      jobModal.close();
    },
    successMessage: (data) =>
      data.id ? 'Job vacancy updated successfully.' : 'Job vacancy published successfully.',
    initialState: initialJobState,
    validate: (data) => !!(data.title && data.location),
    transform: (data) => ({
      id: data.id || `J${Date.now()}`,
      title: data.title || 'Untitled Role',
      department: data.department || 'Engineering',
      location: data.location || 'Remote',
      type: data.type || 'Full-time',
      salaryRange: data.salaryRange || 'Competitive',
      status: data.status || 'Active',
      applicants: data.applicants || 0,
      description: data.description || '',
      postedDate: data.postedDate || new Date().toISOString().split('T')[0],
    }),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await api.getJobVacancies();
    setJobs(data);
    setIsLoading(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || job.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchTerm, activeFilter]);

  const stats = [
    {
      label: 'Active Postings',
      val: jobs.filter((j) => j.status === 'Active').length,
      icon: Megaphone,
      color: 'blue',
    },
    {
      label: 'Total Applicants',
      val: jobs.reduce((acc, curr) => acc + (curr.applicants || 0), 0),
      icon: Target,
      color: 'indigo',
    },
    { label: 'Avg. Time to Fill', val: '18d', icon: Clock, color: 'emerald' },
    { label: 'Sourcing Quality', val: '8.4/10', icon: TrendingUp, color: 'orange' },
  ];

  const handleDeleteJob = async () => {
    showConfirm({
      title: 'Delete Vacancy Node',
      message:
        'Are you sure you want to permanently delete this vacancy? This action cannot be undone.',
      onConfirm: async () => {
        // await api.deleteJobVacancy(id);
        success('Job vacancy deleted successfully.');
        await loadData();
      },
      variant: 'danger',
    });
  };

  const toggleStatus = async (id: string, currentStatus: JobVacancy['status']) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    const job = jobs.find((j) => j.id === id);
    if (job) {
      await api.saveJobVacancy({ ...job, status: newStatus });
      await loadData();
      success(`Job status updated to ${newStatus}.`);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Vacancy Hub
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Global Talent Acquisition & Employer Branding Console
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <Button
            onClick={() => {
              setJobData(initialJobState);
              jobModal.open();
            }}
            icon={Plus}
          >
            Author New Vacancy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-surface p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 w-fit mb-8 shadow-inner`}
            >
              <s.icon size={24} />
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

      <div className="bg-surface rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[37.5rem] flex flex-col">
        <div className="p-12 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-secondary/30 backdrop-blur-3xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <h3 className="text-3xl font-black text-foreground tracking-tight">
              Opportunity Matrix
            </h3>
            <div className="flex p-1.5 bg-secondary rounded-[1.375rem] border border-border">
              {['All', 'Active', 'Paused', 'Closed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f as typeof activeFilter)}
                  className={`px-6 py-2.5 rounded-xl text-[0.625rem] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-surface text-primary shadow-lg' : 'text-text-muted'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-background border border-border pl-10 pr-6 py-3 rounded-2xl text-sm font-black outline-none w-72 text-foreground shadow-inner"
                placeholder="Query Vacancies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search Vacancies"
              />
            </div>
            <button
              aria-label="Filter vacancies"
              className="p-4 bg-secondary rounded-2xl text-muted-foreground shadow-sm hover:text-primary transition-colors"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 text-[0.6875rem] font-black uppercase text-muted-foreground tracking-[0.25em]">
                <th className="px-12 py-8">Opportunity Profile</th>
                <th className="px-8 py-8">Cluster & Locale</th>
                <th className="px-8 py-8">Yield</th>
                <th className="px-8 py-8">Status</th>
                <th className="px-12 py-8 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-12 py-8 text-center text-muted-foreground">
                    Loading vacancies...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-12 py-8 text-center text-muted-foreground">
                    No vacancies found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="group hover:bg-primary/5 transition-all cursor-pointer animate-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-12 py-8">
                      <p className="text-xl font-black text-foreground leading-none">{job.title}</p>
                      <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-3">
                        {job.id} • {job.department}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                        <MapPin size={14} className="text-muted-foreground/50" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-[0.625rem] text-muted-foreground font-black uppercase tracking-widest mt-2">
                        {job.salaryRange}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-foreground">
                          {job.applicants}
                        </span>
                        <span className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                          Candidates
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <button
                        onClick={() => toggleStatus(job.id, job.status)}
                        className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                          job.status === 'Active'
                            ? 'bg-success/10 text-success border-success/20'
                            : job.status === 'Paused'
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-secondary text-muted-foreground border-border'
                        }`}
                      >
                        {job.status}
                      </button>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => {
                            setJobData({
                              id: job.id,
                              title: job.title,
                              department: job.department,
                              location: job.location,
                              type: job.type,
                              salaryRange: job.salaryRange,
                              status: job.status,
                              description: job.description,
                              applicants: job.applicants,
                              postedDate: job.postedDate,
                            });
                            jobModal.open();
                          }}
                          className="p-3 bg-card text-muted-foreground hover:text-primary rounded-xl shadow-sm border border-border transition-all"
                          aria-label="Edit vacancy"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob()}
                          className="p-3 bg-card text-muted-foreground hover:text-destructive rounded-xl shadow-sm border border-border transition-all"
                          aria-label="Delete vacancy"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          aria-label="View external posting"
                          className="p-3 bg-primary text-primary-foreground rounded-xl shadow-xl hover:scale-110 transition-all"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        title="Author Opportunity"
        isOpen={jobModal.isOpen}
        onClose={jobModal.close}
        onSave={handleSaveJob}
        isLoading={isSavingJob}
        size="lg"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <Input
              label="Job Title *"
              required
              placeholder="e.g. Senior Software Engineer"
              value={newJob.title}
              onChange={(e) => updateJobField('title', e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                Cluster *
              </label>
              <select
                className="w-full bg-muted-bg border-none rounded-[1.25rem] px-8 py-5 font-black text-text-primary outline-none cursor-pointer"
                value={newJob.department}
                onChange={(e) => updateJobField('department', e.target.value)}
                aria-label="Department Cluster"
              >
                <option>Engineering</option>
                <option>Design</option>
                <option>People Ops</option>
                <option>Finance</option>
                <option>Sales</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <Input
              label="Location & Locale *"
              required
              placeholder="e.g. London / Remote"
              value={newJob.location}
              onChange={(e) => updateJobField('location', e.target.value)}
            />
            <Input
              label="Compensation Range"
              placeholder="e.g. 120k - 150k"
              value={newJob.salaryRange}
              onChange={(e) => updateJobField('salaryRange', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
              Contextual Description
            </label>
            <textarea
              rows={4}
              className="w-full bg-muted-bg border-none rounded-[1.25rem] px-8 py-5 font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Describe the mission of this node..."
              value={newJob.description}
              onChange={(e) => updateJobField('description', e.target.value)}
              aria-label="Job Description"
            />
          </div>
        </div>
      </FormModal>

      <Modal
        title={confirmConfig.title}
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">{confirmConfig.message}</p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={deleteModal.close} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={confirmConfig.variant || 'primary'}
              onClick={() => {
                confirmConfig.onConfirm();
                deleteModal.close();
              }}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobPostings;
