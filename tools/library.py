"""Медиатека: python3 tools/library.py  (скачать, если нет) | --catalog (дописать новые файлы в каталог)

public/library/
  sfx/<категория>/*.mp3      — звуки (щелчки, свуши, бульки…)
  memes/*.mp4|jpg            — мемы, в catalog.json у каждого: что в кадре, теги, цитата
  music/<настроение>/*.mp3   — своя музыка (кладёшь сам, на свой страх и риск)
  catalog.json               — по нему агент выбирает вставку по смыслу

Пополнять просто: кинь файл в папку и запусти с --catalog — новые попадут в каталог
с тегом «new»; агент посмотрит кадр мема и сам подпишет, что в нём.
"""
import json, subprocess, sys, unicodedata, urllib.request, zipfile
from config import LIBRARY, PUBLIC, tmp

URL = "https://pub-e95674c24c574c7bbdd3f4c9c6a48d0e.r2.dev/library.zip"


def download():
    if (LIBRARY / "catalog.json").exists():
        print("медиатека уже есть:", LIBRARY)
        return
    z = tmp("library.zip")
    print("качаю медиатеку (~160 МБ)…", flush=True)
    req = urllib.request.Request(URL, headers={"User-Agent": "reels-kit"})
    with urllib.request.urlopen(req) as r, open(z, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    with zipfile.ZipFile(z) as zf:
        zf.extractall(PUBLIC)  # внутри архива папка library/
    z.unlink()
    (LIBRARY / "music").mkdir(exist_ok=True)
    print("готово:", LIBRARY)


def probe(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", str(p)],
                         capture_output=True, text=True).stdout
    d = json.loads(out or "{}")
    st = next((s for s in d.get("streams", []) if "width" in s), {})
    return round(float(d.get("format", {}).get("duration", 0) or 0), 2), st.get("width"), st.get("height")


def nfc(s: str) -> str:
    """macOS хранит кириллицу в именах файлов в разложенном виде (NFD) — сравниваем в NFC."""
    return unicodedata.normalize("NFC", s)


def catalog():
    path = LIBRARY / "catalog.json"
    cat = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"sfx": [], "memes": [], "music": []}
    for k in cat:
        for e in cat[k]:
            e["file"] = nfc(e["file"])
    known = {e["file"] for k in cat for e in cat[k]}
    added = 0
    for p in sorted(LIBRARY.rglob("*")):
        if not p.is_file() or p.name == "catalog.json" or p.name.startswith("."):
            continue
        rel = nfc(str(p.relative_to(LIBRARY)))
        if rel in known:
            continue
        kind = rel.split("/", 1)[0]
        ext = p.suffix.lower()
        if kind == "memes" and ext in (".mp4", ".mov", ".jpg", ".jpeg", ".png", ".webp"):
            dur, w, h = probe(p)
            row = {"id": p.stem, "kind": "video" if ext in (".mp4", ".mov") else "image", "file": rel, "what": "", "tags": "new", "w": w, "h": h}
            if row["kind"] == "video":
                row |= {"quote": "", "dur": dur}
            cat["memes"].append(row)
        elif kind == "sfx" and ext in (".mp3", ".wav"):
            cat["sfx"].append({"file": rel, "category": p.parent.name, "name": p.stem, "dur": probe(p)[0], "source": "свой"})
        elif kind == "music" and ext in (".mp3", ".wav", ".m4a"):
            cat["music"].append({"file": rel, "mood": p.parent.name, "title": p.stem, "dur": probe(p)[0],
                                 "rights": "добавлен автором — права на нём; чужой трек могут заглушить"})
        else:
            continue
        added += 1
    known_now = {nfc(str(p.relative_to(LIBRARY))) for p in LIBRARY.rglob("*") if p.is_file()}
    for k in cat:  # удалённые файлы — убрать из каталога
        cat[k] = [e for e in cat[k] if e["file"] in known_now]
    path.write_text(json.dumps(cat, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"каталог: {', '.join(f'{k} {len(v)}' for k, v in cat.items())}; новых {added}")
    new = [e["file"] for e in cat["memes"] if e.get("tags") == "new"]
    if new:
        print("новые мемы без описания (посмотреть кадр и заполнить what/tags/quote):", *new, sep="\n  ")


if __name__ == "__main__":
    if "--catalog" in sys.argv:
        catalog()
    else:
        download()
        catalog()
