import { useRef, useEffect, useState } from 'react';
import { X, Send, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import ChatBubble from './ChatBubble';
import ChatProductCard from './ChatProductCard';

const WELCOME_MESSAGE =
  'Hola! Soy Rayitas, el asistente de Bengala Max 🐯 Puedo ayudarte a buscar productos, resolver dudas sobre envios, pagos y mas. ¿En que te puedo ayudar?';

export default function ChatPanel() {
  const { messages, isLoading, close, sendMessage, submitFeedback, clear } =
    useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-white md:h-full md:rounded-2xl md:border md:border-border md:shadow-2xl"
      style={{ height: '100%' }}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-primary px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          {/* Mobile back arrow */}
          <button
            onClick={close}
            className="mr-1 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white md:hidden"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">
            🐯
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Rayitas</h3>
            <p className="text-[11px] text-white/70">Siempre disponible</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clear}
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              title="Limpiar chat"
            >
              <Trash2 size={16} />
            </button>
          )}
          {/* Desktop close (mobile uses back arrow) */}
          <button
            onClick={close}
            className="hidden rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white md:block"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* Welcome message */}
        <ChatBubble role="assistant" content={WELCOME_MESSAGE} />

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            messageId={msg.messageId}
            feedback={msg.feedback}
            onFeedback={submitFeedback}
          >
            {msg.products && msg.products.length > 0 && (
              <div className="mt-2 space-y-2">
                {msg.products.map((product) => (
                  <ChatProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </ChatBubble>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Escribiendo...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-shrink-0 items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribi tu mensaje..."
          maxLength={500}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
