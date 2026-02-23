import type { Product, Category } from '@/types/product.types';

/**
 * Fallback placeholder image for products without valid images.
 */
export const PRODUCT_PLACEHOLDER_IMAGE =
  'https://placehold.co/400x400/1E1E2E/E85D2C?text=BM';

/**
 * Generate initials from a product name for placeholder display.
 */
export function getProductInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Get the primary image URL from an API product's images array,
 * falling back to placeholder when no valid image exists.
 */
export function getProductImageUrl(
  images?: Array<{ url: string; isPrimary?: boolean }>,
  productName?: string,
): string {
  if (!images || images.length === 0) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  const primary = images.find((img) => img.isPrimary);
  const url = primary?.url ?? images[0].url;

  return resolveImageUrl(url, productName);
}

/**
 * Normalize a typed Product from the API.
 *
 * Prisma Decimal fields come over the wire as strings even though
 * TypeScript thinks they are numbers. This function ensures all
 * numeric fields are actual numbers and image URLs are valid.
 */
export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    averageRating: product.averageRating ? Number(product.averageRating) : null,
    reviewCount: Number(product.reviewCount ?? 0),
    images: product.images.map((img, index) => ({
      ...img,
      url: resolveImageUrl(img.url, product.name),
      sortOrder: img.sortOrder ?? index,
    })),
    variants: product.variants.map((v: any) => ({
      ...v,
      price: Number(product.basePrice) + Number(v.priceAdjustment ?? v.price ?? 0),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: Number(v.stock),
    })),
  };
}

/**
 * Normalize an array of products.
 */
export function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}

/**
 * Resolve an image URL, replacing backend relative paths with placeholders.
 */
function resolveImageUrl(url: string, productName?: string): string {
  if (!url) return PRODUCT_PLACEHOLDER_IMAGE;

  if (url.startsWith('/images/') || url.startsWith('/uploads/')) {
    const text = productName
      ? encodeURIComponent(getProductInitials(productName))
      : 'BM';
    return `https://placehold.co/400x400/1E1E2E/E85D2C?text=${text}`;
  }

  return url;
}

/**
 * Normalize a typed Category from the API (children included).
 */
export function normalizeCategory(cat: Category): Category {
  if (!cat) return cat;
  return {
    ...cat,
    children: cat.children?.map(normalizeCategory),
  };
}

/**
 * Compute discount percentage between two prices.
 */
export function getDiscountPercentage(
  price: number,
  compareAtPrice: number | null | undefined,
): number | null {
  if (compareAtPrice == null || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Check if a product is out of stock based on totalStock or variants.
 */
export function isProductOutOfStock(product: Product): boolean {
  if (product.variants.length > 0) {
    return product.variants.every((v) => v.stock <= 0);
  }
  return false;
}
