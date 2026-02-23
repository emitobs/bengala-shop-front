import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { calculateShippingApi } from '@/api/shipping.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useCalculateShipping() {
  return useMutation({
    mutationFn: (department: string) => calculateShippingApi(department),
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
