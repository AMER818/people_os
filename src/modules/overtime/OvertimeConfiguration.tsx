import React, { useState } from 'react';
import { Timer, Edit2, X, Save, AlertCircle, ToggleLeft } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

const OvertimeConfiguration: React.FC = () => {
  const { payrollSettings, updatePayrollSettings } = useOrgStore();
  const { success, error: toastError } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await api.savePayrollSettings(payrollSettings);
      setIsEditing(false);
      success('Overtime configurations saved successfully');
    } catch (error: any) {
      toastError(`Failed to save overtime configurations: ${error.message}`);
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
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-foreground uppercase tracking-wider flex items-center gap-3">
              <Timer size={20} className="text-primary" />
              Overtime Configuration
            </h3>
            <p className="text-[0.625rem] text-muted-foreground font-bold mt-1.5 uppercase tracking-widest">
              Manage overtime calculation rules
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={14} />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-full"
              >
                <X size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-success hover:bg-success/10 rounded-full"
              >
                <Save size={14} />
              </Button>
            </div>
          )}
        </div>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between p-6 bg-secondary/30 rounded-2xl border border-border">
            <div className="space-y-1">
              <label className="text-sm font-black text-foreground uppercase tracking-wider">
                Enable Overtime
              </label>
              <p className="text-[0.6rem] text-muted-foreground font-bold uppercase tracking-widest">
                Global switch for overtime calculations
              </p>
            </div>
            <button
              role="checkbox"
              aria-checked={payrollSettings.overtimeEnabled}
              disabled={!isEditing}
              className={`relative inline-block w-14 h-8 align-middle select-none transition duration-200 ease-in rounded-full border-2 ${
                payrollSettings.overtimeEnabled
                  ? 'bg-primary/20 border-primary'
                  : 'bg-secondary border-border'
              } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              onClick={() =>
                isEditing &&
                updatePayrollSettings({
                  ...payrollSettings,
                  overtimeEnabled: !payrollSettings.overtimeEnabled,
                })
              }
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200 shadow-md ${
                  payrollSettings.overtimeEnabled
                    ? 'right-0.5 bg-primary'
                    : 'left-0.5 bg-muted-foreground'
                }`}
              />
            </button>
          </div>

          {/* Detailed Overtime Rates could go here if schema allows, currently just showing the note similar to before */}
          <div className="p-6 bg-secondary/30 rounded-2xl border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <AlertCircle size={64} className="text-primary" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm mt-1">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Configuration Note
                </h4>
                <p className="text-[0.65rem] text-muted-foreground font-bold mt-2 leading-relaxed uppercase tracking-wider">
                  Specific rates for Routine and Gazette Holidays are currently managed via the
                  backend configuration or advanced payroll settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvertimeConfiguration;
