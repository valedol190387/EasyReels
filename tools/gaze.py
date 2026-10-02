"""Где я не в камеру: tools/.venv/bin/python tools/gaze.py 01 [порог_поворота] [порог_взгляда]

Кадры public/sourceNN.mp4 по 4 в секунду → mediapipe FaceMesh → поворот головы
(yaw, относительно медианы по ролику — люди часто сидят чуть боком) и взгляд
(зрачки). Печатает отрезки дольше 0,4 с, где отклонение больше порога, и кладёт
лист кадров work/gazeNN.jpg — его надо посмотреть глазами, ложные срабатывания отбросить.
Можно передать путь к любому mp4 вместо номера (для проверки финала).
"""
import glob, math, pathlib, statistics, subprocess, sys
import cv2
import mediapipe as mp
from config import PUBLIC, tmp

STEP = 4.0


def main():
    arg = sys.argv[1]
    video = pathlib.Path(arg) if arg.endswith(".mp4") else PUBLIC / f"source{arg}.mp4"
    tag = pathlib.Path(arg).stem if arg.endswith(".mp4") else arg
    yaw_thr = float(sys.argv[2]) if len(sys.argv) > 2 else 0.35
    gaze_thr = float(sys.argv[3]) if len(sys.argv) > 3 else 0.22
    d = tmp(f"gaze_{tag}")
    d.mkdir(exist_ok=True)
    for f in d.glob("*.jpg"):
        f.unlink()
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={STEP},scale=540:-2", str(d / "f%05d.jpg")], check=True)
    mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, refine_landmarks=True, max_num_faces=1, min_detection_confidence=0.5)
    rows = []
    for i, f in enumerate(sorted(glob.glob(str(d / "f*.jpg")))):
        img = cv2.imread(f)
        h, w = img.shape[:2]
        res = mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        t = i / STEP
        if not res.multi_face_landmarks:
            rows.append((t, None, None))
            continue
        lm = res.multi_face_landmarks[0].landmark
        P = lambda k: (lm[k].x * w, lm[k].y * h)
        nose, lc, rc = P(1), P(234), P(454)
        yaw = math.log(max(nose[0] - lc[0], 1) / max(rc[0] - nose[0], 1))
        g = lambda iris, o, inner: (iris[0] - (o[0] + inner[0]) / 2) / max(abs(inner[0] - o[0]), 1)
        gaze = (g(P(468), P(33), P(133)) + g(P(473), P(362), P(263))) / 2
        rows.append((t, yaw, gaze))
    yaws = [y for _, y, _ in rows if y is not None]
    if not yaws:
        print("лицо не найдено ни в одном кадре")
        return
    med = statistics.median(yaws)
    bad = [(t, y is None or abs(y - med) > yaw_thr or abs(gz) > gaze_thr) for t, y, gz in rows]
    spans, st = [], None
    for t, b in bad + [(len(bad) / STEP, False)]:
        if b and st is None:
            st = t
        if not b and st is not None:
            if t - st >= 0.4:
                spans.append((st, t))
            st = None
    print(f"медиана поворота {med:.2f}; не в камеру: " + (", ".join(f"{a:.2f}–{b:.2f}" for a, b in spans) or "нет"))
    if spans:
        picks = [int((a + b) / 2 * STEP) + 1 for a, b in spans][:12]
        files = [str(d / f"f{p:05d}.jpg") for p in picks if (d / f"f{p:05d}.jpg").exists()]
        sheet = tmp(f"gaze{tag}.jpg")
        if len(files) > 1:
            subprocess.run(["ffmpeg", "-v", "error", "-y"] + sum([["-i", f] for f in files], []) +
                           ["-filter_complex", "".join(f"[{i}]scale=270:-2[s{i}];" for i in range(len(files))) +
                            "".join(f"[s{i}]" for i in range(len(files))) + f"hstack={len(files)}", str(sheet)], check=True)
        elif files:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", files[0], "-vf", "scale=270:-2", str(sheet)], check=True)
        print(f"лист кадров: {sheet}")


if __name__ == "__main__":
    main()
