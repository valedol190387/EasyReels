"""Задвоенные заходы: python3 tools/dupcheck.py plans/r01.json  (запускать перед показом черновика)

Каждый блок плана в исходнике режется по паузам ≥ 0,28 с на фразы; каждая фраза
расшифровывается отдельно (на длинном куске whisper склеивает «и можешь… и можешь
без ограничений» в одну фразу, и дубль не виден). Флаг — если фраза повторяет начало
соседней (заход + перезаход) или в блоке пауза ≥ 0,7 с.
"""
import array, difflib, json, math, pathlib, re, subprocess, sys, wave
from config import ROOT, DATA, whisper_model, whisper_bin, tmp


def main():
    plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    nn = str(plan["id"])
    mp = json.loads((DATA / f"map{nn}.json").read_text(encoding="utf-8"))
    srcs = {int(k): str(pathlib.Path(v) if pathlib.Path(v).is_absolute() else ROOT / v) for k, v in plan["src"].items()}
    model, wbin = whisper_model(), whisper_bin()
    waves = {}
    for k, src in srcs.items():
        wav = tmp(pathlib.Path(src).stem + ".16k.wav")
        if not wav.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
        w = wave.open(str(wav))
        waves[k] = (str(wav), w.getframerate(), array.array("h", w.readframes(w.getnframes())))
    words = lambda s: re.findall(r"[а-яёa-z0-9%]+", s.lower())
    total = 0
    for bi, m in enumerate(mp):
        wav, sr, x = waves[m.get("file", 1)]
        n = int(sr * 0.02)
        db = lambda i: 10 * math.log10(sum(v * v for v in x[i:i + n]) / n / 32768 ** 2 + 1e-12)
        a, b = m["src"], m["src"] + m["rawlen"]
        q = [db(i) <= -45 for i in range(int(a * sr), int(b * sr) - n, n)]
        phr, st, sil, pauses = [], None, 0, []
        for j, s in enumerate(q + [True] * 15):
            t = a + j * 0.02
            if not s:
                if st is None:
                    st = t
                sil = 0
            else:
                sil += 1
                if st is not None and sil * 0.02 >= 0.28:
                    phr.append([st, t - sil * 0.02 + 0.02])
                    st = None
        for p1, p2 in zip(phr, phr[1:]):
            if p2[0] - p1[1] >= 0.7:
                pauses.append((round(p1[1], 2), round(p2[0], 2)))
        texts = []
        for p in phr:
            if p[1] - p[0] <= 0.15:
                continue
            part = tmp("dup_part.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(a, p[0] - 0.05):.3f}", "-to", f"{min(b, p[1] + 0.05):.3f}", "-i", wav, str(part)], check=True)
            out = subprocess.run([wbin, "-m", model, "-l", "ru", "-t", "8", "-nt", "-np", str(part)], capture_output=True, text=True).stdout
            texts.append((p[0], p[1], " ".join(out.split())))
        flags = []
        for (s1, e1, t1), (s2, e2, t2) in zip(texts, texts[1:]):
            w1, w2 = words(t1), words(t2)
            if len(w1) >= 2 and w2[:2] == w1[:2]:
                flags.append(f"заход {s1:.2f} «{t1}» → перезаход {s2:.2f}")
            elif len(w1) >= 2 and w2 and difflib.SequenceMatcher(None, w1, w2[:len(w1)]).ratio() > 0.7:
                flags.append(f"похоже на повтор {s1:.2f} «{t1}» / {s2:.2f} «{t2}»")
        print(f"[{bi}] в ролике {m['dst']:.2f}, исходник {a:.2f}–{b:.2f}  {str(m['note'])[:40]}")
        for s, e, t in texts:
            print(f"     {s:7.2f}–{e:7.2f} {t}")
        for p in pauses:
            print(f"   !! пауза {p[0]}–{p[1]} ({p[1] - p[0]:.2f} с)")
        for f in flags:
            print(f"   !! {f}")
        total += len(pauses) + len(flags)
    print(f"\nфлагов: {total}")


if __name__ == "__main__":
    main()
