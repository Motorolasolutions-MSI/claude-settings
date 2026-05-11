import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { Project, FilterState, ProjectStatus, ProjectPriority, ProjectType, GateId } from '../types';
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  PROJECT_TYPE_LABELS,
  GATE_DEFINITIONS,
} from '../data/constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import { GateProgress } from '../components/GateProgress';
import { Badge } from '../components/Badge';

interface ProjectsListProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onNewRequest: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  projectType: 'all',
  gate: 'all',
};

export function ProjectsList({ projects, onViewProject, onNewRequest }: ProjectsListProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'priority' | 'budget'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const priorityOrder: Record<ProjectPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const filtered = projects
    .filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !p.requestedBy.toLowerCase().includes(q) &&
          !p.department.toLowerCase().includes(q) &&
          !p.tags.some((t: string) => t.toLowerCase().includes(q))
        )
          return false;
      }
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.priority !== 'all' && p.priority !== filters.priority) return false;
      if (filters.projectType !== 'all' && p.projectType !== filters.projectType) return false;
      if (filters.gate !== 'all' && p.currentGate !== filters.gate) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'updatedAt') comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      else if (sortBy === 'createdAt') comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'priority') comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      else if (sortBy === 'budget') comparison = a.estimatedBudget - b.estimatedBudget;
      return sortDir === 'desc' ? -comparison : comparison;
    });

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && v !== 'all',
  ).length + (filters.search ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Projects</h2>
          <p className="text-slate-500 mt-1">
            {filtered.length} of {projects.length} projects
          </p>
        </div>
        <button
          onClick={onNewRequest}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Request
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, requesters, tags…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('-');
                setSortBy(field as typeof sortBy);
                setSortDir(dir as 'asc' | 'desc');
              }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Recently Created</option>
              <option value="priority-desc">Priority (High → Low)</option>
              <option value="budget-desc">Budget (High → Low)</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <FilterSelect
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v as ProjectStatus | 'all' }))}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <FilterSelect
              value={filters.priority}
              onChange={(v) => setFilters((f) => ({ ...f, priority: v as ProjectPriority | 'all' }))}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <FilterSelect
              value={filters.projectType}
              onChange={(v) => setFilters((f) => ({ ...f, projectType: v as ProjectType | 'all' }))}
              options={[
                { value: 'all', label: 'All Types' },
                ...Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
            <FilterSelect
              value={String(filters.gate)}
              onChange={(v) => setFilters((f) => ({ ...f, gate: v === 'all' ? 'all' : (Number(v) as GateId) }))}
              options={[
                { value: 'all', label: 'All Gates' },
                ...Object.entries(GATE_DEFINITIONS).map(([id, def]) => ({ value: id, label: def.name })),
              ]}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No projects match your filters</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Gate Progress</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((project) => {
                const priorityConf = PRIORITY_CONFIG[project.priority];
                const statusConf = STATUS_CONFIG[project.status];
                return (
                  <tr
                    key={project.id}
                    onClick={() => onViewProject(project)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{project.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {project.requestedBy} · {project.department}
                        </p>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge label={statusConf.label} color={statusConf.color} bgColor={statusConf.bgColor} />
                    </td>
                    <td className="px-4 py-4">
                      <Badge label={priorityConf.label} color={priorityConf.color} bgColor={priorityConf.bgColor} />
                    </td>
                    <td className="px-4 py-4 w-40">
                      <GateProgress currentGate={project.currentGate} gates={project.gates} compact />
                      <p className="text-xs text-slate-400 mt-1">Gate {project.currentGate} of 4</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {formatCurrency(project.estimatedBudget, project.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-500">{formatDate(project.updatedAt)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-sm border rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
          value !== 'all'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  );
}
