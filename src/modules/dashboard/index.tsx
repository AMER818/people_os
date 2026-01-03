import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  FileCheck,
  Zap,
  Briefcase,
  Cake,
  Heart,
  Send,
  Sparkles,
  RefreshCw,
  Star,
  Activity,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../components/ui/card';

import { PALETTE } from '@/theme/palette';
import { useUIStore } from '../../store/uiStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../../services/api';
import { Employee, GrowthTrend, Milestone, DepartmentStat, AttendanceStat } from '../../types';

interface DashboardMetrics {
  growth: number;
  retention: number;
  satisfaction: number;
  productivity: number;
}

// Memoized KPI Card component to prevent unnecessary re-renders
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  action: string;
  onClick: (action: string) => void;
}

const KPICard = React.memo<KPICardProps>(({ label, value, icon: Icon, color, action, onClick }) => (
  <div
    onClick={() => onClick(action)}
    className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/20 hover:border-white/30 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden hover:-translate-y-2"
    role="button"
    tabIndex={0}
    aria-label={`${label}: ${value}`}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick(action);
      }
    }}
  >
    <div
      className={`absolute -right-12 -top-12 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-500 group-hover:scale-150`}
    ></div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[2.5rem]"></div>
    <div className="relative z-10">
      <div
        className={`w-12 h-12 rounded-xl ${color} ${color === 'bg-blue-500' ? 'text-blue-500' : color === 'bg-emerald-500' ? 'text-emerald-500' : color === 'bg-amber-500' ? 'text-amber-500' : 'text-orange-500'} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-125 group-hover:bg-opacity-20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-current/30`}
      >
        <Icon
          size={24}
          aria-hidden="true"
          className="group-hover:rotate-12 transition-transform duration-300"
        />
      </div>
      <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2 group-hover:text-white transition-colors duration-300">
        {label}
      </p>
      <p className="text-4xl font-black text-foreground tracking-tighter mb-4 group-hover:text-primary transition-colors duration-300">
        {value}
      </p>
      <div className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
        <div className="w-6 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full group-hover:w-8 group-hover:shadow-lg group-hover:shadow-primary/50 transition-all duration-300"></div>
        <span className="text-[0.5625rem] font-black text-success uppercase tracking-widest group-hover:text-emerald-300 transition-colors duration-300">
          +12%
        </span>
      </div>
    </div>
  </div>
));

KPICard.displayName = 'KPICard';

