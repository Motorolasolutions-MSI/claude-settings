import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  DollarSign,
  Users,
} from 'lucide-react';
import type { Project } from '../types';
import { PRIORITY_CONFIG, STATUS_CONFIG, TOLLGATE_STATUS_CONFIG } from '../data/constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import { GateProgress } from '../components/GateProgress';
import { Badge } from '../components/Badge';

interface DashboardProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onNewRequest: () => void;
}

export function Dashboard({ projects, onViewProject, onNewRequest }: DashboardProps) {
  const activeProjects = projects.filter((p) => p.status === 'active');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const inReviewProjects = projects.filter((p) =>
    p.gates.some((g) => g.status === 'in_review'),
  );
  const totalBudget = projects.reduce((sum, p) => sum + p.estimatedBudget, 0);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const gateDistribution = [0, 1, 2, 3, 4].map((gate) => ({
    gate,
    count: projects.filter((p) => p.currentGate === gate).length,
  }));

  const priorityCounts = {
    critical: projects.filter((p) => p.priority === 'critical').length,
    high: projects.filter((p) => p.priority === 'high').length,
    medium: projects.filter((p) => p.priority === 'medium').length,
    low: projects.filter((p) => p.priority === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Project tollgates overview and key metrics</p>
        </div>
        <button
          onClick={onNewRequest}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <span>+ New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Active Projects"
          value={activeProjects.length}
          icon={Activity}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="+2 this month"
          trendUp
        />
        <KpiCard
          label="Pending Review"
          value={inReviewProjects.length}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend="Action required"
          trendUp={false}
          trendWarning
        />
        <KpiCard
          label="Completed"
          value={completedProjects.length}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend="This fiscal year"
          trendUp
        />
        <KpiCard
          label="Total Portfolio Value"
          value={formatCurrency(totalBudget)}
          icon={DollarSign}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          trend="Estimated budget"
          trendUp
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Projects</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentProjects.map((project) => {
              const priorityConf = PRIORITY_CONFIG[project.priority];
              const statusConf = STATUS_CONFIG[project.status];
              const currentGateStatus = project.gates[project.currentGate]?.status ?? 'not_started';
              const gateConf = TOLLGATE_STATUS_CONFIG[currentGateStatus as keyof typeof TOLLGATE_STATUS_CONFIG];
              return (
                <div
                  key={project.id}
                  className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onViewProject(project)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 truncate">{project.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge label={statusConf.label} color={statusConf.color} bgColor={statusConf.bgColor} />
                        <Badge label={priorityConf.label} color={priorityConf.color} bgColor={priorityConf.bgColor} />
                        <span className={`text-xs ${gateConf?.color ?? 'text-slate-400'}`}>Gate {project.currentGate} • {gateConf?.label ?? ''}</span>
                      </div>
                      <GateProgress currentGate={project.currentGate} gates={project.gates} compact />
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-slate-700">{formatCurrency(project.estimatedBudget)}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(project.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Gate Distribution
            </h3>
            <div className="space-y-2.5">
              {gateDistribution.map(({ gate, count }) => (
                <div key={gate} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-12 flex-shrink-0">Gate {gate}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${projects.length ? (count / projects.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Priority Breakdown
            </h3>
            <div className="space-y-2">
              {(Object.entries(priorityCounts) as [keyof typeof PRIORITY_CONFIG, number][]).map(([priority, count]) => {
                const conf = PRIORITY_CONFIG[priority];
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <Badge label={conf.label} color={conf.color} bgColor={conf.bgColor} />
                    <span className="text-sm font-semibold text-slate-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Portfolio Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">On Track</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {projects.filter((p) => p.status === 'active').length} projects
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">On Hold</span>
                <span className="text-sm font-semibold text-amber-600">
                  {projects.filter((p) => p.status === 'on_hold').length} projects
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Drafts</span>
                <span className="text-sm font-semibold text-slate-500">
                  {projects.filter((p) => p.status === 'draft').length} projects
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend: string;
  trendUp: boolean;
  trendWarning?: boolean;
}

function KpiCard({ label, value, icon: Icon, iconColor, iconBg, trend, trendUp, trendWarning }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {trendWarning ? (
          <AlertCircle className="w-3 h-3 text-amber-500" />
        ) : trendUp ? (
          <TrendingUp className="w-3 h-3 text-emerald-500" />
        ) : null}
        <span className={`text-xs ${trendWarning ? 'text-amber-600' : trendUp ? 'text-emerald-600' : 'text-slate-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
