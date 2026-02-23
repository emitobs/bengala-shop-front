import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createOrderApi,
  getOrdersApi,
  getOrderByIdApi,
  type CreateOrderRequest,
  type GetOrdersParams,
} from '@/api/orders.api';
import { useCartStore } from '@/stores/cart.store';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useOrders(params?: GetOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrdersApi(params),
  });
}

export function useOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderByIdApi(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const setItems = useCartStore((state) => state.setItems);

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => createOrderApi(data),
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido creado exitosamente');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
