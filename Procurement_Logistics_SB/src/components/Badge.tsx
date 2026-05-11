import { cn } from '../utils/helpers';

interface BadgeProps {
  label: string;
  color: string;
  bgColor: string;
  className?: string;
}

export function Badge({ label, color, bgColor, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        color,
        bgColor,
        className,
      )}
    >
      {label}
    </span>
  );
}
