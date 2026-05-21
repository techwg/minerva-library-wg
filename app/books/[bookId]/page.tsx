"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, BookMarked } from "lucide-react";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BookSpine } from "@/components/BookSpine";
import { SagePortrait } from "@/components/SagePortrait";
import { KoreanSeal, ChapterDivider, CarvedHanja } from "@/components/Decorations";
import { getBook } from "@/data/books";
import { getSage } from "@/data/sages";
import { getBookmarksByBook } from "@/lib/bookmarks";
import { paletteClass } from "@/lib/utils";
import type { SavedBookmark } from "@/lib/types";

interface Props {
  params: { bookId: string };
}

export default function BookCoverPage({ params }: Props) {
  const book = getBook(params.bookId);
  if (!book) notFound();

  const sage = getSage(book.personaId);
  const palette = book.palette;
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);

  useEffect(() => { setBookmarks(getBookmarksByBook(book.id)); }, [book.id]);

  const lastBm = bookmarks[0];
  const progressPct = bookmarks.length
    ? Math.min(95, Math.round((bookmarks.length / book.chapters.length) * 100))
    : 0;
  const lastChapter = lastBm
    ? book.chapters.find((c) => c.id === lastBm.chapterId)
    : undefined;

  return (
    <div className={paletteClass(palette)} style={{ minHeight: "100vh", background: "var(--parchment-50)" }}>
      <LibHeader activeNav="books" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ── 책 헤더 (Desktop: 좌 360px + 우 1fr) ── */}
        <div className="grid md:grid-cols-[360px_1fr] gap-10 md:gap-14 mb-12">
          {/* 좌: 책 표지 + 저자 카드 */}
          <div className="space-y-5">
            <BookSpine book={book} height={420} />
            {sage && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
              >
                <SagePortrait sage={sage} size={48} />
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-ink-400 uppercase tracking-wider mb-0.5">
                    이 책의 저자
                  </div>
                  <div className="text-[14px] font-black text-ink-900 truncate">{sage.name.ko}</div>
                  <Link
                    href={`/sages/${sage.id}`}
                    className="text-[11px] font-black"
                    style={{ color: "var(--book-accent-deep)" }}
                  >
                    현자 더 알아보기 →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 우: 책 정보 + CTA + 진행률 + 소개 */}
          <div>
            <div
              className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--book-accent-deep)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--book-accent)" }} />
              {palette === "vermilion" ? "동양 고전" : "서양 고전"}
            </div>
            <h1 className="text-[40px] font-black text-ink-900 tracking-tight leading-[1.05] mb-1">
              {book.title.ko}
            </h1>
            <div className="text-[22px] text-ink-400 font-bold mb-1">{book.title.original}</div>
            {book.title.en && (
              <div className="text-[13px] text-ink-400 italic mb-4" style={{ fontFamily: '"EB Garamond", Georgia, serif' }}>
                {book.title.en}
              </div>
            )}

            {/* Pill 메타 */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Pill>{book.author}</Pill>
              <Pill>{book.era}</Pill>
              <Pill>{book.hasTranslation ? "원문 + 국역" : "원문"}</Pill>
              <Pill>{book.tier === "free" ? "무료" : "프리미엄"}</Pill>
            </div>

            {book.subtitle && (
              <p className="text-[16px] text-ink-600 leading-relaxed max-w-[520px] mb-6">
                {book.subtitle}
              </p>
            )}

            {/* 두 CTA */}
            {book.status === "available" ? (
              <div className="space-y-3 mb-5">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/books/${book.id}/read`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[14px] text-white transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--book-accent)", boxShadow: "0 10px 24px -8px rgba(132,47,20,0.45)" }}
                  >
                    <BookOpen size={15} /> 처음부터 읽기
                  </Link>
                  {lastBm && (
                    <Link
                      href={`/books/${book.id}/read?ch=${lastBm.chapterId}`}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[14px] text-ink-700 transition-all hover:-translate-y-0.5"
                      style={{ background: "var(--parchment-0)", border: "1px solid var(--clay-100)" }}
                    >
                      <BookMarked size={15} /> 이어 읽기
                    </Link>
                  )}
                </div>
                {bookmarks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-ink-500 mb-1.5">
                      <span>
                        {lastChapter?.title ?? "처음부터"}
                        {bookmarks.length > 0 && ` · 책갈피 ${bookmarks.length}개`}
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: "var(--clay-100)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progressPct}%`, background: "var(--book-accent)" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[14px] opacity-70 cursor-not-allowed mb-5"
                style={{ background: "var(--parchment-200)", color: "var(--ink-500)" }}
              >
                준비 중 — 곧 공개됩니다
              </div>
            )}
          </div>
        </div>

        {/* ── 목차 (dot-leader 스타일, 첫 6개 미리보기 + 전체) ── */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-[16px] font-black text-ink-800">목차</h2>
            <span className="text-[11px] text-ink-400 font-bold">총 {book.chapters.length}장</span>
          </div>
          <div
            className="rounded-2xl p-4 md:p-6 relative overflow-hidden"
            style={{ background: "var(--parchment-0)", border: "1px solid var(--clay-100)" }}
          >
            <div className="absolute -right-6 -bottom-6 opacity-50 pointer-events-none">
              <CarvedHanja glyph={book.coverGlyph} size={200} opacity={0.06} />
            </div>
            <ul className="relative space-y-1">
              {book.chapters.map((ch, i) => (
                <li key={ch.id}>
                  <Link
                    href={book.status === "available" ? `/books/${book.id}/read?ch=${ch.id}` : "#"}
                    className="flex items-baseline gap-2 py-2.5 px-2 -mx-2 rounded-lg hover:bg-parchment-100 transition-colors group"
                  >
                    <span
                      className="text-[11px] font-black flex-shrink-0 w-[64px]"
                      style={{ color: "var(--book-accent)" }}
                    >
                      {ch.number}
                    </span>
                    <span className="text-[14px] font-bold text-ink-800 group-hover:text-ink-900 transition-colors">
                      {ch.title}
                    </span>
                    <span
                      className="flex-1 mx-2 mb-[6px] border-b border-dotted"
                      style={{ borderColor: "var(--clay-200)" }}
                    />
                    {ch.count && (
                      <span className="text-[10px] font-bold text-ink-400">{ch.count}조</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ChapterDivider color="var(--clay-300)" />

        {/* ── 출처 크레딧 ── */}
        <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl" style={{ background: "var(--parchment-100)" }}>
          <KoreanSeal chars={book.title.original.slice(0, 2)} size={40} color="var(--book-accent)" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1">출처 · 라이선스</div>
            <div className="text-[12px] text-ink-700 font-bold leading-relaxed">
              {book.source}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">{book.license} · 인쇄·다운로드 불가</div>
          </div>
        </div>
      </main>

      <LibFooter />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{
        background: "var(--book-accent-soft)",
        color: "var(--book-accent-deep)",
        border: "1px solid var(--book-accent-soft)",
      }}
    >
      {children}
    </span>
  );
}
