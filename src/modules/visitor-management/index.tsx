import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Search,
  X,
  Camera,
  IdCard,
  Send,
  Check,
  UserCircle,
  BellRing,
  Download,
  LogOut,
} from 'lucide-react';
import { VisitorNode } from '../../types';
import { api } from '../../services/api';
import { formatTime } from '../../utils/formatting';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { useSaveEntity } from '../../hooks/useSaveEntity';
import { FormModal } from '../../components/ui/FormModal';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const VisitorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'requests'>('ledger');
  const requestModal = useModal();
  const directModal = useModal();
  const checkoutModal = useModal();
  const [guestToCheckOut, setGuestToCheckOut] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<VisitorNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVisitors();
      setVisitors(data);
    } finally {
      setIsLoading(false);
    }
  };

  const initialRequestState = {
    name: '',
    company: '',
    cnic: '',
    purpose: '',
    host: 'Sarah Jenkins',
  };

  const {
    formData: newRequest,
    updateField: updateRequestField,
    isSaving: isSavingRequest,
    handleSave: handleRequestSave,
    setFormData: setRequestData,
  } = useSaveEntity<VisitorNode, typeof initialRequestState>({
    onSave: async (request) => {
      await api.saveVisitor(request);
      await loadVisitors();
    },
    onAfterSave: () => {
      requestModal.close();
    },
    successMessage: 'Access request transmitted to governance ledger.',
    initialState: initialRequestState,
    validate: (data) => !!data.name && !!data.company && !!data.cnic && !!data.purpose,
    transform: (data) => ({
      ...data,
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
      checkIn: 'Pending',
      status: 'Pending Approval',
      requestDate: new Date().toISOString().split('T')[0],
    }),
  });

  const initialDirectState = {
    name: '',
    company: '',
    cnic: '',
    purpose: '',
    host: 'Sarah Jenkins',
    type: 'Guest' as const,
  };

  const {
    formData: directData,
    updateField: updateDirectField,
    isSaving: isSavingDirect,
    handleSave: handleDirectSave,
    setFormData: setDirectData,
  } = useSaveEntity<VisitorNode, typeof initialDirectState>({
    onSave: async (visitor) => {
      await api.saveVisitor(visitor);
      await loadVisitors();
    },
    onAfterSave: () => {
      directModal.close();
    },
    successMessage: 'Direct biometric registration complete.',
    initialState: initialDirectState,
    validate: (data) => !!data.name && !!data.cnic,
    transform: (data) => ({
      ...data,
      id: `DIR-${Math.floor(Math.random() * 900) + 100}`,
      checkIn: formatTime(new Date()),
      status: 'On-Site',
      requestDate: new Date().toISOString().split('T')[0],
      avatar: `https://picsum.photos/seed/${Math.random()}/200`,
    }),
  });

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === 'ledger' ? v.status !== 'Pending Approval' : v.status === 'Pending Approval';
      return matchesSearch && matchesTab;
    });
  }, [visitors, searchTerm, activeTab]);

  const stats = [
    {
      label: 'On-Site Nodes',
      value: visitors.filter((v) => v.status === 'On-Site').length,
      change: '+2 Today',
      trend: 'up',
      icon: UserCircle,
      color: 'primary',
    },
    {
      label: 'Pending Approval',
      value: visitors.filter((v) => v.status === 'Pending Approval').length,
      change: 'Flux',
      trend: 'neutral',
      icon: BellRing,
      color: 'primary',
    },
    {
      label: 'Expected Count',
      value: '24',
      change: '85% Fill',
      trend: 'up',
      icon: IdCard,
      color: 'success',
    },
  ];

  const handleCheckOutClick = (id: string) => {
    setGuestToCheckOut(id);
    checkoutModal.open();
  };

  const confirmCheckOut = async () => {
    if (!guestToCheckOut) {
      return;
    }

    const checkOutTime = formatTime(new Date());

    await api.updateVisitorStatus(guestToCheckOut, 'Checked-Out', checkOutTime);
    await loadVisitors();
    checkoutModal.close();
    setGuestToCheckOut(null);
  };

  const handleAction = async (id: string, action: 'Approve' | 'Reject') => {
    const status = action === 'Approve' ? 'Authorized' : 'Checked-Out';
    await api.updateVisitorStatus(id, status);
    loadVisitors();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase">
            Access Control
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Biometric Gate Ledger & Neural Intimation System
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <button
            onClick={() => {
              setRequestData(initialRequestState);
              requestModal.open();
            }}
            className="px-8 py-4 bg-primary/10 text-primary rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-4 hover:scale-105 hover:bg-primary/20 transition-all"
          >
            <Send size={16} /> Request Entry
          </button>
          <button
            onClick={() => {
              setDirectData(initialDirectState);
              directModal.open();
            }}
            className="bg-primary text-primary-foreground px-10 py-4 rounded-[1.375rem] font-black uppercase text-[0.6875rem] tracking-widest flex items-center gap-4 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Direct Register
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color === 'success' ? 'success' : 'primary'}/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div className="flex items-center justify-between mb-8">
              <div
                className={`p-4 rounded-2xl bg-${s.color === 'success' ? 'success' : 'primary'}/10 text-${s.color === 'success' ? 'success' : 'primary'} shadow-inner group-hover:scale-110 transition-transform`}
              >
                <s.icon size={24} />
              </div>
              <span
                className={`text-[0.625rem] font-black px-3 py-1.5 rounded-xl border ${s.trend === 'up' ? 'text-success bg-success/10 border-success/10' : 'text-text-muted bg-muted-bg border-border'}`}
              >
                {s.change}
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
              {s.value}
            </h4>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[43.75rem] flex flex-col">
        <div className="p-14 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-secondary/30 backdrop-blur-3xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <HorizontalTabs
              tabs={[
                { id: 'ledger', label: 'Presence Ledger' },
                { id: 'requests', label: 'Protocol Requests' },
              ]}
              activeTabId={activeTab}
              onTabChange={(id) => setActiveTab(id as any)}
              disabled={isLoading || isSavingRequest || isSavingDirect}
              wrap={true}
            />
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-card border border-border pl-10 pr-6 py-3 rounded-2xl text-sm font-black outline-none w-72 text-foreground shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Query Entry Identifier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="p-5 bg-foreground text-background rounded-[1.5rem] shadow-xl hover:scale-105 transition-all">
            <Download size={24} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 text-[0.6875rem] font-black uppercase text-muted-foreground tracking-[0.25em]">
                <th className="px-14 py-8">Guest Profile</th>
                <th className="px-8 py-8">Immersion Mark</th>
                <th className="px-8 py-8">Host Logic</th>
                <th className="px-8 py-8">State Phase</th>
                <th className="px-14 py-8 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-muted-foreground">
                    Loading Access Ledger...
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-muted-foreground">
                    No entries found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <td className="px-14 py-8">
                      <div className="flex items-center gap-6">
                        <img
                          src={row.avatar}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-secondary shadow-lg group-hover:scale-110 transition-all"
                          alt=""
                        />
                        <div>
                          <p className="text-xl font-black text-foreground tracking-tight leading-none">
                            {row.name}
                          </p>
                          <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-2">
                            {row.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-sm font-black text-foreground">{row.purpose}</p>
                      <p className="text-[0.625rem] text-muted-foreground font-bold uppercase mt-1 tracking-widest">
                        Entry: {row.checkIn}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-sm font-black text-foreground">{row.host}</p>
                      <p className="text-[0.625rem] text-muted-foreground font-bold uppercase mt-1 tracking-widest">
                        Internal Anchor
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <span
                        className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                          row.status === 'On-Site'
                            ? 'bg-success/10 text-success border-success/20'
                            : row.status === 'Pending Approval'
                              ? 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                              : row.status === 'Authorized'
                                ? 'bg-primary/10 text-primary border-primary/20 shadow-lg'
                                : 'bg-muted-bg text-text-muted border-border'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-14 py-8 text-right">
                      {row.status === 'On-Site' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckOutClick(row.id);
                          }}
                          className="px-6 py-2 bg-foreground text-background rounded-xl text-[0.625rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                          Log Exit
                        </button>
                      )}
                      {row.status === 'Pending Approval' && (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(row.id, 'Approve');
                            }}
                            className="p-3 bg-success text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(row.id, 'Reject');
                            }}
                            className="p-3 bg-destructive text-destructive-foreground rounded-xl shadow-lg hover:scale-110 transition-transform"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        title="Biometric Registration"
        isOpen={directModal.isOpen}
        onClose={directModal.close}
        onSave={handleDirectSave}
        isLoading={isSavingDirect}
      >
        <div className="space-y-6">
          <div className="p-8 border-2 border-dashed border-border rounded-[1.5rem] flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer group">
            <div className="p-4 bg-secondary rounded-full group-hover:scale-110 transition-transform">
              <Camera size={32} />
            </div>
            <span className="text-[0.625rem] font-black uppercase tracking-widest">
              Capture Biometric Artifact
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Full Name
              </label>
              <input
                placeholder="Guest Name"
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                value={directData.name}
                onChange={(e) => updateDirectField('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Identity Hash
              </label>
              <input
                placeholder="CNIC / ID"
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                value={directData.cnic}
                onChange={(e) => updateDirectField('cnic', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Entity
              </label>
              <input
                placeholder="Company"
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                value={directData.company}
                onChange={(e) => updateDirectField('company', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Internal Anchor
              </label>
              <input
                placeholder="Host Name"
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                value={directData.host}
                onChange={(e) => updateDirectField('host', e.target.value)}
              />
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        title="Protocol Entry Request"
        isOpen={requestModal.isOpen}
        onClose={requestModal.close}
        onSave={handleRequestSave}
        isLoading={isSavingRequest}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Guest Identifier
            </label>
            <input
              required
              placeholder="Legal Name"
              value={newRequest.name}
              onChange={(e) => updateRequestField('name', e.target.value)}
              className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Entity Vector
              </label>
              <input
                required
                placeholder="Company"
                value={newRequest.company}
                onChange={(e) => updateRequestField('company', e.target.value)}
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
                Identity Hash (CNIC)
              </label>
              <input
                required
                placeholder="35201-XXXXXXX-X"
                value={newRequest.cnic}
                onChange={(e) => updateRequestField('cnic', e.target.value)}
                className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-2">
              Immersion Logic (Purpose)
            </label>
            <textarea
              required
              placeholder="Reason for entry..."
              value={newRequest.purpose}
              onChange={(e) => updateRequestField('purpose', e.target.value)}
              className="w-full p-4 bg-secondary rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner resize-none"
              rows={3}
            />
          </div>
        </div>
      </FormModal>

      {/* Checkout Confirmation Modal */}
      <Modal
        isOpen={checkoutModal.isOpen}
        onClose={checkoutModal.close}
        title="Session Termination"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-200">
            <LogOut className="w-5 h-5 text-orange-400" />
            <p className="text-sm font-medium">Terminate guest session?</p>
          </div>
          <p className="text-xs text-slate-400">
            This will log the exit time and close the active access session. Use only when the guest
            has physically vacated the premises.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={checkoutModal.close} className="text-slate-400">
              Cancel
            </Button>
            <Button
              onClick={confirmCheckOut}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
            >
              Log Exit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisitorManagement;
