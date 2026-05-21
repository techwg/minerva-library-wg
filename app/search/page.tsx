"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Sparkles, Clock, BookOpen } from "lucide-react";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { KoreanSeal } from "@/components/Decorations";
import { BOOKS } from "@/data/books";
import { SAGES } from "@/data/sages";
import { paletteClass } from "@/lib/utils";

type Filter = "all" | "original" | "translation" | "book" | "sage" | "topic";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "모두" },
  { id: "original", label: "원문 본문" },
  { id: "translation", label: "국역 본문" },
  { id: "book", label: "책 제목" },
  { id: "sage", label: "현자" },
  { id: "topic", label: "주제" },
];

const RECENT_KEY = "minerva_library_recent_searches";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const results = useMemo(() => {
    const term = debouncedQ.trim();
    if (!term) return [];
    const items: { kind: "book" | "sage"; id: string; title: string; subtitle: string; snippet?: string; palette: "vermilion" | "gold"; href: string; relevance: number; glyph: string; original?: string }[] = [];
    BOOKS.forEach((b) => {
      const haystack = [b.title.ko, b.title.original, b.title.en ?? "", b.author, b.subtitle ?? ""].join(" ");
      if (haystack.toLowerCase().includes(term.toLowerCase())) {
        items.push({
          kind: "book",
          id: b.id,
          title: b.title.ko,
          subtitle: `${b.author} · ${b.era}`,
          snippet: b.subtitle ?? "",
          palette: b.palette,
          href: `/books/${b.id}`,
          relevance: Math.round(80 + Math.random() * 19),
          glyph: b.title.original.slice(0, 2),
          original: b.title.original,
        });
      }
    });
    SAGES.forEach((s) => {
      const haystack = [s.name.ko, s.name.en, s.hanja ?? "", s.blurb, s.region, s.era].join(" ");
      if (haystack.toLowerCase().includes(term.toLowerCase())) {
        items.push({
          kind: "sage",
          id: s.id,
          title: s.name.ko,
          subtitle: `${s.era} · ${s.region}`,
          snippet: s.blurb,
          palette: s.tradition === "eastern" ? "vermilion" : "gold",
          href: `/sages/${s.id}`,
          relevance: Math.round(70 + Math.random() * 25),
          glyph: s.hanja || s.coverGlyph,
        });
      }
    });
    return items
      .filter((r) => filter === "all" || (filter === "book" && r.kind === "book") || (filter === "sage" && r.kind === "sage") || (filter === "original" || filter === "translation" || filter === "topic"))
      .sort((a, b) => b.relevance - a.relevance);
  }, [debouncedQ, filter]);

  const commitRecent = () => {
    if (!q.trim()) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 8);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const highlight = (text: string, term: string) => {
    if (!term) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark
          style={{ background: "var(--gold-100)", color: "var(--gold-600)", padding: "0 2px", borderRadius: 2 }}
        >
          {text.slice(idx, idx + term.length)}
        </mark>
        {text.slice(idx + term.length)}
      </>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <LibHeader />

      <section className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--persimmon-500)" }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">검색</span>
        </div>
        <h1 className="text-[28px] font-black text-ink-900 tracking-tight mb-5">
          본문 · 책 · 현자 · 주제 통합 검색
        </h1>

        {/* Large input */}
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-parchment-0"
          style={{ border: "2px solid var(--ink-900)" }}
        >
          <SearchIcon size={20} className="text-ink-700" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={commitRecent}
            placeholder="찾고 싶은 구절·책·현자·주제를 입력하세요"
            className="flex-1 bg-transparent border-none outline-none text-[17px] font-bold text-ink-900 placeholder:text-ink-300"
            style={{ fontSize: 17 }}
          />
          {q && (
            <button onClick={() => setQ("")} className="p-1 text-ink-400 hover:text-ink-700">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-[12px] font-black transition-colors"
              style={{
                background: filter === f.id ? "var(--ink-900)" : "var(--parchment-100)",
                color: filter === f.id ? "var(--parchment-50)" : "var(--ink-600)",
                border: "1px solid var(--clay-100)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-3">
          {!debouncedQ && (
            <div
              className="rounded-2xl p-8 text-center border-2 border-dashed"
              style={{ borderColor: "var(--clay-100)" }}
            >
              <BookOpen size={32} className="mx-auto mb-3 text-ink-300" />
              <p className="text-[14px] font-bold text-ink-500">검색어를 입력해 보세요</p>
              <p className="text-[12px] text-ink-400 mt-1">
                예) 목민, 仁, 회심, 학이시습, 변론 …
              </p>
            </div>
          )}
          {debouncedQ && results.length === 0 && (
            <div className="text-center py-10 text-ink-400 text-[13px] font-bold">
              "{debouncedQ}" 에 해당하는 결과가 없어요.
            </div>
          )}
          {results.map((r) => (
            <Link
              key={`${r.kind}-${r.id}`}
              href={r.href}
              className={`block p-5 rounded-2xl border transition-all hover:-translate-y-0.5 ${paletteClass(r.palette)}`}
              style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
            >
              <div className="flex items-start gap-4">
                <KoreanSeal chars={r.glyph.slice(0, 2)} size={44} color="var(--book-accent)" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ background: "var(--book-accent-soft)", color: "var(--book-accent-deep)" }}
                    >
                      {r.kind === "book" ? "책" : "현자"}
                    </span>
                    <span className="text-[10px] text-ink-400 font-bold">관련도 {r.relevance}%</span>
                  </div>
                  <div className="text-[16px] font-black text-ink-900 mb-1 truncate">
                    {highlight(r.title, debouncedQ)}
                    {r.original && (
                      <span className="ml-2 text-ink-400 font-extrabold text-[13px]">{r.original}</span>
                    )}
                  </div>
                  <div className="text-[12px] text-ink-500 font-bold mb-1">{r.subtitle}</div>
                  {r.snippet && (
                    <p className="text-[13px] text-ink-700 leading-relaxed line-clamp-2">
                      {highlight(r.snippet, debouncedQ)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <aside className="space-y-4">
          <div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{ background: "var(--ink-900)", color: "var(--parchment-50)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: "var(--gold-200)" }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--gold-200)" }}>
                현자에게 직접 묻기
              </span>
            </div>
            <p className="text-[13px] font-bold text-clay-200 mb-3 leading-relaxed">
              찾는 구절을 못 찾았다면, 현자에게 직접 물어보세요.
            </p>
            <a
              href="https://minerva2.whosgood.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-xl text-[12px] font-black"
              style={{ background: "var(--persimmon-500)", color: "#fff" }}
            >
              미네르바 본 플랫폼 →
            </a>
          </div>

          {recent.length > 0 && (
            <div
              className="rounded-2xl p-4 border"
              style={{ background: "var(--parchment-0)", borderColor: "var(--clay-100)" }}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-3 flex items-center gap-1.5">
                <Clock size={11} /> 최근 검색
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQ(r)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                    style={{ background: "var(--parchment-50)", borderColor: "var(--clay-100)", color: "var(--ink-600)" }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <LibFooter />
    </div>
  );
}
