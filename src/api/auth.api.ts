import { apiClient } from '@/api/client';
import type { User } from '@/types/user.types';

// ── Request types ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ── Response types ─────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

// ── API functions ──────────────────────────────────────────────

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

export async function forgotPasswordApi(email: string): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/forgot-password', {
    email,
  });
  return response.data;
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/reset-password', data);
  return response.data;
}

export async function logoutApi(refreshToken?: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function getMeApi(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}
