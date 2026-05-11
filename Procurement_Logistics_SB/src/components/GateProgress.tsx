import type { GateId } from '../types';
import { GATE_DEFINITIONS, TOLLGATE_STATUS_CONFIG } from '../data/constants';
import { cn } from '../utils/helpers';

interface GateProgressProps {
  currentGate: GateId;
  gates: { id: GateId; status: string }[];
  compact?: boolean;
}

const GATE_COLORS: Record<number, { active: string; done: string; dot: string }> = {
  0: { active: 'bg-violet-600', done: 'bg-violet-500', dot: 'ring-violet-300' },
  1: { active: 'bg-blue-600', done: 'bg-blue-500', dot: 'ring-blue-300' },
  2: { active: 'bg-cyan-600', done: 'bg-cyan-500', dot: 'ring-cyan-300' },
  3: { active: 'bg-amber-600', done: 'bg-amber-500', dot: 'ring-amber-300' },
  4: { active: 'bg-emerald-600', done: 'bg-emerald-500', dot: 'ring-emerald-300' },
};

export function GateProgress({ gates, compact = false }: GateProgressProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {gates.map((gate) => {
          const statusConf = TOLLGATE_STATUS_CONFIG[gate.status as keyof typeof TOLLGATE_STATUS_CONFIG];
          const colors = GATE_COLORS[gate.id];
          return (
            <div
              key={gate.id}
              title={`${GATE_DEFINITIONS[gate.id].name}: ${statusConf?.label ?? gate.status}`}
              className={cn(
                'h-2 flex-1 rounded-full transition-all',
                gate.status === 'approved'
                  ? colors.done
                  : gate.status === 'in_review'
                    ? colors.active + ' animate-pulse'
                    : gate.status === 'rejected'
                      ? 'bg-red-400'
                      : 'bg-slate-200',
              )}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {gates.map((gate, idx) => {
          const statusConf = TOLLGATE_STATUS_CONFIG[gate.status as keyof typeof TOLLGATE_STATUS_CONFIG];
          const colors = GATE_COLORS[gate.id];
          const isApproved = gate.status === 'approved';
          const isInReview = gate.status === 'in_review';
          const isRejected = gate.status === 'rejected';

          return (
            <div key={gate.id} className="flex flex-col items-center flex-1">
              {idx > 0 && (
                <div className="absolute" style={{ left: `${(idx / 4) * 100 - 10}%`, top: '16px', width: '20%', zIndex: 0 }}>
                  <div
                    className={cn(
                      'h-0.5 w-full',
                      isApproved || gates[idx - 1]?.status === 'approved' ? colors.done : 'bg-slate-200',
                    )}
                  />
                </div>
              )}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all',
                  isApproved
                    ? cn(colors.done, 'text-white ring-2', colors.dot)
                    : isInReview
                      ? cn(colors.active, 'text-white ring-2 ring-offset-2', colors.dot)
                      : isRejected
                        ? 'bg-red-500 text-white ring-2 ring-red-300'
                        : 'bg-slate-200 text-slate-400 ring-2 ring-slate-100',
                )}
              >
                {isApproved ? '✓' : isRejected ? '✕' : gate.id}
              </div>
              <div className="mt-2 text-center">
                <p className={cn('text-xs font-medium', isApproved || isInReview ? 'text-slate-800' : 'text-slate-400')}>
                  Gate {gate.id}
                </p>
                <p className={cn('text-xs mt-0.5', statusConf?.color ?? 'text-slate-400')}>{statusConf?.label ?? gate.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
