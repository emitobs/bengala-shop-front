import { useMemo } from 'react';
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

/**
 * Parse plain-text assistant messages into structured segments for rendering.
 * Handles line breaks, numbered/bulleted lists, and bold (**text**).
 */
function parseContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let currentList: { type: 'ol' | 'ul'; items: React.ReactNode[] } | null =
    null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ol') {
      nodes.push(
        <ol
          key={`ol-${nodes.length}`}
          className="my-1 list-decimal space-y-0.5 pl-5"
        >
          {currentList.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>,
      );
    } else {
      nodes.push(
        <ul
          key={`ul-${nodes.length}`}
          className="my-1 list-disc space-y-0.5 pl-5"
        >
          {currentList.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Numbered list: "1. ", "2) ", etc.
    const olMatch = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(formatInline(olMatch[1]));
      continue;
    }

    // Bulleted list: "- " or "* "
    const ulMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(formatInline(ulMatch[1]));
      continue;
    }

    // Regular line — flush any pending list
    flushList();

    if (line.trim() === '') {
      // Empty line → small spacing
      if (i > 0 && i < lines.length - 1) {
        nodes.push(<div key={`br-${i}`} className="h-2" />);
      }
    } else {
      nodes.push(
        <p key={`p-${i}`} className={i > 0 ? 'mt-1' : ''}>
          {formatInline(line)}
        </p>,
      );
    }
  }

  flushList();
  return nodes;
}

/** Format inline text: **bold** */
function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
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

  const parsedContent = useMemo(
    () => (isUser ? content : parseContent(content)),
    [content, isUser],
  );

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-md bg-primary text-white'
              : 'rounded-bl-md bg-gray-100 text-secondary',
          )}
        >
          {parsedContent}
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
