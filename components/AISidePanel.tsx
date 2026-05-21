"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAGES } from "@/data/sages";
import { SaveAnswerCard } from "./SaveAnswerCard";
import type { ChatMessage, LibraryContext, SavedBookmark } from "@/lib/types";

interface AISidePanelProps {
  context: LibraryContext;
  defaultPersonaId?: string;
  onSaveBookmark?: (bookmark: Omit<SavedBookmark, "id" | "createdAt">) => void;
  className?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function AISidePanel({
  context,
  defaultPersonaId = "dasan",
  onSaveBookmark,
  className,
}: AISidePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [personaId, setPersonaId] = useState(defaultPersonaId);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentSage = SAGES.find((s) => s.id === personaId) ?? SAGES[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 컨텍스트가 바뀌면 패널 상단에 컨텍스트 라벨 갱신
  const [shownContext, setShownContext] = useState(context);
  useEffect(() => { setShownContext(context); }, [context]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setLastAiResponse(null);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const history: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text.trim() },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          messages: history,
          mode: "library",
          context: shownContext,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "delta") {
              accumulated += payload.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                  streaming: true,
                };
                return updated;
              });
            } else if (payload.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                  streaming: false,
                };
                return updated;
              });
              setLastAiResponse(accumulated);
            }
          } catch { /* non-JSON line */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "응답 중 오류가 발생했습니다. 다시 시도해 주세요.",
            streaming: false,
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [messages, personaId, shownContext, streaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (text: string) => sendMessage(text);

  const suggestions = context.selectedText
    ? [`"${context.selectedText.slice(0, 20)}…" — 이 구절을 풀이해 주세요`]
    : [
        "이 장에서 핵심 교훈은 무엇인가요?",
        "현대적 맥락에서 어떻게 적용할 수 있을까요?",
        "저자가 이 부분을 쓴 배경이 궁금합니다",
      ];

  return (
    <div className={cn("flex flex-col h-full bg-parchment-0 border-l border-parchment-200", className)}>
      {/* 헤더 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-parchment-200 bg-parchment-50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: "var(--book-accent)" }} />
            <span className="text-[13px] font-black text-ink-800">AI 현자에게 묻기</span>
          </div>

          {/* 페르소나 셀렉터 */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold border transition-colors"
              style={{
                background: "var(--book-accent-soft)",
                borderColor: "var(--book-accent)",
                color: "var(--book-accent-deep)",
              }}
            >
              {currentSage.name.ko}
              <ChevronDown size={11} />
            </button>
            {showPersonaMenu && (
              <div className="absolute right-0 top-8 z-50 bg-parchment-0 border border-parchment-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                {SAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setPersonaId(s.id); setShowPersonaMenu(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[13px] font-bold hover:bg-parchment-100 transition-colors",
                      s.id === personaId ? "text-ink-900" : "text-ink-600"
                    )}
                  >
                    {s.name.ko}
                    {s.id === personaId && <span className="ml-2 text-[10px]" style={{ color: "var(--book-accent)" }}>●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 현재 읽는 위치 컨텍스트 라벨 */}
        <div className="text-[11px] text-ink-400 font-bold leading-tight">
          지금 읽는 곳:{" "}
          <span className="text-ink-600">{shownContext.chapterTitle}</span>
          {shownContext.selectedText && (
            <span className="ml-1 text-ink-500">
              · 선택 구절 있음
            </span>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-500 leading-relaxed">
              지금 읽고 있는 원전의 내용을 바탕으로 풀이하고 답합니다.
            </p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[12.5px] font-bold text-ink-700 border transition-all hover:-translate-y-px"
                  style={{
                    background: "var(--book-accent-soft)",
                    borderColor: "var(--book-accent)",
                    opacity: 0.85,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
            {msg.role === "user" ? (
              <div
                className="max-w-[90%] px-3 py-2.5 rounded-2xl rounded-tr-sm text-[13.5px] font-bold text-white"
                style={{ background: "var(--book-accent-deep)" }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="w-full space-y-2">
                <div
                  className={cn(
                    "text-[13.5px] text-ink-800 leading-[1.75] whitespace-pre-wrap",
                    msg.streaming && "streaming-cursor"
                  )}
                >
                  {msg.content}
                </div>
                {/* 책갈피 저장 카드 — 마지막 AI 응답이 완료됐을 때 */}
                {!msg.streaming && i === messages.length - 1 && lastAiResponse && onSaveBookmark && (
                  <SaveAnswerCard
                    chapterLabel={shownContext.chapterTitle}
                    onSave={() =>
                      onSaveBookmark({
                        bookId: shownContext.bookId,
                        chapterId: shownContext.chapterId,
                        passageId: shownContext.selectedText ? "selection" : "full",
                        selectedText: shownContext.selectedText ?? shownContext.visibleText.slice(0, 80),
                        aiPersonaId: personaId,
                        aiResponseMd: lastAiResponse,
                        citedQuote: shownContext.selectedText ?? "",
                      })
                    }
                  />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-3 py-3 border-t border-parchment-200 bg-parchment-50"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="이 원전의 내용에 대해 물어보세요…"
            rows={2}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-[13.5px] text-ink-800 bg-parchment-0 border border-parchment-200 focus:outline-none focus:border-opacity-100 placeholder:text-ink-300 disabled:opacity-50"
            style={{ borderColor: input ? "var(--book-accent)" : undefined }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:-translate-y-px active:translate-y-0"
            style={{ background: "var(--book-accent)", color: "#fff" }}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-300 font-bold">
          일반 페르소나 채팅 →{" "}
          <a
            href="https://minerva2.whosgood.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink-500"
          >
            미네르바 본 플랫폼
          </a>
        </p>
      </form>
    </div>
  );
}
