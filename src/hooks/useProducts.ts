import { useQuery } from '@tanstack/react-query';
import {
  getProductsApi,
  getProductBySlugApi,
  getCategoriesApi,
  getCategoryBySlugApi,
  type GetProductsParams,
} from '@/api/products.api';

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsApi(params),
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProductBySlugApi(slug!),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => getCategoryBySlugApi(slug!),
    enabled: !!slug,
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => getProductsApi({ search: query }),
    enabled: query.length >= 2,
  });
}
