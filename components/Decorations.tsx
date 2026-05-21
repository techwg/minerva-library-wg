// 미네르바 도서관 — 장식 SVG 라이브러리 (v0.2)
// 인장(印章) · 낙관(落款) · 운문(雲紋) · 부조 한자 · 챕터 디바이더 · 종이 질감 등

import React from "react";

export function KoreanSeal({
  chars = "茶山",
  size = 64,
  color = "var(--vermilion-500)",
  rotate = -3,
  variant = "relief",
}: {
  chars?: string;
  size?: number;
  color?: string;
  rotate?: number;
  variant?: "relief" | "intaglio";
}) {
  const c = chars.split("");
  const bg = variant === "relief" ? color : "transparent";
  const ink = variant === "relief" ? "#FFFBF2" : color;
  const grid2x2 = c.length > 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        color: ink,
        borderRadius: Math.max(3, size * 0.08),
        boxShadow:
          variant === "relief"
            ? `inset 0 0 0 ${Math.max(1, size * 0.025)}px #FFFBF2, inset 0 0 0 ${Math.max(2, size * 0.05)}px ${color}`
            : `inset 0 0 0 ${Math.max(1.5, size * 0.03)}px ${color}`,
        transform: `rotate(${rotate}deg)`,
        display: "grid",
        gridTemplateColumns: grid2x2 ? "1fr 1fr" : "1fr",
        gridTemplateRows: c.length === 1 ? "1fr" : grid2x2 ? "1fr 1fr" : "1fr 1fr",
        placeItems: "center",
        fontFamily: "var(--font-sans)",
        fontWeight: 900,
        lineHeight: 0.9,
        position: "relative",
        overflow: "hidden",
        filter: "contrast(1.05)",
      }}
    >
      {c.map((ch, i) => (
        <span
          key={i}
          style={{
            fontSize: c.length === 1 ? size * 0.6 : c.length === 2 ? size * 0.38 : size * 0.32,
            transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.5}deg)`,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

export function NagGwan({
  name = "다산",
  hanja = "茶山",
  date = "戊寅",
  color = "var(--vermilion-500)",
  size = "md",
}: {
  name?: string;
  hanja?: string;
  date?: string;
  color?: string;
  size?: "md" | "lg";
}) {
  const big = size === "lg";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: big ? 12 : 8 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "var(--font-sans)",
          color: "var(--ink-700)",
          lineHeight: 1.05,
        }}
      >
        <span style={{ fontSize: big ? 11 : 9, fontWeight: 700, color: "var(--ink-500)", letterSpacing: "0.1em", marginBottom: 2 }}>{date}</span>
        <span style={{ fontSize: big ? 18 : 14, fontWeight: 900, letterSpacing: "0.1em" }}>{hanja}</span>
        <span style={{ fontSize: big ? 10 : 8, fontWeight: 700, color: "var(--ink-500)", marginTop: 2 }}>{name}</span>
      </div>
      <KoreanSeal chars={hanja} size={big ? 44 : 32} color={color} rotate={-4} />
    </div>
  );
}

export function ChapterDivider({
  width = 200,
  color = "var(--book-accent)",
  glyph,
}: {
  width?: number;
  color?: string;
  glyph?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        maxWidth: width,
        margin: "20px auto",
        color,
      }}
    >
      <svg width="80" height="8" viewBox="0 0 80 8">
        <path d="M0 4 H72" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="76" cy="4" r="2" fill={color} />
      </svg>
      {glyph ? (
        <span style={{ fontSize: 14, fontWeight: 900, color, opacity: 0.7, letterSpacing: 0 }}>{glyph}</span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="2.5" fill="none" stroke={color} strokeWidth="1" />
          <circle cx="7" cy="7" r="0.8" fill={color} />
        </svg>
      )}
      <svg width="80" height="8" viewBox="0 0 80 8">
        <path d="M8 4 H80" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="4" cy="4" r="2" fill={color} />
      </svg>
    </div>
  );
}

export function CornerBrackets({
  inset = 12,
  length = 28,
  thickness = 1.2,
  color = "var(--book-accent)",
  opacity = 0.7,
}: {
  inset?: number;
  length?: number;
  thickness?: number;
  color?: string;
  opacity?: number;
}) {
  const ink = { stroke: color, strokeWidth: thickness, fill: "none", opacity, strokeLinecap: "round" as const };
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none">
      <g vectorEffect="non-scaling-stroke">
        <g>
          <line x1={inset} y1={inset} x2={inset + length} y2={inset} {...ink} />
          <line x1={inset} y1={inset} x2={inset} y2={inset + length} {...ink} />
          <circle cx={inset} cy={inset} r="2.2" fill={color} opacity={opacity} />
        </g>
        <g transform="translate(100% 0) scale(-1 1)">
          <line x1={inset} y1={inset} x2={inset + length} y2={inset} {...ink} />
          <line x1={inset} y1={inset} x2={inset} y2={inset + length} {...ink} />
          <circle cx={inset} cy={inset} r="2.2" fill={color} opacity={opacity} />
        </g>
        <g transform="translate(0 100%) scale(1 -1)">
          <line x1={inset} y1={inset} x2={inset + length} y2={inset} {...ink} />
          <line x1={inset} y1={inset} x2={inset} y2={inset + length} {...ink} />
          <circle cx={inset} cy={inset} r="2.2" fill={color} opacity={opacity} />
        </g>
        <g transform="translate(100% 100%) scale(-1 -1)">
          <line x1={inset} y1={inset} x2={inset + length} y2={inset} {...ink} />
          <line x1={inset} y1={inset} x2={inset} y2={inset + length} {...ink} />
          <circle cx={inset} cy={inset} r="2.2" fill={color} opacity={opacity} />
        </g>
      </g>
    </svg>
  );
}

export function CarvedHanja({
  glyph = "牧",
  size = 200,
  color = "var(--book-accent)",
  opacity = 0.12,
}: {
  glyph?: string;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  const uniqueId = `carve-${glyph}-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <filter id={uniqueId}>
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="4" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 1.8} />
      <rect x="10" y="10" width="80" height="80" rx="2" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 1.2} />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans)"
        fontWeight="900"
        fontSize="62"
        fill={color}
        opacity={opacity * 3}
        filter={`url(#${uniqueId})`}
        style={{ letterSpacing: 0 }}
      >
        {glyph}
      </text>
    </svg>
  );
}

