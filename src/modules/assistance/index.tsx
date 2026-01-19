import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Zap,
  HelpCircle,
  Phone,
  DollarSign,
  Cpu,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import RecruitmentFooter from '../recruitment/RecruitmentFooter';
import { useSaveEntity } from '../../hooks/useSaveEntity';

interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  priority: 'High' | 'Med' | 'Low';
  status: 'Pending' | 'In Review' | 'Resolved' | 'Escalated';
  date: string;
  description: string;
}

const INITIAL_TICKETS: SupportTicket[] = [];

const AssistanceModule: React.FC = () => {
  const ticketModal = useModal();
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'High' | 'Med' | 'Low'>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const initialTicketState = {
    subject: '',
    description: '',
    priority: 'Med' as 'High' | 'Med' | 'Low',
  };

  const {
    formData: newTicket,
    updateField: updateTicketField,
    isSaving: isSavingTicket,
    handleSave: handleCreateTicket,
    setFormData: setTicketData,
  } = useSaveEntity<SupportTicket, typeof initialTicketState>({
    onSave: async (ticket) => {
      // In a real app, this would be an API call
      setTickets((prev) => [ticket, ...prev]);
    },
    onAfterSave: () => {
      ticketModal.close();
    },
    successMessage: 'Support case initiated successfully.',
    initialState: initialTicketState,
    validate: (data) => !!(data.subject && data.description),
    transform: (data) => ({
      id: `TKT-${Math.floor(Math.random() * 900) + 100}`,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: 'Pending',
      user: 'Sarah Jenkins', // Mock current user
      date: 'Just Now',
    }),
  });

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = activeFilter === 'All' || t.priority === activeFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tickets, searchTerm, activeFilter]);

  const stats = [
    {
      label: 'Active Tickets',
      value: tickets.filter((t) => t.status !== 'Resolved').length,
      icon: LifeBuoy,
      color: 'primary',
    },
    { label: 'Avg Res Time', value: '1.4h', icon: Clock, color: 'success' },
    { label: 'AI Resolutions', value: '84%', icon: Sparkles, color: 'primary' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase">
            Control Desk
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Internal Support, Neural Troubleshooting & Expert Triage
          </p>
        </div>
        <Button
          onClick={() => {
            setTicketData(initialTicketState);
            ticketModal.open();
          }}
          icon={Plus}
        >
          Open Support Node
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all text-center"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color === 'success' ? 'emerald-500' : 'primary'}/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`w-16 h-16 bg-${s.color === 'success' ? 'emerald-500' : 'primary'}/10 text-${s.color === 'success' ? 'emerald-500' : 'primary'} rounded-[1.5rem] flex items-center justify-center mb-8 mx-auto shadow-inner group-hover:rotate-12 transition-transform`}
            >
              <s.icon size={32} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter">{s.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[43.75rem] flex flex-col">
          <div className="p-12 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-secondary/30 backdrop-blur-3xl">
            <div className="flex items-center gap-6">
              <h3 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">
                Case Registry
              </h3>
              <div className="flex p-1 bg-secondary rounded-xl">
                {['All', 'High', 'Med'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={`px-4 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className="bg-card border border-border pl-10 pr-6 py-3 rounded-2xl text-sm font-black outline-none w-64 text-foreground shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Search Case Identifier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search Case Identifier"
                />
              </div>
              <button
                aria-label="Filter cases"
                className="p-4 bg-secondary rounded-2xl text-muted-foreground hover:text-primary transition-colors shadow-sm"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-10 space-y-6 overflow-y-auto no-scrollbar">
            {filteredTickets.map((t, i) => (
              <div
                key={i}
                onClick={() => setSelectedTicket(t)}
                role="button"
                tabIndex={0}
                aria-label={`View ticket: ${t.subject}`}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTicket(t)}
                className={`p-8 bg-secondary/50 rounded-[2.5rem] border transition-all flex items-center justify-between cursor-pointer ${selectedTicket?.id === t.id ? 'border-primary/50 shadow-xl bg-card' : 'border-border hover:border-primary/30'}`}
              >
                <div className="flex items-center gap-8">
                  <div
                    className={`p-5 rounded-2xl shadow-inner ${t.priority === 'High' ? 'bg-destructive/10 text-destructive' : t.priority === 'Med' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}
                  >
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[0.5625rem] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${t.priority === 'High' ? 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20' : t.priority === 'Med' ? 'bg-warning text-warning-foreground' : 'bg-primary text-primary-foreground'}`}
                      >
                        {t.priority} Priority
                      </span>
                      <span className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                        {t.id}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-foreground leading-none">{t.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest">
                      {t.user} • {t.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                      t.status === 'Resolved'
                        ? 'bg-success/10 text-success border-success/20'
                        : t.status === 'In Review'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    {t.status}
                  </span>
                  <button
                    aria-label="View details"
                    className="p-3 bg-card text-muted-foreground hover:text-primary rounded-xl shadow-sm border border-border transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                <ShieldAlert size={64} />
                <p className="text-xs font-black uppercase tracking-widest">
                  No active cases found in this cluster.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          {selectedTicket ? (
            <div className="bg-foreground p-12 rounded-[4rem] text-background shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500 border border-border">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap size={120} />
              </div>
              <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary mb-8">
                Case Investigation
              </h4>
              <div className="space-y-8 relative z-10">
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Subject Matter
                  </p>
                  <h5 className="text-2xl font-black leading-tight">{selectedTicket.subject}</h5>
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Detailed Narrative
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed font-bold italic">
                    "{selectedTicket.description}"
                  </p>
                </div>
                <div className="pt-8 border-t border-background/10 grid grid-cols-2 gap-6">
                  <button className="py-4 bg-background text-foreground rounded-2xl font-black uppercase text-[0.625rem] tracking-widest hover:scale-105 transition-all">
                    Update Status
                  </button>
                  <button className="py-4 bg-background/10 text-background rounded-2xl font-black uppercase text-[0.625rem] tracking-widest hover:bg-background/20 transition-all">
                    Escalate Node
                  </button>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-full text-center text-[0.625rem] font-black uppercase text-muted-foreground hover:text-background transition-colors"
                >
                  Close Viewport
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-foreground p-12 rounded-[3.5rem] text-background shadow-2xl relative overflow-hidden group border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent pointer-events-none"></div>
              <Sparkles className="absolute -right-8 -top-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary mb-8">
                  Neural Assistant Node
                </h4>
                <h3 className="text-3xl font-black tracking-tight leading-none mb-6 uppercase">
                  Policy Autopilot
                </h3>
                <p className="text-primary-foreground/80 text-lg leading-relaxed mb-10 antialiased opacity-80">
                  Query the PeopleOS intelligence kernel for immediate guidance on enterprise
                  protocols and organizational logistics.
                </p>
                <div className="flex gap-4">
                  <input
                    className="flex-1 bg-background/10 border border-background/20 rounded-2xl px-6 py-4 font-black placeholder:text-background/30 outline-none focus:bg-background/20 transition-all"
                    placeholder="Ask PeopleOS Intelligence..."
                    aria-label="Ask AI assistant"
                  />
                  <button
                    aria-label="Send query"
                    className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <HelpCircle size={160} />
            </div>
            <h4 className="text-xl font-black text-foreground mb-8 tracking-tight flex items-center gap-3">
              <HelpCircle className="text-primary" /> Expert Directory
            </h4>
            <div className="space-y-6 relative z-10">
              {[
                { name: 'Admin Hub', icon: Phone, color: 'primary', desc: 'Hardware & Access' },
                {
                  name: 'Fiscal Support',
                  icon: DollarSign,
                  color: 'success',
                  desc: 'Payroll & Expenses',
                },
                { name: 'Infrastructure', icon: Cpu, color: 'primary', desc: 'Global Tech Pulse' },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 bg-secondary/50 rounded-[2rem] hover:scale-105 transition-all group cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 bg-${d.color === 'success' ? 'emerald-500' : 'primary'}/10 text-${d.color === 'success' ? 'emerald-500' : 'primary'} rounded-2xl flex items-center justify-center shadow-inner`}
                    >
                      <d.icon size={20} />
                    </div>
                    <div>
                      <span className="text-[0.6875rem] font-black uppercase tracking-widest text-foreground block">
                        {d.name}
                      </span>
                      <span className="text-[0.5625rem] font-bold text-muted-foreground uppercase tracking-widest">
                        {d.desc}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/40 p-10 rounded-[3rem] border border-border flex items-center gap-8 group cursor-pointer hover:bg-card transition-all">
            <div className="w-16 h-16 bg-card rounded-3xl flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
              <BookOpen size={28} />
            </div>
            <div>
              <h5 className="text-lg font-black text-foreground leading-none">Internal Wiki</h5>
              <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
                Hashed Documentation Logs
              </p>
            </div>
          </div>
        </div>
      </div>

      <RecruitmentFooter />

      <FormModal
        title="Open Support Node"
        isOpen={ticketModal.isOpen}
        onClose={ticketModal.close}
        onSave={handleCreateTicket}
        isLoading={isSavingTicket}
        size="md"
      >
        <div className="space-y-8">
          <Input
            label="Subject Flux *"
            required
            placeholder="Briefly describe the issue..."
            value={newTicket.subject}
            onChange={(e) => updateTicketField('subject', e.target.value)}
          />
          <div className="space-y-3">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Low', 'Med', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateTicketField('priority', p as any)}
                  className={`py-4 rounded-2xl font-black uppercase text-[0.625rem] tracking-widest transition-all border-2 ${newTicket.priority === p ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary text-muted-foreground border-transparent hover:border-primary/20'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Contextual Matrix
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-bold text-foreground outline-none resize-none shadow-inner"
              placeholder="Provide full technical context..."
              value={newTicket.description}
              onChange={(e) => updateTicketField('description', e.target.value)}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default AssistanceModule;
