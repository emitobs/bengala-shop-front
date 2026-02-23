import { apiClient } from '@/api/client';

// ── Request types ──────────────────────────────────────────────

export interface CreatePaymentRequest {
  orderId: string;
  provider: 'MERCADOPAGO' | 'DLOCAL_GO' | 'SIMULATION';
}

// ── Response types ─────────────────────────────────────────────

export interface MercadoPagoPaymentResponse {
  provider: 'MERCADOPAGO';
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface DLocalPaymentResponse {
  provider: 'DLOCAL_GO';
  paymentUrl: string;
}

export interface SimulationPaymentResponse {
  provider: 'SIMULATION';
  paymentUrl: string;
}

export type PaymentResponse = MercadoPagoPaymentResponse | DLocalPaymentResponse | SimulationPaymentResponse;

// ── API functions ──────────────────────────────────────────────

export async function createPaymentApi(data: CreatePaymentRequest): Promise<PaymentResponse> {
  const response = await apiClient.post<PaymentResponse>('/payments/create', data);
  return response.data;
}

export async function confirmSimulationPaymentApi(
  data: { orderId: string; action: 'approve' | 'reject' },
): Promise<void> {
  await apiClient.post('/payments/simulation/confirm', data);
}
