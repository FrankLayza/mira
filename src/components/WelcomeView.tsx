interface WelcomeViewProps {
  onSuggestionClick: (text: string) => void;
}

export function WelcomeView({ onSuggestionClick }: WelcomeViewProps) {
  const suggestions = [
    "I'm feeling overwhelmed by my coursework and deadlines.",
    "I'm having trouble sleeping because I feel so anxious.",
    "I feel isolated and like I don't fit in at university.",
    "I had a good day and just want to write it down.",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 py-8 z-10 animate-fade-in-up">
      
      {/* Icon container */}
      <div className="relative mb-8 select-none">
        <div className="w-12 h-12 rounded-xl bg-mira-bg-secondary border border-mira-border flex items-center justify-center relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-mira-accent-lavender"
          >
            <path d="M12 2v4M12 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" />
          </svg>
        </div>
      </div>

      <h2 className="text-[20px] font-bold text-mira-text-primary tracking-tight mb-2.5 text-wrap-balance">
        A Quiet Space with Mira
      </h2>
      <p className="text-[13.5px] text-mira-text-secondary leading-relaxed mb-8 max-w-sm">
        No judgment, no academic pressure. Share what is on your mind, and I will sit with you to help sort it out.
      </p>

      {/* Suggestions chips */}
      <div className="flex flex-col gap-2.5 w-full">
        <h4 className="text-[11px] font-bold text-mira-text-muted uppercase tracking-wider mb-1">
          Suggested Reflections
        </h4>
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="interactive-button w-full text-left px-5 py-3.5 rounded-xl border border-mira-border bg-mira-bg-secondary text-[13.5px] text-mira-text-secondary hover:text-mira-text-primary active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 60}ms` }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
