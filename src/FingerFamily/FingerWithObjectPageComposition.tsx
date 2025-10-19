import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FingerWithObjectPage } from "./FingerWithObjectPage";

export const fingerWithObjectPageSchema = z.object({
  finger: z.enum(["thumb", "index", "middle", "ring", "pinky"]).optional(),
  objects: z.array(z.string()),
  text: z.string().optional(),
  background: z.string().optional(),
});

type FingerWithObjectPageCompositionProps = z.infer<typeof fingerWithObjectPageSchema>;

export const FingerWithObjectPageComposition: React.FC<FingerWithObjectPageCompositionProps> = ({
  finger,
  objects,
  text,
  background = "white",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <FingerWithObjectPage
      frame={frame}
      duration={durationInFrames}
      background={background}
      finger={finger}
      objects={objects}
      text={text}
    />
  );
};