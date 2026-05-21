import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#fdfbf5",
};

export const metadata: Metadata = {
  title: "미네르바 도서관 | 현자의 원전을 읽다",
  description:
    "7현자 원전 + 원전-인지형 AI 풀이. 공자·노자·장자·원효·다산·최제우·소크라테스·아우구스티누스·키에르케고르의 원전을 읽고, 바로 그 페이지에서 AI 현자에게 질문하세요.",
  keywords: [
    "미네르바 도서관",
    "동양 고전",
    "서양 고전",
    "현자",
    "원전",
    "AI 풀이",
    "논어",
    "도덕경",
    "목민심서",
    "동학",
    "변론",
  ],
  authors: [{ name: "Who's Good" }],
  openGraph: {
    title: "미네르바 도서관",
    description: "현자의 원전을 살아있는 텍스트로 읽다. 원전-인지형 AI가 본문을 풀이합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
