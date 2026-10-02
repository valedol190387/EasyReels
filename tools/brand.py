"""Анкета → монтаж: python3 tools/brand.py

Читает profile.json и пишет src/brand.ts — ник, ссылки, цвета, шрифты, аватар, призыв,
стиль субтитров. Все компоненты графики берут оформление только оттуда.
Аватар и логотип копируются в public/brand/. Запускать после каждой анкеты.
"""
import json, shutil
from config import ROOT, PUBLIC, profile

DEFAULT_COLORS = {"bg": "#0B0B0C", "surface": "#151517", "text": "#F5EDE0", "accent": "#FF4D2E", "accent2": "#FFB627"}
FONTS = {"kitchen": ("Unbounded", "Manrope"), "modern": ("Montserrat", "Inter"),
         "editorial": ("Playfair Display", "Manrope"), "tech": ("Russo One", "JetBrains Mono")}


TYPE = """export type Brand = {
  name: string; instagram: string; handle: string; niche: string;
  links: Partial<Record<"youtube" | "telegram" | "tiktok" | "vk" | "site", string>>;
  telegramHandle: string; leadTo: string[];
  colors: { bg: string; surface: string; text: string; accent: string; accent2: string };
  fonts: { display: string; text: string; mono: string };
  avatar: string; logo: string;
  outro: boolean; codeword: string; word: string; offer: string;
  subs: { style: string; caps: boolean };
  sfx: boolean; music: string; speed: number;
};
"""


def asset(rel):
    """brand/avatar.png → public/brand/avatar.png, вернуть путь для staticFile."""
    if not rel:
        return ""
    src = ROOT / rel
    if not src.exists():
        return ""
    dst = PUBLIC / "brand" / src.name
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    return f"brand/{src.name}"


def handle_from(url, prefix):
    u = (url or "").strip().rstrip("/")
    if not u:
        return ""
    tail = u.split("/")[-1].lstrip("@")
    return prefix + tail if tail else ""


def main():
    p = profile()
    a, st, cta, subs, sound, cut = (p.get(k, {}) for k in ("author", "style", "cta", "subs", "sound", "cut"))
    links = {k: v for k, v in (a.get("links") or {}).items() if v}
    display, text = FONTS.get(st.get("fonts", "kitchen"), FONTS["kitchen"])
    brand = {
        "name": a.get("name") or "",
        "instagram": a.get("instagram") or "",
        "handle": "@" + a["instagram"] if a.get("instagram") else "",
        "niche": a.get("niche") or "",
        "links": links,
        "telegramHandle": handle_from(links.get("telegram"), "@"),
        "leadTo": a.get("lead_to") or ["follow"],
        "colors": {**DEFAULT_COLORS, **(st.get("colors") or {})},
        "fonts": {"display": display, "text": text, "mono": "JetBrains Mono"},
        "avatar": asset(st.get("avatar")),
        "logo": asset(st.get("logo")),
        "outro": cta.get("outro", True),
        "codeword": cta.get("codeword", "none"),
        "word": cta.get("word") or "",
        "offer": cta.get("offer") or "",
        "subs": {"style": subs.get("style", "karaoke"), "caps": bool(subs.get("caps", False))},
        "sfx": sound.get("sfx", True),
        "music": sound.get("music", "none"),
        "speed": cut.get("speed", 1.2),
    }
    body = json.dumps(brand, ensure_ascii=False, indent=2)
    (ROOT / "src" / "brand.ts").write_text(
        "// Сгенерировано tools/brand.py из profile.json — руками не править, перезапусти анкету.\n"
        + TYPE + f"export const brand: Brand = {body};\n", encoding="utf-8")
    print("src/brand.ts обновлён:", brand["handle"] or "(без ника)", "·", display, "+", text, "·", brand["colors"]["accent"])


if __name__ == "__main__":
    main()
