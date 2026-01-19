import React from 'react';
import {
  PartyPopper,
  ChevronRight,
  Cake,
  Heart,
  Users,
  UserCheck,
  UserMinus,
  Briefcase,
} from 'lucide-react';

interface EmployeeStatsProps {
  upcomingEvents: any[];
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  departments: number;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({
  upcomingEvents,
  totalEmployees,
  activeEmployees,
  onLeave,
  departments,
}) => {
  const generalStats = [
    { label: 'Total Workforce', val: totalEmployees, icon: Users, color: 'blue' },
    { label: 'Active Personnel', val: activeEmployees, icon: UserCheck, color: 'emerald' },
    { label: 'On Leave', val: onLeave, icon: UserMinus, color: 'orange' },
    { label: 'Departments', val: departments, icon: Briefcase, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* General Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {generalStats.map((s, i) => (
          <div
            key={i}
            className="bg-surface/40 backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/50 shadow-lg relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
          >
            {/* Dynamic Background Glow */}
            <div
              className={`absolute -right-10 -bottom-10 w-40 h-40 bg-${s.color}-500/10 blur-[3rem] rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50 group-hover:opacity-100`}
            ></div>
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${s.color}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
            ></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div
                className={`p-3 rounded-xl bg-${s.color}-500/10 text-${s.color}-500 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-${s.color}-500/10`}
              >
                <s.icon size={20} />
              </div>
              <span className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-text-secondary">
                {s.label}
              </span>
            </div>
            <h4 className="text-4xl font-black text-text-primary tracking-tighter relative z-10 font-mono">
              {s.val}
            </h4>
          </div>
        ))}
      </div>

      {/* Milestones Section */}
      {upcomingEvents.length > 0 && (
        <section className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border/50 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none opacity-50"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 animate-in zoom-in duration-300 ring-4 ring-surface/50">
                  <PartyPopper size={24} />
                </div>
                Celebrations
              </h3>
              <p className="text-text-muted font-black uppercase text-[0.625rem] tracking-[0.2em] mt-2 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                Upcoming Milestones Radar
              </p>
            </div>
            <button
              aria-label="View all milestones"
              className="bg-surface hover:bg-muted-bg text-text-secondary px-6 py-3 rounded-xl font-black uppercase text-[0.625rem] tracking-[0.2em] flex items-center gap-3 border border-border/50 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-card/40 backdrop-blur-md p-5 rounded-2xl border border-border/50 flex items-center gap-5 hover:border-primary/30 transition-all group/card shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300"
              >
                <div className="relative">
                  <img
                    src={event.employee.avatar}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-surface shadow-md group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl border-4 border-surface flex items-center justify-center shadow-lg transform group-hover/card:rotate-12 transition-transform duration-300 ${event.type === 'Birthday' ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}
                  >
                    {event.type === 'Birthday' ? (
                      <Cake size={12} className="text-white fill-white/20" />
                    ) : (
                      <Heart className="text-white fill-white/20" size={12} />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-black text-text-primary tracking-tight truncate group-hover/card:text-primary transition-colors">
                      {event.employee.name}
                    </p>
                  </div>
                  <p className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest truncate mb-3 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${event.type === 'Birthday' ? 'bg-pink-500' : 'bg-blue-500'}`}
                    ></span>
                    {event.type === 'Birthday' ? `Birthday` : 'Anniversary'}
                  </p>

                  <span
                    className={`px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-[0.15em] inline-block shadow-sm ${event.daysRemaining === 0 ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse shadow-red-500/20 shadow-lg' : 'bg-surface border border-border text-text-secondary'}`}
                  >
                    {event.daysRemaining === 0 ? 'Today!' : `In ${event.daysRemaining} Days`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EmployeeStats;
