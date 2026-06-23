'use client';

import { useEffect, useRef, useState } from 'react';
import { Expand, Minimize2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ChatTurn, streamAgentChat } from '@/lib/services/agent';
import ChatMessage from './chat-message';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

interface ChatWindowProps {
  messages: Message[];
  onMessagesChange: (updater: (prev: Message[]) => Message[]) => void;
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
  className?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatWindow({
  messages,
  onMessagesChange,
  onClose,
  onExpand,
  onCollapse,
  isFullscreen,
  className,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function buildHistory(): ChatTurn[] {
    return messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: uid(), role: 'user', content: query };
    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    onMessagesChange((prev) => [...prev, userMsg, assistantMsg]);

    abortRef.current = new AbortController();
    const history = buildHistory();

    await streamAgentChat(
      query,
      history,
      (token) => {
        onMessagesChange((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + token } : m,
          ),
        );
      },
      () => {
        onMessagesChange((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
        );
        setIsLoading(false);
      },
      () => {
        onMessagesChange((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || 'Xin lỗi, có lỗi xảy ra.', isStreaming: false }
              : m,
          ),
        );
        setIsLoading(false);
      },
      abortRef.current.signal,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-[#111] text-white overflow-hidden',
        isFullscreen ? 'h-full w-full max-w-3xl mx-auto' : 'rounded-2xl shadow-2xl',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 shrink-0'>
        <div className='flex items-center gap-2'>
          <span className='h-2 w-2 rounded-full bg-[#d00600] animate-pulse' />
          <span className='text-sm font-semibold tracking-wide'>Haithichdi AI</span>
        </div>
        <div className='flex items-center gap-1'>
          {isFullscreen ? (
            onCollapse && (
              <button
                onClick={onCollapse}
                className='rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors'
                aria-label='Thu nhỏ'
              >
                <Minimize2 size={15} />
              </button>
            )
          ) : (
            onExpand && (
              <button
                onClick={onExpand}
                className='rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors'
                aria-label='Mở rộng'
              >
                <Expand size={15} />
              </button>
            )
          )}
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors'
            aria-label='Đóng'
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0'>
        {messages.length === 0 && (
          <div className='flex h-full items-center justify-center text-center'>
            <p className='text-sm text-white/40 leading-relaxed px-4'>
              Xin chào! Tôi có thể giúp bạn tìm hiểu về các tour trekking của Haithichdi.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className='border-t border-white/10 px-3 py-3 flex items-end gap-2 shrink-0'
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Hỏi về tour...'
          rows={1}
          disabled={isLoading}
          className='flex-1 resize-none bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#d00600]/60 max-h-28 overflow-y-auto disabled:opacity-50'
          style={{ lineHeight: '1.5' }}
        />
        <button
          type='submit'
          disabled={isLoading || !input.trim()}
          className='shrink-0 h-9 w-9 rounded-xl bg-[#d00600] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#b00500] transition-colors'
          aria-label='Gửi'
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
