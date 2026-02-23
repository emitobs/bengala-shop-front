import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

const gapStyles = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
} as const;

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: keyof typeof sizeStyles;
  readOnly?: boolean;
  className?: string;
}

export default function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = !readOnly && !!onChange;
  const displayValue = hoverValue ?? value;

  return (
    <div
      className={cn(
        'inline-flex items-center',
        gapStyles[size],
        className,
      )}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={
        isInteractive
          ? 'Calificacion'
          : `Calificacion: ${value} de ${max}`
      }
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;
        const isHalfFilled = !isFilled && starValue - 0.5 <= displayValue;

        return (
          <button
            key={index}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(starValue)}
            onMouseEnter={() => isInteractive && setHoverValue(starValue)}
            onMouseLeave={() => isInteractive && setHoverValue(null)}
            className={cn(
              'relative shrink-0 focus:outline-none',
              isInteractive
                ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm'
                : 'cursor-default',
            )}
            aria-label={`${starValue} ${starValue === 1 ? 'estrella' : 'estrellas'}`}
            role={isInteractive ? 'radio' : undefined}
            aria-checked={isInteractive ? starValue === Math.round(value) : undefined}
            tabIndex={isInteractive ? 0 : -1}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeStyles[size],
                'text-gray-300',
              )}
              strokeWidth={1.5}
            />
            {/* Filled overlay */}
            {(isFilled || isHalfFilled) && (
              <Star
                className={cn(
                  sizeStyles[size],
                  'absolute inset-0 text-accent fill-accent',
                  isHalfFilled && 'clip-path-half',
                )}
                strokeWidth={1.5}
                style={
                  isHalfFilled
                    ? { clipPath: 'inset(0 50% 0 0)' }
                    : undefined
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
