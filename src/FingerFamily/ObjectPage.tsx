import { AbsoluteFill, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { ObjectPageProps } from "./types";

export const ObjectPage: React.FC<ObjectPageProps> = ({
  frame,
  duration,
  background = "white",
  objects,
  text,
}) => {
  const { fps } = useVideoConfig();

  const slideProgress = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  const bounceProgress = interpolate(
    frame,
    [0, duration * 0.5, duration],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const objectScale = interpolate(bounceProgress, [0, 1], [0.8, 1.2]);

  const isBackgroundImage = background?.endsWith('.png') || background?.endsWith('.jpg') || background?.endsWith('.jpeg');

  return (
    <AbsoluteFill style={{ backgroundColor: isBackgroundImage ? "transparent" : background }}>
      {/* Background Image */}
      {isBackgroundImage && (
        <Img
          src={staticFile(`/${background}`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
      )}

      {/* Background slide-in effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${(1 - slideProgress) * -100}%`,
          width: "100%",
          height: "100%",
          backgroundColor: isBackgroundImage ? "transparent" : background,
        }}
      />

      {/* Objects */}
      {objects.map((object, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${objectScale})`,
          }}
        >
          {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
            <Img
              src={staticFile(`/${object}`)}
              style={{
                width: "auto",
                height: "auto",
                transform: "scale(0.7)",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ fontSize: "200px" }}>{object}</div>
          )}
        </div>
      ))}

      {/* Text overlay */}
      {text && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "48px",
            fontWeight: "bold",
            color: "black",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(255,255,255,0.8)",
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};