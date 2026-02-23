import { apiClient } from '@/api/client';
import type { Review, PaginationMeta } from '@/types';

// ── Request types ──────────────────────────────────────────────

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
}

// ── Response types ─────────────────────────────────────────────

export interface ReviewListResponse {
  data: Review[];
  meta: PaginationMeta;
  averageRating: number;
  totalCount: number;
}

// ── API functions ──────────────────────────────────────────────

export async function getProductReviewsApi(
  productId: string,
  params?: GetReviewsParams,
): Promise<ReviewListResponse> {
  const response = await apiClient.get<ReviewListResponse>(`/reviews/product/${productId}`, {
    params,
  });
  return response.data;
}

export async function createReviewApi(data: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post<Review>('/reviews', data);
  return response.data;
}
