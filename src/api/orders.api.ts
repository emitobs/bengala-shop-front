import { apiClient } from '@/api/client';
import type { Order, PaginationMeta } from '@/types';

// ── Request types ──────────────────────────────────────────────

export interface CreateOrderRequest {
  addressId: string;
  paymentProvider: string;
  notes?: string;
  couponCode?: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

// ── Response types ─────────────────────────────────────────────

export interface OrderListResponse {
  data: Order[];
  meta: PaginationMeta;
}

// ── API functions ──────────────────────────────────────────────

export async function createOrderApi(data: CreateOrderRequest): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', data);
  return response.data;
}

export async function getOrdersApi(params?: GetOrdersParams): Promise<OrderListResponse> {
  const response = await apiClient.get<OrderListResponse>('/orders', { params });
  return response.data;
}

export async function getOrderByIdApi(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response.data;
}
