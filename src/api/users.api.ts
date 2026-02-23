import { apiClient } from '@/api/client';
import type { User } from '@/types';

// ── Address types ─────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  street: string;
  number: string;
  apartment: string | null;
  city: string;
  department: string;
  postalCode: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label?: string;
  recipientName: string;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  department: string;
  postalCode: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// ── API functions ──────────────────────────────────────────────

export async function getProfileApi(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}

export async function updateProfileApi(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.patch<User>('/users/me', data);
  return response.data;
}

export async function getAddressesApi(): Promise<Address[]> {
  const response = await apiClient.get<Address[]>('/users/me/addresses');
  return response.data;
}

export async function createAddressApi(data: CreateAddressRequest): Promise<Address> {
  const response = await apiClient.post<Address>('/users/me/addresses', data);
  return response.data;
}

export async function updateAddressApi(id: string, data: UpdateAddressRequest): Promise<Address> {
  const response = await apiClient.patch<Address>(`/users/me/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddressApi(id: string): Promise<MessageResponse> {
  const response = await apiClient.delete<MessageResponse>(`/users/me/addresses/${id}`);
  return response.data;
}

export async function changePasswordApi(data: ChangePasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/change-password', data);
  return response.data;
}
