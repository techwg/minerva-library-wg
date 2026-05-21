"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterContent, Paragraph, SavedBookmark } from "@/lib/types";

type FontSize = 16 | 19 | 22 | 26;
type OrigLang = "hanja" | "greek" | "latin" | "english";

interface SelectionState {
  text: string;
  paragraphId: string;
  x: number;
  y: number;
}

interface ReaderBodyProps {
  chapter: ChapterContent;
  fontSize: FontSize;
  columns: 1 | 2;
  highlightedParagraphId?: string;
  bookmarks: SavedBookmark[];
  onTextSelect?: (text: string, paragraphId: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function originalStyle(code: OrigLang, baseFs: number): React.CSSProperties {
  const base: React.CSSProperties = { fontSize: baseFs * 0.9, lineHeight: 1.9 };
  switch (code) {
    case "greek":
    case "latin":
      return { ...base, fontFamily: "Cardo, 'EB Garamond', Georgia, serif", fontStyle: "italic", letterSpacing: "0.005em" };
    case "english":
      return { ...base, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: "italic", letterSpacing: "0.005em" };
    case "hanja":
    default:
      return { ...base, letterSpacing: "0.04em" };
  }
}

export function ReaderBody({
  chapter,
  fontSize,
  columns,
  highlightedParagraphId,
  bookmarks,
  onTextSelect,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
}: ReaderBodyProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [origLang, setOrigLang] = useState<OrigLang>(chapter.originalLangCode);

  useEffect(() => { setOrigLang(chapter.originalLangCode); }, [chapter.originalLangCode]);

  // 텍스트 선택 감지
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null);
      return;
    }
    const text = sel.toString().trim();
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = bodyRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // 가장 가까운 paragraph id 찾기
    let node: Node | null = range.startContainer;
    let paragraphId = "";
    while (node && node !== bodyRef.current) {
      if (node instanceof HTMLElement && node.dataset.paragraphId) {
        paragraphId = node.dataset.paragraphId;
        break;
      }
      node = node.parentNode;
    }

    setSelection({
      text,
      paragraphId,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
  }, []);

  const handleAiAsk = () => {
    if (!selection) return;
    onTextSelect?.(selection.text, selection.paragraphId);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const bookmarkedIds = new Set(bookmarks.map((b) => b.passageId));

  return (
    <div
      ref={bodyRef}
      className={cn("relative flex flex-col h-full reader-body", `fs-${fontSize}`)}
      style={{ background: "var(--bg-reader)", userSelect: "text" }}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 브레드크럼 */}
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-ink-400 uppercase tracking-widest">
          {chapter.breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-200">›</span>}
              <span className={i === chapter.breadcrumb.length - 1 ? "text-ink-600" : ""}>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 챕터 제목 */}
      <div className="flex-shrink-0 px-8 pb-6 border-b border-parchment-200">
        <div
          className="text-[11px] font-black uppercase tracking-widest mb-1"
          style={{ color: "var(--book-accent)" }}
        >
          {chapter.chapterLabel}
        </div>
        <h1 className="text-[28px] font-black text-ink-900 tracking-tight leading-tight">
          {chapter.title}
          {chapter.titleOriginal && (
            <span className="text-ink-300 ml-3 text-[20px]">{chapter.titleOriginal}</span>
          )}
        </h1>
        {chapter.intro && (
          <p className="mt-2 text-[13.5px] text-ink-500 leading-relaxed max-w-[600px]">{chapter.intro}</p>
        )}

        {/* 언어 토글 (서양 원전: greek/latin + english) */}
        {chapter.originalLangs.length > 1 && (
          <div className="flex gap-1.5 mt-3">
            {chapter.originalLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setOrigLang(lang.code)}
                className={cn("pill text-[11px] transition-all")}
                style={
                  origLang === lang.code
                    ? { background: "var(--book-accent-soft)", color: "var(--book-accent-deep)", borderColor: "var(--book-accent)" }
                    : {}
                }
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-reader mx-auto space-y-6">
          {chapter.paragraphs.map((p) => {
            const isHighlighted = p.id === highlightedParagraphId;
            const hasBookmark = bookmarkedIds.has(p.id);
            const showOrig = columns === 2;

            return (
              <div
                key={p.id}
                data-paragraph-id={p.id}
                className={cn(
                  "relative group transition-all",
                  isHighlighted && "paragraph-highlighted"
                )}
              >
                {/* 책갈피 리본 */}
                {hasBookmark && (
                  <div
                    className="absolute -top-1 right-0 pill text-[10px]"
                    style={{ background: "var(--book-accent-soft)", color: "var(--book-accent-deep)", borderColor: "var(--book-accent)" }}
                  >
                    <Bookmark size={10} /> 책갈피
                  </div>
                )}

                {/* 한문/국문 표시 — whitespace-pre-line으로 줄바꿈 보존 */}
                {showOrig && p.original && p.ko ? (
                  /* 2단 모드 + 짝 데이터: 좌우 grid */
                  <div className="grid grid-cols-[1fr_1fr] gap-6">
                    <div className="whitespace-pre-line" style={originalStyle(origLang, fontSize)}>
                      {origLang === "english" && p.originalEn ? p.originalEn : p.original}
                    </div>
                    <div className="whitespace-pre-line">{p.ko}</div>
                  </div>
                ) : p.original && p.ko ? (
                  /* 1단 모드 + 짝 데이터: 위 한문(작게·연하게) / 아래 국문 */
                  <>
                    <div
                      className="whitespace-pre-line text-ink-400 text-[0.85em] leading-relaxed mb-2"
                      style={originalStyle(origLang, fontSize)}
                    >
                      {origLang === "english" && p.originalEn ? p.originalEn : p.original}
                    </div>
                    <div className="whitespace-pre-line">{p.ko}</div>
                  </>
                ) : p.ko ? (
                  <div className="whitespace-pre-line">{p.ko}</div>
                ) : (
                  /* 한국어 번역이 없는 한문/외국어 단독 책 → 원문을 메인으로 표시 */
                  <div className="whitespace-pre-line" style={originalStyle(chapter.originalLangCode, fontSize)}>{p.original}</div>
                )}

                {/* 문단 하이라이트 표시 (명언) */}
                {p.highlight && (
                  <div
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                    style={{ background: "var(--book-accent)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-t border-parchment-200">
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold disabled:opacity-30 transition-all hover:-translate-x-0.5"
          style={{ color: "var(--book-accent-deep)" }}
        >
          <ChevronLeft size={15} /> 이전 장
        </button>

        <div className="text-[11px] text-ink-400 font-black tracking-wider">
          {chapter.sourceCredit}
        </div>

        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold disabled:opacity-30 transition-all hover:translate-x-0.5"
          style={{ color: "var(--book-accent-deep)" }}
        >
          다음 장 <ChevronRight size={15} />
        </button>
      </div>

      {/* 텍스트 선택 Tooltip */}
      {selection && (
        <div
          className="absolute z-50 flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border text-[12px] font-bold"
          style={{
            left: selection.x,
            top: selection.y,
            transform: "translate(-50%, -100%)",
            background: "var(--book-accent-deep)",
            borderColor: "var(--book-accent)",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          <button
            className="flex items-center gap-1 hover:opacity-80 px-1"
            onClick={handleAiAsk}
          >
            💬 AI에게 묻기
          </button>
          <span className="opacity-40">|</span>
          <button
            className="flex items-center gap-1 hover:opacity-80 px-1"
            onClick={() => {
              navigator.clipboard?.writeText(selection.text);
              setSelection(null);
            }}
          >
            📌 인용
          </button>
        </div>
      )}
    </div>
  );
}
