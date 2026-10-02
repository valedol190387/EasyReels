import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { brand } from "./brand";
import {
  BeforeAfter, Bars, BgCode, BgFire, BgMarquee, BgPixels, CamRec, Chapter, Chat, Counter, Cta, Enter, F, Funnel, Hook, List, LowerThird, OverHead, Outro, OUTRO_SECONDS, Progress, PwaInstall, Quote, Split, Subs, Terminal, Timer, C, type SubsStyle,
} from "./kit";

/** Подложка «говорящая голова» для оверлеев: тёплая стена и силуэт — чтобы видеть, что графика не лезет на лицо. */
const FakeCam: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#e7dcc6, #cbbd9f)" }}>
    <div style={{ position: "absolute", left: "50%", top: 640, width: 380, height: 460, transform: "translateX(-50%)", borderRadius: "48% 48% 44% 44%", background: "#c99a7b" }} />
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 0, height: 760, borderRadius: "46% 46% 0 0", background: "#4b3a2f" }} />
  </AbsoluteFill>
);

const S = 2.5; // секунд на элемент
const ITEMS: { code: string; name: string; cam?: boolean; el: (d: number) => React.ReactNode }[] = [
  { code: "VR-01", name: "Хук", cam: true, el: (d) => <Hook dur={d} eyebrow="Вайбкодинг · 01" line1="Чат-бот за" fire="15 минут" line3="без кода" /> },
  { code: "LT-01", name: "Плашка", cam: true, el: (d) => <LowerThird dur={d} name={brand.name || "Твоё имя"} role={brand.niche || "чем занимаешься"} /> },
  { code: "LT-02", name: "Плашка с аватаром", cam: true, el: (d) => <LowerThird dur={d} avatar name={brand.name || "Твоё имя"} role={brand.handle || "@ник"} /> },
  { code: "CH-01", name: "Шаг — глитч", el: (d) => <Chapter dur={d} kind="glitch" n={1} of={4} title="Собираем воронку" /> },
  { code: "CH-02", name: "Шаг — лента", cam: true, el: (d) => <Chapter dur={d} kind="band" n={2} of={4} title="Подключаем бота" /> },
  { code: "CH-03", name: "Шаг — терминал", cam: true, el: (d) => <Chapter dur={d} kind="terminal" n={3} of={4} title="Деплой PWA" /> },
  { code: "PR-01", name: "Прогресс шагов", cam: true, el: (d) => <Progress dur={d} n={2} of={4} label="подключаем бота" /> },
  { code: "POP", name: "Всплывашки над головой", cam: true, el: (d) => <OverHead dur={d} items={[{ at: 0.1, kind: "bars", label: "графики" }, { at: 0.7, kind: "stat", value: "+212%", label: "цифры" }, { at: 1.3, kind: "tag", icon: "bolt", label: "элементы" }]} /> },
  { code: "CTA-01", name: "Подписка", cam: true, el: (d) => <Cta dur={d} type="subscribe" /> },
  { code: "CTA-04", name: "Сохрани", cam: true, el: (d) => <Cta dur={d} type="save" note="пригодится на проекте" /> },
  { code: "CTA-05", name: "Отправь", cam: true, el: (d) => <Cta dur={d} type="share" note="тому, кто пилит бота" /> },
  { code: "CTA-06", name: "Кодовое слово", cam: true, el: (d) => <Cta dur={d} type="keyword" keyword="БОТ" note="пришлю шаблон в личку" /> },
  { code: "CTA-07", name: "Ссылка в профиле", cam: true, el: (d) => <Cta dur={d} type="link" note="там бот и все шаблоны" /> },
  { code: "ST-01", name: "Цифра-счётчик", el: (d) => <Counter dur={d} value={212} prefix="+" suffix="%" label="заявок после запуска автоворонки" /> },
  { code: "ST-02", name: "График роста", el: (d) => <Bars dur={d} values={[18, 27, 41, 55, 100]} title="×5" note="подписчиков клуба за 6 мес" /> },
  { code: "QT-01", name: "Цитата", el: (d) => <Quote dur={d} text="Не пиши код. Объясняй задачу — код напишет ИИ" mark="Объясняй задачу" author="принцип вайбкодинга" /> },
  { code: "LS-01", name: "Топ-5", el: (d) => <List dur={d} title="5 инструментов для вайбкодинга" items={["Cursor", "Claude", "Supabase", "Vercel", "n8n"]} /> },
  { code: "BA-01", name: "До / после", el: (d) => <BeforeAfter dur={d} before={["Заявки вручную", "Ответ через день"]} after={["Бот 24/7", "Ответ за 5 секунд"]} /> },
  { code: "TERM-01", name: "Терминал", el: (d) => <Terminal dur={d} lines={["$ npx create-video@latest", "✓ Remotion 4.0", "$ pnpm render", "→ готово за 42 сек"]} /> },
  { code: "BOT-01", name: "Диалог с ботом", el: (d) => <Chat dur={d} messages={[{ me: true, text: "Хочу шаблон воронки" }, { text: "Держу. Куда прислать?" }, { me: true, text: "В Telegram" }]} /> },
  { code: "FN-01", name: "Воронка", el: (d) => <Funnel dur={d} title="Автоворонка" steps={[{ label: "охват", value: "10 000" }, { label: "клик", value: "1 800" }, { label: "лид", value: "420" }, { label: "оплата", value: "96" }]} result="конверсия 0,96% → 2,4%" /> },
  { code: "BG-07", name: "Огонь — акцент-слайд", el: () => <AbsoluteFill><BgFire /><AbsoluteFill style={{ justifyContent: "center", padding: 110, fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 130, lineHeight: 1, color: C.bg }}>Без одной строки кода</AbsoluteFill></AbsoluteFill> },
];

