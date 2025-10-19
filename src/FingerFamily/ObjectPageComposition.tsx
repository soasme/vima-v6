import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { ObjectPage } from "./ObjectPage";

export const objectPageSchema = z.object({
  objects: z.array(z.string()),
  text: z.string().optional(),
  background: z.string().optional(),
});

type ObjectPageCompositionProps = z.infer<typeof objectPageSchema>;

export const ObjectPageComposition: React.FC<ObjectPageCompositionProps> = ({
  objects,
  text,
  background = "white",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <ObjectPage
      frame={frame}
      duration={durationInFrames}
      background={background}
      objects={objects}
      text={text}
    />
  );
};