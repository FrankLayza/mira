import { SENTIMENT_STYLES } from '@/lib/constants';

interface SidebarProps {
  isMiraThinking: boolean;
  hasMessages: boolean;
  onClearChat: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}

export function Sidebar({
  isMiraThinking,
  hasMessages,
  onClearChat,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          style={{ animationDuration: '150ms' }}
        />
      )}

      {/* Sidebar Container */}
      <section
        className={`fixed inset-y-0 left-0 w-80 flex flex-col justify-between shrink-0 z-50 p-6 md:p-7 bg-mira-bg-secondary border-r border-mira-border transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          
          {/* Logo & Name Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Logo icon */}
              <div className="w-10 h-10 rounded-[12px] bg-mira-bg-panel border border-mira-border flex items-center justify-center relative group">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-mira-accent-lavender opacity-95 group-hover:scale-105 transition-transform duration-200"
                >
                  <path d="M12 2v4M12 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" />
                  <path d="M12 18v4M8 22h8" />
                  <circle cx="12" cy="11" r="3" className="fill-mira-accent-lavender/5" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-mira-text-primary leading-tight tracking-wide">
                  Mira
                </h1>
                <p className="text-[10px] text-mira-text-muted font-semibold tracking-wider uppercase mt-0.5">
                  Sentiment Companion
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-mira-text-secondary hover:text-mira-text-primary hover:bg-white/5 active:scale-95 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Status Panel */}
          <div className="bg-mira-bg-panel border border-mira-border rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isMiraThinking
                    ? 'bg-mira-accent-teal animate-indicator-pulse shadow-[0_0_8px_rgba(45,212,191,0.4)]'
                    : 'bg-mira-accent-lavender/80 shadow-[0_0_6px_rgba(180,158,255,0.3)]'
                }`}
              />
              <span className="text-[12px] font-semibold text-mira-text-secondary">
                {isMiraThinking ? 'Thinking...' : 'Active & Listening'}
              </span>
            </div>
            <p className="text-[12px] text-mira-text-muted leading-[1.6]">
              Mira uses a dual-engine architecture: a local RoBERTa model predicts emotion from your text, calibrating a supportive, streamed LLM response.
            </p>
          </div>

          {/* Key Indicators Info */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[11px] font-bold text-mira-text-muted uppercase tracking-wider pl-1">
              Sentiment States
            </h3>
            <div className="grid grid-cols-1 gap-1 text-[12px]">
              {Object.entries(SENTIMENT_STYLES).map(([key, style]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-mira-border"
                >
                  <span className="text-mira-text-secondary font-medium">{key}</span>
                  <span
                    className="text-[9.5px] uppercase font-bold tracking-wider"
                    style={{ color: style.text }}
                  >
                    {style.icon} {style.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-3 pt-4 border-t border-mira-border">
          <button
            onClick={onClearChat}
            disabled={!hasMessages}
            className="interactive-button w-full py-2.5 px-4 rounded-xl border border-mira-border bg-white/[0.01] hover:bg-white/[0.03] text-[12.5px] font-medium text-mira-text-secondary hover:text-mira-text-primary active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Reset Conversation
          </button>
          <div className="text-[10px] text-mira-text-muted text-center">
            Final Year Project · CS
          </div>
        </div>
      </section>
    </>
  );
}
