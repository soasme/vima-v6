import { AbsoluteFill, interpolate, spring, useVideoConfig, Img, staticFile, useCurrentFrame } from "remotion";
import { ObjectPageProps } from "./types";

export const MysteriousReveal: React.FC<Omit<ObjectPageProps, 'frame' | 'duration'>> = ({
  background = "white",
  objects,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const duration = durationInFrames; // Use the sequence duration

  const slideProgress = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  // 360 degree rotation takes most of the duration, leaving 0.5s for scale animation
  const scaleAnimationDuration = fps * 0.5; // 0.5 seconds
  const rotationDuration = duration - scaleAnimationDuration;
  
  const rotationProgress = interpolate(
    frame,
    [0, rotationDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const rotationDegrees = rotationProgress * 360;

  // Determine which phase we're in
  const showActualObject = rotationDegrees >= 270; // 270-360: actual object
  const showWhite = rotationDegrees >= 90 && rotationDegrees < 270; // 90-270: white silhouette
  
  // Scale animation after rotation completes
  const isRotationComplete = frame >= rotationDuration;
  const scaleAnimationFrame = Math.max(0, frame - rotationDuration);
  
  const scaleProgress = isRotationComplete ? spring({
    frame: scaleAnimationFrame,
    fps,
    config: {
      damping: 200,
    },
  }) : 0;
  
  // Scale from 1.2 to 2.0x during the spring animation (bigger scaling)
  const currentScale = interpolate(scaleProgress, [0, 1], [1.2, 2.0]);

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

      {/* Rotating object container */}
      {objects.map((object, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotateY(${rotationDegrees}deg) scale(${currentScale})`,
            transformStyle: "preserve-3d",
          }}
        >
          {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              {showActualObject ? (
                // 270-360 degrees: Show actual object
                <Img
                  src={staticFile(`/${object}`)}
                  style={{
                    width: "auto",
                    height: "auto",
                    transform: "scale(0.7)",
                    objectFit: "contain",
                  }}
                />
              ) : showWhite ? (
                // 90-270 degrees: Show white silhouette
                <Img
                  src={staticFile(`/${object}`)}
                  style={{
                    width: "auto",
                    height: "auto",
                    transform: "scale(0.7)",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              ) : (
                // 0-90 degrees: Show black silhouette with question mark
                <>
                  {/* Black silhouette of the image */}
                  <Img
                    src={staticFile(`/${object}`)}
                    style={{
                      width: "auto",
                      height: "auto",
                      transform: "scale(0.7)",
                      objectFit: "contain",
                      filter: "brightness(0)",
                    }}
                  />
                  {/* White question mark overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "120px",
                      color: "white",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    ?
                  </div>
                </>
              )}
            </div>
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