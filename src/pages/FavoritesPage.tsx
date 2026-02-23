import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { normalizeProducts, getDiscountPercentage, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/product-helpers';
import Breadcrumb from '@/components/ui/Breadcrumb';
import EmptyState from '@/components/ui/EmptyState';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import Badge from '@/components/ui/Badge';
import Card, { CardBody } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col rounded-card bg-surface border border-border shadow-sm overflow-hidden"
        >
          <Skeleton variant="rect" className="aspect-square w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-5 w-24 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favoriteItems, isLoading, isError } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const products = useMemo(() => {
    if (!favoriteItems) return [];
    const rawProducts = favoriteItems.map((item) => item.product);
    return normalizeProducts(rawProducts);
  }, [favoriteItems]);

  const handleRemoveFavorite = (productId: string) => {
    toggleFavorite.mutate(productId);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Favoritos' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-secondary">Mis Favoritos</h1>
        {!isLoading && products.length > 0 && (
          <span className="text-sm text-gray-400">
            ({products.length} {products.length === 1 ? 'producto' : 'productos'})
          </span>
        )}
      </div>

      {/* Loading state */}
      {isLoading && <FavoritesSkeleton />}

      {/* Error state */}
      {isError && (
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" />
            <p className="text-gray-500">
              No se pudieron cargar tus favoritos. Intenta de nuevo mas tarde.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Empty / Favorites grid */}
      {!isLoading && !isError && (
        <>
          {products.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Tu lista de favoritos esta vacia"
              description="Guarda los productos que te gusten para encontrarlos mas facil."
              actionLabel="Descubri productos"
              onAction={() => navigate('/productos')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const mainImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
                const imageUrl = mainImage?.url ?? PRODUCT_PLACEHOLDER_IMAGE;
                const discount = getDiscountPercentage(product.basePrice, product.compareAtPrice);

                return (
                  <div
                    key={product.id}
                    className={cn(
                      'group relative flex flex-col rounded-card bg-surface border border-border',
                      'shadow-sm transition-all duration-300 ease-out overflow-hidden',
                      'hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 hover:border-primary/20',
                    )}
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      disabled={toggleFavorite.isPending}
                      className={cn(
                        'absolute top-3 right-3 z-20',
                        'flex items-center justify-center h-8 w-8 rounded-full',
                        'bg-white/90 backdrop-blur-sm shadow-sm',
                        'transition-all duration-200',
                        'hover:bg-red-50 hover:shadow-md',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        'disabled:opacity-50',
                      )}
                      aria-label="Quitar de favoritos"
                    >
                      <X className="h-4 w-4 text-gray-500 hover:text-error" />
                    </button>

                    {/* Image */}
                    <a href={`/productos/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={imageUrl}
                        alt={mainImage?.altText ?? product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        {discount !== null && (
                          <Badge variant="error" className="bg-primary text-white font-bold shadow-md">
                            -{discount}%
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="warning" className="shadow-md font-bold">
                            Destacado
                          </Badge>
                        )}
                      </div>

                      {/* Favorite heart indicator */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <Heart className="h-5 w-5 text-primary fill-primary" />
                      </div>
                    </a>

                    {/* Content */}
                    <a href={`/productos/${product.slug}`} className="flex flex-1 flex-col p-4 gap-1.5">
                      <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest">
                        {product.category?.name ?? product.categories?.[0]?.name ?? ''}
                      </span>
                      <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {product.name}
                      </h3>
                      {product.averageRating !== null && product.reviewCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Rating value={product.averageRating} size="sm" readOnly />
                          <span className="text-xs text-gray-400">({product.reviewCount})</span>
                        </div>
                      )}
                      <div className="mt-auto pt-1" />
                      <PriceTag
                        price={product.basePrice}
                        compareAtPrice={product.compareAtPrice ?? undefined}
                        size="md"
                      />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
