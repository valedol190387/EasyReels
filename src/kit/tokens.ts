/**
 * Токены дизайн-системы. Стиль по умолчанию — «Кухня Технаря · Video Kit v2»:
 * огонь, кремовый текст, глитч как фирменный жест. Цвета и шрифты — из анкеты (src/brand.ts).
 * Кадр 1080×1920, 30 fps.
 */
import { interpolate, Easing } from "remotion";
import { loadFont as unbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as russo } from "@remotion/google-fonts/RussoOne";
import { loadFont as jetbrains } from "@remotion/google-fonts/JetBrainsMono";
import { brand } from "../brand";

const LOADERS: Record<string, () => { fontFamily: string }> = {
  Unbounded: () => unbounded("normal", { weights: ["600", "800", "900"], subsets: ["cyrillic", "latin"] }),
  Manrope: () => manrope("normal", { weights: ["500", "600", "700", "800"], subsets: ["cyrillic", "latin"] }),
  Montserrat: () => montserrat("normal", { weights: ["600", "800", "900"], subsets: ["cyrillic", "latin"] }),
  Inter: () => inter("normal", { weights: ["500", "600", "700", "800"], subsets: ["cyrillic", "latin"] }),
  "Playfair Display": () => playfair("normal", { weights: ["700", "900"], subsets: ["cyrillic", "latin"] }),
  "Russo One": () => russo("normal", { weights: ["400"], subsets: ["cyrillic", "latin"] }),
  "JetBrains Mono": () => jetbrains("normal", { weights: ["500", "700"], subsets: ["cyrillic", "latin"] }),
};
const font = (name: string) => (LOADERS[name] ?? LOADERS.Manrope)().fontFamily;

export const F = {
  display: font(brand.fonts.display),
  text: font(brand.fonts.text),
  mono: font("JetBrains Mono"),
  /** Russo One бывает только в одном начертании */
  displayWeight: brand.fonts.display === "Russo One" ? 400 : 900,
};

/** Яркость цвета 0…1 — чтобы на любой плашке выбрать читаемый текст. */
const lum = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** Текст для фона: из двух кандидатов — тот, что контрастнее (тёмный на тёмном не бывает). */
export const textOn = (bg: string, light = C.text, dark = C.bg) => (contrast(light, bg) >= contrast(dark, bg) ? light : dark);

const k = brand.colors;
export const C = {
  bg: k.bg, // Ink — фон
  surface: k.surface, // плашки
  line: "#2A2A2E",
  text: k.text, // Cream — основной текст
  muted: "#A39C90",
  accent: k.accent, // Fire
  accent2: k.accent2, // Flame
  signal: "#35D0FF", // только для глитча
};

/** Текст поверх видео (на затемнении): всегда светлый — из палитры, если она светлая, иначе белый. */
export const V = textOn("#141414", C.text, "#FFFFFF");

/** Размеры и безопасные зоны кадра 1080×1920 (Instagram/YouTube/TikTok закрывают края интерфейсом). */
export const Z = {
  W: 1080,
  H: 1920,
  top: 230,
  bottom: 420,
  right: 175,
  left: 110,
  side: 110, // поля по бокам для любой графики — лента чуть приближает ролик
  maxPanel: 860,
  subsBottom: 380, // низ текста субтитров от низа кадра
};

export const S = { hook: 104, chapter: 80, subs: 62, name: 56, role: 36, min: 32 };

/** Плавное движение набора: cubic-bezier(.7,0,.2,1) */
export const EASE = Easing.bezier(0.7, 0, 0.2, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** Вход/выход элемента: 0→1 за `inF` кадров, держится, 1→0 за `outF` перед `dur`. */
export const inOut = (frame: number, dur: number, inF = 9, outF = 8) =>
  Math.min(
    interpolate(frame, [0, inF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT }),
    interpolate(frame, [dur - outF, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
  );

/** Глитч-вход: 6 кадров ступеньками, RGB-сдвиг 8 px на 2–3 кадра. */
export const glitch = (frame: number) => {
  const steps = [
    { x: -40, clip: [0, 0, 100, 0], o: 0 },
    { x: 30, clip: [30, 0, 40, 0], o: 1 },
    { x: -20, clip: [0, 0, 60, 0], o: 1 },
    { x: 10, clip: [50, 0, 0, 0], o: 1 },
    { x: -4, clip: [0, 0, 0, 0], o: 1 },
  ];
  const s = steps[Math.min(Math.max(Math.floor(frame / 1.2), 0), steps.length - 1)];
  const rgb = frame < 9 ? 8 * (1 - frame / 9) : 0;
  const base: { opacity: number; transform: string; clipPath: string; textShadow?: string } = { opacity: s.o, transform: `translateX(${s.x}px)`, clipPath: `inset(${s.clip[0]}% ${s.clip[1]}% ${s.clip[2]}% ${s.clip[3]}%)` };
  if (rgb) base.textShadow = `${rgb}px 0 ${C.accent}, ${-rgb}px 0 ${C.signal}`;
  return base;
};

/** Пружинка «поп»: 0 → 1.12 → 1 */
export const pop = (frame: number, at = 0) =>
  interpolate(frame - at, [0, 5, 9], [0, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/**
 * Размер шрифта, при котором самое длинное слово влезает в ширину (слова не рвутся и не обрезаются).
 * k — средняя ширина буквы в долях кегля: широкие гротески (Unbounded) ~0.78, обычные ~0.62.
 */
export const fit = (text: string, base: number, width: number = Z.maxPanel, k = brand.fonts.display === "Unbounded" ? 0.8 : 0.64) => {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length), 1);
  return Math.min(base, Math.floor(width / (longest * k)));
};
