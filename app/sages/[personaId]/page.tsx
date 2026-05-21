import Link from "next/link";
import { notFound } from "next/navigation";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BookSpine } from "@/components/BookSpine";
import { SagePortrait } from "@/components/SagePortrait";
import {
  KoreanSeal,
  CarvedHanja,
  ChapterDivider,
  GridQuote,
} from "@/components/Decorations";
import { getSage } from "@/data/sages";
import { getBooksBySage } from "@/data/books";
import { getSageTeachings } from "@/data/sageTeachings";
import { paletteClass } from "@/lib/utils";

interface Props {
  params: { personaId: string };
}

export default function SageDetailPage({ params }: Props) {
  const sage = getSage(params.personaId);
  if (!sage) notFound();

  const books = getBooksBySage(sage.id);
  const palette = sage.tradition === "eastern" ? "vermilion" : "gold";
  const teachings = getSageTeachings(sage.id);
  const isWestern = sage.tradition === "western";

  return (
    <div className={paletteClass(palette)} style={{ minHeight: "100vh", background: "var(--parchment-50)" }}>
      <LibHeader activeNav="sages" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ── 3컬럼: 180px / 1fr / 320px (모바일은 stack) ── */}
        <div className="grid md:grid-cols-[180px_1fr_320px] gap-8 md:gap-10 mb-12">
          {/* 좌: 초상화 + 인장 + 유파 */}
          <aside className="space-y-4">
            <SagePortrait sage={sage} size={160} />
            <div className="flex flex-col items-center gap-2">
              <KoreanSeal
                chars={sage.hanja.replace(/[a-zA-Zø.\s]/g, "").slice(0, 2) || sage.coverGlyph}
                size={56}
                color="var(--book-accent)"
              />
              <div
                className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-center"
                style={{
                  background: "var(--book-accent-soft)",
                  color: "var(--book-accent-deep)",
                }}
              >
                {isWestern ? "Western Thought" : "동양 사상"}
              </div>
            </div>
          </aside>

          {/* 가운데: 이름 + 약력 + 핵심 가르침 + 명언 */}
          <div>
            <div
              className="text-[11px] font-black uppercase tracking-widest mb-3"
              style={{ color: "var(--book-accent-deep)" }}
            >
              {sage.era} · {sage.region}
            </div>
            <h1 className="text-[48px] font-black text-ink-900 tracking-tight leading-[1.05] mb-1">
              {sage.name.ko}
            </h1>
            <div
              className="text-[20px] text-ink-400 font-extrabold mb-4"
              style={isWestern ? { fontFamily: '"Cardo", "EB Garamond", Georgia, serif', fontStyle: "italic" } : {}}
            >
              {sage.hanja}
            </div>
            <p className="text-[16px] text-ink-600 leading-relaxed max-w-[520px] mb-8">
              {sage.blurb}
            </p>

            {/* 핵심 가르침 2×2 */}
            {teachings && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-1 rounded-full" style={{ background: "var(--book-accent)" }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink-400">
                    핵심 가르침
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {teachings.coreTeachings.map((t) => (
                    <div
                      key={t.label}
                      className="relative p-4 rounded-2xl border overflow-hidden"
                      style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
                    >
                      <div className="flex items-baseline gap-2 mb-2">
                        <span
                          className="font-black text-ink-900"
                          style={{
                            fontSize: 22,
                            ...(isWestern
                              ? { fontFamily: '"Cardo", "EB Garamond", Georgia, serif', fontStyle: "italic" }
                              : {}),
                          }}
                        >
                          {t.glyph}
                        </span>
                        <span className="text-[13px] font-black text-ink-700">{t.label}</span>
                      </div>
                      <p className="text-[12px] text-ink-500 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 가장 유명한 한 줄 */}
                <GridQuote color="var(--book-accent)">
                  <div
                    className="text-[12px] font-bold text-ink-500 mb-2"
                    style={isWestern ? { fontFamily: '"Cardo", "EB Garamond", Georgia, serif', fontStyle: "italic" } : {}}
                  >
                    {teachings.greatQuote.original}
                  </div>
                  <blockquote className="text-[20px] font-black text-ink-900 leading-snug m-0">
                    “{teachings.greatQuote.text}”
                  </blockquote>
                </GridQuote>
              </>
            )}
          </div>

          {/* 우: 미네르바 본 플랫폼 CTA + 저작 목록 */}
          <aside className="space-y-4">
            <div
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{ background: "var(--ink-900)", color: "var(--parchment-50)" }}
            >
              <div className="absolute right-1 top-1 opacity-60">
                <CarvedHanja
                  glyph={sage.coverGlyph}
                  size={140}
                  color={isWestern ? "var(--gold-200)" : "var(--vermilion-100)"}
                  opacity={0.14}
                />
              </div>
              <div className="relative">
                <div
                  className="text-[10px] font-black uppercase tracking-widest mb-2"
                  style={{ color: isWestern ? "var(--gold-200)" : "var(--vermilion-100)" }}
                >
                  미네르바와 대화
                </div>
                <p className="text-[14px] font-bold mb-4 leading-relaxed text-clay-200">
                  {sage.name.ko}와 직접 묻고 답할 수 있어요.
                </p>
                <a
                  href={`https://minerva2.whosgood.org/converse/${sage.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-xl text-[12px] font-black"
                  style={{ background: "var(--persimmon-500)", color: "#fff" }}
                >
                  본 플랫폼에서 만나기 →
                </a>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border"
              style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-3">
                수록 저작 · {books.length}
              </div>
              <div className="space-y-2">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    href={book.status === "available" ? `/books/${book.id}` : "#"}
                    className="flex gap-3 items-center group p-2 -mx-2 rounded-lg hover:bg-parchment-100 transition-colors"
                  >
                    <div style={{ width: 32, flexShrink: 0 }}>
                      <BookSpine book={book} compact />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black text-ink-900 truncate">{book.title.ko}</div>
                      <div className="text-[11px] text-ink-400 truncate">{book.chapters.length}장 · {book.tier === "free" ? "무료" : "프리미엄"}</div>
                    </div>
                    {book.status === "preparing" && (
                      <span className="text-[9px] font-black text-ink-400 bg-parchment-100 px-1.5 py-0.5 rounded-full">
                        준비
                      </span>
                    )}
                  </Link>
                ))}
                {books.length === 0 && (
                  <p className="text-ink-400 text-[12px]">준비 중인 원전이 있습니다.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <ChapterDivider color="var(--clay-300)" />

        {/* ── 생애 연표 ── */}
        {teachings && teachings.timeline.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--book-accent)" }} />
              <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
                생애 연표
              </span>
            </div>
            <div
              className="relative grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(teachings.timeline.length, 6)}, minmax(0, 1fr))`,
              }}
            >
              <div
                className="absolute left-0 right-0 top-3 h-px"
                style={{ background: "var(--book-accent)", opacity: 0.3 }}
              />
              {teachings.timeline.map((ev, i) => (
                <div key={i} className="relative pt-7">
                  <div
                    className="absolute left-0 top-1.5 w-3 h-3 rounded-full"
                    style={{
                      background: "var(--book-accent)",
                      boxShadow: "0 0 0 4px var(--parchment-50)",
                    }}
                  />
                  <div
                    className="text-[11px] font-black mb-1"
                    style={{ color: "var(--book-accent-deep)" }}
                  >
                    {ev.year}
                  </div>
                  <div className="text-[13px] font-black text-ink-900 leading-tight mb-1">{ev.title}</div>
                  {ev.desc && <div className="text-[11px] text-ink-500 font-bold leading-snug">{ev.desc}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {sage.pending && (
          <div className="mt-8 inline-flex px-4 py-2 rounded-full text-[12px] font-black bg-parchment-100 text-ink-500">
            📌 {sage.pending}
          </div>
        )}
      </main>

      <LibFooter />
    </div>
  );
}
