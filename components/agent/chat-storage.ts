'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Message } from './chat-window';

/**
 * State hội thoại dùng chung giữa widget nổi và trang /chatbot, lưu trong
 * sessionStorage để bấm "Mở rộng" nhảy trang mà không mất lịch sử lẫn tin
 * nhắn đang gõ dở. Cùng tab thì liền mạch; đóng tab là hết phiên (khớp với
 * sessionId của service chat).
 */

const MESSAGES_KEY = 'htd-chat-messages';
const DRAFT_KEY = 'htd-chat-draft';

function loadMessages(): Message[] {
  try {
    const raw = window.sessionStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Message =>
        (m?.role === 'user' || m?.role === 'assistant') &&
        typeof m?.id === 'string' &&
        typeof m?.content === 'string',
    );
  } catch {
    return [];
  }
}

function persistMessages(messages: Message[]) {
  try {
    window.sessionStorage.setItem(
      MESSAGES_KEY,
      JSON.stringify(
        messages
          // bubble đang stream dở mà rỗng thì bỏ — reload sẽ chỉ thấy phần đã tới
          .filter((m) => m.content !== '')
          .map(({ id, role, content }) => ({ id, role, content })),
      ),
    );
  } catch {
    // storage đầy/bị chặn — chat vẫn chạy, chỉ mất tính năng giữ state
  }
}

/**
 * Thay cho useState<Message[]>: load từ sessionStorage sau khi mount (tránh
 * lệch SSR/client) và tự persist mỗi lần đổi.
 */
export function usePersistedChatMessages(): [
  Message[],
  (updater: (prev: Message[]) => Message[]) => void,
] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  const update = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        persistMessages(next);
        return next;
      });
    },
    [],
  );

  return [messages, update];
}

export function loadChatDraft(): string {
  try {
    return window.sessionStorage.getItem(DRAFT_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveChatDraft(draft: string) {
  try {
    if (draft) window.sessionStorage.setItem(DRAFT_KEY, draft);
    else window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // bỏ qua — draft chỉ là tiện ích
  }
}
