import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { Bot } from "lucide-react";
import { C, F, Z, OUT, fit, inOut, textOn } from "./tokens";
import { BgGrid } from "./Backgrounds";

/**
 * TERM-01 Терминал: команды печатаются, ответы появляются строками. Полноэкранно поверх сетки.
 * lines: "$ команда" — печатается; "✓ …" — зелёная галочка; "→ …" — итог акцентом; остальное — серым.
 * Команды должны быть настоящими — синтаксис проверять, не выдумывать.
 */
export const Terminal: React.FC<{ dur: number; lines: string[]; title?: string }> = ({ dur, lines, title = "zsh" }) => {
  const f = useCurrentFrame();
  let t = 4;
  const rows = lines.map((l) => {
    const cmd = l.startsWith("$");
    const start = t;
    t += cmd ? Math.max(8, l.length * 0.8) : 5;
    return { l, cmd, start };
  });
  return (
    <AbsoluteFill>
      <BgGrid />
      <AbsoluteFill style={{ padding: `${Z.top}px ${Z.side - 30}px`, justifyContent: "center" }}>
        <div style={{ background: "#111113", borderRadius: 28, border: `2px solid ${C.line}`, boxShadow: "0 40px 100px rgba(0,0,0,.6)", overflow: "hidden", opacity: inOut(f, dur, 6, 6) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", borderBottom: `2px solid ${C.line}` }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c }} />)}
            <span style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginLeft: 12 }}>{title}</span>
          </div>
          <div style={{ padding: "30px 36px 40px", display: "flex", flexDirection: "column", gap: 16, minHeight: 420 }}>
            {rows.map(({ l, cmd, start }, i) => {
              if (f < start) return null;
              const shown = cmd ? l.slice(0, Math.floor(interpolate(f, [start, start + l.length * 0.8], [0, l.length], { extrapolateRight: "clamp" }))) : l;
              const color = cmd ? C.text : l.startsWith("✓") ? "#3DDC84" : l.startsWith("→") ? C.accent2 : C.muted;
              return (
                <div key={i} style={{ fontFamily: F.mono, fontWeight: cmd ? 700 : 500, fontSize: 38, lineHeight: 1.3, color, whiteSpace: "pre-wrap" }}>
                  {cmd ? <span style={{ color: C.accent }}>$ </span> : null}
                  {cmd ? shown.slice(2) : shown}
                  {cmd && shown.length < l.length && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: C.accent }}>▌</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** BOT-01 Диалог с ботом: сообщения появляются по очереди, «печатает…» между ними. me=true — справа, в огне. */
export const Chat: React.FC<{ dur: number; name?: string; messages: { me?: boolean; text: string }[] }> = ({ dur, name = "Бот-помощник", messages }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BgGrid />
      <AbsoluteFill style={{ padding: `${Z.top}px ${Z.side}px`, justifyContent: "center", opacity: inOut(f, dur, 6, 6) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.accent, display: "grid", placeItems: "center", color: textOn(C.accent) }}><Bot size={48} /></div>
          <div>
            <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.text }}>{name}</div>
            <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 26, color: "#3DDC84" }}>онлайн</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {messages.map((m, i) => {
            const at = 6 + i * 16;
            const p = interpolate(f, [at, at + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
            if (p <= 0) return null;
            const bg = m.me ? C.accent : C.surface;
            return (
              <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%", background: bg, color: textOn(bg), fontFamily: F.text, fontWeight: 700, fontSize: 42, lineHeight: 1.25, padding: "22px 30px", borderRadius: m.me ? "30px 30px 8px 30px" : "30px 30px 30px 8px", opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.92 + 0.08 * p})` }}>{m.text}</div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** FN-01 Воронка: этапы сужаются, у каждого число; итог-конверсия под воронкой. */
export const Funnel: React.FC<{ dur: number; title?: string; steps: { label: string; value: string }[]; result?: string }> = ({ dur, title, steps, result }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, padding: `${Z.top}px ${Z.side}px`, justifyContent: "center", alignItems: "center", opacity: inOut(f, dur, 4, 6) }}>
      {title ? <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, 84), color: C.text, marginBottom: 40, letterSpacing: -2 }}>{title}</div> : null}
      {steps.map((s, i) => {
        const p = interpolate(f, [4 + i * 5, 12 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
        const w = 100 - i * (55 / Math.max(1, steps.length - 1));
        const bg = i === steps.length - 1 ? C.accent : `color-mix(in srgb, ${C.accent} ${25 + i * 18}%, ${C.surface})`;
        return (
          <div key={i} style={{ width: `${w}%`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 34px", marginBottom: 10, background: bg, color: textOn(i === steps.length - 1 ? C.accent : C.surface), clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)", fontFamily: F.mono, fontWeight: 700, fontSize: 36, opacity: p, transform: `scaleX(${0.6 + 0.4 * p})` }}>
            <span>{s.label.toUpperCase()}</span>
            <span>{s.value}</span>
          </div>
        );
      })}
      {result ? <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 44, color: C.accent2, marginTop: 30, opacity: interpolate(f, [24, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{result}</div> : null}
    </AbsoluteFill>
  );
};

/** PWA-01 Установка приложения без App Store: экран телефона, снизу выезжает лист «Установить», кнопка нажимается. */
export const PwaInstall: React.FC<{ dur: number; title?: string; app?: string; url?: string; icon?: string }> = ({ dur, title = "Приложение без App Store", app = brand.name || "Моё приложение", url = "app.example.ru", icon = brand.avatar }) => {
  const f = useCurrentFrame();
  const sheet = interpolate(f, [8, 18], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const press = f > 26 && f < 31 ? 0.92 : 1;
  const done = f >= 31;
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: "center", justifyContent: "center", opacity: inOut(f, dur, 3, 6) }}>
      <div style={{ position: "relative", width: 640, height: 1240, borderRadius: 80, background: "#000", border: "14px solid #1c1c1f", boxShadow: "0 50px 120px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: 20, width: 190, height: 50, borderRadius: 30, background: "#000", transform: "translateX(-50%)", zIndex: 2 }} />
        <AbsoluteFill style={{ background: `linear-gradient(${C.surface}, ${C.bg})`, padding: "130px 50px" }}>
          <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, 70, 520), lineHeight: 1.05, color: C.text }}>{title}</div>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 30, background: C.text, borderRadius: 40, padding: "34px 34px 40px", transform: `translateY(${sheet}%)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {icon ? <Img src={staticFile(icon)} style={{ width: 110, height: 110, borderRadius: 26, objectFit: "cover" }} /> : <div style={{ width: 110, height: 110, borderRadius: 26, background: C.accent }} />}
            <div>
              <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40, color: textOn(C.text) }}>{app}</div>
              <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 28, color: textOn(C.text), opacity: 0.6 }}>{url}</div>
            </div>
          </div>
          <div style={{ marginTop: 30, borderRadius: 999, background: done ? "#3DDC84" : C.accent, color: textOn(done ? "#3DDC84" : C.accent), textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 40, padding: "22px 0", transform: `scale(${press})` }}>{done ? "Установлено ✓" : "Установить"}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
