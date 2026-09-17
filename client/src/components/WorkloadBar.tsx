import React from 'react';
import { UserWorkload } from '../types';
import { ShieldAlert, CheckCircle2, User, Gauge } from 'lucide-react';

interface WorkloadBarProps {
  workloads: UserWorkload[];
}

export const WorkloadBar: React.FC<WorkloadBarProps> = ({ workloads }) => {
  if (!workloads || workloads.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Team Workload & Capacity Balancer
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Rule: Overloaded if &gt; 5 In-Progress
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated in real-time by the backend Workload Balancing Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimal (0–4)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Limit (5)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Overloaded (&gt;5)
          </span>
        </div>
      </div>

      {/* Member Workload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {workloads.map((member) => {
          const inProgress = member.inProgressCount;
          const isOverloaded = member.isOverloaded;
          const isAtLimit = inProgress === 5;
          const maxScale = 6;
          const percentage = Math.min(100, Math.round((inProgress / maxScale) * 100));

          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={member.userId}
              className={`p-3.5 rounded-xl border transition-all ${
                isOverloaded
                  ? 'bg-rose-950/30 border-rose-800/80 shadow-rose-950/20 shadow-lg ring-1 ring-rose-500/40'
                  : isAtLimit
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Member Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isOverloaded
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                        : 'bg-indigo-700 text-white'
                    }`}
                  >
                    {initials || <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                  </div>
                </div>

                {/* Overloaded Badge */}
                {isOverloaded ? (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold flex items-center gap-1 animate-pulse shrink-0">
                    <ShieldAlert className="w-3 h-3" />
                    Overloaded
                  </span>
                ) : isAtLimit ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-semibold shrink-0">
                    At Limit (5)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Balanced
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">In Progress</span>
                  <span className="font-mono font-medium text-slate-200">
                    <strong className={isOverloaded ? 'text-rose-400' : isAtLimit ? 'text-amber-400' : 'text-indigo-300'}>
                      {inProgress}
                    </strong>{' '}
                    <span className="text-slate-500">/ 5 max threshold</span>
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverloaded
                        ? 'bg-rose-500 shadow-sm shadow-rose-500'
                        : isAtLimit
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Total assigned: {member.totalTasks}</span>
                  <span>{isOverloaded ? 'Exceeds limit!' : `${Math.max(0, 5 - inProgress)} slots free`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
