import React from 'react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface NotificationsManagerProps {
  onSync: () => void;
}

/**
 * NotificationsManager Component
 * @description Configures system-wide notification channels and SMTP relay settings.
 * Features:
 * - SMTP server configuration
 * - System alert preferences (Slack, Email, SMS)
 * - Notification density and threshold management
 */
const NotificationsManager: React.FC<NotificationsManagerProps> = React.memo(({ onSync }) => {
  const { notificationSettings, updateNotificationSettings } = useOrgStore();
  const { success, error } = useToast();
  const [localSettings, setLocalSettings] = React.useState(notificationSettings);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalSettings(notificationSettings);
  }, [notificationSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNotificationSettings(localSettings);
      success('Notification settings saved');
      onSync(); // Refresh if needed
    } catch {
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmail = (updates: Partial<typeof notificationSettings.email>) => {
    setLocalSettings((prev) => ({ ...prev, email: { ...prev.email, ...updates } }));
  };

  const updateSms = (updates: Partial<typeof notificationSettings.sms>) => {
    setLocalSettings((prev) => ({ ...prev, sms: { ...prev.sms, ...updates } }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xl">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
              Notifications
            </h3>
            <p className="text-text-muted text-xs font-bold antialiased">
              Manage email and SMS settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <Mail size={12} className="text-primary" /> Email Settings
            </h4>
            <div className="space-y-3">
              <Input
                label="Server Address"
                placeholder="smtp.relay.com"
                value={localSettings.email.smtpServer}
                onChange={(e) => updateEmail({ smtpServer: e.target.value })}
              />
              <Input
                label="Port Number"
                placeholder="587"
                type="number"
                value={localSettings.email.port.toString()}
                onChange={(e) => updateEmail({ port: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Username / Email"
                placeholder="node@enterprise.com"
                value={localSettings.email.username}
                onChange={(e) => updateEmail({ username: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={localSettings.email.password}
                onChange={(e) => updateEmail({ password: e.target.value })}
              />
              <Button
                variant="secondary"
                className="w-full py-2 h-9 font-black uppercase tracking-widest text-[0.6rem]"
                aria-label="Test Email Connectivity"
              >
                Test Email
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone size={12} className="text-primary" /> SMS Settings
            </h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest ml-1">
                  Provider
                </label>
                <select
                  className="w-full bg-muted-bg border-none rounded-lg p-2.5 font-black text-xs text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  value={localSettings.sms.provider}
                  onChange={(e) => updateSms({ provider: e.target.value as any })}
                >
                  <option value="Twilio">Twilio Cloud</option>
                  <option value="MessageBird">MessageBird API</option>
                  <option value="AWS SNS">AWS SNS Gateway</option>
                </select>
              </div>
              <Input
                label="API Key"
                type="password"
                placeholder="••••••••"
                value={localSettings.sms.apiKey}
                onChange={(e) => updateSms({ apiKey: e.target.value })}
              />
              <Input
                label="Sender ID"
                placeholder="PEOPLE-OS"
                value={localSettings.sms.senderId}
                onChange={(e) => updateSms({ senderId: e.target.value })}
              />
              {/* Removed redundant individual save buttons, using global save */}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full py-4 h-10 font-black uppercase tracking-[0.2em] text-[0.65rem]"
            aria-label="Save notification settings"
          >
            <Save size={14} className="mr-2" />
            Save Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
});

export default NotificationsManager;
