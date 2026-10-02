"""Черновик резки: python3 tools/preview.py plans/r01.json

Рендерит CutPreview (склейка + живые субтитры + финальная заставка) в 720×1280
для согласования → drafts/01 — <название> (черновик).mp4. Графики нет — она после «ок».
"""
import json, pathlib, subprocess, sys
from config import ROOT, DATA, DRAFTS, tmp


def main():
    plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    nn = str(plan["id"])
    tm = json.loads((DATA / f"map{nn}.json").read_text(encoding="utf-8"))
    words = json.loads((DATA / f"words{nn}.json").read_text(encoding="utf-8"))
    seconds = tm[-1]["dst"] + tm[-1]["len"]
    props = tmp(f"cutprops{nn}.json")
    props.write_text(json.dumps({"src": f"source{nn}.mp4", "words": words, "seconds": seconds}, ensure_ascii=False), encoding="utf-8")
    name = f"{nn} — {plan.get('title', 'ролик')} (черновик).mp4".replace("/", "-")
    dst = DRAFTS / name
    subprocess.run(["pnpm", "exec", "remotion", "render", "CutPreview", str(dst), f"--props={props}",
                    "--scale=0.6667", "--crf=24", "--image-format=jpeg"], cwd=ROOT, check=True)
    print(dst.relative_to(ROOT))


if __name__ == "__main__":
    main()
