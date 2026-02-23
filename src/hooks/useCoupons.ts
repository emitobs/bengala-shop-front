import { useMutation } from '@tanstack/react-query';
import { validateCouponApi } from '@/api/coupons.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

export function useValidateCoupon() {
  return useMutation({
    mutationFn: validateCouponApi,
    onError: () => {
      // Error is handled by the component
    },
  });
}

export function getCouponErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'El cupon ingresado no es valido';
}
