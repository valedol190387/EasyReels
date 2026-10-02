"""Общие настройки инструментов: пути проекта, анкета автора, модель расшифровки."""
import json, os, pathlib, shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
FPS = 30
PROFILE_PATH = ROOT / "profile.json"
DATA = ROOT / "src" / "data"
PUBLIC = ROOT / "public"
LIBRARY = PUBLIC / "library"
DRAFTS = ROOT / "drafts"
FINAL = ROOT / "final"
WORK = ROOT / "work"
for d in (DATA, PUBLIC, DRAFTS, FINAL, WORK):
    d.mkdir(parents=True, exist_ok=True)


def profile() -> dict:
    """Ответы анкеты (profile.json). Нет файла — пустой словарь, везде берутся значения по умолчанию."""
    try:
        return json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}


def speed() -> float:
    return float(profile().get("cut", {}).get("speed", 1.2) or 1)


def terms() -> list:
    """Слова, которые расшифровка путает (из анкеты) — подсказка whisper."""
    return [t for t in profile().get("subs", {}).get("terms", []) if t]


def whisper_model() -> str:
    m = os.environ.get("WHISPER_MODEL") or str(ROOT / "models" / "ggml-large-v3-turbo.bin")
    if not pathlib.Path(m).exists():
        raise SystemExit(f"нет модели whisper: {m} — запусти setup/install.sh")
    return m


def whisper_bin() -> str:
    local = ROOT / "tools" / "whisper.cpp" / "build" / "bin" / "whisper-cli"  # Linux: собран установкой
    if local.exists():
        return str(local)
    for name in ("whisper-cli", "whisper-cpp"):
        if shutil.which(name):
            return name
    raise SystemExit("нет whisper-cli — запусти setup/install.sh")


def tmp(name: str) -> pathlib.Path:
    return WORK / name
