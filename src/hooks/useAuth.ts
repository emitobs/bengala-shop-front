import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
} from '@/api/auth.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

const REFRESH_TOKEN_KEY = 'bengala-refresh-token';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      toast.success('¡Bienvenido de nuevo!');

      const role = response.user.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (role === 'WAREHOUSE') {
        navigate('/admin/pedidos');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
      return logoutApi(refreshToken);
    },
    onSettled: () => {
      clearAuth();
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      queryClient.clear();
      navigate('/iniciar-sesion');
      toast.success('Sesion cerrada correctamente');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordApi(email),
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordApi(data),
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente');
      navigate('/iniciar-sesion');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMeApi,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
