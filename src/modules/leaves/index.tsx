import React, { useState, useEffect } from 'react';
import {
  Plus,
  Coffee,
  FileText,
  Filter,
  AlertTriangle,
  Download,
  CalendarRange,
  Users,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  History,
  ShieldCheck,
  Check,
  Ban,
  Gauge,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance } from '../../types';
import { api } from '../../services/api';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { DateInput } from '../../components/ui/DateInput';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSaveEntity } from '../../hooks/useSaveEntity';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from '../../components/ui/SearchInput';

type LeaveTab = 'ledger' | 'matrix' | 'forecast';

const Leaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaveTab>('ledger');
  const leaveModal = useModal();
  const confirmModal = useModal();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredRequests,
  } = useSearch(requests, ['employeeName']);
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  const [confirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'primary' | 'danger';
  }>({ title: '', message: '', onConfirm: () => {} });

  const initialRequestState = {
    employeeId: '',
    name: '',
    type: 'Annual' as LeaveRequest['type'],
    start: '',
    end: '',
    reason: '',
  };

  const {
    formData: newRequest,
    updateField: updateRequestField,
    isSaving: isSavingRequest,
    handleSave: handleSaveRequest,
    setFormData: setRequestData,
  } = useSaveEntity<LeaveRequest, typeof initialRequestState>({
    onSave: (data) => api.saveLeaveRequest(data),
    onAfterSave: async () => {
      await loadData();
      leaveModal.close();
    },
    successMessage: 'Leave request submitted successfully.',
    initialState: initialRequestState,
    validate: (data) => !!(data.employeeId && data.name && data.start && data.end && data.reason),
    transform: (data) => ({
      id: '', // Placeholder for creation, backend generates actual ID
      employeeId: data.employeeId,
      employeeName: data.name,
      type: data.type, // Map UI type to schema type
      startDate: data.start,
      endDate: data.end,
      status: 'Pending',
      reason: data.reason,
    }),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqs, bals] = await Promise.all([api.getLeaveRequests(), api.getLeaveBalances()]);
      setRequests(reqs);
      setBalances(bals);
    } catch (e) {
      console.error('Failed to load leave data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Active Absences',
      value: '7',
      change: '+2',
      trend: 'up',
      icon: Coffee,
      color: 'blue',
    },
    {
      label: 'Pending Requests',
      value: requests.filter((r) => r.status === 'Pending').length.toString(),
      change: '-1',
      trend: 'down',
      icon: FileText,
      color: 'orange',
    },
    {
      label: 'Avg Utilization',
      value: '64%',
      change: 'Stable',
      trend: 'neutral',
      icon: Gauge,
      color: 'emerald',
    },
    {
      label: 'Capacity Risk',
      value: 'Low',
      change: 'Eng',
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'rose',
    },
  ];

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.updateLeaveRequestStatus(id, status);
      await loadData();
      success(`Leave request ${status.toLowerCase()} successfully.`);
    } catch (e) {
      console.error(e);
    }
  };

  const renderLedger = () => (
    <div className="bg-surface rounded-md border border-border shadow-md overflow-hidden min-h-[37.5rem] animate-in fade-in duration-500">
      <div className="p-12 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-muted-bg/30 backdrop-blur-3xl">
        <div>
          <h3 className="text-3xl font-black text-text-primary tracking-tight">Leave Requests</h3>
          <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
            <RefreshCw size={12} className="text-primary animate-spin-slow" /> Real-time Updates
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Employee..."
              className="w-64"
            />
          </div>
          <button
            aria-label="Filter leaves"
            className="p-4 bg-muted-bg rounded-md text-text-muted hover:text-primary transition-colors shadow-sm"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="bg-muted-bg/50 text-[0.6875rem] font-black uppercase text-text-muted tracking-[0.25em] font-sans">
              <th className="px-12 py-8">Employee</th>
              <th className="px-8 py-8">Type</th>
              <th className="px-8 py-8">Duration</th>
              <th className="px-8 py-8">Status</th>
              <th className="px-12 py-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {filteredRequests.map((req, index) => (
              <tr
                key={req.id}
                className="group hover:bg-primary-soft/50 transition-all cursor-pointer animate-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-12 py-8">
                  <p className="text-lg font-black text-text-primary leading-none">
                    {req.employeeName}
                  </p>
                  <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-2">
                    {req.employeeId}
                  </p>
                </td>
                <td className="px-8 py-8">
                  <span className="text-xs font-black text-text-muted uppercase tracking-widest bg-muted-bg px-4 py-1.5 rounded-sm border border-border">
                    {req.type}
                  </span>
                </td>
                <td className="px-8 py-8">
                  <p className="text-sm font-black text-text-primary">{req.startDate}</p>
                  <p className="text-[0.625rem] text-text-muted font-bold uppercase tracking-widest mt-1">
                    to {req.endDate}
                  </p>
                </td>
                <td className="px-8 py-8">
                  <span
                    className={`px-5 py-2 rounded-md text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                      req.status === 'Approved'
                        ? 'bg-success-soft text-success border-success/20'
                        : req.status === 'Pending'
                          ? 'bg-warning-soft text-warning border-warning/20 animate-pulse'
                          : 'bg-danger-soft text-danger border-danger/20'
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-12 py-8 text-right">
                  <div className="flex justify-end gap-3 transition-all">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'Approved')}
                          aria-label="Approve leave"
                          className="p-3 bg-success text-white rounded-md shadow-md hover:scale-110 active:scale-90 transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'Rejected')}
                          aria-label="Reject leave"
                          className="p-3 bg-danger text-white rounded-md shadow-md hover:scale-110 active:scale-90 transition-all"
                        >
                          <Ban size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        aria-label="View history"
                        className="p-3 bg-muted-bg text-text-muted rounded-md hover:text-primary transition-all"
                      >
                        <History size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="lg:col-span-8 bg-surface rounded-md border border-border shadow-md p-12">
        <h3 className="text-3xl font-black text-text-primary tracking-tight mb-12">
          Leave Balances
        </h3>
        <div className="space-y-6">
          {balances.map((node, i) => (
            <div
              key={i}
              className="p-8 bg-muted-bg/50 rounded-md border border-border flex items-center justify-between group hover:border-primary/30 hover:shadow-md hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-surface rounded-md flex items-center justify-center shadow-inner text-text-muted">
                  <Users size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-text-primary">{node.name}</h4>
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-1">
                    Total Balance: {node.total} Days
                  </p>
                </div>
              </div>
              <div className="flex gap-8 text-right">
                <div>
                  <p className="text-sm font-black text-text-primary">{node.annual}</p>
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase">Annual</p>
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary">{node.sick}</p>
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase">Sick</p>
                </div>
                <div className="w-[6.25rem] space-y-2">
                  <div className="flex justify-between text-[0.5625rem] font-black uppercase text-text-muted">
                    <span>Usage</span>
                    <span>{Math.round((node.used / node.total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(node.used / node.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-10">
        <div className="bg-surface p-12 rounded-md text-text-primary shadow-md relative overflow-hidden group border border-border">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <ShieldCheck size={140} />
          </div>
          <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary mb-8">
            Capacity Alert
          </h4>
          <p className="text-xl font-black leading-tight mb-10">
            AI predicts a{' '}
            <span className="text-primary underline decoration-primary/30 underline-offset-8">
              Resource Shortage
            </span>{' '}
            in the Engineering Cluster for early August.
          </p>
          <div className="space-y-6">
            <div className="p-6 bg-muted-bg/50 rounded-md border border-border">
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted mb-2">
                Eng Sub-Cluster Load
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">92%</span>
                <span className="text-[0.625rem] text-danger font-black uppercase">Threshold</span>
              </div>
            </div>
          </div>
          <button
            aria-label="Launch capacity rebalancer"
            className="w-full mt-10 py-5 bg-primary text-surface rounded-md font-black uppercase text-[0.625rem] tracking-widest shadow-md hover:scale-105 transition-all"
          >
            Launch Rebalancer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
            Leave Management
          </h1>
          <p className="text-text-muted mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Absence Tracking & Balances
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-surface rounded-md shadow-md border border-border">
          <button
            aria-label="Download leave report"
            className="bg-muted-bg p-4 rounded-md text-text-muted hover:text-primary transition-all shadow-sm"
          >
            <Download size={20} />
          </button>
          <Button
            onClick={() => {
              setRequestData(initialRequestState);
              leaveModal.open();
            }}
            icon={Plus}
          >
            New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-surface p-10 rounded-md border border-border shadow-sm relative overflow-hidden group hover:shadow-md hover:scale-[1.02] transition-all duration-300"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color === 'rose' ? 'danger' : s.color === 'emerald' ? 'success' : s.color === 'orange' ? 'warning' : 'primary'}-soft blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div className="flex items-center justify-between mb-8">
              <div
                className={`p-4 rounded-md bg-${s.color === 'rose' ? 'danger' : s.color === 'emerald' ? 'success' : s.color === 'orange' ? 'warning' : 'primary'}-soft text-${s.color === 'rose' ? 'danger' : s.color === 'emerald' ? 'success' : s.color === 'orange' ? 'warning' : 'primary'} shadow-inner`}
              >
                <s.icon size={24} />
              </div>
              <span
                className={`text-[0.625rem] font-black px-3 py-1.5 rounded-md border ${s.trend === 'up' ? 'text-success bg-success-soft border-success/10' : 'text-text-muted bg-muted-bg border-border'}`}
              >
                {s.change}
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-text-primary tracking-tighter">{s.value}</h4>
          </div>
        ))}
      </div>

      <HorizontalTabs
        tabs={[
          { id: 'ledger', label: 'Request Ledger', icon: List },
          { id: 'matrix', label: 'Balances', icon: LayoutGrid },
          { id: 'forecast', label: 'Calendar Flux', icon: CalendarRange },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as LeaveTab)}
        wrap={true}
        disabled={isLoading}
      />

      <main>
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'matrix' && renderMatrix()}
        {activeTab === 'forecast' && (
          <div className="py-40 text-center space-y-12 bg-surface rounded-md border border-border shadow-md">
            <div className="w-24 h-24 bg-primary text-white rounded-md flex items-center justify-center mx-auto shadow-md animate-pulse">
              <Sparkles size={40} />
            </div>
            <h3 className="text-4xl font-black text-text-primary tracking-tighter">
              AI Forecasting Active
            </h3>
            <p className="text-text-muted font-black uppercase text-[0.6875rem] tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
              Analyzing historical patterns and seasonal availability. Productivity impact analysis
              will appear shortly.
            </p>
          </div>
        )}
      </main>

      {/* Initiation Modal */}
      <FormModal
        title="New Request"
        isOpen={leaveModal.isOpen}
        onClose={leaveModal.close}
        onSave={handleSaveRequest}
        isLoading={isSavingRequest}
        size="md"
      >
        <div className="space-y-8">
          <Input
            label="Employee ID"
            required
            placeholder="e.g. EMP-001"
            value={newRequest.employeeId}
            onChange={(e) => updateRequestField('employeeId', e.target.value)}
          />
          <Input
            label="Employee Name"
            required
            placeholder="Name will be auto-fetched if possible..."
            value={newRequest.name}
            onChange={(e) => updateRequestField('name', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                Category
              </label>
              <select
                className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-black text-text-primary outline-none cursor-pointer"
                value={newRequest.type}
                onChange={(e) => updateRequestField('type', e.target.value as any)}
              >
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <DateInput
              label="Date Range"
              required
              value={newRequest.start}
              onChange={(e) => {
                updateRequestField('start', e.target.value);
                updateRequestField('end', e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
              Reason
            </label>
            <textarea
              required
              className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-bold text-text-muted outline-none resize-none h-32"
              placeholder="Describe the reason..."
              value={newRequest.reason}
              onChange={(e) => updateRequestField('reason', e.target.value)}
            />
          </div>
        </div>
      </FormModal>

      {/* Confirmation Modal */}
      <Modal
        title={confirmConfig.title}
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">{confirmConfig.message}</p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={confirmModal.close} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={confirmConfig.variant || 'primary'}
              onClick={() => {
                confirmConfig.onConfirm();
                confirmModal.close();
              }}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <div className="bg-surface p-20 rounded-md text-text-primary shadow-md relative overflow-hidden group border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
          <div className="w-32 h-32 bg-primary text-white rounded-md flex items-center justify-center shadow-md shadow-primary/30 animate-pulse shrink-0">
            <CalendarRange className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black tracking-tighter leading-none">
              Global Absence Policy
            </h3>
            <p className="text-text-muted mt-8 text-xl max-w-4xl leading-relaxed antialiased">
              The{' '}
              <span className="text-primary underline underline-offset-8 decoration-4 decoration-primary/30">
                System
              </span>{' '}
              ensures that workforce capacity remains optimal during peak periods. Our system
              automatically balances entitlement buckets while maintaining strict compliance with
              regional labor protocols.
            </p>
          </div>
          <button
            aria-label="View policy details"
            className="px-16 py-6 bg-app text-text-primary border border-border hover:bg-primary hover:text-white rounded-md font-black uppercase text-[0.75rem] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
          >
            View Policy Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
