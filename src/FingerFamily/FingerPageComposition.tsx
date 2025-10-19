import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FingerPage } from "./FingerPage";

export const fingerPageSchema = z.object({
  finger: z.enum(["thumb", "index", "middle", "ring", "pinky"]).optional(),
  objects: z.array(z.string()).optional(),
  text: z.string().optional(),
  background: z.string().optional(),
});

type FingerPageCompositionProps = z.infer<typeof fingerPageSchema>;

export const FingerPageComposition: React.FC<FingerPageCompositionProps> = ({
  finger,
  objects = [],
  text,
  background = "white",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <FingerPage
      frame={frame}
      duration={durationInFrames}
      background={background}
      finger={finger}
      objects={objects}
      text={text}
    />
  );
};