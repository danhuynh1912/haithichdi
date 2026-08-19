'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Expand, Minimize2, Send, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  type ChatTurn,
  type ChatbotPublicConfig,
  fetchChatbotConfig,
  streamAgentChat,
} from '@/lib/services/agent';
import { loadChatDraft, saveChatDraft } from './chat-storage';
import ChatMessage from './chat-message';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

interface ChatWindowProps {
  messages: Message[];
  onMessagesChange: (updater: (prev: Message[]) => Message[]) => void;
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
  /** Logo cạnh tên bot, bấm về trang chủ — dùng trên trang /chatbot. */
  showLogo?: boolean;
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
  showLogo,
  className,
}: ChatWindowProps) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatbotPublicConfig | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Chỉ cuộn khi đã có hội thoại — cuộn cả lúc trống sẽ kéo tụt trang
    // /chatbot xuống footer ngay khi mở.
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Tin nhắn gõ dở sống sót qua chuyển trang widget ↔ /chatbot
  useEffect(() => {
    const draft = loadChatDraft();
    if (draft) setInput(draft);
  }, []);

  // Welcome + câu hỏi gợi ý do admin đặt; null (SQL chưa chạy/lỗi mạng) thì
  // fallback chuỗi i18n, widget vẫn chạy bình thường.
  useEffect(() => {
    let cancelled = false;
    fetchChatbotConfig().then((c) => {
      if (!cancelled) setConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function buildHistory(): ChatTurn[] {
    return messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  async function sendMessage(text: string) {
    const query = text.trim();
    if (!query || isLoading) return;

    setInput('');
    saveChatDraft('');
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
              ? { ...m, content: m.content || t('error'), isStreaming: false }
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
        'flex flex-col bg-elev-2 text-ink-1 overflow-hidden',
        isFullscreen ? 'h-full w-full max-w-3xl mx-auto' : 'rounded-2xl shadow-2xl',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between gap-2 border-b border-line px-4 py-3 shrink-0'>
        <div className='flex items-center gap-2.5'>
          {showLogo && (
            <Link
              href='/'
              aria-label={tCommon('brand')}
              className='inline-flex items-center shrink-0'
            >
              {/* Hai bản logo để light/dark swap thuần CSS, cùng idiom site-header */}
              <Image
                src='/haithichdi-logo-red.png'
                alt={tCommon('brand')}
                width={2366}
                height={2366}
                className='h-8 w-auto hover:opacity-85 transition-opacity dark:hidden'
              />
              <Image
                src='/haithichdi-logo-white.png'
                alt=''
                aria-hidden='true'
                width={2366}
                height={2366}
                className='h-8 w-auto hover:opacity-85 transition-opacity hidden dark:block'
              />
            </Link>
          )}
          <span className='text-sm font-semibold tracking-wide'>{t('name')}</span>
        </div>
        <div className='flex items-center gap-1'>
          {isFullscreen ? (
            onCollapse && (
              <button
                onClick={onCollapse}
                className='rounded-lg p-1.5 text-ink-4 hover:bg-surface-2 hover:text-ink-1 transition-colors'
                aria-label={t('collapseAria')}
              >
                <Minimize2 size={15} />
              </button>
            )
          ) : (
            onExpand && (
              <button
                onClick={onExpand}
                className='rounded-lg p-1.5 text-ink-4 hover:bg-surface-2 hover:text-ink-1 transition-colors'
                aria-label={t('expandAria')}
              >
                <Expand size={15} />
              </button>
            )
          )}
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-ink-4 hover:bg-surface-2 hover:text-ink-1 transition-colors'
            aria-label={t('dismissAria')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0'>
        {messages.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
            <p className='text-sm text-ink-4 leading-relaxed px-4'>
              {config?.welcomeMessage || t('welcome')}
            </p>
            {config && config.suggestedQuestions.length > 0 && (
              <div className='flex flex-col items-stretch gap-2 px-2 w-full'>
                {config.suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type='button'
                    onClick={() => sendMessage(q)}
                    className='rounded-xl border border-line bg-surface px-3 py-2 text-left text-xs text-ink-2 hover:border-brand/60 hover:text-ink-1 transition-colors'
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {/* Minh bạch với khách: chat được lưu + đừng gửi thông tin cá nhân */}
            <p className='px-4 text-[11px] leading-relaxed text-ink-5'>
              {t('privacyNotice')}
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
        className='border-t border-line px-3 py-3 flex items-end gap-2 shrink-0'
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            saveChatDraft(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          rows={1}
          disabled={isLoading}
          // text-base (16px) trên mobile là bắt buộc: nhỏ hơn 16px thì iOS
          // Safari tự zoom trang khi focus vào ô nhập. Desktop về lại text-sm.
          className='flex-1 resize-none bg-surface rounded-xl px-3 py-2 text-base md:text-sm text-ink-1 placeholder:text-ink-5 focus:outline-none focus:ring-1 focus:ring-brand/60 max-h-28 overflow-y-auto disabled:opacity-50'
          style={{ lineHeight: '1.5' }}
        />
        <button
          type='submit'
          disabled={isLoading || !input.trim()}
          className='shrink-0 h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-brand-ink disabled:opacity-40 hover:bg-brand-strong transition-colors'
          aria-label={t('sendAria')}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
