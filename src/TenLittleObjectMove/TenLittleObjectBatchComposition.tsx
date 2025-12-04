import { useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { TenLittleObjectMoveComposition, tenLittleObjectMoveSchema } from "./TenLittleObjectMoveComposition";

export const tenLittleObjectBatchSchema = z.object({
  objects: z.array(tenLittleObjectMoveSchema),
});

type TenLittleObjectBatchCompositionProps = z.infer<typeof tenLittleObjectBatchSchema>;

export const TenLittleObjectBatchComposition: React.FC<TenLittleObjectBatchCompositionProps> = ({
  objects,
}) => {
  const { fps } = useVideoConfig();

  let cumulativeFrames = 0;

  return (
    <AbsoluteFill>
      {objects.map((objectProps, index) => {
        const durationInFrames = Math.ceil(objectProps.moveSeconds * fps);
        const startFrame = cumulativeFrames;
        cumulativeFrames += durationInFrames;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <TenLittleObjectMoveComposition {...objectProps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
