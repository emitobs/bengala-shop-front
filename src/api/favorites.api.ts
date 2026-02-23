import { apiClient } from '@/api/client';
import type { Product } from '@/types';

// ── Response types ─────────────────────────────────────────────

export interface FavoriteItem {
  id: string;
  createdAt: string;
  product: Product;
}

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
}

// ── API functions ──────────────────────────────────────────────

export async function getFavoritesApi(): Promise<FavoriteItem[]> {
  const response = await apiClient.get<{ data: FavoriteItem[] }>('/favorites');
  return response.data.data;
}

export async function toggleFavoriteApi(productId: string): Promise<ToggleFavoriteResponse> {
  const response = await apiClient.post<ToggleFavoriteResponse>(`/favorites/${productId}`);
  return response.data;
}
