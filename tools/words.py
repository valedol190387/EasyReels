"""Субтитры по плану: python3 tools/words.py plans/r01.json

Расшифровывает уже склеенный public/sourceNN.mp4 кусками — по блокам из mapNN.json
(whisper -ml 1 на каждом куске отдельно: внутри короткого куска тайминги слов точные,
на длинном файле они плывут на секунды). Слова из анкеты («что расшифровка путает»)
идут подсказкой в whisper; правки — FIX ниже + "fix" из плана ([регулярка, замена]).
Пишет src/data/wordsNN.json: [{start, end, text}].
"""
import json, pathlib, re, subprocess, sys
from config import DATA, PUBLIC, whisper_model, whisper_bin, terms, tmp

# Частые ошибки распознавания технических слов по-русски
FIX = [
    (r"^[Кк]од[- ]?код[аеу]?$", "Claude Code"), (r"^[Кк]лот[аеу]?$", "Claude"), (r"^[Кк]лад[аеу]?$", "Claude"),
    (r"^[Кк]лод[аеу]?$", "Claude"), (r"^[Кк]лод[ао]м$", "Claude"), (r"^CLOT$", "Claude"), (r"^Cloud$", "Claude"), (r"^Clot$", "Claude"),
    (r"^промд", "промпт"), (r"^промп$", "промпт"), (r"^[Нн]иронк", "нейронк"), (r"^гидхаб", "GitHub"), (r"^гид$", "git"),
    (r"^[Ии]и$", "ИИ"), (r"^[Чч]ат[- ]?[Гг]пт$", "ChatGPT"), (r"^[Кк]одекс[аеу]?$", "Codex"),
]


def whisper_words(wav, a, b, prompt):
    part = tmp("words_part.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", wav, str(part)], check=True)
    cmd = [whisper_bin(), "-m", whisper_model(), "-l", "ru", "-t", "8", "-ml", "1", "-sow", "-ojf", "-of", str(tmp("words_part")), str(part)]
    if prompt:
        cmd[1:1] = ["--prompt", prompt]
    subprocess.run(cmd, capture_output=True, check=True)
    d = json.loads(tmp("words_part.json").read_text(encoding="utf-8"))
    out = []
    for s in d.get("transcription", []):
        tx = s["text"].strip()
        if tx and not tx.startswith(("[", "(", "*")):
            out.append((a + s["offsets"]["from"] / 1000, a + s["offsets"]["to"] / 1000, tx))
    return out


def main():
    plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    nn = str(plan["id"])
    tm = json.loads((DATA / f"map{nn}.json").read_text(encoding="utf-8"))
    wav = str(tmp(f"source{nn}.wav"))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(PUBLIC / f"source{nn}.mp4"), "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    user_terms = terms()
    prompt = ", ".join(user_terms)
    fix = FIX + [(rf"^{re.escape(t.lower())}$", t) for t in user_terms] + [tuple(x) for x in plan.get("fix", [])]
    words = []
    for m in tm:
        a, b = m["dst"], m["dst"] + m["len"]
        for t0, t1, tx in whisper_words(wav, a, b, prompt):
            core, tail = re.match(r"^(.*?)([.,!?…:;»\"]*)$", tx).groups()
            for p, r in fix:
                core = re.sub(p, r, core)
            tx = (core + tail if core else "").replace('"', "")
            if not tx.strip():
                continue
            words.append({"start": round(min(t0, b - 0.1), 3), "end": round(min(max(t1, t0 + 0.08), b), 3), "text": tx})
    # «код код», «клод код» — это Claude Code
    for i in range(len(words) - 1):
        ca = re.sub(r"[^\wА-Яа-яЁё]", "", words[i]["text"]).lower()
        cb = re.sub(r"[^\wА-Яа-яЁё]", "", words[i + 1]["text"]).lower()
        if ca in {"код", "клад", "клот", "клод", "claude", "cloud", "clot"} and re.match(r"^(код|кот|code)", cb):
            words[i]["text"] = "Claude"
            words[i + 1]["text"] = "Code" + re.match(r"^.*?([.,!?…:;»\"]*)$", words[i + 1]["text"]).group(1)
    for i, w in enumerate(words):
        if (i == 0 or re.search(r"[.!?]$", words[i - 1]["text"])) and w["text"][:1].islower():
            w["text"] = w["text"][0].upper() + w["text"][1:]
    (DATA / f"words{nn}.json").write_text(json.dumps(words, ensure_ascii=False, indent=0), encoding="utf-8")
    print(len(words), "слов")
    print(" ".join(w["text"] for w in words))


if __name__ == "__main__":
    main()
