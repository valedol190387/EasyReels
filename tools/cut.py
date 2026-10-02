"""Резка ролика по плану: python3 tools/cut.py plans/r01.json [--run]

План (JSON):
  {"id": "01", "title": "Как я…", "src": {"1": "inbox/видео.mov"},
   "blocks": [[1, 12.34, 18.90, "хук"], ...], "fix": [], "speed": 1.2}
  speed можно не писать — возьмётся из анкеты.

Что делает:
  1. Подтягивает границы блоков к тишине по звуку исходника: конец — до первой
     паузы (≤ −45 dB дольше 0,2 с, не дальше 0,9 с), начало — чуть раньше, к концу
     предыдущей паузы (не дальше 0,3 с). Так не рубятся хвосты слов.
     Заметка блока начинается с «!» — границы не двигать (срезать вдох, тишину в начале).
  2. Снапит к кадрам, пишет карту времени src/data/mapNN.json.
  3. Один ffmpeg: trim/atrim каждого блока + фейды 12 мс на стыках → concat → темп
     (setpts + atempo) → чистка звука и loudnorm −14 → public/sourceNN.mp4.
     Поворот видео с айфона ffmpeg учитывает сам. С --run сразу запускает.
"""
import json, math, pathlib, subprocess, sys, wave, array, platform
from config import ROOT, FPS, DATA, PUBLIC, speed as profile_speed, tmp

SIL_DB, SIL_LEN, MAX_TAIL, MAX_HEAD = -45.0, 0.2, 0.9, 0.3
WIN = 0.02


def rms_track(src):
    """dB по окнам 20 мс (моно 16 кГц, кэш в work/)."""
    cache = tmp(pathlib.Path(src).stem + ".16k.wav")
    if not cache.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", str(cache)], check=True)
    with wave.open(str(cache)) as w:
        data = array.array("h", w.readframes(w.getnframes()))
    n = int(16000 * WIN)
    out = []
    for i in range(0, len(data) - n, n):
        seg = data[i:i + n]
        p = sum(x * x for x in seg) / n
        out.append(10 * math.log10(p / 32768 ** 2 + 1e-12))
    return out


def extend_end(db, b):
    i, need = int(b / WIN), int(SIL_LEN / WIN)
    for j in range(i, min(len(db) - need, i + int(MAX_TAIL / WIN))):
        if all(x <= SIL_DB for x in db[j:j + need]):
            return j * WIN + 0.04
    return b


def extend_start(db, a):
    i = int(a / WIN)
    for j in range(i, max(0, i - int(MAX_HEAD / WIN)), -1):
        if db[j] <= SIL_DB:
            return max(0.0, j * WIN)
    return a


def resolve(p):
    p = pathlib.Path(p)
    return str(p if p.is_absolute() else ROOT / p)


def main():
    plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    nn, speed = str(plan["id"]), float(plan.get("speed") or profile_speed())
    src = {int(k): resolve(v) for k, v in plan["src"].items()}
    tracks = {k: rms_track(v) for k, v in src.items()}
    snap_in = lambda t: int(t * FPS) / FPS
    snap_out = lambda t: math.ceil(t * FPS - 1e-9) / FPS
    blocks = []
    for f, a, b, note in plan["blocks"]:
        raw = plan.get("raw") or str(note).startswith("!")
        a2 = a if raw else extend_start(tracks[f], a)
        b2 = b if raw else extend_end(tracks[f], b)
        blocks.append((f, snap_in(a2), snap_out(b2), note, round(b2 - b, 2)))
    dst, timemap = 0.0, []
    for f, a, b, n, ext in blocks:
        timemap.append({"file": f, "src": a, "dst": round(dst / speed, 3), "len": round((b - a) / speed, 3),
                        "raw": round(dst, 3), "rawlen": round(b - a, 3), "note": n})
        dst += b - a
    (DATA / f"map{nn}.json").write_text(json.dumps(timemap, ensure_ascii=False, indent=1), encoding="utf-8")
    inputs, vf, af = [], [], []
    for i, (f, a, b, _, _) in enumerate(blocks):
        nfr = round((b - a) * FPS)
        inputs += ["-ss", f"{max(a - 1, 0):.4f}", "-i", src[f]]
        off = min(1.0, a)
        vf.append(f"[{i}:v]trim=start={off}:end={off + nfr / FPS:.6f},setpts=PTS-STARTPTS,fps={FPS},"  # по времени — любой fps исходника
                  f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v{i}]")
        af.append(f"[{i}:a]atrim=start={off}:end={off + nfr / FPS:.6f},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.012,"
                  f"afade=t=out:st={nfr / FPS - 0.012:.6f}:d=0.012[a{i}]")
    n = len(blocks)
    concat = "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc0][ac];[vc0]setpts=PTS/{speed}[vc]"
    audio = (f"[ac]atempo={speed},highpass=f=85,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=3,"
             "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.95[a]")
    out = PUBLIC / f"source{nn}.mp4"
    hw = ["-hwaccel", "videotoolbox"] if platform.system() == "Darwin" else []
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"] + hw + inputs + [
        "-filter_complex", ";".join(vf + af + [concat, audio]), "-map", "[vc]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(out)]
    print(f"{dst:.2f} с → {dst / speed:.2f} с при темпе {speed}")
    for m, (_, _, _, _, ext) in zip(timemap, blocks):
        print(f"  в ролике {m['dst']:6.2f}  [{m['file']}] исходник {m['src']:7.2f} +{m['rawlen']:5.2f}  хвост +{ext:.2f}  {m['note']}")
    if "--run" in sys.argv:
        subprocess.run(cmd, check=True)
        print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
