'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { WelcomeView } from '@/components/WelcomeView';
import { MessageItem } from '@/components/MessageItem';
import { ChatInput } from '@/components/ChatInput';

export default function MiraChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversation history from sessionStorage on first mount
  useEffect(() => {
    const saved = sessionStorage.getItem("mira-messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem("mira-messages");
      }
    }
  }, []);

  // Save conversation history to sessionStorage whenever messages change
  useEffect(() => {
    sessionStorage.setItem("mira-messages", JSON.stringify(messages));
  }, [messages]);


  // Automatically scroll message thread to the bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  // Typewriter effect ticker loop in parent state
  useEffect(() => {
    const activeMessage = messages.find(
      (m) => m.role === 'assistant' && !m.isTypingCompleted
    );
    if (!activeMessage) return;

    const rawText = activeMessage.content;
    const dispText = activeMessage.displayedContent || '';

    if (dispText.length < rawText.length) {
      // Speed up typing if backlog gets large (e.g. fast streaming chunks)
      const isBacklogLarge = rawText.length - dispText.length > 25;
      const delay = isBacklogLarge ? 6 : 14;

      const timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === activeMessage.id) {
              const nextLength = dispText.length + 1;
              const nextDisp = rawText.slice(0, nextLength);
              const isFinished = nextLength === rawText.length && !m.isStreaming;
              return {
                ...m,
                displayedContent: nextDisp,
                isTypingCompleted: isFinished,
              };
            }
            return m;
          })
        );
      }, delay);
      return () => clearTimeout(timer);
    } else if (!activeMessage.isStreaming && dispText.length === rawText.length) {
      // Caught up and the stream is complete
      const timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === activeMessage.id ? { ...m, isTypingCompleted: true } : m
          )
        );
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsMobileMenuOpen(false); // Close mobile menu if sending a message

    const assistantId = `mira-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        displayedContent: '',
        isStreaming: true,
        isTypingCompleted: false,
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          latestMessage: userMessage.content,
        }),
      });

      if (!response.body) {
        throw new Error('Readable stream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value);

        if (isFirstChunk) {
          isFirstChunk = false;
          // First chunk contains sentiment metadata separated by a newline
          const newlineIdx = chunkText.indexOf('\n');
          if (newlineIdx !== -1) {
            try {
              const metaString = chunkText.slice(0, newlineIdx);
              const meta = JSON.parse(metaString);
              if (meta.type === 'sentiment') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sentiment: { label: meta.label, score: meta.score } }
                      : m
                  )
                );
              }
            } catch {
              // Not JSON; parse fallback
            }
            const remainder = chunkText.slice(newlineIdx + 1);
            if (remainder) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + remainder }
                    : m
                )
              );
            }
            continue;
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunkText }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I'm sorry, I encountered a brief connection issue. Let's try again in a moment.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      // Mark current assistant message stream as finished
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    }
  }, [input, isLoading, messages]);

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setIsMobileMenuOpen(false);
  };

  const hasMessages = messages.length > 0;
  const isMiraThinking = isLoading && messages.some((m) => m.role === 'assistant' && !m.content);

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-mira-bg-primary text-mira-text-primary font-sans relative">
      
      {/* Subtle, soft ambient dark-mode lights (Impeccable compliant: not over-saturated) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(180,158,255,0.012)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.008)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* ─── Sidebar (Desktop & Mobile Drawer) ─── */}
      <Sidebar
        isMiraThinking={isMiraThinking}
        hasMessages={hasMessages}
        onClearChat={handleClearChat}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* ─── Topbar (Mobile) ─── */}
      <Topbar
        isMiraThinking={isMiraThinking}
        hasMessages={hasMessages}
        onClearChat={handleClearChat}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* ─── Main Chat Workspace ─── */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-mira-bg-primary relative z-10">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 flex flex-col justify-start">
          {!hasMessages ? (
            <WelcomeView onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="max-w-2xl w-full mx-auto flex flex-col gap-7">
              {messages.map((m) => (
                <MessageItem
                  key={m.id}
                  message={m}
                  isMiraThinking={isMiraThinking}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ─── Bottom Fixed Input Bar ─── */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </section>
    </main>
  );
}
