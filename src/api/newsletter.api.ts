import { apiClient } from '@/api/client';

export interface SubscribeRequest {
  email: string;
}

export async function subscribeNewsletterApi(data: SubscribeRequest): Promise<void> {
  await apiClient.post('/newsletter/subscribe', data);
}
