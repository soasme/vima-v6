import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { MysteriousReveal } from "./MysteriousReveal";

export const mysteriousRevealSchema = z.object({
  objects: z.array(z.string()),
  text: z.string().optional(),
  background: z.string().optional(),
});

type MysteriousRevealCompositionProps = z.infer<typeof mysteriousRevealSchema>;

export const MysteriousRevealComposition: React.FC<MysteriousRevealCompositionProps> = ({
  objects,
  text,
  background = "white",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <MysteriousReveal
      frame={frame}
      duration={durationInFrames}
      background={background}
      objects={objects}
      text={text}
    />
  );
};