export type TollgateStatus = 'not_started' | 'in_review' | 'approved' | 'rejected' | 'on_hold';

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectType =
  | 'strategic_sourcing'
  | 'supplier_onboarding'
  | 'contract_renewal'
  | 'cost_reduction'
  | 'process_improvement'
  | 'technology_implementation'
  | 'compliance'
  | 'other';

export type GateId = 0 | 1 | 2 | 3 | 4;

export interface TollgateReviewer {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface TollgateComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface TollgateGate {
  id: GateId;
  name: string;
  description: string;
  status: TollgateStatus;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  comments: TollgateComment[];
  requiredDocuments: string[];
  submittedDocuments: string[];
  reviewers: TollgateReviewer[];
}

export interface ProjectStakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  currentGate: GateId;
  requestedBy: string;
  requestedByEmail: string;
  department: string;
  estimatedBudget: number;
  actualBudget?: number;
  currency: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  suppliers?: string[];
  stakeholders: ProjectStakeholder[];
  gates: TollgateGate[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IntakeFormData {
  title: string;
  description: string;
  projectType: ProjectType;
  priority: ProjectPriority;
  requestedBy: string;
  requestedByEmail: string;
  department: string;
  estimatedBudget: number;
  currency: string;
  startDate: string;
  targetEndDate: string;
  suppliers: string;
  businessJustification: string;
  expectedBenefits: string;
  risks: string;
  tags: string;
}

export interface FilterState {
  search: string;
  status: ProjectStatus | 'all';
  priority: ProjectPriority | 'all';
  projectType: ProjectType | 'all';
  gate: GateId | 'all';
}
