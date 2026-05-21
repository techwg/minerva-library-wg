export function LibFooter() {
  return (
    <footer className="px-12 py-8 bg-parchment-100 border-t border-parchment-200 text-ink-400 text-[12px]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* 패밀리 크레스트 */}
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: "var(--persimmon-500)" }}
          />
          <span className="font-bold text-ink-500">
            미네르바 패밀리 · Minerva Library
          </span>
        </div>

        {/* 라이선스 */}
        <div className="text-ink-400 leading-relaxed">
          수록 원전은 모두 공공도메인(PD) 또는 공공누리 1유형입니다.{" "}
          <br className="sm:hidden" />
          출처: 한국고전번역원(ITKC), Project Gutenberg, CCEL, 동국대 KABC
        </div>
      </div>
    </footer>
  );
}