export function CloudPattern({
  width = "100%",
  height = 28,
  color = "var(--book-accent)",
  opacity = 0.35,
}: {
  width?: string | number;
  height?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 28" preserveAspectRatio="xMidYMid meet" style={{ display: "block", opacity }}>
      <defs>
        <pattern id="cloud-pat" x="0" y="0" width="40" height="28" patternUnits="userSpaceOnUse">
          <path d="M0,14 Q5,4 12,14 T26,14 T40,14" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6" cy="14" r="0.8" fill={color} />
          <circle cx="20" cy="14" r="0.8" fill={color} />
          <circle cx="34" cy="14" r="0.8" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cloud-pat)" />
    </svg>
  );
}

export function GridQuote({
  children,
  color = "var(--book-accent)",
  padding = "20px 24px",
}: {
  children: React.ReactNode;
  color?: string;
  padding?: string;
}) {
  return (
    <div style={{ padding, borderTop: `2px solid ${color}`, borderBottom: `2px solid ${color}`, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 2, background: color, opacity: 0.4 }} />
      <div style={{ position: "absolute", right: 0, top: 4, bottom: 4, width: 2, background: color, opacity: 0.4 }} />
      {children}
    </div>
  );
}

export function BrushHighlight({ color = "var(--book-accent-soft)" }: { color?: string }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: -2,
        right: -2,
        top: "55%",
        bottom: -2,
        background: `linear-gradient(180deg, transparent 0%, ${color} 30%, ${color} 90%, transparent 100%)`,
        zIndex: -1,
        borderRadius: 1,
        transform: "rotate(-0.4deg)",
        pointerEvents: "none",
      }}
    />
  );
}
