#!/usr/bin/env bash
# Установка всего, что нужно для монтажа: bash setup/install.sh
# macOS (Homebrew) или Linux (apt). Ставит только недостающее. ~2 ГБ: модель речи, зависимости, медиатека.
set -euo pipefail
cd "$(dirname "$0")/.."
ok() { printf "  ✓ %s\n" "$1"; }
step() { printf "\n▸ %s\n" "$1"; }
has() { command -v "$1" >/dev/null 2>&1; }

OS="$(uname -s)"
step "Программы"
if [ "$OS" = "Darwin" ]; then
  if ! has brew; then
    echo "Нужен Homebrew (менеджер программ для Mac). Открой Терминал, вставь строку ниже, введи пароль от Mac и перезапусти установку:"
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 1
  fi
  for pkg in ffmpeg whisper-cpp node pnpm uv; do
    bin="$pkg"; [ "$pkg" = "whisper-cpp" ] && bin="whisper-cli"
    if has "$bin"; then ok "$pkg уже есть"; else brew install "$pkg" && ok "$pkg"; fi
  done
elif [ "$OS" = "Linux" ]; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  need=""
  for b in ffmpeg git cmake g++ curl unzip; do has "$b" || need="$need $b"; done
  [ -n "$need" ] && $SUDO apt-get update -y && $SUDO apt-get install -y ffmpeg git cmake build-essential curl unzip
  if ! has node; then curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO bash - && $SUDO apt-get install -y nodejs; fi
  has pnpm || $SUDO npm install -g pnpm
  has uv || curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
  if ! has whisper-cli && [ ! -x tools/whisper.cpp/build/bin/whisper-cli ]; then
    git clone --depth 1 https://github.com/ggml-org/whisper.cpp tools/whisper.cpp
    cmake -S tools/whisper.cpp -B tools/whisper.cpp/build -DCMAKE_BUILD_TYPE=Release
    cmake --build tools/whisper.cpp/build -j --config Release --target whisper-cli
  fi
  ok "программы"
else
  echo "Эта система не поддерживается напрямую. На Windows поставь WSL (Ubuntu) и запусти установку внутри него."
  exit 1
fi

step "Зависимости монтажа (Remotion)"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "node_modules"

step "Python-окружение для проверки взгляда (mediapipe)"
if [ ! -x tools/.venv/bin/python ]; then
  uv venv tools/.venv --python 3.11 -q
fi
uv pip install -q -p tools/.venv/bin/python "mediapipe==0.10.14" opencv-python
ok "tools/.venv"

step "Модель распознавания речи (1,6 ГБ, один раз)"
mkdir -p models
M=models/ggml-large-v3-turbo.bin
if [ -s "$M" ] && [ "$(wc -c < "$M")" -gt 1500000000 ]; then ok "модель уже скачана"; else
  curl -L --fail -C - -o "$M" https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
  ok "модель"
fi

step "Медиатека: звуки и мемы (~160 МБ)"
python3 tools/library.py
mkdir -p inbox drafts final plans brand

printf "\nГотово. Дальше — анкета: python3 setup/anketa/server.py\n"
