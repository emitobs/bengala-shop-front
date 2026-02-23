import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginacion"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-button text-sm',
          'transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'text-secondary hover:bg-gray-100',
        )}
        aria-label="Pagina anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex items-center justify-center h-9 w-9 text-sm text-gray-400"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isActive}
            className={cn(
              'inline-flex items-center justify-center h-9 w-9 rounded-button text-sm font-medium',
              'transition-colors duration-150',
              isActive
                ? 'bg-primary text-white cursor-default'
                : 'text-secondary hover:bg-gray-100',
            )}
            aria-label={`Pagina ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-button text-sm',
          'transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'text-secondary hover:bg-gray-100',
        )}
        aria-label="Pagina siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
