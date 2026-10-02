import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "./tokens";

/** BG-01 Сетка — плывёт вниз, зациклена. */
export const BgGrid: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 1.2) % 90}px`, opacity: 0.55 }} />
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 45%, transparent, ${C.bg})` }} />
    </AbsoluteFill>
  );
};

/** BG-02 Жар снизу — тёплое свечение акцентом, медленно дышит. */
export const BgHeat: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 40) * 8, y = 92 + Math.cos(f / 50) * 4;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 45% at ${x}% ${y}%, ${C.accent}66, transparent 70%), radial-gradient(60% 35% at ${100 - x}% 100%, ${C.accent2}33, transparent 70%), ${C.bg}` }} />
  );
};

/** BG-06 Скан-линии — полоса света проходит сверху вниз. */
export const BgScan: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 2px, transparent 2px 6px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, height: 60, top: `${((f * 14) % 2400) - 240}px`, background: `linear-gradient(transparent, ${C.accent}55, transparent)` }} />
    </AbsoluteFill>
  );
};

/** BG-07 Огонь — акцентный слайд с точечной сеткой (для ударных цифр и заголовков). */
export const BgFire: React.FC = () => (
  <AbsoluteFill style={{ background: C.accent, backgroundImage: "radial-gradient(rgba(0,0,0,.18) 3px, transparent 3.5px)", backgroundSize: "44px 44px" }} />
);

/** BG-03 Код-поток — строки кода медленно ползут вверх. lines — свои строки под тему ролика. */
export const BgCode: React.FC<{ lines?: string[] }> = ({ lines = ["const bot = new Bot(TOKEN)", "bot.on('start', greet)", "funnel.step('lead', 0.24)", "await db.insert(user)", "sw.register('/sw.js')", "if (paid) club.grant(id)", "deploy --prod", "webhook.listen(3000)"] }) => {
  const f = useCurrentFrame();
  const rows = Array.from({ length: 60 }, (_, i) => lines[i % lines.length]);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 90, top: -((f * 1.4) % (rows.length * 13)), fontFamily: F.mono, fontSize: 30, lineHeight: "52px", color: C.text, opacity: 0.16, whiteSpace: "pre" }}>
        {rows.concat(rows).map((l, i) => <div key={i} style={{ color: i % 7 === 3 ? C.accent : undefined, opacity: i % 7 === 3 ? 2.5 : 1 }}>{l}</div>)}
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(${C.bg}, transparent 25%, transparent 75%, ${C.bg})` }} />
    </AbsoluteFill>
  );
};

/** BG-04 Бегущий текст — три наклонные строки контурного текста едут в разные стороны. */
export const BgMarquee: React.FC<{ words?: string[] }> = ({ words = ["ВАЙБКОДИНГ", "БОТЫ", "PWA", "АВТОВОРОНКИ"] }) => {
  const f = useCurrentFrame();
  const line = (words.join(" · ") + " · ").repeat(4);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: "rotate(-12deg) scale(1.3)", justifyContent: "center", gap: 30 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ whiteSpace: "nowrap", fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 170, letterSpacing: -4, color: i === 1 ? "transparent" : C.line, WebkitTextStroke: i === 1 ? `3px ${C.accent}` : undefined, transform: `translateX(${(i % 2 ? 1 : -1) * ((f * 4) % 1400) - 700}px)`, opacity: i === 1 ? 0.9 : 0.8 }}>{line}</div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** BG-05 Пиксели — сетка и мигающие квадраты, как в аватаре. */
export const BgPixels: React.FC = () => {
  const f = useCurrentFrame();
  const cells = Array.from({ length: 14 }, (_, i) => ({ x: (i * 397) % 1000 + 40, y: (i * 613) % 1800 + 60, c: i % 5 === 0 ? C.accent2 : i % 3 === 0 ? C.accent : "#3a3a40", ph: i * 7 }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: "270px 270px", opacity: 0.6 }} />
      {cells.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 64, height: 64, background: c.c, opacity: Math.max(0, Math.sin((f + c.ph) / 9)) }} />)}
    </AbsoluteFill>
  );
};

/** BG-08 Оверлей «камера» — уголки видоискателя, REC и таймкод поверх B-roll или головы. */
export const CamRec: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const f = useCurrentFrame();
  const t = start + f / 30, hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60, ss = Math.floor(t) % 60, ff = Math.floor((t % 1) * 30);
  const p = (n: number) => String(n).padStart(2, "0");
  const corner = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 90, height: 90, borderColor: "#fff", borderStyle: "solid", borderWidth: 0, ...s }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {corner({ left: 90, top: 260, borderLeftWidth: 5, borderTopWidth: 5 })}
      {corner({ right: 90, top: 260, borderRightWidth: 5, borderTopWidth: 5 })}
      {corner({ left: 90, bottom: 460, borderLeftWidth: 5, borderBottomWidth: 5 })}
      {corner({ right: 90, bottom: 460, borderRightWidth: 5, borderBottomWidth: 5 })}
      <div style={{ position: "absolute", left: 130, top: 300, display: "flex", alignItems: "center", gap: 14, fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.accent, opacity: Math.floor(f / 15) % 2 ? 0.25 : 1 }} />REC
      </div>
      <div style={{ position: "absolute", left: 130, bottom: 500, fontFamily: F.mono, fontSize: 30, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{p(hh)}:{p(mm)}:{p(ss)}:{p(ff)}</div>
    </AbsoluteFill>
  );
};
