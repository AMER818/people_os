import React from 'react';
import { Plane, Map, Globe, ShieldCheck } from 'lucide-react';

interface TravelHubProps {
  travelNodes: {
    id: string;
    destination: string;
    user: string;
    reason: string;
    date: string;
    status: string;
  }[];
  onPlanRoute: () => void;
}

const TravelHub: React.FC<TravelHubProps> = ({ travelNodes, onPlanRoute }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="lg:col-span-8 bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden min-h-[37.5rem] flex flex-col">
        <div className="p-12 border-b border-border flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
            Global Mobility Ledger
          </h3>
          <button
            onClick={onPlanRoute}
            className="bg-primary-soft text-white px-10 py-4 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-4 shadow-xl hover:scale-105 transition-all"
          >
            <Plane size={18} /> Plan New Route
          </button>
        </div>
        <div className="space-y-6">
          {travelNodes.map((trip) => (
            <div
              key={trip.id}
              className="p-10 bg-muted rounded-[3rem] border border-border flex flex-col md:flex-row items-center justify-between group hover:border-indigo-500/30 transition-all gap-8"
            >
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-card rounded-[2rem] flex items-center justify-center text-primary-soft shadow-inner group-hover:scale-110 transition-transform">
                  <Map size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                      {trip.destination}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-lg text-[0.5625rem] font-black uppercase tracking-widest ${trip.status === 'Approved' ? 'bg-success text-white' : 'bg-warning text-white'}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-[0.6875rem] font-black text-slate-400 uppercase tracking-widest">
                    {trip.user} • {trip.reason}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {trip.date}
                </p>
                <p className="text-[0.5625rem] font-black text-slate-400 uppercase mt-1 tracking-widest">
                  Temporal Range
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-10">
        <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <Globe size={240} />
          </div>
          <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-info mb-8">
            Mobility Intelligence
          </h4>
          <p className="text-xl font-black leading-tight antialiased mb-10 uppercase">
            Carbon Offset{' '}
            <span className="text-info underline decoration-blue-500/30 underline-offset-8">
              Neural Tracker
            </span>{' '}
            Active for Q3 Business Travel Cluster.
          </p>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500">
                  Global Coverage
                </p>
                <p className="font-black text-xl text-success mt-1">94.2%</p>
              </div>
              <ShieldCheck className="text-success" />
            </div>
          </div>
          <button
            aria-label="Audit Environmental Impact"
            className="w-full mt-10 py-5 bg-surface border border-border text-text-primary rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            Audit Environmental Impact
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelHub;
