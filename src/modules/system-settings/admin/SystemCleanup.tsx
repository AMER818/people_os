import React, { useState } from 'react';
import {
  Play,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Database,
  Trash2,
  HardDrive,
  Code,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { useToast } from '@components/ui/Toast';
import { API_CONFIG } from '@/config/constants';

const CLEANERS = [
  {
    id: 'LogCleaner',
    label: 'Log Cleaner',
    description: 'Removes old log files (>30 days)',
    icon: FileText,
  },
  {
    id: 'TempFileCleaner',
    label: 'Temp File Cleaner',
    description: 'Cleans /tmp, /cache and system caches',
    icon: Trash2,
  },
  {
    id: 'DatabaseCleaner',
    label: 'Database Cleaner',
    description: 'Prunes old audit logs and orphaned records',
    icon: Database,
  },
  {
    id: 'LocalStorageCleaner',
    label: 'Local Storage Cleaner',
    description: 'Manages backup retention',
    icon: HardDrive,
  },
  {
    id: 'CodeCleaner',
    label: 'Code Cleaner',
    description: 'Removes .pyc, __pycache__ and other artifacts',
    icon: Code,
  },
  {
    id: 'ConflictCleaner',
    label: 'Conflict Cleaner',
    description: 'Resolves git merge conflicts/artifacts',
    icon: AlertTriangle,
  },
];

export const SystemCleanup: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [selectedCleaners, setSelectedCleaners] = useState<string[]>(CLEANERS.map((c) => c.id));
  const [lastReport, setLastReport] = useState<any>(null);

  const toggleCleaner = (id: string) => {
    setSelectedCleaners((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleRunCleanup = async () => {
    if (selectedCleaners.length === 0) {
      toastError('Please select at least one cleaner.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = API_CONFIG.BASE_URL;
      const response = await fetch(`${API_URL}/system/cleanup/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dry_run: dryRun,
          cleaners: selectedCleaners,
        }),
      });

      if (!response.ok) {
        throw new Error('Cleanup failed');
      }

      const data = await response.json();
      setLastReport(data);
      success(`Cleanup completed. Reclaimed ${data.total_reclaimed_mb.toFixed(2)} MB`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Controls Card */}
        <div className="flex-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Cleanup Operations</h3>
                <p className="text-sm text-text-muted">Select maintenance tasks to run.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className={dryRun ? 'text-primary font-bold' : 'text-text-muted'}>
                    Dry Run Mode
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {CLEANERS.map((cleaner) => {
                const isSelected = selectedCleaners.includes(cleaner.id);
                return (
                  <div
                    key={cleaner.id}
                    onClick={() => toggleCleaner(cleaner.id)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-muted-bg/30 border-border hover:border-primary/50'
                    }`}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCleaner(cleaner.id);
                      }
                    }}
                    aria-label={`Select ${cleaner.label}`}
                  >
                    <div
                      className={`p-2 rounded-md ${isSelected ? 'bg-primary text-white' : 'bg-muted-bg text-text-muted'}`}
                    >
                      <cleaner.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-text-primary'}`}
                        >
                          {cleaner.label}
                        </h4>
                        {isSelected && <CheckCircle size={14} className="text-primary" />}
                      </div>
                      <p className="text-xs text-text-muted mt-1">{cleaner.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setSelectedCleaners(CLEANERS.map((c) => c.id))}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                onClick={handleRunCleanup}
                disabled={loading || selectedCleaners.length === 0}
                className="min-w-[140px]"
              >
                {loading ? (
                  <RotateCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Play className="mr-2" size={16} />
                )}
                {loading ? 'Running...' : 'Run Selected'}
              </Button>
            </div>
          </div>
        </div>

        {/* Report Card */}
        <div className="w-full md:w-[400px]">
          <Card className="h-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-[3rem] hover:bg-white/10 transition-all">
            <CardHeader>
              <CardTitle>Execution Report</CardTitle>
            </CardHeader>
            <CardContent>
              {!lastReport ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-text-muted opacity-50">
                  <ActivityIcon />
                  <p className="mt-4 text-sm font-mono">Ready to verify</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted-bg rounded-lg">
                    <span className="text-sm font-medium text-text-muted">Total Reclaimed</span>
                    <span className="text-2xl font-mono font-bold text-success">
                      {lastReport.total_reclaimed_mb.toFixed(2)}{' '}
                      <span className="text-xs text-text-muted">MB</span>
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {lastReport.cleaner_results.map((res: any, idx: number) => (
                      <div key={idx} className="border-b border-border pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-text-primary">
                            {res.cleaner_name}
                          </span>
                          {res.success ? (
                            <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full">
                              PASS
                            </span>
                          ) : (
                            <span className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                              FAIL
                            </span>
                          )}
                        </div>
                        {res.actions.length === 0 ? (
                          <p className="text-xs text-text-muted italic">No actions needed.</p>
                        ) : (
                          <ul className="space-y-1">
                            {res.actions.map((action: any, aIdx: number) => (
                              <li key={aIdx} className="text-xs flex items-start gap-2">
                                <span
                                  className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    action.status === 'Executed'
                                      ? 'bg-success'
                                      : action.status === 'Pending'
                                        ? 'bg-warning'
                                        : 'bg-text-muted'
                                  }`}
                                />
                                <span className="text-text-secondary">{action.description}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {res.error && (
                          <p className="text-xs text-danger mt-1 bg-danger/5 p-2 rounded">
                            {res.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border text-[10px] font-mono text-text-muted flex justify-between">
                    <span>ID: {lastReport.id.substring(0, 16)}...</span>
                    <span>{lastReport.dry_run ? 'DRY RUN' : 'EXECUTED'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);
