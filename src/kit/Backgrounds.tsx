import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./tokens";

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
