import { Link } from 'react-router-dom';
import type { ChatProduct } from '@/api/assistant.api';

interface ChatProductCardProps {
  product: ChatProduct;
}

export default function ChatProductCard({ product }: ChatProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.basePrice);

  return (
    <Link
      to={`/productos/${product.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-white p-2 transition-colors hover:border-primary/30 hover:bg-primary-light/30"
    >
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Sin img
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-secondary">
          {product.name}
        </p>
        <p className="text-sm font-bold text-primary">{formattedPrice}</p>
      </div>
    </Link>
  );
}
