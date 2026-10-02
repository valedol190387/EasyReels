"""Анкета автора: python3 setup/anketa/server.py

Открывает страницу настройки в браузере. Ответы — в profile.json в корне проекта,
файлы (аватар, логотип, дизайн-система, референсы) — в brand/.
После «Сохранить» сервер сам закрывается, и агент продолжает работу.
Только стандартная библиотека Python 3.9+, без установки пакетов.
"""
import base64, json, pathlib, re, socket, sys, threading, webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PROFILE = ROOT / "profile.json"
BRAND = ROOT / "brand"
MAX_FILE = 60 * 1024 * 1024


def safe_name(name: str) -> str:
    name = pathlib.Path(name).name
    name = re.sub(r"[^\w.\-() ]+", "_", name, flags=re.UNICODE).strip(" .")
    return name or "file"


def write_file(sub: str, item: dict) -> str:
    data = base64.b64decode(item["data"].split(",", 1)[-1])
    if len(data) > MAX_FILE:
        raise ValueError(f"файл {item.get('name')} больше 60 МБ")
    folder = BRAND / sub if sub else BRAND
    folder.mkdir(parents=True, exist_ok=True)
    name = safe_name(item.get("save_as") or item.get("name") or "file")
    (folder / name).write_bytes(data)
    return str((folder / name).relative_to(ROOT))


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send(self, code, body, ctype="application/json; charset=utf-8"):
        b = body if isinstance(body, bytes) else body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/index.html"):
            return self.send(200, (HERE / "index.html").read_bytes(), "text/html; charset=utf-8")
        if path == "/profile.json":
            return self.send(200, PROFILE.read_bytes() if PROFILE.exists() else b"{}")
        if path.startswith("/brand/"):
            f = (ROOT / path.lstrip("/")).resolve()
            if f.is_file() and BRAND.resolve() in f.parents:
                ext = f.suffix.lower()
                ctype = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml"}.get(ext, "application/octet-stream")
                return self.send(200, f.read_bytes(), ctype)
        self.send(404, '{"error":"not found"}')

    def do_POST(self):
        if self.path != "/save":
            return self.send(404, '{"error":"not found"}')
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            profile, files = body["profile"], body.get("files", {})
            style = profile.setdefault("style", {})
            for key, sub in (("avatar", ""), ("logo", "")):
                if files.get(key):
                    item = files[key]
                    item["save_as"] = key + pathlib.Path(item["name"]).suffix.lower()
                    style[key] = write_file(sub, item)
            if files.get("design"):
                style["design_files"] = [write_file("design", it) for it in files["design"]]
            if files.get("refs"):
                style["ref_files"] = style.get("ref_files", []) + [write_file("refs", it) for it in files["refs"]]
            PROFILE.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as e:  # ошибку показываем на странице, сервер не падает
            return self.send(400, json.dumps({"error": str(e)}, ensure_ascii=False))
        self.send(200, json.dumps({"ok": True, "path": str(PROFILE.relative_to(ROOT))}))
        threading.Timer(1.0, self.server.shutdown).start()


def free_port(start=4321):
    for p in range(start, start + 50):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", p)):
                return p
    return 0


def main():
    port = free_port()
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    print(f"Анкета открыта: {url}\nЗаполни и нажми «Сохранить» — окно можно закрыть, ответы будут в profile.json.", flush=True)
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    srv.serve_forever()
    print(f"Сохранено: {PROFILE}")


if __name__ == "__main__":
    main()
