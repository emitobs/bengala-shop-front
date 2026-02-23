import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Truck,
  CreditCard,
  Share2,
  Minus,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  RotateCcw,
  Facebook,
  Twitter,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { normalizeProduct, normalizeProducts, getProductInitials, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/product-helpers';
import { useProductBySlug, useProducts } from '@/hooks/useProducts';
import { useProductReviews, useCreateReview } from '@/hooks/useReviews';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types/product.types';
import type { Review } from '@/types/review.types';

// ---------------------------------------------------------------------------
// Variant color map (for color swatches)
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<string, string> = {
  Negro: '#1E1E2E',
  Blanco: '#F5F5F5',
  Azul: '#3B82F6',
  Rojo: '#EF4444',
  Verde: '#22C55E',
  Rosa: '#EC4899',
  Gris: '#9CA3AF',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type TabId = 'description' | 'specs' | 'reviews';

function ReviewCard({ review }: { review: Review }) {
  const formattedDate = new Intl.DateTimeFormat('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(review.createdAt));

  const userName = review.user
    ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
    : 'Usuario';

  return (
    <div className="rounded-card border border-border bg-surface p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm">
            {userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary">
                {userName}
              </span>
              {review.isVerified && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-success">
                  <Check className="h-3 w-3" />
                  Compra verificada
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
        </div>
        <Rating value={review.rating} size="sm" readOnly />
      </div>
      {review.title && (
        <h4 className="text-sm font-semibold text-secondary mb-1.5">
          {review.title}
        </h4>
      )}
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review form
// ---------------------------------------------------------------------------

function ReviewForm({ productId }: { productId: string }) {
  const user = useAuthStore((s) => s.user);
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  if (!user) {
    return (
      <div className="mb-8 rounded-card border border-border bg-surface p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Inicia sesion para dejar tu resena
        </p>
        <Link to="/iniciar-sesion">
          <Button variant="outline" size="sm">Iniciar sesion</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Selecciona una puntuacion');
      return;
    }
    createReview.mutate(
      { productId, rating, title: title.trim() || undefined, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setTitle('');
          setComment('');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-card border border-border bg-surface p-6">
      <h3 className="text-base font-semibold text-secondary mb-4">Escribi tu resena</h3>

      {/* Star rating */}
      <div className="mb-4">
        <label className="text-sm font-medium text-secondary mb-2 block">Puntuacion</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform duration-150 hover:scale-110"
              aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors duration-150',
                  (hoverRating || rating) >= star
                    ? 'text-accent fill-accent'
                    : 'text-gray-300',
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="text-sm font-medium text-secondary mb-1.5 block">
          Titulo (opcional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume tu experiencia"
          maxLength={120}
          className="w-full rounded-button border border-border bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label htmlFor="review-comment" className="text-sm font-medium text-secondary mb-1.5 block">
          Comentario (opcional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conta mas sobre tu experiencia con este producto"
          rows={3}
          maxLength={1000}
          className="w-full rounded-button border border-border bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <Button type="submit" variant="primary" isLoading={createReview.isPending}>
        Enviar resena
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Product detail skeleton
// ---------------------------------------------------------------------------

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton variant="text" className="w-64 h-4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: Image skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-card" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          {/* Right: Info skeleton */}
          <div className="space-y-4">
            <Skeleton variant="text" className="w-24 h-6" />
            <Skeleton variant="text" className="w-full h-8" />
            <Skeleton variant="text" className="w-48 h-5" />
            <Skeleton variant="text" className="w-32 h-10" />
            <Skeleton variant="text" className="w-full h-4" />
            <Skeleton variant="text" className="w-full h-4" />
            <div className="flex gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-button mt-4" />
            <Skeleton className="h-12 w-full rounded-button" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Not Found State
// ---------------------------------------------------------------------------

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
            <AlertCircle className="h-10 w-10 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-2">
            Producto no encontrado
          </h1>
          <p className="text-gray-500 mb-6">
            El producto que buscas no existe o fue eliminado.
          </p>
          <Link to="/productos">
            <Button variant="primary">Ver todos los productos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch product by slug
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useProductBySlug(slug ?? '');

  // Normalize the API response (Decimal strings -> numbers, image URLs)
  const product: Product | null = useMemo(() => {
    if (!productData) return null;
    return normalizeProduct(productData);
  }, [productData]);

  // Fetch reviews for this product
  const { data: reviewsData } = useProductReviews(product?.id);
  const reviews: Review[] = reviewsData?.data ?? [];

  // Fetch related products (same category)
  const categorySlug = product?.category?.slug ?? product?.categories?.[0]?.slug;
  const { data: relatedData } = useProducts(
    categorySlug ? { categorySlug, limit: 4 } : undefined,
  );
  const relatedProducts: Product[] = useMemo(() => {
    if (!relatedData?.data) return [];
    return normalizeProducts(relatedData.data)
      .filter((p) => p.id !== product?.id)
      .slice(0, 4);
  }, [relatedData, product?.id]);

  // Mutations
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  // Image gallery state
  const sortedImages = useMemo(
    () => (product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [product],
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Initialize variant when product loads
  const initializedVariant = useMemo(() => {
    if (product && product.variants.length > 0 && selectedVariantId === null) {
      return product.variants[0].id;
    }
    return selectedVariantId;
  }, [product, selectedVariantId]);

  const effectiveVariantId = initializedVariant ?? selectedVariantId;
  const selectedVariant = product?.variants.find(
    (v) => v.id === effectiveVariantId,
  );

  // Quantity state
  const [quantity, setQuantity] = useState(1);
  const maxStock = selectedVariant?.stock ?? 99;

  // Tabs state
  const [activeTab, setActiveTab] = useState<TabId>('description');

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Share dropdown
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Loading state
  if (isLoadingProduct) return <ProductDetailSkeleton />;

  // Error or not found
  if (productError || !product) return <ProductNotFound />;

  // Computed values
  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const currentCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const hasDiscount =
    currentCompareAtPrice != null && currentCompareAtPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((currentCompareAtPrice! - currentPrice) / currentCompareAtPrice!) *
          100,
      )
    : 0;

  const tabs = [
    { id: 'description' as TabId, label: 'Descripcion' },
    { id: 'specs' as TabId, label: 'Especificaciones' },
    { id: 'reviews' as TabId, label: 'Resenas', count: reviews.length || product.reviewCount },
  ];

  // Image navigation
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1,
    );
  };
  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1,
    );
  };

  // Quantity handlers
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product.id,
      variantId: effectiveVariantId ?? undefined,
      quantity,
    });
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toggleFavorite.mutate(product.id);
  };

  // Handle image error
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const currentImageUrl = sortedImages[selectedImageIndex]?.url;
  const currentImageHasError = imageErrors[selectedImageIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Productos', href: '/productos' },
            { label: product.category?.name ?? product.categories?.[0]?.name ?? 'Categoria', href: `/categorias/${product.category?.slug ?? product.categories?.[0]?.slug ?? ''}` },
            { label: product.name },
          ]}
          className="mb-8"
        />

        {/* Main product section: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* LEFT: Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className={cn(
                'relative aspect-square overflow-hidden rounded-card border border-border bg-gray-50',
                'group cursor-zoom-in',
                isImageZoomed && 'cursor-zoom-out',
              )}
              onClick={() => setIsImageZoomed(!isImageZoomed)}
            >
              {currentImageHasError || sortedImages.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/80">
                  <span className="text-4xl sm:text-5xl font-bold text-primary">
                    {getProductInitials(product.name)}
                  </span>
                </div>
              ) : (
                <img
                  src={currentImageUrl}
                  alt={
                    sortedImages[selectedImageIndex]?.altText || product.name
                  }
                  onError={() => handleImageError(selectedImageIndex)}
                  className={cn(
                    'h-full w-full object-cover transition-transform duration-500 ease-out',
                    isImageZoomed ? 'scale-150' : 'scale-100',
                  )}
                />
              )}

              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    variant="error"
                    className="bg-primary text-white font-bold text-sm px-3 py-1 shadow-lg"
                  >
                    -{discountPercentage}%
                  </Badge>
                </div>
              )}

              {/* Navigation arrows */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className={cn(
                      'absolute left-3 top-1/2 -translate-y-1/2 z-10',
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      'bg-white/80 backdrop-blur-sm shadow-md',
                      'transition-all duration-200',
                      'opacity-0 group-hover:opacity-100',
                      'hover:bg-white hover:scale-110',
                    )}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5 text-secondary" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 z-10',
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      'bg-white/80 backdrop-blur-sm shadow-md',
                      'transition-all duration-200',
                      'opacity-0 group-hover:opacity-100',
                      'hover:bg-white hover:scale-110',
                    )}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-5 w-5 text-secondary" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {sortedImages.length > 1 && (
                <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {selectedImageIndex + 1} / {sortedImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="flex gap-3">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageZoomed(false);
                    }}
                    className={cn(
                      'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2',
                      'transition-all duration-200',
                      'hover:opacity-100',
                      index === selectedImageIndex
                        ? 'border-primary shadow-md opacity-100 ring-2 ring-primary/20'
                        : 'border-border opacity-60 hover:border-gray-300',
                    )}
                  >
                    {imageErrors[index] ? (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs font-bold text-gray-500">
                        {getProductInitials(product.name)}
                      </div>
                    ) : (
                      <img
                        src={image.url}
                        alt={image.altText || `Imagen ${index + 1}`}
                        onError={() => handleImageError(index)}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product info */}
          <div className="flex flex-col">
            {/* Category badge */}
            <Badge
              className="self-start mb-3 bg-primary-light text-primary font-semibold uppercase tracking-wider text-[11px] px-3 py-1"
            >
              {product.category?.name ?? product.categories?.[0]?.name ?? ''}
            </Badge>

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.averageRating !== null && (
              <div className="flex items-center gap-3 mb-4">
                <Rating value={product.averageRating} size="md" readOnly />
                <span className="text-sm text-gray-500">
                  {product.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-150 hover:underline"
                >
                  {product.reviewCount} resena{product.reviewCount !== 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-primary hover:text-primary-dark transition-colors duration-150 hover:underline"
                >
                  Ver resenas
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-border mb-5" />

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <PriceTag
                price={currentPrice}
                compareAtPrice={currentCompareAtPrice ?? undefined}
                size="lg"
              />
              {hasDiscount && (
                <Badge
                  variant="success"
                  className="bg-success/10 text-success font-bold text-sm"
                >
                  Ahorra {discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* Variant selector */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-secondary">
                    {product.variants[0].type === 'COLOR' ? 'Color' : 'Talle'}:
                  </span>
                  {selectedVariant && (
                    <span className="text-sm text-gray-500">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === effectiveVariantId;
                    const isOutOfStock = variant.stock <= 0;
                    const colorHex = COLOR_MAP[variant.name];

                    // Color swatch variant
                    if (variant.type === 'COLOR' && colorHex) {
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            setQuantity(1);
                          }}
                          disabled={isOutOfStock}
                          className={cn(
                            'relative flex h-10 w-10 items-center justify-center rounded-full border-2',
                            'transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                            isSelected
                              ? 'border-primary ring-2 ring-primary/20 scale-110'
                              : 'border-gray-200 hover:border-gray-400 hover:scale-105',
                            isOutOfStock && 'opacity-40 cursor-not-allowed',
                          )}
                          aria-label={`${variant.name}${isOutOfStock ? ' - Agotado' : ''}`}
                          title={variant.name}
                        >
                          <span
                            className="h-7 w-7 rounded-full shadow-inner"
                            style={{ backgroundColor: colorHex }}
                          />
                          {isSelected && (
                            <Check
                              className={cn(
                                'absolute h-4 w-4',
                                variant.name === 'Blanco'
                                  ? 'text-secondary'
                                  : 'text-white',
                              )}
                              strokeWidth={3}
                            />
                          )}
                          {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="h-[2px] w-8 rotate-45 bg-gray-400 rounded" />
                            </span>
                          )}
                        </button>
                      );
                    }

                    // Text variant (size, etc.)
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setQuantity(1);
                        }}
                        disabled={isOutOfStock}
                        className={cn(
                          'relative flex h-10 min-w-[2.75rem] items-center justify-center rounded-button border-2 px-3',
                          'text-sm font-medium',
                          'transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-gray-200 bg-white text-secondary hover:border-primary hover:text-primary',
                          isOutOfStock &&
                            'opacity-40 cursor-not-allowed line-through',
                        )}
                        aria-label={`${variant.name}${isOutOfStock ? ' - Agotado' : ''}`}
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Solo quedan {selectedVariant.stock} unidades
                  </p>
                )}
              </div>
            )}

            {/* Quantity selector */}
            <div className="mb-6">
              <span className="text-sm font-semibold text-secondary mb-3 block">
                Cantidad
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-button border border-border',
                    'text-secondary transition-all duration-150',
                    'hover:border-primary hover:text-primary hover:bg-primary-light',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-secondary disabled:hover:bg-transparent',
                  )}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-14 items-center justify-center rounded-button border border-border text-sm font-semibold text-secondary bg-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= maxStock}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-button border border-border',
                    'text-secondary transition-all duration-150',
                    'hover:border-primary hover:text-primary hover:bg-primary-light',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-secondary disabled:hover:bg-transparent',
                  )}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                isLoading={addToCart.isPending}
              >
                <ShoppingCart className="h-5 w-5" />
                Agregar al carrito
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleToggleFavorite}
                className={cn(
                  isFavorite && 'border-primary bg-primary-light text-primary',
                )}
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isFavorite && 'fill-primary',
                  )}
                />
                {isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}
              </Button>
            </div>

            {/* Shipping & payment info */}
            <div className="rounded-card border border-border bg-gray-50/50 divide-y divide-border">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <Truck className="h-4.5 w-4.5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Envio gratis a partir de $3.000
                  </p>
                  <p className="text-xs text-gray-400">
                    Entrega en 24-72 horas habiles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <CreditCard className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">
                    MercadoPago y dLocal Go
                  </p>
                  <p className="text-xs text-gray-400">
                    Tarjetas, debito, transferencia y mas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50">
                  <Shield className="h-4.5 w-4.5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Garantia de 12 meses
                  </p>
                  <p className="text-xs text-gray-400">
                    Soporte tecnico incluido
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                  <RotateCcw className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">
                    30 dias de devolucion
                  </p>
                  <p className="text-xs text-gray-400">
                    Sin preguntas, devolucion gratuita
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-5 relative">
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors duration-150"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 rounded-card border border-border bg-surface p-2 shadow-lg z-20">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
                      setShowShareMenu(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors duration-150"
                    aria-label="Compartir en Facebook"
                  >
                    <Facebook className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product?.name ?? '')}`, '_blank', 'width=600,height=400');
                      setShowShareMenu(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sky-50 text-sky-500 transition-colors duration-150"
                    aria-label="Compartir en Twitter"
                  >
                    <Twitter className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Enlace copiado al portapapeles');
                      setShowShareMenu(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-150"
                    aria-label="Copiar enlace"
                  >
                    <Link2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mb-16">
          {/* Tab headers */}
          <div className="border-b border-border mb-8">
            <nav className="flex gap-0 -mb-px" aria-label="Secciones del producto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-5 py-3.5 text-sm font-medium',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-secondary',
                  )}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.count != null && tab.count > 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full px-1.5 text-[11px] font-bold',
                          activeTab === tab.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="max-w-4xl">
            {/* Description tab */}
            {activeTab === 'description' && (
              <div className="animate-in fade-in duration-300">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  {product.description.split('\n\n').map((paragraph, idx) => {
                    // Check if it's a list
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(Boolean);
                      return (
                        <ul key={idx} className="my-4 space-y-2">
                          {items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 shrink-0 text-success mt-0.5" />
                              <span>{item.replace(/^- /, '')}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Check if it's a header-like line
                    if (paragraph.endsWith(':')) {
                      return (
                        <h3
                          key={idx}
                          className="text-base font-semibold text-secondary mt-6 mb-2"
                        >
                          {paragraph}
                        </h3>
                      );
                    }

                    return (
                      <p key={idx} className="text-sm mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specs tab */}
            {activeTab === 'specs' && (
              <div className="animate-in fade-in duration-300">
                {product && (product.variants.length > 0 || product.sku) ? (
                  <div className="overflow-hidden rounded-card border border-border">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-border">
                        {product.sku && (
                          <tr>
                            <td className="bg-gray-50 px-4 py-3 font-medium text-secondary w-1/3">SKU</td>
                            <td className="px-4 py-3 text-secondary-light">{product.sku}</td>
                          </tr>
                        )}
                        {product.category?.name && (
                          <tr>
                            <td className="bg-gray-50 px-4 py-3 font-medium text-secondary">Categoria</td>
                            <td className="px-4 py-3 text-secondary-light">{product.category.name}</td>
                          </tr>
                        )}
                        {product.variants.length > 0 && (
                          <tr>
                            <td className="bg-gray-50 px-4 py-3 font-medium text-secondary">Variantes</td>
                            <td className="px-4 py-3 text-secondary-light">
                              {product.variants.map((v) => v.name).join(', ')}
                            </td>
                          </tr>
                        )}
                        {selectedVariant && (
                          <>
                            <tr>
                              <td className="bg-gray-50 px-4 py-3 font-medium text-secondary">Variante seleccionada</td>
                              <td className="px-4 py-3 text-secondary-light">{selectedVariant.name}</td>
                            </tr>
                            {selectedVariant.sku && (
                              <tr>
                                <td className="bg-gray-50 px-4 py-3 font-medium text-secondary">SKU variante</td>
                                <td className="px-4 py-3 text-secondary-light">{selectedVariant.sku}</td>
                              </tr>
                            )}
                            <tr>
                              <td className="bg-gray-50 px-4 py-3 font-medium text-secondary">Stock disponible</td>
                              <td className="px-4 py-3 text-secondary-light">{selectedVariant.stock} unidades</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay especificaciones disponibles para este producto.
                  </p>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-300">
                {/* Reviews summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-6 rounded-card bg-surface border border-border">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-secondary mb-1">
                      {product.averageRating?.toFixed(1) ?? '-'}
                    </div>
                    <Rating
                      value={product.averageRating ?? 0}
                      size="md"
                      readOnly
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      {product.reviewCount} resena{product.reviewCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(
                        (r) => r.rating === stars,
                      ).length;
                      const percentage =
                        reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;
                      return (
                        <div
                          key={stars}
                          className="flex items-center gap-2.5"
                        >
                          <span className="text-xs text-gray-500 w-3 text-right">
                            {stars}
                          </span>
                          <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review form */}
                <ReviewForm productId={product.id} />

                {/* Review list */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      Este producto todavia no tiene resenas. Se el primero en opinar!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary tracking-tight">
                Productos relacionados
              </h2>
              <Link
                to="/productos"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-150 hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
