"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, BookOpen, Hand } from "lucide-react";
import { KoreanSeal, ChapterDivider } from "@/components/Decorations";

const ONBOARD_KEY = "minerva_library_onboarded";

interface Step {
  eyebrow: string;
  title: string;
  desc: string;
  illustration: (props: { palette: string }) => React.ReactNode;
}

const STEPS: Step[] = [
  {
    eyebrow: "01 · 환영합니다",
    title: "현자의 원전을 곁에서 풀이 받는 도서관",
    desc: "막히는 한자, 어려운 구절은 그 자리에서 AI 현자에게 풀이를 받을 수 있어요. 책 한 권을 끝까지 읽는 새로운 경험이에요.",
    illustration: () => (
      <div className="relative w-full h-full flex items-center justify-center">
        <BookOpen size={120} style={{ color: "var(--book-accent)" }} strokeWidth={1.2} />
      </div>
    ),
  },
  {
    eyebrow: "02 · 막히는 구절은 그 자리에서",
    title: "구절을 짚으면, 현자가 답합니다",
    desc: "본문을 드래그하면 검정 메뉴가 떠요. ‘AI에게 묻기’를 누르면 현자가 그 구절을 풀이해 줍니다.",
    illustration: () => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="relative rounded-lg p-6"
          style={{ background: "var(--parchment-50)", border: "1px solid var(--clay-100)", width: "80%", maxWidth: 320 }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest mb-2 text-ink-400">목민심서 · 부임</div>
          <div className="text-[12px] text-ink-500 font-bold mb-1">他官可求 牧民之官 不可求</div>
          <div className="text-[14px] text-ink-800 leading-relaxed">
            다른 벼슬은 구해도 좋으나,{" "}
            <mark style={{ background: "var(--book-accent-soft)", padding: "1px 3px", borderRadius: 2 }}>
              목민(牧民)의 벼슬은 구하지 말라.
            </mark>
          </div>
          <div
            className="absolute -bottom-6 right-6 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-[11px] font-black shadow-lg"
            style={{ background: "var(--ink-900)" }}
          >
            <Hand size={11} /> AI에게 묻기
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "03 · 책갈피와 함께 자라요",
    title: "마음에 닿은 구절, 책갈피로 모아 두세요",
    desc: "구절과 함께 현자의 풀이까지 저장해요. ‘내 서재’에서 언제든 다시 만날 수 있어요.",
    illustration: () => (
      <div className="relative w-full h-full flex items-center justify-center gap-4">
        <KoreanSeal chars="牧民" size={68} color="var(--vermilion-500)" rotate={-4} />
        <KoreanSeal chars="論語" size={68} color="var(--vermilion-500)" rotate={3} />
        <KoreanSeal chars="Σ" size={68} color="var(--gold-500)" rotate={-6} />
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  const finish = () => {
    try { localStorage.setItem(ONBOARD_KEY, "true"); } catch {}
    router.push("/library");
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col palette-vermilion"
      style={{ background: "var(--parchment-50)" }}
    >
      {/* 상단 — skip */}
      <div className="flex items-center justify-end px-5 pt-6">
        <button onClick={finish} className="text-[12px] font-bold text-ink-500 hover:text-ink-700">
          건너뛰기
        </button>
      </div>

      {/* 일러스트레이션 */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 min-h-[280px]">
        {current.illustration({ palette: "vermilion" })}
      </div>

      {/* 텍스트 */}
      <div className="px-6 pb-4 mx-auto" style={{ maxWidth: 480 }}>
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-3"
          style={{ color: "var(--book-accent-deep)" }}
        >
          {current.eyebrow}
        </div>
        <h1 className="text-[24px] font-black text-ink-900 tracking-tight leading-tight mb-3">
          {current.title}
        </h1>
        <p className="text-[14px] text-ink-600 leading-relaxed">{current.desc}</p>
        <ChapterDivider color="var(--book-accent)" width={120} />
      </div>

      {/* 인디케이터 */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === step ? 24 : 6,
              height: 6,
              background: i === step ? "var(--book-accent)" : "var(--clay-200)",
            }}
          />
        ))}
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-3 px-5 pb-8" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="p-3 rounded-xl text-ink-700 disabled:opacity-30"
          style={{ background: "var(--parchment-100)", border: "1px solid var(--clay-100)" }}
          aria-label="이전"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => (last ? finish() : setStep((s) => s + 1))}
          className="flex-1 py-3.5 rounded-xl text-[15px] font-black text-white flex items-center justify-center gap-2"
          style={{ background: "var(--book-accent)", boxShadow: "0 8px 20px -6px rgba(132,47,20,0.4)" }}
        >
          {last ? (
            <>
              도서관 둘러보기 <Sparkles size={15} />
            </>
          ) : (
            "다음"
          )}
        </button>
      </div>
    </div>
  );
}
