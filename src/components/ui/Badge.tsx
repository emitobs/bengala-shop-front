import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-error',
  info: 'bg-blue-50 text-blue-600',
} as const;

export interface BadgeProps {
  variant?: keyof typeof variantStyles;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
