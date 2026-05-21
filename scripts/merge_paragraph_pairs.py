"""모든 책의 챕터 JSON에서 'original만 → ko만' 인접 paragraph 쌍을 한 paragraph로 병합."""
import json, os, sys, pathlib
sys.stdout.reconfigure(encoding="utf-8")
ROOT = pathlib.Path(__file__).parent.parent / "public" / "content" / "books"


def merge(paragraphs):
    out, i = [], 0
    pid = 0
    while i < len(paragraphs):
        p = paragraphs[i]
        if p.get("highlight"):
            pid += 1
            np = {**p, "id": f"p{pid}"}
            out.append(np); i += 1; continue
        orig = (p.get("original") or "").strip()
        ko = (p.get("ko") or "").strip()
        if orig and not ko and i + 1 < len(paragraphs):
            nxt = paragraphs[i + 1]
            if (not nxt.get("highlight")
                and not (nxt.get("original") or "").strip()
                and (nxt.get("ko") or "").strip()):
                pid += 1
                out.append({"id": f"p{pid}", "original": orig, "ko": nxt["ko"].strip()})
                i += 2
                continue
        pid += 1
        out.append({**p, "id": f"p{pid}"})
        i += 1
    return out


def main():
    total_books = 0
    total_chapters = 0
    total_merges = 0
    for book_dir in sorted(ROOT.iterdir()):
        if not book_dir.is_dir(): continue
        total_books += 1
        for chap in sorted(book_dir.glob("*.json")):
            with open(chap, encoding="utf-8") as f:
                d = json.load(f)
            before = len(d.get("paragraphs", []))
            d["paragraphs"] = merge(d.get("paragraphs", []))
            after = len(d["paragraphs"])
            with open(chap, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
            total_chapters += 1
            merges = before - after
            if merges:
                total_merges += merges
                print(f"  {book_dir.name}/{chap.name}: {before} → {after} ({merges} 병합)")
    print()
    print(f"책 {total_books} / 챕터 {total_chapters} / 병합 {total_merges}쌍")


if __name__ == "__main__":
    main()
