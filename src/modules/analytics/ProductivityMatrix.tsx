import React from 'react';
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
import { RefreshCw } from 'lucide-react';

interface ProductivityMatrixProps {
  data: any[];
}

const ProductivityMatrix: React.FC<ProductivityMatrixProps> = ({ data }) => {
  return (
    <div
      role="region"
      aria-label="Productivity Matrix Chart"
      className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col min-h-[31.25rem]"
    >
      <div className="p-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-3xl">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
            Productivity Matrix
          </h3>
          <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-3">
            <RefreshCw size={12} className="animate-spin-slow text-info" /> Weekly Performance
            Trends
          </p>
        </div>
        <div className="flex gap-8">
          {[
            { label: 'Engagement', color: 'bg-primary' },
            { label: 'Output', color: 'bg-primary-soft' },
            { label: 'Sentiment', color: 'bg-success' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${l.color} shadow-lg shadow-info/20`}></div>
              <span className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={PALETTE.grid}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: PALETTE.axis, fontSize: 11, fontWeight: '900' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: PALETTE.axis, fontSize: 11, fontWeight: '900' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '1.5rem',
                border: 'none',
                boxShadow: '0 2.5rem 6.25rem -1.25rem rgba(0,0,0,0.2)',
                padding: '1.25rem',
                fontWeight: 'bold',
                backgroundColor: PALETTE.tooltipBg,
                color: PALETTE.tooltipText,
              }}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke={PALETTE.primary}
              strokeWidth={6}
              fill="url(#colorEng)"
            />
            <Area
              type="monotone"
              dataKey="productivity"
              stroke="hsl(var(--primary))"
              strokeWidth={6}
              fill="url(#colorProd)"
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke={PALETTE.success}
              strokeWidth={6}
              fill="url(#colorSent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityMatrix;
