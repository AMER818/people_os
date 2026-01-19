import React from 'react';
import { TrendingUp, Zap, Target, ArrowUpRight } from 'lucide-react';
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

const FORECAST_DATA = [
  { month: 'Jan', actual: 4000, forecast: 4000 },
  { month: 'Feb', actual: 3000, forecast: 3000 },
  { month: 'Mar', actual: 2000, forecast: 2000 },
  { month: 'Apr', actual: 2780, forecast: 2780 },
  { month: 'May', actual: 1890, forecast: 1890 },
  { month: 'Jun', actual: 2390, forecast: 2390 },
  { month: 'Jul', actual: null, forecast: 3490 },
  { month: 'Aug', actual: null, forecast: 4200 },
  { month: 'Sep', actual: null, forecast: 4800 },
];

const ForecastingMatrix: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Predictive Growth Matrix"
      className="bg-card rounded-[2rem] p-8 border border-border shadow-2xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary-soft rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Predictive Growth Matrix
            </h3>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-1">
              AI Forecasting • 98.4% Confidence
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-success/10 text-emerald-600 rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} /> AI Optimized
          </div>
        </div>
      </div>

      <div className="h-[21.875rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
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
                borderRadius: '1rem',
                color: PALETTE.tooltipText,
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={PALETTE.primary}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke={PALETTE.success}
              strokeWidth={4}
              strokeDasharray="10 10"
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Projected Yield', val: '+24.8%', icon: ArrowUpRight, color: 'emerald' },
          { label: 'Efficiency Delta', val: '+12.4%', icon: Zap, color: 'indigo' },
          { label: 'Target Alignment', val: '94%', icon: Target, color: 'rose' },
        ].map((stat, i) => (
          <div
            key={i}
            role="status"
            aria-label={`${stat.label}: ${stat.val}`}
            className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon size={16} className={`text-${stat.color}-500`} />
              <span className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {stat.val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastingMatrix;
