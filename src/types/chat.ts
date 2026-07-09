// src/types/chat.ts

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  sentiment?: {
    label: string;
    score: number;
  };
  isStreaming?: boolean;
  isTypingCompleted?: boolean;
  displayedContent?: string;
}
