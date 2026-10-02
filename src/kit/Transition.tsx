import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, OUT } from "./tokens";

/**
 * Вход полноэкранной сцены — основной приём вместо перехода: склейка жёсткая, а сама сцена
 * въезжает за 7 кадров (наезд 1.08 → 1 и сдвиг снизу). Никаких вспышек и затемнений.
 *   <Sequence …><Enter><Counter …/></Enter></Sequence>
 */
export const Enter: React.FC<{ children: React.ReactNode; from?: "up" | "zoom" | "left" }> = ({ children, from = "zoom" }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const t = from === "up" ? `translateY(${(1 - p) * 140}px)` : from === "left" ? `translateX(${(1 - p) * 160}px)` : `scale(${1.08 - 0.08 * p})`;
  // подложка непрозрачна с первого кадра — лицо сквозь сцену не просвечивает (жёсткая склейка)
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: t, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Переход поверх стыка — редко, на смене темы. Sequence from = стык − 5 кадров, длина 10.
 * whip — размытая полоса акцента проходит наискось; slide — шторка цветом фона. Без моргания.
 */
export const Transition: React.FC<{ type?: "whip" | "slide" | "circle" | "bars"; dur?: number }> = ({ type = "whip", dur = 10 }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, dur], [-130, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (type === "circle") {
    // TR-04 круг: акцентный круг раскрывается из центра и тут же уходит кольцом
    const r = interpolate(f, [0, dur / 2], [0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
    const hole = interpolate(f, [dur / 2, dur], [0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
    return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent ${hole}%, ${C.accent} ${hole}%, ${C.accent} ${r}%, transparent ${r}%)` }} />;
  }
  if (type === "bars") {
    // TR-02 пиксельные полосы: 8 полос заезжают ступенькой и уезжают дальше
    return (
      <AbsoluteFill>
        {Array.from({ length: 8 }, (_, i) => {
          const d = (i % 4) * 0.8;
          const pos = interpolate(f, [d, d + dur * 0.8], [-105, 105], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <div key={i} style={{ position: "absolute", top: `${i * 12.5}%`, height: "12.6%", width: "100%", background: i % 2 ? C.bg : C.accent, transform: `translateX(${pos}%)` }} />;
        })}
      </AbsoluteFill>
    );
  }
  if (type === "slide") {
    return <AbsoluteFill style={{ background: C.bg, transform: `translateX(${x}%)` }} />;
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", bottom: "-20%", width: "55%", left: `${x + 22}%`, transform: "skewX(-14deg)", background: `linear-gradient(90deg, transparent, ${C.accent}cc 35%, ${C.accent2}cc 65%, transparent)`, filter: "blur(18px)" }} />
    </AbsoluteFill>
  );
};
