import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  feedback?: 1 | -1;
  onFeedback?: (messageId: string, feedback: 1 | -1) => void;
  children?: React.ReactNode;
}

export default function ChatBubble({
  role,
  content,
  messageId,
  feedback,
  onFeedback,
  children,
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const showFeedback = !isUser && messageId && onFeedback;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-gray-100 text-secondary rounded-bl-md',
          )}
        >
          {content}
        </div>
        {children}
        {showFeedback && (
          <div className="mt-1 flex items-center gap-1 pl-1">
            <button
              onClick={() => onFeedback(messageId, 1)}
              className={cn(
                'rounded-full p-1 transition-colors',
                feedback === 1
                  ? 'text-success'
                  : 'text-gray-300 hover:text-gray-500',
              )}
              title="Buena respuesta"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => onFeedback(messageId, -1)}
              className={cn(
                'rounded-full p-1 transition-colors',
                feedback === -1
                  ? 'text-error'
                  : 'text-gray-300 hover:text-gray-500',
              )}
              title="Mala respuesta"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
