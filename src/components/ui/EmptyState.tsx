import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import Button from './Button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-secondary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
