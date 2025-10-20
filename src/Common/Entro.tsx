import { useVideoConfig, useCurrentFrame, interpolate, Img, staticFile } from "remotion";
import { z } from "zod";

export const entroSchema = z.object({
  duration: z.number().default(5),
});

type EntroPageProps = z.infer<typeof entroSchema>;

export const EntroPage: React.FC<EntroPageProps> = ({ duration }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationInFrames = duration * fps;

  // Pulse effect for subscribe button - scale between 0.95 and 1.05
  const pulseScale = interpolate(
    frame,
    [0, fps * 0.5, fps],
    [1, 1.05, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Repeat the pulse animation
  const pulseFrame = frame % fps;
  const subscribePulse = interpolate(
    pulseFrame,
    [0, fps * 0.5, fps],
    [0.95, 1.05, 0.95],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      position: "relative",
    }}>
      {/* Logo */}
      <Img
        src={staticFile("coofykidsLogo.gif")}
        style={{
          position: "absolute",
          left: 607.4,
          top: 187.4,
          width: 705.2,
          height: 705.2,
        }}
      />
      
      {/* Subscribe button with pulse effect */}
      <Img
        src={staticFile("subscribe.png")}
        style={{
          position: "absolute",
          left: 673.2,
          top: 863.4,
          width: 573.7,
          height: 258.9,
          transform: `scale(${subscribePulse})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
};