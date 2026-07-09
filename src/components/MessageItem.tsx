import { Message } from '@/types/chat';
import { SentimentBadge } from './SentimentBadge';

interface MessageItemProps {
  message: Message;
  isMiraThinking: boolean;
}

export function MessageItem({ message, isMiraThinking }: MessageItemProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="bg-mira-bubble-user text-[#e4e4e7] border border-mira-border px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[75%] text-[14.5px] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 items-start max-w-[90%] md:max-w-[80%] animate-fade-in-up">
      {/* Avatar - Refined slate design instead of bright gradient */}
      <div className="shrink-0 select-none">
        <div
          className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-[13px] font-bold text-mira-accent-lavender bg-mira-bg-panel border border-mira-border ${
            isMiraThinking && !message.content ? 'animate-avatar-pulse' : ''
          }`}
        >
          M
        </div>
      </div>

      {/* Content block */}
      <div className="flex flex-col gap-2 flex-1">
        
        {/* Header: Mira name & emotion chip */}
        <div className="flex items-center gap-2.5 h-5">
          <span className="text-[13.5px] font-bold text-mira-text-primary tracking-wide select-none">
            Mira
          </span>
          
          {/* Sentiment Badge - only rendered once typewriter completes */}
          {message.sentiment && message.isTypingCompleted && (
            <SentimentBadge
              label={message.sentiment.label}
              score={message.sentiment.score}
            />
          )}
        </div>

        {/* Speech Bubble */}
        <div className="bg-mira-bubble-assistant text-mira-text-primary border border-mira-border px-5 py-4.5 rounded-2xl rounded-tl-none text-[14.5px] leading-[1.65] shadow-xs">
          
          {/* Render typing dots indicator when loading and empty */}
          {isMiraThinking && !message.content ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            /* Render typewriter content with text-wrap: pretty */
            <p className="whitespace-pre-wrap text-wrap-pretty">
              {message.displayedContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
