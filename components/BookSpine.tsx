import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BookSpineProps {
  book: Pick<Book, "title" | "palette" | "coverGlyph" | "author">;
  height?: number;
  compact?: boolean;
  className?: string;
}

const PALETTE_STYLES = {
  vermilion: {
    bg:     "#842f14",
    spine:  "#471407",
    accent: "#f4cdb6",
    shadow: "rgba(71,20,7,0.4)",
  },
  gold: {
    bg:     "#2b2418",
    spine:  "#1c1710",
    accent: "#c9a53f",
    shadow: "rgba(42,34,23,0.5)",
  },
} as const;

export function BookSpine({ book, height = 200, compact = false, className }: BookSpineProps) {
  const p = PALETTE_STYLES[book.palette];
  const w = Math.round(height * (2 / 3));
  const titleFs = Math.max(9, Math.round(w * 0.12));
  const authorFs = Math.max(8, Math.round(w * 0.09));
  const glyphFs = Math.round(w * 0.28);

  return (
    <div
      className={cn("relative flex-shrink-0 rounded-[4px_8px_8px_4px] overflow-hidden select-none", className)}
      style={{
        width: w,
        height,
        background: p.bg,
        boxShadow: `inset ${Math.round(w * 0.08)}px 0 0 ${p.spine}, inset 0 0 0 1px rgba(0,0,0,.2), 0 4px 12px ${p.shadow}`,
      }}
    >
      {/* 이중 테두리 장식선 */}
      {!compact && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "7%", bottom: "7%", left: "15%", right: "7%",
            border: `1px solid ${p.accent}`,
            borderRadius: 2,
            opacity: 0.65,
          }}
        />
      )}

      {/* 배경 글리프 */}
      <div
        className="absolute"
        style={{
          bottom: compact ? "auto" : "50%",
          top: compact ? "50%" : "auto",
          left: "58%",
          transform: "translate(-50%, 50%)",
          width: compact ? "38%" : "26%",
          aspectRatio: "1",
          border: `1.5px solid ${p.accent}`,
          borderRadius: "50%",
          opacity: compact ? 0.5 : 0.35,
        }}
      />

      {!compact && (
        <>
          {/* 제목 */}
          <div
            className="absolute"
            style={{
              top: "28%", left: "17%", right: "10%",
              fontSize: titleFs,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: p.accent,
              textShadow: "0 1px 0 rgba(0,0,0,.3)",
              lineHeight: 1.15,
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              display: "-webkit-box",
            }}
          >
            {book.title.ko || book.title.original}
          </div>

          {/* 저자 */}
          <div
            className="absolute overflow-hidden text-ellipsis whitespace-nowrap uppercase"
            style={{
              bottom: "10%", left: "17%", right: "10%",
              fontSize: authorFs,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: p.accent,
              opacity: 0.8,
            }}
          >
            {book.author}
          </div>

          {/* 한자/알파벳 글리프 */}
          {book.coverGlyph && (
            <div
              className="absolute"
              style={{
                top: "50%", left: "58%",
                transform: "translate(-50%, -50%)",
                fontSize: glyphFs,
                fontWeight: 900,
                color: p.accent,
                opacity: 0.12,
                letterSpacing: 0,
              }}
            >
              {book.coverGlyph}
            </div>
          )}
        </>
      )}
    </div>
  );
}
