import type { GateId, ProjectType, ProjectPriority, ProjectStatus, TollgateStatus } from '../types';

export const GATE_DEFINITIONS: Record<GateId, { name: string; description: string; color: string; requiredDocuments: string[] }> = {
  0: {
    name: 'Gate 0: Concept',
    description: 'Initial project concept and ideation approval',
    color: 'violet',
    requiredDocuments: ['Project Concept Note', 'Initial Business Case', 'Stakeholder Register'],
  },
  1: {
    name: 'Gate 1: Business Case',
    description: 'Full business case review and approval',
    color: 'blue',
    requiredDocuments: ['Detailed Business Case', 'Cost-Benefit Analysis', 'Risk Register', 'Resource Plan'],
  },
  2: {
    name: 'Gate 2: Planning',
    description: 'Project plan approval and resource allocation',
    color: 'cyan',
    requiredDocuments: ['Project Plan', 'Procurement Strategy', 'Budget Approval', 'Supplier Shortlist'],
  },
  3: {
    name: 'Gate 3: Execution',
    description: 'Execution review and progress validation',
    color: 'amber',
    requiredDocuments: ['Progress Report', 'Contract Documents', 'Supplier Evaluation', 'Change Log'],
  },
  4: {
    name: 'Gate 4: Closeout',
    description: 'Project closure and lessons learned',
    color: 'green',
    requiredDocuments: ['Closeout Report', 'Lessons Learned', 'Final Cost Report', 'Benefits Realization'],
  },
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  strategic_sourcing: 'Strategic Sourcing',
  supplier_onboarding: 'Supplier Onboarding',
  contract_renewal: 'Contract Renewal',
  cost_reduction: 'Cost Reduction',
  process_improvement: 'Process Improvement',
  technology_implementation: 'Technology Implementation',
  compliance: 'Compliance',
  other: 'Other',
};

export const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string; bgColor: string; ringColor: string }> = {
  low: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100', ringColor: 'ring-slate-200' },
  medium: { label: 'Medium', color: 'text-blue-700', bgColor: 'bg-blue-50', ringColor: 'ring-blue-200' },
  high: { label: 'High', color: 'text-amber-700', bgColor: 'bg-amber-50', ringColor: 'ring-amber-200' },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-50', ringColor: 'ring-red-200' },
};

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  active: { label: 'Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  completed: { label: 'Completed', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50' },
  on_hold: { label: 'On Hold', color: 'text-amber-700', bgColor: 'bg-amber-50' },
};

export const TOLLGATE_STATUS_CONFIG: Record<TollgateStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  not_started: { label: 'Not Started', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: '○' },
  in_review: { label: 'In Review', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '◐' },
  approved: { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: '✓' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50', icon: '✕' },
  on_hold: { label: 'On Hold', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: '⏸' },
};

export const DEPARTMENTS: string[] = [
  'Procurement',
  'Supply Chain',
  'Finance',
  'Operations',
  'IT',
  'Legal',
  'HR',
  'Sales',
  'Marketing',
  'Engineering',
  'Other',
];

export const CURRENCIES: string[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
