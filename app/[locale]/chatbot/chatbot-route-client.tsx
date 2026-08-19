'use client';

import { useRouter } from '@/i18n/navigation';
import ChatWindow from '@/components/agent/chat-window';
import { usePersistedChatMessages } from '@/components/agent/chat-storage';

/**
 * /chatbot — chat fullscreen thật sự: khung chat chiếm trọn viewport, đè lên
 * header/footer/bottom-bar của layout (z-[1000]). Logo nằm ngay trong header
 * của khung chat (showLogo) — bấm về trang chủ, nút X cũng vậy. Widget nổi
 * và bottom bar mobile tự ẩn trên route này.
 */
export default function ChatbotRouteClient() {
  const router = useRouter();
  // Cùng sessionStorage với widget nổi — mở rộng từ widget là tiếp nối luôn
  const [messages, setMessages] = usePersistedChatMessages();

  return (
    <div className='fixed inset-0 z-[1100] bg-elev-1 flex'>
      <ChatWindow
        messages={messages}
        onMessagesChange={setMessages}
        onClose={() => router.push('/')}
        isFullscreen
        showLogo
        className='w-full'
      />
    </div>
  );
}
