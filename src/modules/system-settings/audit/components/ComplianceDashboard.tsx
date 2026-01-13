import React, { useState } from 'react';
import {
  ShieldCheck,
  FileArchive,
  CheckCircle2,
  XCircle,
  Download,
  Lock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@components/ui/Toast';

export const ComplianceDashboard: React.FC = () => {
  const [standard, setStandard] = useState<'SOC2' | 'ISO27001'>('SOC2');
  const [isCollecting, setIsCollecting] = useState(false);
  const { success, error } = useToast();

  const controls = {
    SOC2: [
      {
        id: 'CC6.1',
        name: 'Logical Access',
        status: 'pass',
        description: 'RBAC and MFA enforcement across all layers.',
      },
      {
        id: 'CC7.1',
        name: 'Monitoring',
        status: 'pass',
        description: 'Continuous health and security monitoring.',
      },
      {
        id: 'CC2.1',
        name: 'Communication',
        status: 'warn',
        description: 'Internal security policy dissemination.',
      },
    ],
    ISO27001: [
      {
        id: 'A.12.1.2',
        name: 'Change Management',
        status: 'pass',
        description: 'Documented CI/CD and audit gates.',
      },
      {
        id: 'A.9.2.2',
        name: 'User Provisioning',
        status: 'pass',
        description: 'Standardized employee onboarding.',
      },
    ],
  };

  const collectEvidence = async () => {
    setIsCollecting(true);
    try {
      // In a real implementation, this would call the EvidenceCollector on backend
      // For now, we simulate the request
      setTimeout(() => {
        success('Evidence package generated! (Simulated)');
        setIsCollecting(false);
      }, 2000);
    } catch (err) {
      error('Failed to collect evidence');
      setIsCollecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck size={28} className="text-primary" />
            Compliance Mode
          </h3>
          <div role="status" aria-label="Compliance Status" className="hidden">
            Audit Active
          </div>
          <p className="text-sm text-text-muted mt-1">
            Audit-ready control matrices and immutable evidence logs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStandard('SOC2')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${standard === 'SOC2' ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}
          >
            SOC2 Type II
          </button>
          <button
            onClick={() => setStandard('ISO27001')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${standard === 'ISO27001' ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}
          >
            ISO 27001:2022
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {controls[standard].map((control) => (
            <div
              key={control.id}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[0.625rem] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                      {control.id}
                    </span>
                    <h4 className="font-bold text-text-primary">{control.name}</h4>
                  </div>
                  <p className="text-sm text-text-muted">{control.description}</p>
                </div>
                <div className="flex flex-col items-end gap-3 text-right">
                  {control.status === 'pass' ? (
                    <span className="flex items-center gap-1 text-xs font-black text-success uppercase">
                      <CheckCircle2 size={14} /> Compliant
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-black text-warning uppercase">
                      <XCircle size={14} /> Warning
                    </span>
                  )}
                  <button className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                    View Signals <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-3xl -mr-8 -mt-8" />
            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight mb-4 flex items-center gap-2">
              <FileArchive size={18} className="text-primary" />
              Evidence Vault
            </h4>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">
              Generate tamper-proof evidence packages containing signed audit logs, system
              snapshots, and control verification reports.
            </p>
            <button
              onClick={collectEvidence}
              disabled={isCollecting}
              className="w-full py-3 bg-text-primary text-background rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            >
              {isCollecting ? <LoadingSpinner size={16} /> : <Download size={16} />}
              Collection Package
            </button>
            <div className="mt-4 flex items-center gap-2 text-[0.625rem] text-text-muted font-black uppercase">
              <Lock size={12} /> SHA-256 Signatures Enabled
            </div>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-8">
            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight mb-4">
              Verification Policy
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="text-xs text-text-primary">Continuous automated polling</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="text-xs text-text-primary">Immutable snapshot history</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="text-xs text-text-primary">External auditor access (read-only)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ size }: { size: number }) => (
  <div className="animate-spin" style={{ width: size, height: size }}>
    <RefreshCw size={size} />
  </div>
);
