import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import type { Project } from '../types';
import { PRIORITY_CONFIG, STATUS_CONFIG, PROJECT_TYPE_LABELS, GATE_DEFINITIONS } from '../data/constants';
import { formatCurrency } from '../utils/helpers';

interface AnalyticsProps {
  projects: Project[];
}

export function Analytics({ projects }: AnalyticsProps) {
  const totalBudget = projects.reduce((s, p) => s + p.estimatedBudget, 0);
  const completedBudget = projects
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + (p.actualBudget ?? p.estimatedBudget), 0);

  const gateStats = ([0, 1, 2, 3, 4] as const).map((gate) => {
    const atGate = projects.filter((p) => p.currentGate === gate).length;
    const passed = projects.filter((p) => p.currentGate > gate || p.status === 'completed').length;
    return { gate, atGate, passed };
  });

  const typeStats = Object.entries(PROJECT_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    count: projects.filter((p) => p.projectType === type).length,
    budget: projects.filter((p) => p.projectType === type).reduce((s, p) => s + p.estimatedBudget, 0),
  })).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

  const statusStats = Object.entries(STATUS_CONFIG).map(([status, conf]) => ({
    status,
    label: conf.label,
    color: conf.color,
    bgColor: conf.bgColor,
    count: projects.filter((p) => p.status === status).length,
  })).filter((s) => s.count > 0);

  const priorityStats = Object.entries(PRIORITY_CONFIG).map(([priority, conf]) => ({
    priority,
    label: conf.label,
    color: conf.color,
    bgColor: conf.bgColor,
    count: projects.filter((p) => p.priority === priority).length,
  })).filter((p) => p.count > 0);

  const maxGateCount = Math.max(...gateStats.map((g) => g.atGate + g.passed), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
        <p className="text-slate-500 mt-1">Portfolio insights and tollgate performance</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: projects.filter((p) => p.status === 'active').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Portfolio Value', value: formatCurrency(totalBudget), icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Completed Value', value: formatCurrency(completedBudget), icon: PieChart, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Gate Pipeline
          </h3>
          <div className="space-y-3">
            {gateStats.map(({ gate, atGate, passed }) => {
              const total = atGate + passed;
              const pct = maxGateCount ? (total / maxGateCount) * 100 : 0;
              const GATE_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'];
              return (
                <div key={gate}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">{GATE_DEFINITIONS[gate].name}</span>
                    <span className="text-xs text-slate-400">{total} projects</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${GATE_COLORS[gate]} rounded-full h-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>{atGate} at gate</span>
                    <span>{passed} passed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Status Distribution
          </h3>
          <div className="space-y-3">
            {statusStats.map(({ status, label, color, bgColor, count }) => {
              const pct = projects.length ? Math.round((count / projects.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-24 justify-center ${color} ${bgColor}`}>
                    {label}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            Projects by Type
          </h3>
          <div className="space-y-3">
            {typeStats.map(({ type, label, count, budget }) => {
              const pct = projects.length ? Math.round((count / projects.length) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-40 truncate flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-cyan-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                  <span className="text-xs text-slate-400 w-20 text-right">{formatCurrency(budget)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Priority Matrix
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {priorityStats.map(({ priority, label, color, bgColor, count }) => {
              const pct = projects.length ? Math.round((count / projects.length) * 100) : 0;
              return (
                <div key={priority} className={`rounded-xl p-4 ${bgColor}`}>
                  <p className={`text-sm font-semibold ${color}`}>{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pct}% of portfolio</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Avg. budget per project: {formatCurrency(projects.length ? Math.round(totalBudget / projects.length) : 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Completion rate: {projects.length ? Math.round((projects.filter((p) => p.status === 'completed').length / projects.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
