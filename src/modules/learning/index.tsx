import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Trophy,
  Filter,
  Award,
  Target,
  Zap,
  BrainCircuit,
  HeartHandshake,
  Sparkles,
  ArrowUpRight,
  Globe,
  Layers,
  CheckCircle2,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Course } from '../../types';
import { api } from '../../services/api';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from '../../components/ui/SearchInput';

type LearningTab = 'ecosystem' | 'discover' | 'matrix' | 'vault';

import type { LucideIcon } from 'lucide-react';

type IconMapType = Record<string, LucideIcon>;

const iconMap: IconMapType = {
  Award: Award,
  Zap: Zap,
  HeartHandshake: HeartHandshake,
  BrainCircuit: BrainCircuit,
  ShieldCheck: ShieldCheck,
  FileText: FileText,
  Layers: Layers,
};

const LearningModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LearningTab>('ecosystem');
  const [courses, setCourses] = useState<Course[]>([]);
  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredCourses,
  } = useSearch(courses, ['title']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await api.getCourses();
    setCourses(data);
    setIsLoading(false);
  };

  const stats = [
    {
      label: 'Completed',
      val: courses.filter((c) => c.status === 'Completed').length,
      icon: Trophy,
      color: 'emerald',
    },
    {
      label: 'In Progress',
      val: courses.filter((c) => c.status === 'In Progress').length,
      icon: Clock,
      color: 'blue',
    },
    { label: 'Skill Points', val: '1,450', icon: Target, color: 'indigo' },
    { label: 'Certificates', val: '8', icon: GraduationCap, color: 'purple' },
  ];

  const handleResume = async (id: number) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      const nextProgress = Math.min((course.progress || 0) + 10, 100);
      const nextStatus = nextProgress === 100 ? 'Completed' : 'In Progress';
      const nextScore = nextProgress === 100 ? 95 : course.score || 0;

      // Optimistic update
      setCourses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, progress: nextProgress, status: nextStatus, score: nextScore } : c
        )
      );

      await api.updateCourseProgress(id, nextProgress, nextStatus, nextScore);
    }
  };

  const getIcon = (iconName: string | LucideIcon | undefined | null): LucideIcon => {
    if (!iconName) return BookOpen;

    if (typeof iconName === 'string' && iconMap[iconName]) {
      return iconMap[iconName];
    }
    if (typeof iconName !== 'string') {
      return iconName;
    }
    return BookOpen; // Default icon
  };

  const renderEcosystem = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
      <div className="lg:col-span-8 space-y-10">
        <div className="bg-card rounded-[4rem] border border-border shadow-2xl p-12">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-foreground tracking-tight uppercase leading-none">
              Curated Flux
            </h3>
            <div className="flex gap-4">
              <div className="relative group">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query Skill Nodes..."
                  className="w-64 rounded-2xl"
                />
              </div>
              <button
                aria-label="Filter courses"
                className="p-4 bg-secondary rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-10">Loading courses...</div>
            ) : (
              filteredCourses.map((course) => {
                const IconComponent = getIcon(course.icon);
                return (
                  <div
                    key={course.id}
                    className="p-8 bg-secondary/50 rounded-[3rem] border border-border group hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div
                        className={`w-24 h-24 bg-card rounded-[2rem] flex items-center justify-center shadow-inner text-${course.color}-600 dark:text-${course.color}-400 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent size={42} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-[0.5625rem] font-black uppercase tracking-widest bg-${course.color}-50 dark:bg-${course.color}-900/20 text-${course.color}-600 dark:text-${course.color}-400 border border-${course.color}-100 dark:border-${course.color}-900/30`}
                          >
                            {course.level}
                          </span>
                          <span className="text-[0.625rem] font-bold text-muted-foreground uppercase tracking-widest">
                            {course.provider}
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-foreground tracking-tight antialiased leading-none mb-3">
                          {course.title}
                        </h4>
                        <p className="text-[0.6875rem] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                          <Clock size={12} /> {course.duration} Allocation Required
                        </p>
                      </div>
                      <div className="w-full md:w-56 space-y-6">
                        {course.status === 'Completed' ? (
                          <div className="flex flex-col items-center bg-success/5 p-4 rounded-[1.5rem] border border-success/10">
                            <CheckCircle2 className="w-10 h-10 text-success mb-2" />
                            <span className="text-[0.6875rem] font-black text-emerald-600 uppercase tracking-widest">
                              Score: {course.score}%
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground">
                              <span>Immersion</span>
                              <span className="text-foreground">{course.progress || 0}%</span>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full bg-${course.color}-500 rounded-full transition-all duration-1000 shadow-[0_0_0.625rem_rgba(37,99,235,0.3)]`}
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                            <button
                              onClick={() => handleResume(course.id)}
                              aria-label={`Resume ${course.title}`}
                              className="w-full py-4 bg-card rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border border-border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all active:scale-95"
                            >
                              Resume Session
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-10">
        <div className="bg-slate-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>
          <Sparkles className="absolute -right-8 -top-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10">
            <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-info mb-10 flex items-center gap-3">
              <BrainCircuit size={14} /> AI Recommendation
            </h4>
            <h3 className="text-3xl font-black tracking-tighter leading-tight mb-6 uppercase antialiased">
              Neural Architecture for SaaS Scales
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 antialiased opacity-80">
              Synthesizing your recent{' '}
              <span className="text-white underline decoration-blue-500/40 underline-offset-8">
                Cloud Lead
              </span>{' '}
              promotion, our core suggests this deep-dive module.
            </p>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-10">
              <div className="flex justify-between items-center text-[0.625rem] font-black uppercase tracking-widest text-slate-500">
                <span>Strategic Fit</span>
                <span className="text-success">98% Match</span>
              </div>
            </div>
            <button
              aria-label="Enroll in strategic node"
              className="w-full py-5 bg-primary rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              Enroll Strategic Node
            </button>
          </div>
        </div>

        <div className="bg-card p-12 rounded-[4rem] border border-border shadow-sm">
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-10">
            Skill Matrix
          </h3>
          <div className="space-y-8">
            {[
              { skill: 'Enterprise Architecture', val: 92, color: 'blue' },
              { skill: 'Neural Engineering', val: 78, color: 'indigo' },
              { skill: 'Resource Management', val: 85, color: 'emerald' },
              { skill: 'Policy Governance', val: 64, color: 'orange' },
            ].map((s, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end text-[0.625rem] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">{s.skill}</span>
                  <span className={`text-${s.color}-500 text-lg`}>{s.val}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${s.color}-500 transition-all duration-1000`}
                    style={{ width: `${s.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase antialiased">
            Skill Forge
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary"></span>
            Professional Development & Cognitive Lifecycle Console
          </p>
        </div>
        <HorizontalTabs
          tabs={[
            { id: 'ecosystem', label: 'Ecosystem', icon: Layers },
            { id: 'discover', label: 'Discover', icon: Globe },
            { id: 'vault', label: 'Vault', icon: GraduationCap },
          ]}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
          disabled={isLoading}
          wrap={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 w-fit mb-8 shadow-inner group-hover:rotate-12 transition-transform`}
            >
              <s.icon size={28} />
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

      <main>
        {activeTab === 'ecosystem' && renderEcosystem()}
        {activeTab === 'discover' && (
          <div className="py-40 text-center space-y-12 bg-card rounded-[5rem] border border-border shadow-2xl">
            <div className="w-24 h-24 bg-info/10 text-info rounded-[2rem] flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Globe size={40} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
                Global Discovery Hub
              </h3>
              <p className="text-muted-foreground font-black uppercase text-[0.6875rem] tracking-[0.4em] max-w-md mx-auto leading-relaxed mt-6 antialiased">
                Connecting to internal L&D nodes and global MOOC clusters to synchronize tailored
                knowledge streams for your profile signature.
              </p>
            </div>
            <button
              aria-label="Launch Discovery Matrix"
              className="px-12 py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4 mx-auto"
            >
              <Sparkles size={18} /> Launch Discovery Matrix
            </button>
          </div>
        )}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-8 duration-700">
            {[
              {
                title: 'Cloud Infrastructure Master',
                date: 'Jul 2024',
                provider: 'AWS Certified',
                icon: ShieldCheck,
                color: 'blue',
              },
              {
                title: 'Project Management Core',
                date: 'May 2024',
                provider: 'PMI Integrated',
                icon: FileText,
                color: 'emerald',
              },
              {
                title: 'Design Ops & Systems',
                date: 'Jan 2024',
                provider: 'Design HQ',
                icon: Layers,
                color: 'indigo',
              },
            ].map((cert, i) => (
              <div
                key={i}
                className="bg-card p-10 rounded-[3rem] border border-border shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div
                  className={`p-6 rounded-[1.75rem] bg-${cert.color}-50 dark:bg-${cert.color}-900/20 text-${cert.color}-600 dark:text-${cert.color}-400 w-fit mb-10 shadow-inner group-hover:scale-110 transition-transform`}
                >
                  <cert.icon size={32} />
                </div>
                <h4 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2 antialiased">
                  {cert.title}
                </h4>
                <p className="text-muted-foreground text-[0.625rem] font-black uppercase tracking-widest mb-10">
                  {cert.provider} • Verified Hash: SHA256-X99
                </p>
                <div className="pt-8 border-t border-border flex items-center justify-between">
                  <span className="text-[0.6875rem] font-black uppercase text-muted-foreground tracking-widest">
                    Marked: {cert.date}
                  </span>
                  <button
                    aria-label={`View certificate for ${cert.title}`}
                    className="p-3 bg-secondary rounded-xl text-muted-foreground hover:text-primary transition-all"
                  >
                    <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="bg-card dark:bg-gradient-to-br dark:from-primary/10 dark:via-card dark:to-card p-20 rounded-[5rem] text-foreground shadow-2xl relative overflow-hidden group border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
          <div className="w-32 h-32 bg-primary text-primary-foreground rounded-[2.5rem] flex items-center justify-center shadow-[0_2.1875rem_5rem_-0.9375rem] shadow-primary/30 animate-pulse shrink-0">
            <GraduationCap className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black tracking-tighter leading-none antialiased uppercase">
              Immutable Skill Ledger
            </h3>
            <p className="text-muted-foreground mt-8 text-xl max-w-4xl leading-relaxed antialiased">
              The{' '}
              <span className="text-primary underline underline-offset-8 decoration-4 decoration-primary/30">
                PeopleOS Learning Kernel
              </span>{' '}
              ensures that every developmental milestone is hashed to your personnel registry.
              Verified credentials directly influence promotion eligibility and project allocation
              flux.
            </p>
          </div>
          <button
            aria-label="Audit learning logic"
            className="px-16 py-6 bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground rounded-[2rem] font-black uppercase text-[0.75rem] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shrink-0"
          >
            Audit Learning Logic
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningModule;
