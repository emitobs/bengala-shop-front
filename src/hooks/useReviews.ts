import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProductReviewsApi,
  createReviewApi,
  type CreateReviewRequest,
  type GetReviewsParams,
} from '@/api/reviews.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useProductReviews(productId: string | undefined, params?: GetReviewsParams) {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: () => getProductReviewsApi(productId!, params),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReviewApi(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Resena enviada exitosamente');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
