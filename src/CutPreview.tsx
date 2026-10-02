import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { Video } from "@remotion/media";
import { brand } from "./brand";
import { Outro, OUTRO_SECONDS, Subs, type Word } from "./kit";

/**
 * Черновик резки на согласование: склейка + живые субтитры + финальная заставка.
 * Графики, звуков, мемов, зумов нет — они после «ок» на черновик.
 * Рендер: tools/preview.py plans/rNN.json
 */
export type CutPreviewProps = { src: string; words: Word[]; seconds: number };

export const cutPreviewMeta: CalculateMetadataFunction<CutPreviewProps> = ({ props }) => ({
  durationInFrames: Math.ceil((props.seconds + (brand.outro ? OUTRO_SECONDS : 0)) * 30),
});

export const CutPreview: React.FC<CutPreviewProps> = ({ src, words, seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Video src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <Subs words={words} mute={[{ from: seconds - 0.02, to: 9999 }]} />
      {brand.outro ? (
        <Sequence from={Math.round(seconds * fps)} durationInFrames={Math.round(OUTRO_SECONDS * fps)} layout="none">
          <Outro />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
