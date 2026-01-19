import React, { useState } from 'react';
import { Edit2, X, Save, DollarSign, Calculator, Calendar } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Input } from '../../components/ui/Input';

const PayrollRules: React.FC = () => {
  const { payrollSettings, updatePayrollSettings } = useOrgStore();
  const { success, error: toastError } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await api.savePayrollSettings(payrollSettings);
      setIsEditing(false);
      success('Payroll rules saved successfully');
    } catch (error: any) {
      toastError(`Failed to save payroll rules: ${error.message}`);
    }
  };

  const handleCancel = async () => {
    try {
      const settings = await api.getPayrollSettings();
      updatePayrollSettings(settings);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to revert settings:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
      <div className="bg-surface rounded-md border border-border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border bg-muted-bg/30 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-text-primary uppercase tracking-wider flex items-center gap-3">
              <DollarSign size={20} className="text-primary" />
              General Payroll Rules
            </h3>
            <p className="text-[0.625rem] text-text-secondary font-bold mt-1.5 uppercase tracking-widest">
              Tax, Currency, and Calculation Cycles
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-text-muted hover:text-text-primary hover:bg-muted-bg"
              onClick={() => setIsEditing(true)}
              aria-label="Edit Payroll Settings"
            >
              <Edit2 size={14} />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-danger hover:bg-danger/10 rounded-full"
                aria-label="Cancel"
              >
                <X size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-success hover:bg-success/10 rounded-full"
                aria-label="Save"
              >
                <Save size={14} />
              </Button>
            </div>
          )}
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest ml-1">
                Tax Year End
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  size={16}
                />
                <select
                  disabled={!isEditing}
                  value={payrollSettings.taxYearEnd}
                  onChange={(e) =>
                    updatePayrollSettings({ ...payrollSettings, taxYearEnd: e.target.value })
                  }
                  className="w-full bg-muted-bg/50 border border-border/50 rounded-xl px-12 py-4 text-sm font-bold text-text-primary appearance-none outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                  aria-label="Tax Year End"
                >
                  <option value="June">June (Standard)</option>
                  <option value="December">December (Calendar)</option>
                  <option value="March">March (Fiscal)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest ml-1">
                Base Currency
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  size={16}
                />
                <Input
                  disabled={!isEditing}
                  value={payrollSettings.currency}
                  onChange={(e) =>
                    updatePayrollSettings({ ...payrollSettings, currency: e.target.value })
                  }
                  placeholder="e.g. PKR, USD"
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest ml-1">
                Calculation Method
              </label>
              <div className="relative">
                <Calculator
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  size={16}
                />
                <select
                  disabled={!isEditing}
                  value={payrollSettings.calculationMethod}
                  onChange={(e) =>
                    updatePayrollSettings({
                      ...payrollSettings,
                      calculationMethod: e.target.value as any,
                    })
                  }
                  className="w-full bg-muted-bg/50 border border-border/50 rounded-xl px-12 py-4 text-sm font-bold text-text-primary appearance-none outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                  aria-label="Calculation Method"
                >
                  <option value="Per Month">Per Month</option>
                  <option value="Per Hour">Per Hour</option>
                  <option value="Per Day">Per Day</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollRules;
