import React from 'react';
import { PartyPopper, ChevronRight, Cake, Heart, Users, UserCheck, UserMinus, Briefcase } from 'lucide-react';


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
  departments
}) => {

  const generalStats = [
    { label: 'Total Workforce', val: totalEmployees, icon: Users, color: 'blue' },
    { label: 'Active Employees', val: activeEmployees, icon: UserCheck, color: 'emerald' },
    { label: 'On Leave', val: onLeave, icon: UserMinus, color: 'orange' },
    { label: 'Departments', val: departments, icon: Briefcase, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* General Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {generalStats.map((s, i) => (
          <div key={i} className="bg-surface/50 backdrop-blur-xl p-5 rounded-2xl border border-border shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.color}-500/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl bg-${s.color}-500/10 text-${s.color}-500`}>
                <s.icon size={18} />
              </div>
              <span className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">{s.label}</span>
            </div>
            <h4 className="text-2xl font-black text-text-primary tracking-tight">{s.val}</h4>
          </div>
        ))}
      </div>

      {/* Milestones Section */}
      {upcomingEvents.length > 0 && (
        <section className="bg-surface/50 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                  <PartyPopper size={20} />
                </div>
                Upcoming Milestones
              </h3>
              <p className="text-text-muted font-black uppercase text-[0.625rem] tracking-[0.2em] mt-2 ml-1">
                Birthdays & Work Anniversaries • Next 7 Days
              </p>
            </div>
            <button aria-label="View all milestones" className="bg-surface hover:bg-muted-bg text-text-secondary px-6 py-2.5 rounded-lg font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-2 border border-border transition-all hover:-translate-y-0.5 shadow-sm">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-border flex items-center gap-4 hover:border-primary/50 transition-all group/card shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={event.employee.avatar}
                    className="w-12 h-12 rounded-lg object-cover border-2 border-surface shadow-md group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg border-2 border-surface flex items-center justify-center shadow-lg ${event.type === 'Birthday' ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}
                  >
                    {event.type === 'Birthday' ? (
                      <Cake size={12} className="text-white fill-white/20" />
                    ) : (
                      <Heart className="text-white fill-white/20" size={12} />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-black text-text-primary tracking-tight truncate">
                      {event.employee.name}
                    </p>
                  </div>
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest truncate mb-2">
                    {event.type === 'Birthday' ? `Birthday` : 'Anniversary'}
                  </p>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[0.5625rem] font-black uppercase tracking-widest inline-block ${event.daysRemaining === 0 ? 'bg-danger/10 text-danger animate-pulse border border-danger/20' : 'bg-surface text-text-secondary border border-border'}`}
                  >
                    {event.daysRemaining === 0 ? 'Today' : `In ${event.daysRemaining}d`}
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
