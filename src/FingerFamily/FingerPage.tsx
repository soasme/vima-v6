import { AbsoluteFill, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { FingerPageProps } from "./types";

export const FingerPage: React.FC<FingerPageProps> = ({
  frame,
  duration,
  background = "white",
  finger,
  objects = [],
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

  const swingProgress = interpolate(
    frame,
    [0, duration * 0.125, duration * 0.25, duration * 0.375, duration * 0.5, duration * 0.625, duration * 0.75, duration * 0.875, duration],
    [0, 0.3, 0, -0.3, 0, 0.3, 0, -0.3, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const handRotation = swingProgress * 15; // 15 degrees swing

  // VectorHand.png finger positions from original script
  // Using exact pixel coordinates from moviepy script
  const getFingerPosition = (fingerName?: string) => {
    const positions = {
      thumb: { x: "1234px", y: "591px" },    // (1234,591)
      index: { x: "1028px", y: "215px" },   // (1028,215)
      middle: { x: "805px", y: "169px" },   // (805,169)
      ring: { x: "593px", y: "243px" },     // (593,243)
      pinky: { x: "453px", y: "413px" },    // (453,413)
    };
    return positions[fingerName as keyof typeof positions] || { x: "820px", y: "400px" };
  };

  const fingerPos = getFingerPosition(finger);


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

      {/* Hand */}
      <div
        style={{
          position: "absolute",
          top: "108px",
          left: "55px",
          transform: `rotate(${handRotation}deg)`,
          transformOrigin: "960px 1648px",
        }}
      >
        <Img
          src={staticFile("/VectorHand.png")}
          style={{
            width: "1640px",
            height: "auto",
          }}
        />

        {/* Objects positioned on finger */}
        {objects.map((object, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: fingerPos.y,
              left: fingerPos.x,
              transform: `translate(-50%, -50%) rotate(${-handRotation}deg)`,
              zIndex: 10,
            }}
          >
            {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
              <Img
                src={staticFile(`/${object}`)}
                style={{
                  width: "500px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ fontSize: "120px" }}>{object}</div>
            )}
          </div>
        ))}
      </div>


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