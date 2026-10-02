import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, Z, V, EASE, OUT, fit, glitch, inOut, textOn } from "./tokens";
import { BgHeat, BgGrid } from "./Backgrounds";

/**
 * Полноэкранные инфо-сцены: видео уходит целиком, элемент занимает кадр по вертикали.
 * Ставить и туда, где человек отвернулся от камеры. Контент виден с первого кадра.
 */
const Full: React.FC<{ children: React.ReactNode; bg?: "heat" | "grid" | "plain" }> = ({ children, bg = "heat" }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    {bg === "heat" ? <BgHeat /> : bg === "grid" ? <BgGrid /> : null}
    <AbsoluteFill style={{ padding: `${Z.top}px ${Z.side}px ${Z.bottom - 60}px`, justifyContent: "center" }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

const fmt = (n: number, dec: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** ST-01 Цифра-счётчик: крупное число докручивается до значения. Цифры о внешнем мире — только правдивые. */
export const Counter: React.FC<{ dur: number; value: number; prefix?: string; suffix?: string; decimals?: number; label: string }> = ({ dur, value, prefix = "", suffix = "", decimals = 0, label }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [2, Math.min(28, dur - 8)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <Full>
      <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 230, lineHeight: 0.95, letterSpacing: -10, color: C.accent, fontVariantNumeric: "tabular-nums", ...glitch(f) }}>
        {prefix}{fmt(value * p, decimals)}<span style={{ fontSize: 130 }}>{suffix}</span>
      </div>
      <div style={{ fontFamily: F.text, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: C.text, marginTop: 30, maxWidth: 820, opacity: interpolate(f, [8, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{label}</div>
    </Full>
  );
};

/** ST-02 График роста: столбики вырастают, последний — акцентный, с подписью. */
export const Bars: React.FC<{ dur: number; values: number[]; title: string; note?: string }> = ({ dur, values, title, note }) => {
  const f = useCurrentFrame();
  const max = Math.max(...values);
  return (
    <Full bg="plain">
      <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 110, color: C.text, letterSpacing: -4, ...glitch(f) }}>{title}</div>
      {note ? <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 36, color: C.muted, marginTop: 8 }}>{note}</div> : null}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 760, marginTop: 50 }}>
        {values.map((v, i) => {
          const g = interpolate(f, [4 + i * 4, 18 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
          const last = i === values.length - 1;
          return <div key={i} style={{ flex: 1, height: `${(v / max) * 100 * g}%`, background: last ? C.accent : C.line, borderRadius: "12px 12px 4px 4px" }} />;
        })}
      </div>
    </Full>
  );
};

/** QT-01 Цитата: кавычка, текст, подчёркивание ключевой фразы «маркером». */
export const Quote: React.FC<{ dur: number; text: string; mark?: string; author?: string }> = ({ dur, text, mark, author }) => {
  const f = useCurrentFrame();
  const sweep = interpolate(f, [10, 24], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const parts = mark && text.includes(mark) ? text.split(mark) : [text];
  return (
    <Full>
      <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 220, lineHeight: 0.6, color: C.accent }}>“</div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 84, lineHeight: 1.12, letterSpacing: -2, color: C.text, marginTop: 30, opacity: inOut(f, dur, 6, 6) }}>
        {parts[0]}
        {parts.length > 1 ? (
          <>
            <span style={{ backgroundImage: `linear-gradient(${C.accent}, ${C.accent})`, backgroundSize: `${sweep}% 0.16em`, backgroundPosition: "0 92%", backgroundRepeat: "no-repeat" }}>{mark}</span>
            {parts[1]}
          </>
        ) : null}
      </div>
      {author ? <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 30, color: C.muted, marginTop: 36, letterSpacing: 2 }}>— {author.toUpperCase()}</div> : null}
    </Full>
  );
};

/** LS-01 Список / топ: пункты выезжают по одному. `at` — секунды появления каждого пункта (под речь). */
export const List: React.FC<{ dur: number; title: string; items: string[]; at?: number[]; fps?: number }> = ({ dur, title, items, at, fps = 30 }) => {
  const f = useCurrentFrame();
  return (
    <Full bg="plain">
      <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, 86), lineHeight: 1.04, letterSpacing: -3, color: C.text, ...glitch(f) }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
        {items.map((it, i) => {
          const start = at ? Math.round(at[i] * fps) : 6 + i * 6;
          const p = interpolate(f, [start, start + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 26, padding: "26px 0", borderBottom: `2px solid ${C.line}`, opacity: p, transform: `translateX(${(1 - p) * -60}px)` }}>
              <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.accent }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: F.text, fontWeight: 800, fontSize: 56, color: C.text }}>{it}</span>
            </div>
          );
        })}
      </div>
    </Full>
  );
};

/** BA-01 До / после: две карточки с настоящим текстом (никаких серых полос-заглушек), «после» — в огне. */
export const BeforeAfter: React.FC<{ dur: number; before: string[]; after: string[]; beforeTitle?: string; afterTitle?: string }> = ({ dur, before, after, beforeTitle = "БЫЛО", afterTitle = "СТАЛО" }) => {
  const f = useCurrentFrame();
  const b = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: OUT });
  const a = interpolate(f, [12, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const card = (title: string, lines: string[], hot: boolean, p: number) => (
    <div style={{ background: hot ? C.accent : C.surface, borderRadius: 30, padding: "40px 44px", opacity: p, transform: `translateY(${(1 - p) * 50}px)`, boxShadow: hot ? `0 30px 80px ${C.accent}55` : "none" }}>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: hot ? textOn(C.accent) : C.muted }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: F.text, fontWeight: 800, fontSize: 52, lineHeight: 1.18, color: hot ? textOn(C.accent) : C.text, marginTop: 18, textDecoration: hot ? "none" : "line-through", textDecorationColor: C.accent, textDecorationThickness: 4 }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Full bg="plain">
      <div style={{ display: "flex", flexDirection: "column", gap: 36, opacity: inOut(f, dur, 1, 6) }}>
        {card(beforeTitle, before, false, b)}
        {card(afterTitle, after, true, a)}
      </div>
    </Full>
  );
};

/** PR-01 Прогресс шагов: полоска сегментов сверху + подпись текущего шага. Оверлей, лицо не закрывает. */
export const Progress: React.FC<{ dur: number; n: number; of: number; label: string }> = ({ dur, n, of, label }) => {
  const f = useCurrentFrame();
  const a = inOut(f, dur, 6, 6);
  const fill = interpolate(f, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <AbsoluteFill style={{ paddingTop: Z.top - 60, paddingLeft: Z.side, paddingRight: Z.side, opacity: a, background: "linear-gradient(rgba(0,0,0,.55), transparent 26%)" }}>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: of }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 12, borderRadius: 6, background: C.line, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${i < n - 1 ? 100 : i === n - 1 ? fill * 100 : 0}%`, background: C.accent }} />
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 36, color: V, marginTop: 18, letterSpacing: 2, textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>ШАГ {n} · {label.toUpperCase()}</div>
    </AbsoluteFill>
  );
};
