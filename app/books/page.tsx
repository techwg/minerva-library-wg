"use client";

import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BookSpine } from "@/components/BookSpine";
import { BOOKS } from "@/data/books";
import { SAGES } from "@/data/sages";
import { paletteClass } from "@/lib/utils";
import type { Book, Sage } from "@/lib/types";

type TraditionFilter = "all" | "eastern" | "western";
type StatusFilter = "all" | "available" | "preparing";
type PersonaFilter = "all" | string;

const PERSONA_NAMES: Record<string, string> = {
  all: "전체",
  aristotle: "아리스토텔레스",
  augustine: "아우구스티누스",
  bentham: "벤담",
  choejeu: "최제우",
  confucius: "공자",
  dasan: "다산 정약용",
  gandhi: "간디",
  hobbes: "홉스",
  hume: "흄",
  kant: "칸트",
  locke: "로크",
  marx: "마르크스",
  mill: "밀",
  nietzsche: "니체",
  rousseau: "루소",
  socrates: "소크라테스",
  stoic: "마르쿠스 아우렐리우스",
};

function BooksPageInner() {
  const searchParams = useSearchParams();
  const initialPersona = searchParams.get("persona") ?? "all";

  const [tradition, setTradition] = useState<TraditionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [persona, setPersona] = useState<PersonaFilter>(initialPersona);

  // BOOKS에 실제로 존재하는 personaId만 추출 (등장 순서 유지)
  const availablePersonas = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const b of BOOKS) {
      if (!seen.has(b.personaId)) {
        seen.add(b.personaId);
        result.push(b.personaId);
      }
    }
    return result;
  }, []);

  const personaOptions = useMemo(() => [
    { id: "all", label: "전체" },
    ...availablePersonas.map((id) => ({
      id,
      label: PERSONA_NAMES[id] ?? id,
    })),
  ], [availablePersonas]);

  const filtered = useMemo(() => {
    return BOOKS.filter((b) => {
      if (tradition === "eastern" && b.palette !== "vermilion") return false;
      if (tradition === "western" && b.palette !== "gold") return false;
      if (status !== "all" && b.status !== status) return false;
      if (persona !== "all" && b.personaId !== persona) return false;
      return true;
    });
  }, [tradition, status, persona]);

  const availableCount = BOOKS.filter((b) => b.status === "available").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <LibHeader activeNav="books" />


      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--persimmon-500)" }} />
            <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
              전체 원전 도서관
            </span>
          </div>
          <h1 className="text-[32px] font-black text-ink-900 tracking-tight">
            {availableCount}권의 원전 수록 중
          </h1>
          <p className="text-[15px] text-ink-500 mt-2">
            PD · 공공누리 원전만 수록합니다. 모든 책은 무료로 읽을 수 있어요.
          </p>
        </div>

        {/* ── 필터 chips ── */}
        <div className="mb-8 space-y-3">
          <FilterRow
            label="전통"
            options={[
              { id: "all", label: "전체" },
              { id: "eastern", label: "동양" },
              { id: "western", label: "서양" },
            ] as { id: TraditionFilter; label: string }[]}
            value={tradition}
            onChange={(v) => setTradition(v as TraditionFilter)}
          />
          <FilterRow
            label="상태"
            options={[
              { id: "all", label: "전체" },
              { id: "available", label: "읽을 수 있음" },
              { id: "preparing", label: "준비 중" },
            ] as { id: StatusFilter; label: string }[]}
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
          />
          <FilterRow
            label="현자"
            options={personaOptions}
            value={persona}
            onChange={(v) => setPersona(v)}
            wrap
          />
        </div>

        {/* 결과 카운트 */}
        <div className="mb-5 text-[12px] text-ink-400 font-bold">
          {filtered.length}권 표시 중
        </div>

        {/* 그리드 */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-ink-400 text-[14px] font-bold">
            조건에 맞는 책이 없어요. 필터를 조정해 보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((book) => {
              const sage = SAGES.find((s) => s.id === book.personaId);
              const isPreparing = book.status === "preparing";
              const card = (
                <div
                  className={`flex gap-4 p-4 rounded-2xl border transition-all ${paletteClass(book.palette)} ${
                    isPreparing ? "cursor-not-allowed" : "hover:-translate-y-0.5"
                  }`}
                  style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
                >
                  <BookSpine book={book} compact />
                  <BookCardInner book={book} sage={sage} isPreparing={isPreparing} />
                </div>
              );
              return (
                <div key={book.id} className={isPreparing ? "opacity-70" : ""}>
                  {isPreparing ? card : (
                    <Link href={`/books/${book.id}`} className="block group">
                      {card}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <LibFooter />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense>
      <BooksPageInner />
    </Suspense>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
  wrap = false,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  wrap?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${wrap ? "items-start" : "items-center"}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-ink-400 w-12 flex-shrink-0 pt-1.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="px-3 py-1.5 rounded-full text-[12px] font-black transition-colors"
            style={{
              background: value === o.id ? "var(--ink-900)" : "var(--parchment-100)",
              color: value === o.id ? "var(--parchment-50)" : "var(--ink-600)",
              border: "1px solid var(--clay-100)",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookCardInner({
  book,
  sage,
  isPreparing = false,
}: {
  book: Book;
  sage?: Sage;
  isPreparing?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-black text-ink-400 mb-1 flex items-center gap-1.5">
        {sage?.name.ko}
        {isPreparing && (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-parchment-100 text-ink-400">
            준비 중
          </span>
        )}
      </div>
      <div className="text-[15px] font-black text-ink-900 leading-tight mb-1">{book.title.ko}</div>
      <div className="text-[11px] text-ink-500 italic mb-2">{book.title.original}</div>
      <div className="text-[11px] text-ink-400">{book.era}</div>
      <div className="mt-2 text-[10px] text-ink-300 font-bold">{book.source.split("·")[0].trim()}</div>
    </div>
  );
}
