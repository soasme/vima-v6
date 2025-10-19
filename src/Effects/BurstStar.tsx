import { AbsoluteFill, interpolate, Img, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";

export const burstStarSchema = z.object({
  x: z.number(),
  y: z.number(),
});

type BurstStarProps = z.infer<typeof burstStarSchema>;

export const BurstStar: React.FC<BurstStarProps> = ({ x, y }) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill>
      <StarBurst x={x} y={y} frame={frame} />
    </AbsoluteFill>
  );
};

// Star particle burst component
const StarBurst: React.FC<{ x: number; y: number; frame: number }> = ({ 
  x, 
  y, 
  frame 
}) => {
  // Generate multiple star particles in a burst pattern
  const stars = Array.from({ length: 8 }, (_, i) => (
    <StarParticle
      key={i}
      x={x}
      y={y}
      angle={(i / 8) * 2 * Math.PI}
      frame={frame}
    />
  ));
  
  return <>{stars}</>;
};

// Individual star particle component
const StarParticle: React.FC<{ 
  x: number; 
  y: number; 
  angle: number;
  frame: number;
}> = ({ x, y, angle, frame }) => {
  const durationInFrames = 30; // 1 second at 30fps
  const progress = Math.min(frame / durationInFrames, 1);
  
  const distance = interpolate(progress, [0, 0.7, 1], [0, 100, 120]);
  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance;
  
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1.2, 1, 0.8]);
  const rotation = progress * 360;
  
  return (
    <div
      style={{
        position: "absolute",
        left: `${x + offsetX}px`,
        top: `${y + offsetY}px`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        zIndex: 100,
      }}
    >
      <Img
        src={staticFile("/star.svg")}
        style={{
          width: "60px",
          height: "60px",
        }}
      />
    </div>
  );
};