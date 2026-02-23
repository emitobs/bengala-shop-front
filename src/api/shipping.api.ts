import { apiClient } from '@/api/client';

// ── Response types ─────────────────────────────────────────────

export interface ShippingCalculationResponse {
  cost: number;
  estimatedDays: number;
  zoneName: string;
}

// ── API functions ──────────────────────────────────────────────

export async function calculateShippingApi(
  department: string,
): Promise<ShippingCalculationResponse> {
  const response = await apiClient.post<ShippingCalculationResponse>('/shipping/calculate', {
    department,
  });
  return response.data;
}
