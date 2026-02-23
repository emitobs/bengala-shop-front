import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CategoryCardProps {
  name: string;
  slug: string;
  icon: LucideIcon;
  productCount: number;
  gradient: [string, string];
  className?: string;
}

export default function CategoryCard({
  name,
  slug,
  icon: Icon,
  productCount,
  gradient,
  className,
}: CategoryCardProps) {
  return (
    <Link
      to={`/categorias/${slug}`}
      className={cn(
        'group flex flex-col items-center justify-center gap-3 p-6',
        'rounded-[20px] text-white text-center',
        'shadow-sm hover:shadow-xl',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.05] hover:-translate-y-1.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candy-purple focus-visible:ring-offset-2',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        boxShadow: undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 16px 32px -8px ${gradient[0]}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center h-14 w-14 rounded-full',
          'bg-white/20 backdrop-blur-sm',
          'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
        )}
      >
        <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold leading-tight">{name}</span>
        <span className="inline-flex justify-center">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90">
            {productCount} {productCount === 1 ? 'producto' : 'productos'}
          </span>
        </span>
      </div>
    </Link>
  );
}
