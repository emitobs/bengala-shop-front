import { apiClient } from '@/api/client';
import type { CartItem } from '@/types';

// ── Request types ──────────────────────────────────────────────

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity?: number;
}

// ── Response types ─────────────────────────────────────────────

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ── API functions ──────────────────────────────────────────────

export async function getCartApi(): Promise<CartResponse> {
  const response = await apiClient.get<{ data: CartResponse }>('/cart');
  return response.data.data;
}

export async function addToCartApi(data: AddToCartRequest): Promise<CartResponse> {
  const response = await apiClient.post<{ data: CartResponse }>('/cart/items', data);
  return response.data.data;
}

export async function updateCartItemApi(itemId: string, quantity: number): Promise<CartResponse> {
  const response = await apiClient.patch<{ data: CartResponse }>(`/cart/items/${itemId}`, { quantity });
  return response.data.data;
}

export async function removeCartItemApi(itemId: string): Promise<CartResponse> {
  const response = await apiClient.delete<{ data: CartResponse }>(`/cart/items/${itemId}`);
  return response.data.data;
}

export async function clearCartApi(): Promise<void> {
  await apiClient.delete('/cart');
}
