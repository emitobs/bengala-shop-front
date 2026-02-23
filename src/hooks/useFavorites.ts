import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFavoritesApi, toggleFavoriteApi } from '@/api/favorites.api';
import { useAuthStore } from '@/stores/auth.store';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useFavorites() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritesApi,
    enabled: !!accessToken,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => toggleFavoriteApi(productId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(
        result.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos',
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
