import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { MysteriousObjectPage } from "./MysteriousObjectPage";

export const mysteriousObjectPageSchema = z.object({
  objects: z.array(z.string()),
  text: z.string().optional(),
  background: z.string().optional(),
});

type MysteriousObjectPageCompositionProps = z.infer<typeof mysteriousObjectPageSchema>;

export const MysteriousObjectPageComposition: React.FC<MysteriousObjectPageCompositionProps> = ({
  objects,
  text,
  background = "white",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <MysteriousObjectPage
      frame={frame}
      duration={durationInFrames}
      background={background}
      objects={objects}
      text={text}
    />
  );
};