import React, { useState, useMemo, useEffect } from 'react';
import {
  Receipt,
  Plane,
  Landmark,
  X,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Clock,
  CreditCard,
  FileText,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';
import { Expense, ExpenseStatus, ExpenseCategory } from '../../types';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatting';
// Mock data removed
const TRAVEL_NODES: any[] = [];
import { useSaveEntity } from '../../hooks/useSaveEntity';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';

// UI Components
import { Button } from '../../components/ui/Button';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { DateInput } from '../../components/ui/DateInput';

// Sub-components
import ExpenseStats from './ExpenseStats';
import ClaimsLedger from './ClaimsLedger';
import TravelHub from './TravelHub';

type ExpenseTab = 'claims' | 'travel' | 'policy';

const ExpensesTravel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExpenseTab>('claims');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const claimModal = useModal();
  const travelModal = useModal();
  const [selectedClaim, setSelectedClaim] = useState<Expense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    const data = await api.getExpenses();
    setExpenses(data);
    setIsLoading(false);
  };

  const initialClaimState = {
    employeeName: 'Sarah Jenkins',
    category: 'Travel' as ExpenseCategory,
    amount: 0,
    currency: 'USD',
  };

  const {
    formData: newClaim,
    updateField: updateClaimField,
    isSaving: isSavingClaim,
    handleSave: handleSaveClaim,
    setFormData: setClaimData,
  } = useSaveEntity<Expense, typeof initialClaimState>({
    onSave: async (claim) => {
      await api.saveExpense(claim);
      await loadExpenses();
    },
    onAfterSave: () => {
      claimModal.close();
    },
    successMessage: 'Disbursement protocol synchronized successfully.',
    initialState: initialClaimState,
    validate: (data) => data.amount > 0,
    transform: (data) => ({
      ...data,
      id: `E-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }),
  });

  const initialTravelState = {
    destination: '',
    departureDate: '',
    returnDate: '',
    memo: '',
  };

  const {
    formData: newTravel,
    updateField: updateTravelField,
    isSaving: isSavingTravel,
    handleSave: handleSaveTravel,
    setFormData: setTravelData,
  } = useSaveEntity<void, typeof initialTravelState>({
    onSave: async () => {
      // Logic for travel request - currently just closing modal in mock
    },
    onAfterSave: () => {
      travelModal.close();
    },
    successMessage: 'Travel authorization protocol initiated.',
    initialState: initialTravelState,
    validate: (data) => !!data.destination && !!data.departureDate,
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const stats = [
    { label: 'Pending Yield', val: '4.8k', icon: Clock, color: 'primary' },
    { label: 'Disbursed Monthly', val: '42.5k', icon: CreditCard, color: 'success' },
    { label: 'Anomaly Count', val: '2', icon: AlertTriangle, color: 'destructive' },
    { label: 'Mobility Index', val: '12 Nodes', icon: Plane, color: 'primary' },
  ];

  const updateClaimStatus = async (id: string, status: ExpenseStatus) => {
    const claim = expenses.find((e) => e.id === id);
    if (!claim) {
      return;
    }

    const updatedClaim = { ...claim, status };
    await api.saveExpense(updatedClaim);
    await loadExpenses();
    if (selectedClaim?.id === id) {
      setSelectedClaim(updatedClaim);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none antialiased uppercase">
            Fiscal Mobility
          </h1>
          <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] text-[0.625rem] flex items-center gap-4">
            <span className="w-8 h-[0.125rem] bg-success"></span>
            Travel Authorization & Expense Reimbursement Matrix
          </p>
        </div>
        <div className="flex items-center gap-6">
          <HorizontalTabs
            tabs={[
              { id: 'claims', label: 'Ledger', icon: Receipt },
              { id: 'travel', label: 'Travel', icon: Plane },
              { id: 'policy', label: 'Matrix', icon: Landmark },
            ]}
            activeTabId={activeTab}
            onTabChange={(id) => setActiveTab(id as typeof activeTab)}
            disabled={isLoading || isSavingClaim || isSavingTravel}
            wrap={true}
          />
          <button
            onClick={() => {
              setClaimData(initialClaimState);
              claimModal.open();
            }}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Plus size={16} /> New Claim
          </button>
        </div>
      </div>

      <ExpenseStats stats={stats} />

      <main>
        {activeTab === 'claims' && (
          <ClaimsLedger
            expenses={filteredExpenses}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectClaim={setSelectedClaim}
          />
        )}
        {activeTab === 'travel' && (
          <TravelHub
            travelNodes={TRAVEL_NODES}
            onPlanRoute={() => {
              setTravelData(initialTravelState);
              travelModal.open();
            }}
          />
        )}
        {activeTab === 'policy' && (
          <div className="py-10 text-center space-y-6 bg-card rounded-xl border border-border shadow-md animate-in zoom-in duration-500">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto shadow-inner">
              <Landmark size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                Fiscal Policy Control
              </h3>
              <p className="text-muted-foreground font-black uppercase text-[0.625rem] tracking-[0.2em] max-w-lg mx-auto leading-relaxed mt-2 antialiased">
                Manage per-diem limits, receipt hashing requirements, and automated tax reporting
                clusters for all personnel units.
              </p>
            </div>
            <Button size="sm">Audit Policy Ledger</Button>
          </div>
        )}
      </main>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-8 h-8 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center shadow-md">
              <Receipt size={16} />
            </div>
            <h3 className="text-base font-black text-destructive tracking-tight leading-tight uppercase">
              Fraud Sentry
            </h3>
          </div>
          <div className="p-4 bg-card rounded-lg border border-destructive/30 shadow-sm relative z-10">
            <p className="text-sm font-black text-card-foreground leading-tight">
              AI detected{' '}
              <span className="text-destructive underline underline-offset-4 decoration-destructive/20">
                unusual equipment claim
              </span>{' '}
              from Engineering Dept (215% above norm for M3 Max nodes).
            </p>
            <button className="mt-3 text-[0.5625rem] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-all flex items-center gap-2">
              Audit Evidence Hub <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl text-card-foreground shadow-sm relative overflow-hidden group border border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-12 h-12 bg-success text-white rounded-lg flex items-center justify-center shadow-md shrink-0 animate-pulse">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black tracking-tighter leading-none antialiased uppercase">
                Global Disbursement Terminal
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed antialiased">
                The{' '}
                <span className="text-success underline underline-offset-4 decoration-2">
                  PeopleOS Fiscal Engine
                </span>{' '}
                synchronizes travel claims with payroll cycles automatically. Cryptographic receipt
                hashing ensures 100% audit accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FormModal
        title="Log Disbursement"
        isOpen={claimModal.isOpen}
        onClose={claimModal.close}
        onSave={handleSaveClaim}
        isLoading={isSavingClaim}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Category Cluster
            </Label>
            <Select
              value={newClaim.category}
              onValueChange={(value) => updateClaimField('category', value as any)}
              aria-label="Expense Category"
            >
              <SelectTrigger className="bg-secondary border-none h-12 rounded-xl">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Meals">Meals</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Utility">Utility</SelectItem>
                <SelectItem value="Professional Dev">Professional Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Amount Vector
              </Label>
              <Input
                type="number"
                required
                value={newClaim.amount}
                onChange={(e) => updateClaimField('amount', Number(e.target.value))}
                placeholder="0.00"
                className="bg-secondary border-none h-12 rounded-xl"
                aria-label="Expense Amount"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Currency
              </Label>
              <Select
                value={newClaim.currency}
                onValueChange={(value) => updateClaimField('currency', value)}
                aria-label="Currency"
              >
                <SelectTrigger className="bg-secondary border-none h-12 rounded-xl">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="PKR">PKR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        title="Plan New Route"
        isOpen={travelModal.isOpen}
        onClose={travelModal.close}
        onSave={handleSaveTravel}
        isLoading={isSavingTravel}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Target Destination
            </Label>
            <Input
              required
              placeholder="e.g. London, UK"
              value={newTravel.destination}
              onChange={(e) => updateTravelField('destination', e.target.value)}
              className="bg-secondary border-none h-12 rounded-xl"
              aria-label="Destination"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Departure Point
              </Label>
              <DateInput
                value={newTravel.departureDate}
                onChange={(e) => updateTravelField('departureDate', e.target.value)}
                className="bg-secondary border-none h-12 rounded-xl"
                aria-label="Departure Date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Return Point
              </Label>
              <DateInput
                value={newTravel.returnDate}
                onChange={(e) => updateTravelField('returnDate', e.target.value)}
                className="bg-secondary border-none h-12 rounded-xl"
                aria-label="Return Date"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Strategic Rationale
            </Label>
            <textarea
              rows={3}
              value={newTravel.memo}
              onChange={(e) => updateTravelField('memo', e.target.value)}
              className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none resize-none shadow-inner focus:ring-2 focus:ring-primary/20"
              placeholder="Provide context for mobility clearance..."
              aria-label="Travel Memo"
            />
          </div>
        </div>
      </FormModal>

      {/* Claim Audit View Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-8 duration-700 flex flex-col max-h-[85vh]">
            <div className="p-8 flex items-center justify-between bg-card text-card-foreground relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-success rounded-2xl shadow-lg border-2 border-white/10 text-white">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter leading-none uppercase antialiased">
                    {selectedClaim.id}
                  </h3>
                  <p className="text-success font-black text-[0.625rem] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <ShieldCheck size={12} /> Fiscal Artifact • {selectedClaim.employeeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-3 bg-secondary hover:bg-secondary/80 rounded-full transition-all text-foreground"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                      Disbursement Vector
                    </p>
                    <p className="text-3xl font-black text-foreground font-mono">
                      {formatCurrency(selectedClaim.amount, selectedClaim.currency)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest">
                      Temporal Point
                    </p>
                    <p className="text-xl font-black text-foreground">{selectedClaim.date}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-muted-foreground border-b border-border pb-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-primary" /> Neural Verification Log
                  </h5>
                  <div className="p-6 bg-secondary/30 rounded-2xl border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="text-success" size={16} />
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">
                          OCR Receipt Validation: 99.8% Match
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-primary" size={16} />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">
                        Policy Compliance: Optimal
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-bold italic border-t border-border pt-4">
                      "Neural Engine has cross-referenced this claim with historical travel nodes
                      for {selectedClaim.employeeName}. Expenditure patterns align with typical SaaS
                      procurement cycles."
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-secondary/50 p-6 rounded-3xl border border-border shadow-inner">
                  <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">
                    Governance Phase
                  </h5>
                  <div className="space-y-6">
                    {[
                      { label: 'Pending', color: 'orange' },
                      { label: 'Approved', color: 'emerald' },
                      { label: 'Flagged', color: 'destructive' },
                      { label: 'Paid', color: 'primary' },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() =>
                          updateClaimStatus(selectedClaim.id, s.label as ExpenseStatus)
                        }
                        className={`w-full flex items-center justify-between p-6 rounded-[1.75rem] border transition-all ${
                          selectedClaim.status === s.label
                            ? `bg-${s.color === 'emerald' ? 'emerald-500' : s.color === 'orange' ? 'orange-500' : s.color === 'destructive' ? 'destructive' : 'primary'} text-white border-${s.color === 'emerald' ? 'emerald-600' : s.color === 'orange' ? 'orange-600' : s.color === 'destructive' ? 'destructive' : 'primary'} shadow-lg scale-105`
                            : 'bg-card border-transparent text-muted-foreground hover:border-border'
                        }`}
                      >
                        <span className="text-[0.6875rem] font-black uppercase tracking-widest">
                          {s.label}
                        </span>
                        {selectedClaim.status === s.label && <ShieldCheck size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-danger hover:bg-red-600 text-white"
                      onClick={async () => {
                        const { exportToPDF } = await import('../../utils/exportUtils');
                        const headers = ['ID', 'Employee', 'Category', 'Amount', 'Date', 'Status'];
                        const data = [
                          {
                            ID: selectedClaim.id,
                            Employee: selectedClaim.employeeName,
                            Category: selectedClaim.category,
                            Amount: selectedClaim.amount,
                            Date: selectedClaim.date,
                            Status: selectedClaim.status,
                          },
                        ];
                        exportToPDF(data, headers, `Claim_${selectedClaim.id}`);
                      }}
                    >
                      <FileText size={18} className="mr-2" /> PDF
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-success hover:bg-success text-white"
                      onClick={async () => {
                        const { exportToExcel } = await import('../../utils/exportUtils');
                        const data = [
                          {
                            ID: selectedClaim.id,
                            Employee: selectedClaim.employeeName,
                            Category: selectedClaim.category,
                            Amount: selectedClaim.amount,
                            Date: selectedClaim.date,
                            Status: selectedClaim.status,
                            Currency: selectedClaim.currency,
                          },
                        ];
                        exportToExcel(data, `Claim_${selectedClaim.id}`);
                      }}
                    >
                      <FileSpreadsheet size={18} className="mr-2" /> Excel
                    </Button>
                  </div>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="w-full py-4 text-muted-foreground font-black uppercase text-[0.625rem] tracking-widest hover:text-destructive transition-colors text-center"
                  >
                    Close Viewport
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTravel;
