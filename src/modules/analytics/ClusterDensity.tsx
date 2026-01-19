import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface ClusterDensityProps {
  data: any[];
  colors: string[];
}

const ClusterDensity: React.FC<ClusterDensityProps> = ({ data, colors }) => {
  return (
    <div
      role="img"
      aria-label="Department Distribution Chart"
      className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden flex flex-col"
    >
      <div className="p-14 border-b border-border text-center bg-muted/50">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
          Department Distribution
        </h3>
        <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-4">
          Global Personnel Allocation
        </p>
      </div>
      <div className="flex-1 p-14 flex flex-col items-center justify-center">
        <div className="h-[21.25rem] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={135}
                paddingAngle={12}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              1,284
            </span>
            <span className="text-[0.6875rem] font-black text-slate-400 uppercase tracking-widest mt-1">
              Total Employees
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full mt-14">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[i], boxShadow: `0 0 0.9375rem ${colors[i]}60` }}
                ></div>
                <span className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest">
                  {d.name}
                </span>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 leading-none antialiased">
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <button
        aria-label="View detailed distribution"
        className="w-full py-8 bg-muted text-[0.6875rem] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary border-t border-border transition-all"
      >
        View Details
      </button>
    </div>
  );
};

export default ClusterDensity;
