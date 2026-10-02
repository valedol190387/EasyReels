import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ArrowUp, BarChart3, Bookmark, Bot, Check, Code2, MessageSquare, MousePointer2, Send, Sparkles, Zap } from "lucide-react";
import { brand } from "../brand";
import { C, F, S, Z, V, fit, glitch, inOut, pop, textOn, OUT } from "./tokens";

/** Плашка-«огонь»: акцентный фон, текст с автоматическим контрастом. */
const Box: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties }> = ({ children, bg = C.accent, style }) => (
  <span style={{ background: bg, color: textOn(bg), padding: "0.06em 0.28em 0.1em", borderRadius: 14, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", ...style }}>{children}</span>
);

/** Верхняя зона над головой: от 230 px сверху, поля 110 px. Хук и оверлеи живут здесь — лицо не закрывают. */
export const TopZone: React.FC<{ children: React.ReactNode; align?: "flex-start" | "center"; scrim?: number }> = ({ children, align = "flex-start", scrim = 0 }) => (
  <AbsoluteFill>
    {/* затемнение сверху: светлый текст читается на любой стене; появляется вместе с элементом */}
    {scrim ? <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.62), rgba(0,0,0,.34) 28%, transparent 44%)", opacity: scrim }} /> : null}
    <AbsoluteFill style={{ paddingTop: Z.top, paddingLeft: Z.side, paddingRight: Z.side, alignItems: align }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

/** VR-01 Хук: надзаголовок, крупная строка, строка в огне, подстрока. Глитч-вход. Только над головой. */
export const Hook: React.FC<{ dur: number; eyebrow?: string; line1: string; fire: string; line3?: string }> = ({ dur, eyebrow, line1, fire, line3 }) => {
  const f = useCurrentFrame();
  const a = inOut(f, dur, 1, 6);
  const size = Math.min(fit(line1, S.hook), fit(fire, S.hook, Z.maxPanel - 40));
  return (
    <TopZone scrim={inOut(f, dur, 6, 6)}>
      <div style={{ opacity: a, display: "flex", flexDirection: "column", gap: 18, maxWidth: Z.maxPanel }}>
        {eyebrow ? <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.accent, textTransform: "uppercase", ...glitch(f) }}>{eyebrow}</div> : null}
        <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: size, lineHeight: 1.02, letterSpacing: -3, color: V, ...glitch(f - 2), textShadow: f - 2 < 9 ? glitch(f - 2).textShadow : "0 6px 30px rgba(0,0,0,.55)" }}>{line1}</div>
        <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: size, lineHeight: 1.1, letterSpacing: -3, ...glitch(f - 5) }}><Box>{fire}</Box></div>
        {line3 ? <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 48, color: V, textShadow: "0 3px 16px rgba(0,0,0,.7)", opacity: interpolate(f, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{line3}</div> : null}
      </div>
    </TopZone>
  );
};

