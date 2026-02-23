import { apiClient } from '@/api/client';

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discount: number;
  description?: string;
}

export async function validateCouponApi(data: ValidateCouponRequest): Promise<CouponValidationResponse> {
  const response = await apiClient.post<CouponValidationResponse>('/coupons/validate', data);
  return response.data;
}
