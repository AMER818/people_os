import React, { useState } from 'react';
import {
  Hash,
  Plus,
  TrendingUp,
  ArrowUp,
  Trash2,
  ShieldCheck,
  Wallet,
  Banknote,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatting';
import { Employee as EmployeeType, Increment, PayrollRecord } from '../../types';
import { useOrgStore } from '../../store/orgStore';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormModal } from '../../components/ui/FormModal';
import { DateInput } from '../../components/ui/DateInput';
import { PAYMENT_MODES } from './constants';

interface PayrollTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
  isNewRecord?: boolean;
}

const PayrollTab: React.FC<PayrollTabProps> = ({ employee, updateField, isNewRecord = false }) => {
  const { banks, payrollRecords, addPayrollRecord } = useOrgStore();
  const currentUser = 'Current User'; // Placeholder for auth context

  const handleRunPayroll = () => {
    if (!employee || !employee.id) {
      return;
    }
    const gross = employee.grossSalary || 0;
    const allowances =
      (employee.houseRent || 0) + (employee.utilityAllowance || 0) + (employee.otherAllowance || 0);
    const tax = gross * 0.05; // Mock 5% tax
    const net = gross + allowances - tax;

    const record: PayrollRecord = {
      id: `PR-${Date.now()}`,
      name: employee.name || 'Unknown',
      employeeId: employee.id,
      dept: employee.department || 'General',
      basicSalary: gross,
      allowances,
      gross: gross + allowances,
      tax,
      deductions: 0,
      net,
      status: 'Processed',
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      paymentDate: new Date().toISOString().split('T')[0],
    };
    addPayrollRecord(record);
  };

  const estNet =
    (employee?.grossSalary || 0) +
    (employee?.houseRent || 0) +
    (employee?.utilityAllowance || 0) +
    (employee?.otherAllowance || 0);

  // Modal state for fiscal record creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Increment['type']>('Increment');
  const [modalData, setModalData] = useState({
    effectiveDate: new Date().toISOString().split('T')[0],
    newGross: 0,
    newHouseRent: 0,
    newUtilityAllowance: 0,
    newOtherAllowance: 0,
    remarks: '',
  });

  // Open modal with type
  const openFiscalModal = (type: Increment['type']) => {
    setModalType(type);
    setModalData({
      effectiveDate: new Date().toISOString().split('T')[0],
      newGross: employee?.grossSalary || 0,
      newHouseRent: employee?.houseRent || 0,
      newUtilityAllowance: employee?.utilityAllowance || 0,
      newOtherAllowance: employee?.otherAllowance || 0,
      remarks: '',
    });
    setIsModalOpen(true);
  };

  // Submit modal - create fiscal record
  const handleModalSubmit = () => {
    if (!modalData.effectiveDate) {
      return; // Effective date is mandatory
    }

    const newIncrement: Increment = {
      effectiveDate: modalData.effectiveDate,
      newGross: modalData.newGross,
      newHouseRent: modalData.newHouseRent,
      newUtilityAllowance: modalData.newUtilityAllowance,
      newOtherAllowance: modalData.newOtherAllowance,
      type: modalType,
      remarks: modalData.remarks,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
    };

    updateField('increments', [...(employee?.increments || []), newIncrement]);

    // Auto-sync main fields
    updateField('grossSalary', modalData.newGross);
    updateField('houseRent', modalData.newHouseRent);
    updateField('utilityAllowance', modalData.newUtilityAllowance);
    updateField('otherAllowance', modalData.newOtherAllowance);

    setIsModalOpen(false);
  };

  const removeInc = (index: number) => {
    const increments = employee?.increments || [];
    const newIncrements = increments.filter((_, i) => i !== index);
    updateField('increments', newIncrements);

    // Sync current values with the new "latest" increment if it exists
    if (newIncrements.length > 0) {
      const last = newIncrements[newIncrements.length - 1];
      updateField('grossSalary', last.newGross);
      updateField('houseRent', last.newHouseRent);
      updateField('utilityAllowance', last.newUtilityAllowance);
      updateField('otherAllowance', last.newOtherAllowance);
    }
  };

  const updateInc = (index: number, field: keyof Increment, value: any) => {
    const newInc = [...(employee?.increments || [])];
    newInc[index] = { ...newInc[index], [field]: value };
    updateField('increments', newInc);

    // Auto-sync main fields if modifying the latest growth step
    if (index === newInc.length - 1) {
      const fieldMap: Record<string, keyof EmployeeType> = {
        newGross: 'grossSalary',
        newHouseRent: 'houseRent',
        newUtilityAllowance: 'utilityAllowance',
        newOtherAllowance: 'otherAllowance',
      };
      if (fieldMap[field]) {
        updateField(fieldMap[field], value);
      }
    }
  };

  return (
    <>
      <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
        {/* 1. Summary Card (Moved to Top) */}
        <Card className="p-14 relative overflow-hidden group bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all rounded-[3rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-12 opacity-5 text-text-muted pointer-events-none">
            <Wallet className="w-64 h-64" />
          </div>
          <p className="text-text-muted font-black uppercase text-xs tracking-widest mb-4">
            Estimated Monthly Pay
          </p>
          <h3 className="text-4xl font-black tracking-tighter text-text-primary">
            {formatCurrency(estNet)}{' '}
          </h3>
          <div className="flex gap-10 mt-12 pt-12 border-t border-border">
            <div>
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                Base Salary
              </p>
              <p className="text-lg font-bold">{formatCurrency(employee?.grossSalary || 0)}</p>
            </div>
            <div>
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                Total Allowances
              </p>
              <p className="text-lg font-bold text-success">
                +
                {(employee?.houseRent || 0) +
                  (employee?.utilityAllowance || 0) +
                  (employee?.otherAllowance || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Compensation Structure (READ-ONLY VIEW) */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">
                Compensation Package
              </h4>
              <span className="text-[0.5rem] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {isNewRecord ? 'EDITABLE' : 'LOCKED'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Input
                label="Gross Salary *"
                type="number"
                value={employee?.grossSalary || 0}
                onChange={(e) => isNewRecord && updateField('grossSalary', Number(e.target.value))}
                readOnly={!isNewRecord}
                className={
                  isNewRecord
                    ? ''
                    : 'bg-transparent border-dashed border-border/50 text-text-muted cursor-not-allowed shadow-none'
                }
              />
              <Input
                label="House Rent"
                type="number"
                value={employee?.houseRent || 0}
                onChange={(e) => isNewRecord && updateField('houseRent', Number(e.target.value))}
                readOnly={!isNewRecord}
                className={
                  isNewRecord
                    ? ''
                    : 'bg-transparent border-dashed border-border/50 text-text-muted cursor-not-allowed shadow-none'
                }
              />
              <Input
                label="Utility Allowance"
                type="number"
                value={employee?.utilityAllowance || 0}
                onChange={(e) =>
                  isNewRecord && updateField('utilityAllowance', Number(e.target.value))
                }
                readOnly={!isNewRecord}
                className={
                  isNewRecord
                    ? ''
                    : 'bg-transparent border-dashed border-border/50 text-text-muted cursor-not-allowed shadow-none'
                }
              />
              <Input
                label="Other Allowance"
                type="number"
                value={employee?.otherAllowance || 0}
                onChange={(e) =>
                  isNewRecord && updateField('otherAllowance', Number(e.target.value))
                }
                readOnly={!isNewRecord}
                className={
                  isNewRecord
                    ? ''
                    : 'bg-transparent border-dashed border-border/50 text-text-muted cursor-not-allowed shadow-none'
                }
              />
            </div>
          </div>
        </Card>

        {/* 3. Payment Method */}
        <Card className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
                Payment Mode
              </label>
              <select
                value={employee?.paymentMode || 'Cash Payment'}
                onChange={(e) => updateField('paymentMode', e.target.value)}
                className="w-full bg-muted-bg border border-border rounded-md px-6 py-3 text-[0.75rem] outline-none font-bold text-text-primary"
              >
                {PAYMENT_MODES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {employee?.paymentMode === 'Bank Transfer' && (
              <>
                <div className="space-y-2">
                  <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
                    Bank
                  </label>
                  <select
                    value={employee?.bankId || ''}
                    onChange={(e) => updateField('bankId', e.target.value)}
                    className="w-full bg-muted-bg border border-border rounded-md px-6 py-3 text-[0.75rem] outline-none font-bold text-text-primary"
                  >
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Account Number / IBAN"
                  value={employee?.bankAccount || ''}
                  onChange={(e) => updateField('bankAccount', e.target.value)}
                  icon={Hash}
                />
              </>
            )}
          </div>
        </Card>

        {/* 4. Fiscal Evolution (Strict Change Log) */}
        <Card className="p-8 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-black text-text-primary antialiased">Salary History</h4>
              <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-[0.25em] mt-1">
                Track salary changes
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                onClick={() => openFiscalModal('Increment')}
                variant="secondary"
                icon={ArrowUp}
                size="sm"
              >
                Increment
              </Button>
              <Button
                onClick={() => openFiscalModal('Promotion')}
                variant="primary"
                icon={TrendingUp}
                size="sm"
              >
                Promotion
              </Button>
              <Button
                onClick={() => openFiscalModal('Adjustment')}
                variant="outline"
                icon={Plus}
                size="sm"
              >
                Adjustment
              </Button>
              <Button
                onClick={() => openFiscalModal('Correction')}
                variant="danger"
                icon={Plus}
                size="sm"
              >
                Correction
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {(employee?.increments || []).map((inc, i) => (
              <div
                key={i}
                className="p-8 bg-surface rounded-md border border-border flex flex-col gap-6 group hover:shadow-md transition-all"
              >
                {/* Header Row: Type, Date, Audit Stamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-12 h-12 rounded flex items-center justify-center 
                        ${
                          inc.type === 'Promotion'
                            ? 'bg-warning-soft text-warning'
                            : inc.type === 'Correction'
                              ? 'bg-danger-soft text-danger'
                              : inc.type === 'Adjustment'
                                ? 'bg-secondary-soft text-secondary'
                                : 'bg-primary-soft text-primary'
                        }`}
                    >
                      {inc.type === 'Promotion' ? <TrendingUp size={20} /> : <ArrowUp size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <DateInput
                          value={inc.effectiveDate}
                          onChange={(e) => updateInc(i, 'effectiveDate', e.target.value)}
                          className="bg-transparent border-none font-black text-sm text-text-primary outline-none w-32 p-0 h-auto"
                        />
                        <span
                          className={`px-2 py-0.5 rounded-[0.125rem] text-[0.5rem] font-black uppercase tracking-wider
                          ${
                            inc.type === 'Promotion'
                              ? 'bg-warning-soft text-warning'
                              : inc.type === 'Correction'
                                ? 'bg-danger-soft text-danger'
                                : 'bg-primary-soft text-primary'
                          }`}
                        >
                          {inc.type}
                        </span>
                      </div>
                      <p className="text-[0.5625rem] font-bold text-text-muted mt-1 uppercase tracking-tighter">
                        Created {formatDate(inc.createdAt)} {formatTime(inc.createdAt)} by{' '}
                        {inc.createdBy}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeInc(i)}
                    aria-label="Remove increment"
                    className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Values Grid: Gross + All Allowances */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y border-border/30">
                  <div className="space-y-1">
                    <p className="text-[0.5rem] font-black text-text-muted uppercase">Gross</p>
                    <input
                      type="number"
                      value={inc.newGross}
                      onChange={(e) => updateInc(i, 'newGross', Number(e.target.value))}
                      className="w-full bg-muted-bg px-3 py-1.5 rounded font-bold text-xs text-text-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.5rem] font-black text-text-muted uppercase">House Rent</p>
                    <input
                      type="number"
                      value={inc.newHouseRent || 0}
                      onChange={(e) => updateInc(i, 'newHouseRent', Number(e.target.value))}
                      className="w-full bg-muted-bg px-3 py-1.5 rounded font-bold text-xs text-text-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.5rem] font-black text-text-muted uppercase">Utility</p>
                    <input
                      type="number"
                      value={inc.newUtilityAllowance || 0}
                      onChange={(e) => updateInc(i, 'newUtilityAllowance', Number(e.target.value))}
                      className="w-full bg-muted-bg px-3 py-1.5 rounded font-bold text-xs text-text-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.5rem] font-black text-text-muted uppercase">Other</p>
                    <input
                      type="number"
                      value={inc.newOtherAllowance || 0}
                      onChange={(e) => updateInc(i, 'newOtherAllowance', Number(e.target.value))}
                      className="w-full bg-muted-bg px-3 py-1.5 rounded font-bold text-xs text-text-primary outline-none"
                    />
                  </div>
                </div>

                {/* Remarks/Audit Mandatory Field */}
                <div>
                  <p className="text-[0.5rem] font-black text-text-muted uppercase tracking-widest mb-1">
                    Reason for Change
                  </p>
                  <input
                    value={inc.remarks}
                    placeholder="e.g., Annual Grade Increment, Correction of entry error, Market alignment..."
                    onChange={(e) => updateInc(i, 'remarks', e.target.value)}
                    className="bg-transparent border-none text-[0.6875rem] text-text-primary font-medium outline-none w-full placeholder:text-text-muted/50 italic"
                  />
                </div>
              </div>
            ))}
            {(!employee?.increments || employee.increments.length === 0) && (
              <div className="p-16 text-center text-text-muted font-black uppercase text-xs tracking-[0.2em] border-2 border-dashed border-border rounded-md bg-muted-bg/10">
                No salary history found.
                <br />
                <span className="text-[0.5rem] opacity-50 mt-2 block">
                  Create an entry to set initial salary.
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* 5. Payslip Ledger */}
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-black text-text-primary antialiased">Payslips</h4>
              <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-[0.25em] mt-1">
                Monthly salary history
              </p>
            </div>
            <Button onClick={handleRunPayroll} icon={Banknote}>
              Generate Current Slip
            </Button>
          </div>

          <div className="bg-surface rounded-md border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted-bg/50 text-[0.5625rem] font-black uppercase text-text-muted tracking-widest">
                  <th className="px-6 py-4">Month</th>
                  <th className="px-4 py-4">Basic</th>
                  <th className="px-4 py-4">Allowances</th>
                  <th className="px-4 py-4">Tax</th>
                  <th className="px-4 py-4">Net Pay</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrollRecords
                  .filter((r) => r.employeeId === employee?.id)
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-muted-bg/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-primary text-xs">
                        {record.month}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono">
                        {formatCurrency(record.basicSalary)}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-success">
                        +{formatCurrency(record.allowances)}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-danger">
                        -{formatCurrency(record.tax)}
                      </td>
                      <td className="px-4 py-4 font-black text-text-primary text-xs">
                        {formatCurrency(record.net)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-[0.125rem] text-[0.5rem] font-black uppercase tracking-wider">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                {payrollRecords.filter((r) => r.employeeId === employee?.id).length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-text-muted text-xs font-bold uppercase tracking-widest"
                    >
                      No payslips generated.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Fiscal Record Creation Modal */}
      <FormModal
        title={`Add ${modalType}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSubmit}
        saveLabel="Create Record"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <DateInput
              label="Effective Date *"
              value={modalData.effectiveDate}
              onChange={(e) => setModalData({ ...modalData, effectiveDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Gross Salary *
              </label>
              <input
                type="number"
                value={modalData.newGross}
                onChange={(e) => setModalData({ ...modalData, newGross: Number(e.target.value) })}
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm font-bold text-text-primary outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                House Rent
              </label>
              <input
                type="number"
                value={modalData.newHouseRent}
                onChange={(e) =>
                  setModalData({ ...modalData, newHouseRent: Number(e.target.value) })
                }
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm font-bold text-text-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Utility Allowance
              </label>
              <input
                type="number"
                value={modalData.newUtilityAllowance}
                onChange={(e) =>
                  setModalData({ ...modalData, newUtilityAllowance: Number(e.target.value) })
                }
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm font-bold text-text-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Other Allowance
              </label>
              <input
                type="number"
                value={modalData.newOtherAllowance}
                onChange={(e) =>
                  setModalData({ ...modalData, newOtherAllowance: Number(e.target.value) })
                }
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm font-bold text-text-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Remarks / Justification
            </label>
            <input
              type="text"
              value={modalData.remarks}
              onChange={(e) => setModalData({ ...modalData, remarks: e.target.value })}
              placeholder="e.g., Annual increment, Market adjustment..."
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-primary outline-none"
            />
          </div>
        </div>
      </FormModal>
    </>
  );
};

export default PayrollTab;
