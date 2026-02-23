import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  type AddToCartRequest,
} from '@/api/cart.api';
import { useAuthStore } from '@/stores/auth.store';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useCart() {
  const setItems = useCartStore((state) => state.setItems);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await getCartApi();
      setItems(cart.items);
      return cart;
    },
    enabled: !!accessToken,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const setItems = useCartStore((state) => state.setItems);

  return useMutation({
    mutationFn: (data: AddToCartRequest) => addToCartApi(data),
    onSuccess: (cart) => {
      setItems(cart.items);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Producto agregado al carrito');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const setItems = useCartStore((state) => state.setItems);

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemApi(itemId, quantity),
    onSuccess: (cart) => {
      setItems(cart.items);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const setItems = useCartStore((state) => state.setItems);

  return useMutation({
    mutationFn: (itemId: string) => removeCartItemApi(itemId),
    onSuccess: (cart) => {
      setItems(cart.items);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Producto eliminado del carrito');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const setItems = useCartStore((state) => state.setItems);

  return useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Carrito vaciado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
