import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDashboardApi,
  getAdminProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getAdminOrdersApi,
  getOrderDetailApi,
  updateOrderStatusApi,
  getAdminUsersApi,
  adminCreateUserApi,
  adminUpdateUserApi,
  adminResetPasswordApi,
  getAdminCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getShippingZonesApi,
  createShippingZoneApi,
  updateShippingZoneApi,
  deleteShippingZoneApi,
  getAdminBannersApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
  type GetAdminProductsParams,
  type GetAdminOrdersParams,
  type GetAdminUsersParams,
  type UpdateOrderStatusRequest,
  type CreateProductRequest,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CreateShippingZoneRequest,
  type UpdateShippingZoneRequest,
  type CreateBannerRequest,
  type UpdateBannerRequest,
  type AdminCreateUserRequest,
  type AdminUpdateUserRequest,
  type AdminResetPasswordRequest,
  getAdminCouponsApi,
  createCouponApi,
  toggleCouponApi,
  deleteCouponApi,
  type CreateCouponRequest,
  getStoreSettingsApi,
  updateStoreSettingsApi,
  getPaymentCredentialsApi,
  getBranchesApi,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
  regenerateBranchKeyApi,
  getSyncLogsApi,
  type UpdateStoreSettingsRequest,
  type CreateBranchRequest,
  type UpdateBranchRequest,
} from '@/api/admin.api';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || 'Ocurrio un error inesperado';
}

// ── Dashboard ──────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardApi,
  });
}

// ── Products ───────────────────────────────────────────────────

export function useAdminProducts(params?: GetAdminProductsParams) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => getAdminProductsApi(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProductApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductRequest> }) =>
      updateProductApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Orders ─────────────────────────────────────────────────────

export function useAdminOrders(params?: GetAdminOrdersParams) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => getAdminOrdersApi(params),
  });
}

export function useOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => getOrderDetailApi(id!),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) =>
      updateOrderStatusApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Estado del pedido actualizado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Users ──────────────────────────────────────────────────────

export function useAdminUsers(params?: GetAdminUsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getAdminUsersApi(params),
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUserRequest) => adminCreateUserApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Usuario creado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserRequest }) =>
      adminUpdateUserApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Usuario actualizado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminResetPasswordRequest }) =>
      adminResetPasswordApi(id, data),
    onSuccess: () => {
      toast.success('Contrasena restablecida');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Categories ─────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: getAdminCategoriesApi,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategoryApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria creada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategoryApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria actualizada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria eliminada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Shipping Zones ─────────────────────────────────────────────

export function useShippingZones() {
  return useQuery({
    queryKey: ['admin', 'shipping-zones'],
    queryFn: async () => {
      const result = await getShippingZonesApi();
      return result.data;
    },
  });
}

export function useCreateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShippingZoneRequest) => createShippingZoneApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-zones'] });
      toast.success('Zona de envio creada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShippingZoneRequest }) =>
      updateShippingZoneApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-zones'] });
      toast.success('Zona de envio actualizada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShippingZoneApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-zones'] });
      toast.success('Zona de envio eliminada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Banners ────────────────────────────────────────────────────

export function useAdminBanners() {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const result = await getAdminBannersApi();
      return result.data;
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerRequest) => createBannerApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner creado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerRequest }) =>
      updateBannerApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner actualizado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBannerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner eliminado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Coupons ───────────────────────────────────────────────────

export function useAdminCoupons(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn: () => getAdminCouponsApi(params),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponRequest) => createCouponApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Cupon creado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useToggleCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleCouponApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Estado del cupon actualizado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCouponApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Cupon eliminado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ── Store Settings ────────────────────────────────────────────

export function useStoreSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: getStoreSettingsApi,
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStoreSettingsRequest) =>
      updateStoreSettingsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Configuracion actualizada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function usePaymentCredentials() {
  return useQuery({
    queryKey: ['admin', 'payment-credentials'],
    queryFn: getPaymentCredentialsApi,
  });
}

// ── Branches (Sucursales) ────────────────────────────────────

export function useBranches() {
  return useQuery({
    queryKey: ['admin', 'branches'],
    queryFn: getBranchesApi,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchRequest) => createBranchApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('Sucursal creada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchRequest }) =>
      updateBranchApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('Sucursal actualizada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBranchApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('Sucursal desactivada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRegenerateBranchKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regenerateBranchKeyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('API Key regenerada');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useSyncLogs(params?: { branchId?: string; type?: string }) {
  return useQuery({
    queryKey: ['admin', 'sync-logs', params],
    queryFn: () => getSyncLogsApi(params),
  });
}
