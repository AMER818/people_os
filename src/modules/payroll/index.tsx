import React, { useState, useMemo, useEffect } from 'react';

import { INITIAL_LEDGER, CHART_DATA, PAYROLL_STATS } from './constants';
import { PayrollRecord } from '../../types';

// Sub-components
import PayrollStats from './PayrollStats';
import PayrollChart from './PayrollChart';
import PayrollLedger from './PayrollLedger';
import AnomalyEngine from './AnomalyEngine';
import ComplianceVault from './ComplianceVault';
import NeuralProjection from './NeuralProjection';
import PayrollHeader from './PayrollHeader';
// Note: Imports across modules should be careful.
// Assuming recruitment folder is a sibling of payroll folder in modules/
import RecruitmentFooter from '../recruitment/RecruitmentFooter';

import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Download, Printer, Send, Zap } from 'lucide-react';

const PayrollEngine: React.FC = () => {
  const [ledger, setLedger] = useState<PayrollRecord[]>(INITIAL_LEDGER);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const bonusModal = useModal();
  const paystubModal = useModal();
  const confirmModal = useModal();
  const { success } = useToast();

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'primary' | 'danger';
  }>({ title: '', message: '', onConfirm: () => {} });

  const showConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    confirmModal.open();
  };

  const [bonusData, setBonusData] = useState({
    employeeName: '',
    amount: '',
    reason: '',
    type: 'Performance',
  });

  const handleExecuteCycle = () => {
    showConfirm({
      title: 'Execute Payroll Cycle',
      message:
        'Are you sure you want to execute the payroll cycle for the current period? This will process all pending transactions.',
      onConfirm: () => {
        setIsProcessing(true);
        setProgress(0);
        success('Payroll cycle execution started.');
      },
    });
  };

  const handleSaveBonus = async () => {
    // await api.saveBonus(bonusData);
    success(`Bonus of ${bonusData.amount} assigned to ${bonusData.employeeName} successfully.`);
    bonusModal.close();
    setBonusData({ employeeName: '', amount: '', reason: '', type: 'Performance' });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessing && progress < 100) {
      timer = setTimeout(() => setProgress((prev) => prev + 5), 100);
    } else if (progress >= 100) {
      timer = setTimeout(() => {
        setIsProcessing(false);
        setLedger((prev) => prev.map((tx) => ({ ...tx, status: 'Processed' })));
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isProcessing, progress]);

  const filteredLedger = useMemo(() => {
    return ledger.filter(
      (tx) =>
        tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ledger, searchTerm]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <PayrollHeader
        onOpenBonusModal={() => {
          setBonusData({ employeeName: '', amount: '', reason: '', type: 'Performance' });
          bonusModal.open();
        }}
        onExecuteCycle={handleExecuteCycle}
        isProcessing={isProcessing}
        progress={progress}
      />

      {/* KPI Stats Grid */}
      <PayrollStats stats={PAYROLL_STATS} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Ledger & Chart */}
        <div className="lg:col-span-8 space-y-10">
          <PayrollChart data={CHART_DATA} />
          <PayrollLedger
            ledger={filteredLedger}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectTx={(tx) => {
              setSelectedTx(tx);
              paystubModal.open();
            }}
          />
        </div>

        {/* Right Column: AI & Compliance */}
        <div className="lg:col-span-4 space-y-10">
          <AnomalyEngine />
          <ComplianceVault />
          <NeuralProjection />
        </div>
      </div>

      <RecruitmentFooter />

      {/* Bonus Modal */}
      <FormModal
        title="Assign Bonus"
        isOpen={bonusModal.isOpen}
        onClose={bonusModal.close}
        onSave={handleSaveBonus}
        size="md"
      >
        <div className="space-y-6">
          <Input
            label="Employee Name"
            required
            placeholder="Search employee..."
            value={bonusData.employeeName}
            onChange={(e) => setBonusData({ ...bonusData, employeeName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              required
              placeholder="0.00"
              value={bonusData.amount}
              onChange={(e) => setBonusData({ ...bonusData, amount: e.target.value })}
            />
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                Bonus Type
              </label>
              <select
                className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-black text-text-primary outline-none cursor-pointer"
                value={bonusData.type}
                onChange={(e) => setBonusData({ ...bonusData, type: e.target.value })}
                aria-label="Bonus Type"
              >
                <option value="Performance">Performance</option>
                <option value="Retention">Retention</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
              Reason / Remarks
            </label>
            <textarea
              required
              className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-bold text-text-muted outline-none resize-none h-32"
              placeholder="Describe the reason for this bonus..."
              value={bonusData.reason}
              onChange={(e) => setBonusData({ ...bonusData, reason: e.target.value })}
              aria-label="Reason"
            />
          </div>
        </div>
      </FormModal>

      {/* Paystub Modal */}
      <Modal
        title="Electronic Paystub"
        isOpen={paystubModal.isOpen}
        onClose={paystubModal.close}
        size="lg"
      >
        {selectedTx && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-8 bg-muted-bg/30 rounded-md border border-border">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary text-white rounded-md flex items-center justify-center shadow-md">
                  <Zap size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-text-primary tracking-tight">
                    {selectedTx.name}
                  </h4>
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
                    {selectedTx.id} • {selectedTx.period}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary antialiased">{selectedTx.amount}</p>
                <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
                  Net Payable
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                  Earnings
                </h5>
                <div className="p-6 bg-surface rounded-md border border-border space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Basic Salary</span>
                    <span className="text-text-primary">PKR 145,000</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">House Rent</span>
                    <span className="text-text-primary">PKR 45,000</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Conveyance</span>
                    <span className="text-text-primary">PKR 15,000</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                  Deductions
                </h5>
                <div className="p-6 bg-surface rounded-md border border-border space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Income Tax</span>
                    <span className="text-danger">PKR 12,450</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Health Insurance</span>
                    <span className="text-danger">PKR 2,500</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Provident Fund</span>
                    <span className="text-danger">PKR 5,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="secondary" className="flex-1" icon={Printer}>
                Print Paystub
              </Button>
              <Button variant="secondary" className="flex-1" icon={Download}>
                Download PDF
              </Button>
              <Button className="flex-1" icon={Send}>
                Email to Node
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
    </div>
  );
};

export default PayrollEngine;