/** LT-01 / LT-02 Плашка «кто говорит». Слева, над субтитрами. avatar=true — пилюля с аватаром. */
export const LowerThird: React.FC<{ dur: number; name?: string; role?: string; avatar?: boolean }> = ({ dur, name = brand.name, role = brand.niche, avatar }) => {
  const f = useCurrentFrame();
  const bar = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const txt = interpolate(f, [4, 12, dur - 10, dur - 3], [120, 0, 0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const bottom = Z.subsBottom + 230;
  if (avatar && brand.avatar) {
    return (
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingLeft: Z.side, paddingBottom: bottom }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, background: C.surface, borderRadius: 999, padding: "14px 36px 14px 14px", alignSelf: "flex-start", transform: `scaleX(${bar})`, transformOrigin: "0 50%", boxShadow: "0 16px 40px rgba(0,0,0,.45)" }}>
          <Img src={staticFile(brand.avatar)} style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 0 4px ${C.accent}` }} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 40, color: textOn(C.surface), transform: `translateY(${txt}%)` }}>{name}</div>
            <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 28, color: C.muted, transform: `translateY(${txt}%)` }}>{role}</div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", paddingLeft: Z.side, paddingBottom: bottom, gap: 10 }}>
      <div style={{ alignSelf: "flex-start", background: C.accent, borderRadius: 14, padding: "10px 24px", transform: `scaleX(${bar})`, transformOrigin: "0 50%", overflow: "hidden" }}>
        <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: S.name, color: textOn(C.accent), transform: `translateY(${txt}%)` }}>{name}</div>
      </div>
      {role ? (
        <div style={{ alignSelf: "flex-start", maxWidth: Z.maxPanel, background: C.surface, borderRadius: 12, padding: "10px 22px", transform: `scaleX(${bar})`, transformOrigin: "0 50%", overflow: "hidden" }}>
          <div style={{ fontFamily: F.text, fontWeight: 700, fontSize: S.role, color: textOn(C.surface), transform: `translateY(${txt}%)` }}>{role}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Главы и шаги («шаг 2 из 4»), 1–1,5 с. kind: glitch (CH-01, полноэкранно с большой цифрой),
 * band (CH-02, огненная лента поперёк кадра), terminal (CH-03).
 */
export const Chapter: React.FC<{ dur: number; n: number; of: number; title: string; kind?: "glitch" | "band" | "terminal" }> = ({ dur, n, of, title, kind = "band" }) => {
  const f = useCurrentFrame();
  const a = inOut(f, dur, 6, 6);
  const num = String(n).padStart(2, "0"), tot = String(of).padStart(2, "0");
  if (kind === "glitch") {
    return (
      <AbsoluteFill style={{ background: C.bg, justifyContent: "center", paddingLeft: Z.side, paddingRight: Z.side }}>
        <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: "90px 90px", opacity: 0.5, transform: `translateY(${(f % 90) * 0.4}px)` }} />
        <div style={{ position: "absolute", right: -40, top: 260, fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 620, lineHeight: 1, color: "transparent", WebkitTextStroke: `4px ${C.line}`, letterSpacing: -30 }}>{num}</div>
        <div style={{ position: "relative", ...glitch(f) }}>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.accent, letterSpacing: 3 }}>ШАГ {num} / {tot}</div>
          <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, 112), lineHeight: 1.02, letterSpacing: -3, color: C.text, marginTop: 18 }}>{title}</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (kind === "terminal") {
    const cmd = "$ chapter --next";
    const typed = Math.floor(interpolate(f, [2, 12], [0, cmd.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    return (
      <TopZone>
        <div style={{ opacity: a, background: "rgba(11,11,12,.88)", borderRadius: 22, padding: "30px 38px", border: `2px solid ${C.line}` }}>
          <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 32, color: C.muted }}>{cmd.slice(0, typed)}</div>
          <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, S.chapter, Z.maxPanel - 80), lineHeight: 1.05, color: C.text, marginTop: 12, ...glitch(f - 8) }}>{title}</div>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.accent, marginTop: 12 }}>✓ {num} / {tot}</div>
        </div>
      </TopZone>
    );
  }
  const band = interpolate(f, [0, 7, dur - 7, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", paddingTop: Z.top + 120 }}>
      <div style={{ background: C.accent, padding: `30px ${Z.side}px 36px`, transform: `scaleX(${band})`, transformOrigin: "0 50%", boxShadow: "0 20px 60px rgba(0,0,0,.45)" }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: textOn(C.accent), opacity: 0.8 }}>{num} / {tot}</div>
        <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title, S.chapter), lineHeight: 1.04, letterSpacing: -2, color: textOn(C.accent), marginTop: 8, opacity: a }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Призывы: subscribe (CTA-01), save (CTA-04), share (CTA-05), keyword (CTA-06), link (CTA-07). Компактно, сбоку/сверху. */
export const Cta: React.FC<{ dur: number; type: "subscribe" | "save" | "share" | "keyword" | "link"; title?: string; note?: string; keyword?: string }> = ({ dur, type, title, note, keyword }) => {
  const f = useCurrentFrame();
  const a = inOut(f, dur, 7, 6);
  const card: React.CSSProperties = { display: "flex", alignItems: "center", gap: 26, background: C.surface, borderRadius: 26, padding: "24px 34px 24px 24px", boxShadow: "0 20px 60px rgba(0,0,0,.5)", opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${0.9 + 0.1 * a})` };
  const icon = (node: React.ReactNode, bg = C.accent) => (
    <div style={{ width: 104, height: 104, borderRadius: 24, background: bg, display: "grid", placeItems: "center", color: textOn(bg), transform: `scale(${pop(f, 3)})` }}>{node}</div>
  );
  const txt = (t: string, n?: string) => (
    <div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 46, color: textOn(C.surface), lineHeight: 1.05 }}>{t}</div>
      {n ? <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 28, color: C.muted, marginTop: 6 }}>{n}</div> : null}
    </div>
  );
  if (type === "subscribe") {
    const clicked = f > 18;
    return (
      <TopZone align="center" scrim={a * 0.7}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: a, marginTop: 40 }}>
          <div style={{ position: "relative" }}>
            {brand.avatar ? <Img src={staticFile(brand.avatar)} style={{ width: 170, height: 170, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 0 6px ${C.accent}` }} /> : <div style={{ width: 170, height: 170, borderRadius: "50%", background: C.accent }} />}
            <MousePointer2 size={64} color="#fff" fill="#111" style={{ position: "absolute", right: -46, bottom: -40, transform: `translate(${interpolate(f, [4, 16], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT })}px, ${interpolate(f, [4, 16], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT })}px) scale(${f > 16 && f < 20 ? 0.85 : 1})` }} />
          </div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 48, padding: "16px 40px", borderRadius: 18, background: clicked ? C.surface : C.accent, color: clicked ? C.text : textOn(C.accent), display: "flex", alignItems: "center", gap: 14 }}>
            {title ?? (clicked ? "Вы в теме" : "Подписаться")} {clicked ? <Check size={44} /> : null}
          </div>
        </div>
      </TopZone>
    );
  }
  if (type === "keyword") {
    return (
      <TopZone scrim={a}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
          <MessageSquare size={70} color={V} />
          <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 46, color: V, textShadow: "0 3px 14px rgba(0,0,0,.6)" }}>{title ?? "Напиши в комментах"}</div>
          <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 120, lineHeight: 1, transform: `scale(${pop(f, 6)})`, transformOrigin: "0 50%" }}><Box>«{keyword || brand.word || "СЛОВО"}»</Box></div>
          {(note || brand.offer) ? <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 32, color: V, opacity: 0.85, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{note || brand.offer}</div> : null}
        </div>
      </TopZone>
    );
  }
  if (type === "link") {
    return (
      <TopZone scrim={a}>
        <div style={{ opacity: a, display: "flex", flexDirection: "column", gap: 12 }}>
          <ArrowUp size={90} color={C.accent} strokeWidth={3} style={{ transform: `translateY(${Math.sin(f / 5) * 10}px)` }} />
          <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(title ?? "Ссылка в профиле", 86), lineHeight: 1.02, color: V, textShadow: "0 4px 20px rgba(0,0,0,.6)" }}>{title ?? "Ссылка в профиле"}</div>
          {note ? <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 34, color: V, opacity: 0.85 }}>{note}</div> : null}
        </div>
      </TopZone>
    );
  }
  const isSave = type === "save";
  return (
    <TopZone>
      <div style={card}>
        {icon(isSave ? <Bookmark size={56} fill={f > 10 ? C.accent2 : "none"} color={f > 10 ? C.accent2 : textOn(C.surface)} strokeWidth={2.4} /> : <Send size={54} strokeWidth={2.4} style={{ transform: `translate(${interpolate(f, [10, 16, 17, 24], [0, 60, -60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px, ${interpolate(f, [10, 16, 17, 24], [0, -60, 60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }} />, isSave ? C.bg : C.accent)}
        {txt(title ?? (isSave ? "Сохрани" : "Отправь"), note ?? (isSave ? "пригодится" : "тому, кому это нужно"))}
      </div>
    </TopZone>
  );
};

/**
 * Всплывашки над головой — несколько маленьких карточек, каждая появляется В МОМЕНТ СЛОВА (at — секунды
 * от начала Sequence) и остаётся до конца. Для фраз «вот сейчас над головой», «как видите», жеста рукой вверх:
 * графика появляется там, куда показывает человек, лицо открыто. Слоты: left, right, center (вокруг головы, выше лица).
 *   kind: bars (мини-график) · stat (цифра) · tag (иконка + слово)
 */
type Pop = { at: number; slot?: "left" | "right" | "center"; kind: "bars" | "stat" | "tag"; value?: string; label: string; icon?: "chart" | "code" | "bot" | "bolt" | "spark" };
const SLOTS = { left: { left: Z.side, top: Z.top + 40, rot: -4 }, right: { left: 590, top: Z.top, rot: 4 }, center: { left: 330, top: Z.top + 250, rot: -2 } } as const;
const ICONS = { chart: BarChart3, code: Code2, bot: Bot, bolt: Zap, spark: Sparkles } as const;
export const OverHead: React.FC<{ dur: number; items: Pop[]; fps?: number }> = ({ dur, items, fps = 30 }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {items.map((it, i) => {
        const at = Math.round(it.at * fps);
        if (f < at) return null;
        const sl = SLOTS[it.slot ?? (["left", "right", "center"] as const)[i % 3]];
        const sc = pop(f, at);
        const float = Math.sin((f - at) / 14 + i) * 6;
        const card: React.CSSProperties = { position: "absolute", left: sl.left, top: sl.top + float, width: 380, background: C.surface, borderRadius: 26, padding: "22px 26px", boxShadow: "0 24px 60px rgba(0,0,0,.5)", transform: `scale(${sc}) rotate(${sl.rot}deg)`, transformOrigin: "50% 100%" };
        const label = <div style={{ fontFamily: F.text, fontWeight: 700, fontSize: 28, color: C.muted, marginTop: 8 }}>{it.label}</div>;
        if (it.kind === "bars") {
          const vals = [30, 45, 38, 62, 100];
          return (
            <div key={i} style={card}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
                {vals.map((v, k) => {
                  const g = interpolate(f - at, [3 + k * 2, 11 + k * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
                  return <div key={k} style={{ flex: 1, height: `${v * g}%`, borderRadius: 6, background: k === vals.length - 1 ? C.accent : C.line }} />;
                })}
              </div>
              {label}
            </div>
          );
        }
        if (it.kind === "stat") {
          return (
            <div key={i} style={card}>
              <div style={{ fontFamily: F.display, fontWeight: F.displayWeight, fontSize: fit(it.value ?? "", 92, 330), lineHeight: 1, color: C.accent, letterSpacing: -3 }}>{it.value}</div>
              {label}
            </div>
          );
        }
        const Ico = ICONS[it.icon ?? "spark"];
        return (
          <div key={i} style={{ ...card, display: "flex", alignItems: "center", gap: 18, width: "auto", padding: "18px 28px 18px 18px" }}>
            <div style={{ width: 78, height: 78, borderRadius: 20, background: C.accent, display: "grid", placeItems: "center", color: textOn(C.accent) }}><Ico size={44} strokeWidth={2.4} /></div>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 40, color: textOn(C.surface) }}>{it.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
