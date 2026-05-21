import Link from "next/link";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { BOOKS } from "@/data/books";

export default function AboutPage() {
  const available = BOOKS.filter((b) => b.status === "available").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment-50)" }}>
      <LibHeader activeNav="about" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F26522" }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
            미네르바 도서관 소개
          </span>
        </div>

        <h1 className="text-[38px] font-black text-ink-900 tracking-tight leading-tight mb-6">
          현자의 텍스트와의 대화
        </h1>

        <div className="prose-like space-y-5 text-[15px] text-ink-700 leading-relaxed">
          <p>
            <strong className="font-black text-ink-900">미네르바 플랫폼</strong>이 "AI 현자와의 대화"라면,{" "}
            <strong className="font-black text-ink-900">미네르바 도서관</strong>은 "현자의 텍스트와의 대화"입니다.
            같은 철학, 다른 진입점.
          </p>
          <p>
            도서관은 7인 현자의 원전을 웹에서 직접 읽으며,{" "}
            <strong className="font-black">읽는 도중 AI에게 질문</strong>할 수 있는 디지털 도서관입니다.
            AI는 지금 읽고 있는 책·장·선택한 구절을 컨텍스트로 받아,
            "이 구절을 쉽게 풀어줘"·"왜 다산은 여기서 이렇게 말했나?"에 답합니다.
          </p>

          <hr className="border-parchment-200 my-8" />

          <h2 className="text-[22px] font-black text-ink-900 mt-8 mb-4">수록 원칙</h2>
          <ul className="space-y-3 pl-0">
            {[
              "퍼블릭 도메인(PD) · CC · 공공누리 원전만 수록합니다.",
              "모든 책은 무료로 읽을 수 있습니다. 다운로드·인쇄는 지원하지 않습니다.",
              "한문 원전은 한국어 국역과 나란히 제공합니다.",
              "서양 원전은 영문 PD 번역본과 한국어 해설을 제공합니다.",
              "출처는 모든 페이지 하단에 명시합니다.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: "#F26522" }} />
                {item}
              </li>
            ))}
          </ul>

          <hr className="border-parchment-200 my-8" />

          <h2 className="text-[22px] font-black text-ink-900 mt-8 mb-4">현재 수록 현황</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="수록 현자" value="7인" />
            <StatCard label="읽기 가능 도서" value={`${available}권`} />
            <StatCard label="AI 모델" value="Gemini 3.1 Flash Lite" />
            <StatCard label="인공지능 모드" value="원전-인지형" />
          </div>

          <hr className="border-parchment-200 my-8" />

          <h2 className="text-[22px] font-black text-ink-900 mt-8 mb-4">패밀리 사이트</h2>
          <p>
            미네르바 도서관은 <strong className="font-black">미네르바 패밀리 사이트</strong>입니다.
            7인 현자와 직접 대화하려면 미네르바 본 플랫폼을 방문하세요.
          </p>
          <a
            href="https://minerva2.whosgood.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[14px] text-white transition-all hover:-translate-y-0.5 mt-2"
            style={{ background: "#5D4708" }}
          >
            미네르바 플랫폼 방문 →
          </a>

          <hr className="border-parchment-200 my-8" />

          <p className="text-[13px] text-ink-400">
            미네르바 패밀리 · Who's Good 제작
          </p>
        </div>
      </main>

      <LibFooter />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 rounded-xl border border-parchment-200 bg-parchment-0">
      <div className="text-[11px] font-black text-ink-400 mb-1">{label}</div>
      <div className="text-[16px] font-black text-ink-900">{value}</div>
    </div>
  );
}
