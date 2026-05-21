import Image from "next/image";
import type { Sage } from "@/lib/types";

interface SagePortraitProps {
  sage: Sage;
  size?: number;
}

export function SagePortrait({ sage, size = 120 }: SagePortraitProps) {
  const isWestern = sage.tradition === "western";
  const bg = isWestern ? "#faf3dd" : "#fbece2";
  const color = isWestern ? "#5d4708" : "#67200b";
  const glyphOpacity = 0.35;
  const height = Math.round(size * 1.25);

  return (
    <div
      className="relative flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ width: size, height, background: bg }}
    >
      {sage.portrait ? (
        <Image
          src={sage.portrait}
          alt={sage.name.ko}
          width={size}
          height={height}
          className="object-cover w-full h-full"
          unoptimized
        />
      ) : (
        <span
          style={{
            fontSize: Math.round(size * 0.6),
            fontWeight: 900,
            color,
            opacity: glyphOpacity,
            letterSpacing: "-0.04em",
            userSelect: "none",
          }}
        >
          {sage.coverGlyph}
        </span>
      )}

      {/* 도장 — 우측 하단 */}
      <div
        className="seal absolute"
        style={{
          bottom: -6,
          right: -6,
          width: Math.round(size * 0.28),
          height: Math.round(size * 0.28),
          fontSize: Math.round(size * 0.07),
          background: isWestern ? "#a8821c" : "#842f14",
        }}
      >
        {sage.hanja.slice(0, 2)}
      </div>
    </div>
  );
}
