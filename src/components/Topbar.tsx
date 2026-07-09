interface TopbarProps {
  isMiraThinking: boolean;
  hasMessages: boolean;
  onClearChat: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}

export function Topbar({
  isMiraThinking,
  hasMessages,
  onClearChat,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: TopbarProps) {
  return (
    <section className="flex md:hidden w-full items-center justify-between border-b border-mira-border bg-mira-bg-secondary px-5 py-3.5 shrink-0 z-30">
      <div className="flex items-center gap-3">
        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-mira-text-secondary hover:text-mira-text-primary hover:bg-white/5 active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-[14px] font-bold text-mira-text-primary leading-tight">Mira</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isMiraThinking
                    ? 'bg-mira-accent-teal animate-indicator-pulse'
                    : 'bg-mira-accent-lavender/70'
                }`}
              />
              <span className="text-[10px] text-mira-text-muted font-medium">
                {isMiraThinking ? 'Thinking...' : 'Listening'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasMessages && (
        <button
          onClick={onClearChat}
          className="interactive-button text-[12px] font-medium text-mira-accent-lavender hover:bg-mira-accent-lavender/5 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          Reset
        </button>
      )}
    </section>
  );
}
