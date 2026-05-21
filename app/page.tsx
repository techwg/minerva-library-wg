import Link from "next/link";
import { Sparkles, BookOpen, Search } from "lucide-react";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BookSpine } from "@/components/BookSpine";
import { CarvedHanja } from "@/components/Decorations";
import { BOOKS } from "@/data/books";
import { SAGES } from "@/data/sages";
import { paletteClass } from "@/lib/utils";

const TODAY_QUOTE = {
  text: "다른 벼슬은 구해도 좋으나, 목민(牧民)의 벼슬은 구하지 말라.",
  original: "他官可求 牧民之官 不可求",
  source: "목민심서 부임",
  palette: "vermilion" as const,
};

export default function HomePage() {
  const featured = BOOKS.filter((b) => b.status === "available");
  const eastern = featured.filter((b) => b.palette === "vermilion");
  const western = featured.filter((b) => b.palette === "gold");

  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <LibHeader activeNav="home" />

      {/* 히어로 */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F26522" }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
            미네르바 패밀리 · 디지털 고전 도서관
          </span>
        </div>
        <h1 className="text-[42px] font-black text-ink-900 tracking-tight leading-tight mb-4">
          현자의 원전을<br />
          <span style={{ color: "#F26522" }}>살아있는 텍스트</span>로 읽다
        </h1>
        <p className="text-[17px] text-ink-500 leading-relaxed max-w-[540px] mb-8">
          7인 현자의 원전을 읽으며, 바로 그 페이지에서 AI 현자에게 질문하세요.
          원전-인지형 AI가 지금 읽는 구절을 바탕으로 풀이·맥락·의미를 답합니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/books/mokminsimseo/read"
            className="px-6 py-3 rounded-xl font-black text-[14px] text-white transition-all hover:-translate-y-0.5"
            style={{ background: "#842F14" }}
          >
            목민심서 읽기 →
          </Link>
          <Link
            href="/books"
            className="px-6 py-3 rounded-xl font-black text-[14px] text-ink-700 border border-parchment-200 hover:bg-parchment-100 transition-all"
          >
            전체 도서 보기
          </Link>
        </div>
      </section>

      {/* 오늘의 구절 */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div
          className="relative px-8 py-6 rounded-2xl border overflow-hidden"
          style={{
            background: "var(--vermilion-50, #fff5f0)",
            borderColor: "var(--vermilion-200, #fcc4a9)",
          }}
        >
          <div
            className="absolute top-4 right-6 text-[80px] font-black opacity-5 leading-none select-none"
            style={{ color: "#842F14" }}
          >
            牧
          </div>
          <div className="text-[11px] font-black uppercase tracking-widest mb-3 text-ink-400">
            오늘의 구절 · {TODAY_QUOTE.source}
          </div>
          <p className="text-[15px] text-ink-400 font-bold mb-2 leading-relaxed italic">
            {TODAY_QUOTE.original}
          </p>
          <p className="text-[19px] font-black text-ink-900 leading-relaxed">
            "{TODAY_QUOTE.text}"
          </p>
          <Link
            href="/books/mokminsimseo/read"
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-black"
            style={{ color: "#842F14" }}
          >
            본문에서 읽기 →
          </Link>
        </div>
      </section>

      {/* 동양 고전 선반 */}
      <BookShelf title="동양 고전" books={eastern} />

      {/* 서양 고전 선반 */}
      <BookShelf title="서양 고전" books={western} />

      {/* 현자 소개 */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <SectionLabel>7인 현자</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SAGES.map((sage) => (
            <Link
              key={sage.id}
              href={`/sages/${sage.id}`}
              className="group flex flex-col gap-2 p-4 rounded-2xl border border-parchment-200 hover:border-parchment-300 hover:bg-parchment-50 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] font-black text-white"
                style={{ background: sage.color }}
              >
                {sage.coverGlyph}
              </div>
              <div>
                <div className="text-[13px] font-black text-ink-900">{sage.name.ko}</div>
                <div className="text-[11px] text-ink-400 font-bold truncate">{sage.era}</div>
              </div>
              {sage.pending && (
                <span className="text-[10px] font-black text-ink-400 bg-parchment-100 px-2 py-0.5 rounded-full w-fit">
                  준비 중
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3-up 하단 카드: 원전-인지형 AI · 패밀리 · 라이선스 ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI 카드 — 검정 배경 + persimmon glow */}
          <div
            className="relative md:col-span-1 rounded-2xl p-6 overflow-hidden"
            style={{
              background: "var(--ink-900)",
              color: "var(--parchment-50)",
              boxShadow: "0 0 0 1px rgba(242,101,34,0.18), 0 12px 32px -12px rgba(242,101,34,0.25)",
            }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-50 pointer-events-none">
              <CarvedHanja glyph="問" size={180} color="var(--persimmon-500)" opacity={0.18} />
            </div>
            <div className="relative">
              <div
                className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest"
                style={{ color: "var(--persimmon-500)" }}
              >
                <Sparkles size={12} /> 원전-인지형 AI
              </div>
              <h3 className="text-[18px] font-black mb-2 leading-tight">
                지금 읽는 구절을<br />그 자리에서 묻고 풀이.
              </h3>
              <p className="text-[12.5px] leading-relaxed text-clay-200 mb-4">
                본문을 드래그하면 AI 현자가 그 구절을 바탕으로 풀이를 시작해요. 일반 챗봇과 다른, 책에 묶인 대화입니다.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-[12px] font-black"
                style={{ color: "var(--persimmon-500)" }}
              >
                3분 안내 보기 →
              </Link>
            </div>
          </div>

          {/* 패밀리 카드 */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
          >
            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--persimmon-500)" }} />
              미네르바 패밀리
            </div>
            <h3 className="text-[18px] font-black text-ink-900 mb-2 leading-tight">
              현자와 일대일로<br />이어지는 본 플랫폼.
            </h3>
            <p className="text-[12.5px] leading-relaxed text-ink-500 mb-4">
              도서관은 “읽기 + 풀이”. 본 플랫폼은 “묻고 답하기”. 둘은 한 뿌리에서 자란 쌍둥이입니다.
            </p>
            <a
              href="https://minerva2.whosgood.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-black"
              style={{ color: "var(--book-accent-deep)" }}
            >
              미네르바 본 플랫폼 →
            </a>
          </div>

          {/* 라이선스 카드 */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
          >
            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-ink-400">
              <BookOpen size={11} /> 모두 PD · 공공누리
            </div>
            <h3 className="text-[18px] font-black text-ink-900 mb-2 leading-tight">
              원전은 모두<br />열린 라이선스만.
            </h3>
            <p className="text-[12.5px] leading-relaxed text-ink-500 mb-4">
              한국고전번역원 ITKC · Project Gutenberg · CCEL · ctext 등 PD 또는 CC-BY 만 수록. 출처는 본문마다 표기됩니다.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-black text-ink-600"
            >
              자세히 →
            </Link>
          </div>
        </div>

        {/* 검색·내 서재 빠른 진입 */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-black text-ink-700"
            style={{ background: "var(--parchment-0)", border: "1px solid var(--clay-100)" }}
          >
            <Search size={13} /> 본문·현자 검색
          </Link>
          <Link
            href="/my"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-black text-ink-700"
            style={{ background: "var(--parchment-0)", border: "1px solid var(--clay-100)" }}
          >
            📖 내 서재
          </Link>
        </div>
      </section>

      <LibFooter />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-1 rounded-full" style={{ background: "#F26522" }} />
      <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
        {children}
      </span>
    </div>
  );
}

function BookShelf({ title, books }: { title: string; books: typeof BOOKS }) {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-12">
      <SectionLabel>{title}</SectionLabel>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`} className="flex-shrink-0 group">
            <BookSpine book={book} />
          </Link>
        ))}
      </div>
    </section>
  );
}
