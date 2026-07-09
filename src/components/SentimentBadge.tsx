import { SENTIMENT_STYLES } from '@/lib/constants';

interface SentimentBadgeProps {
  label: string;
  score: number;
}

export function SentimentBadge({ label, score }: SentimentBadgeProps) {
  const style = SENTIMENT_STYLES[label] || SENTIMENT_STYLES['Normal'];
  return (
    <span
      className="sentiment-badge animate-fade-in-up flex items-center select-none shrink-0"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      <span className="text-[9.5px] leading-none">{style.icon}</span>
      <span className="font-bold uppercase tracking-wider text-[8.5px] leading-none">
        {style.label}
      </span>
      <span className="opacity-50 text-[8.5px] font-medium leading-none">
        · {(score * 100).toFixed(0)}%
      </span>
    </span>
  );
}
