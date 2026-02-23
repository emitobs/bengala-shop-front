import { apiClient } from '@/api/client';
import type { Product, Order, User, Banner, Category, PaginationMeta } from '@/types';

// ── Request types ──────────────────────────────────────────────

export interface GetAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  isActive?: string;
  stockFilter?: string;
  sortBy?: string;
}

export interface GetAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
}

export interface AdminResetPasswordRequest {
  password: string;
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface AdminUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateOrderStatusRequest {
  status: string;
  note?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  categoryIds?: string[];
  variants?: {
    name: string;
    sku: string;
    type: string;
    value: string;
    priceAdjustment?: number;
    stock: number;
    lowStockThreshold?: number;
  }[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateShippingZoneRequest {
  name: string;
  departments: string[];
  baseCost: number;
  freeAbove?: number;
  estimatedDays: number;
}

export interface UpdateShippingZoneRequest {
  name?: string;
  departments?: string[];
  baseCost?: number;
  freeAbove?: number;
  estimatedDays?: number;
  isActive?: boolean;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateBannerRequest {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

// ── Response types ─────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  todayOrders: number;
  monthRevenue: number;
  todayRevenue: number;
  totalUsers: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: string | number;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export interface LowStockVariant {
  id: string;
  sku: string;
  name: string;
  stock: number;
  isActive: boolean;
  product: { name: string; sku: string };
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
  lowStockVariants: LowStockVariant[];
  ordersByStatus: OrdersByStatus[];
}

export interface AdminProductListResponse {
  data: AdminProduct[];
  meta: PaginationMeta;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  sku: string;
  basePrice: string | number;
  compareAtPrice: string | number | null;
  costPrice: string | number | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  weight: string | number | null;
  dimensions: unknown;
  createdAt: string;
  updatedAt: string;
  images: { id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }[];
  categories: { name: string }[];
  totalStock: number;
  variants?: { stock: number }[];
}

export interface AdminOrderListResponse {
  data: AdminOrder[];
  meta: PaginationMeta;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  shippingCost: string | number;
  discount: string | number;
  total: string | number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: { id: string; productName: string; quantity: number }[];
  payment: { status: string; provider: string } | null;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'WAREHOUSE' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
  _count: { products: number };
}

export interface ShippingZone {
  id: string;
  name: string;
  departments: string[];
  baseCost: string | number;
  freeAbove: string | number | null;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── API functions ──────────────────────────────────────────────

// Dashboard
export async function getDashboardApi(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/admin/dashboard');
  return response.data;
}

// Products Admin
export async function getAdminProductsApi(
  params?: GetAdminProductsParams,
): Promise<AdminProductListResponse> {
  const response = await apiClient.get<AdminProductListResponse>('/products/admin/list', { params });
  return response.data;
}

export async function createProductApi(data: CreateProductRequest): Promise<Product> {
  const response = await apiClient.post<Product>('/products', data);
  return response.data;
}

export async function updateProductApi(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
  const response = await apiClient.patch<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

// Orders Admin
export async function getAdminOrdersApi(
  params?: GetAdminOrdersParams,
): Promise<AdminOrderListResponse> {
  const response = await apiClient.get<AdminOrderListResponse>('/orders/admin/list', { params });
  return response.data;
}

export async function getOrderDetailApi(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/admin/${id}`);
  return response.data;
}

export async function updateOrderStatusApi(
  id: string,
  data: UpdateOrderStatusRequest,
): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${id}/status`, data);
  return response.data;
}

// Users Admin
export async function getAdminUsersApi(
  params?: GetAdminUsersParams,
): Promise<AdminUserListResponse> {
  const response = await apiClient.get<AdminUserListResponse>('/users/admin/list', { params });
  return response.data;
}

export async function adminCreateUserApi(data: AdminCreateUserRequest): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>('/users/admin', data);
  return response.data;
}

export async function adminUpdateUserApi(id: string, data: AdminUpdateUserRequest): Promise<AdminUser> {
  const response = await apiClient.patch<AdminUser>(`/users/admin/${id}`, data);
  return response.data;
}

export async function adminResetPasswordApi(id: string, data: AdminResetPasswordRequest): Promise<void> {
  await apiClient.patch(`/users/admin/${id}/reset-password`, data);
}

// Categories Admin
export async function getAdminCategoriesApi(): Promise<AdminCategory[]> {
  const response = await apiClient.get<AdminCategory[]>('/categories/admin/list');
  return response.data;
}

export async function createCategoryApi(data: CreateCategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>('/categories', data);
  return response.data;
}

export async function updateCategoryApi(id: string, data: UpdateCategoryRequest): Promise<Category> {
  const response = await apiClient.patch<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

// Shipping Zones Admin
export async function getShippingZonesApi(): Promise<{ data: ShippingZone[] }> {
  const response = await apiClient.get<{ data: ShippingZone[] }>('/shipping/zones');
  return response.data;
}

export async function createShippingZoneApi(data: CreateShippingZoneRequest): Promise<ShippingZone> {
  const response = await apiClient.post<ShippingZone>('/shipping/zones', data);
  return response.data;
}

export async function updateShippingZoneApi(id: string, data: UpdateShippingZoneRequest): Promise<ShippingZone> {
  const response = await apiClient.patch<ShippingZone>(`/shipping/zones/${id}`, data);
  return response.data;
}

export async function deleteShippingZoneApi(id: string): Promise<void> {
  await apiClient.delete(`/shipping/zones/${id}`);
}

// Banners Admin
export async function getAdminBannersApi(): Promise<{ data: Banner[] }> {
  const response = await apiClient.get<{ data: Banner[] }>('/banners/admin/list');
  return response.data;
}

export async function createBannerApi(data: CreateBannerRequest): Promise<Banner> {
  const response = await apiClient.post<Banner>('/banners/admin', data);
  return response.data;
}

export async function updateBannerApi(id: string, data: UpdateBannerRequest): Promise<Banner> {
  const response = await apiClient.patch<Banner>(`/banners/admin/${id}`, data);
  return response.data;
}

export async function deleteBannerApi(id: string): Promise<void> {
  await apiClient.delete(`/banners/admin/${id}`);
}

// Store Settings
export interface StoreSettings {
  id: string;
  hideOutOfStock: boolean;
  mpEnabled: boolean;
  dlEnabled: boolean;
  updatedAt: string;
}

export interface UpdateStoreSettingsRequest {
  hideOutOfStock?: boolean;
  mpEnabled?: boolean;
  mpAccessToken?: string;
  mpPublicKey?: string;
  mpWebhookSecret?: string;
  dlEnabled?: boolean;
  dlApiKey?: string;
  dlSecretKey?: string;
  dlApiUrl?: string;
}

export interface PaymentCredentials {
  mercadopago: {
    accessToken: string | null;
    publicKey: string | null;
    webhookSecret: string | null;
  };
  dlocal: {
    apiKey: string | null;
    secretKey: string | null;
    apiUrl: string | null;
  };
}

export async function getStoreSettingsApi(): Promise<StoreSettings> {
  const response = await apiClient.get<StoreSettings>('/settings');
  return response.data;
}

export async function updateStoreSettingsApi(
  data: UpdateStoreSettingsRequest,
): Promise<StoreSettings> {
  const response = await apiClient.patch<StoreSettings>('/settings', data);
  return response.data;
}

export async function getPaymentCredentialsApi(): Promise<PaymentCredentials> {
  const response = await apiClient.get<PaymentCredentials>('/settings/payment');
  return response.data;
}

// ── Branches (Sucursales) ─────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  apiKey: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  location: string;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  location?: string;
  isActive?: boolean;
}

export interface SyncLog {
  id: string;
  branchId: string;
  type: string;
  status: string;
  itemCount: number;
  duration: number;
  error: string | null;
  createdAt: string;
  branch: { name: string; code: string };
}

export async function getBranchesApi(): Promise<Branch[]> {
  const response = await apiClient.get<Branch[]>('/admin/branches');
  return response.data;
}

export async function createBranchApi(data: CreateBranchRequest): Promise<Branch> {
  const response = await apiClient.post<Branch>('/admin/branches', data);
  return response.data;
}

export async function updateBranchApi(id: string, data: UpdateBranchRequest): Promise<Branch> {
  const response = await apiClient.patch<Branch>(`/admin/branches/${id}`, data);
  return response.data;
}

export async function deleteBranchApi(id: string): Promise<Branch> {
  const response = await apiClient.delete<Branch>(`/admin/branches/${id}`);
  return response.data;
}

export async function regenerateBranchKeyApi(id: string): Promise<Branch> {
  const response = await apiClient.post<Branch>(`/admin/branches/${id}/regenerate-key`);
  return response.data;
}

export async function getSyncLogsApi(params?: {
  branchId?: string;
  type?: string;
  limit?: string;
}): Promise<SyncLog[]> {
  const response = await apiClient.get<SyncLog[]>('/admin/sync-logs', { params });
  return response.data;
}
