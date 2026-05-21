# 미네르바 도서관 — 독립 앱 (v0.3)

> 7현자 원전 + 원전-인지형 AI 풀이. 미네르바 플랫폼에서 분리된 독립 Next.js 앱.

| 항목 | 값 |
|---|---|
| **운영 URL** | https://minerva-library-wg.netlify.app |
| **인프라** | Netlify (@netlify/plugin-nextjs) |
| **프레임워크** | Next.js 14.2 App Router · TypeScript |
| **LLM** | Gemini 3.1 Flash Lite (`@google/genai`) |
| **DB·인증** | 없음 (게스트 모드) |
| **분리일** | 2026-05-21 |
| **본 플랫폼(미네르바)** | https://minerva2.whosgood.org |
| **베이스 스냅샷** | `05_프로토타입_도서관/snapshots/2026-05-21_v0.3/` |

---

## ⚙️ 환경변수

| 키 | 필요 여부 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | **필수** | `/api/chat` 라우트에서 AI 풀이 호출 시 사용. Netlify 대시보드 → Site settings → Environment variables 에서 직접 설정 |
| `NEXT_TELEMETRY_DISABLED` | 선택 | netlify.toml에 `"1"`로 설정됨 |

> ⚠️ **현재 배포 상태**: `GEMINI_API_KEY` 미설정 → 정적 페이지(읽기·목록·사상가)는 정상 동작, AI 풀이만 실패. 사용자가 대시보드에서 키 추가 후 재배포 필요 (또는 자동 재빌드).

---

## 🚀 로컬 개발

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build
```

---

## 📦 배포

한글 경로 회피를 위해 영문 경로로 복사한 후 Netlify 배포:

```bash
# 1) 영문 경로로 복사 (PowerShell)
Copy-Item -Path ".\*" -Destination "c:\tmp\minerva-library-deploy\" -Recurse -Exclude "node_modules",".next" -Force

# 2) Netlify 배포
cd c:/tmp/minerva-library-deploy
netlify deploy --build --prod
```

이미 `netlify link`가 되어 있어 `minerva-library-wg.netlify.app`으로 자동 배포됩니다.

---

## 📁 디렉토리

```
06_프로토타입_도서관_독립/
├── app/                  ← 라우트 (/, /books, /sages, /my, /search, /share, /onboarding, /about, /api/*)
├── components/           ← 도서관 UI (BookSpine, ImmersiveReader, SagePortrait, LibHeader, ...)
├── data/                 ← books.ts, sages.ts, sageTeachings.ts
├── lib/                  ← utils, bookmarks, libraryPersonas, gemini, types
├── public/
│   ├── portraits/        ← 사상가 초상화 14장
│   └── content/books/    ← 챕터 본문 JSON
├── scripts/              ← library_converter.py (학습데이터→챕터 JSON)
├── next.config.js, tailwind.config.ts, tsconfig.json
└── netlify.toml
```

---

## 🔄 본 플랫폼과의 관계

- **본 플랫폼**(`07_프로토타입_v2_GCP`)의 `app/library/*` 라우트는 한동안 **함께 유지**됩니다. 이는 외부 링크·북마크 보존 + 롤백 안전 차원입니다.
- 독립 사이트가 안정화되고 `library.whosgood.org` 같은 커스텀 도메인 연결이 끝나면, 본 플랫폼의 `/library/*`는 새 도메인으로 **301 리다이렉트** 또는 라우트 제거합니다.
- 본 플랫폼 footer의 "📖 미네르바 도서관 (베타)" 링크는 안정화 후 새 도메인으로 교체합니다.

---

## 🛡️ 롤백 절차

배포가 잘못된 경우:
1. Netlify 대시보드 → Deploys → 직전 정상 배포의 "Publish deploy"
2. 또는 스냅샷에서 코드 복원:
   ```powershell
   $SNAP = "...\05_프로토타입_도서관\snapshots\2026-05-21_v0.3"
   Copy-Item -Path "$SNAP\app\library\*"        -Destination ".\app\"        -Recurse -Force
   Copy-Item -Path "$SNAP\components\library\*" -Destination ".\components\" -Recurse -Force
   # ... (자세한 절차는 SNAPSHOT.md 참조)
   ```

---

## 📜 변경 이력

- **2026-05-21 v0.3.0** — 본 플랫폼에서 분리. Netlify 독립 배포 (`minerva-library-wg.netlify.app`)
- 이전 이력은 `07_프로토타입_v2_GCP/CHANGELOG.md` 또는 스냅샷 `SNAPSHOT.md` 참조
