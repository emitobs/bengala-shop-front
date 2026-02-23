import { apiClient } from '@/api/client';
import type { Banner } from '@/types';

// ── API functions ──────────────────────────────────────────────

export async function getActiveBannersApi(): Promise<Banner[]> {
  const response = await apiClient.get<{ data: Banner[] }>('/banners');
  return response.data.data;
}
