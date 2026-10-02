import { Composition } from "remotion";
import { CutPreview, cutPreviewMeta } from "./CutPreview";
import { KitPreview, KIT_SECONDS } from "./KitPreview";
import { Outro, OUTRO_SECONDS } from "./kit";
import { REELS } from "./reels";

const V = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot = () => (
  <>
    {REELS.map((r) => (
      <Composition key={r.id} id={`Reel${r.id}`} component={r.component} durationInFrames={Math.ceil(r.seconds * V.fps)} {...V} />
    ))}
    <Composition id="CutPreview" component={CutPreview} calculateMetadata={cutPreviewMeta} durationInFrames={300} {...V} defaultProps={{ src: "", words: [], seconds: 10 }} />
    <Composition id="KitPreview" component={KitPreview} durationInFrames={Math.ceil(KIT_SECONDS * V.fps)} {...V} />
    <Composition id="Outro" component={Outro} durationInFrames={OUTRO_SECONDS * V.fps} {...V} />
  </>
);
