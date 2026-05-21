"use client";

// 미네르바 도서관 — 몰입형 리더 (v0.2)
//
// 핵심 설계 (CHANGELOG_v0.2.md):
// 1. 라이브러리 chrome 제거. 56px 컨텍스트 바 + pill progress만.
// 2. 두 모드: 펼침판(paginated) / 두루마리(scroll) — 토글 + localStorage 영구 저장.
// 3. 한자 hover 뜻풀이.
// 4. AI 패널: paginated=FAB → slide panel, scroll desktop=side panel 상시, mobile=bottom sheet.
// 5. 본문 드래그 → floating context menu (AI에게 묻기 / 인용 / 책갈피).

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ScrollText,
  Bookmark,
  Type,
  Sparkles,
  X,
  Minimize2,
  List,
} from "lucide-react";
import { cn, paletteClass } from "@/lib/utils";
import { HanjaText } from "./HanjaText";
import {
  ChapterDivider,
  CornerBrackets,
  CarvedHanja,
  NagGwan,
  KoreanSeal,
  BrushHighlight,
} from "./Decorations";
import { AISidePanel } from "./AISidePanel";
import { ReaderTOC } from "./ReaderTOC";
import type {
  Book,
  ChapterContent,
  LibraryContext,
  OriginalLangCode,
  SavedBookmark,
} from "@/lib/types";

export type ReadMode = "paginated" | "scroll";
export type FontSize = 16 | 19 | 22 | 26;

const MODE_KEY = "minerva_library_read_mode";
const FONT_KEY = "minerva_library_font_size";
const TEXT_VIEW_KEY = "minerva_library_text_view";

// 본문 표시 방식: 원문+국역 동시 / 국역만 / 원문만
export type TextView = "both" | "ko" | "original";

