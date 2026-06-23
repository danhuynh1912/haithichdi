'use client';

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'rounded-br-sm bg-black text-white'
            : 'rounded-bl-sm bg-[#1a1a1a] text-white',
        )}
      >
        {content}
        {isStreaming && (
          <span className='ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[#d00600] align-middle' />
        )}
      </div>
    </div>
  );
}
