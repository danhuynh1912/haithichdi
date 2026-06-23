// TODO: remove mock before connecting real backend
const MOCK_RESPONSE = `
## Gợi ý tour cho bạn 🏔️

Dựa trên câu hỏi của bạn, đây là một số tour **Haithichdi** phù hợp:

### 1. Chinh phục Fansipan (3 ngày 2 đêm)
- **Độ khó:** Trung bình – Thử thách
- **Độ cao:** 3.143m
- **Giá:** từ 3.500.000 VNĐ/người
- Phù hợp cho người có sức khỏe tốt, không cần kinh nghiệm leo núi.

### 2. Tà Xùa – Biển mây (2 ngày 1 đêm)
- **Độ khó:** Dễ – Trung bình
- **Độ cao:** 2.865m
- **Giá:** từ 2.200.000 VNĐ/người
- Lý tưởng để săn mây buổi sáng sớm.

---

> 💡 **Tip:** Thời điểm đẹp nhất để đi là **tháng 10 – tháng 12**, khi trời trong, ít mưa và có thể gặp biển mây.

Bạn muốn biết thêm về tour nào không?
`.trim();

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
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

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const apiKey = process.env.NEXT_PUBLIC_AGENT_API_KEY ?? '';

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/agent/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Api-Key': apiKey,
      },
      body: JSON.stringify({ query, chat_history: chatHistory }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!response.ok) {
    onError(new Error(`Agent API error: ${response.status}`));
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

        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(payload) as { token: string };
          if (parsed.token) onToken(parsed.token);
        } catch {
          // malformed SSE line — skip
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  } finally {
    reader.releaseLock();
  }

  onDone();
}
