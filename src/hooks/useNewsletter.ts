import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subscribeNewsletterApi } from '@/api/newsletter.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: subscribeNewsletterApi,
    onSuccess: () => {
      toast.success('Te suscribiste exitosamente!');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || 'Error al suscribirse';
      toast.error(message);
    },
  });
}
