import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile, spring } from "remotion";
import { z } from "zod";

export const tenLittleObjectMoveSchema = z.object({
  backgroundImage: z.string(),
  objectImage: z.string(),
  moveSeconds: z.number(),
  height: z.number(),
  y: z.number(),
  direction: z.enum(["LeftToRight", "RightToLeft"]),
  text: z.string(),
  textY: z.number(),
  textHeight: z.number(),
  textBackgroundColor: z.string(),
  textInSeconds: z.number(),
  textOutSeconds: z.number(),
});

type TenLittleObjectMoveCompositionProps = z.infer<typeof tenLittleObjectMoveSchema>;

export const TenLittleObjectMoveComposition: React.FC<TenLittleObjectMoveCompositionProps> = ({
  backgroundImage,
  objectImage,
  moveSeconds,
  height: objectHeight,
  y,
  direction,
  text,
  textY,
  textHeight,
  textBackgroundColor,
  textInSeconds,
  textOutSeconds,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Total frames for the motion based on moveSeconds
  const totalFrames = moveSeconds * fps;

  // Calculate text animation
  const textInFrames = textInSeconds * fps;
  const textOutFrames = textOutSeconds * fps;
  const textOutStartFrame = durationInFrames - textOutFrames;

  // Spring animation for pop in
  const scaleIn = spring({
    frame: frame,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
    durationInFrames: textInFrames,
  });

  // Spring animation for pop out
  const scaleOut = frame >= textOutStartFrame
    ? 1 - spring({
        frame: frame - textOutStartFrame,
        fps,
        config: {
          damping: 10,
          stiffness: 100,
          mass: 0.5,
        },
        durationInFrames: textOutFrames,
      })
    : 1;

  // Combine scales
  const textScale = frame < textInFrames ? scaleIn : scaleOut;

  // Estimate object width based on height (assuming roughly square aspect ratio)
  const estimatedObjectWidth = objectHeight;

  // Determine start and end positions based on direction
  let startX: number;
  let endX: number;

  if (direction === "LeftToRight") {
    // Object starts offscreen to the left and moves to offscreen right
    startX = -estimatedObjectWidth;
    endX = width;
  } else {
    // RightToLeft: Object starts offscreen to the right and moves to offscreen left
    startX = width;
    endX = -estimatedObjectWidth;
  }

  // Total distance to travel
  const totalDistance = endX - startX;

  // Current position based on motion progress
  const progress = Math.min(frame / totalFrames, 1);
  const currentX = startX + (totalDistance * progress);

  return (
    <AbsoluteFill>
      {/* Background Image */}
      <Img
        src={staticFile(backgroundImage)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Moving Object Image */}
      <Img
        src={staticFile(objectImage)}
        style={{
          position: 'absolute',
          left: `${currentX}px`,
          top: `${y}px`,
          height: `${objectHeight}px`,
          width: 'auto',
        }}
      />

      {/* Text */}
      <div
        style={{
          position: 'absolute',
          top: `${textY}px`,
          left: '50%',
          transform: `translateX(-50%) scale(${textScale})`,
          fontSize: `${textHeight}px`,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8)',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: textBackgroundColor,
          padding: '20px 40px',
          borderRadius: '50px',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