interface ImmersiveReaderProps {
  book: Book;
  chapter: ChapterContent | null;
  loading: boolean;
  bookmarks: SavedBookmark[];
  activeChapterId: string;
  onChapterSelect: (id: string) => void;
  onSaveBookmark: (b: Omit<SavedBookmark, "id" | "createdAt">) => void;
  onBookmarkClick: (b: SavedBookmark) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function originalStyle(code: OriginalLangCode, fs: number): React.CSSProperties {
  const base: React.CSSProperties = { fontSize: fs * 0.72, lineHeight: 1.75, color: "var(--ink-500)" };
  if (code === "hanja") return { ...base, fontWeight: 600, letterSpacing: "0.06em" };
  if (code === "greek" || code === "latin")
    return { ...base, fontFamily: 'Cardo, "EB Garamond", Georgia, serif', fontStyle: "italic", letterSpacing: "0.005em" };
  if (code === "english")
    return { ...base, fontFamily: '"EB Garamond", Georgia, serif', fontWeight: 500, letterSpacing: "0.005em" };
  return base;
}

function paginate<T>(items: T[], perPage: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages.length ? pages : [[]];
}

const FOLIOS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function folio(n: number) {
  return FOLIOS[n] ?? `${n + 1}`;
}

export function ImmersiveReader(props: ImmersiveReaderProps) {
  const { book, chapter, loading, bookmarks, activeChapterId } = props;
  const [mode, setMode] = useState<ReadMode>("paginated");
  const [fontSize, setFontSize] = useState<FontSize>(19);
  const [hanjaGloss, setHanjaGloss] = useState(true);
  const [textView, setTextView] = useState<TextView>("both");
  const [pageIdx, setPageIdx] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libraryContext, setLibraryContext] = useState<LibraryContext>({
    bookId: book.id,
    chapterId: activeChapterId,
    chapterTitle: "",
    visibleText: "",
  });
  const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; text: string; paragraphId: string } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 초기 로드 — localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem(MODE_KEY);
      if (m === "scroll" || m === "paginated") setMode(m);
      const f = Number(localStorage.getItem(FONT_KEY));
      if ([16, 19, 22, 26].includes(f)) setFontSize(f as FontSize);
      const tv = localStorage.getItem(TEXT_VIEW_KEY);
      if (tv === "both" || tv === "ko" || tv === "original") setTextView(tv);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(MODE_KEY, mode); } catch {}
  }, [mode]);
  useEffect(() => {
    try { localStorage.setItem(FONT_KEY, String(fontSize)); } catch {}
  }, [fontSize]);
  useEffect(() => {
    try { localStorage.setItem(TEXT_VIEW_KEY, textView); } catch {}
  }, [textView]);

  // 챕터 바뀔 때 페이지·컨텍스트 리셋
  useEffect(() => {
    setPageIdx(0);
    if (chapter) {
      setLibraryContext({
        bookId: book.id,
        chapterId: chapter.chapterId,
        chapterTitle: chapter.title,
        visibleText: chapter.paragraphs.slice(0, 4).map((p) => p.ko).join("\n\n"),
      });
    }
  }, [book.id, chapter]);

  // 본문 텍스트 선택 감지
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setSelectionMenu(null); return; }
    const text = sel.toString().trim();
    if (!text) { setSelectionMenu(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    let node: Node | null = range.startContainer;
    let pid = "";
    while (node && node !== bodyRef.current) {
      if (node instanceof HTMLElement && node.dataset.paragraphId) { pid = node.dataset.paragraphId; break; }
      node = node.parentNode;
    }
    setSelectionMenu({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text,
      paragraphId: pid,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setSelectionMenu(null);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  const askAIWithSelection = () => {
    if (!selectionMenu) return;
    setLibraryContext((c) => ({ ...c, selectedText: selectionMenu.text }));
    setSelectionMenu(null);
    setAiOpen(true);
  };

  // 페이지 당 단락 수 — 원문+국역 동시: 4, 국역만: 8, 원문만: 8
  // (빈 공간 줄이고 자주 안 넘기게)
  const paragraphsPerPage = textView === "both" ? 4 : 8;
  const pages = chapter ? paginate(chapter.paragraphs, paragraphsPerPage) : [];
  const totalPages = pages.length;
  const currentPageParagraphs = pages[pageIdx] ?? [];
  const palette = book.palette;
  const langCode = (chapter?.originalLangCode ?? "hanja") as OriginalLangCode;

  // 키보드 ← →
  useEffect(() => {
    if (mode !== "paginated") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPageIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setPageIdx((i) => Math.min(totalPages - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, totalPages]);

  const prevPage = () => {
    if (pageIdx === 0) { props.hasPrev && props.onPrevChapter(); }
    else setPageIdx((i) => i - 1);
  };
  const nextPage = () => {
    if (pageIdx >= totalPages - 1) { props.hasNext && props.onNextChapter(); }
    else setPageIdx((i) => i + 1);
  };

  return (
    <div className={cn("flex flex-col h-[100dvh] overflow-hidden reader-immersive", paletteClass(palette))}>
      {/* ── Immersive Top Bar (56px) ── */}
      <ImmersiveTopBar
        bookTitle={book.title.ko}
        chapterLabel={chapter?.chapterLabel ?? book.chapters.find((c) => c.id === activeChapterId)?.title ?? ""}
        mode={mode}
        onMode={setMode}
        bookId={book.id}
        onBookmarkClick={() => setTocOpen((v) => !v)}
        onSettings={() => setSettingsOpen((v) => !v)}
      />

      {/* ── Body ── */}
      <div ref={bodyRef} onMouseUp={handleMouseUp} className="flex-1 relative overflow-hidden">
        {loading || !chapter ? (
          <div className="flex items-center justify-center h-full text-ink-400 text-[14px] font-bold animate-pulse">
            불러오는 중…
          </div>
        ) : mode === "paginated" ? (
          <PaginatedView
            chapter={chapter}
            paragraphs={currentPageParagraphs}
            pageIdx={pageIdx}
            totalPages={totalPages}
            fontSize={fontSize}
            langCode={langCode}
            hanjaGloss={hanjaGloss}
            textView={textView}
            onPrev={prevPage}
            onNext={nextPage}
          />
        ) : (
          <InfiniteScrollView
            book={book}
            initialChapter={chapter}
            fontSize={fontSize}
            langCode={langCode}
            hanjaGloss={hanjaGloss}
            textView={textView}
            withSidePanel={true}
            onActiveChapterChange={(id) => {
              if (id !== activeChapterId) props.onChapterSelect(id);
            }}
          />
        )}

        {/* AI Side Panel (desktop, scroll mode) */}
        {mode === "scroll" && (
          <div className="hidden md:block absolute top-0 right-0 bottom-0 w-[388px] border-l border-parchment-200 bg-parchment-0">
            <AISidePanel
              context={libraryContext}
              defaultPersonaId={book.personaId}
              onSaveBookmark={props.onSaveBookmark}
            />
          </div>
        )}

        {/* AI Pearl (FAB) — paginated mode + mobile scroll */}
        {(mode === "paginated" || true) && (
          <button
            onClick={() => setAiOpen(true)}
            className={cn(
              "absolute right-6 bottom-20 md:right-10 md:bottom-24 rounded-full text-white grid place-items-center shadow-xl z-10 transition-transform hover:scale-105 active:scale-95",
              mode === "scroll" && "md:hidden",
            )}
            style={{
              width: 60,
              height: 60,
              background: "var(--book-accent)",
              border: "3px solid var(--parchment-50)",
              boxShadow: "0 12px 28px -4px rgba(132,47,20,0.5), 0 2px 6px rgba(0,0,0,0.2)",
            }}
            aria-label="AI 현자에게 묻기"
          >
            <Sparkles size={24} />
            <span
              className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full"
              style={{ background: "var(--persimmon-500)", border: "2px solid var(--parchment-50)" }}
            />
          </button>
        )}

        {/* Selection Menu — floating */}
        {selectionMenu && (
          <div
            className="selection-menu"
            style={{
              left: selectionMenu.x,
              top: selectionMenu.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <button onClick={askAIWithSelection}>
              <Sparkles size={12} /> AI에게 묻기
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(`"${selectionMenu.text}"`); setSelectionMenu(null); }}>
              인용 복사
            </button>
            <button
              onClick={() => {
                if (!chapter) return;
                props.onSaveBookmark({
                  bookId: book.id,
                  chapterId: chapter.chapterId,
                  passageId: selectionMenu.paragraphId || "selection",
                  selectedText: selectionMenu.text,
                  aiPersonaId: book.personaId,
                  aiResponseMd: "",
                  citedQuote: selectionMenu.text,
                });
                setSelectionMenu(null);
              }}
            >
              📌 책갈피
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Progress Pill ── */}
      <ImmersiveBottomBar
        currentPage={mode === "paginated" ? pageIdx + 1 : 1}
        totalPages={mode === "paginated" ? Math.max(1, totalPages) : 1}
        chapterLabel={chapter?.chapterLabel ?? ""}
        mode={mode}
      />

      {/* ── TOC Sheet ── */}
      {tocOpen && (
        <SheetOverlay onClose={() => setTocOpen(false)} title="목차 · 책갈피">
          <ReaderTOC
            book={book}
            activeChapterId={activeChapterId}
            onChapterSelect={(id) => { props.onChapterSelect(id); setTocOpen(false); }}
            fontSize={fontSize}
            onFontSizeChange={(s) => setFontSize(s as FontSize)}
            columns={1}
            onColumnsChange={() => {}}
            bookmarks={bookmarks}
            onBookmarkClick={(b) => { props.onBookmarkClick(b); setTocOpen(false); }}
          />
        </SheetOverlay>
      )}

      {/* ── Settings Sheet ── */}
      {settingsOpen && (
        <SheetOverlay onClose={() => setSettingsOpen(false)} title="읽기 설정">
          <div className="p-5 space-y-5">
            <Setting label="글자 크기">
              <div className="flex gap-2">
                {([16, 19, 22, 26] as FontSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[13px] font-black transition-colors",
                      fontSize === s ? "text-white" : "text-ink-500 bg-parchment-100",
                    )}
                    style={fontSize === s ? { background: "var(--book-accent)" } : {}}
                  >
                    가{s}
                  </button>
                ))}
              </div>
            </Setting>
            <Setting label="본문 표시">
              <div className="flex gap-2">
                {([
                  { v: "both", label: "원문+국역" },
                  { v: "ko", label: "한국어만" },
                  { v: "original", label: "원문만" },
                ] as { v: TextView; label: string }[]).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setTextView(opt.v)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[12px] font-black transition-colors",
                      textView === opt.v ? "text-white" : "text-ink-500 bg-parchment-100",
                    )}
                    style={textView === opt.v ? { background: "var(--book-accent)" } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Setting>
            <Setting label="한자 위 뜻풀이">
              <button
                onClick={() => setHanjaGloss((v) => !v)}
                className={cn("px-4 py-2 rounded-full text-[12px] font-black", hanjaGloss ? "text-white" : "text-ink-500 bg-parchment-100")}
                style={hanjaGloss ? { background: "var(--book-accent)" } : {}}
              >
                {hanjaGloss ? "ON" : "OFF"}
              </button>
            </Setting>
            <Setting label="읽기 모드">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("paginated")}
                  className={cn("flex-1 py-2.5 rounded-xl text-[12px] font-black flex items-center justify-center gap-1.5", mode === "paginated" ? "text-white" : "text-ink-500 bg-parchment-100")}
                  style={mode === "paginated" ? { background: "var(--book-accent)" } : {}}
                >
                  <BookOpen size={13} /> 펼침판
                </button>
                <button
                  onClick={() => setMode("scroll")}
                  className={cn("flex-1 py-2.5 rounded-xl text-[12px] font-black flex items-center justify-center gap-1.5", mode === "scroll" ? "text-white" : "text-ink-500 bg-parchment-100")}
                  style={mode === "scroll" ? { background: "var(--book-accent)" } : {}}
                >
                  <ScrollText size={13} /> 두루마리
                </button>
              </div>
            </Setting>
          </div>
        </SheetOverlay>
      )}

      {/* ── AI Sheet — Paginated mode / Mobile scroll mode ── */}
      {aiOpen && (
        <SheetOverlay
          onClose={() => setAiOpen(false)}
          title={`AI 현자에게 묻기`}
          tall
          side="right"
        >
          <AISidePanel
            context={libraryContext}
            defaultPersonaId={book.personaId}
            onSaveBookmark={props.onSaveBookmark}
          />
        </SheetOverlay>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function ImmersiveTopBar({
  bookTitle,
  chapterLabel,
  mode,
  onMode,
  bookId,
  onBookmarkClick,
  onSettings,
}: {
  bookTitle: string;
  chapterLabel: string;
  mode: ReadMode;
  onMode: (m: ReadMode) => void;
  bookId: string;
  onBookmarkClick: () => void;
  onSettings: () => void;
}) {
  return (
    <div
      className="flex-shrink-0 flex items-center px-4 md:px-5 relative z-30"
      style={{
        height: 56,
        background: "linear-gradient(180deg, var(--parchment-50) 0%, rgba(251,247,236,0.92) 100%)",
        backdropFilter: "blur(4px)",
        borderBottom: "1px solid var(--clay-100)",
      }}
    >
      <Link
        href={`/books/${bookId}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-ink-700"
        style={{ border: "1px solid var(--clay-100)", background: "transparent" }}
      >
        <ChevronLeft size={14} /> <span className="hidden sm:inline">표지</span>
      </Link>

      <div className="flex-1 flex justify-center min-w-0 px-3">
        <div className="flex items-baseline gap-2 leading-none min-w-0">
          <span className="text-[13px] font-black text-ink-900 tracking-tight truncate max-w-[140px] md:max-w-[260px]">
            {bookTitle}
          </span>
          <span className="text-[11px] text-ink-400">·</span>
          <span className="text-[11px] font-bold text-ink-600 truncate max-w-[120px] md:max-w-[220px]">
            {chapterLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Mode toggle */}
        <div
          className="flex items-center p-0.5"
          style={{
            background: "var(--parchment-100)",
            border: "1px solid var(--clay-100)",
            borderRadius: 999,
          }}
        >
          <button
            onClick={() => onMode("paginated")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[11px] transition-all"
            style={{
              background: mode === "paginated" ? "var(--parchment-0)" : "transparent",
              color: mode === "paginated" ? "var(--book-accent-deep)" : "var(--ink-500)",
              boxShadow: mode === "paginated" ? "var(--shadow-sm)" : "none",
            }}
            title="펼침판"
          >
            <BookOpen size={12} /> <span className="hidden sm:inline">펼침판</span>
          </button>
          <button
            onClick={() => onMode("scroll")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[11px] transition-all"
            style={{
              background: mode === "scroll" ? "var(--parchment-0)" : "transparent",
              color: mode === "scroll" ? "var(--book-accent-deep)" : "var(--ink-500)",
              boxShadow: mode === "scroll" ? "var(--shadow-sm)" : "none",
            }}
            title="두루마리"
          >
            <ScrollText size={12} /> <span className="hidden sm:inline">두루마리</span>
          </button>
        </div>
        <button
          onClick={onBookmarkClick}
          className="p-2 rounded-[10px] text-ink-600"
          style={{ border: "1px solid var(--clay-100)", background: "transparent" }}
          title="목차·책갈피"
        >
          <List size={14} />
        </button>
        <button
          onClick={onSettings}
          className="p-2 rounded-[10px] text-ink-600"
          style={{ border: "1px solid var(--clay-100)", background: "transparent" }}
          title="읽기 설정"
        >
          <Type size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function PaginatedView({
  chapter,
  paragraphs,
  pageIdx,
  totalPages,
  fontSize,
  langCode,
  hanjaGloss,
  textView,
  onPrev,
  onNext,
}: {
  chapter: ChapterContent;
  paragraphs: ChapterContent["paragraphs"];
  pageIdx: number;
  totalPages: number;
  fontSize: number;
  langCode: OriginalLangCode;
  hanjaGloss: boolean;
  textView: TextView;
  onPrev: () => void;
  onNext: () => void;
}) {
  // 데스크톱: 2면 펼침. 모바일: 1면.
  const half = Math.ceil(paragraphs.length / 2);
  const leftPs = paragraphs.slice(0, half);
  const rightPs = paragraphs.slice(half);
  const showTitle = pageIdx === 0;

  return (
    <div className="relative h-full w-full" style={{ background: "var(--parchment-100)" }}>
      {/* Carved hanja watermark behind */}
      <div className="absolute top-10 right-4 opacity-50 pointer-events-none hidden md:block">
        <CarvedHanja glyph={chapter.bookOriginal.charAt(0)} size={360} opacity={0.05} />
      </div>

      {/* Page-turn buttons */}
      <button
        onClick={onPrev}
        className="hidden md:grid absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full place-items-center z-20"
        style={{
          background: "rgba(255,251,242,0.6)",
          border: "1px solid var(--clay-100)",
          color: "var(--ink-700)",
        }}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={onNext}
        className="hidden md:grid absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full place-items-center z-20 text-white"
        style={{
          background: "var(--book-accent)",
          boxShadow: "0 6px 18px rgba(132,47,20,0.5)",
        }}
        aria-label="다음 페이지"
      >
        <ChevronRight size={20} />
      </button>

      {/* Two-page spread (md+) */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center p-10">
        <div
          className="grid grid-cols-2 relative paper-grain page-slide-right"
          key={`spread-${pageIdx}`}
          style={{
            width: "min(1040px, calc(100% - 160px))",
            height: "min(720px, calc(100% - 40px))",
            background: "var(--parchment-50)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.45), 0 20px 40px -10px rgba(0,0,0,0.3)",
            borderRadius: 4,
          }}
        >
          <CornerBrackets inset={20} length={32} thickness={1} color="var(--book-accent)" opacity={0.3} />
          {/* center gutter */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-[2]"
            style={{
              left: "50%",
              width: 24,
              transform: "translateX(-50%)",
              background: "linear-gradient(90deg, transparent 0%, rgba(42,34,23,0.16) 50%, transparent 100%)",
            }}
          />
          <PageSurface
            paragraphs={leftPs}
            startIdx={pageIdx * 2}
            fontSize={fontSize}
            langCode={langCode}
            hanjaGloss={hanjaGloss}
            textView={textView}
            chapter={chapter}
            showTitle={showTitle}
            folioText={folio(pageIdx * 2)}
            borderRight
          />
          <PageSurface
            paragraphs={rightPs}
            startIdx={pageIdx * 2 + 1}
            fontSize={fontSize}
            langCode={langCode}
            hanjaGloss={hanjaGloss}
            textView={textView}
            chapter={chapter}
            showTitle={false}
            folioText={folio(pageIdx * 2 + 1)}
          />
        </div>
      </div>

      {/* Mobile single page — swipe로 페이지 넘기기 */}
      <MobilePaginatedSurface
        paragraphs={paragraphs}
        pageIdx={pageIdx}
        fontSize={fontSize}
        langCode={langCode}
        hanjaGloss={hanjaGloss}
        textView={textView}
        chapter={chapter}
        showTitle={showTitle}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function MobilePaginatedSurface({
  paragraphs,
  pageIdx,
  fontSize,
  langCode,
  hanjaGloss,
  textView,
  chapter,
  showTitle,
  onPrev,
  onNext,
}: {
  paragraphs: ChapterContent["paragraphs"];
  pageIdx: number;
  fontSize: number;
  langCode: OriginalLangCode;
  hanjaGloss: boolean;
  textView: TextView;
  chapter: ChapterContent;
  showTitle: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const moved = useRef(false);
  const [dragDx, setDragDx] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    moved.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;
    // 수평 우세인 경우만 페이지 전환 제스처로 인식 (텍스트 선택과 스크롤은 보존)
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      moved.current = true;
      // 드래그 따라 살짝 따라가는 시각 피드백
      setDragDx(Math.max(-80, Math.min(80, dx * 0.4)));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
    startX.current = null;
    startY.current = null;
    setDragDx(0);
    if (!moved.current) return;
    const THRESHOLD = 50;
    if (dx > THRESHOLD) onPrev();
    else if (dx < -THRESHOLD) onNext();
  };

  return (
    <div
      className="md:hidden absolute inset-0 flex items-stretch p-3 pb-16"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* peek-next-page hint */}
      <div
        className="absolute right-2 top-3 bottom-16 w-3 rounded-l-[4px] pointer-events-none"
        style={{ background: "var(--parchment-200)", boxShadow: "inset 4px 0 8px -2px rgba(42,34,23,0.15)" }}
      />
      <div
        key={`mpage-${pageIdx}`}
        className="relative flex-1 paper-grain page-slide-right"
        style={{
          background: "var(--parchment-50)",
          boxShadow: "0 4px 12px -2px rgba(42,34,23,0.12)",
          marginRight: 14,
          borderRadius: 4,
          transform: `translateX(${dragDx}px)`,
          transition: dragDx === 0 ? "transform 200ms ease-out" : "none",
          overflow: "auto",
        }}
      >
        <PageSurface
          paragraphs={paragraphs}
          startIdx={pageIdx * 2}
          fontSize={fontSize - 2}
          langCode={langCode}
          hanjaGloss={hanjaGloss}
          textView={textView}
          chapter={chapter}
          showTitle={showTitle}
          folioText={folio(pageIdx)}
          compact
        />
      </div>
      {/* 가장자리 탭 영역 (보조 — swipe와 병행) */}
      <button
        onClick={onPrev}
        aria-label="이전 페이지"
        className="absolute left-0 top-0 bottom-16 w-10 opacity-0"
      />
      <button
        onClick={onNext}
        aria-label="다음 페이지"
        className="absolute right-0 top-0 bottom-16 w-10 opacity-0"
      />
      {/* 모바일 안내 (첫 페이지에만) */}
      {pageIdx === 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold text-ink-400 rounded-full pointer-events-none" style={{ background: "rgba(251,247,236,0.9)" }}>
          ← 좌우로 쓸어 넘기기 →
        </div>
      )}
    </div>
  );
}

function PageSurface({
  paragraphs,
  startIdx,
  fontSize,
  langCode,
  hanjaGloss,
  textView,
  chapter,
  showTitle,
  folioText,
  borderRight,
  compact,
}: {
  paragraphs: ChapterContent["paragraphs"];
  startIdx: number;
  fontSize: number;
  langCode: OriginalLangCode;
  hanjaGloss: boolean;
  textView: TextView;
  chapter: ChapterContent;
  showTitle: boolean;
  folioText: string;
  borderRight?: boolean;
  compact?: boolean;
}) {
  const orig = originalStyle(langCode, fontSize);
  return (
    <div
      className="relative flex flex-col"
      style={{
        padding: compact ? "26px 22px 40px" : "44px 56px 52px",
        borderRight: borderRight ? "1px solid var(--clay-100)" : undefined,
      }}
    >
      {showTitle && (
        <div className="text-center mb-7">
          <div
            className="font-extrabold uppercase mb-2.5"
            style={{
              fontSize: compact ? 9 : 10,
              color: "var(--book-accent-deep)",
              letterSpacing: "0.22em",
            }}
          >
            {chapter.chapterLabel}
          </div>
          <h1
            className="m-0 font-black tracking-tight text-ink-900"
            style={{
              fontSize: compact ? 22 : 28,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {chapter.title}
            {chapter.titleOriginal && (
              <span
                className="ml-1.5 text-ink-400 font-extrabold"
                style={{
                  fontSize: compact ? 15 : 18,
                  ...(langCode !== "hanja"
                    ? { fontStyle: "italic", fontFamily: '"EB Garamond", Georgia, serif', fontWeight: 600 }
                    : {}),
                }}
              >
                {chapter.titleOriginal}
              </span>
            )}
          </h1>
          <ChapterDivider color="var(--book-accent)" width={compact ? 140 : 200} />
        </div>
      )}

      <div className="flex-1 relative">
        {paragraphs.map((p, i) => {
          const hasOriginal = !!(p.original || p.originalEn);
          const showOriginal = textView !== "ko" && hasOriginal;
          const showKo = textView !== "original" && !!p.ko;
          return (
            <div key={p.id} data-paragraph-id={p.id} className="relative" style={{ marginBottom: 22 }}>
              <div
                className="absolute"
                style={{ left: -32, top: 6, fontSize: 10, color: "var(--ink-400)", fontWeight: 800 }}
              >
                {String(startIdx + i + 1).padStart(2, "0")}
              </div>
              {showOriginal && (
                <div style={{ ...orig, marginBottom: 4 }}>
                  {langCode === "hanja" ? (
                    <HanjaText text={p.original} glossOn={hanjaGloss} />
                  ) : (
                    p.originalEn ?? p.original
                  )}
                </div>
              )}
              {showKo && (
                <div
                  style={{
                    fontSize,
                    lineHeight: 1.85,
                    color: "var(--text-reader)",
                    position: "relative",
                  }}
                >
                  {p.highlight ? (
                    <span style={{ position: "relative" }}>
                      <BrushHighlight />
                      {p.ko}
                    </span>
                  ) : (
                    p.ko
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="text-center mt-4"
        style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 700, letterSpacing: "0.2em" }}
      >
        — {folioText} —
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

// ── 단일 챕터 본문 렌더 (내부용) ───────────────────────────
function ChapterContentView({
  chapter,
  fontSize,
  langCode,
  hanjaGloss,
  textView,
  isLast,
}: {
  chapter: ChapterContent;
  fontSize: number;
  langCode: OriginalLangCode;
  hanjaGloss: boolean;
  textView: TextView;
  isLast: boolean;
}) {
  const orig = originalStyle(langCode, fontSize);
  return (
    <div className="mx-auto px-6 md:px-12" style={{ maxWidth: 680 }}>
      {/* Chapter heading */}
      <div className="text-center mb-9">
        <div
          className="font-extrabold uppercase mb-3"
          style={{ fontSize: 11, color: "var(--book-accent-deep)", letterSpacing: "0.22em" }}
        >
          {chapter.chapterLabel}
        </div>
        <h1
          className="m-0 font-black tracking-tight text-ink-900"
          style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          {chapter.title}
          {chapter.titleOriginal && (
            <span
              className="ml-2 text-ink-400 font-extrabold"
              style={{
                fontSize: 20,
                ...(langCode !== "hanja"
                  ? { fontStyle: "italic", fontFamily: '"EB Garamond", Georgia, serif', fontWeight: 600 }
                  : {}),
              }}
            >
              {chapter.titleOriginal}
            </span>
          )}
        </h1>
        <ChapterDivider color="var(--book-accent)" />
        {chapter.intro && (
          <p className="mx-auto mt-4 text-ink-600 leading-relaxed" style={{ fontSize: 14.5, maxWidth: 540 }}>
            {chapter.intro}
          </p>
        )}
      </div>

      {chapter.paragraphs.map((p, i) => {
        const hasOriginal = !!(p.original || p.originalEn);
        const showOriginal = textView !== "ko" && hasOriginal;
        const showKo = textView !== "original" && !!p.ko;
        return (
          <div key={p.id} data-paragraph-id={p.id} className="relative" style={{ marginBottom: 28 }}>
            <div
              className="absolute"
              style={{ left: -30, top: 8, fontSize: 10, color: "var(--ink-400)", fontWeight: 800 }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            {showOriginal && (
              <div style={{ ...orig, marginBottom: 6 }}>
                {langCode === "hanja" ? <HanjaText text={p.original} glossOn={hanjaGloss} /> : p.originalEn ?? p.original}
              </div>
            )}
            {showKo && (
              <div style={{ fontSize, lineHeight: 1.85, color: "var(--text-reader)", position: "relative" }}>
                {p.highlight ? (
                  <span style={{ position: "relative" }}>
                    <BrushHighlight />
                    {p.ko}
                  </span>
                ) : (
                  p.ko
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 챕터 구분선 (마지막 챕터는 종결 낙관, 중간은 단순 디바이더) */}
      <div className="mt-14 mb-12 flex flex-col items-center gap-4">
        <ChapterDivider color="var(--book-accent)" glyph="·" width={120} />
        {isLast ? (
          <>
            <NagGwan
              name={chapter.author.split(" ").slice(-1)[0]}
              hanja={chapter.bookOriginal.slice(0, 2)}
              color="var(--book-accent)"
            />
            <div
              className="mt-3 text-ink-500"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}
            >
              · 끝 ·
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── 무한 스크롤 — 다음 챕터 자동 fetch + append ─────────────
function InfiniteScrollView({
  book,
  initialChapter,
  fontSize,
  langCode,
  hanjaGloss,
  textView,
  withSidePanel,
  onActiveChapterChange,
}: {
  book: Book;
  initialChapter: ChapterContent;
  fontSize: number;
  langCode: OriginalLangCode;
  hanjaGloss: boolean;
  textView: TextView;
  withSidePanel?: boolean;
  onActiveChapterChange?: (chapterId: string) => void;
}) {
  const [loaded, setLoaded] = useState<ChapterContent[]>([initialChapter]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // initialChapter 변경 시 (사용자가 TOC에서 다른 챕터 선택) 리셋
  useEffect(() => {
    setLoaded([initialChapter]);
    setDone(false);
    // 컨테이너 스크롤을 맨 위로
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [initialChapter.bookId, initialChapter.chapterId]);

  // 다음 챕터 fetch
  const fetchNext = useCallback(async () => {
    if (loading || done) return;
    const lastId = loaded[loaded.length - 1]?.chapterId;
    const idx = book.chapters.findIndex((c) => c.id === lastId);
    if (idx < 0 || idx >= book.chapters.length - 1) {
      setDone(true);
      return;
    }
    const nextChapterMeta = book.chapters[idx + 1];
    setLoading(true);
    try {
      const res = await fetch(`/content/books/${book.id}/${nextChapterMeta.id}.json`);
      if (!res.ok) {
        // 다음 챕터 본문이 없으면 종료 (목민심서 등 부분 본문 책)
        setDone(true);
      } else {
        const data: ChapterContent = await res.json();
        setLoaded((prev) => [...prev, data]);
      }
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, [book, loaded, loading, done]);

  // 사용자가 끝 sentinel에 다가가면 다음 챕터 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const root = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) fetchNext();
      },
      { root, rootMargin: "600px 0px" }, // 끝에서 600px 전에 미리 로드
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNext]);

  // 현재 화면 가장 위에 보이는 챕터를 추적 → 부모에 알림 (TOC·책갈피용)
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !onActiveChapterChange) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.chapterId;
          if (id) onActiveChapterChange(id);
        }
      },
      { root, threshold: [0.1, 0.5] },
    );
    root.querySelectorAll("[data-chapter-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaded, onActiveChapterChange]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-0 bottom-0 left-0 overflow-y-auto",
        withSidePanel ? "right-0 md:right-[388px]" : "right-0",
      )}
      style={{ background: "var(--bg-reader)", padding: "32px 0 96px" }}
    >
      {loaded.map((ch, i) => (
        <div key={`${ch.bookId}-${ch.chapterId}`} data-chapter-id={ch.chapterId}>
          <ChapterContentView
            chapter={ch}
            fontSize={fontSize}
            langCode={langCode}
            hanjaGloss={hanjaGloss}
            textView={textView}
            isLast={done && i === loaded.length - 1}
          />
        </div>
      ))}

      {/* 끝 sentinel + 로딩 표시 */}
      <div ref={sentinelRef} className="h-2" />
      {loading && (
        <div className="text-center py-8 text-ink-400 text-[12px] font-bold animate-pulse">
          다음 편 불러오는 중…
        </div>
      )}
      {done && loaded.length > 1 && (
        <div className="text-center py-6 text-ink-400 text-[11px] font-bold">
          · 마지막 편 ·
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function ImmersiveBottomBar({
  currentPage,
  totalPages,
  chapterLabel,
  mode,
}: {
  currentPage: number;
  totalPages: number;
  chapterLabel: string;
  mode: ReadMode;
}) {
  const pct = mode === "paginated" ? Math.round((currentPage / Math.max(1, totalPages)) * 100) : 0;
  return (
    <div className="flex-shrink-0 px-4 md:px-6 pt-2 pb-3 relative z-30 pointer-events-none">
      <div
        className="flex items-center gap-3 md:gap-4 px-4 py-2 pointer-events-auto mx-auto"
        style={{
          maxWidth: 720,
          background: "rgba(251,247,236,0.85)",
          backdropFilter: "blur(4px)",
          border: "1px solid var(--clay-100)",
          borderRadius: 999,
        }}
      >
        <div className="text-[11px] text-ink-500 font-bold flex items-center gap-2 min-w-[80px]">
          {mode === "paginated" ? (
            <>
              <span style={{ color: "var(--ink-700)", fontWeight: 800 }}>
                {currentPage} / {totalPages}
              </span>
              <span className="text-ink-400">·</span>
              <span>{pct}%</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-700)", fontWeight: 800 }}>두루마리</span>
          )}
        </div>
        <div
          className="flex-1 relative h-1 rounded-full overflow-hidden"
          style={{ background: "var(--clay-100)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: mode === "paginated" ? `${pct}%` : "0%", background: "var(--book-accent)" }}
          />
        </div>
        <div
          className="flex items-center gap-1.5 text-[11px] text-ink-500 font-bold"
          style={{ minWidth: 80, justifyContent: "flex-end" }}
        >
          <Bookmark size={11} />
          <span className="truncate max-w-[140px]">{chapterLabel || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-black text-ink-400 mb-2 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function SheetOverlay({
  children,
  onClose,
  title,
  tall,
  side = "bottom",
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  tall?: boolean;
  side?: "bottom" | "right";
}) {
  const isRight = side === "right";
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-stretch">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative overflow-hidden flex flex-col bg-parchment-0",
          isRight
            ? "md:absolute md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:rounded-none rounded-t-2xl"
            : "rounded-t-2xl",
          !isRight && (tall ? "h-[85dvh]" : "h-[70dvh]"),
        )}
        style={{ background: "var(--parchment-0)" }}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-parchment-200">
          <span className="text-[14px] font-black text-ink-800">{title}</span>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 p-1">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
