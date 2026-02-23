import { apiClient } from '@/api/client';
import type { Product, Category, PaginationMeta } from '@/types';

// ── Request types ──────────────────────────────────────────────

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  isFeatured?: boolean;
  hasDiscount?: boolean;
}

// ── Response types ─────────────────────────────────────────────

export interface ProductListResponse {
  data: Product[];
  meta: PaginationMeta;
}

export interface CategoryWithProductsResponse {
  category: Category;
  products: Product[];
  meta: PaginationMeta;
}

// ── API functions ──────────────────────────────────────────────

export async function getProductsApi(params?: GetProductsParams): Promise<ProductListResponse> {
  const response = await apiClient.get<ProductListResponse>('/products', { params });
  return response.data;
}

export async function getProductBySlugApi(slug: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${slug}`);
  return response.data;
}

export async function getCategoriesApi(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}

export async function getCategoryBySlugApi(slug: string): Promise<CategoryWithProductsResponse> {
  const response = await apiClient.get<CategoryWithProductsResponse>(`/categories/${slug}`);
  return response.data;
}
