/**
 * ШАБЛОН монтажа ролика. Скопируй папку в src/reels/rNN/, замени NN и наполни по раскадровке.
 * Время — в секундах ролика (как в src/data/wordsNN.json), s() переводит в кадры.
 * Каждый элемент набора получает dur = длина своей Sequence в кадрах.
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Cam, Subs, Sfx, Outro, OUTRO_SECONDS, Hook, Counter, Cta, Enter, OverHead, type Word, type Hit } from "../../kit";
import { brand } from "../../brand";
// import words from "../../data/wordsNN.json";
const words: Word[] = []; // ← заменить импортом wordsNN.json

const SRC = "sourceNN.mp4";
const VOICE = 30; // ← конец голоса: end последнего слова в wordsNN.json
const s = (sec: number) => Math.round(sec * 30);

// Полноэкранные сцены (видео уходит целиком) — здесь же закрываются куски «не в камеру».
// На них субтитры гасятся, если в сцене крупный текст.
const FULL: { from: number; to: number }[] = [
  // { from: 12.1, to: 14.3 },
];

const HITS: Hit[] = [
  // { file: "sfx/Свуши/swoosh 1.mp3", at: 0.1, volume: 0.12 },
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* голова + акцентные зумы (раз в 8–12 с на ударных словах) */}
    <Cam src={SRC} zooms={[/* { at: 6.4 }, { at: 17.2, hold: true } */]} />

    {/* хук — над головой, лицо открыто */}
    <Sequence from={0} durationInFrames={s(2.8)}>
      <Hook dur={s(2.8)} eyebrow="тема · 01" line1="Первая строка" fire="ударное слово" line3="подстрока" />
    </Sequence>

    {/* полноэкранная сцена: жёсткая склейка, сцена въезжает сама (Enter) — без вспышек */}
    {/* <Sequence from={s(12.1)} durationInFrames={s(2.2)}><Enter><Counter dur={s(2.2)} value={42} suffix="%" label="…" /></Enter></Sequence> */}

    {/* «вот над головой», «как видите», жест вверх — всплывашки по словам, лицо открыто */}
    {/* <Sequence from={s(20.0)} durationInFrames={s(5)}><OverHead dur={s(5)} items={[{ at: 0.8, kind: "bars", label: "рост" }, { at: 1.6, kind: "stat", value: "×3", label: "заявок" }]} /></Sequence> */}

    <Subs words={words} mute={[...FULL, { from: VOICE, to: 9999 }]} />
    {brand.sfx ? <Sfx hits={HITS} /> : null}

    {brand.outro ? (
      <Sequence from={s(VOICE)} durationInFrames={s(OUTRO_SECONDS)}>
        <Outro />
      </Sequence>
    ) : null}
  </AbsoluteFill>
);

// в src/reels/index.ts: import * as rNN from "./rNN/Reel"; и добавить rNN.entry в REELS
export const entry = { id: "NN", component: Reel, seconds: VOICE + (brand.outro ? OUTRO_SECONDS : 0) };
// не используется, чтобы шаблон собирался:
void Counter; void Cta; void Enter; void OverHead;
