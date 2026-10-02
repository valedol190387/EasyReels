"""Расшифровка сырого видео для плана резки: python3 tools/transcribe.py inbox/видео.mov 01

Видео режется на фразы по настоящим паузам в звуке (тишина ≤ −45 dB дольше 0,28 с),
и КАЖДАЯ фраза расшифровывается отдельно. Так таймкоды точные по всему файлу:
у whisper на длинном файле время слов к концу уезжает на секунды — по нему резать нельзя.

  work/raw01.txt   — «начало–конец  текст» по фразам, между ними — длина паузы.
  work/raw01.json  — то же списком [{start, end, text}] — границы блоков плана берутся отсюда.

Резать внутри фразы (выкинуть «ну и», оборвать перед повтором):
  python3 tools/transcribe.py inbox/видео.mov 01 --words 42.0 48.5
  → каждое слово этого куска со временем (на коротком куске тайминги слов точные).
"""
import array, json, math, pathlib, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
from config import ROOT, whisper_model, whisper_bin, terms, tmp

SIL_DB, SIL_LEN, PAD = -45.0, 0.28, 0.05


def phrases(wav):
    w = wave.open(str(wav))
    sr = w.getframerate()
    x = array.array("h", w.readframes(w.getnframes()))
    n = int(sr * 0.02)
    quiet = [10 * math.log10(sum(v * v for v in x[i:i + n]) / n / 32768 ** 2 + 1e-12) <= SIL_DB for i in range(0, len(x) - n, n)]
    out, st, sil = [], None, 0
    for j, q in enumerate(quiet + [True] * 20):
        t = j * 0.02
        if not q:
            if st is None:
                st = t
            sil = 0
        else:
            sil += 1
            if st is not None and sil * 0.02 >= SIL_LEN:
                end = t - sil * 0.02 + 0.02
                if end - st > 0.15:
                    out.append([round(st, 2), round(end, 2)])
                st = None
    return out, len(x) / sr


def words_in(norm, a, b):
    part = tmp("words_in.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(norm), str(part)], check=True)
    subprocess.run([whisper_bin(), "-m", whisper_model(), "-l", "ru", "-ml", "1", "-sow", "-ojf", "-of", str(tmp("words_in")), str(part)], capture_output=True, check=True)
    d = json.loads(tmp("words_in.json").read_text(encoding="utf-8"))
    print(" ".join(f"{x['text'].strip()}@{a + x['offsets']['from'] / 1000:.2f}–{a + x['offsets']['to'] / 1000:.2f}" for x in d["transcription"] if x["text"].strip()))


def main():
    src, nn = pathlib.Path(sys.argv[1]), sys.argv[2]
    src = src if src.is_absolute() else ROOT / src
    wav = tmp(f"{src.stem}.16k.wav")  # тот же кэш, что у cut.py и dupcheck.py
    if not wav.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
    if "--words" in sys.argv:
        i = sys.argv.index("--words")
        norm = tmp(f"raw{nn}.norm.wav")
        if not norm.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16", "-ar", "16000", str(norm)], check=True)
        return words_in(norm, float(sys.argv[i + 1]), float(sys.argv[i + 2]))
    norm = tmp(f"raw{nn}.norm.wav")  # для распознавания — с выровненной громкостью
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16", "-ar", "16000", str(norm)], check=True)
    ph, total = phrases(wav)
    model, wbin = whisper_model(), whisper_bin()
    prompt = ", ".join(terms())

    def run(i_ab):
        i, (a, b) = i_ab
        part = tmp(f"raw{nn}_p{i:04d}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, a - PAD):.3f}", "-to", f"{b + PAD:.3f}", "-i", str(norm), str(part)], check=True)
        cmd = [wbin, "-m", model, "-l", "ru", "-t", "4", "-nt", "-np"] + (["--prompt", prompt] if prompt else []) + [str(part)]
        txt = " ".join(subprocess.run(cmd, capture_output=True, text=True).stdout.split())
        part.unlink(missing_ok=True)
        return {"start": a, "end": b, "text": txt}

    with ThreadPoolExecutor(max_workers=3) as ex:
        rows = [r for r in ex.map(run, enumerate(ph)) if r["text"] and not r["text"].startswith(("[", "("))]
    tmp(f"raw{nn}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=0), encoding="utf-8")
    lines, prev = [], 0.0
    for r in rows:
        gap = r["start"] - prev
        if gap >= 0.7:
            lines.append(f"          · пауза {gap:.1f} с")
        lines.append(f"{r['start']:7.2f}–{r['end']:7.2f}  {r['text']}")
        prev = r["end"]
    tmp(f"raw{nn}.txt").write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))
    print(f"\n{len(rows)} фраз, {total:.0f} с → work/raw{nn}.txt, work/raw{nn}.json")


if __name__ == "__main__":
    main()
