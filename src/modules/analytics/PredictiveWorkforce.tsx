import React from 'react';
import { Users, Target, Zap } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PALETTE } from '@/theme/palette';

const data = [
  { month: 'Jan', current: 400, predicted: 400 },
  { month: 'Feb', current: 420, predicted: 430 },
  { month: 'Mar', current: 450, predicted: 460 },
  { month: 'Apr', current: 440, predicted: 480 },
  { month: 'May', current: 480, predicted: 510 },
  { month: 'Jun', current: 510, predicted: 550 },
  { month: 'Jul', current: null, predicted: 590 },
  { month: 'Aug', current: null, predicted: 630 },
  { month: 'Sep', current: null, predicted: 680 },
];

const PredictiveWorkforce: React.FC = () => {
  const [prediction, setPrediction] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handlePredict = async () => {
    setLoading(true);
    // Mock data for AI analysis
    const mockWorkforceData = {
      currentHeadcount: 450,
      avgTenure: '2.4 years',
      recentExits: 12,
      engagementScore: 78,
      openPositions: 15,
    };

    // Dynamic import to avoid circular dependencies if any
    const { predictTurnover } = await import('../../services/geminiService');
    const result = await predictTurnover(mockWorkforceData);

    if (result) {
      setPrediction(result);
    }
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-[2rem] p-12 shadow-2xl border border-border relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[7.5rem] rounded-full -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Predictive Workforce Growth
            </h3>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-ping' : 'bg-primary animate-pulse'}`}
              ></span>
              AI Projection Engine v4.2
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[0.625rem] tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              aria-label="Run projection analysis"
            >
              {loading ? 'Analyzing...' : 'Run Projection'}
            </button>
            <div className="px-6 py-3 bg-muted rounded-2xl border border-border">
              <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-1">
                Confidence Score
              </p>
              <p className="text-xl font-black text-primary">94.2%</p>
            </div>
          </div>
        </div>

        <div className="h-[25rem] w-full mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.grid} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: PALETTE.axis, fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: PALETTE.axis, fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: PALETTE.tooltipBg,
                  border: 'none',
                  borderRadius: '1.5rem',
                  padding: '1.25rem',
                  boxShadow: '0 1.5625rem 3.125rem -0.75rem rgba(0,0,0,0.5)',
                }}
                itemStyle={{
                  color: PALETTE.tooltipText,
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                }}
                labelStyle={{
                  color: PALETTE.axis,
                  fontSize: '0.625rem',
                  fontWeight: '900',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                }}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke={PALETTE.primary} // Blue
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorCurrent)"
                dot={{ r: 6, fill: PALETTE.primary, strokeWidth: 4, stroke: PALETTE.white }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke={PALETTE.themes.quartz}
                strokeWidth={4}
                strokeDasharray="10 10"
                fillOpacity={1}
                fill="url(#colorPredicted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            role="status"
            aria-label="Projected Headcount"
            className="p-8 bg-muted rounded-[2rem] border border-border group/card hover:bg-primary transition-all duration-500"
          >
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover/card:scale-110 transition-transform">
              <Users className="text-primary" size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover/card:text-blue-100">
              Projected Headcount
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white group-hover/card:text-white">
              {prediction ? `+${prediction.headcountGrowth}` : '+170 Employees'}
            </p>
            <p className="text-[0.625rem] font-bold text-slate-400 mt-2 group-hover/card:text-blue-200">
              By Q4 2025
            </p>
          </div>

          <div
            role="status"
            aria-label="Retention Probability"
            className="p-8 bg-muted rounded-[2rem] border border-border group/card hover:bg-primary-soft transition-all duration-500"
          >
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover/card:scale-110 transition-transform">
              <Target className="text-primary-soft" size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover/card:text-indigo-100">
              Retention Probability
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white group-hover/card:text-white">
              {prediction ? `${prediction.retentionProb}%` : '88.4%'}
            </p>
            <p className="text-[0.625rem] font-bold text-slate-400 mt-2 group-hover/card:text-indigo-200">
              Stability Score
            </p>
          </div>

          <div
            role="status"
            aria-label="Efficiency Delta"
            className="p-8 bg-muted rounded-[2rem] border border-border group/card hover:bg-success transition-all duration-500"
          >
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover/card:scale-110 transition-transform">
              <Zap className="text-emerald-600" size={24} />
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2 group-hover/card:text-emerald-200">
              Efficiency Delta
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white group-hover/card:text-white">
              {prediction ? `+${prediction.efficiencyDelta}%` : '+12.5%'}
            </p>
            <p className="text-[0.625rem] font-bold text-slate-400 mt-2 group-hover/card:text-emerald-200">
              Projected Optimization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveWorkforce;
