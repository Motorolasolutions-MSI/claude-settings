import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Building2,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  FileText,
  AlertTriangle,
  PauseCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Project, GateId, TollgateGate } from '../types';
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  TOLLGATE_STATUS_CONFIG,
  PROJECT_TYPE_LABELS,
  GATE_DEFINITIONS,
} from '../data/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';
import { Badge } from '../components/Badge';
import { GateProgress } from '../components/GateProgress';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateGateStatus: (projectId: string, gateId: GateId, status: 'approved' | 'rejected' | 'in_review' | 'on_hold', reason?: string) => void;
  onAddComment: (projectId: string, gateId: GateId, content: string, authorName: string, authorRole: string) => void;
  onSubmitForReview: (projectId: string, gateId: GateId) => void;
}

export function ProjectDetail({
  project,
  onBack,
  onUpdateGateStatus,
  onAddComment,
  onSubmitForReview,
}: ProjectDetailProps) {
  const [activeGate, setActiveGate] = useState<GateId>(project.currentGate);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [expandedGate, setExpandedGate] = useState<GateId | null>(project.currentGate);

  const priorityConf = PRIORITY_CONFIG[project.priority];
  const statusConf = STATUS_CONFIG[project.status];
  const selectedGate = project.gates[activeGate];

  const handleApprove = () => {
    onUpdateGateStatus(project.id, activeGate, 'approved');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onUpdateGateStatus(project.id, activeGate, 'rejected', rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleHold = () => {
    onUpdateGateStatus(project.id, activeGate, 'on_hold');
  };

  const handleSubmitForReview = () => {
    onSubmitForReview(project.id, activeGate);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onAddComment(project.id, activeGate, comment, 'Sarah Mitchell', 'Procurement Director');
    setComment('');
  };

  if (!selectedGate) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{project.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge label={statusConf.label} color={statusConf.color} bgColor={statusConf.bgColor} />
                <Badge label={priorityConf.label} color={priorityConf.color} bgColor={priorityConf.bgColor} />
                <span className="text-sm text-slate-500">{PROJECT_TYPE_LABELS[project.projectType]}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">{project.department}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(project.estimatedBudget, project.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Estimated Budget</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Project Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <InfoRow icon={User} label="Requested by" value={project.requestedBy} />
              <InfoRow icon={Building2} label="Department" value={project.department} />
              <InfoRow icon={Calendar} label="Start Date" value={formatDate(project.startDate)} />
              <InfoRow icon={Calendar} label="Target End" value={formatDate(project.targetEndDate)} />
              <InfoRow icon={DollarSign} label="Budget" value={formatCurrency(project.estimatedBudget, project.currency)} />
              {project.actualBudget && (
                <InfoRow icon={DollarSign} label="Actual Cost" value={formatCurrency(project.actualBudget, project.currency)} />
              )}
            </div>
          </div>

          {project.suppliers && project.suppliers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Suppliers</h3>
              <div className="space-y-1.5">
                {project.suppliers.map((s: string) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.stakeholders.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Stakeholders</h3>
              <div className="space-y-3">
                {project.stakeholders.map((s) => (
                  <div key={s.id} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 leading-tight">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-5">Tollgate Progress</h3>
            <GateProgress currentGate={project.currentGate} gates={project.gates} />
          </div>

          <div className="space-y-3">
            {project.gates.map((gate) => (
              <GateCard
                key={gate.id}
                gate={gate}
                isActive={gate.id === activeGate}
                isExpanded={expandedGate === gate.id}
                onSelect={() => {
                  setActiveGate(gate.id);
                  setExpandedGate(expandedGate === gate.id ? null : gate.id);
                }}
                onApprove={handleApprove}
                onReject={() => setShowRejectForm(true)}
                onHold={handleHold}
                onSubmitForReview={handleSubmitForReview}
                showRejectForm={showRejectForm && gate.id === activeGate}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
                onConfirmReject={handleReject}
                onCancelReject={() => { setShowRejectForm(false); setRejectReason(''); }}
                comment={gate.id === activeGate ? comment : ''}
                onCommentChange={setComment}
                onAddComment={handleAddComment}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface GateCardProps {
  gate: TollgateGate;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  onHold: () => void;
  onSubmitForReview: () => void;
  showRejectForm: boolean;
  rejectReason: string;
  onRejectReasonChange: (v: string) => void;
  onConfirmReject: () => void;
  onCancelReject: () => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onAddComment: () => void;
}

function GateCard({
  gate,
  isActive,
  isExpanded,
  onSelect,
  onApprove,
  onReject,
  onHold,
  onSubmitForReview,
  showRejectForm,
  rejectReason,
  onRejectReasonChange,
  onConfirmReject,
  onCancelReject,
  comment,
  onCommentChange,
  onAddComment,
}: GateCardProps) {
  const gateDef = GATE_DEFINITIONS[gate.id];
  const gateConf = TOLLGATE_STATUS_CONFIG[gate.status];

  const statusIcon: Record<string, React.ReactNode> = {
    approved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
    in_review: <Clock className="w-4 h-4 text-blue-500" />,
    on_hold: <PauseCircle className="w-4 h-4 text-amber-500" />,
    not_started: <div className="w-4 h-4 rounded-full border-2 border-slate-300" />,
  };

  const GATE_BORDER: Record<number, string> = {
    0: 'border-l-violet-400',
    1: 'border-l-blue-400',
    2: 'border-l-cyan-400',
    3: 'border-l-amber-400',
    4: 'border-l-emerald-400',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-l-4 ${
        GATE_BORDER[gate.id]
      } ${isActive ? 'ring-2 ring-blue-200' : ''}`}
    >
      <button
        onClick={onSelect}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {statusIcon[gate.status]}
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">{gateDef.name}</p>
            <p className="text-xs text-slate-500">{gateDef.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gateConf.bgColor} ${gateConf.color}`}>
            {gateConf.label}
          </span>
          {gate.approvedAt && (
            <span className="text-xs text-slate-400">{formatDate(gate.approvedAt)}</span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Required Documents
            </h4>
            <div className="space-y-1.5">
              {gate.requiredDocuments.map((doc: string) => {
                const submitted = gate.submittedDocuments.includes(doc);
                return (
                  <div key={doc} className="flex items-center gap-2 text-sm">
                    {submitted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    )}
                    <span className={submitted ? 'text-slate-700' : 'text-slate-400'}>{doc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {gate.reviewers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reviewers</h4>
              <div className="flex flex-wrap gap-2">
                {gate.reviewers.map((r) => (
                  <div key={r.id} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                      {r.name[0]}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{r.name}</span>
                    <span className="text-xs text-slate-400">· {r.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gate.status === 'rejected' && gate.rejectedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
                <p className="text-sm text-red-600 mt-0.5">{gate.rejectedReason}</p>
              </div>
            </div>
          )}

          {isActive && gate.status !== 'approved' && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {gate.status === 'not_started' && (
                  <button
                    onClick={onSubmitForReview}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit for Review
                  </button>
                )}
                {gate.status === 'in_review' && (
                  <>
                    <button
                      onClick={onApprove}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={onReject}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={onHold}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <PauseCircle className="w-3.5 h-3.5" /> Put on Hold
                    </button>
                  </>
                )}
                {(gate.status === 'on_hold' || gate.status === 'rejected') && (
                  <button
                    onClick={onSubmitForReview}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Resubmit for Review
                  </button>
                )}
              </div>

              {showRejectForm && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800">Provide rejection reason</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    placeholder="Explain why this gate is being rejected…"
                    className="w-full text-sm border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={onConfirmReject}
                      disabled={!rejectReason.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={onCancelReject}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Comments ({gate.comments.length})
            </h4>
            <div className="space-y-3 mb-3">
              {gate.comments.map((c) => (
                <div key={c.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {c.authorName[0]}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{c.authorName}</span>
                      <span className="text-xs text-slate-400">· {c.authorRole}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={isActive ? comment : ''}
                onChange={(e) => isActive && onCommentChange(e.target.value)}
                placeholder="Add a comment…"
                onKeyDown={(e) => e.key === 'Enter' && isActive && onAddComment()}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isActive}
              />
              <button
                onClick={onAddComment}
                disabled={!isActive || !comment.trim()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