const SAMPLE_WORDS = ["Нейросеть", "пишет", "весь", "код", "сама"].map((text, i) => ({ text, start: 1.0 + i * 0.3, end: 1.25 + i * 0.3 }));
const SubsDemo: React.FC<{ style: SubsStyle }> = ({ style }) => <Subs words={SAMPLE_WORDS} style={style} />;
ITEMS.push(
  { code: "LT-03", name: "Гость — код-стиль", cam: true, el: (d) => <LowerThird dur={d} code name="Анна Петрова" role="CTO, SaaS" /> },
  { code: "CTA-02", name: "Лайк", cam: true, el: (d) => <Cta dur={d} type="like" /> },
  { code: "CTA-03", name: "Колокольчик", cam: true, el: (d) => <Cta dur={d} type="bell" /> },
  { code: "CTA-08", name: "Закрытый клуб", cam: true, el: (d) => <Cta dur={d} type="club" note="Разборы, шаблоны ботов и созвоны" /> },
  { code: "PR-02", name: "Таймер", el: (d) => <Timer dur={d} question="Угадай, сколько стоил бот" /> },
  { code: "BA-01", name: "До / после — ползунок", el: (d) => <Split dur={d} before="заявки вручную" after="бот 24/7" /> },
  { code: "PWA-01", name: "Установка PWA", el: (d) => <PwaInstall dur={d} /> },
  { code: "BG-03", name: "Код-поток", el: () => <AbsoluteFill><BgCode /><AbsoluteFill style={{ justifyContent: "center", padding: 110, fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 110, color: C.text }}>Деплой за вечер</AbsoluteFill></AbsoluteFill> },
  { code: "BG-04", name: "Бегущий текст", el: () => <BgMarquee /> },
  { code: "BG-05", name: "Пиксели", el: () => <AbsoluteFill><BgPixels /><AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: F.display, fontWeight: F.displayWeight, fontSize: 120, color: C.text }}>01</AbsoluteFill></AbsoluteFill> },
  { code: "BG-08", name: "Камера REC", cam: true, el: () => <CamRec start={14} /> },
  { code: "SUB-02", name: "Субтитры — обводка", cam: true, el: () => <SubsDemo style="outline" /> },
  { code: "SUB-03", name: "Субтитры — глитч-слово", cam: true, el: () => <SubsDemo style="glitch" /> },
  { code: "SUB-04", name: "Субтитры — код-плашка", cam: true, el: () => <SubsDemo style="code" /> },
);

export const KIT_SECONDS = ITEMS.length * S + OUTRO_SECONDS;

/** Все элементы набора по очереди — проверить вид после анкеты (remotion still / render KitPreview). */
export const KitPreview: React.FC = () => {
  const d = Math.round(S * 30);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {ITEMS.map((it, i) => (
        <Sequence key={it.code} from={i * d} durationInFrames={d}>
          {it.cam ? <FakeCam /> : null}
          {it.cam ? it.el(d) : <Enter>{it.el(d)}</Enter>}
          <div style={{ position: "absolute", left: 40, bottom: 40, fontFamily: F.mono, fontSize: 30, color: "#fff", background: "rgba(0,0,0,.6)", padding: "8px 16px", borderRadius: 10 }}>{it.code} · {it.name}</div>
        </Sequence>
      ))}
      <Sequence from={ITEMS.length * d} durationInFrames={OUTRO_SECONDS * 30}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
