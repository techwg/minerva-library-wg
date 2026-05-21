"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BookSpine } from "@/components/BookSpine";
import { KoreanSeal, CarvedHanja, ChapterDivider } from "@/components/Decorations";
import { loadBookmarks } from "@/lib/bookmarks";
import { getBook, BOOKS } from "@/data/books";
import { SAGES } from "@/data/sages";
import { paletteClass } from "@/lib/utils";
import { Bookmark, Clock, Flame, Share2 } from "lucide-react";
import type { SavedBookmark } from "@/lib/types";

const MODE_KEY = "minerva_library_read_mode";

export default function MyLibraryPage() {
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [tab, setTab] = useState<"continue" | "bookmarks" | "highlights" | "notes" | "stats">("continue");

  useEffect(() => { setBookmarks(loadBookmarks()); }, []);

  // 책별 책갈피 개수 (이어 읽기 카드용)
  const bookProgress = BOOKS.filter((b) => b.status === "available").slice(0, 3).map((b) => {
    const bms = bookmarks.filter((bm) => bm.bookId === b.id);
    const lastBm = bms[0];
    const chapterCount = b.chapters.length;
    const progressPct = bms.length ? Math.min(95, Math.round((bms.length / chapterCount) * 100)) : 0;
    return { book: b, bookmarkCount: bms.length, progressPct, lastBm };
  });

  // 가장 많이 묻는 현자 — bookmarks 의 aiPersonaId 집계
  const personaCount: Record<string, number> = {};
  bookmarks.forEach((b) => { personaCount[b.aiPersonaId] = (personaCount[b.aiPersonaId] ?? 0) + 1; });
  const topSageId = Object.entries(personaCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topSage = topSageId ? SAGES.find((s) => s.id === topSageId) : SAGES[4];

  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <LibHeader />

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--persimmon-500)" }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">내 서재</span>
        </div>
        <h1 className="text-[36px] font-black text-ink-900 tracking-tight leading-tight mb-2">
          오늘은 어디부터<br />이어 읽을까요?
        </h1>
        <p className="text-[14px] text-ink-500 font-bold">
          책갈피 {bookmarks.length}개 · 펼친 책 {Object.keys(bookmarks.reduce((acc, b) => ({ ...acc, [b.bookId]: 1 }), {})).length}권
        </p>
      </section>

      {/* 탭 */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 border-b border-parchment-200">
          {([
            ["continue", "이어 읽기"],
            ["bookmarks", `책갈피 (${bookmarks.length})`],
            ["highlights", "하이라이트"],
            ["notes", "메모"],
            ["stats", "통계"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="px-4 py-3 text-[13px] font-black transition-colors"
              style={{
                color: tab === k ? "var(--ink-900)" : "var(--ink-400)",
                borderBottom: tab === k ? "2px solid var(--persimmon-500)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 이어 읽기 3-up */}
      {tab === "continue" && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookProgress.map(({ book, bookmarkCount, progressPct, lastBm }) => {
              const lastChapter = lastBm
                ? book.chapters.find((c) => c.id === lastBm.chapterId)
                : book.chapters[0];
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}/read${lastBm ? `?ch=${lastBm.chapterId}` : ""}`}
                  className={`group rounded-2xl p-5 border transition-all hover:-translate-y-0.5 ${paletteClass(book.palette)}`}
                  style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div style={{ width: 48 }}>
                      <BookSpine book={book} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black text-ink-900 truncate">{book.title.ko}</div>
                      <div className="text-[11px] text-ink-500 font-bold truncate">{book.author}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-400 font-bold mb-1.5 uppercase tracking-wider">
                    {lastChapter?.title ?? "처음부터"}
                  </div>
                  <div className="h-1 rounded-full mb-2" style={{ background: "var(--clay-100)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progressPct}%`, background: "var(--book-accent)" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-ink-400">{progressPct}% · 책갈피 {bookmarkCount}개</span>
                    <span style={{ color: "var(--book-accent)" }}>이어 읽기 →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 책갈피 리스트 */}
      {tab === "bookmarks" && (
        <section className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-3">
            {bookmarks.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center border-2 border-dashed"
                style={{ borderColor: "var(--clay-100)" }}
              >
                <Bookmark size={32} className="mx-auto mb-3 text-ink-300" />
                <p className="text-[14px] font-bold text-ink-500 mb-1">아직 책갈피가 없어요</p>
                <p className="text-[12px] text-ink-400">
                  본문을 읽다 마음에 드는 구절을 드래그해서 저장해 보세요.
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => {
                const book = getBook(bm.bookId);
                if (!book) return null;
                return (
                  <Link
                    key={bm.id}
                    href={`/books/${bm.bookId}/read?ch=${bm.chapterId}`}
                    className={`block p-5 rounded-2xl border transition-all hover:-translate-y-0.5 ${paletteClass(book.palette)}`}
                    style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
                  >
                    <div className="flex items-start gap-4">
                      <KoreanSeal chars={book.title.original.slice(0, 2)} size={44} color="var(--book-accent)" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-ink-400 uppercase tracking-wider mb-1">
                          {book.title.ko} · {book.chapters.find((c) => c.id === bm.chapterId)?.title}
                        </div>
                        <blockquote
                          className="text-[15px] text-ink-800 font-bold leading-relaxed"
                          style={{ borderLeft: "3px solid var(--book-accent)", paddingLeft: 14 }}
                        >
                          "{bm.selectedText}"
                        </blockquote>
                        {bm.aiResponseMd && (
                          <div
                            className="mt-2 text-[12px] text-ink-500 font-bold flex items-center gap-1"
                          >
                            <span style={{ color: "var(--book-accent)" }}>●</span>
                            AI 풀이 묶임
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/share?bm=${bm.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-ink-400 hover:text-ink-700"
                      >
                        <Share2 size={14} />
                      </Link>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Sidebar — 통계 */}
          <aside className="space-y-4">
            <div
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{ background: "var(--ink-900)", color: "var(--parchment-50)" }}
            >
              <div className="absolute right-1 top-1 opacity-50">
                <CarvedHanja glyph="讀" size={140} color="var(--gold-300)" opacity={0.12} />
              </div>
              <div className="relative">
                <div
                  className="text-[10px] font-black uppercase tracking-widest mb-2"
                  style={{ color: "var(--gold-200)" }}
                >
                  이번 달 읽기
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-[40px] font-black tracking-tight">
                    {Math.max(1, Math.floor(bookmarks.length / 2))}
                  </span>
                  <span className="text-[14px] font-bold text-clay-200">시간 남짓</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-clay-200">
                  <Clock size={11} /> 책갈피 {bookmarks.length}개 기록
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border"
              style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
            >
              <div
                className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-3 flex items-center gap-1.5"
              >
                <Flame size={11} /> 5일 streak
              </div>
              <div className="flex gap-1">
                {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded"
                      style={{
                        height: i < 5 ? 32 : 16,
                        background: i < 5 ? "var(--vermilion-500)" : "var(--clay-100)",
                      }}
                    />
                    <span className="text-[10px] font-bold text-ink-400">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {topSage && (
              <div
                className="rounded-2xl p-4 border"
                style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-3">
                  가장 많이 묻는 현자
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center text-white font-black text-[18px]"
                    style={{ background: topSage.color }}
                  >
                    {topSage.coverGlyph}
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-ink-900">{topSage.name.ko}</div>
                    <div className="text-[11px] text-ink-500 font-bold">{personaCount[topSageId!] ?? 0}회 풀이</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>
      )}

      {(tab === "highlights" || tab === "notes" || tab === "stats") && (
        <section className="max-w-5xl mx-auto px-6 py-12 text-center text-ink-400">
          <ChapterDivider color="var(--clay-300)" />
          <p className="text-[13px] font-bold mt-4">곧 만나요. 책갈피와 함께 자라는 기능이에요.</p>
        </section>
      )}

      <LibFooter />
    </div>
  );
}
