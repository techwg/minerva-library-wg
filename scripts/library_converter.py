"""
미네르바 도서관 — 학습데이터→챕터 JSON 변환기

학습데이터 폴더의 한국어 완본 책들을 도서관 챕터 JSON으로 변환.
- 동학 4종(JSON) → items 배열을 챕터별로 분할
- 도덕경(TXT) → "제N장" 패턴으로 81장 분할
- 니체(TXT) → 각 책 패턴별 분할

출력: public/library/content/books/{bookId}/{chapterId}.json
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_ROOT = Path("d:/Users/susta/MyDrive/00_토마스_WORK/개발전용/00_비전플랫폼_위즈돔플랫폼/03_미네르바AI플랫폼/06_학습용데이터")
OUT_ROOT = ROOT / "public" / "library" / "content" / "books"


def write_chapter(book_id: str, chapter_id: str, payload: dict) -> None:
    out_dir = OUT_ROOT / book_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{chapter_id}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def split_paragraphs(text: str) -> list[str]:
    """이중 개행 또는 단일 개행을 기준으로 단락 분리"""
    text = text.strip()
    parts = re.split(r"\n\s*\n", text)
    return [p.strip() for p in parts if p.strip()]


# ─────────────────────────────────────────────────────────
# 1. 동학 JSON 변환 (동경대전·해월법설·의암법설·용담유사)
# ─────────────────────────────────────────────────────────
def convert_donghak_book(
    src_path: Path,
    book_id: str,
    book_title: str,
    book_original: str,
    persona: str = "choejeu",
    palette: str = "vermilion",
):
    with open(src_path, encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("items", [])
    author = data.get("author", "")
    chapters_meta = []

    for i, item in enumerate(items, 1):
        title = item.get("title") or item.get("name") or f"제{i}장"
        text = item.get("text", "")

        # 한문/한국어 단락 추출
        paragraphs = []
        para_texts = split_paragraphs(text)
        for j, p in enumerate(para_texts, 1):
            paragraphs.append({"id": f"p{j}", "original": p, "ko": ""})

        chapter_id = f"c-{i:02d}"
        chapter_label = title

        # ko-only인 경우 ko 필드에 넣기
        for p in paragraphs:
            if not any("一" <= ch <= "鿿" for ch in p["original"]):
                # 한자가 없으면 한국어로 간주
                p["ko"] = p["original"]
                p["original"] = ""

        payload = {
            "bookId": book_id,
            "chapterId": chapter_id,
            "bookTitle": book_title,
            "bookOriginal": book_original,
            "author": author,
            "persona": persona,
            "palette": palette,
            "number": f"제 {i} 편",
            "chapterLabel": chapter_label,
            "title": title,
            "titleOriginal": title,
            "originalLang": "한문·한국어 혼용",
            "originalLangCode": "ko-hanja",
            "originalLangs": [
                {"code": "hanja", "label": "漢文"},
                {"code": "ko", "label": "한국어"},
            ],
            "sourceCredit": "wikisource:ko 등 · 천도교 PD/CC",
            "breadcrumb": [book_title, f"제 {i} 편", title],
            "intro": "",
            "paragraphs": paragraphs,
        }
        write_chapter(book_id, chapter_id, payload)
        chapters_meta.append({
            "id": chapter_id,
            "number": f"제{i}편",
            "title": title,
            "count": len(paragraphs),
        })

    return chapters_meta


# ─────────────────────────────────────────────────────────
# 2. 도덕경 한국어 텍스트 → 81장 분할
# ─────────────────────────────────────────────────────────
def convert_daodejing():
    src = DATA_ROOT / "03_노자" / "korean" / "daodejing_korean_text.txt"
    src_chinese_json = DATA_ROOT / "03_노자" / "daodejing_wikisource_zh.txt"

    with open(src, encoding="utf-8") as f:
        ko_text = f.read()

    # "제N장" 또는 "N." 패턴 모두 인식 (도덕경 텍스트는 4장까지만 "제N장", 5장부터 "N.")
    # 이중 개행 직후 N. 또는 제N장 패턴
    chapter_pattern = re.compile(
        r"(?:^|\n\n)\s*(?:제(\d+)장\s*\n|(\d+)\.\s*(?=\d+\.|[가-힣]))",
        re.MULTILINE,
    )
    raw_matches = list(chapter_pattern.finditer(ko_text))

    # 추출된 챕터 번호로 정제 (중복 제거, 순차 검증)
    matches = []
    seen_nums = set()
    expected = 1
    for m in raw_matches:
        num = int(m.group(1) or m.group(2))
        # 본문 내부의 번호 매김(예: "1.", "2." 끼리)은 제외
        if num != expected:
            continue
        if num in seen_nums:
            continue
        seen_nums.add(num)
        matches.append((m, num))
        expected = num + 1
        if expected > 81:
            break

    # 한문 원문 (옵션 — 있으면 같이 표시)
    chinese_chapters = {}
    if src_chinese_json.exists():
        with open(src_chinese_json, encoding="utf-8") as f:
            zh_full = f.read()
        # wikisource는 줄별로 "1 道可道..." 같은 형식일 수 있음
        for line in zh_full.split("\n"):
            m = re.match(r"^(\d+)[\s.]+(.+)$", line.strip())
            if m:
                chinese_chapters[int(m.group(1))] = m.group(2).strip()

    chapters_meta = []
    for idx, (m, chapter_num) in enumerate(matches):
        start = m.end()
        end = matches[idx + 1][0].start() if idx + 1 < len(matches) else len(ko_text)
        body = ko_text[start:end].strip()

        # 단락 분리
        paragraphs = []
        para_texts = split_paragraphs(body)
        for j, p in enumerate(para_texts, 1):
            paragraphs.append({
                "id": f"p{j}",
                "original": chinese_chapters.get(chapter_num, "") if j == 1 else "",
                "ko": p,
            })

        chapter_id = f"c-{chapter_num:02d}"
        payload = {
            "bookId": "daodejing",
            "chapterId": chapter_id,
            "bookTitle": "도덕경",
            "bookOriginal": "道德經",
            "author": "노자 (老子)",
            "persona": "laozi",
            "palette": "vermilion",
            "number": f"제 {chapter_num} 장",
            "chapterLabel": f"道德經 第{chapter_num}章",
            "title": f"제{chapter_num}장",
            "titleOriginal": f"第{chapter_num}章",
            "originalLang": "한국어 · 한문",
            "originalLangCode": "ko",
            "originalLangs": [
                {"code": "ko", "label": "한국어"},
                {"code": "hanja", "label": "漢文 (Wikisource)"},
            ],
            "sourceCredit": "Project Gutenberg pg216 · James Legge 영역본 → 한국어 번역",
            "breadcrumb": ["도덕경", f"제 {chapter_num} 장"],
            "intro": "",
            "paragraphs": paragraphs,
        }
        write_chapter("daodejing", chapter_id, payload)
        chapters_meta.append({
            "id": chapter_id,
            "number": f"제{chapter_num}장",
            "title": f"제{chapter_num}장",
            "count": len(paragraphs),
        })

    return chapters_meta


# ─────────────────────────────────────────────────────────
# 3. 니체 책 한국어 텍스트 → 챕터 분할
# ─────────────────────────────────────────────────────────
def convert_nietzsche_book(
    filename: str,
    book_id: str,
    book_title: str,
    book_original: str,
    chapter_split_pattern: re.Pattern,
    chapter_num_extract=None,
):
    src = DATA_ROOT / "02_니체" / "korean" / filename
    if not src.exists():
        print(f"⚠ 누락: {src}")
        return []

    with open(src, encoding="utf-8") as f:
        text = f.read()

    # 첫 챕터 마커 위치 전까지는 서문/메타
    matches = list(chapter_split_pattern.finditer(text))
    if not matches:
        # 패턴 못 찾으면 전체를 한 챕터로
        paragraphs = [
            {"id": f"p{i}", "original": "", "ko": p}
            for i, p in enumerate(split_paragraphs(text), 1)
        ]
        chapter_id = "c-01"
        payload = _nietzsche_payload(book_id, book_title, book_original, chapter_id, "전체", 1, paragraphs)
        write_chapter(book_id, chapter_id, payload)
        return [{"id": chapter_id, "number": "전체", "title": book_title, "count": len(paragraphs)}]

    chapters_meta = []
    for idx, m in enumerate(matches):
        start = m.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[start:end].strip()

        # 헤더 줄 + 본문
        lines = block.split("\n", 1)
        header = lines[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""

        if chapter_num_extract:
            chapter_num = chapter_num_extract(m, idx)
        else:
            chapter_num = idx + 1

        para_texts = split_paragraphs(body) if body else []
        paragraphs = [
            {"id": f"p{i}", "original": "", "ko": p}
            for i, p in enumerate(para_texts, 1)
        ]

        chapter_id = f"c-{chapter_num:02d}"
        payload = _nietzsche_payload(
            book_id, book_title, book_original, chapter_id, header, chapter_num, paragraphs
        )
        write_chapter(book_id, chapter_id, payload)
        chapters_meta.append({
            "id": chapter_id,
            "number": f"제{chapter_num}장",
            "title": header,
            "count": len(paragraphs),
        })
    return chapters_meta


def _nietzsche_payload(book_id, book_title, book_original, chapter_id, header, chapter_num, paragraphs):
    return {
        "bookId": book_id,
        "chapterId": chapter_id,
        "bookTitle": book_title,
        "bookOriginal": book_original,
        "author": "프리드리히 니체",
        "persona": "nietzsche",
        "palette": "gold",
        "number": f"제 {chapter_num} 장",
        "chapterLabel": header,
        "title": header,
        "titleOriginal": header,
        "originalLang": "한국어 (독일어 원본 번역)",
        "originalLangCode": "ko",
        "originalLangs": [{"code": "ko", "label": "한국어"}],
        "sourceCredit": "Project Gutenberg (영역본) → 한국어 번역",
        "breadcrumb": [book_title, header],
        "intro": "",
        "paragraphs": paragraphs,
    }


# ─────────────────────────────────────────────────────────
# 4. 퇴계전서 변환
# ─────────────────────────────────────────────────────────
def convert_toegye():
    src = DATA_ROOT / "05_퇴계이황" / "toegye_jeonseo_full.txt"
    if not src.exists():
        return []
    with open(src, encoding="utf-8") as f:
        text = f.read()

    # "제N권" 또는 "卷N" 같은 패턴으로 분할
    pat = re.compile(r"^(?:卷|제)\s*(\d+)\s*(?:권)?", re.MULTILINE)
    matches = list(pat.finditer(text))
    if not matches:
        # 전체 한 챕터
        paras = split_paragraphs(text)
        paragraphs = [{"id": f"p{i}", "original": "", "ko": p} for i, p in enumerate(paras, 1)]
        payload = {
            "bookId": "toegye-jeonseo",
            "chapterId": "c-01",
            "bookTitle": "퇴계전서",
            "bookOriginal": "退溪全書",
            "author": "이황 (李滉)",
            "persona": "toegye",
            "palette": "vermilion",
            "number": "전권",
            "chapterLabel": "퇴계전서 전권",
            "title": "퇴계전서",
            "titleOriginal": "退溪全書",
            "originalLang": "한국어 (국역)",
            "originalLangCode": "ko",
            "originalLangs": [{"code": "ko", "label": "한국어"}],
            "sourceCredit": "한국고전번역원 (ITKC) 국역",
            "breadcrumb": ["퇴계전서"],
            "intro": "",
            "paragraphs": paragraphs[:200],  # 큰 책이면 일부만
        }
        write_chapter("toegye-jeonseo", "c-01", payload)
        return [{"id": "c-01", "number": "전권", "title": "퇴계전서", "count": len(paragraphs)}]

    chapters_meta = []
    for idx, m in enumerate(matches):
        num = int(m.group(1))
        start = m.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[start:end].strip()
        paras = split_paragraphs(block)
        paragraphs = [{"id": f"p{i}", "original": "", "ko": p} for i, p in enumerate(paras, 1)]
        chapter_id = f"c-{num:02d}"
        payload = {
            "bookId": "toegye-jeonseo",
            "chapterId": chapter_id,
            "bookTitle": "퇴계전서",
            "bookOriginal": "退溪全書",
            "author": "이황 (李滉)",
            "persona": "toegye",
            "palette": "vermilion",
            "number": f"제 {num} 권",
            "chapterLabel": f"退溪全書 卷{num}",
            "title": f"제{num}권",
            "titleOriginal": f"卷{num}",
            "originalLang": "한국어 (국역)",
            "originalLangCode": "ko",
            "originalLangs": [{"code": "ko", "label": "한국어"}],
            "sourceCredit": "한국고전번역원 (ITKC) 국역",
            "breadcrumb": ["퇴계전서", f"제 {num} 권"],
            "intro": "",
            "paragraphs": paragraphs,
        }
        write_chapter("toegye-jeonseo", chapter_id, payload)
        chapters_meta.append({
            "id": chapter_id,
            "number": f"제{num}권",
            "title": f"제{num}권",
            "count": len(paragraphs),
        })
    return chapters_meta


# ─────────────────────────────────────────────────────────
# 메인
# ─────────────────────────────────────────────────────────
def main():
    result = {}

    # 동학 4종
    donghak_books = [
        ("dongyeong_daejeon.json", "donggyeong-daejeon", "동경대전", "東經大全"),
        ("haewol_beopseol.json", "haewol-beopseol", "해월법설", "海月法說"),
        ("euiam_beopseol.json", "euiam-beopseol", "의암법설", "義庵法說"),
        ("yongdam_yusa.json", "yongdam-yusa", "용담유사", "龍潭遺詞"),
    ]
    for fname, bid, btitle, borig in donghak_books:
        src = DATA_ROOT / "04_동학_천도교" / fname
        if not src.exists():
            print(f"⚠ 누락: {src}")
            continue
        chapters = convert_donghak_book(src, bid, btitle, borig)
        result[bid] = {"title": btitle, "chapters": chapters}
        print(f"✅ {btitle}: {len(chapters)}편")

    # 도덕경
    chapters = convert_daodejing()
    if chapters:
        result["daodejing"] = {"title": "도덕경", "chapters": chapters}
        print(f"✅ 도덕경: {len(chapters)}장")

    # 니체 책들은 챕터 구조가 명확치 않아 별도 작업으로 보류
    # (선악의 저편 등은 짧은 잠언이 수백 개라 일률 분할 어려움)

    # 퇴계전서
    chapters = convert_toegye()
    if chapters:
        result["toegye-jeonseo"] = {"title": "퇴계전서", "chapters": chapters}
        print(f"✅ 퇴계전서: {len(chapters)}권")

    # 결과 메타 저장 → BOOKS 업데이트용
    meta_path = ROOT / "scripts" / "library_converter_result.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\n📋 메타: {meta_path}")


if __name__ == "__main__":
    main()
