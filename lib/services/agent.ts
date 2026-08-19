/**
 * Chatbot service — nói chuyện với Supabase Edge Function `chat` (SSE).
 *
 * Wire format (xem supabase/functions/chat/index.ts):
 *   POST { sessionId, messages: [{role, content}, ...] }  — kết thúc bằng user
 *   ← text/event-stream, mỗi event `data: <json>`:
 *       { type: "text",  text }    — delta nội dung
 *       { type: "done",  usage }   — kết thúc lượt
 *       { type: "error", message } — lỗi giữa chừng (message thân thiện)
 *
 * Lỗi "có chủ đích" từ server (429 rate limit, 503 tắt chatbot...) trả JSON
 * `{ error: "..." }` với message thân thiện — hiển thị như một câu trả lời
 * của bot (onToken + onDone) thay vì lỗi kỹ thuật. onError chỉ dành cho lỗi
 * bất ngờ (mạng, 500...), UI sẽ hiện message chung chung từ i18n.
 */

import { supabase } from '@/lib/supabase';

// TODO: remove mock before connecting real backend
const MOCK_RESPONSE = `
## Gợi ý tour cho bạn 🏔️

Dựa trên câu hỏi của bạn, đây là một số tour **Haithichdi** phù hợp:

### 1. Chinh phục Fansipan (3 ngày 2 đêm)
- **Độ khó:** Trung bình – Thử thách
- **Giá:** từ 3.500.000 VNĐ/người

Bạn muốn biết thêm về tour nào không?
`.trim();

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotPublicConfig {
  enabled: boolean;
  welcomeMessage: string;
  suggestedQuestions: string[];
}

const SESSION_KEY = 'htd-chat-session';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Cấu hình công khai của chatbot (welcome, câu hỏi gợi ý) do admin đặt.
 * Trả về null khi RPC chưa tồn tại (SQL chưa chạy) hoặc lỗi mạng — UI
 * fallback về chuỗi i18n, widget vẫn hoạt động bình thường.
 */
export async function fetchChatbotConfig(): Promise<ChatbotPublicConfig | null> {
  try {
    const { data, error } = await supabase.rpc('chatbot_public_config');
    if (error || !data) return null;
    return {
      enabled: data.enabled !== false,
      welcomeMessage:
        typeof data.welcome_message === 'string' ? data.welcome_message : '',
      suggestedQuestions: Array.isArray(data.suggested_questions)
        ? data.suggested_questions.filter((q: unknown) => typeof q === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

export async function streamAgentChat(
  query: string,
  chatHistory: ChatTurn[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
): Promise<void> {
  // TODO: remove mock before connecting real backend
  if (process.env.NEXT_PUBLIC_AGENT_MOCK === 'true') {
    const tokens = MOCK_RESPONSE.split(/(?<=\s)|(?=\s)/);
    for (const token of tokens) {
      if (signal?.aborted) return;
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 30));
      onToken(token);
    }
    onDone();
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        messages: [...chatHistory, { role: 'user', content: query }],
      }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!response.ok) {
    // 429/503 mang message thân thiện từ server — hiển thị như lời bot
    let serverMessage = '';
    try {
      const body = await response.json();
      if (typeof body?.error === 'string') serverMessage = body.error;
    } catch {
      // body không phải JSON — rơi xuống onError
    }
    if (serverMessage && (response.status === 429 || response.status === 503)) {
      onToken(serverMessage);
      onDone();
      return;
    }
    onError(new Error(serverMessage || `Chat API error: ${response.status}`));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError(new Error('No response body'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        let parsed: { type?: string; text?: string; message?: string };
        try {
          parsed = JSON.parse(trimmed.slice(5).trim());
        } catch {
          continue; // malformed SSE line — skip
        }

        if (parsed.type === 'text' && parsed.text) {
          onToken(parsed.text);
        } else if (parsed.type === 'done') {
          onDone();
          return;
        } else if (parsed.type === 'error') {
          // stream đã bắt đầu — nối message thân thiện vào cuối rồi kết thúc
          if (parsed.message) onToken(`\n\n${parsed.message}`);
          onDone();
          return;
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
    return;
  } finally {
    reader.releaseLock();
  }

  onDone();
}
