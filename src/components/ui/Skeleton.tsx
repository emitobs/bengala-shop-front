import { cn } from '@/lib/cn';

const variantStyles = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full',
  rect: 'rounded-input',
} as const;

export interface SkeletonProps {
  className?: string;
  variant?: keyof typeof variantStyles;
}

export default function Skeleton({
  className,
  variant = 'rect',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variantStyles[variant],
        variant === 'circle' && !className?.includes('h-') && 'h-10 w-10',
        variant === 'rect' && !className?.includes('h-') && 'h-20 w-full',
        className,
      )}
      aria-hidden="true"
    />
  );
}