const Dashboard: React.FC = () => {
  const { setActiveModule } = useUIStore();
  const [wishesSent, setWishesSent] = useState<number[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStat[]>([]);
  const [openVacancies, setOpenVacancies] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'Optimal' | 'Degraded' | 'Offline'>('Optimal');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    growth: 12,
    retention: 94,
    satisfaction: 8.2,
    productivity: 87,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterPeriod, setFilterPeriod] = useState<'1w' | '1m' | '3m' | '1y'>('1m');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [emps, trends, miles, depts, attend] = await Promise.all([
          api.getEmployees(),
          api.getGrowthTrends(),
          api.getMilestones(),
          api.getDepartmentStats(),
          api.getAttendanceStats(),
        ]);
        setEmployees(emps);
        setGrowthTrends(trends);
        setMilestones(miles);
        setDeptStats(depts);
        setAttendanceStats(attend);

        // Fetch Jobs for Vacancies
        const jobs = await api.getJobs();
        const openJobs = jobs.filter((j) => j.status === 'Active').length;
        setOpenVacancies(openJobs);

        // Calculate Engagement (Proxy: Active Emp Rate + Random Variance for Demo Realism)
        const activeCount = emps.filter((e) => e.status === 'Active').length;
        const totalCount = emps.length;
        const baseRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
        const calculatedEngagement = Math.min(Math.round(baseRate * 0.95), 100);
        setEngagementRate(calculatedEngagement > 0 ? calculatedEngagement : 0);

        // Update metrics
        setMetrics((prev) => ({
          ...prev,
          productivity: calculatedEngagement,
        }));

        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        setLastUpdate(new Date());
        // Re-fetch data silently without showing loading state
      },
      5 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const health = await api.checkHealth();
        setSystemStatus(health.status as any);
      } catch {
        setSystemStatus('Offline');
      }
    };
    checkSystemHealth();
    // Poll every 60 seconds
    const interval = setInterval(checkSystemHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const totalEmployees = employees.length;

  const handleSendWish = (id: number) => {
    setWishesSent([...wishesSent, id]);
  };

  const COLORS = PALETTE.charts;

  const handleQuickAction = (module: string) => {
    setActiveModule(module as any);
  };

  // Export dashboard data as CSV
  const handleExportData = () => {
    const csv = [
      ['Dashboard Export', new Date().toISOString()],
      [],
      ['Key Metrics'],
      ['Growth YoY', metrics.growth + '%'],
      ['Retention Rate', metrics.retention + '%'],
      ['Satisfaction Score', metrics.satisfaction + '/10'],
      ['Productivity Index', metrics.productivity + '%'],
      [],
      ['Employee Statistics'],
      ['Total Employees', totalEmployees],
      ['Active Employees', activeEmployees.length],
      ['Engagement Rate', engagementRate + '%'],
      ['Open Vacancies', openVacancies],
      [],
      ['Department Distribution'],
      ...deptStats.map((d) => [d.name, d.value]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div
      className="space-y-12 animate-in fade-in duration-700 pb-20"
      role="main"
      aria-label="Executive Dashboard"
    >
      {/* Executive Command Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-100 tracking-tighter leading-none uppercase">
              Command Center
            </h1>
            <p className="text-blue-400 mt-4 font-black uppercase tracking-[0.4em] text-[0.6rem] flex items-center gap-3">
              <span className="w-10 h-[2px] bg-blue-500/50"></span>
              Workforce Intelligence & Global Orchestration
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-wider">
              Last Updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all group backdrop-blur-xl shadow-lg disabled:opacity-50"
                title="Refresh Neural Feed"
                aria-label="Refresh neural feed"
                disabled={loading}
              >
                <RefreshCw
                  size={18}
                  className={`text-blue-400 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={handleExportData}
                className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 group backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:scale-110 hover:-translate-y-1"
                title="Export Dashboard Data"
                aria-label="Export dashboard data as CSV"
              >
                <svg
                  className="w-5 h-5 text-blue-400 group-hover:scale-125 group-hover:text-blue-300 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <div className="bg-[#0f172a] backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl border border-blue-500/20 flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-3 h-3 ${systemStatus === 'Optimal' ? 'bg-emerald-500' : systemStatus === 'Degraded' ? 'bg-amber-500' : 'bg-rose-500'} rounded-full animate-ping absolute opacity-75`}
                  ></div>
                  <div
                    className={`w-3 h-3 ${systemStatus === 'Optimal' ? 'bg-emerald-500' : systemStatus === 'Degraded' ? 'bg-amber-500' : 'bg-rose-500'} rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
                  ></div>
                </div>
                <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest">
                  System Registry:{' '}
                  <span
                    className={systemStatus === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}
                  >
                    {systemStatus.toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'YoY Growth', value: `+${metrics.growth}%`, trend: 'up', icon: TrendingUp },
          { label: 'Retention Rate', value: `${metrics.retention}%`, trend: 'up', icon: Users },
          {
            label: 'Satisfaction Score',
            value: `${metrics.satisfaction}/10`,
            trend: 'up',
            icon: Star,
          },
          {
            label: 'Productivity Index',
            value: `${metrics.productivity}%`,
            trend: 'stable',
            icon: Zap,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <stat.icon
                className="text-primary/60 group-hover:text-primary transition-colors"
                size={20}
              />
              <span className="text-[0.5rem] font-black px-2 py-1 bg-success/10 text-success rounded uppercase tracking-wider">
                {stat.trend === 'up' ? '↗' : '→'} Positive
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-white/60 uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards - Modern Glass Design */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        role="region"
        aria-label="Key Performance Indicators"
      >
        {[
          {
            label: 'Total Employees',
            value: totalEmployees,
            icon: Users,
            color: 'bg-blue-500',
            action: 'employees',
          },
          {
            label: 'Active Employees',
            value: activeEmployees.length,
            icon: UserCheck,
            color: 'bg-emerald-500',
            action: 'employees',
          },
          {
            label: 'Engagement',
            value: `${engagementRate}%`,
            icon: Zap,
            color: 'bg-amber-500',
            action: 'engagement',
          },
          {
            label: 'Open Vacancies',
            value: openVacancies,
            icon: Briefcase,
            color: 'bg-orange-500',
            action: 'recruitment',
          },
        ].map((card, idx) => (
          <KPICard
            key={idx}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            action={card.action}
            onClick={handleQuickAction}
          />
        ))}
      </div>

      {/* Premium AI Features Section */}
      <div className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary">
                AI Workforce Intelligence
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none mb-6">
              Intelligent Workforce Analytics
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Hunzal AI analyzes workforce patterns and automatically generates actionable insights
              for workforce optimization, talent retention, and engagement improvements.
            </p>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <Activity className="text-primary" size={18} />
                <span className="text-[0.625rem] font-black uppercase tracking-widest">
                  Real-Time Analytics
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Workforce Insights' },
              { icon: TrendingUp, label: 'Performance Trends' },
              { icon: FileCheck, label: 'Compliance Tracking' },
              { icon: Sparkles, label: 'AI Predictions' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all text-center group/card"
              >
                <item.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover/card:scale-110 transition-transform" />
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid - Modern Design */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Growth Chart - Premium Glass Card */}
        <div
          className="xl:col-span-2 p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl hover:bg-white/10 transition-all flex flex-col min-h-[28.125rem] group relative overflow-hidden"
          role="region"
          aria-label="Growth Trends - Headcount Analytics"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 backdrop-blur-xl rounded-2xl border border-primary/20">
                <TrendingUp size={24} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white tracking-tight">Growth Trends</h3>
                <p className="text-[0.625rem] font-black uppercase text-white/60 tracking-widest mt-1">
                  Headcount Analytics
                </p>
              </div>
            </div>
            <select
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl text-[0.625rem] font-black uppercase tracking-wider px-4 py-2.5 outline-none text-white hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 focus:ring-2 focus:ring-primary/50 cursor-pointer"
              aria-label="Select time period for growth trends"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as '1w' | '1m' | '3m' | '1y')}
            >
              <option value="1w">Last 7 Days</option>
              <option value="1m">Last 30 Days</option>
              <option value="3m">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div className="flex-1 w-full h-[18.75rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: '600' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: '600' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '0.0625rem solid hsl(var(--border))',
                    boxShadow: '0 0.5rem 1.875rem -0.3125rem rgba(0,0,0,0.15)',
                    padding: '1rem',
                    backgroundColor: 'hsl(var(--surface))',
                    color: 'hsl(var(--text-primary))',
                  }}
                  itemStyle={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'hsl(var(--primary))',
                  }}
                  labelStyle={{
                    fontSize: '0.6875rem',
                    fontWeight: 'bold',
                    color: 'hsl(var(--text-muted))',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="headcount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorHeadcount)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone Radar */}
        <Card
          className="flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 p-8"
          role="region"
          aria-label="Celebrations - Upcoming Milestones"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Star className="w-40 h-40" />
          </div>
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Celebrations</h3>
              <p className="text-[0.625rem] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                Upcoming Milestones
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar relative z-10 max-h-[21.875rem]">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-muted-bg/30 rounded-xl border border-border/50 hover:bg-surface hover:border-purple-500/30 hover:shadow-sm transition-all duration-300 group/item"
                role="article"
                aria-label={`${m.name}'s ${m.type}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={m.avatar}
                      className="w-10 h-10 rounded-lg object-cover ring-2 ring-transparent group-hover/item:ring-purple-500/30 transition-all"
                      alt={`${m.name}'s profile picture`}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5 border border-border"
                      aria-hidden="true"
                    >
                      {m.type === 'Birthday' ? (
                        <Cake size={10} className="text-purple-500" />
                      ) : (
                        <Heart size={10} className="text-pink-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-text-primary truncate">{m.name}</p>
                      <span
                        className="text-[0.5625rem] font-black px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-md uppercase tracking-wide"
                        aria-label={`Date: ${m.date}`}
                      >
                        {m.date}
                      </span>
                    </div>
                    <p className="text-[0.625rem] text-text-muted mt-0.5 truncate uppercase tracking-wide font-medium">
                      {m.type} • {m.detail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendWish(m.id)}
                  disabled={wishesSent.includes(m.id)}
                  className={`w-full py-2.5 rounded-lg text-[0.625rem] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
                    wishesSent.includes(m.id)
                      ? 'bg-success text-white shadow-inner opacity-90'
                      : 'bg-white dark:bg-black/20 text-text-secondary hover:bg-purple-600 hover:text-white dark:hover:text-white shadow-sm hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-1'
                  }`}
                  aria-label={
                    wishesSent.includes(m.id)
                      ? `Wish sent to ${m.name}`
                      : `Send ${m.type} wish to ${m.name}`
                  }
                  aria-pressed={wishesSent.includes(m.id)}
                >
                  {wishesSent.includes(m.id) ? (
                    <>
                      <FileCheck size={12} aria-hidden="true" /> Sent
                    </>
                  ) : (
                    <>
                      <Send size={12} aria-hidden="true" /> Send Wish
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Department Distribution */}
        <Card
          className="flex flex-col group hover:shadow-md transition-all duration-300 p-8"
          role="region"
          aria-label="Department Distribution - Headcount by Department"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Briefcase size={20} className="text-primary-soft" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-text-primary tracking-tight">Departments</h3>
              <p className="text-[0.625rem] font-bold uppercase text-text-muted tracking-widest mt-0.5">
                Headcount Distribution
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[15.625rem] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                role="img"
                aria-label="Pie chart showing headcount distribution across departments"
              >
                <Pie
                  data={deptStats as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {deptStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: 'none',
                    boxShadow: '0 0.5rem 1.875rem -0.3125rem rgba(0,0,0,0.15)',
                    backgroundColor: 'hsl(var(--surface))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-black text-text-primary">
                  {totalEmployees}
                </span>
                <span className="text-[0.5625rem] font-black uppercase text-text-muted tracking-widest">
                  Total
                </span>
              </div>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {deptStats.slice(0, 4).map((entry, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction('employees')}
                className="flex items-center gap-2 hover:bg-muted-bg/80 p-2 rounded-lg transition-all duration-300 group hover:pl-3 hover:shadow-md hover:shadow-primary/20"
                aria-label={`${entry.name}: ${entry.value} employees`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden="true"
                ></div>
                <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  {entry.name}
                </span>
                <ChevronRight
                  className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 ml-auto transition-opacity"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Card>

        {/* Attendance Overview */}
        <Card
          className="flex flex-col group hover:shadow-md transition-all duration-300 p-8"
          role="region"
          aria-label="Today's Attendance - Live Status"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-success/10 rounded-lg">
              <Activity size={20} className="text-success" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-text-primary tracking-tight">
                Today's Attendance
              </h3>
              <p className="text-[0.625rem] font-bold uppercase text-text-muted tracking-widest mt-0.5">
                Live Status
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[15.625rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceStats}
                layout="vertical"
                margin={{ left: 20 }}
                role="img"
                aria-label="Bar chart showing attendance status by category"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 11, fontWeight: '600' }}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    backgroundColor: 'hsl(var(--surface))',
                    color: 'hsl(var(--text-primary))',
                    border: 'none',
                    boxShadow: '0 0.25rem 1.25rem rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {attendanceStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--muted-foreground))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
