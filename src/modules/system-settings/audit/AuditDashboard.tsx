import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  TrendingUp,
  LayoutDashboard,
  Search,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  RefreshCw,
  Play,
  AlertTriangle,
  Clock,
  Settings as Config,
} from 'lucide-react';
import { Tabs } from '../../../components/ui/Tabs';
import { TrendAnalysis } from './components/TrendAnalysis';
import { FindingsExplorer } from './components/FindingsExplorer';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';
import { HealthRadar } from './components/HealthRadar';
import { SystemLogViewer } from './components/SystemLogViewer';
import { formatDate, formatTime } from '../../../utils/formatting';

const AUDIT_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'findings', label: 'Findings', icon: Search },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'logs', label: 'System Logs', icon: Clock },
];

interface AuditReport {
  id: string;
  overall_score: number;
  risk_level: string;
  critical_count: number;
  major_count: number;
  minor_count: number;
  execution_time_seconds: number;
  created_at: string;
  dimension_scores: any[];
  critical_findings: any[];
  major_findings: any[];
  minor_findings: any[];
}

export const AuditDashboard: React.FC = () => {
  const [view, setView] = useState<'overview' | 'trends' | 'findings' | 'compliance' | 'logs'>(
    'overview'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [latestReport, setLatestReport] = useState<AuditReport | null>(null);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [regressions, setRegressions] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [diffData, setDiffData] = useState<any>(null);
  const { success, error } = useToast();

  // ... existing loading logic ...

  const loadDiff = async (comparisonId: string) => {
    if (!latestReport) {
      return;
    }
    try {
      // Compare chosen historic report (base) vs latest (comp)
      // Or typically Compare Latest vs Previous.
      // In the UI we let user pick a historic report to see how it differs from NOW.
      // So Base = Historic, Comp = Latest
      const response = await api.get(
        `/ system / audit / diff / ${comparisonId}/${latestReport.id}`
      );
      setDiffData(response.data);
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [reportsRes, regressionsRes] = await Promise.all([
        api.get('/system/audit/history'),
        api.get('/system/audit/regressions'),
      ]);

      const history = reportsRes.data.history || [];
      setReports(history);
      setRegressions(regressionsRes.data.alerts || []);

      if (history.length > 0) {
        const latestRun = await api.get(`/system/audit/reports/${history[0].id}`);
        setLatestReport(latestRun.data.report);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const response = await api.post('/system/audit/run');
      success(
        `Audit complete! Score: ${response.data.overall_score}/5.0 | Risk: ${response.data.risk_level}`
      );
      await loadDashboardData();
    } catch (err: any) {
      error(err.response?.data?.detail || 'Audit execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const viewReport = async (reportId: string) => {
    try {
      const response = await api.get(`/system/audit/reports/${reportId}`);
      setReportContent(response.data.markdown || response.data.content);
      setSelectedReport(reportId);
    } catch {
      // Ignore error
    }
  };

  const acknowledgeFinding = async (findingId: string) => {
    try {
      await api.post(`/system/audit/findings/${findingId}/acknowledge`, {
        note: 'Acknowledged via Audit Dashboard',
      });
      success('Finding acknowledged');
    } catch {
      // Ignore error
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'high':
        return 'text-danger';
      case 'critical':
        return 'text-danger';
      default:
        return 'text-text-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) {
      return 'text-success';
    }
    if (score >= 3.0) {
      return 'text-warning';
    }
    return 'text-danger';
  };

  if (selectedReport && reportContent) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedReport(null);
              setReportContent('');
            }}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold hover:border-primary transition-colors flex items-center gap-2"
            aria-label="Return to dashboard overview"
          >
            ← Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
              aria-label="Export report as PDF"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
          <div>
            <button
              onClick={() => setIsComparing(true)}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
              aria-label="Compare reports"
            >
              <TrendingUp size={16} />
              Compare Reports
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed">
              {reportContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-surface/30 border border-dashed border-border rounded-3xl animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Shield size={48} className="text-primary opacity-50" />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">
          Ready to Audit
        </h3>
        <p className="text-text-muted">Start a new audit to check system health.</p>
      </div>
      <button
        onClick={runAudit}
        disabled={isRunning}
        className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        aria-label="Start your first system audit"
      >
        {isRunning ? (
          <RefreshCw size={20} className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        Start Audit
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Regression Alerts */}
      {regressions.length > 0 && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-danger" size={24} />
            <div>
              <div className="font-black text-danger text-sm uppercase tracking-wider">
                Health Drop Detected
              </div>
              <div className="text-xs text-danger/80">
                {regressions.length} metrics have dropped since last run.
              </div>
            </div>
          </div>
          <button
            onClick={() => setView('trends')}
            className="px-4 py-2 bg-danger text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-danger/90 transition-all"
            aria-label="Investigate regression alerts"
          >
            Investigate
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
            System Audit
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-md font-black tracking-widest uppercase">
              Beta
            </span>
          </h2>
          <p className="text-sm text-text-muted mt-1">Comprehensive system health analysis</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Tabs tabs={AUDIT_TABS} activeTab={view} onTabChange={(id) => setView(id as any)} />

        <button
          onClick={() => {
            const frequency = prompt(
              'Enter schedule frequency (daily, weekly, or interval in minutes):',
              'daily'
            );
            if (frequency) {
              api
                .post('/system/audit/schedule', { cron_expression: frequency })
                .then(() => success(`Schedule updated to: ${frequency}`))
                .catch(() => error('Failed to update schedule'));
            }
          }}
          className="px-6 py-2 bg-surface border border-border rounded-xl font-bold uppercase tracking-widest text-xs hover:border-primary transition-colors flex items-center gap-2"
        >
          <Clock size={14} />
          <span>Schedule</span>
        </button>

        <button
          onClick={runAudit}
          disabled={isRunning}
          className={`
                            px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg flex-shrink-0
                            ${
                              isRunning
                                ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary via-indigo-500 to-purple-600 text-white hover:shadow-primary/50 hover:scale-105 active:scale-95'
                            }
                        `}
          aria-label={isRunning ? 'Audit in progress' : 'Start Full System Audit'}
        >
          {isRunning ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>Start Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      {!latestReport && view !== 'compliance' ? (
        renderEmptyState()
      ) : (
        <>
          {view === 'overview' && latestReport && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-3xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getScoreColor(latestReport.overall_score)} bg-current/10`}
                    >
                      <Activity size={24} className="text-current" />
                    </div>
                    <div>
                      <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                        Health Score
                      </div>
                      <div
                        className={`text-3xl font-black ${getScoreColor(latestReport.overall_score)}`}
                      >
                        {latestReport.overall_score}/5.0
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getRiskColor(latestReport.risk_level)} bg-current/10`}
                    >
                      <Shield size={24} className="text-current" />
                    </div>
                    <div>
                      <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                        Risk Level
                      </div>
                      <div
                        className={`text-2xl font-black ${getRiskColor(latestReport.risk_level)} uppercase`}
                      >
                        {latestReport.risk_level}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center h-full">
                    <div className="space-y-1">
                      <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                        Critical Issues
                      </div>
                      <div className="text-2xl font-black text-danger">
                        {latestReport.critical_count}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="space-y-1">
                      <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                        Major Issues
                      </div>
                      <div className="text-2xl font-black text-warning">
                        {latestReport.major_count}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="space-y-1">
                      <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                        Minor Issues
                      </div>
                      <div className="text-2xl font-black text-text-primary">
                        {latestReport.minor_count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <HealthRadar data={latestReport.dimension_scores} />

                {/* Recent History */}
                <div className="bg-surface border border-border rounded-3xl p-8">
                  <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-6 flex items-center gap-3">
                    <Config size={20} className="text-primary" />
                    Recent Audits
                  </h3>

                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <button
                        key={report.id}
                        onClick={() => viewReport(report.id)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/40 cursor-pointer transition-all bg-background/30 hover:bg-background/60 text-left"
                        aria-label={`View report from ${formatDate(report.created_at)} with score ${report.overall_score}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreColor(report.overall_score)} bg-current/10`}
                          >
                            <span className="text-sm font-black text-current">
                              {report.overall_score}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatDate(report.created_at)}
                            </div>
                            <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                              {report.risk_level} Risk •{' '}
                              {report.critical_count + report.major_count} Issues
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight size={16} className="text-text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {view === 'trends' && (
            <div className="w-full">
              <TrendAnalysis />
            </div>
          )}

          {view === 'findings' && latestReport && (
            <FindingsExplorer
              findings={[
                ...latestReport.critical_findings.map((f) => ({ ...f, severity: 'Critical' })),
                ...latestReport.major_findings.map((f) => ({ ...f, severity: 'Major' })),
                ...latestReport.minor_findings.map((f) => ({ ...f, severity: 'Minor' })),
              ]}
              onAcknowledge={acknowledgeFinding}
            />
          )}

          {view === 'compliance' && <ComplianceDashboard />}

          {view === 'logs' && <SystemLogViewer />}
        </>
      )}

      {/* Comparison Modal */}
      {isComparing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setIsComparing(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              aria-label="Close comparison modal"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black uppercase mb-6">Compare Audit Runs</h3>

            {!diffData ? (
              <div className="space-y-4">
                <p>Select a report to compare with the latest:</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {reports.slice(1).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => loadDiff(r.id)}
                      className="w-full text-left p-3 rounded-xl border border-border hover:bg-primary/5 transition-colors flex justify-between"
                      aria-label={`Select report from ${formatDate(r.created_at)} ${formatTime(r.created_at)}`}
                    >
                      <span>
                        {formatDate(r.created_at)} {formatTime(r.created_at)}
                      </span>
                      <span className={getScoreColor(r.overall_score)}>{r.overall_score}/5.0</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl">
                  <div>
                    <div className="text-sm text-text-muted uppercase font-bold">Score Change</div>
                    <div
                      className={`text-3xl font-black ${diffData.score_delta >= 0 ? 'text-success' : 'text-danger'}`}
                    >
                      {diffData.score_delta > 0 ? '+' : ''}
                      {diffData.score_delta}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-muted uppercase font-bold">New Issues</div>
                    <div
                      className={`text-xl font-black ${diffData.new_issues_count > 0 ? 'text-danger' : 'text-success'}`}
                    >
                      {diffData.new_issues_count}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-muted uppercase font-bold">Resolved</div>
                    <div className="text-xl font-black text-success">
                      {diffData.resolved_issues_count}
                    </div>
                  </div>
                </div>

                {diffData.new_issues.length > 0 && (
                  <div>
                    <h4 className="font-bold text-danger mb-2">New Issues Detected:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {diffData.new_issues.map((issue: string) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setDiffData(null)}
                  className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20"
                >
                  Select Different Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
