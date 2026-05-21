"""모든 챕터 JSON에 originalLangCode 백필.

ReaderBody.originalStyle()이 lang 코드에 따라 serif/italic 스타일을 적용한다.
22권 신규 등재 책은 originalLangCode 필드가 null/누락이라 스타일 적용 안 됨.

매핑:
  originalLang in {en, english}              → english
  originalLang in {Greek, 고대 그리스어, greek} → greek
  originalLang in {Latin, 라틴어, latin}       → latin
  originalLang in {한문, hanja}                 → hanja
"""
import json, sys, pathlib
sys.stdout.reconfigure(encoding="utf-8")
ROOT = pathlib.Path(__file__).parent.parent / "public" / "content" / "books"

NORMALIZE = {
    "en": "english", "english": "english", "English": "english",
    "Greek": "greek", "greek": "greek", "고대 그리스어": "greek",
    "Latin": "latin", "latin": "latin", "라틴어": "latin",
    "한문": "hanja", "hanja": "hanja", "Hanja": "hanja",
}
LABEL = {"english": "영어", "greek": "고대 그리스어", "latin": "라틴어", "hanja": "한문"}

fixed = 0
seen_codes = set()
for chap in sorted(ROOT.rglob("*.json")):
    d = json.loads(chap.read_text(encoding="utf-8"))
    current = d.get("originalLangCode")
    orig_lang = d.get("originalLang") or ""
    if current and current in {"english", "greek", "latin", "hanja"}:
        seen_codes.add(current); continue

    code = NORMALIZE.get(orig_lang)
    if not code:
        # 추론: paragraph 내용 첫 글자가 라틴 문자면 english로 가정
        paras = d.get("paragraphs") or []
        sample = (paras[0].get("original") if paras else "") or ""
        if not sample:
            sample = (paras[1].get("original") if len(paras) > 1 else "") or ""
        code = "english" if sample and sample[0].isascii() else "hanja"

    d["originalLangCode"] = code
    if not d.get("originalLangs"):
        d["originalLangs"] = [{"code": code, "label": LABEL.get(code, code)}]
    chap.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    seen_codes.add(code)
    fixed += 1
    print(f"  {chap.parent.name}/{chap.name} → {code}")

print()
print(f"백필 {fixed}건 / 감지된 코드 {sorted(seen_codes)}")
