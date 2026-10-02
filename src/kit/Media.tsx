import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { C, F, OUT, EASE, inOut, Z } from "./tokens";

/** Акцентный зум на лицо: резкий наезд 1 → 1,15–1,2 за 2–3 кадра, держать 0,8–1,2 с, плавный откат (или до склейки). */
export type Zoom = { at: number; dur?: number; scale?: number; hold?: boolean };

/** Говорящая голова. `face` — центр лица в долях кадра (по умолчанию чуть выше середины). */
export const Cam: React.FC<{ src: string; zooms?: Zoom[]; face?: { x: number; y: number }; muted?: boolean; bleep?: { from: number; to: number }[] }> = ({ src, zooms = [], face = { x: 0.5, y: 0.42 }, muted, bleep = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let s = 1;
  for (const z of zooms) {
    const dur = z.dur ?? 1, sc = z.scale ?? 1.17;
    if (t < z.at) continue;
    const inP = interpolate(t, [z.at, z.at + 0.09], [1, sc], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
    const drift = interpolate(t, [z.at, z.at + dur], [0, 0.015], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const back = z.hold ? sc : interpolate(t, [z.at + dur, z.at + dur + 0.35], [sc, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
    if (t <= z.at + dur) s = inP + drift;
    else if (!z.hold && t <= z.at + dur + 0.35) s = back;
    else if (z.hold) s = sc;
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${face.x * 100}% ${face.y * 100}%` }}>
        <Video src={staticFile(src)} muted={muted} volume={(fr) => (bleep.some((b) => fr / fps >= b.from && fr / fps <= b.to) ? 0 : 1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {/* запикивание мата: голос глушится, вместо него тон 1 кГц (public/kit/beep.wav) */}
      {bleep.map((b, i) => (
        <Sequence key={i} from={Math.round(b.from * fps)} durationInFrames={Math.max(1, Math.round((b.to - b.from) * fps))} layout="none">
          <Audio src={staticFile("kit/beep.wav")} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/**
 * Полноэкранная сцена: видео уходит целиком, жёсткая склейка без проявления (иначе лицо просвечивает).
 * Так закрываются куски «не в камеру». Контент — с первого кадра, без «секунды пустоты».
 */
export const Scene: React.FC<{ children: React.ReactNode; bg?: React.ReactNode }> = ({ children, bg }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    {bg}
    <AbsoluteFill style={{ padding: `${Z.top}px ${Z.side}px ${Z.bottom}px`, justifyContent: "center", alignItems: "center" }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

/**
 * Скриншот-доказательство: ЦЕЛИКОМ, крупно, с тенью; важное — лупой (увеличенный фрагмент рядом)
 * и обводкой на самом скрине. Обрезать до кусочка нельзя — теряется доказательность.
 * focus — область на скрине в долях: {x, y, w, h}.
 */
export const Shot: React.FC<{ src: string; dur: number; focus?: { x: number; y: number; w: number; h: number }; caption?: string; width?: number }> = ({ src, dur, focus, caption, width = Z.maxPanel }) => {
  const frame = useCurrentFrame();
  const a = inOut(frame, dur, 8, 6);
  const lens = interpolate(frame, [14, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: Z.top }}>
      <div style={{ position: "relative", width, opacity: a, transform: `translateY(${(1 - a) * 40}px) scale(${0.96 + a * 0.04})` }}>
        <Img src={staticFile(src)} style={{ width: "100%", borderRadius: 22, boxShadow: "0 30px 80px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08)", display: "block" }} />
        {focus ? (
          <>
            <div style={{ position: "absolute", left: `${focus.x * 100}%`, top: `${focus.y * 100}%`, width: `${focus.w * 100}%`, height: `${focus.h * 100}%`, border: `5px solid ${C.accent}`, borderRadius: 14, opacity: lens }} />
            <div style={{ position: "absolute", right: -30, bottom: -60, width: width * 0.62, aspectRatio: `${focus.w} / ${focus.h}`, maxHeight: 360, borderRadius: 20, overflow: "hidden", border: `5px solid ${C.accent}`, boxShadow: "0 24px 60px rgba(0,0,0,.6)", transform: `scale(${lens})`, transformOrigin: "100% 100%", background: "#000" }}>
              <Img src={staticFile(src)} style={{ position: "absolute", width: `${100 / focus.w}%`, left: `${(-focus.x / focus.w) * 100}%`, top: `${(-focus.y / focus.h) * 100}%` }} />
            </div>
          </>
        ) : null}
        {caption ? <div style={{ marginTop: 26, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.text, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{caption}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Мем из медиатеки (public/library/memes). cover — во весь экран с полосами (разрез со своим звуком),
 * иначе оверлей в верхней зоне без звука. Описание мемов — public/library/catalog.json.
 */
export const Meme: React.FC<{ file: string; cover?: boolean; sound?: boolean; from?: number }> = ({ file, cover, sound, from = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVideo = /\.(mp4|mov|webm)$/i.test(file);
  const src = staticFile(`library/${file}`);
  const a = cover ? 1 : interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp", easing: OUT });
  const media = isVideo ? (
    <Video src={src} trimBefore={Math.round(from * fps)} muted={!sound} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  ) : (
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  );
  if (cover) return <AbsoluteFill style={{ background: "#000" }}>{media}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: Z.top }}>
      <div style={{ width: Z.maxPanel * 0.86, aspectRatio: "16 / 10", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,.6)", border: `4px solid ${C.text}`, transform: `scale(${0.85 + a * 0.15}) rotate(${(1 - a) * -4}deg)`, opacity: a, background: "#000" }}>{media}</div>
    </AbsoluteFill>
  );
};

/** Звуки: файл из public/library/sfx, время в секундах, громкость 0,09–0,16 (тихо, под голосом). */
export type Hit = { file: string; at: number; volume?: number };
export const Sfx: React.FC<{ hits: Hit[] }> = ({ hits }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {hits.map((h, i) => (
        <Sequence key={i} from={Math.round(h.at * fps)} layout="none">
          <Audio src={staticFile(`library/${h.file}`)} volume={h.volume ?? 0.12} />
        </Sequence>
      ))}
    </>
  );
};

/** Музыка под голосом — только если в анкете выбрано «вшивать». Тихо, с плавным входом и выходом. */
export const Music: React.FC<{ file: string; dur: number; volume?: number }> = ({ file, dur, volume = 0.07 }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      src={staticFile(`library/${file}`)}
      volume={(f) => volume * Math.min(interpolate(f, [0, fps], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [dur * fps - fps * 1.5, dur * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}
    />
  );
};
