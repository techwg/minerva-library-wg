import Link from "next/link";
import { LibHeader } from "@/components/LibHeader";
import { LibFooter } from "@/components/LibFooter";
import { SagePortrait } from "@/components/SagePortrait";
import { SAGES } from "@/data/sages";
import { getBooksBySage } from "@/data/books";

export default function SagesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--parchment-50)" }}>
      <LibHeader activeNav="sages" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F26522" }} />
            <span className="text-[11px] font-black uppercase tracking-widest text-ink-400">
              7인 현자
            </span>
          </div>
          <h1 className="text-[32px] font-black text-ink-900 tracking-tight">
            미네르바 도서관의 현자들
          </h1>
          <p className="text-[15px] text-ink-500 mt-2">
            소크라테스부터 키에르케고르까지 — 동서양을 아우르는 7인의 지혜.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAGES.map((sage) => {
            const books = getBooksBySage(sage.id);
            const available = books.filter((b) => b.status === "available").length;

            return (
              <Link key={sage.id} href={`/sages/${sage.id}`} className="group block">
                <div className="p-5 rounded-2xl border border-parchment-200 bg-parchment-0 hover:border-parchment-300 transition-all h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <SagePortrait sage={sage} size={52} />
                    <div className="flex-1">
                      <div
                        className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                        style={{ color: sage.tradition === "eastern" ? "#842F14" : "#5D4708" }}
                      >
                        {sage.tradition === "eastern" ? "동양" : "서양"} · {sage.era.split(" ")[0]}
                      </div>
                      <div className="text-[16px] font-black text-ink-900">{sage.name.ko}</div>
                      <div className="text-[12px] text-ink-400 font-bold">{sage.hanja}</div>
                    </div>
                  </div>

                  <p className="text-[13px] text-ink-600 leading-relaxed mb-3">{sage.blurb}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-ink-400 font-bold">
                      원전 {books.length}권
                      {available < books.length && ` (${available}권 열람 가능)`}
                    </span>
                    {sage.pending && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-parchment-100 text-ink-400">
                        준비 중
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <LibFooter />
    </div>
  );
}
