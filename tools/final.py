"""Финальный рендер: python3 tools/final.py plans/r01.json

Рендерит композицию Reel<NN> в 1080×1920 в полном качестве (PNG-кадры, crf 13),
затем выравнивает громкость под соцсети (−14 LUFS) — видео не перекодируется.
→ final/01 — <название> (финал).mp4. Второй проход «чтобы файл был легче» не делать.
"""
import json, pathlib, subprocess, sys
from config import ROOT, FINAL, tmp


def main():
    plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    nn = str(plan["id"])
    raw = tmp(f"final{nn}.mp4")
    subprocess.run(["pnpm", "exec", "remotion", "render", f"Reel{nn}", str(raw), "--crf=13", "--image-format=png"], cwd=ROOT, check=True)
    dst = FINAL / f"{nn} — {plan.get('title', 'ролик')} (финал).mp4".replace("/", "-")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(dst)], check=True)
    print(dst.relative_to(ROOT))


if __name__ == "__main__":
    main()
