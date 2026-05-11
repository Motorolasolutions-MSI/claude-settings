import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  DollarSign,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { IntakeFormData, ProjectPriority } from '../types';
import { PROJECT_TYPE_LABELS, PRIORITY_CONFIG, DEPARTMENTS, CURRENCIES } from '../data/constants';
import { cn } from '../utils/helpers';

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, label: 'Project Details', icon: FileText, description: 'Basic project information' },
  { id: 2, label: 'Financial & Timeline', icon: DollarSign, description: 'Budget and scheduling' },
  { id: 3, label: 'Stakeholders', icon: Users, description: 'Team and stakeholders' },
  { id: 4, label: 'Justification', icon: AlertCircle, description: 'Business case and risks' },
];

export function IntakeForm({ onSubmit, onCancel }: IntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<IntakeFormData>({
    defaultValues: {
      currency: 'USD',
      priority: 'medium',
      projectType: 'strategic_sourcing',
    },
  });

  const watchedPriority = watch('priority');

  const handleNext = async () => {
    const fieldsPerStep: Record<number, (keyof IntakeFormData)[]> = {
      1: ['title', 'description', 'projectType', 'priority'],
      2: ['estimatedBudget', 'currency', 'startDate', 'targetEndDate'],
      3: ['requestedBy', 'requestedByEmail', 'department'],
      4: ['businessJustification'],
    };
    const valid = await trigger(fieldsPerStep[currentStep]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const handleFormSubmit = handleSubmit((data) => {
    setSubmittedTitle(data.title);
    onSubmit(data);
    setSubmitted(true);
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-5">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Your project request has been submitted and is now awaiting Gate 0 review.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-center max-w-sm">
          <p className="text-sm font-semibold text-slate-700">{submittedTitle}</p>
          <p className="text-xs text-slate-400 mt-1">Gate 0 · Concept Review</p>
        </div>
        <button
          onClick={onCancel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            New Project Request
          </h2>
          <p className="text-slate-500 mt-1">Submit a project for tollgate review and approval</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400',
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn('text-xs font-medium', isActive ? 'text-blue-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400')}>
                      {step.label}
                    </p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-3 -mt-5', isCompleted ? 'bg-emerald-300' : 'bg-slate-200')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {currentStep === 1 && (
            <div className="space-y-5">
              <SectionTitle>Project Information</SectionTitle>

              <div className="space-y-1.5">
                <Label required>Project Title</Label>
                <input
                  {...register('title', { required: 'Project title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } })}
                  placeholder="e.g. Strategic Supplier Consolidation – EMEA Region"
                  className={inputClass(!!errors.title)}
                />
                {errors.title && <ErrorMsg>{errors.title.message}</ErrorMsg>}
              </div>

              <div className="space-y-1.5">
                <Label required>Description</Label>
                <textarea
                  {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please provide more detail' } })}
                  placeholder="Describe the project scope, objectives, and expected outcomes…"
                  rows={4}
                  className={cn(inputClass(!!errors.description), 'resize-none')}
                />
                {errors.description && <ErrorMsg>{errors.description.message}</ErrorMsg>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Project Type</Label>
                  <select {...register('projectType', { required: true })} className={inputClass(false)}>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label required>Priority</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(PRIORITY_CONFIG) as [ProjectPriority, typeof PRIORITY_CONFIG[ProjectPriority]][]).map(([val, conf]) => (
                      <label key={val} className="cursor-pointer">
                        <input type="radio" value={val} {...register('priority')} className="sr-only" />
                        <div
                          className={cn(
                            'text-center py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                            watchedPriority === val
                              ? cn(conf.bgColor, conf.color, 'border-current')
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
                          )}
                        >
                          {conf.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tags (comma-separated)</Label>
                <input
                  {...register('tags')}
                  placeholder="e.g. Strategic, Cost Reduction, EMEA, Sustainability"
                  className={inputClass(false)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <SectionTitle>Financial &amp; Timeline</SectionTitle>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label required>Estimated Budget</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('estimatedBudget', {
                      required: 'Budget is required',
                      min: { value: 1, message: 'Budget must be greater than 0' },
                    })}
                    placeholder="500000"
                    className={inputClass(!!errors.estimatedBudget)}
                  />
                  {errors.estimatedBudget && <ErrorMsg>{errors.estimatedBudget.message}</ErrorMsg>}
                </div>
                <div className="space-y-1.5">
                  <Label required>Currency</Label>
                  <select {...register('currency')} className={inputClass(false)}>
                    {CURRENCIES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Start Date</Label>
                  <input
                    type="date"
                    {...register('startDate', { required: 'Start date is required' })}
                    className={inputClass(!!errors.startDate)}
                  />
                  {errors.startDate && <ErrorMsg>{errors.startDate.message}</ErrorMsg>}
                </div>
                <div className="space-y-1.5">
                  <Label required>Target End Date</Label>
                  <input
                    type="date"
                    {...register('targetEndDate', { required: 'Target end date is required' })}
                    className={inputClass(!!errors.targetEndDate)}
                  />
                  {errors.targetEndDate && <ErrorMsg>{errors.targetEndDate.message}</ErrorMsg>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Potential Suppliers (comma-separated)</Label>
                <input
                  {...register('suppliers')}
                  placeholder="e.g. Accenture, Deloitte, SAP SE"
                  className={inputClass(false)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <SectionTitle>Requester &amp; Stakeholders</SectionTitle>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Requested By</Label>
                  <input
                    {...register('requestedBy', { required: 'Requester name is required' })}
                    placeholder="Full name"
                    className={inputClass(!!errors.requestedBy)}
                  />
                  {errors.requestedBy && <ErrorMsg>{errors.requestedBy.message}</ErrorMsg>}
                </div>
                <div className="space-y-1.5">
                  <Label required>Email</Label>
                  <input
                    type="email"
                    {...register('requestedByEmail', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                    placeholder="you@company.com"
                    className={inputClass(!!errors.requestedByEmail)}
                  />
                  {errors.requestedByEmail && <ErrorMsg>{errors.requestedByEmail.message}</ErrorMsg>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label required>Department</Label>
                <select {...register('department', { required: 'Department is required' })} className={inputClass(!!errors.department)}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <ErrorMsg>{errors.department.message}</ErrorMsg>}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <SectionTitle>Business Justification</SectionTitle>

              <div className="space-y-1.5">
                <Label required>Business Justification</Label>
                <textarea
                  {...register('businessJustification', {
                    required: 'Business justification is required',
                    minLength: { value: 30, message: 'Please provide more detail (min. 30 characters)' },
                  })}
                  placeholder="Why is this project necessary? What business problem does it solve?"
                  rows={4}
                  className={cn(inputClass(!!errors.businessJustification), 'resize-none')}
                />
                {errors.businessJustification && <ErrorMsg>{errors.businessJustification.message}</ErrorMsg>}
              </div>

              <div className="space-y-1.5">
                <Label>Expected Benefits</Label>
                <textarea
                  {...register('expectedBenefits')}
                  placeholder="Describe the expected benefits, cost savings, or strategic value…"
                  rows={3}
                  className={cn(inputClass(false), 'resize-none')}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Key Risks</Label>
                <textarea
                  {...register('risks')}
                  placeholder="Identify any known risks, dependencies, or concerns…"
                  rows={3}
                  className={cn(inputClass(false), 'resize-none')}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : () => setCurrentStep((s) => s - 1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'h-2 rounded-full transition-all',
                  currentStep === step.id ? 'bg-blue-600 w-5' : currentStep > step.id ? 'bg-emerald-400 w-2' : 'bg-slate-200 w-2',
                )}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Request
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-400 bg-red-50'
      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent',
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-slate-100">
      <h3 className="text-base font-semibold text-slate-900">{children}</h3>
    </div>
  );
}
