import { apiClient } from '@/api/client';

// ── Types ──────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string | null;
}

export interface ChatResponse {
  message: string;
  products: ChatProduct[];
  conversationId: string;
  messageId: string;
}

// ── API ────────────────────────────────────────────────────────
export async function sendChatMessageApi(
  messages: ChatMessage[],
  conversationId?: string,
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/assistant/chat', {
    messages,
    conversationId,
  });
  return response.data;
}

export async function sendFeedbackApi(
  messageId: string,
  feedback: 1 | -1,
): Promise<void> {
  await apiClient.post('/assistant/feedback', { messageId, feedback });
}
