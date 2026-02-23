import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import ChatPanel from './ChatPanel';

const GREETING_DELAY_MS = 3000;
const GREETING_KEY = 'bengala-chat-greeted';

export default function ChatWidget() {
  const { isOpen, hasUnread, toggle } = useChatStore();
  const [showGreeting, setShowGreeting] = useState(false);

  // Show greeting bubble after a short delay (once per session)
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
      return;
    }

    const alreadyGreeted = sessionStorage.getItem(GREETING_KEY);
    if (alreadyGreeted) return;

    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, GREETING_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const dismissGreeting = () => {
    setShowGreeting(false);
    sessionStorage.setItem(GREETING_KEY, '1');
  };

  const handleToggle = () => {
    if (showGreeting) {
      dismissGreeting();
    }
    toggle();
  };

  const handleGreetingClick = () => {
    dismissGreeting();
    if (!isOpen) toggle();
  };

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <>
          {/* Mobile: full screen with slide-up animation */}
          <div
            className="fixed inset-0 z-50 animate-slide-up md:hidden"
            style={{ height: '100dvh' }}
          >
            <ChatPanel />
          </div>

          {/* Desktop: floating panel */}
          <div className="fixed bottom-24 right-6 z-50 hidden h-[520px] w-[380px] md:block">
            <ChatPanel />
          </div>
        </>
      )}

      {/* Greeting bubble */}
      {showGreeting && !isOpen && (
        <div
          className="fixed z-50 animate-fade-in-up sm:bottom-[88px] sm:right-6"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            right: 'max(0.5rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="relative max-w-[280px] rounded-2xl rounded-br-md border border-border bg-white p-4 shadow-xl sm:max-w-[260px]">
            <button
              onClick={dismissGreeting}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
            <p className="pr-5 text-sm font-medium text-secondary">
              Hola! Soy Rayitas 🐯
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tu asistente de Bengala Max. ¿Te ayudo en algo?
            </p>
            <button
              onClick={handleGreetingClick}
              className="mt-3 w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Chatea conmigo
            </button>
          </div>
          {/* Arrow pointing down to the button */}
          <div className="flex justify-end pr-4">
            <div className="h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      )}

      {/* Floating toggle button — hidden on mobile when chat is open */}
      <button
        onClick={handleToggle}
        className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-dark hover:shadow-xl active:scale-95 ${isOpen ? 'hidden md:flex' : ''}`}
        style={{
          bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {(hasUnread || showGreeting) && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
