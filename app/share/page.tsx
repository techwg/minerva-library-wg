"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { LibFooter } from "@/components/LibFooter";
import { KoreanSeal, CarvedHanja, CornerBrackets } from "@/components/Decorations";
import { loadBookmarks } from "@/lib/bookmarks";
import { getBook } from "@/data/books";
import { paletteClass } from "@/lib/utils";
import type { SavedBookmark } from "@/lib/types";

type Ratio = "1:1" | "4:5" | "16:9";
type Tone = "vermilion" | "gold";

const RATIO_DIMS: Record<Ratio, { w: number; h: number; label: string }> = {
  "1:1": { w: 1080, h: 1080, label: "1:1 · Instagram feed" },
  "4:5": { w: 1080, h: 1350, label: "4:5 · Instagram Story" },
  "16:9": { w: 1200, h: 630, label: "16:9 · Twitter/OG" },
};

const SAMPLE: { text: string; original: string; source: string; author: string; tone: Tone } = {
  text: "다른 벼슬은 구해도 좋으나, 목민(牧民)의 벼슬은 구하지 말라.",
  original: "他官可求 牧民之官 不可求",
  source: "牧民心書 · 부임 6조",
  author: "정약용 (丁若鏞) · 1818",
  tone: "vermilion",
};

function ShareInner() {
  const sp = useSearchParams();
  const bmId = sp.get("bm");
  const [bookmark, setBookmark] = useState<SavedBookmark | null>(null);
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [tone, setTone] = useState<Tone>("vermilion");

  useEffect(() => {
    if (!bmId) return;
    const bm = loadBookmarks().find((b) => b.id === bmId);
    if (bm) {
      setBookmark(bm);
      const book = getBook(bm.bookId);
      if (book) setTone(book.palette);
    }
  }, [bmId]);

  const content = useMemo(() => {
    if (bookmark) {
      const book = getBook(bookmark.bookId);
      return {
        text: bookmark.selectedText,
        original: bookmark.citedQuote || "",
        source: `${book?.title.original ?? ""} · ${book?.chapters.find((c) => c.id === bookmark.chapterId)?.title ?? ""}`,
        author: book?.author ?? "",
        tone: book?.palette ?? "vermilion",
        seal: book?.title.original.slice(0, 2) ?? "",
        watermark: book?.title.original.charAt(0) ?? "牧",
      };
    }
    return { ...SAMPLE, seal: "牧民", watermark: "牧" };
  }, [bookmark]);

  const dims = RATIO_DIMS[ratio];
  const isVermilion = tone === "vermilion";
  const accentDeep = isVermilion ? "var(--vermilion-700)" : "var(--gold-600)";
  const accent = isVermilion ? "var(--vermilion-500)" : "var(--gold-400)";

  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-5 bg-parchment-0 border-b border-parchment-200">
        <Link
          href={bookmark ? "/my" : "/library"}
          className="flex items-center gap-1.5 text-[13px] font-bold text-ink-600"
        >
          <ChevronLeft size={14} /> 돌아가기
        </Link>
        <span className="text-[14px] font-black text-ink-900">구절 공유 카드</span>
        <span className="w-16" />
      </header>

      <section className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        {/* 미리보기 */}
        <div className="md:col-span-2 flex items-center justify-center">
          <div
            id="share-card"
            className={`relative overflow-hidden ${paletteClass(tone)}`}
            style={{
              width: "100%",
              maxWidth: ratio === "16:9" ? 720 : ratio === "4:5" ? 480 : 540,
              aspectRatio: ratio.replace(":", "/"),
              background: accentDeep,
              color: "var(--parchment-50)",
              borderRadius: 24,
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="absolute top-3 right-3 opacity-60">
              <CarvedHanja glyph={content.watermark} size={ratio === "16:9" ? 200 : 260} color={isVermilion ? "var(--vermilion-100)" : "var(--gold-100)"} opacity={0.12} />
            </div>
            <CornerBrackets inset={20} length={40} color={isVermilion ? "var(--vermilion-100)" : "var(--gold-100)"} opacity={0.4} />

            <div className="relative h-full flex flex-col p-8 md:p-10">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--persimmon-500)" }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: isVermilion ? "var(--vermilion-100)" : "var(--gold-100)" }}
                >
                  미네르바 도서관
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {content.original && (
                  <p
                    className="font-bold mb-3 leading-relaxed"
                    style={{
                      fontSize: ratio === "16:9" ? 14 : 15,
                      color: isVermilion ? "var(--vermilion-100)" : "var(--gold-100)",
                      opacity: 0.85,
                      ...(content.original.match(/[A-Za-z]/) ? { fontStyle: "italic", fontFamily: '"EB Garamond", Georgia, serif' } : {}),
                    }}
                  >
                    {content.original}
                  </p>
                )}
                <div
                  className="font-bold leading-snug"
                  style={{
                    fontSize: ratio === "16:9" ? 26 : ratio === "4:5" ? 30 : 28,
                    color: "var(--parchment-50)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "1.4em",
                      marginRight: 6,
                      verticalAlign: "-0.2em",
                      opacity: 0.7,
                    }}
                  >
                    “
                  </span>
                  {content.text}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <div
                    className="font-black uppercase mb-1"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      color: isVermilion ? "var(--vermilion-100)" : "var(--gold-100)",
                    }}
                  >
                    {content.source}
                  </div>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: 12,
                      color: isVermilion ? "var(--vermilion-100)" : "var(--gold-100)",
                      opacity: 0.8,
                    }}
                  >
                    {content.author}
                  </div>
                </div>
                <KoreanSeal
                  chars={content.seal}
                  size={ratio === "16:9" ? 48 : 60}
                  color={isVermilion ? "var(--vermilion-100)" : "var(--gold-200)"}
                  rotate={-4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 설정 */}
        <aside className="space-y-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-2">비율</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RATIO_DIMS) as Ratio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className="py-2 rounded-xl text-[12px] font-black border transition-colors"
                  style={{
                    background: ratio === r ? "var(--ink-900)" : "var(--parchment-0)",
                    color: ratio === r ? "var(--parchment-50)" : "var(--ink-700)",
                    borderColor: ratio === r ? "var(--ink-900)" : "var(--clay-100)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-ink-400 font-bold mt-1.5">{dims.label} · {dims.w}×{dims.h}</div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-2">톤</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTone("vermilion")}
                className="py-2 rounded-xl text-[12px] font-black"
                style={{
                  background: tone === "vermilion" ? "var(--vermilion-500)" : "var(--parchment-0)",
                  color: tone === "vermilion" ? "#fff" : "var(--ink-700)",
                  border: "1px solid var(--clay-100)",
                }}
              >
                주칠 朱漆
              </button>
              <button
                onClick={() => setTone("gold")}
                className="py-2 rounded-xl text-[12px] font-black"
                style={{
                  background: tone === "gold" ? "var(--gold-400)" : "var(--parchment-0)",
                  color: tone === "gold" ? "#fff" : "var(--ink-700)",
                  border: "1px solid var(--clay-100)",
                }}
              >
                황금
              </button>
            </div>
          </div>

          <button
            disabled
            title="현재 미리보기. PNG 내보내기는 곧 지원돼요."
            className="w-full py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--ink-900)", color: "var(--parchment-50)" }}
          >
            <Download size={14} /> PNG로 저장 (준비 중)
          </button>

          <div className="text-[11px] text-ink-400 font-bold leading-relaxed">
            출처는 공공누리 1유형 / Project Gutenberg 등 PD 라이선스 원전. 공유 시 원전 라이선스를 함께 표시해 주세요.
          </div>
        </aside>
      </section>

      <LibFooter />
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="p-10 text-ink-400">불러오는 중…</div>}>
      <ShareInner />
    </Suspense>
  );
}
