import React from 'react';
import {
  Shield,
  Fingerprint,
  Globe,
  Clock,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';

const SecuritySettings: React.FC = () => {
  const { systemFlags, updateSystemFlags } = useOrgStore();
  const { success, error } = useToast();

  const toggleFlag = (flag: keyof typeof systemFlags) => {
    try {
      updateSystemFlags({ [flag]: !systemFlags[flag] });
      success(`Security parameter ${flag.replace(/_/g, ' ')} updated.`);
    } catch (e) {
      error('Failed to update security parameter.');
    }
  };

  const handleValueChange = (flag: keyof typeof systemFlags, value: string) => {
    try {
      updateSystemFlags({ [flag]: value });
    } catch (e) {
      error('Failed to update security parameter.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
          <Shield className="text-primary w-6 h-6" /> Security Settings
        </h2>
        <p className="text-sm text-text-muted font-medium">Manage system security and access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Factor Authentication */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">
                  Multi-Factor Authentication
                </h3>
                <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">
                  MFA Enforcement
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleFlag('mfa_enforced')}
              className={`w-12 h-6 rounded-full transition-all relative ${systemFlags.mfa_enforced ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted-bg'}`}
              role="switch"
              aria-checked={systemFlags.mfa_enforced}
              aria-label="Toggle Multi-Factor Authentication"
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${systemFlags.mfa_enforced ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-6 font-medium">
            Require all users to provide a second form of identification when accessing the system.
            Compatible with TOTP (Google Authenticator) and Hardware Keys.
          </p>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted-bg/30 rounded-lg border border-border/50">
            <CheckCircle2 size={12} className="text-success" />
            <span className="text-[0.65rem] font-bold text-text-primary uppercase tracking-widest">
              Global Policy Enabled
            </span>
          </div>
        </div>

        {/* Biometrics */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Fingerprint size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">
                  Biometric Authentication
                </h3>
                <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">
                  Enable FaceID & TouchID
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleFlag('biometrics_required')}
              className={`w-12 h-6 rounded-full transition-all relative ${systemFlags.biometrics_required ? 'bg-primary' : 'bg-muted-bg'}`}
              role="switch"
              aria-checked={systemFlags.biometrics_required}
              aria-label="Toggle Biometric Authentication"
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${systemFlags.biometrics_required ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-6 font-medium">
            Enable native biometric authentication for mobile and desktop applications. Reduces
            reliance on passwords while increasing physical security.
          </p>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted-bg/30 rounded-lg border border-border/50 text-warning">
            <AlertTriangle size={12} />
            <span className="text-[0.65rem] font-bold uppercase tracking-widest">
              Requires Client Support
            </span>
          </div>
        </div>

        {/* IP Whitelisting */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group overflow-hidden relative">
          <Globe className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12" />
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">
                  Location Restrictions
                </h3>
                <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">
                  IP & Domain Restrictions
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleFlag('ip_whitelisting')}
              className={`w-12 h-6 rounded-full transition-all relative ${systemFlags.ip_whitelisting ? 'bg-warning shadow-lg shadow-warning/20' : 'bg-muted-bg'}`}
              role="switch"
              aria-checked={systemFlags.ip_whitelisting}
              aria-label="Toggle IP Whitelisting"
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${systemFlags.ip_whitelisting ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-6 font-medium">
            Restrict system access to known corporate IP ranges. Highly recommended for production
            environments to prevent unauthorized login attempts.
          </p>
          <button className="text-[0.6rem] font-black text-warning uppercase tracking-widest hover:underline flex items-center gap-1">
            Manage Whitelist <Lock size={10} />
          </button>
        </div>

        {/* Session Isolation */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
                <RefreshCw
                  size={24}
                  className="group-hover:rotate-180 transition-transform duration-700"
                />
              </div>
              <div>
                <h3
                  className="text-base font-black text-text-primary uppercase tracking-tight"
                  title="Session Isolation"
                >
                  Concurrent Sessions
                </h3>
                <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">
                  Prevent multiple simultaneous logins.
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleFlag('session_isolation')}
              className={`w-12 h-6 rounded-full transition-all relative ${systemFlags.session_isolation ? 'bg-info shadow-lg shadow-info/20' : 'bg-muted-bg'}`}
              role="switch"
              aria-checked={systemFlags.session_isolation}
              aria-label="Toggle Session Isolation"
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${systemFlags.session_isolation ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-6 font-medium">
            Prevent multiple simultaneous logins for the same administrative credential. If enabled,
            a new login will invalidate any previous active sessions.
          </p>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted-bg/30 rounded-lg border border-border/50 text-info">
            <Shield size={12} />
            <span className="text-[0.65rem] font-bold uppercase tracking-widest">
              State Persistence Active
            </span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Key size={14} className="text-primary" /> Session Settings
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest">
                  Session Timeout (Minutes)
                </label>
                <div className="flex items-center gap-1 text-primary">
                  <Clock size={12} />
                  <span className="text-xs font-bold">{systemFlags.session_timeout || '30'}m</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="1440"
                step="5"
                value={systemFlags.session_timeout || '30'}
                onChange={(e) => handleValueChange('session_timeout', e.target.value)}
                className="w-full h-1.5 bg-muted-bg rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="Session Timeout Slider"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest">
                Password Requirements
              </label>
              <select
                value={systemFlags.password_complexity || 'Standard'}
                onChange={(e) => handleValueChange('password_complexity', e.target.value)}
                className="w-full bg-muted-bg border border-border/50 rounded-lg p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-primary transition-all appearance-none"
                aria-label="Password Complexity"
              >
                <option value="Basic">Basic (8 chars)</option>
                <option value="Standard">Standard (Mixed Case, 10 chars)</option>
                <option value="Advanced">Advanced (Mixed Case, Special, 12 chars)</option>
                <option value="Quantum">Quantum (Rotation every 30 days, 16+ chars)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Neural Options */}
      <div className="bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
            <RefreshCw size={16} className="text-primary animate-spin-slow" /> Advanced Security
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-[0.6rem] font-black text-primary uppercase tracking-widest">
              Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'neural_bypass',
              label: 'Security Bypass',
              desc: 'Allow bypassing strict security checks',
            },
            { id: 'api_caching', label: 'API Caching', desc: 'Secure local edge performance' },
            {
              id: 'immutable_logs',
              label: 'Secure Logs',
              desc: 'Tamper-proof audit logs',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 bg-muted-bg/30 rounded-xl border border-border/50 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-text-primary uppercase tracking-tighter">
                  {item.label}
                </p>
                <button
                  onClick={() => toggleFlag(item.id as any)}
                  className={`w-8 h-4 rounded-full transition-all relative ${systemFlags[item.id as keyof typeof systemFlags] ? 'bg-primary' : 'bg-border/50'}`}
                  role="switch"
                  aria-checked={systemFlags[item.id as keyof typeof systemFlags] as boolean}
                  aria-label={`Toggle ${item.label}`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${systemFlags[item.id as keyof typeof systemFlags] ? 'left-4.5' : 'left-0.5'}`}
                  />
                </button>
              </div>
              <p className="text-[0.6rem] text-text-muted font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
