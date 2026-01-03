import React from 'react';
import { History } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PayrollChartProps {
  data: { month: string; amount: number }[];
}

const PayrollChart: React.FC<PayrollChartProps> = ({ data }) => {
  return (
    <div role="img" aria-label="Fiscal Velocity Chart" className="bg-surface p-12 rounded-md border border-border shadow-md min-h-[28.125rem] flex flex-col">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-3xl font-black text-text-primary tracking-tight uppercase">
            Fiscal Velocity
          </h3>
          <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
            Cumulative Disbursement Flux (6M)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-[0.5625rem] font-black text-text-muted uppercase">Gross Pay</span>
          </div>
          <button className="p-3 bg-muted-bg rounded-md text-text-primary">
            <History size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLiability" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: '900' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: '900' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                border: '0.0625rem solid hsl(var(--border))',
                boxShadow: '0 0.625rem 1.875rem -0.625rem rgba(0,0,0,0.1)',
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--surface))',
                color: 'hsl(var(--text-primary))',
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={6}
              fillOpacity={1}
              fill="url(#colorLiability)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayrollChart;
