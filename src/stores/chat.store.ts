import { create } from 'zustand';
import {
  sendChatMessageApi,
  sendFeedbackApi,
  type ChatMessage,
  type ChatProduct,
} from '@/api/assistant.api';
import { queryClient } from '@/lib/query-client';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
  messageId?: string;
  feedback?: 1 | -1;
}

interface ChatState {
  messages: AssistantMessage[];
  conversationId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  hasUnread: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  submitFeedback: (messageId: string, feedback: 1 | -1) => Promise<void>;
  clear: () => void;
}

const STORAGE_KEY = 'bengala-chat-messages';
const CONV_KEY = 'bengala-chat-conv';

function loadMessages(): AssistantMessage[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadConversationId(): string | null {
  try {
    return sessionStorage.getItem(CONV_KEY);
  } catch {
    return null;
  }
}

function saveMessages(messages: AssistantMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // sessionStorage full or unavailable
  }
}

function saveConversationId(id: string | null) {
  try {
    if (id) {
      sessionStorage.setItem(CONV_KEY, id);
    } else {
      sessionStorage.removeItem(CONV_KEY);
    }
  } catch {}
}

/** Refresh the cart after assistant adds items by invalidating the React Query cache */
function refreshCart() {
  queryClient.invalidateQueries({ queryKey: ['cart'] });
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: loadMessages(),
  conversationId: loadConversationId(),
  isOpen: false,
  isLoading: false,
  hasUnread: false,

  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      hasUnread: state.isOpen ? state.hasUnread : false,
    })),

  open: () => set({ isOpen: true, hasUnread: false }),

  close: () => set({ isOpen: false }),

  sendMessage: async (content: string) => {
    const userMsg: AssistantMessage = { role: 'user', content };
    const currentMessages = [...get().messages, userMsg];
    set({ messages: currentMessages, isLoading: true });
    saveMessages(currentMessages);

    try {
      const apiMessages: ChatMessage[] = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessageApi(
        apiMessages,
        get().conversationId ?? undefined,
      );

      const assistantMsg: AssistantMessage = {
        role: 'assistant',
        content: response.message,
        products:
          response.products.length > 0 ? response.products : undefined,
        messageId: response.messageId,
      };

      const updated = [...currentMessages, assistantMsg];
      const convId = response.conversationId || get().conversationId;
      set((state) => ({
        messages: updated,
        conversationId: convId,
        isLoading: false,
        hasUnread: !state.isOpen,
      }));
      saveMessages(updated);
      saveConversationId(convId);

      // If the assistant added items to the cart, refresh it
      if (response.cartUpdated) {
        refreshCart();
      }
    } catch (error) {
      const axiosErr = error as any;
      const status = axiosErr?.response?.status;
      const serverMessage = axiosErr?.response?.data?.message;
      // Always log to help diagnose production issues
      console.error('[Chat] API error:', {
        status,
        serverMessage,
        message: axiosErr?.message,
        url: axiosErr?.config?.url,
      });

      let content =
        'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.';
      if (status === 429) {
        content =
          'Estas enviando mensajes muy rapido. Espera un momento e intenta de nuevo.';
      } else if (status === 500) {
        content =
          'Lo siento, el asistente tuvo un problema interno. Intenta de nuevo en unos segundos.';
      }
      const errorMsg: AssistantMessage = { role: 'assistant', content };
      const updated = [...currentMessages, errorMsg];
      set({ messages: updated, isLoading: false });
      saveMessages(updated);
    }
  },

  submitFeedback: async (messageId: string, feedback: 1 | -1) => {
    // Optimistic update
    const messages = get().messages.map((m) =>
      m.messageId === messageId ? { ...m, feedback } : m,
    );
    set({ messages });
    saveMessages(messages);

    try {
      await sendFeedbackApi(messageId, feedback);
    } catch {
      // Revert on error
      const reverted = get().messages.map((m) =>
        m.messageId === messageId ? { ...m, feedback: undefined } : m,
      );
      set({ messages: reverted });
      saveMessages(reverted);
    }
  },

  clear: () => {
    set({ messages: [], conversationId: null, hasUnread: false });
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(CONV_KEY);
  },
}));
