import { useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSend, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input after loaded
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  return (
    <div className="border-t border-mira-border bg-mira-bg-primary/95 backdrop-blur-md px-5 py-4 md:px-10 shrink-0 z-10">
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
        
        {/* Input Card Container (Avoiding over-rounded pills) */}
        <div className="input-focus-expand flex items-center gap-3 bg-mira-bg-input border border-mira-border rounded-xl px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Share your thoughts with Mira..."
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-mira-text-primary placeholder-mira-text-muted text-[14.5px] py-1.5 font-sans"
          />

          {/* Character hint & Send button */}
          <div className="flex items-center gap-3.5 shrink-0">
            <span className="text-[10px] text-mira-text-muted font-bold tracking-wider select-none w-10 text-right">
              {input.length} / 500
            </span>
            
            {/* Send Button with press-scaling */}
            <button
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              className="interactive-button w-9 h-9 rounded-lg flex items-center justify-center text-mira-bg-primary bg-mira-accent-lavender disabled:opacity-20 active:scale-95 transition-all shadow-xs"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-x-[0.5px]"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Soft Disclaimer */}
        <p className="text-center text-[10.5px] text-mira-text-muted leading-normal tracking-wide">
          This is not a substitute for professional help. If you are in crisis, please seek immediate help or contact a counselor.
        </p>
      </div>
    </div>
  );
}
