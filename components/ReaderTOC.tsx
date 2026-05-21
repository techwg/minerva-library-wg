"use client";

import { Bookmark, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Book, BookChapter, SavedBookmark } from "@/lib/types";

type FontSize = 16 | 19 | 22 | 26;
type Columns = 1 | 2;

interface ReaderTOCProps {
  book: Book;
  activeChapterId: string;
  onChapterSelect: (id: string) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  columns: Columns;
  onColumnsChange: (cols: Columns) => void;
  bookmarks: SavedBookmark[];
  onBookmarkClick: (bm: SavedBookmark) => void;
}

const FONT_SIZES: FontSize[] = [16, 19, 22, 26];

export function ReaderTOC({
  book,
  activeChapterId,
  onChapterSelect,
  fontSize,
  onFontSizeChange,
  columns,
  onColumnsChange,
  bookmarks,
  onBookmarkClick,
}: ReaderTOCProps) {
  const bookmarksByChapter = bookmarks.reduce<Record<string, SavedBookmark[]>>((acc, bm) => {
    if (!acc[bm.chapterId]) acc[bm.chapterId] = [];
    acc[bm.chapterId].push(bm);
    return acc;
  }, {});

  return (
    <aside className="flex flex-col h-full bg-parchment-0 border-r border-parchment-200 overflow-y-auto">
      {/* 책 정보 */}
      <div className="px-5 pt-5 pb-3 border-b border-parchment-200">
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-1"
          style={{ color: "var(--book-accent)" }}
        >
          {book.palette === "vermilion" ? "동양 고전" : "서양 고전"} · {book.license.split(" ")[0]}
        </div>
        <div className="text-[15px] font-black text-ink-900 leading-tight">{book.title.ko}</div>
        <div className="text-[12px] text-ink-500 mt-0.5">{book.author}</div>
      </div>

      {/* 목차 */}
      <nav className="flex-1 px-3 py-3 space-y-0.5" aria-label="목차">
        {book.chapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          const bmCount = bookmarksByChapter[ch.id]?.length ?? 0;

          return (
            <button
              key={ch.id}
              onClick={() => onChapterSelect(ch.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 group",
                isActive
                  ? "bg-parchment-100 font-black text-ink-900"
                  : "text-ink-600 hover:bg-parchment-100 hover:text-ink-800"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* 활성 인디케이터 */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--book-accent)" }}
                  />
                )}
                <div className="min-w-0">
                  <div className={cn("text-[11px] font-black opacity-60 leading-none mb-0.5", isActive && "opacity-100")}>
                    {ch.number}
                  </div>
                  <div className="text-[12.5px] font-bold leading-snug truncate">{ch.title}</div>
                </div>
              </div>

              {/* 책갈피 카운트 배지 */}
              {bmCount > 0 && (
                <span
                  className="flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "var(--book-accent-soft)",
                    color: "var(--book-accent-deep)",
                  }}
                >
                  🔖 {bmCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 내 책갈피 */}
      {bookmarks.length > 0 && (
        <div className="px-4 py-3 border-t border-parchment-200">
          <div className="flex items-center gap-1.5 mb-2">
            <Bookmark size={12} style={{ color: "var(--book-accent)" }} />
            <span className="text-[11px] font-black text-ink-700">
              내 책갈피 · {bookmarks.length}개
            </span>
          </div>
          <div className="space-y-1.5">
            {bookmarks.slice(0, 3).map((bm) => (
              <button
                key={bm.id}
                onClick={() => onBookmarkClick(bm)}
                className="w-full text-left px-2 py-1.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 transition-colors"
              >
                <div className="text-[10px] font-black text-ink-500 mb-0.5">
                  {book.chapters.find((c) => c.id === bm.chapterId)?.title ?? bm.chapterId}
                </div>
                <div className="text-[11px] text-ink-700 truncate leading-snug">
                  {bm.aiResponseMd.slice(0, 40)}…
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 읽기 설정 */}
      <div className="px-4 py-3 border-t border-parchment-200">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Settings2 size={12} className="text-ink-400" />
          <span className="text-[11px] font-black text-ink-600">읽기 설정</span>
        </div>

        {/* 글자 크기 */}
        <div className="mb-3">
          <div className="text-[10px] font-black text-ink-400 mb-1.5 uppercase tracking-wider">글자 크기</div>
          <div className="flex gap-1">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => onFontSizeChange(size)}
                className={cn(
                  "flex-1 py-1 rounded-lg text-[11px] font-black transition-all",
                  fontSize === size
                    ? "text-white"
                    : "text-ink-500 bg-parchment-100 hover:bg-parchment-200"
                )}
                style={fontSize === size ? { background: "var(--book-accent)" } : {}}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 2단 토글 */}
        {book.hasTranslation && (
          <div>
            <div className="text-[10px] font-black text-ink-400 mb-1.5 uppercase tracking-wider">본문 보기</div>
            <div className="flex gap-1">
              {(
                [
                  { value: 1, label: "국역만" },
                  { value: 2, label: "원전+국역" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onColumnsChange(value)}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[11px] font-bold transition-all",
                    columns === value ? "text-white" : "text-ink-500 bg-parchment-100 hover:bg-parchment-200"
                  )}
                  style={columns === value ? { background: "var(--book-accent)" } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
