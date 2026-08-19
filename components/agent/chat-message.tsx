'use client';

import { motion } from 'motion/react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Markdown gọn cho bong bóng chat — KHÔNG dùng MarkdownContent (cỡ chữ bài
// viết quá lớn cho khung chat). Raw HTML bị bỏ qua (không rehype-raw).
const chatMarkdown: Components = {
  h1: ({ children }) => <p className='font-bold mt-2 mb-1'>{children}</p>,
  h2: ({ children }) => <p className='font-bold mt-2 mb-1'>{children}</p>,
  h3: ({ children }) => <p className='font-semibold mt-2 mb-1'>{children}</p>,
  p: ({ children }) => <p className='my-1 first:mt-0 last:mb-0'>{children}</p>,
  ul: ({ children }) => (
    <ul className='my-1 list-disc pl-4 space-y-0.5'>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className='my-1 list-decimal pl-4 space-y-0.5'>{children}</ol>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='underline text-brand hover:text-brand-strong'
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className='rounded bg-surface px-1 py-0.5 text-[0.85em]'>{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className='my-1 border-l-2 border-line pl-2 text-ink-3'>
      {children}
    </blockquote>
  ),
  hr: () => <hr className='my-2 border-line' />,
};

/**
 * Ba chấm thở chậm kiểu iMessage — hiện trong lúc chờ token đầu tiên.
 * Opacity lệch pha thay vì nhảy lên xuống: tĩnh hơn, hợp không khí "sang".
 */
function TypingIndicator() {
  return (
    <span
      className='inline-flex items-center gap-1 py-1'
      role='status'
      aria-label='…'
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className='h-1.5 w-1.5 rounded-full bg-ink-4'
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        />
      ))}
    </span>
  );
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';
  // Bubble rỗng đang chờ token đầu tiên = bot "đang suy nghĩ"
  const isThinking = !isUser && isStreaming && content === '';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
          isUser
            ? 'rounded-br-sm bg-surface-inverse text-surface-inverse-foreground whitespace-pre-wrap'
            : 'rounded-bl-sm bg-surface-2 text-ink-1',
        )}
      >
        {isThinking ? (
          <TypingIndicator />
        ) : isUser ? (
          content
        ) : (
          <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdown}>
            {content}
          </Markdown>
        )}
        {isStreaming && !isThinking && (
          <span className='ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-brand align-middle' />
        )}
      </div>
    </div>
  );
}
