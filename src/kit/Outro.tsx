import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bookmark, Plus, Send } from "lucide-react";
import { brand } from "../brand";
import { C, F, OUT, pop, textOn } from "./tokens";

export const OUTRO_SECONDS = 4;

/**
 * VR-02 Финальная заставка: аватар с «+», «Подпишись», чем занимаешься, кнопки, Telegram.
 * Всё из анкеты: ник, аватар, ниша, ссылки, кодовое слово. Субтитры на ней гасить.
 */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f, [d, d + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const tg = brand.leadTo.includes("telegram") && brand.telegramHandle;
  const kw = brand.codeword === "one" && brand.word;
  const btn = (icon: React.ReactNode, text: string, d: number, hot = false) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: hot ? C.accent : C.surface, color: hot ? textOn(C.accent) : textOn(C.surface), borderRadius: 22, padding: "22px 30px", fontFamily: F.text, fontWeight: 800, fontSize: 40, opacity: a(d), transform: `translateY(${(1 - a(d)) * 30}px)` }}>
      {icon}
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 100%, ${C.accent}55, transparent 70%), ${C.bg}`, alignItems: "center", justifyContent: "center", padding: "230px 110px 420px", gap: 30 }}>
      <div style={{ position: "relative", transform: `scale(${pop(f, 0)})` }}>
        {brand.avatar ? (
          <Img src={staticFile(brand.avatar)} style={{ width: 280, height: 280, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 0 8px ${C.accent}` }} />
        ) : (
          <div style={{ width: 280, height: 280, borderRadius: "50%", background: C.accent, display: "grid", placeItems: "center", fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 130, color: textOn(C.accent) }}>{(brand.name || brand.instagram || "Я").slice(0, 1).toUpperCase()}</div>
        )}
        <div style={{ position: "absolute", right: 6, bottom: 6, width: 84, height: 84, borderRadius: "50%", background: C.accent, border: `6px solid ${C.bg}`, display: "grid", placeItems: "center", color: textOn(C.accent), transform: `scale(${pop(f, 10)})` }}><Plus size={46} strokeWidth={3.2} /></div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 96, letterSpacing: -3, color: C.text, opacity: a(4) }}>Подпишись</div>
      {brand.handle ? <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 36, color: C.accent2, marginTop: -16, opacity: a(6) }}>{brand.handle}</div> : null}
      {brand.niche ? <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: C.text, opacity: 0.8 * a(8), textAlign: "center", maxWidth: 820 }}>{brand.niche}</div> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 760, marginTop: 10 }}>
        {kw ? btn(<Send size={40} />, `Напиши «${brand.word}» в комментах`, 12, true) : null}
        {btn(<Bookmark size={40} />, "Сохрани — пригодится", 14, !kw)}
        {tg ? btn(<Send size={40} />, `Telegram ${brand.telegramHandle}`, 16) : null}
      </div>
    </AbsoluteFill>
  );
};
