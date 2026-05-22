"""books.ts 24권의 source 필드 정리.

규칙:
1. 'Project Gutenberg' 표기를 제거하고 '소셜 마인드 자체 번역'으로 대체
   - source: "Project Gutenberg pgXXXX"           → "소셜 마인드 자체 번역 (원본 PD)"
   - source: "Project Gutenberg · Pusey tr."      → "소셜 마인드 자체 번역 (원본 PD · Pusey tr.)"
   - source: "Project Gutenberg · Jowett tr."     → "소셜 마인드 자체 번역 (원본 PD · Jowett tr.)"
   - source: "Project Gutenberg pg23839 · 論語 한문 원전" → "소셜 마인드 자체 번역 (원본: 한국고전번역원 + Gemini)" (analects는 별도)
2. analects/dasan/동학 등 한국어 원본·기존 책은 건드리지 않음 (한국어 원전)
"""
import pathlib, re, sys
sys.stdout.reconfigure(encoding="utf-8")
BOOKS_TS = pathlib.Path(__file__).parent.parent / "data" / "books.ts"

TARGET_IDS = {
    "analects-legge-en", "aristotle-ethics", "aristotle-politics",
    "augustine-confessions", "aurelius-meditations", "bentham-principles",
    "gandhi-hind-swaraj", "hobbes-leviathan", "hume-morals",
    "kant-metaphysic-morals", "kant-perpetual-peace", "kant-practical-reason",
    "locke-two-treatises", "marx-manifesto", "mill-on-liberty",
    "mill-utilitarianism", "nietzsche-beyond-good-evil",
    "nietzsche-genealogy-of-morals", "nietzsche-zarathustra",
    "plato-meno", "plato-republic", "plato-symposium",
    "rousseau-social-contract", "toegye-jeonseo",
}

src = BOOKS_TS.read_text(encoding="utf-8")
new = src
changed = []

# 각 책 블록의 source 필드를 정규식으로 찾아 교체
for bid in TARGET_IDS:
    pattern = re.compile(
        rf'(id:\s*"{re.escape(bid)}".*?source:\s*")([^"]*)("[^\n]*)',
        re.S
    )
    m = pattern.search(new)
    if not m:
        continue
    old_source = m.group(2)
    # 변환 규칙
    if "Project Gutenberg" in old_source:
        # 'Project Gutenberg pgXXXX' 또는 'Project Gutenberg · XXX tr.' 패턴
        tr_match = re.search(r"·\s*([^·]+?)\s*$", old_source)
        translator = tr_match.group(1).strip() if tr_match else ""
        if translator and "tr." in translator:
            new_source = f"소셜 마인드 자체 번역 (원본 PD · {translator})"
        else:
            new_source = "소셜 마인드 자체 번역 (원본 PD)"
    elif "한국고전번역원" in old_source:
        # toegye-jeonseo 또는 analects 등
        new_source = "소셜 마인드 자체 번역 (원본: 한국고전번역원 공공누리 1유형)"
    else:
        # 알 수 없는 패턴은 prefix만 추가
        new_source = f"소셜 마인드 자체 번역 (원본: {old_source})"
    new = pattern.sub(lambda mm: mm.group(1) + new_source + mm.group(3), new, count=1)
    changed.append(f"  {bid}: {old_source!r} → {new_source!r}")

BOOKS_TS.write_text(new, encoding="utf-8")
print(f"수정 {len(changed)}건:")
for c in changed:
    print(c)
