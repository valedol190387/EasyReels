import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { brand } from "../brand";
import { C, F, Z, S } from "./tokens";

export type Word = { text: string; start: number; end: number };

/** Короткие слова, которые не оставляем последними в группе — переносим к следующему. */
const GLUE = new Set(["в", "во", "на", "и", "а", "но", "не", "ни", "же", "то", "с", "со", "к", "ко", "о", "об", "у", "за", "по", "из", "от", "до", "для", "что", "как", "это", "я", "ты", "мы", "вы", "он", "она"]);
const bare = (s: string) => s.toLowerCase().replace(/[^а-яёa-z0-9-]/g, "");

/**
 * Разбивка: до 24 символов (3–4 слова); новая группа — после конца предложения или паузы > 0,7 с.
 * Предлог/союз/частица не остаётся последним словом группы. На экране одна группа, 1–2 строки.
 */
export const groupWords = (words: Word[], max = 24): Word[][] => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const len = cur.map((x) => x.text).join(" ").length + w.text.length;
    const gap = cur.length ? w.start - cur[cur.length - 1].end : 0;
    const sentenceEnd = cur.length ? /[.!?…]$/.test(cur[cur.length - 1].text) : false;
    if (cur.length && (len > max || gap > 0.7 || sentenceEnd)) {
      const last = cur[cur.length - 1];
      if (!sentenceEnd && gap <= 0.7 && cur.length > 1 && GLUE.has(bare(last.text))) {
        cur.pop();
        groups.push(cur);
        cur = [last];
      } else {
        groups.push(cur);
        cur = [];
      }
    }
    cur.push(w);
  }
  if (cur.length) groups.push(cur);
  return groups;
};

/**
 * Субтитры. Стиль — из анкеты: karaoke (слово подсвечивается вслед за речью), chunks, word, none.
 * Место: низ текста на 380 px от низа, поля 110 px. Плотный трекинг, тень вместо плашки.
 * `mute` — интервалы (секунды), где субтитры гасятся: полноэкранные сцены с текстом, финал.
 */
export const Subs: React.FC<{ words: Word[]; mute?: { from: number; to: number }[]; bottom?: number }> = ({ words, mute = [], bottom = Z.subsBottom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const style = brand.subs.style;
  if (style === "none" || mute.some((m) => t >= m.from && t <= m.to)) return null;

  const groups = style === "word" ? words.map((w) => [w]) : groupWords(words, style === "chunks" ? 20 : 24);
  const g = groups.find((x) => t >= x[0].start - 0.05 && t <= x[x.length - 1].end + 0.2);
  if (!g) return null;
  const g0 = g[0].start;
  const a = interpolate(t, [g0 - 0.05, g0 + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = style === "word";

  return (
    <AbsoluteFill style={{ justifyContent: big ? "center" : "flex-end", alignItems: "center", paddingBottom: big ? 0 : bottom, paddingLeft: Z.side, paddingRight: Z.side, paddingTop: big ? 700 : 0 }}>
      <div
        style={{
          fontFamily: F.display, fontWeight: F.displayWeight === 400 ? 400 : 800, fontSize: big ? 96 : S.subs, lineHeight: 1.16, letterSpacing: big ? -2.5 : -1.6,
          color: C.text, textAlign: "center", textTransform: brand.subs.caps ? "uppercase" : "none",
          textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)",
          opacity: a, transform: `translateY(${(1 - a) * 12}px)`,
        }}
      >
        {g.map((w, i) => {
          const text = i === g.length - 1 ? w.text.replace(/[.,!?…;:]+$/, "") : w.text;
          const next = g[i + 1]?.start ?? w.end + 0.2;
          let color: string = "#FFFFFF", op = 1, lift = 0;
          if (style === "karaoke") {
            const on = t >= w.start - 0.03 && t < next - 0.03;
            const said = t >= next - 0.03;
            const pp = interpolate(t, [w.start - 0.03, w.start + 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            color = on ? C.accent : "#FFFFFF";
            op = on || said ? 1 : 0.45;
            lift = on ? -4 * pp : 0;
          }
          return (
            <span key={i}>
              <span style={{ color, opacity: op, display: "inline-block", transform: `translateY(${lift}px)` }}>{text}</span>
              {i < g.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
