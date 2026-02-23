import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

const compareSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

export interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export default function PriceTag({
  price,
  compareAtPrice,
  size = 'md',
  className,
}: PriceTagProps) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;

  return (
    <div className={cn('inline-flex items-baseline gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-bold text-secondary',
          sizeStyles[size],
          hasDiscount && 'text-primary',
        )}
      >
        {formatUYU(price)}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            'text-gray-400 line-through font-normal',
            compareSizeStyles[size],
          )}
        >
          {formatUYU(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
