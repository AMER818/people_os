import React from 'react';
import { useOrgStore } from '@store/orgStore';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { DateInput } from '@components/ui/DateInput';
import { Save, Scale } from 'lucide-react';
import { useToast } from '@components/ui/Toast';

const ComplianceSettings: React.FC = () => {
  const { complianceSettings, updateCompliance } = useOrgStore();
  const { success, error } = useToast();

  // Local state to prevent API calls on every keystroke
  const [localSettings, setLocalSettings] = React.useState(complianceSettings);

  // Sync local state when store changes (initial load)
  React.useEffect(() => {
    setLocalSettings(complianceSettings);
  }, [complianceSettings]);

  const handleSave = async () => {
    try {
      await updateCompliance(localSettings);
      success('Compliance settings saved successfully');
    } catch (e) {
      error('Failed to save settings');
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl" aria-hidden="true">
            <Scale size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
              Compliance Settings
            </h3>
            <p className="text-sm text-text-muted">Manage tax year and statutory rates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <DateInput
              id="tax-year-end"
              label="Tax Year End"
              value={localSettings.taxYear || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocalSettings({ ...localSettings, taxYear: e.target.value })
              }
            />
            <Input
              id="min-wage"
              label="Minimum Wage (PKR)"
              type="number"
              value={localSettings.minWage?.toString() || '0'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocalSettings({ ...localSettings, minWage: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-4">
            <Input
              id="eobi-rate"
              label="EOBI Rate (%)"
              type="number"
              step="0.1"
              value={localSettings.eobiRate?.toString() || '0'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocalSettings({ ...localSettings, eobiRate: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              id="social-security-rate"
              label="Social Security Rate (%)"
              type="number"
              step="0.1"
              value={localSettings.socialSecurityRate?.toString() || '0'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocalSettings({
                  ...localSettings,
                  socialSecurityRate: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            className="font-black uppercase tracking-widest"
            aria-label="Save compliance settings"
          >
            <Save size={16} className="mr-2" aria-hidden="true" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceSettings;
