"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibHeaderProps {
  activeNav?: "home" | "books" | "sages" | "my" | "about";
}

export function LibHeader({ activeNav }: LibHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-8 bg-parchment-0 border-b border-parchment-200 header-scrolled">
      {/* 워드마크 — 홈으로 */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-black text-ink-900 tracking-[-0.02em]">
            미네르바 도서관
          </span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--persimmon-500)" }}
            aria-hidden
          />
        </div>
      </Link>

      {/* 네비게이션 */}
      <div className="hidden md:flex items-center gap-7">
        <nav className="flex items-center gap-6 text-[14px] font-bold text-ink-600">
          {[
            { href: "/books", label: "도서", key: "books" },
            { href: "/sages", label: "현자", key: "sages" },
            { href: "/my", label: "내 서재", key: "my" },
            { href: "/about", label: "소개", key: "about" },
          ].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "py-1 hover:text-ink-900 transition-colors",
                activeNav === item.key || pathname.startsWith(item.href)
                  ? "text-ink-900 border-b-2"
                  : ""
              )}
              style={
                activeNav === item.key || pathname.startsWith(item.href)
                  ? { borderColor: "var(--book-accent)" }
                  : {}
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/search"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-parchment-100 border border-parchment-200 text-ink-500 hover:text-ink-900 hover:bg-parchment-200 text-[13px] min-w-[180px] transition-colors"
        >
          <Search size={14} />
          <span>검색</span>
          <span className="ml-auto text-[11px] font-black tracking-widest text-ink-400">⌘K</span>
        </Link>
      </div>
    </header>
  );
}
