import type { Config } from "tailwindcss";

/**
 * 미네르바 플랫폼 디자인 토큰
 *
 * 컨셉: 한국 고전 + 서양 고전의 조화
 * - 먹색 / 명조체 / 웜 베이지
 * - 10명 사후 인물 현자 각각의 색조 보조 (v0.2 확장)
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 먹색 계열 (본문·헤더)
        ink: {
          50: "#f8f7f4",
          100: "#efece4",
          200: "#d9d3c3",
          300: "#b8ae97",
          400: "#8f8369",
          500: "#6b6048",
          600: "#504737",
          700: "#3d3628",
          800: "#2a261d",
          900: "#1a1812",
        },
        // 웜 베이지 (배경·카드) — 도서관용 -0 추가
        parchment: {
          0:   "#fffcf4",
          50:  "#fdfbf5",
          100: "#faf5e8",
          200: "#f3ead0",
          300: "#e9dbb0",
          400: "#dcc889",
          500: "#c9ad5f",
        },
        // 소프트 골드 (액센트)
        gold: {
          50:  "#fdf9ec",
          100: "#f8efc4",
          200: "#ecd994",
          300: "#d4b971",
          400: "#c2a34e",
          500: "#a88632",
          600: "#8a6a20",
          700: "#6f5418",
          800: "#574214",
          900: "#3f300e",
        },
        // 📖 도서관: 동양 원전(주사) 팔레트
        vermilion: {
          50:  "#fbece2",
          100: "#f4cdb6",
          200: "#e29d7a",
          300: "#c56a44",
          400: "#a24420",
          500: "#842f14",
          600: "#67200b",
          700: "#471407",
        },
        // 📖 도서관: 브랜드 점
        persimmon: {
          500: "#f26522",
        },
        // 원전 카드 (antique white)
        antique: {
          50: "#fdf9ef",
          100: "#faf1d8",
          200: "#f2e0ad",
        },
        // 위기 경고 (muted red)
        crisis: {
          100: "#fde8e7",
          500: "#c4554e",
          700: "#8a3832",
        },
      },
      fontFamily: {
        // 나눔스퀘어 네오 단일 폰트 통일 (웨이트 차이로 강조 표현)
        // CDN: https://fonts.cdnfonts.com/css/nanumsquare-neo
        sans: ['"NanumSquare Neo"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"NanumSquare Neo"', 'sans-serif'], // .serif 클래스 호환 유지 (Heavy 웨이트용)
        display: ['"NanumSquare Neo"', 'sans-serif'],
        // 📖 도서관 — 서양 원전(그리스·라틴·영어) 표시용
        reading: ['"EB Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      maxWidth: {
        reading: "68ch",
        reader: "760px",
      },
      typography: {
        DEFAULT: {
          css: {
            lineHeight: "1.85",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
