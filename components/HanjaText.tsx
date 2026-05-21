"use client";

// 한자 hover gloss — 사전에 있는 한자만 점선 underline + hover tooltip
// 사용자 요청 (v0.2): "막히는 한자는 그 자리에서 풀이를 받고 싶다"

import React from "react";

export const HANJA_GLOSSARY: Record<string, { reading: string; meaning: string }> = {
  // 목민심서
  "牧": { reading: "기를 목", meaning: "기르다, 다스리다, 백성을 다스리는 자(=목민)" },
  "民": { reading: "백성 민", meaning: "사람들, 다스림의 주체" },
  "心": { reading: "마음 심", meaning: "마음, 가운데, 가장 깊은 곳" },
  "書": { reading: "글 서", meaning: "글, 책, 적어서 남긴 것" },
  "他": { reading: "다를 타", meaning: "다른, 그 외의" },
  "官": { reading: "벼슬 관", meaning: "벼슬, 관직, 다스리는 자리" },
  "可": { reading: "옳을 가", meaning: "옳다, 가능하다, ~해도 된다" },
  "求": { reading: "구할 구", meaning: "구하다, 찾다, 청하다" },
  "不": { reading: "아닐 불", meaning: "아니다, ~하지 않다" },
  "也": { reading: "어조사 야", meaning: "문장을 단정짓는 종결사" },
  "除": { reading: "덜 제", meaning: "덜다, 임명하다(除拜)" },
  "拜": { reading: "절 배", meaning: "절하다, 받다(=임명을 받다)" },
  // 논어
  "學": { reading: "배울 학", meaning: "배우다, 공부하다" },
  "而": { reading: "말이을 이", meaning: "그리고, 그러나(접속사)" },
  "時": { reading: "때 시", meaning: "때, 시간, 적절한 때" },
  "習": { reading: "익힐 습", meaning: "익히다, 거듭하다" },
  "之": { reading: "갈 지", meaning: "그것, ~의(대명사·조사)" },
  "說": { reading: "기쁠 열", meaning: "기쁘다(열), 말하다(설)" },
  "君": { reading: "임금 군", meaning: "임금, 군자, 덕 있는 사람" },
  "子": { reading: "아들 자", meaning: "아들, 선생, 존칭" },
  "仁": { reading: "어질 인", meaning: "어질다, 사람다움(공자의 핵심 가르침)" },
  "義": { reading: "옳을 의", meaning: "옳음, 마땅함, 정의" },
  "禮": { reading: "예도 례", meaning: "예의, 의식, 사람의 도리" },
  "知": { reading: "알 지", meaning: "알다, 지혜" },
  // 장자
  "莊": { reading: "씩씩할 장", meaning: "씩씩하다, 장자(莊子)의 성" },
  "逍": { reading: "노닐 소", meaning: "노닐다, 거닐다" },
  "遙": { reading: "멀 요", meaning: "멀다, 아득하다" },
  "遊": { reading: "놀 유", meaning: "놀다, 떠돌다(소요유 = 자유롭게 노님)" },
  // 원효
  "起": { reading: "일어날 기", meaning: "일어나다, 비롯하다" },
  "信": { reading: "믿을 신", meaning: "믿음, 신뢰" },
  "論": { reading: "논할 론", meaning: "논하다, 의논, 글(=논어의 논)" },
  "疏": { reading: "소통할 소", meaning: "트이다, 주석(疏=경전 해설)" },
  "曉": { reading: "새벽 효", meaning: "새벽, 깨닫다(=원효의 호)" },
  "茶": { reading: "차 다", meaning: "차(=다산의 호 茶山)" },
  "山": { reading: "메 산", meaning: "산, 산악" },
};

export function HanjaText({
  text,
  glossOn = true,
}: {
  text: string;
  glossOn?: boolean;
}) {
  if (!glossOn) return <span>{text}</span>;
  const chars = Array.from(text);
  return (
    <span>
      {chars.map((c, i) => {
        const g = HANJA_GLOSSARY[c];
        if (!g) return <span key={i}>{c}</span>;
        return (
          <span key={i} className="hanja-gloss-trigger">
            {c}
            <span className="hanja-gloss-tip" aria-hidden>
              <span className="reading">{c}</span>
              <span style={{ fontWeight: 800, color: "var(--parchment-0)" }}>{g.reading}</span>
              <div className="meaning">{g.meaning}</div>
            </span>
          </span>
        );
      })}
    </span>
  );
}
