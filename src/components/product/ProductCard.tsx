import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRODUCT_PLACEHOLDER_IMAGE, getProductInitials } from '@/lib/product-helpers';
import type { Product } from '@/types/product.types';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import { useAddToCart } from '@/hooks/useCart';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

function getDiscountPercentage(
  price: number,
  compareAtPrice: number | null,
): number | null {
  if (compareAtPrice == null || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sortedImages = [...product.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const mainImage = sortedImages.length > 0 ? sortedImages[0] : null;
  const secondImage = sortedImages.length > 1 ? sortedImages[1] : null;

  const imageUrl = imageError
    ? PRODUCT_PLACEHOLDER_IMAGE
    : (mainImage?.url ?? PRODUCT_PLACEHOLDER_IMAGE);
  const imageAlt = mainImage?.altText ?? product.name;

  const discount = getDiscountPercentage(
    product.basePrice,
    product.compareAtPrice,
  );

  const isOutOfStock =
    product.variants.length > 0 &&
    product.variants.every((v) => v.stock <= 0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const availableVariants = product.variants.filter((v) => v.stock > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (availableVariants.length === 1) {
      addToCart.mutate({
        productId: product.id,
        variantId: availableVariants[0].id,
        quantity: 1,
      });
    } else {
      navigate(`/productos/${product.slug}`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(true);
  };

  return (
    <Link
      to={`/productos/${product.slug}`}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-surface border border-border',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:shadow-xl hover:shadow-candy-purple/10 hover:-translate-y-1.5 hover:border-candy-purple/20',
        'overflow-hidden',
        className,
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Primary image or fallback */}
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-candy-purple/5 to-candy-pink/5">
            <span className="text-3xl font-bold text-candy-purple/40">
              {getProductInitials(product.name)}
            </span>
          </div>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
              onError={handleImageError}
              className={cn(
                'h-full w-full object-cover',
                'transition-all duration-500 ease-out',
                'group-hover:scale-110',
                isImageLoaded ? 'opacity-100' : 'opacity-0',
                secondImage && 'group-hover:opacity-0',
              )}
            />

            {/* Secondary image (crossfade on hover) */}
            {secondImage && (
              <img
                src={secondImage.url}
                alt={secondImage.altText || product.name}
                loading="lazy"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover',
                  'transition-all duration-500 ease-out',
                  'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-110',
                )}
              />
            )}
          </>
        )}

        {/* Skeleton while loading */}
        {!isImageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
            <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-secondary tracking-wide">
              Agotado
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discount !== null && (
            <span className="inline-flex items-center rounded-full bg-candy-pink px-2.5 py-1 text-xs font-bold text-white shadow-md">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-candy-purple px-2.5 py-1 text-xs font-bold text-white shadow-md">
              <Sparkles className="h-3 w-3" />
              Destacado
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-3 right-3 z-10',
            'flex items-center justify-center h-11 w-11 rounded-full',
            'bg-white/80 backdrop-blur-sm shadow-sm',
            'transition-all duration-200',
            'hover:bg-white hover:shadow-md hover:scale-110',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candy-pink focus-visible:ring-offset-1',
            isFavorite && 'bg-candy-pink/10',
          )}
          aria-label={
            isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
          }
        >
          <Heart
            className={cn(
              'h-4.5 w-4.5 transition-all duration-200',
              isFavorite
                ? 'fill-candy-pink text-candy-pink scale-110'
                : 'text-gray-500',
            )}
            strokeWidth={2}
          />
        </button>

        {/* Quick action overlay on hover */}
        <div
          className={cn(
            'absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 px-3 pb-3 pt-10',
            'bg-gradient-to-t from-black/40 via-black/15 to-transparent',
            'transition-all duration-300 ease-out',
            'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0',
          )}
        >
          <span
            className={cn(
              'flex h-10 flex-1 items-center justify-center gap-2 rounded-full',
              'bg-white/95 text-secondary text-sm font-semibold shadow-md backdrop-blur-sm',
              'transition-colors duration-200 hover:bg-candy-purple hover:text-white',
            )}
          >
            <Eye className="h-4 w-4" />
            Ver detalle
          </span>
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                'bg-candy-green text-white shadow-md',
                'transition-all duration-200 hover:brightness-110 hover:scale-105',
                'active:scale-95',
                'disabled:opacity-60',
              )}
              aria-label="Agregar al carrito"
            >
              {addToCart.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-1.5">
        {/* Category */}
        {(product.category?.name || product.categories?.[0]?.name) && (
          <span className="text-[11px] font-semibold text-candy-purple/70 uppercase tracking-widest">
            {product.category?.name ?? product.categories?.[0]?.name}
          </span>
        )}

        {/* Product name */}
        <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-candy-purple transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        {product.averageRating !== null && product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Rating value={product.averageRating} size="sm" readOnly />
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Spacer to push price to bottom */}
        <div className="mt-auto pt-1" />

        {/* Price */}
        <PriceTag
          price={product.basePrice}
          compareAtPrice={product.compareAtPrice ?? undefined}
          size="md"
        />
      </div>
    </Link>
  );
}
