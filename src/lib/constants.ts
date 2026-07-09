/* ─── Sentiment color definitions for the midnight library theme (OKLCH) ─── */
export interface SentimentStyle {
  bg: string;
  border: string;
  text: string;
  icon: string;
  label: string;
}

export const SENTIMENT_STYLES: Record<string, SentimentStyle> = {
  Normal: {
    bg: 'oklch(0.82 0.13 185 / 0.05)',
    border: 'oklch(0.82 0.13 185 / 0.15)',
    text: 'oklch(0.82 0.13 185)',
    icon: '✦',
    label: 'balanced',
  },
  Anxiety: {
    bg: 'oklch(0.79 0.16 75 / 0.05)',
    border: 'oklch(0.79 0.16 75 / 0.15)',
    text: 'oklch(0.79 0.16 75)',
    icon: '⚡',
    label: 'anxiety',
  },
  Depression: {
    bg: 'oklch(0.80 0.10 270 / 0.05)',
    border: 'oklch(0.80 0.10 270 / 0.15)',
    text: 'oklch(0.80 0.10 270)',
    icon: '🌧',
    label: 'sadness',
  },
  Stress: {
    bg: 'oklch(0.75 0.16 12 / 0.05)',
    border: 'oklch(0.75 0.16 12 / 0.15)',
    text: 'oklch(0.75 0.16 12)',
    icon: '🔥',
    label: 'stress',
  },
  Suicidal: {
    bg: 'oklch(0.65 0.22 25 / 0.08)',
    border: 'oklch(0.65 0.22 25 / 0.2)',
    text: 'oklch(0.65 0.22 25)',
    icon: '🚨',
    label: 'distress',
  },
  Bipolar: {
    bg: 'oklch(0.76 0.17 310 / 0.05)',
    border: 'oklch(0.76 0.17 310 / 0.15)',
    text: 'oklch(0.76 0.17 310)',
    icon: '🔄',
    label: 'mood change',
  },
  'Personality Disorder': {
    bg: 'oklch(0.72 0.19 330 / 0.05)',
    border: 'oklch(0.72 0.19 330 / 0.15)',
    text: 'oklch(0.72 0.19 330)',
    icon: '🧠',
    label: 'interpersonal',
  },
};
