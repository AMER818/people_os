import React, { useState } from 'react';
import {
  User,
  FileText,
  CreditCard,
  Calendar,
  Clock,
  Wallet,
  Download,
  ExternalLink,
  ShieldCheck,
  Plus,
  MapPin,
  Briefcase,
  Heart,
  ChevronRight,
  Bookmark,
  Camera,
  Fingerprint,
  Search,
  IdCard,
  Globe,
  Sparkles,
  Phone,
  Mail,
  Filter,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { Button } from '../../components/ui/Button';
import { useSaveEntity } from '../../hooks/useSaveEntity';
import { FormModal } from '../../components/ui/FormModal';
import { useModal } from '../../hooks/useModal';

type TabType = 'profile' | 'requests' | 'docs';

const SelfService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const requestModal = useModal();
  const editProfileModal = useModal();

  // Simulated State
  const [requests, setRequests] = useState([
    {
      id: 'LRQ-101',
      type: 'Annual Leave',
      date: '2024-06-01',
      status: 'Pending',
      color: 'warning',
    },
    {
      id: 'EXP-442',
      type: 'Internet Reimbursement',
      date: '2024-05-28',
      status: 'Approved',
      color: 'success',
    },
  ]);

  const initialRequestState = { type: 'Annual Leave', memo: '' };

  const {
    formData: newRequest,
    updateField: updateRequestField,
    isSaving: isSavingRequest,
    handleSave: handleNewRequest,
    setFormData: setRequestData,
  } = useSaveEntity<
    { type: string; id: string; date: string; status: string; color: string },
    typeof initialRequestState
  >({
    onSave: async (request) => {
      setRequests((prev) => [request, ...prev]);
    },
    onAfterSave: () => {
      requestModal.close();
    },
    successMessage: 'Protocol initiated successfully.',
    initialState: initialRequestState,
    validate: (data) => !!data.memo,
    transform: (data) => ({
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      color: 'warning',
    }),
  });

  const initialProfileState = {
    cnic: '35201-9823123-1',
    mobile: '+92 300 1234567',
  };

  const {
    formData: profileData,
    updateField: updateProfileField,
    isSaving: isSavingProfile,
    handleSave: handleSaveProfile,
    setFormData: setProfileData,
  } = useSaveEntity<void, typeof initialProfileState>({
    onSave: async () => {
      // Mock save logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onAfterSave: () => {
      editProfileModal.close();
    },
    successMessage: 'Identity changes synchronized with governance ledger.',
    initialState: initialProfileState,
    validate: (data) => !!data.cnic && !!data.mobile,
  });

  const stats = [
    { label: 'Available Leaves', value: '14 Days', icon: Calendar, color: 'primary' },
    {
      label: 'Pending Cycle',
      value: requests.filter((r) => r.status === 'Pending').length.toString(),
      icon: Clock,
      color: 'warning',
    },
    { label: 'Next Payday', value: '7 Days', icon: CreditCard, color: 'success' },
  ];

  const renderProfile = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-card p-12 rounded-[4rem] border border-border shadow-2xl flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <User className="w-80 h-80 text-foreground" />
        </div>
        <div className="relative group">
          <img
            src="https://picsum.photos/seed/sarah/400"
            className="w-56 h-56 rounded-[4.5rem] border-8 border-secondary shadow-2xl object-cover transition-transform group-hover:rotate-3"
            alt="Profile"
          />
          <button
            onClick={() => editProfileModal.open()}
            className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-5 rounded-3xl shadow-2xl hover:scale-110 transition-all border-4 border-card"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 space-y-8 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-foreground tracking-tighter antialiased leading-none">
              Sarah Jenkins
            </h2>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-primary font-black text-[0.6875rem] uppercase tracking-[0.2em] bg-primary/10 px-6 py-2 rounded-xl border border-primary/20">
                HR Director
              </span>
              <span className="text-muted-foreground font-black text-[0.6875rem] uppercase tracking-[0.2em]">
                NX-1001 • Grade E1
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground shadow-inner">
                <Briefcase size={18} />
              </div>
              <span className="text-sm font-bold antialiased">
                PeopleOS Industries Ltd • Lahore HQ
              </span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground shadow-inner">
                <MapPin size={18} />
              </div>
              <span className="text-sm font-bold antialiased">Gulberg III, Lahore, PK</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground shadow-inner">
                <Heart size={18} />
              </div>
              <span className="text-sm font-bold antialiased">Blood Group: B+</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground shadow-inner">
                <Fingerprint size={18} />
              </div>
              <span className="text-sm font-bold antialiased">Active MFA Terminal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-card p-12 rounded-[3.5rem] border border-border shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight antialiased">
                Personal Identification Registry
              </h3>
              <Button
                size="sm"
                onClick={() => {
                  setProfileData(initialProfileState);
                  editProfileModal.open();
                }}
                className="rounded-xl px-6 bg-secondary text-foreground hover:bg-secondary/80 border-border"
              >
                Edit Profile
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: 'Father Name', value: 'Arthur Jenkins', icon: User },
                { label: 'Identity Vector (CNIC)', value: '35201-1234567-1', icon: IdCard },
                { label: 'Date of Birth', value: 'May 12, 1988', icon: Calendar },
                { label: 'Nationality', value: 'Pakistani', icon: Globe },
                { label: 'Religion', value: 'Islam', icon: Sparkles },
                { label: 'Marital Status', value: 'Married', icon: Heart },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                    {item.icon && <item.icon size={20} />}
                  </div>
                  <div>
                    <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="text-base font-black text-foreground mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-foreground p-14 rounded-[4rem] text-background shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-14 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4 antialiased uppercase">
              Security Protocols
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-md antialiased opacity-80">
              Management of multi-factor authentication, enterprise login credentials and digital
              signature certificates.
            </p>
            <div className="flex gap-6 relative z-10">
              <button className="bg-primary text-primary-foreground px-10 py-4 rounded-[1.375rem] font-black text-[0.6875rem] tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all uppercase">
                Rotate Passkey
              </button>
              <button className="bg-background/10 text-background px-10 py-4 rounded-[1.375rem] font-black text-[0.6875rem] tracking-widest hover:bg-background/20 transition-all border border-background/10 uppercase">
                Identity Logs
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-card p-10 rounded-[3rem] border border-border shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-tight">
              Interaction Coordinates
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Personal Mobile', value: '+92 300 1234567', icon: Phone },
                { label: 'Official Mobile', value: '+92 321 7654321', icon: Phone },
                { label: 'Personal Email', value: 'sarah.j@gmail.com', icon: Mail },
                { label: 'Official Email', value: 's.jenkins@people-os.io', icon: Mail },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 pb-6 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground shadow-inner">
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.5625rem] font-black text-muted-foreground uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="text-sm font-black text-foreground truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary p-10 rounded-[3rem] text-primary-foreground shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
              <Bookmark className="w-32 h-32" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-4 uppercase">Emergency Node</h4>
            <p className="text-primary-foreground/80 text-[0.625rem] mb-8 opacity-80 uppercase font-black tracking-[0.2em]">
              Designated Personnel Contact
            </p>
            <div className="flex items-center gap-6 p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-xl">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                <User className="w-7 h-7" />
              </div>
              <div>
                <p className="text-lg font-black leading-none">David Jenkins</p>
                <p className="text-[0.625rem] font-bold opacity-60 uppercase mt-2 tracking-widest">
                  Husband • +92 300 XXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
            Lifecycle Flux
          </h3>
          <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3">
            Governance Request Ledger
          </p>
        </div>
        <button
          onClick={() => {
            setRequestData(initialRequestState);
            requestModal.open();
          }}
          className="bg-primary text-primary-foreground px-10 py-5 rounded-3xl font-black uppercase text-[0.6875rem] tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all"
        >
          <Plus size={20} /> Initiate Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Leave Protocol', icon: Calendar, color: 'primary' },
          { label: 'Reimbursement', icon: CreditCard, color: 'success' },
          { label: 'Resource Claim', icon: Briefcase, color: 'warning' },
          { label: 'Fiscal Advance', icon: Wallet, color: 'primary' },
        ].map((item, i) => (
          <button
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group text-left relative overflow-hidden"
          >
            <div
              className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'primary'}/5 blur-2xl rounded-full`}
            ></div>
            <div
              className={`w-16 h-16 bg-${item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'primary'}/10 text-${item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'primary'} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner`}
            >
              <item.icon className="w-8 h-8" />
            </div>
            <span className="text-base font-black text-foreground uppercase tracking-widest antialiased">
              {item.label}
            </span>
            <p className="text-[0.5625rem] text-muted-foreground mt-2 font-black uppercase tracking-widest">
              Execute Node
            </p>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[37.5rem]">
        <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30 backdrop-blur-3xl">
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Active Threads
          </h3>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-background border border-border pl-10 pr-6 py-3 rounded-2xl text-sm font-black outline-none w-64 shadow-inner"
                placeholder="Query ID..."
              />
            </div>
            <button className="p-4 bg-secondary rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-secondary/50 text-[0.625rem] font-black uppercase text-muted-foreground tracking-[0.3em] font-sans">
                <th className="px-12 py-8">Protocol Identifier</th>
                <th className="px-8 py-8">Submission Point</th>
                <th className="px-8 py-8">State Phase</th>
                <th className="px-12 py-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {requests.map((row, i) => (
                <tr key={i} className="group hover:bg-primary/5 transition-all cursor-pointer">
                  <td className="px-12 py-8">
                    <p className="text-xl font-black text-foreground leading-none antialiased">
                      {row.type}
                    </p>
                    <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-3">
                      {row.id}
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-sm font-black text-foreground uppercase">{row.date}</p>
                    <p className="text-[0.5625rem] font-black text-muted-foreground uppercase mt-1 tracking-widest">
                      Temporal Mark
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <span
                      className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                        row.status === 'Approved'
                          ? 'bg-success/10 text-success border-success/20 shadow-lg shadow-success/10'
                          : row.status === 'Pending'
                            ? 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <button className="p-4 bg-card text-muted-foreground hover:text-primary rounded-2xl shadow-sm border border-border transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocs = () => (
    <div className="space-y-12 animate-in slide-in-from-left-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { title: 'PeopleOS Payslips', count: 12, icon: FileText, color: 'primary' },
          { title: 'Fiscal Records', count: 3, icon: ShieldCheck, color: 'success' },
          { title: 'Governance Handbook', count: 1, icon: Bookmark, color: 'primary' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div
              className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${item.color === 'success' ? 'success' : 'primary'}/5 blur-2xl rounded-full`}
            ></div>
            <div className="flex items-center gap-8 relative z-10">
              <div
                className={`w-20 h-20 bg-${item.color === 'success' ? 'success' : 'primary'}/10 text-${item.color === 'success' ? 'success' : 'primary'} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}
              >
                <item.icon className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-foreground tracking-tight leading-none mb-3">
                  {item.title}
                </h4>
                <p className="text-[0.6875rem] font-black text-muted-foreground uppercase tracking-widest">
                  {item.count} Artifacts Indexed
                </p>
              </div>
            </div>
            <button className="p-4 bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-card rounded-2xl transition-all shadow-sm">
              <ChevronRight size={24} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden">
        <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Recent Artifacts
            </h3>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
              Hashed Documentation Logs
            </p>
          </div>
          <button className="px-8 py-3 bg-foreground text-background rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center gap-3">
            <Download size={16} /> Archive All
          </button>
        </div>
        <div className="p-10 space-y-6">
          {[
            {
              name: 'Payslip_2024_05.pdf',
              size: '1.2 MB',
              date: 'June 01, 2024',
              hash: 'SHA256:77X12',
            },
            {
              name: 'Remote_Policy_Update.docx',
              size: '450 KB',
              date: 'May 15, 2024',
              hash: 'SHA256:99P14',
            },
            {
              name: 'Tax_Statement_2023.pdf',
              size: '2.5 MB',
              date: 'April 10, 2024',
              hash: 'SHA256:44K88',
            },
          ].map((doc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-8 bg-secondary/50 rounded-[2.5rem] group hover:bg-card hover:shadow-xl transition-all border border-transparent hover:border-border"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center text-muted-foreground shadow-inner group-hover:text-primary transition-colors">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground antialiased leading-none">
                    {doc.name}
                  </p>
                  <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-3 flex items-center gap-4">
                    <span>
                      {doc.size} • {doc.date}
                    </span>
                    <span className="text-primary/50 font-mono">{doc.hash}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="p-4 bg-secondary text-muted-foreground hover:text-primary rounded-2xl transition-all">
                  <ExternalLink size={20} />
                </button>
                <button className="p-4 bg-foreground text-background rounded-2xl shadow-xl hover:scale-110 transition-all">
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-tight uppercase antialiased">
            My Ecosystem
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-0.5 bg-primary"></span>
            Personal Identity & Professional Lifecycle Console
          </p>
        </div>
        <HorizontalTabs
          tabs={[
            { id: 'profile', label: 'Identity', icon: User },
            { id: 'requests', label: 'Flux', icon: RefreshCw },
            { id: 'docs', label: 'Artifacts', icon: FileText },
          ]}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
          disabled={isSavingRequest || isSavingProfile}
          wrap={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color === 'success' ? 'emerald-500' : s.color === 'warning' ? 'orange-500' : 'primary'}/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div
              className={`p-4 rounded-2xl bg-${s.color === 'success' ? 'emerald-500' : s.color === 'warning' ? 'orange-500' : 'primary'}/10 text-${s.color === 'success' ? 'emerald-500' : s.color === 'warning' ? 'orange-500' : 'primary'} rounded-2xl flex items-center justify-center mb-8 w-fit shadow-inner`}
            >
              <s.icon size={28} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter">{s.value}</h4>
          </div>
        ))}
      </div>

      <main>
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'docs' && renderDocs()}
      </main>

      <FormModal
        title="Initiate Protocol"
        isOpen={requestModal.isOpen}
        onClose={requestModal.close}
        onSave={handleNewRequest}
        isLoading={isSavingRequest}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Protocol Category
            </label>
            <select
              value={newRequest.type}
              onChange={(e) => updateRequestField('type', e.target.value)}
              className="w-full bg-secondary border-none rounded-[1.25rem] px-8 py-5 font-black text-foreground outline-none cursor-pointer shadow-inner"
            >
              <option>Annual Leave</option>
              <option>Internet Reimbursement</option>
              <option>Asset Repair Request</option>
              <option>ID Card Re-Issue</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Strategic Rationale
            </label>
            <textarea
              required
              rows={4}
              value={newRequest.memo}
              onChange={(e) => updateRequestField('memo', e.target.value)}
              placeholder="Provide context for governance approval..."
              className="w-full bg-secondary border-none rounded-3xl px-8 py-5 font-bold text-foreground outline-none resize-none shadow-inner"
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        title="Identity Flux"
        isOpen={editProfileModal.isOpen}
        onClose={editProfileModal.close}
        onSave={handleSaveProfile}
        isLoading={isSavingProfile}
        size="lg"
      >
        <div className="space-y-8 py-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Update Identity (CNIC)
              </label>
              <input
                className="w-full bg-secondary border-none rounded-2xl px-6 py-4 font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                placeholder="35201-XXXXXXXX-X"
                value={profileData.cnic}
                onChange={(e) => updateProfileField('cnic', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Contact Signal (Mobile)
              </label>
              <input
                className="w-full bg-secondary border-none rounded-2xl px-6 py-4 font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                placeholder="+92 3XX XXXXXXX"
                value={profileData.mobile}
                onChange={(e) => updateProfileField('mobile', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-destructive/10 p-6 rounded-3xl border border-destructive/20 flex items-start gap-4">
            <AlertTriangle className="text-destructive w-6 h-6 shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-lg font-black text-foreground tracking-tight leading-none">
                Governance Lock
              </h4>
              <p className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider leading-relaxed">
                Modifying critical identity vectors (Legal Name, DOB) requires manual verification
                from a Super-Admin node. Your request will be hashed to the Governance Ledger for
                audit.
              </p>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default SelfService;
